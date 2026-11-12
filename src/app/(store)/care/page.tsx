import type { Metadata } from "next";
import { Emblem } from "@/components/brand/emblem";

export const metadata: Metadata = {
  alternates: { canonical: "/care" },
  title: "Ingredientes y cuidado",
  description: "Ingredientes, alergias y cómo disfrutar tu pedido de Inbramet en su punto.",
};

const TIPS = [
  {
    title: "Come mientras está caliente",
    body: "Los platos recién hechos se disfrutan mejor al momento. Si recoges en tienda, te avisamos apenas tu pedido esté listo.",
  },
  {
    title: "Ingredientes a la vista",
    body: "Cada plato detalla sus ingredientes en el menú. Si tienes dudas sobre un producto, pregúntanos antes de pedir.",
  },
  {
    title: "Alergias y restricciones",
    body: "Trabajamos con lácteos, huevo, maní, gluten (empanadas) y carnes de res, pollo y cerdo. Avísanos al confirmar tu pedido si tienes alguna alergia o restricción.",
  },
  {
    title: "Bebidas bien frías",
    body: "Nuestras bebidas salen directo de la cámara fría. Mantén el frío hasta servir para que conserven todo su sabor.",
  },
  {
    title: "Sobrantes y conservación",
    body: "Si te sobra algo, refrigéralo dentro de las 2 horas y consúmelo dentro de las siguientes 24. Recuerda recalentar bien antes de comer.",
  },
  {
    title: "¿Un problema con tu pedido?",
    body: "Escríbenos por WhatsApp con tu número de pedido y lo resolvemos. Tu compra está respaldada.",
  },
];

export default function CarePage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-16">
      <div className="text-center">
        <Emblem size={40} className="mx-auto text-brand" accent="var(--color-accent)" />
        <span className="eyebrow mt-3 block">Ayuda</span>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink">
          Ingredientes y cuidado
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted">
          Todo lo que necesitas saber para disfrutar tu pedido tal como salió de nuestra cocina.
        </p>
      </div>

      <div className="mt-12 grid gap-6 sm:grid-cols-2">
        {TIPS.map((t) => (
          <div key={t.title} className="rounded-xl border border-[var(--line)] bg-cream-soft p-6">
            <h2 className="font-display text-xl font-bold text-ink">{t.title}</h2>
            <p className="mt-2 text-sm text-ink/80">{t.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
