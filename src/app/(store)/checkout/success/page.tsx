import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { formatPrice } from "@/lib/format";
import { dbConfigured, prisma } from "@/lib/prisma";
import { orderLoyalty } from "@/lib/loyalty";
import { getStoreSettings } from "@/lib/settings";
import { ClearCart } from "@/components/cart/clear-cart";

export const metadata: Metadata = {
  title: "Pedido confirmado",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

type OrderSummary = {
  id: string;
  orderNumber: string;
  total: number;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  customerId: string | null;
  productIds: string[];
};

async function findOrder(orderNumber: string): Promise<OrderSummary | null> {
  if (!dbConfigured) return null;
  try {
    const o = await prisma.order.findUnique({
      where: { orderNumber },
      select: {
        id: true,
        orderNumber: true,
        total: true,
        paymentMethod: true,
        paymentStatus: true,
        status: true,
        customerId: true,
        items: { select: { productId: true } },
      },
    });
    return o
      ? { ...o, total: Number(o.total), productIds: o.items.map((i) => i.productId) }
      : null;
  } catch {
    return null;
  }
}

export default async function SuccessPage({
  searchParams,
}: PageProps<"/checkout/success">) {
  const sp = await searchParams;
  const orderNumber = ((Array.isArray(sp.order) ? sp.order[0] : sp.order) ?? "").trim();

  const order = orderNumber ? await findOrder(orderNumber) : null;
  if (!order) redirect("/cart");

  const online = order.paymentMethod !== "COD";
  if (online && (order.paymentStatus === "FAILED" || order.status === "CANCELLED")) {
    redirect("/checkout?payment=failed");
  }
  const awaitingPayment = online && order.paymentStatus !== "PAID";

  const settings = await getStoreSettings();
  const club =
    settings.loyalty.enabled && order.customerId ? await orderLoyalty(order.id) : null;
  const clubLine = club
    ? [
        club.stamps > 0 ? `${club.stamps} selo${club.stamps === 1 ? "" : "s"}` : "",
        club.points > 0 ? `${club.points} pontos para brindes` : "",
      ]
        .filter(Boolean)
        .join(" e ")
    : "";

  return (
    <div className="mx-auto max-w-2xl px-5 py-24 text-center">
      <ClearCart productIds={order.productIds} />
      <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-r from-accent-soft to-accent">
        <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#0f172a" strokeWidth="2.6">
          <path d="M5 12l5 5L20 6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </div>

      <h1 className="mt-8 font-display text-4xl font-semibold text-ink">Obrigado pela sua compra!</h1>
      <p className="mt-3 text-muted">
        {awaitingPayment
          ? "Recebemos seu pedido. Estamos confirmando o pagamento — avisaremos por e-mail assim que for aprovado."
          : "Seu pedido foi registrado com sucesso. Enviaremos a confirmação para o seu e-mail."}
      </p>

      <div className="mx-auto mt-8 max-w-sm rounded-xl border border-[var(--line)] bg-surface/70 p-6 text-sm">
        <div className="flex justify-between">
          <span className="text-muted">Número do pedido</span>
          <span className="font-medium text-ink">{order.orderNumber}</span>
        </div>
        <div className="mt-3 flex justify-between">
          <span className="text-muted">Total</span>
          <span className="font-medium text-ink">{formatPrice(order.total)}</span>
        </div>
        <div className="mt-3 flex justify-between">
          <span className="text-muted">Pagamento</span>
          <span className="font-medium text-ink">
            {online
              ? order.paymentStatus === "PAID"
                ? "Pago on-line"
                : "Confirmando…"
              : "Pagamento na entrega"}
          </span>
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-sm rounded-xl border border-accent/40 bg-accent/5 p-5 text-sm">
        <p className="font-medium text-ink">Salvo na sua conta</p>
        <p className="mt-1 text-muted">Acompanhe este pedido e consulte seu histórico quando quiser.</p>
        <Link
          href="/account/orders"
          className="mt-3 inline-block rounded-full border border-[var(--line-strong)] px-6 py-2 text-xs font-medium uppercase tracking-[0.12em] text-ink transition hover:border-accent hover:text-accent-strong"
        >
          Ver meus pedidos
        </Link>
      </div>

      {club && (clubLine || club.redeemed) ? (
        <div className="mx-auto mt-6 max-w-sm rounded-xl border border-accent/40 bg-accent/5 p-5 text-sm">
          <p className="font-medium text-ink">{settings.loyalty.name}</p>
          <p className="mt-1 text-muted">
            {clubLine && (
              <>
                Você acumulou <span className="text-ink">{clubLine}</span>.
              </>
            )}
            {club!.redeemed && (
              <>
                {clubLine ? " " : ""}
                <span className="text-ink">Seu item gratuito já foi incluído no pedido</span>.
              </>
            )}
          </p>
          <Link
            href="/clube-inbramet"
            className="mt-3 inline-block rounded-full border border-[var(--line-strong)] px-6 py-2 text-xs font-medium uppercase tracking-[0.12em] text-ink transition hover:border-accent hover:text-accent-strong"
          >
            Ver minha cartela
          </Link>
        </div>
      ) : null}

      <p className="mx-auto mt-6 max-w-md text-sm text-muted">
        {online
          ? "Guarde o número do seu pedido — você pode acompanhá-lo a qualquer momento na página de pedidos."
          : "Se você escolheu pagamento na entrega, mantenha o valor preparado ao receber. Nossa equipe entrará em contato para confirmar a entrega."}
      </p>

      <div className="mt-8 flex flex-wrap justify-center gap-3">
        <Link
          href="/shop"
          className="inline-block rounded-full bg-gradient-to-r from-accent-soft to-accent px-8 py-3 text-sm font-medium text-brand transition hover:opacity-90"
        >
          Continuar comprando
        </Link>
        <Link
          href="/account/orders"
          className="inline-block rounded-full border border-[var(--line-strong)] px-8 py-3 text-sm font-medium text-ink transition hover:border-accent hover:text-accent-strong"
        >
          Rastrear pedido
        </Link>
      </div>
    </div>
  );
}
