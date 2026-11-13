import type { Metadata } from "next";
import { OrnateFrame } from "@/components/ornate-frame";
import { Emblem } from "@/components/brand/emblem";
import { CustomDesignForm } from "@/components/custom-design-form";
import { getStoreSettings } from "@/lib/settings";
import { whatsappUrl } from "@/lib/settings-shared";

export const metadata: Metadata = {
  alternates: { canonical: "/custom" },
  title: "Pedidos sob medida",
  description: "Mobiliário sob medida e pedidos em volume para escritórios, estabelecimentos e residências na Inbramet.",
};

const STEPS = [
  { n: "1", title: "Conte seu projeto", body: "Quais peças você precisa, em quais cores ou estofamentos e para qual prazo ou ambiente." },
  { n: "2", title: "Preparamos a proposta", body: "Alinhamos acabamentos, quantidades, orçamento e prazos de produção e entrega." },
  { n: "3", title: "Entrega no seu espaço", body: "Enviamos seu pedido pronto com acompanhamento direto até o endereço informado." },
];

export default async function CustomPage() {
  const settings = await getStoreSettings();
  return (
    <div className="bg-cream px-5 py-12">
      <OrnateFrame className="mx-auto max-w-4xl bg-panel">
        <div className="px-6 py-16 text-center sm:px-14">
          <Emblem size={48} className="mx-auto text-accent-strong" />
          <span className="eyebrow mt-4 block">Projetos, escritórios e volume</span>
          <h1 className="mt-2 font-display text-4xl font-semibold text-ink sm:text-5xl">
            Pedidos sob medida
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-ink/80">
            Montando uma sala de jantar, um escritório ou um espaço comercial? Fazemos orçamentos
            de jogos de mesas, cadeiras estofadas, bancos e banquetas com os acabamentos e quantidades
            que o seu ambiente precisa.
          </p>
          <a
            href="#design-request"
            className="mt-9 inline-block rounded-full bg-accent px-9 py-3.5 text-sm font-semibold uppercase tracking-[0.12em] text-brand-deep shadow-[0_14px_32px_-16px_rgba(230,255,87,0.75)] transition duration-300 hover:-translate-y-0.5 hover:bg-accent-soft"
          >
            Solicitar orçamento
          </a>
          <p className="mt-3 text-xs text-muted">
            Preencha um formulário breve para alinhar seu projeto com nossa equipe.
          </p>
        </div>
      </OrnateFrame>

      <section className="mx-auto mt-14 grid max-w-4xl gap-6 sm:grid-cols-3">
        {STEPS.map((s) => (
          <div
            key={s.n}
            className="rounded-lg border border-[var(--line)] bg-cream-soft p-7 text-center"
          >
            <div className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-brand font-display text-lg text-accent">
              {s.n}
            </div>
            <h3 className="mt-4 font-display text-xl font-semibold text-ink">{s.title}</h3>
            <p className="mt-2 text-sm text-muted">{s.body}</p>
          </div>
        ))}
      </section>

      <section
        id="design-request"
        className="mx-auto mt-14 max-w-4xl scroll-mt-28 rounded-2xl border border-[var(--line)] bg-cream-soft p-6 sm:p-10"
      >
        <div className="text-center">
          <span className="eyebrow">Passo 1</span>
          <h2 className="mt-2 font-display text-3xl font-semibold text-ink">Conte o que você precisa</h2>
          <p className="mx-auto mt-2 max-w-xl text-sm text-muted">
            Informe os detalhes principais — nossa equipe entrará em contato o quanto antes para alinhar disponibilidade, acabamentos e valores.
          </p>
        </div>
        <div className="mt-8">
          <CustomDesignForm whatsappUrl={whatsappUrl(settings) || undefined} />
        </div>
      </section>
    </div>
  );
}
