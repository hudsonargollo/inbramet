// The store's brand mark — the Inbramet logo. `SunMark` is the line-art
// sun from the logo, used for faint decorative watermarks where the
// full-colour mark would be too heavy.

type MarkProps = {
  size?: number;
  className?: string;
  /** Kept for call sites that still pass a colour; the logo carries its own. */
  color?: string;
  /** Highlight used by the sun watermark (rays). */
  accent?: string;
};

export function Emblem({ size = 44, className = "" }: MarkProps) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src="/images/inbramet-icon.png"
      alt=""
      width={size}
      height={size}
      aria-hidden="true"
      className={`shrink-0 rounded-[22%] object-cover ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

export function SunMark({
  size = 44,
  className = "",
  color = "currentColor",
  accent = "var(--color-accent)",
}: MarkProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      className={className}
      aria-hidden="true"
    >
      {/* sun disc */}
      <circle cx="32" cy="32" r="13" stroke={color} strokeWidth="3.2" />
      {/* rays */}
      <path
        d="M32 8v7M32 49v7M8 32h7M49 32h7M15 15l5 5M44 44l5 5M49 15l-5 5M20 44l-5 5"
        stroke={accent}
        strokeWidth="3"
        strokeLinecap="round"
      />
    </svg>
  );
}
