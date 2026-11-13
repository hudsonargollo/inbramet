import type { Metadata } from "next";
import Link from "next/link";
import { Emblem } from "@/components/brand/emblem";
import { SplitText } from "@/components/text-reveal";

export const metadata: Metadata = {
  alternates: { canonical: "/about" },
  title: "Sobre nós",
  description: "Inbramet — móveis pensados para a vida real, feitos com cuidado e entregues sem complicação.",
};

const PILLARS = [
  { title: "Design funcional", body: "Cada peça é projetada pensando em ergonomia, equilíbrio visual e uso no dia a dia." },
  { title: "Acabamentos duráveis", body: "Tecidos de alta resistência, estruturas firmes e encaixes testados para durar anos." },
  { title: "Entrega para todo o Brasil", body: "Enviamos seus móveis com segurança até o seu endereço com acompanhamento direto." },
];

export default function AboutPage() {
  return (
    <div className="bg-cream px-5 py-12">
      <div className="mx-auto max-w-4xl overflow-hidden rounded-2xl border border-[var(--line)] bg-panel">
        <div className="px-6 py-16 text-center sm:px-14">
          <Emblem size={52} className="mx-auto text-brand" accent="var(--color-accent)" />
          <span className="eyebrow mt-5 block">Nossa história</span>
          <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink text-balance sm:text-5xl">
            <SplitText text="Design" />{" "}
            <span className="brand-text">para a vida real</span>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-pretty text-ink/80">
            Cada peça nasce de uma ideia clara: ser útil, resistente e manter o visual
            bonito sem pressa. Reunimos os móveis que mais valorizamos para acompanhar a rotina
            da sua casa ou empresa.
          </p>
          <p className="mx-auto mt-4 max-w-2xl text-pretty text-ink/80">
            Oferecemos mesas, cadeiras estofadas, bancos, banquetas e conjuntos completos
            para salas de jantar, cozinhas e escritórios. Cada pedido é preparado com atenção
            e enviado até a sua porta.
          </p>
          <Link
            href="/shop"
            className="mt-7 inline-block rounded-full bg-accent px-8 py-3 text-sm font-semibold text-brand-deep shadow-[0_14px_32px_-16px_rgba(230,255,87,0.75)] transition duration-300 hover:-translate-y-0.5 hover:bg-accent-soft"
          >
            Ver a coleção
          </Link>
        </div>
      </div>

      <section className="mx-auto mt-16 grid max-w-4xl gap-8 sm:grid-cols-3">
        {PILLARS.map((p) => (
          <div key={p.title} className="text-center">
            <h3 className="font-display text-xl font-bold text-ink">{p.title}</h3>
            <p className="mt-2 text-sm text-muted">{p.body}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
