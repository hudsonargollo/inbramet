"use client";

import { useActionState, useEffect } from "react";
import { SunMark, Emblem } from "./brand/emblem";
import { useToast } from "@/components/ui/toast";
import { subscribe, type InboundState } from "@/app/(store)/inbound-actions";

const initial: InboundState = {};

export function Newsletter() {
  const [state, formAction, pending] = useActionState(subscribe, initial);
  const sent = Boolean(state.ok);
  const toast = useToast();

  useEffect(() => {
    if (state.error) toast.error(state.error);
    else if (state.ok) toast.success("Ya estás en la lista — gracias por sumarte a Inbramet.", { title: "Suscrito" });
  }, [state, toast]);

  return (
    <section className="bg-panel px-5 py-20">
      {/* Deep-green card floating on the light panel */}
      <div
        className="relative mx-auto max-w-3xl overflow-hidden rounded-2xl border border-[rgba(255,216,102,0.4)] px-6 py-12 text-center shadow-[0_40px_90px_-40px_rgba(0,0,0,0.5)] sm:px-14 sm:py-14"
        style={{ background: "linear-gradient(160deg, #1d3a0e 0%, #3c6e1b 55%, #4c8a23 100%)" }}
      >
        {/* accent glow */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "radial-gradient(60% 55% at 50% 0%, rgba(255,216,102,0.18), transparent 70%)",
          }}
        />
        {/* top accent + inner frame */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-transparent via-accent to-transparent" />
        <div className="pointer-events-none absolute inset-4 rounded-xl border border-[rgba(255,216,102,0.2)]" />
        {/* faint watermark */}
        <SunMark
          size={320}
          accent="transparent"
          className="pointer-events-none absolute -bottom-24 left-1/2 -translate-x-1/2 text-light/[0.06]"
        />

        <div className="relative">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-[rgba(255,216,102,0.45)] bg-[radial-gradient(circle,rgba(255,216,102,0.2),transparent_70%)] text-accent-soft">
            <Emblem size={32} color="currentColor" accent="var(--color-accent-soft)" />
          </span>
          <span className="mt-4 block text-xs font-semibold uppercase tracking-[0.28em] text-accent-soft">
            Novedades
          </span>
          <h2 className="mt-2 font-display text-3xl font-extrabold text-light sm:text-4xl">
            Novedades de la casa en tu correo
          </h2>
          <p className="mx-auto mt-3 max-w-md text-light/70">
            Recibe primero las novedades del menú, los platos de temporada y los beneficios
            del Club Camba.
          </p>

          {sent ? (
            <div className="mx-auto mt-7 flex max-w-sm items-center justify-center gap-2 rounded-full border border-[rgba(255,216,102,0.4)] bg-[rgba(255,255,255,0.05)] px-6 py-3.5 text-sm text-light">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent-soft)" strokeWidth="2.4">
                <path d="M5 12l5 5L20 6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              ¡Gracias por suscribirte!
            </div>
          ) : (
            <form action={formAction} className="mx-auto mt-7 flex max-w-md flex-col gap-3 sm:flex-row">
              <input type="hidden" name="source" value="newsletter" />
              <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
              <input
                type="email"
                name="email"
                required
                placeholder="Ingresa tu correo"
                aria-label="Correo electrónico"
                className="w-full rounded-full border border-[rgba(255,216,102,0.35)] bg-[rgba(255,255,255,0.06)] px-5 py-3.5 text-sm text-light outline-none transition placeholder:text-light/50 focus:border-accent-soft focus:bg-[rgba(255,255,255,0.1)]"
              />
              <button
                type="submit"
                disabled={pending}
                className="shrink-0 rounded-full bg-accent px-8 py-3.5 text-sm font-bold uppercase tracking-[0.08em] text-brand-deep transition hover:bg-accent-soft disabled:opacity-60"
              >
                {pending ? "Enviando…" : "Suscribirse"}
              </button>
            </form>
          )}

          <p className="mt-4 text-xs text-light/45">Sin spam. Solo novedades y beneficios de la casa.</p>
        </div>
      </div>
    </section>
  );
}
