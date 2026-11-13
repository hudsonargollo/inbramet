import Link from "next/link";
import { Emblem } from "@/components/brand/emblem";

export const metadata = { title: "Página não encontrada", robots: { index: false } };

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-5 py-20 text-center">
      <Emblem size={52} className="text-accent-strong" />
      <p className="mt-6 font-display text-6xl font-bold text-accent-strong sm:text-7xl">404</p>
      <h1 className="mt-2 font-display text-3xl font-semibold text-ink sm:text-4xl">
        Não encontramos esta página
      </h1>
      <p className="mx-auto mt-3 max-w-md text-muted">
        A página que você procura pode ter sido movida ou não existir mais.
        Vamos voltar para a coleção principal.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Link
          href="/"
          className="rounded-full bg-accent px-8 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-brand-deep shadow-[0_14px_32px_-16px_rgba(230,255,87,0.75)] transition duration-300 hover:-translate-y-0.5 hover:bg-accent-soft"
        >
          Voltar ao início
        </Link>
        <Link
          href="/shop"
          className="rounded-full border border-[var(--line-strong)] px-8 py-3 text-sm font-medium uppercase tracking-[0.12em] text-ink transition hover:border-accent hover:text-accent-strong"
        >
          Explorar a coleção
        </Link>
      </div>
    </main>
  );
}
