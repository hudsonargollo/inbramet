import type { ReactNode } from "react";
import Link from "next/link";
import { SunMark } from "@/components/brand/emblem";

type Props = {
  children: ReactNode;
  /** Where the "back" link goes. Defaults to the storefront home. */
  backHref?: string;
  /** Label for the back link. */
  backLabel?: string;
  /** Small eyebrow line under the wordmark (e.g. a tagline). */
  eyebrow?: string;
};

// Auth layout: an immersive deep-brand stage with layered accent light and a
// thin accent frame, holding one premium floating cream card centered on top.
export function AuthShell({
  children,
  backHref = "/",
  backLabel = "Voltar para a loja",
  eyebrow = "Inbramet",
}: Props) {
  return (
    <section
      className="relative flex min-h-screen items-center justify-center overflow-hidden px-5 py-14"
      style={{ background: "linear-gradient(160deg, #0f172a 0%, #1e293b 55%, #0f172a 100%)" }}
    >
      {/* Layered accent light for depth */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(55% 45% at 50% -5%, rgba(230,255,87,0.12), transparent 70%), radial-gradient(50% 40% at 50% 105%, rgba(230,255,87,0.08), transparent 70%)",
        }}
      />
      {/* Faint brand watermark */}
      <SunMark
        size={520}
        className="pointer-events-none absolute -bottom-40 left-1/2 -translate-x-1/2 text-accent/[0.06]"
      />

      {/* Thin accent frame around the whole stage */}
      <div className="pointer-events-none absolute inset-4 rounded-[1.4rem] border border-[rgba(230,255,87,0.18)] sm:inset-6" />

      {/* Back link */}
      <Link
        href={backHref}
        className="group absolute left-6 top-6 z-10 inline-flex items-center gap-2 rounded-full border border-[rgba(230,255,87,0.28)] bg-[rgba(255,255,255,0.04)] px-4 py-2 text-xs font-medium uppercase tracking-[0.14em] text-light/85 backdrop-blur transition hover:border-accent hover:text-accent sm:left-10 sm:top-10"
      >
        <span className="transition-transform group-hover:-translate-x-0.5">‹</span>
        {backLabel}
      </Link>

      {/* Floating card */}
      <div className="animate-auth-in relative w-full max-w-md">
        <div className="relative overflow-hidden rounded-2xl border border-[rgba(230,255,87,0.35)] bg-cream p-8 shadow-[0_40px_90px_-40px_rgba(0,0,0,0.7)] sm:p-10">
          {/* Inner accent hairline frame */}
          <div className="pointer-events-none absolute inset-3 rounded-xl border border-[rgba(15,23,42,0.12)]" />
          {/* Top accent bar */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent" />

          <div className="relative">
            <div className="flex flex-col items-center text-center">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/products/inbramet-icon-transparent.png"
                alt="Inbramet"
                width={228}
                height={169}
                className="h-12 w-auto sm:h-14"
              />
              {eyebrow && (
                <span className="mt-2 text-[0.62rem] uppercase tracking-[0.32em] text-muted">
                  {eyebrow}
                </span>
              )}
              {/* Divider with center diamond */}
              <span className="mt-5 flex w-28 items-center gap-2">
                <span className="h-px flex-1 bg-gradient-to-r from-transparent to-[rgba(15,23,42,0.35)]" />
                <span className="h-1.5 w-1.5 rotate-45 bg-accent-strong" />
                <span className="h-px flex-1 bg-gradient-to-l from-transparent to-[rgba(15,23,42,0.35)]" />
              </span>
            </div>

            <div className="mt-6">{children}</div>
          </div>
        </div>
      </div>
    </section>
  );
}
