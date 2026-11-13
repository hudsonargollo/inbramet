import type { Metadata } from "next";
import Link from "next/link";
import { Emblem } from "@/components/brand/emblem";
import { formatPrice } from "@/lib/format";
import { getStoreSettings } from "@/lib/settings";

export const metadata: Metadata = {
  alternates: { canonical: "/shipping" },
  title: "Envios e devoluções",
  description: "Entrega em domicílio Inbramet: valores de frete, prazos estimados e política de trocas e devoluções.",
};

export default async function ShippingPage() {
  const { flatFee: FLAT_SHIPPING, freeThreshold: FREE_SHIPPING_THRESHOLD, deliveryTime: DELIVERY_TIME } = (
    await getStoreSettings()
  ).shipping;
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <div className="text-center">
        <Emblem size={40} className="mx-auto text-brand" accent="var(--color-accent)" />
        <span className="eyebrow mt-3 block">Ajuda</span>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink">
          Envios e devoluções
        </h1>
      </div>

      <div className="mt-12 space-y-10">
        <section>
          <h2 className="font-display text-2xl font-bold text-ink">Entrega em domicílio</h2>
          <ul className="mt-4 space-y-3 text-ink/80">
            <li>• Entrega coordenada diretamente pela nossa central on-line. Prazo estimado: {DELIVERY_TIME} conforme disponibilidade, volume e distância.</li>
            <li>
              • Valor do frete: <strong>{formatPrice(FLAT_SHIPPING)}</strong>
              {FREE_SHIPPING_THRESHOLD > 0 ? (
                <> — <strong>grátis</strong> em pedidos a partir de {formatPrice(FREE_SHIPPING_THRESHOLD)}.</>
              ) : (
                <> — e <strong>grátis</strong> em todos os pedidos da Inbramet.</>
              )}
            </li>
            <li>• Conferimos cada peça cuidadosamente antes da expedição.</li>
            <li>• Você recebe o código e as atualizações do envio diretamente no seu e-mail.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-2xl font-bold text-ink">Trocas e devoluções</h2>
          <ul className="mt-4 space-y-3 text-ink/80">
            <li>• Se o seu móvel chegar com avaria de transporte ou peça faltante, fale conosco informando o número do pedido em até 48 horas.</li>
            <li>• Queremos seus ambientes impecáveis. Analisamos cada solicitação com prioridade para resolver rapidamente.</li>
            <li>• Envie uma foto da embalagem ou do detalhe, se possível: isso agiliza a troca ou reposição.</li>
            <li>• Combinamos com você a coleta ou substituição mais prática.</li>
          </ul>
        </section>

        <section className="rounded-xl border border-[var(--line)] bg-cream-soft p-6 text-sm text-muted">
          Precisa de ajuda com um pedido? Escreva pela{" "}
          <Link href="/contact" className="text-accent-strong hover:underline">
            página de contato
          </Link>{" "}
          informando o número do seu pedido.
        </section>
      </div>
    </div>
  );
}
