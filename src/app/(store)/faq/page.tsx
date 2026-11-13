import type { Metadata } from "next";
import Link from "next/link";
import { Emblem } from "@/components/brand/emblem";
import { getStoreSettings } from "@/lib/settings";
import { AccordionItem } from "@/components/ui/accordion-item";

export const metadata: Metadata = {
  alternates: { canonical: "/faq" },
  title: "Perguntas frequentes",
  description: "Respostas sobre móveis, entregas, prazos e formas de pagamento na Inbramet.",
};

const faqs = (DELIVERY_TIME: string) => [
  {
    q: "Como faço um pedido?",
    a: "Escolha os móveis da coleção que você precisa, adicione ao carrinho e finalize seu pedido. Você pode pagar na entrega ou on-line com segurança.",
  },
  {
    q: "Quais formas de pagamento vocês aceitam?",
    a: "Pagamento na entrega ao receber seus móveis, além de cartões de crédito/débito e carteiras digitais nos meios on-line disponíveis.",
  },
  {
    q: "Quanto tempo leva a entrega?",
    a: `Coordenamos os envios da nossa loja on-line com prazo estimado de ${DELIVERY_TIME}. O tempo pode variar conforme estoque, volume do pedido e região de entrega.`,
  },
  {
    q: "Vocês atendem pedidos em todo o Brasil?",
    a: "Sim. Realizamos entregas para diversas regiões do Brasil. Caso tenha dúvidas sobre cobertura ou prazos específicos para o seu CEP, fale conosco pelo WhatsApp.",
  },
  {
    q: "Vocês vendem conjuntos ou pedidos em volume?",
    a: "Sim. Temos conjuntos de mesa com quatro cadeiras e também fazemos orçamentos para escritórios, cafés, restaurantes e projetos na seção Pedidos sob medida.",
  },
  {
    q: "Qual é a política de trocas e devoluções?",
    a: "Se alguma peça chegar com avaria de transporte ou item faltante, entre em contato em até 48 horas informando o número do pedido. Analisamos com prioridade para realizar a troca ou reposição.",
  },
  {
    q: "Como sei se o produto tem estoque disponível?",
    a: "Cada produto exibe a disponibilidade atualizada em tempo real na página da coleção e nos detalhes do item.",
  },
];

export default async function FaqPage() {
  const FAQS = faqs((await getStoreSettings()).shipping.deliveryTime);
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <div className="text-center">
        <Emblem size={40} className="mx-auto text-brand" accent="var(--color-accent)" />
        <span className="eyebrow mt-3 block">Ajuda</span>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink">
          Perguntas frequentes
        </h1>
      </div>

      <div className="mt-12 divide-y divide-[var(--line)] border-y border-[var(--line)]">
        {FAQS.map((item) => (
          <AccordionItem
            key={item.q}
            title={item.q}
            group="faq"
            className="py-4"
            summaryClassName="font-display text-lg text-ink"
            icon={
              <span
                aria-hidden="true"
                className="shrink-0 text-xl leading-none text-accent-strong transition-transform duration-[420ms] ease-[cubic-bezier(0.22,1,0.36,1)] group-data-[state=open]:rotate-45"
              >
                +
              </span>
            }
          >
            <p className="pt-3 text-sm leading-relaxed text-ink/80">{item.a}</p>
          </AccordionItem>
        ))}
      </div>

      <p className="mt-10 text-center text-sm text-muted">
        Ainda tem dúvidas?{" "}
        <Link href="/contact" className="text-accent-strong hover:underline">
          Fale conosco
        </Link>
        .
      </p>
    </div>
  );
}
