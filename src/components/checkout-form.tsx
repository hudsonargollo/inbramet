"use client";

import { useState, useEffect, useRef, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart, type CartItem } from "@/components/cart/cart-provider";
import { ProductImage } from "@/components/product-image";
import { useToast } from "@/components/ui/toast";
import { formatPrice, savingsOf, visiblePack } from "@/lib/format";
import { SavingsStrip } from "@/components/ui/sale-badge";
import { shippingFor } from "@/lib/settings-shared";
import type { LoyaltyCartPreview } from "@/lib/loyalty-shared";

type PaymentMethod = "COD" | "PAYFAST" | "SAFEPAY";

export type CheckoutDefaults = {
  name?: string;
  email?: string;
  phone?: string;
};

const inputCls =
  "w-full rounded-lg border border-[var(--line-strong)] bg-surface px-4 py-3 text-sm text-ink outline-none transition placeholder:text-muted/60 focus:border-accent focus:ring-2 focus:ring-accent/25";
const labelCls = "mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-muted";

const NOTICES = {
  cancelled: "O pagamento foi cancelado. Você pode tentar novamente abaixo.",
  failed: "O pagamento falhou. Tente novamente ou escolha pagamento na entrega.",
} as const;

export function CheckoutForm({
  defaults,
  paymentNotice = null,
  gateways = { PAYFAST: false, SAFEPAY: false },
  buyNow = null,
  shippingRules = { flatFee: 45, freeThreshold: 1200, deliveryTime: "" },
}: {
  shippingRules?: { flatFee: number; freeThreshold: number; deliveryTime: string };
  buyNow?: CartItem | null;
  defaults?: CheckoutDefaults;
  paymentNotice?: keyof typeof NOTICES | null;
  gateways?: { PAYFAST: boolean; SAFEPAY: boolean };
}) {
  const router = useRouter();
  const cart = useCart();
  const items = buyNow ? [buyNow] : cart.items;
  const subtotal = buyNow ? buyNow.price * buyNow.quantity : cart.subtotal;
  const savings = buyNow
    ? (savingsOf(buyNow.price, buyNow.compareAtPrice) ?? 0) * buyNow.quantity
    : cart.savings;
  const ready = buyNow ? true : cart.ready;
  const toast = useToast();
  const [payment, setPayment] = useState<PaymentMethod>("COD");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(paymentNotice ? NOTICES[paymentNotice] : null);

  const baseShipping = shippingFor(subtotal, shippingRules);

  // ---- Clube Inbramet: o que este pedido acumula e se há cartela para resgate ----
  const [loyalty, setLoyalty] = useState<LoyaltyCartPreview | null>(null);
  const [redeemId, setRedeemId] = useState<string | null>(null);
  const cartKey = items.map((i) => `${i.id}:${i.quantity}`).join(",");

  useEffect(() => {
    if (!ready || items.length === 0) return;
    let cancelled = false;
    fetch("/api/loyalty/cart", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
        subtotal,
        shipping: baseShipping,
        redeemProductId: redeemId,
      }),
    })
      .then((r) => (r.ok ? (r.json() as Promise<LoyaltyCartPreview>) : null))
      .then((data) => {
        if (!cancelled && data?.ok) {
          setLoyalty(data);
          if (redeemId && !data.redeemable.some((r) => r.productId === redeemId)) {
            setRedeemId(null);
          }
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cartKey, redeemId, ready]);

  const freeLine = loyalty?.redeemable.find((r) => r.productId === redeemId) ?? null;
  const discount = freeLine ? freeLine.price : 0;
  const payableSubtotal = subtotal - discount;
  const shipping = freeLine ? shippingFor(payableSubtotal, shippingRules) : baseShipping;
  const total = payableSubtotal + shipping;

  const paymentNoticeShown = useRef(false);
  useEffect(() => {
    if (!paymentNotice || paymentNoticeShown.current) return;
    paymentNoticeShown.current = true;
    toast.error(NOTICES[paymentNotice]);
  }, [paymentNotice, toast]);

  if (!ready) {
    return (
      <div className="mx-auto max-w-6xl px-5 py-12" aria-busy="true">
        <h1 className="font-display text-4xl font-semibold text-ink">Finalizar compra</h1>
        <div className="mt-8 h-96 animate-pulse rounded-2xl bg-cream-soft" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <h1 className="font-display text-3xl font-semibold text-ink">Seu carrinho está vazio</h1>
        <Link
          href="/shop"
          className="mt-6 inline-block rounded-full bg-gradient-to-r from-accent-soft to-accent px-8 py-3 text-sm font-medium text-brand"
        >
          Explorar a coleção
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const form = new FormData(e.currentTarget);
    const payload = {
      customerName: form.get("customerName"),
      email: form.get("email"),
      phone: form.get("phone"),
      fulfillment: "DELIVERY",
      address: form.get("address"),
      city: form.get("city"),
      postalCode: form.get("postalCode"),
      notes: form.get("notes"),
      paymentMethod: payment,
      redeemProductId: freeLine ? redeemId : null,
      items: items.map((i) => ({
        productId: i.id,
        name: i.name,
        price: i.price,
        quantity: i.quantity,
      })),
    };

    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (res.status === 401 && data.signIn) {
        router.push(`/login?next=${encodeURIComponent(window.location.pathname + window.location.search)}`);
        return;
      }
      if (!res.ok || !data.ok) {
        throw new Error(data.error || "Não foi possível processar seu pedido. Tente novamente.");
      }
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
        return;
      }
      router.push(`/checkout/success?order=${encodeURIComponent(data.orderNumber)}`);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Algo deu errado.";
      setError(message);
      toast.error(message, { title: "Pedido não concluído" });
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <h1 className="font-display text-4xl font-semibold text-ink">Finalizar compra</h1>
      {defaults?.email && (
        <p className="mt-2 text-sm text-muted">
          Conectado como <span className="text-ink">{defaults.email}</span> — este pedido ficará
          salvo na sua conta.
        </p>
      )}

      <form onSubmit={handleSubmit} className="mt-8 grid items-start gap-8 lg:grid-cols-[1fr_390px] lg:gap-12">
        <div className="space-y-8">
          <Section
            step={1}
            title="Contato e entrega"
            hint={shippingRules.deliveryTime || "Entrega coordenada pela loja on-line em todo o Brasil"}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label htmlFor="co-customerName" className={labelCls}>Nome completo</label>
                <input name="customerName" id="co-customerName" required defaultValue={defaults?.name} className={inputCls} />
              </div>
              <div>
                <label htmlFor="co-email" className={labelCls}>E-mail</label>
                <input name="email" id="co-email" type="email" required readOnly defaultValue={defaults?.email} title="As atualizações do pedido chegam no seu e-mail" className={`${inputCls} cursor-not-allowed opacity-75`} />
              </div>
              <div>
                <label htmlFor="co-phone" className={labelCls}>Telefone / WhatsApp</label>
                <input name="phone" id="co-phone" type="tel" required defaultValue={defaults?.phone} placeholder="(11) 99999-9999" className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="co-address" className={labelCls}>Endereço de entrega</label>
                <input name="address" id="co-address" required placeholder="Rua, número, complemento e bairro" className={inputCls} />
              </div>
              <div>
                <label htmlFor="co-city" className={labelCls}>Cidade / UF</label>
                <input name="city" id="co-city" required placeholder="Ex. São Paulo - SP" className={inputCls} />
              </div>
              <div>
                <label htmlFor="co-postalCode" className={labelCls}>CEP (opcional)</label>
                <input name="postalCode" id="co-postalCode" placeholder="00000-000" className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label htmlFor="co-notes" className={labelCls}>Observações do pedido (opcional)</label>
                <textarea name="notes" id="co-notes" rows={3} placeholder="Horário preferido, portaria ou instruções de entrega…" className={inputCls} />
              </div>
            </div>
          </Section>

          <Section step={2} title="Pagamento" hint="Todas as transações são seguras e criptografadas.">
            <div className="overflow-hidden rounded-xl border border-[var(--line-strong)]">
              <PaymentOption
                value="COD"
                current={payment}
                onSelect={setPayment}
                title="Pagamento na entrega"
                desc="Receba seu pedido e pague no ato da entrega."
                last={!gateways.PAYFAST && !gateways.SAFEPAY}
              />
              {gateways.PAYFAST && (
                <PaymentOption
                  value="PAYFAST"
                  current={payment}
                  onSelect={setPayment}
                  title="Cartão de crédito / débito"
                  desc="Pagamento on-line seguro com PayFast."
                  icons={<CardBrands />}
                  last={!gateways.SAFEPAY}
                />
              )}
              {gateways.SAFEPAY && (
                <PaymentOption
                  value="SAFEPAY"
                  current={payment}
                  onSelect={setPayment}
                  title="Cartão / carteira digital (Safepay)"
                  desc="Pagamento on-line seguro com Safepay."
                  icons={<CardBrands />}
                  last
                />
              )}
            </div>
          </Section>
        </div>

        {/* Resumo do pedido */}
        <aside className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-[var(--line-strong)] bg-surface/80 p-6 shadow-[0_24px_60px_-40px_rgba(15,23,42,0.45)]">
            <h2 className="font-display text-xl font-semibold text-ink">Resumo do pedido</h2>

            <ul className="mt-5 max-h-72 space-y-4 overflow-y-auto border-b border-[var(--line)] pb-5 pr-1 text-sm">
              {items.map((i) => (
                <li key={i.id} className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <div className="h-14 w-14 overflow-hidden rounded-lg border border-[var(--line)] bg-sand">
                      <ProductImage src={i.image} alt={i.name} seed={i.slug} />
                    </div>
                    <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand px-1 text-[0.62rem] font-semibold text-light">
                      {i.quantity}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-ink">{i.name}</p>
                    {visiblePack(i.material) && <p className="truncate text-xs text-muted">{visiblePack(i.material)}</p>}
                  </div>
                  <div className="shrink-0 text-right">
                    <span className="text-ink">{formatPrice(i.price * i.quantity)}</span>
                    {i.compareAtPrice && savingsOf(i.price, i.compareAtPrice) && (
                      <p className="text-xs text-muted line-through">{formatPrice(i.compareAtPrice * i.quantity)}</p>
                    )}
                  </div>
                </li>
              ))}
            </ul>

            {loyalty?.enabled && loyalty.redeemable.length > 0 && (
              <div className="mt-4 rounded-xl border border-accent/40 bg-accent/8 p-4">
                <p className="text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-accent-strong">
                  {loyalty.name}
                </p>
                <p className="mt-1 text-sm text-ink">
                  Você tem uma cartela completa: escolha o item que deseja ganhar grátis neste pedido.
                </p>
                <div className="mt-3 space-y-2">
                  {loyalty.redeemable.map((r) => (
                    <label
                      key={r.productId}
                      className="flex cursor-pointer items-center gap-2.5 text-sm text-ink"
                    >
                      <input
                        type="radio"
                        name="loyaltyRedeem"
                        checked={redeemId === r.productId}
                        onChange={() => setRedeemId(r.productId)}
                        className="h-4 w-4 accent-[var(--color-accent-strong)]"
                      />
                      <span className="min-w-0 flex-1 truncate">{r.name}</span>
                      <span className="shrink-0 font-medium text-accent-strong">
                        −{formatPrice(r.price)}
                      </span>
                    </label>
                  ))}
                  <button
                    type="button"
                    onClick={() => setRedeemId(null)}
                    className="text-xs text-muted underline underline-offset-2 hover:text-ink"
                  >
                    Não resgatar agora
                  </button>
                </div>
              </div>
            )}

            <dl className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-muted">Subtotal</dt>
                <dd className="text-ink">{formatPrice(subtotal)}</dd>
              </div>
              {freeLine && (
                <div className="flex justify-between">
                  <dt className="text-accent-strong">Resgate {freeLine.name}</dt>
                  <dd className="text-accent-strong">−{formatPrice(freeLine.price)}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-muted">Frete</dt>
                <dd className="text-ink">
                  {shipping === 0 ? "Grátis" : formatPrice(shipping)}
                </dd>
              </div>
              {shipping > 0 && shippingRules.freeThreshold > 0 && (
                <p className="text-xs text-muted">Frete grátis a partir de {formatPrice(shippingRules.freeThreshold)}.</p>
              )}
              {shipping === 0 && (
                <p className="text-xs text-muted">Este pedido tem direito a frete grátis.</p>
              )}
            </dl>

            <div className="mt-4 flex items-baseline justify-between border-t border-[var(--line)] pt-4">
              <span className="font-medium text-ink">Total</span>
              <span className="font-display text-2xl font-semibold text-ink">{formatPrice(total)}</span>
            </div>
            {savings > 0 && <SavingsStrip amount={savings} className="mt-4" />}

            {loyalty?.enabled && (loyalty.stamps > 0 || loyalty.points > 0) && (
              <p className="mt-3 text-center text-xs text-muted">
                Este pedido acumula{" "}
                {loyalty.stamps > 0 && (
                  <span className="text-ink">
                    {loyalty.stamps} selo{loyalty.stamps === 1 ? "" : "s"}
                  </span>
                )}
                {loyalty.stamps > 0 && loyalty.points > 0 && " e "}
                {loyalty.points > 0 && <span className="text-ink">{loyalty.points} pontos</span>}
                {" · "}
                <Link href="/clube-inbramet" className="underline underline-offset-2 hover:text-ink">
                  {loyalty.name}
                </Link>
              </p>
            )}

            {error && (
              <p className="mt-4 rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="mt-6 block w-full rounded-full bg-gradient-to-r from-accent-soft to-accent px-8 py-3.5 text-center text-sm font-semibold uppercase tracking-[0.1em] text-brand transition hover:opacity-90 disabled:opacity-60"
            >
              {submitting ? "Processando pedido…" : "Confirmar pedido"}
            </button>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-center text-xs text-muted">
              <LockIcon /> Pagamento seguro e criptografado · Inbramet
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}

function Section({
  step,
  title,
  hint,
  children,
}: {
  step: number;
  title: string;
  hint?: string;
  children: ReactNode;
}) {
  return (
    <section>
      <div className="mb-4 flex items-center gap-3">
        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand text-xs font-semibold text-light">
          {step}
        </span>
        <div>
          <h2 className="font-display text-lg font-semibold text-ink">{title}</h2>
          {hint && <p className="text-xs text-muted">{hint}</p>}
        </div>
      </div>
      {children}
    </section>
  );
}

function PaymentOption({
  value,
  current,
  onSelect,
  title,
  desc,
  icons,
  last = false,
}: {
  value: PaymentMethod;
  current: PaymentMethod;
  onSelect: (v: PaymentMethod) => void;
  title: string;
  desc: string;
  icons?: ReactNode;
  last?: boolean;
}) {
  const active = current === value;
  return (
    <label
      className={`flex cursor-pointer items-center gap-3 p-4 transition ${
        last ? "" : "border-b border-[var(--line)]"
      } ${active ? "bg-accent/8" : "hover:bg-black/[0.02]"}`}
    >
      <input
        type="radio"
        name="paymentMethod"
        value={value}
        checked={active}
        onChange={() => onSelect(value)}
        className="h-4 w-4 accent-[var(--color-accent-strong)]"
      />
      <span className="min-w-0 flex-1">
        <span className="block font-medium text-ink">{title}</span>
        <span className={`block text-sm text-muted transition-all ${active ? "max-h-10 opacity-100" : "max-h-0 overflow-hidden opacity-0"}`}>
          {desc}
        </span>
      </span>
      {icons}
    </label>
  );
}

function CardBrands() {
  const chip = "rounded bg-white px-1.5 py-0.5 text-[0.55rem] font-bold leading-none ring-1 ring-black/10";
  return (
    <span className="flex shrink-0 items-center gap-1">
      <span className={`${chip} text-[#1a1f71]`}>VISA</span>
      <span className={`${chip} text-[#eb001b]`}>MC</span>
      <span className={`${chip} text-[#006fcf]`}>AMEX</span>
    </span>
  );
}

function LockIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <rect x="4" y="11" width="16" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" strokeLinecap="round" />
    </svg>
  );
}
