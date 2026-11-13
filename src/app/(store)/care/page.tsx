import type { Metadata } from "next";
import { Emblem } from "@/components/brand/emblem";

export const metadata: Metadata = {
  alternates: { canonical: "/care" },
  title: "Materiais e cuidados",
  description: "Guia de materiais, estofados e manutenção para conservar seus móveis Inbramet sempre novos.",
};

const TIPS = [
  {
    title: "Limpeza de estofados",
    body: "Aspire suavemente o pó toda semana. Em caso de derramamentos, seque na hora com um pano limpo sem esfregar e utilize água morna com sabão neutro.",
  },
  {
    title: "Superfícies e estruturas",
    body: "Limpe mesas e bases com um pano de microfibra levemente umedecido. Evite esponjas abrasivas, solventes ou produtos com cloro.",
  },
  {
    title: "Proteção contra sol direto",
    body: "A exposição prolongada ao sol direto pode alterar a tonalidade dos tecidos com o tempo. Posicione as peças estofadas longe de fontes intensas de calor ou umidade.",
  },
  {
    title: "Verificação de ferragens",
    body: "Em cadeiras, bancos e banquetas de uso diário, vale conferir o aperto dos parafusos a cada poucos meses para manter a firmeza original.",
  },
  {
    title: "Cuidado com o piso",
    body: "Recomendamos utilizar protetores de feltro nos pés caso as peças fiquem sobre madeira maciça ou pisos delicados.",
  },
  {
    title: "Precisa de suporte ou peças?",
    body: "Fale conosco pelo WhatsApp informando o número do seu pedido para receber orientações específicas ou assistência.",
  },
];

export default function CarePage() {
  return (
    <div className="mx-auto max-w-4xl px-5 py-16">
      <div className="text-center">
        <Emblem size={40} className="mx-auto text-brand" accent="var(--color-accent)" />
        <span className="eyebrow mt-3 block">Ajuda</span>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink">
          Materiais e cuidados
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-muted">
          Recomendações simples para preservar a textura, a cor e a estabilidade dos seus móveis Inbramet.
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
