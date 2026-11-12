import type { Metadata } from "next";
import Link from "next/link";
import { Emblem } from "@/components/brand/emblem";
import { getStoreSettings } from "@/lib/settings";
import { AccordionItem } from "@/components/ui/accordion-item";

export const metadata: Metadata = {
  alternates: { canonical: "/faq" },
  title: "Preguntas frecuentes",
  description: "Respuestas sobre pedidos, platos, delivery, retiro y pagos en Inbramet, Santa Cruz, Bolivia.",
};

const faqs = (DELIVERY_TIME: string) => [
  {
    q: "¿Cómo hago un pedido?",
    a: "Elige tu sucursal, arma tu pedido desde el menú y confirma el pedido. Puedes pagar contra entrega o de forma segura en línea.",
  },
  {
    q: "¿Qué métodos de pago aceptan?",
    a: "Pago contra entrega en tu sucursal Inbramet, y pagos en línea con tarjeta o billetera a través de nuestras pasarelas.",
  },
  {
    q: "¿Cuánto tarda el delivery?",
    a: `Hacemos delivery en Santa Cruz. Entrega estimada: ${DELIVERY_TIME}. El tiempo puede variar según la preparación, la demanda y la distancia. Cuidamos tu pedido desde la cocina hasta tu puerta. Si necesitas coordinar la entrega, escríbenos por WhatsApp.`,
  },
  {
    q: "¿Puedo retirar en tienda?",
    a: "Sí. Al finalizar el pedido elige retiro en sucursal y te avisamos por WhatsApp cuando esté listo, sin costo adicional.",
  },
  {
    q: "¿Tienen opciones para compartir?",
    a: "Sí. Los buffets y parrillas para 2 o 4 personas están pensados para compartir. Mira los platos típicos y la parrilla del menú.",
  },
  {
    q: "¿Cuál es la política de devoluciones?",
    a: "Nos importa que disfrutes tu comida. Si tu pedido llega incompleto o en mal estado, contáctanos con tu número de pedido y cuéntanos qué pasó. Lo revisamos con cuidado y lo más rápido posible para coordinar contigo la solución más adecuada. Consulta Delivery y devoluciones.",
  },
  {
    q: "¿Entregan en mi zona?",
    a: "Entregamos en Santa Cruz desde nuestras 13 sucursales. Si tienes dudas sobre tu dirección, consúltanos por WhatsApp antes de pedir.",
  },
];

export default async function FaqPage() {
  const FAQS = faqs((await getStoreSettings()).shipping.deliveryTime);
  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <div className="text-center">
        <Emblem size={40} className="mx-auto text-brand" accent="var(--color-accent)" />
        <span className="eyebrow mt-3 block">Ayuda</span>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink">
          Preguntas frecuentes
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
        ¿Sigues con dudas?{" "}
        <Link href="/contact" className="text-accent-strong hover:underline">
          Contáctanos
        </Link>
        .
      </p>
    </div>
  );
}
