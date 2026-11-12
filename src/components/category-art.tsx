/** Line icons for menu category tiles. */

type Props = { className?: string };

function Plate({ className = "" }: Props) {
  return (
    <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      {/* plate */}
      <ellipse cx="60" cy="74" rx="38" ry="14" />
      <ellipse cx="60" cy="72" rx="26" ry="8" strokeWidth="1.5" opacity="0.55" />
      {/* rice mound */}
      <path d="M44 68c0-9 7-15 16-15s16 6 16 15" strokeLinejoin="round" />
      <path d="M53 60h1M61 56h1M69 60h1" strokeLinecap="round" opacity="0.6" />
    </svg>
  );
}

function Grill({ className = "" }: Props) {
  return (
    <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      {/* steak */}
      <path d="M32 60c0-14 12-24 28-24s28 10 28 24-12 24-28 24-28-10-28-24z" strokeLinejoin="round" />
      {/* grill marks */}
      <path d="M46 50l8 18M60 46l8 24M74 50l8 14" strokeLinecap="round" opacity="0.7" />
      {/* heat */}
      <path d="M48 26c0-4 4-4 4-8M60 26c0-4 4-4 4-8M72 26c0-4 4-4 4-8" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

function Empanada({ className = "" }: Props) {
  return (
    <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      {/* turnover */}
      <path d="M28 74c0-20 14-34 32-34s32 14 32 34H28z" strokeLinejoin="round" />
      {/* crimped edge */}
      <path d="M34 74l4-6M44 74l4-6M54 74l4-6M64 74l4-6M74 74l4-6M84 74l4-6" strokeLinecap="round" opacity="0.65" />
      {/* steam */}
      <path d="M50 30c0-4 4-4 4-8M62 30c0-4 4-4 4-8" strokeLinecap="round" opacity="0.5" />
    </svg>
  );
}

function Bowl({ className = "" }: Props) {
  return (
    <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      {/* bowl */}
      <path d="M28 64h64c0 16-12 28-32 28S28 80 28 64z" strokeLinejoin="round" />
      <path d="M24 64h72" strokeLinecap="round" />
      {/* steam */}
      <path d="M48 48c0-5 4-5 4-10M60 48c0-5 4-5 4-10M72 48c0-5 4-5 4-10" strokeLinecap="round" opacity="0.6" />
      {/* base */}
      <path d="M48 96h24" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

function Leaf({ className = "" }: Props) {
  return (
    <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path d="M38 84c0-26 17-43 46-47-2 29-19 47-46 47z" strokeLinejoin="round" />
      <path d="M44 78c9-13 20-24 32-32" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

function Fries({ className = "" }: Props) {
  return (
    <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      {/* fries */}
      <path d="M44 54V26M54 52V20M64 52V24M74 54V30" strokeLinecap="round" />
      <path d="M82 58l4-16M38 58l-4-14" strokeLinecap="round" opacity="0.8" />
      {/* carton */}
      <path d="M34 54h52l-6 44a6 6 0 0 1-6 5H46a6 6 0 0 1-6-5l-6-44z" strokeLinejoin="round" />
      <path d="M44 72h32" strokeWidth="1.5" opacity="0.55" strokeLinecap="round" />
    </svg>
  );
}

function Dessert({ className = "" }: Props) {
  return (
    <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      {/* cup */}
      <path d="M38 58h44l-5 36a6 6 0 0 1-6 5H49a6 6 0 0 1-6-5l-5-36z" strokeLinejoin="round" />
      {/* layers */}
      <path d="M41 72h38M43 86h34" strokeWidth="1.5" opacity="0.55" />
      {/* swirl */}
      <path d="M42 58c2-8 8-12 18-12s16 5 18 12" strokeLinejoin="round" />
      <path d="M50 46c2-6 6-9 10-9s8 3 10 9" strokeLinejoin="round" opacity="0.8" />
      <path d="M60 37v-8" strokeLinecap="round" />
      {/* spoon */}
      <ellipse cx="88" cy="34" rx="6" ry="8" />
      <path d="M88 42v10" strokeLinecap="round" />
    </svg>
  );
}

function Drink({ className = "" }: Props) {
  return (
    <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      {/* cup */}
      <path d="M40 38h40l-5 56a6 6 0 0 1-6 5H51a6 6 0 0 1-6-5l-5-56z" strokeLinejoin="round" />
      {/* lid */}
      <path d="M36 38h48v-6a3 3 0 0 0-3-3H39a3 3 0 0 0-3 3v6z" strokeLinejoin="round" />
      {/* straw */}
      <path d="M62 29l6-17" strokeLinecap="round" />
      {/* band */}
      <path d="M42 62h36" strokeWidth="1.5" opacity="0.55" />
      {/* bubbles */}
      <path d="M52 80c3-3 6-2 6 1s-4 5-6 3" opacity="0.6" strokeLinecap="round" />
    </svg>
  );
}

function Star({ className = "" }: Props) {
  return (
    <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      {/* star */}
      <path
        d="M60 20l11.6 23.5 25.9 3.8-18.7 18.2 4.4 25.8L60 78.1 36.8 91.3l4.4-25.8-18.7-18.2 25.9-3.8L60 20z"
        strokeLinejoin="round"
      />
      {/* flame flicker */}
      <path d="M60 46c3 5 5 8 5 12a5 5 0 0 1-10 0c0-4 2-7 5-12z" strokeLinejoin="round" opacity="0.7" />
    </svg>
  );
}

function Fallback({ className = "" }: Props) {
  return <Plate className={className} />;
}

const MAP: Record<string, (p: Props) => React.ReactElement> = {
  entrada: Star,
  empanadas: Empanada,
  sopas: Bowl,
  "platos-tipicos-y-combinados": Plate,
  parrilla: Grill,
  "plato-vegetariano": Leaf,
  "menu-de-ninos": Star,
  agregados: Fries,
  postres: Dessert,
  bebidas: Drink,
};

export function CategoryArt({ slug, className }: { slug: string; className?: string }) {
  const Art = MAP[slug] ?? Fallback;
  return <Art className={className} />;
}