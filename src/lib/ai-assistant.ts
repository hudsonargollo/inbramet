import Anthropic from "@anthropic-ai/sdk";
import { getProducts, getCategories } from "./catalog";
import { getStoreSettings } from "./settings";
import { whatsappUrl, type StoreSettings } from "./settings-shared";
import { lookupOrder } from "./order-lookup";
import { formatPrice, discountPercent } from "./format";
import type { ProductView } from "./types";

export type ChatTurn = { role: "user" | "assistant"; content: string };
export type ChatReply = { reply: string; mode: "ai" | "basic" };

const MODEL = process.env.CHAT_MODEL || "claude-opus-5-5";
const MAX_TOOL_ROUNDS = 3;

let client: Anthropic | null = null;
function getClient(): Anthropic | null {
  if (!process.env.ANTHROPIC_API_KEY) return null;
  client ??= new Anthropic();
  return client;
}

export function aiEnabled(): boolean {
  return Boolean(process.env.ANTHROPIC_API_KEY);
}

function packOf(p: ProductView): string | null {
  return p.material && !/f[oó]rmula|matem[aá]tica/i.test(p.material) ? p.material : null;
}

function productLine(p: ProductView): string {
  const off = discountPercent(p.price, p.compareAtPrice);
  const price = off
    ? `${formatPrice(p.price)} (antes ${formatPrice(p.compareAtPrice!)}, -${off}%)`
    : formatPrice(p.price);
  const stock = p.stock <= 0 ? "ESGOTADO" : p.stock <= 5 ? `restam ${p.stock}` : "em estoque";
  const desc = (p.description ?? "").replace(/\s+/g, " ").slice(0, 220);
  const pack = packOf(p);
  const specs = (p.specs ?? "").replace(/\s*\n\s*/g, "; ").slice(0, 160);
  return `- ${p.name} | ${p.category.name} | ${price} | ${stock}${pack ? ` | ${pack}` : ""} | /product/${p.slug}${
    specs ? ` | detalhes: ${specs}` : ""
  }\n  ${desc}`;
}

async function storeKnowledge(): Promise<{
  text: string;
  settings: StoreSettings;
  products: ProductView[];
  categories: { name: string; slug: string }[];
}> {
  const [settings, products, categories] = await Promise.all([
    getStoreSettings(),
    getProducts({ sort: "newest" }),
    getCategories(),
  ]);
  const c = settings.contact;
  const s = settings.shipping;
  const counts = new Map<string, number>();
  for (const p of products) counts.set(p.category.slug, (counts.get(p.category.slug) ?? 0) + 1);

  const text = `# Loja
Inbramet — móveis funcionais e design contemporâneo para sala de jantar, cozinha e escritório: mesas, cadeiras, bancos, banquetas e conjuntos de mesa com 4 cadeiras. Preços em Reais (R$ / BRL).
Páginas do site: Coleção /shop · Categorias ${categories.map((x) => `/shop/${x.slug}`).join(", ")} · Pedidos sob medida ou corporativos /custom · Rastrear pedido /account/orders · Entregas e trocas /shipping · Materiais e cuidados /care · Perguntas frequentes /faq · Contato /contact · Minha conta /account (cadastro /register).

# Categorias
${categories.map((x) => `- ${x.name}: ${counts.get(x.slug) ?? 0} produtos${(counts.get(x.slug) ?? 0) === 0 ? " (em breve — o cliente pode clicar em 'Avise-me' na página da categoria)" : ""}`).join("\n")}

# Entrega
- Entrega programada com transporte especializado em todo o Brasil. Prazo estimado: ${s.deliveryTime}. Os prazos dependem da disponibilidade, embalagem e distância.
- ${s.freeThreshold > 0 ? `Frete de ${formatPrice(s.flatFee)}; GRÁTIS em pedidos a partir de ${formatPrice(s.freeThreshold)}.` : "Frete grátis, sem valor mínimo."}
- Projetos corporativos ou pedidos em grande volume: coordenados pela equipe via WhatsApp ou em /custom.
- Quando o pedido sai para entrega, o cliente pode acompanhar em /account/orders usando o número do pedido e o e-mail informado na compra.

# Pagamento
- Pagamento na entrega (quando disponível para a região) ou pagamento on-line exibido na finalização da compra quando habilitado.
- É possível comprar sem criar conta; o cadastro é opcional.

# Trocas e devoluções
- Caso o móvel chegue com alguma avaria de transporte ou peça faltante, o cliente deve entrar em contato informando o número do pedido para análise e solução rápida.

# Materiais e cuidados
- Trabalhamos com aço com pintura eletrostática, madeira maciça selecionada, polímero/policarbonato de alta resistência e tampos laminados. Limpar com pano macio levemente umedecido e evitar abrasivos. Mais detalhes em /care.

# Pedidos sob medida e projetos
- Pedidos em volume para escritórios, restaurantes, eventos ou projetos personalizados: preencha o formulário em /custom (tipo de móvel, quantidade, acabamento). Nossa equipe entrará em contato para alinhar disponibilidade, acabamentos e orçamento.

# Contato
${[
  c.email && `- E-mail: ${c.email}`,
  c.phone && `- Telefone: ${c.phone}`,
  whatsappUrl(settings) && `- WhatsApp: ${whatsappUrl(settings)}`,
  `- Horário: ${c.hours} · Localização: ${c.city}`,
  `- Formulário de contato: /contact`,
]
  .filter(Boolean)
  .join("\n")}

# Catálogo (${products.length} produtos ativos — nome | categoria | preço | estoque | material | link)
${products.slice(0, 200).map(productLine).join("\n")}`;

  return { text, settings, products, categories };
}

