// Integração com transportadoras no Brasil.
export type Courier = "CORREIOS" | "JADLOG";

export type BookResult =
  | { ok: true; trackingNumber: string; simulated: boolean }
  | { ok: false; error: string };

type OrderForShipment = {
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  total: number;
  paymentMethod: string;
  itemCount: number;
};

export function isCourier(v: string): v is Courier {
  return v === "CORREIOS" || v === "JADLOG";
}

export function courierLabel(c: string): string {
  if (c === "CORREIOS") return "Correios";
  if (c === "JADLOG") return "Jadlog";
  return c;
}

export function trackingUrl(courier: string, trackingNumber: string): string {
  const tn = encodeURIComponent(trackingNumber);
  if (courier === "CORREIOS") return `https://rastreamento.correios.com.br/app/index.php?objetos=${tn}`;
  if (courier === "JADLOG") return `https://www.jadlog.com.br/siteInstitucional/tracking.jad?cte=${tn}`;
  return "#";
}

function simulationAllowed(): boolean {
  return process.env.NODE_ENV !== "production" || process.env.COURIER_SIMULATION === "true";
}

function notConfigured(name: string): BookResult {
  return {
    ok: false,
    error: `${name}: as credenciais de API ainda não estão configuradas no ambiente do servidor.`,
  };
}

function simulatedTracking(courier: Courier): string {
  const n = Math.floor(100000000 + Math.random() * 899999999);
  return courier === "CORREIOS" ? `BR${n}BR` : `JAD${n}`;
}

export async function bookShipment(order: OrderForShipment, courier: Courier): Promise<BookResult> {
  try {
    if (courier === "CORREIOS") return await bookCorreios(order);
    return await bookJadlog(order);
  } catch (err) {
    console.error("[courier] booking failed:", err);
    return { ok: false, error: "Não foi possível agendar a coleta. Tente novamente." };
  }
}

async function bookCorreios(order: OrderForShipment): Promise<BookResult> {
  const user = process.env.CORREIOS_USER;
  const token = process.env.CORREIOS_TOKEN;

  if (!user || !token) {
    if (!simulationAllowed()) return notConfigured("Correios");
    return { ok: true, trackingNumber: simulatedTracking("CORREIOS"), simulated: true };
  }

  const endpoint = process.env.CORREIOS_API_URL || "https://api.correios.com.br/prepostagem/v1/prepostagens";
  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      pedido: order.orderNumber,
      destinatario: {
        nome: order.customerName,
        email: order.email,
        telefone: order.phone,
        endereco: order.address,
        cidade: order.city,
      },
      quantidadeVolumes: order.itemCount || 1,
      valorDeclarado: order.total,
    }),
    signal: AbortSignal.timeout(15000),
  });
  const data = await res.json().catch(() => ({}));
  const tn = data?.codigoObjeto || data?.trackingNumber;
  if (res.ok && tn) return { ok: true, trackingNumber: String(tn), simulated: false };
  return { ok: false, error: data?.msgs?.[0] || data?.error || "A transportadora não retornou código de rastreio." };
}

async function bookJadlog(order: OrderForShipment): Promise<BookResult> {
  const token = process.env.JADLOG_API_TOKEN;
  const account = process.env.JADLOG_ACCOUNT_ID;

  if (!token || !account) {
    if (!simulationAllowed()) return notConfigured("Jadlog");
    return { ok: true, trackingNumber: simulatedTracking("JADLOG"), simulated: true };
  }

  const res = await fetch("https://www.jadlog.com.br/embarcador/api/pedido/incluir", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      conteudo: "Móveis Inbramet",
      pedido: [order.orderNumber],
      totPeso: Math.max(2, (order.itemCount || 1) * 4),
      totValor: order.total,
      contaCorrente: account,
      des: {
        nome: order.customerName,
        endereco: order.address,
        cidade: order.city,
        fone: order.phone,
        email: order.email,
      },
    }),
    signal: AbortSignal.timeout(15000),
  });
  const data = await res.json().catch(() => ({}));
  const tn = data?.shipmentId || data?.codigo || data?.trackingNumber;
  if (tn) return { ok: true, trackingNumber: String(tn), simulated: false };
  return { ok: false, error: data?.error?.descricao || "A transportadora não retornou código de rastreio." };
}

