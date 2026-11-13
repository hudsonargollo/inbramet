"use client";

import { useActionState, useEffect } from "react";
import { subscribe, type InboundState } from "@/app/(store)/inbound-actions";
import { useToast } from "@/components/ui/toast";

const initial: InboundState = {};

export function NotifyForm({ slug, label }: { slug: string; label: string }) {
  const [state, formAction, pending] = useActionState(subscribe, initial);
  const toast = useToast();

  useEffect(() => {
    if (state.error) toast.error(state.error);
    else if (state.ok) toast.success(`Avisaremos quando chegar ${label.toLowerCase()}.`, { title: "Você está na lista" });
  }, [state, toast, label]);

  if (state.ok) {
    return <p className="text-sm text-accent-strong">Pronto! Avisaremos assim que chegar.</p>;
  }

  return (
    <form action={formAction} className="mx-auto flex w-full max-w-md flex-col gap-3 sm:flex-row">
      <input type="hidden" name="source" value={`notify:${slug}`} />
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <input
        type="email"
        name="email"
        required
        placeholder="Seu e-mail"
        aria-label="Endereço de e-mail"
        className="w-full rounded-full border border-[var(--line-strong)] bg-cream-soft px-5 py-3 text-sm outline-none focus:border-accent"
      />
      <button
        type="submit"
        disabled={pending}
        className="shrink-0 rounded-full border border-[var(--line-strong)] px-8 py-3 text-sm text-ink transition hover:border-accent hover:text-accent-strong disabled:opacity-60"
      >
        {pending ? "Salvando…" : "Avise-me"}
      </button>
    </form>
  );
}
