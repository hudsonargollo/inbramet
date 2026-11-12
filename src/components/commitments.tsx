import { Emblem } from "./brand/emblem";

const COMMITMENTS = [
  {
    title: "Hecho al momento",
    body: "Cocina criolla preparada al momento, con el sabor de siempre.",
    icon: <PlateIcon />,
  },
  {
    title: "Delivery y retiro",
    body: "Pide en línea y recíbelo en tu puerta o retíralo en tu sucursal Inbramet.",
    icon: <ScooterIcon />,
  },
  {
    title: "Precios claros",
    body: "Precios claros en bolivianos y porciones generosas, sin sorpresas al pagar.",
    icon: <TagIcon />,
  },
  {
    title: "Cerca de ti",
    body: "13 sucursales en Santa Cruz y atención directa por WhatsApp.",
    icon: <ChatIcon />,
  },
];

export function Commitments() {
  return (
    <section className="bg-brand py-20 text-light">
      <div className="mx-auto max-w-6xl px-5 text-center">
        <Emblem size={40} className="mx-auto text-accent-soft" />
        <span className="eyebrow mt-4 block text-accent-soft">Nuestro compromiso</span>
        <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          Tradición camba, bien servida
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-light/75">
          Inbramet: tradición camba desde 1986, hecha al momento y servida en 13 sucursales
          de Santa Cruz.
        </p>
      </div>

      <div className="mx-auto mt-12 grid max-w-5xl gap-4 px-5 sm:grid-cols-2">
        {COMMITMENTS.map((c) => (
          <div
            key={c.title}
            className="flex items-start gap-4 rounded-2xl border border-[rgba(255,204,4,0.25)] bg-[rgba(255,255,255,0.05)] p-6 text-left transition hover:border-accent-soft/60 hover:bg-[rgba(255,255,255,0.08)]"
          >
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-accent/15 text-accent-soft">
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

function PlateIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 17h16" />
      <path d="M5 17a7 7 0 0 1 14 0" />
      <path d="M12 10V8" />
      <path d="M10.5 8h3" />
      <path d="M3 20h18" />
    </svg>
  );
}
function ScooterIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="5.5" cy="17.5" r="2.5" />
      <circle cx="18.5" cy="17.5" r="2.5" />
      <path d="M8 17.5h5.5l2-5h3" />
      <path d="M14 12.5 12.8 8H10" />
      <path d="M15.5 8.5h3" />
      <path d="M6 12h3" />
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
