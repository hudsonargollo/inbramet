// The store's brand mark — the Inbramet logo, a custom SVG mark (not a clip-art
// icon). Concept: a stacked form suggesting both furniture construction and a held
// form — a subtle "compass/arch" in a single geometric path. Single path,
// filled, geometric.
import type { SVGProps } from "react";

type MarkProps = SVGProps<SVGSVGElement> & {
  /** A warm gold accent for the "arch" ray; the mark carries its own slate. */
  accent?: string;
  size?: number; /** Default 28 */
};

const GOLD = "#E6FF57";
const INK = "#0F172A";

function Mark({ viewBox = "0 0 64 64", accent = GOLD, className, size = 28, ...props }: MarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox={viewBox}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      style={{ width: size, height: size }}
      {...props}
    >
      {/* stacked mark: base slab + arch/compass */}
      <rect x="6" y="48" width="52" height="10" rx="4" fill={INK} />
      <rect x="18" y="24" width="28" height="22" rx="5" fill={GOLD} />
      {/* arch/compass line suggesting a held form + construction */}
      <path
        d="M28 32 Q40 32 40 45 M28 44 Q28 34 20 34"
        stroke="var(--color-cream)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M44 24 L44 21 M18 24 L18 21"
        stroke="var(--color-cream)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function InbrametMark({ className = "", ...props }: MarkProps) {
  return <Mark className={className} {...props} />;
}

/** Icon-only tile (menu, favicon, app icons). Slate base + warm gold accent. */
export function InbrametIcon({ size = 28, className = "", ...props }: MarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className={className}
      style={{ width: size, height: size }}
      {...props}
    >
      <rect x="6" y="48" width="52" height="10" rx="4" fill={INK} />
      <rect x="18" y="24" width="28" height="22" rx="5" fill={GOLD} />
      <path
        d="M28 32 Q40 32 40 45 M28 44 Q28 34 20 34"
        stroke="var(--color-cream)"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M44 24 L44 21 M18 24 L18 21"
        stroke="var(--color-cream)"
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}

export const Emblem = InbrametMark;
export const SunMark = InbrametIcon;

