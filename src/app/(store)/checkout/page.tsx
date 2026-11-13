import type { Metadata } from "next";
import { requireCustomer } from "@/lib/customer-auth";
import { dbConfigured, prisma } from "@/lib/prisma";
import { CheckoutForm, type CheckoutDefaults } from "@/components/checkout-form";
import { payfastConfigured, safepayConfigured } from "@/lib/payments";
import { getProductBySlug } from "@/lib/catalog";
import { getStoreSettings } from "@/lib/settings";
import type { CartItem } from "@/components/cart/cart-provider";
import { toCartLine } from "@/lib/cart";

export const metadata: Metadata = {
  title: "Finalizar compra",
  robots: { index: false },
};

export const dynamic = "force-dynamic";

export default async function CheckoutPage({ searchParams }: PageProps<"/checkout">) {
  const sp = await searchParams;
  const p = Array.isArray(sp.payment) ? sp.payment[0] : sp.payment;
  const paymentNotice = p === "cancelled" || p === "failed" ? p : null;

  const buySlug = Array.isArray(sp.buy) ? sp.buy[0] : sp.buy;
  const qtyParam = Array.isArray(sp.qty) ? sp.qty[0] : sp.qty;

  const query = new URLSearchParams();
  if (buySlug) query.set("buy", buySlug);
  if (qtyParam) query.set("qty", qtyParam);
  const session = await requireCustomer(`/checkout${query.size ? `?${query}` : ""}`);

  const [product, phone, settings] = await Promise.all([
    buySlug ? getProductBySlug(buySlug) : null,
    dbConfigured
      ? prisma.customer
          .findUnique({ where: { id: session.id }, select: { phone: true } })
          .then((c) => c?.phone ?? undefined)
          .catch(() => undefined)
      : Promise.resolve(undefined),
    getStoreSettings(),
  ]);

  let buyNow: CartItem | null = null;
  if (product && product.stock > 0) {
    const qtyRaw = Number(qtyParam);
    buyNow = {
      ...toCartLine(product),
      quantity: Math.min(product.stock, Math.max(1, Number.isFinite(qtyRaw) ? Math.floor(qtyRaw) : 1)),
    };
  }

  const defaults: CheckoutDefaults = { name: session.name, email: session.email, phone };

  return (
    <CheckoutForm
      defaults={defaults}
      paymentNotice={paymentNotice}
      buyNow={buyNow}
      shippingRules={settings.shipping}
      gateways={{ PAYFAST: payfastConfigured(), SAFEPAY: safepayConfigured() }}
    />
  );
}
