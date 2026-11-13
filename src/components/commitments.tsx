import { Emblem } from "./brand/emblem";

const COMMITMENTS = [
  {
    title: "Design e resistência",
    body: "Estruturas em aço, madeira maciça e polímero projetadas para o uso diário.",
    icon: <CraftIcon />,
  },
  {
    title: "Entrega programada",
    body: "Compre on-line com embalagem protegida e transporte especializado até o seu endereço.",
    icon: <TruckIcon />,
  },
  {
    title: "Preços transparentes",
    body: "Valores claros em R$ (Reais) e especificações completas, sem surpresas no fechamento.",
    icon: <TagIcon />,
  },
  {
    title: "Atendimento direto",
    body: "Suporte próximo pelo WhatsApp para ajudar na escolha das medidas e acabamentos ideais.",
    icon: <ChatIcon />,
  },
];

export function Commitments() {
  return (
    <section className="bg-brand py-20 text-light">
      <div className="mx-auto max-w-6xl px-5 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-cream shadow-[0_14px_30px_-16px_rgba(0,0,0,0.6)]">
          <Emblem size={30} />
        </span>
        <span className="eyebrow mt-4 block text-accent">Nosso compromisso</span>
        <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          Por que escolher a Inbramet
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-light/75">
          A Inbramet une design contemporâneo, materiais selecionados e atendimento dedicado para
          equipar sua sala de jantar, cozinha ou escritório.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-5xl gap-4 px-5 sm:grid-cols-2">
        {COMMITMENTS.map((c) => (
          <div
            key={c.title}
            className="flex items-start gap-4 rounded-2xl border border-[rgba(230,255,87,0.22)] bg-[rgba(255,255,255,0.04)] p-6 text-left transition hover:border-accent/60 hover:bg-[rgba(255,255,255,0.08)]"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent">
              {c.icon}
            </span>
            <span>
              <span className="block font-display text-lg font-bold">{c.title}</span>
              <span className="mt-1 block text-sm leading-relaxed text-light/70">{c.body}</span>
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}

function CraftIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 10h14l-1.2 8.5a1.5 1.5 0 0 1-1.5 1.3H7.7a1.5 1.5 0 0 1-1.5-1.3L5 10z" />
      <path d="M7 10V6a2 2 0 0 1 2-2h6a2 2 0 0 1 2 2v4" />
    </svg>
  );
}
function TruckIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 7h11v9H3z" />
      <path d="M14 10h4l3 3v3h-7v-6z" />
      <circle cx="7.5" cy="18" r="2" />
      <circle cx="17.5" cy="18" r="2" />
    </svg>
  );
}
function TagIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M3 12L12 3h8v8l-9 9-8-8z" strokeLinejoin="round" />
      <circle cx="16" cy="8" r="1.4" />
    </svg>
  );
}
function ChatIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
      <path d="M4 5h16v11H9l-5 4V5z" strokeLinejoin="round" />
      <path d="M8 10h8M8 13h5" strokeLinecap="round" />
    </svg>
  );
}
