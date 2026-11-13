import Link from "next/link";
import type { LoyaltySettings } from "@/lib/settings-shared";
import { pointRuleLabel, stampRuleLabel } from "@/lib/loyalty-shared";

export function ClubBand({ rules }: { rules: LoyaltySettings }) {
  if (!rules.enabled) return null;
  return (
    <section className="mx-auto max-w-6xl px-5 pb-20">
      <div className="relative overflow-hidden rounded-3xl bg-brand px-6 py-12 text-center text-light sm:px-12">
        <div
          className="pointer-events-none absolute inset-0 opacity-20"
          style={{
            background:
              "radial-gradient(60% 120% at 15% 0%, rgba(230,255,87,0.35), transparent 60%), radial-gradient(50% 110% at 90% 100%, rgba(230,255,87,0.22), transparent 65%)",
          }}
        />
        <div className="relative">
          <span className="text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-accent">
            {rules.name}
          </span>
          <h2 className="mt-3 font-display text-3xl font-extrabold tracking-tight text-balance sm:text-4xl">
            {stampRuleLabel(rules)}
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-sm text-light/75 sm:text-base">
            E além disso {pointRuleLabel(rules)}, resgatáveis na nossa loja de benefícios:
            kits de manutenção, bancos auxiliares e peças selecionadas.
          </p>
          <div className="mt-7 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/clube-inbramet"
              className="rounded-full bg-gradient-to-r from-accent-soft to-accent px-8 py-3 text-sm font-semibold uppercase tracking-[0.1em] text-brand transition hover:opacity-90"
            >
              Conhecer o clube
            </Link>
            <Link
              href="/shop"
              className="rounded-full border border-light/30 px-8 py-3 text-sm font-semibold text-light transition hover:border-accent hover:text-accent"
            >
              Ver catálogo
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
