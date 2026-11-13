import type { Metadata } from "next";
import { Emblem } from "@/components/brand/emblem";
import { OrderLookup } from "@/components/order-lookup";

export const metadata: Metadata = {
  title: "Status do pedido",
  description: "Acompanhe seu pedido na Inbramet — informe o número do pedido e seu e-mail.",
  alternates: { canonical: "/account/orders" },
};

export default async function OrderStatusPage({
  searchParams,
}: PageProps<"/account/orders">) {
  const sp = await searchParams;
  // Only the order number may be pre-filled from a link — never the email.
  const orderNumber = (Array.isArray(sp.order) ? sp.order[0] : sp.order)?.trim() ?? "";

  return (
    <div className="mx-auto max-w-2xl px-5 py-16">
      <div className="text-center">
        <Emblem size={40} className="mx-auto text-accent-strong" />
        <span className="eyebrow mt-3 block">Ajuda</span>
        <h1 className="mt-2 font-display text-4xl font-semibold text-ink">Status do pedido</h1>
        <p className="mx-auto mt-4 max-w-md text-muted">
          Informe o número do pedido e o e-mail usado na compra para acompanhar o status.
        </p>
      </div>

      <OrderLookup defaultOrder={orderNumber} />
    </div>
  );
}