const INSTRUCTIONS = `You are the online support assistant for Inbramet, a Brazilian contemporary furniture online store specializing in tables (mesas), chairs (cadeiras), benches (bancos), barstools (banquetas), and dining sets (conjuntos). You chat with customers on the website. All prices are in Brazilian Reais (R$ / BRL) and the store operates exclusively as an online store with delivery across Brazil (no physical branches / sucursales).

How to answer:
- Answer only from the store information and catalog below, and from track_order results. If something isn't covered, say you're not sure and direct the customer to the team via /contact or WhatsApp instead of guessing.
- Never guarantee fixed delivery dates or response deadlines. Treat delivery estimates as dependent on preparation and distance. For complaints or damaged items, ask the customer to contact the team with their order number for proper review; never promise automatic refunds.
- Default to Brazilian Portuguese (pt-BR). Match the customer's language if they clearly write in another language.
- Keep replies short and friendly: 1–4 sentences, plain text, no markdown headings or tables.
- When you mention a product or page, include its site path (e.g. /product/jogomesa4cadeiras, /shop/cadeiras, /account/orders) so it becomes a link.
- Prices: quote strictly in R$ (BRL) as listed. Never invent prices, discounts, stock, or dates.
- Order status: use the track_order tool only when the customer gives an order number (e.g. IN01-) AND the email used at checkout.
- Never ask for or accept card numbers, passwords or OTPs.
- You are an AI assistant; if asked, confirm honestly and offer human contact via /contact.`;

const TOOLS: Anthropic.Beta.BetaTool[] = [
  {
    name: "track_order",
    description:
      "Consultar o status do pedido de um cliente pelo número do pedido e e-mail usado na compra.",
    strict: true,
    input_schema: {
      type: "object",
      properties: {
        order_number: { type: "string", description: "Número do pedido, ex.: IN01-ABC123-XYZ45678" },
        email: { type: "string", description: "E-mail usado na compra" },
      },
      required: ["order_number", "email"],
      additionalProperties: false,
    },
  },
];

async function runTool(name: string, input: unknown): Promise<{ content: string; isError?: boolean }> {
  if (name !== "track_order") return { content: `Ferramenta desconhecida: ${name}`, isError: true };
  const i = (input ?? {}) as { order_number?: unknown; email?: unknown };
  const orderNumber = typeof i.order_number === "string" ? i.order_number.trim().toUpperCase() : "";
  const email = typeof i.email === "string" ? i.email.trim() : "";
  if (!orderNumber || !email) return { content: "Informe o número do pedido e o e-mail.", isError: true };
  const r = await lookupOrder(orderNumber, email);
  if (!r.ok) {
    return {
      content:
        r.reason === "db-down"
          ? "O sistema de pedidos está indisponível no momento."
          : "Nenhum pedido encontrado com esse número e e-mail.",
    };
  }
  const o = r.order;
  return {
    content: JSON.stringify({
      orderNumber: o.orderNumber,
      placed: o.createdAt.slice(0, 10),
      status: o.status,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      total: formatPrice(o.total),
      items: o.items.map((x) => `${x.name} x${x.quantity}`),
      courier: o.courier,
      trackingNumber: o.trackingNumber,
    }),
  };
}

