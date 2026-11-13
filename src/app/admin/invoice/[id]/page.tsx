import Link from "next/link";
import { notFound } from "next/navigation";
import { requireAdmin, scopeBranchId } from "@/lib/admin";
import { getAdminOrder } from "@/lib/admin-data";
import { getStoreSettings } from "@/lib/settings";
import { formatPrice } from "@/lib/format";
import { courierLabel } from "@/lib/couriers";
import { PrintButton } from "@/components/admin/print-button";
import { PAYMENT_METHOD_LABEL, PAYMENT_STATUS_LABEL } from "@/lib/order-status";

export const metadata = { title: "Fatura", robots: { index: false } };
export const dynamic = "force-dynamic";

// Printable invoice + packing slip. Lives outside the dashboard layout so it
// prints on a clean A4 page (sidebar/header not included).
export default async function InvoicePage({ params }: PageProps<"/admin/invoice/[id]">) {
  const session = await requireAdmin();
  const { id } = await params;
  const [order, settings] = await Promise.all([
    getAdminOrder(id, scopeBranchId(session)),
    getStoreSettings(),
  ]);
  if (!order) notFound();

  const date = new Date(order.createdAt).toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
  const codDue = order.paymentMethod === "COD" && order.paymentStatus !== "PAID" ? order.total : 0;
  const itemCount = order.items.reduce((n, i) => n + i.quantity, 0);
  const c = settings.contact;

  return (
    <div className="min-h-screen bg-[#f8faf6] py-8 print:bg-white print:py-0">
      <div className="mx-auto mb-5 flex max-w-[800px] items-center justify-between px-4 print:hidden">
        <Link href={`/admin/orders/${order.id}`} className="text-sm text-[#5b6b7c] hover:underline">
          ← Voltar para o pedido
        </Link>
        <PrintButton label="Imprimir fatura" />
      </div>

      <article className="mx-auto max-w-[800px] bg-white p-10 text-[13px] leading-relaxed text-[#0f172a] shadow-sm print:max-w-none print:p-0 print:shadow-none">
        {/* Header */}
        <header className="flex items-start justify-between border-b-2 border-[#0f172a] pb-5">
          <div>
            <p className="font-display text-3xl font-bold tracking-[0.25em] text-[#0f172a]">INBRAMET</p>
            <p className="mt-1 text-xs italic text-[#5b6b7c]">Móveis de design e resistência · Feitos para a vida real</p>
            <p className="mt-3 text-xs text-[#5b6b7c]">{[c.city, c.phone, c.email].filter(Boolean).join(" · ")}</p>
          </div>
          <div className="text-right">
            <p className="text-xl font-semibold uppercase tracking-[0.15em]">Fatura</p>
            <p className="mt-1 font-medium">{order.orderNumber}</p>
            <p className="text-xs text-[#5b6b7c]">{date}</p>
          </div>
        </header>

        {/* Parties */}
        <section className="mt-6 grid grid-cols-2 gap-8">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#5b6b7c]">
              Faturar / enviar para
            </p>
            <p className="mt-1.5 font-medium">{order.customerName}</p>
            <p>{order.address ?? "—"}</p>
            <p>
              {order.city ?? ""}
              {order.postalCode ? ` ${order.postalCode}` : ""}
            </p>
            <p>{order.phone}</p>
            <p className="text-[#5b6b7c]">{order.email}</p>
          </div>
          <div className="text-right">
            <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#5b6b7c]">Pagamento</p>
            <p className="mt-1.5 font-medium">{PAYMENT_METHOD_LABEL[order.paymentMethod] ?? order.paymentMethod}</p>
            <p>Status: {PAYMENT_STATUS_LABEL[order.paymentStatus] ?? order.paymentStatus}</p>
            <p>Entrega padrão</p>
            {order.courier && order.trackingNumber && (
              <p className="mt-2">
                {courierLabel(order.courier)} · <span className="font-medium">{order.trackingNumber}</span>
              </p>
            )}
          </div>
        </section>

        {/* Items */}
        <table className="mt-7 w-full border-collapse">
          <thead>
            <tr className="border-b border-[#cbd5e1] text-left text-[11px] uppercase tracking-[0.12em] text-[#5b6b7c]">
              <th className="py-2 font-semibold">Produto</th>
              <th className="py-2 text-center font-semibold">Qtd.</th>
              <th className="py-2 text-right font-semibold">Preço</th>
              <th className="py-2 text-right font-semibold">Valor</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((i) => (
              <tr key={i.id} className="border-b border-[#e9f0f8]">
                <td className="py-2.5">{i.name}</td>
                <td className="py-2.5 text-center">{i.quantity}</td>
                <td className="py-2.5 text-right">{formatPrice(i.price)}</td>
                <td className="py-2.5 text-right">{formatPrice(i.price * i.quantity)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <section className="ml-auto mt-4 w-64 space-y-1.5">
          <div className="flex justify-between">
            <span className="text-[#5b6b7c]">Subtotal</span>
            <span>{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[#5b6b7c]">Frete</span>
            <span>{order.shipping === 0 ? "Grátis" : formatPrice(order.shipping)}</span>
          </div>
          <div className="flex justify-between border-t border-[#0f172a] pt-2 text-base font-semibold">
            <span>Total</span>
            <span>{formatPrice(order.total)}</span>
          </div>
          {codDue > 0 && (
            <div className="mt-2 rounded border-2 border-[#0f172a] bg-[#f8faf6] px-3 py-2 text-center font-semibold text-[#0f172a]">
              Valor a cobrar na entrega: {formatPrice(codDue)}
            </div>
          )}
        </section>

        {order.notes && (
          <p className="mt-6 rounded bg-[#f6f8fb] px-3 py-2 text-xs">
            <span className="font-semibold">Observação do cliente:</span> {order.notes}
          </p>
        )}

        <p className="mt-8 text-center text-xs text-[#5b6b7c]">
          Obrigado por comprar na Inbramet. Se precisar de assistência com seu pedido, entre em contato informando o número do pedido.
        </p>

        {/* Packing slip — cut off and put in / on the parcel */}
        <section className="mt-10 border-t-2 border-dashed border-[#c8d8ea] pt-6 print:break-inside-avoid">
          <p className="text-[11px] font-semibold uppercase tracking-[0.15em] text-[#5b6b7c]">✂ Guia de embalagem</p>
          <div className="mt-3 grid grid-cols-2 gap-8">
            <div>
              <p className="text-lg font-semibold">{order.customerName}</p>
              <p>{order.address ?? "—"}</p>
              <p>
                {order.city ?? ""}
                {order.postalCode ? ` ${order.postalCode}` : ""}
              </p>
              <p className="font-medium">{order.phone}</p>
            </div>
            <div className="text-right">
              <p className="font-medium">{order.orderNumber}</p>
              <p>
                {itemCount} produto{itemCount === 1 ? "" : "s"}
              </p>
              <p className="mt-2 text-base font-semibold">
                {codDue > 0 ? `Pagamento na entrega: ${formatPrice(codDue)}` : "PAGO: não cobrar na entrega"}
              </p>
            </div>
          </div>
        </section>
      </article>
    </div>
  );
}
