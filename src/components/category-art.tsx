/** Line icons for furniture category tiles. */

type Props = { className?: string };

function Table({ className = "" }: Props) {
  return (
    <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <rect x="20" y="42" width="80" height="10" rx="3" strokeLinejoin="round" />
      <path d="M28 52v36M92 52v36M38 52v26M82 52v26" strokeLinecap="round" />
      <path d="M28 66h64" strokeWidth="1.5" opacity="0.55" strokeLinecap="round" />
    </svg>
  );
}

function Chair({ className = "" }: Props) {
  return (
    <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <path d="M40 28h40l-3 30H43l-3-30z" strokeLinejoin="round" />
      <path d="M36 58h48l4 10H32l4-10z" strokeLinejoin="round" />
      <path d="M38 68v26M82 68v26M44 68l-3 22M76 68l3 22" strokeLinecap="round" />
    </svg>
  );
}

function Bench({ className = "" }: Props) {
  return (
    <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <rect x="22" y="34" width="76" height="18" rx="3" strokeLinejoin="round" />
      <rect x="20" y="58" width="80" height="10" rx="3" strokeLinejoin="round" />
      <path d="M28 52v6M92 52v6M28 68v24M92 68v24M36 78h48" strokeLinecap="round" />
    </svg>
  );
}

function Stool({ className = "" }: Props) {
  return (
    <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      <ellipse cx="60" cy="36" rx="22" ry="7" />
      <path d="M44 42l-8 52M76 42l8 52M60 43v46" strokeLinecap="round" />
      <path d="M39 74h42" strokeLinecap="round" opacity="0.7" />
    </svg>
  );
}

function DiningSet({ className = "" }: Props) {
  return (
    <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="2" className={className} aria-hidden="true">
      {/* table */}
      <rect x="34" y="48" width="52" height="8" rx="2" strokeLinejoin="round" />
      <path d="M42 56v32M78 56v32" strokeLinecap="round" />
      {/* left & right chairs */}
      <path d="M18 42v46M18 64h14v24" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M102 42v46M102 64H88v24" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const MAP: Record<string, (p: Props) => React.ReactElement> = {
  mesas: Table,
  cadeiras: Chair,
  bancos: Bench,
  banquetas: Stool,
  conjuntos: DiningSet,
};

export function CategoryArt({ slug, className }: { slug: string; className?: string }) {
  const Art = MAP[slug] ?? DiningSet;
  return <Art className={className} />;
}