async function aiReply(history: ChatTurn[], knowledge: string): Promise<string | null> {
  const anthropic = getClient();
  if (!anthropic) return null;

  const messages: Anthropic.Beta.BetaMessageParam[] = history.map((t) => ({ role: t.role, content: t.content }));

  for (let round = 0; round <= MAX_TOOL_ROUNDS; round++) {
    const response = await anthropic.beta.messages.create({
      model: MODEL,
      max_tokens: 4000,
      betas: ["server-side-fallback-2026-07-01"],
      fallbacks: "default",
      output_config: { effort: "low" },
      system: [
        { type: "text", text: INSTRUCTIONS },
        { type: "text", text: knowledge, cache_control: { type: "ephemeral" } },
      ],
      tools: TOOLS,
      messages,
    });

    if (response.stop_reason === "refusal") {
      return "Não posso ajudar com isso por aqui. Fale com nossa equipe pela página /contact.";
    }

    if (response.stop_reason === "tool_use") {
      messages.push({ role: "assistant", content: response.content });
      const results: Anthropic.Beta.BetaToolResultBlockParam[] = [];
      for (const block of response.content) {
        if (block.type !== "tool_use") continue;
        const r = await runTool(block.name, block.input);
        results.push({ type: "tool_result", tool_use_id: block.id, content: r.content, is_error: r.isError });
      }
      messages.push({ role: "user", content: results });
      continue;
    }

    const text = response.content
      .filter((b): b is Anthropic.Beta.BetaTextBlock => b.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();
    return text || null;
  }
  return null;
}

const STOP = new Set(
  "a o os as um uma uns umas de da do das dos em no na nos nas e ou com por para que qual como quanto preço preco valor ver mostra mostrar quero busco preciso tem"
    .split(" ")
);

function basicReply(
  question: string,
  settings: StoreSettings,
  products: ProductView[],
  categories: { name: string; slug: string }[]
): string {
  const q = question.toLowerCase();
  const has = (...w: string[]) => w.some((x) => q.includes(x));
  const s = settings.shipping;
  const contact = whatsappUrl(settings) ? `WhatsApp ${whatsappUrl(settings)}` : "nossa página de contato /contact";

  const trackAnswer =
    "Você pode acompanhar seu pedido em /account/orders — basta informar o número do pedido e o e-mail usado na compra.";
  if (/\b(?:cc|in)\d{2}-[a-z0-9-]+/i.test(q)) return trackAnswer;
  if (has("rastrear", "rastreamento", "acompanhar", "status do pedido", "onde está meu pedido", "onde esta meu pedido", "track", "order status"))
    return trackAnswer;
  if (has("pagamento", "pagar", "contra entrega", "dinheiro", "cartão", "cartao", "pix", "payment"))
    return "Você pode pagar na entrega quando disponível na sua região ou utilizar o pagamento on-line exibido na finalização do pedido.";
  if (has("devol", "troca", "reembolso", "avaria", "return", "refund"))
    return `Se o seu móvel chegou com alguma avaria de transporte ou peça faltante, fale com nossa equipe em ${contact} informando o número do pedido para avaliarmos rapidamente.`;
  if (has("sob medida", "personalizado", "atacado", "volume", "corporativo", "empresa", "escritório", "escritorio", "projeto", "custom"))
    return "Preparamos pedidos sob medida e em volume para escritórios, comércios e residências! Preencha o formulário em /custom e nossa equipe entrará em contato para alinhar acabamento e orçamento.";
  if (has("frete", "entrega", "delivery", "prazo", "demora", "envio", "shipping"))
    return `Fazemos entregas programadas com transporte especializado. Prazo estimado: ${s.deliveryTime}. ${
      s.freeThreshold > 0
        ? `O frete custa ${formatPrice(s.flatFee)} e é GRÁTIS em pedidos a partir de ${formatPrice(s.freeThreshold)}.`
        : "O frete é grátis, sem valor mínimo de compra."
    } Mais detalhes em /shipping.`;
  if (has("material", "madeira", "aço", "aco", "metal", "policarbonato", "limpar", "limpeza", "cuidado", "garantia"))
    return "Nossos móveis combinam aço com pintura eletrostática, madeira maciça selecionada e polímero de alta resistência. Para conservar, limpe com pano macio e evite abrasivos. Veja mais em /care.";
  if (has("horário", "horario", "atendimento", "contato", "telefone", "whatsapp", "e-mail", "email", "onde ficam", "endereço", "endereco"))
    return `Atendemos de forma on-line pelo ${contact}${settings.contact.email ? ` ou pelo e-mail ${settings.contact.email}` : ""}. Horário: ${settings.contact.hours}.`;
  if (has("oferta", "desconto", "promo", "promoção", "promocao", "sale")) {
    const onSale = products.filter((p) => discountPercent(p.price, p.compareAtPrice)).slice(0, 4);
    return onSale.length
      ? `Ofertas da semana:\n${onSale
          .map((p) => `• ${p.name} — ${formatPrice(p.price)} (-${discountPercent(p.price, p.compareAtPrice)}%) /product/${p.slug}`)
          .join("\n")}`
      : "No momento não há promoções ativas — acompanhe a coleção em /shop.";
  }

  for (const c of categories) {
    const word = c.name.toLowerCase().replace(/s$/, "");
    if (q.includes(word) && !products.some((p) => p.category.slug === c.slug)) {
      return `Nossa categoria de ${c.name.toLowerCase()} chega em breve! Clique em "Avise-me" em /shop/${c.slug} para receber novidades. Enquanto isso, confira todo o catálogo em /shop.`;
    }
  }

  const words = q.replace(/[^a-z0-9áéíóúâêôãõçü\s]/g, " ").split(/\s+/).filter((w) => w.length > 2 && !STOP.has(w));
  const under = q.match(/(?:menos de|até|ate|abaixo de|under)\s*(?:r\$\s*)?([\d,.]+)/);
  const max = under ? Number(under[1].replace(/[.,]/g, "")) : null;
  const scored = products
    .map((p) => {
      const hay = `${p.name} ${p.category.name} ${p.category.slug} ${packOf(p) ?? ""}`.toLowerCase();
      const score = words.reduce((n, w) => n + (hay.includes(w) || hay.includes(w.replace(/s$/, "")) ? 1 : 0), 0);
      return { p, score };
    })
    .filter((x) => (x.score > 0 || max != null) && (max == null || x.p.price <= max));
  const best = Math.max(0, ...scored.map((x) => x.score));
  const top = scored
    .filter((x) => x.score === best)
    .sort((a, b) => a.p.price - b.p.price)
    .slice(0, 4);
  if (top.length) {
    if (top.length === 1) {
      const p = top[0].p;
      const off = discountPercent(p.price, p.compareAtPrice);
      return `${p.name} está por ${formatPrice(p.price)}${off ? ` (antes ${formatPrice(p.compareAtPrice!)}, -${off}%)` : ""}${
        p.stock <= 0 ? " — esgotado no momento" : p.stock <= 5 ? ` — restam ${p.stock}` : " — disponível"
      }. Confira aqui: /product/${p.slug}`;
    }
    return `Encontrei estas opções:\n${top
      .map(({ p }) => `• ${p.name} — ${formatPrice(p.price)}${p.stock <= 0 ? " (esgotado)" : ""} /product/${p.slug}`)
      .join("\n")}\nVeja a coleção completa em /shop.`;
  }
  if (/\b(olá|ola|oi|bom dia|boa tarde|boa noite|hola|hey|hi|hello)\b/.test(q))
    return "Olá! Como posso ajudar hoje — catálogo de móveis, preços em R$, frete, pedidos sob medida ou rastreamento?";
  if (/\b(obrigado|obrigada|valeu|gracias|thank you|thanks)\b/.test(q)) return "Por nada! Se precisar de mais alguma ajuda, estou por aqui.";

  return `Não tenho certeza sobre essa informação. Nossa equipe pode ajudar pelo ${contact}. Você também pode perguntar sobre móveis, materiais, preços, frete ou acompanhar seu pedido.`;
}

export async function answerCustomer(history: ChatTurn[]): Promise<ChatReply> {
  const { text, settings, products, categories } = await storeKnowledge();
  const last = history[history.length - 1]?.content ?? "";

  if (aiEnabled()) {
    try {
      const reply = await aiReply(history, text);
      if (reply) return { reply, mode: "ai" };
    } catch (err) {
      if (err instanceof Anthropic.RateLimitError) console.warn("[chat] Claude rate limited — basic mode");
      else if (err instanceof Anthropic.AuthenticationError) console.error("[chat] Invalid ANTHROPIC_API_KEY — basic mode");
      else if (err instanceof Anthropic.APIError) console.error(`[chat] Claude API error ${err.status}:`, err.message);
      else console.error("[chat] assistant failed:", err);
    }
  }
  return { reply: basicReply(last, settings, products, categories), mode: "basic" };
}
