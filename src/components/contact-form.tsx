"use client";

import { useActionState, useEffect } from "react";
import { sendContactMessage, type InboundState } from "@/app/(store)/inbound-actions";
import { CONTACT_VALIDATORS } from "@/lib/inbound-rules";
import { useToast } from "@/components/ui/toast";
import { AuthAlert, useAuthForm } from "@/components/auth/auth-field";
import { Field, bindControl, fieldControl as control, phoneChars } from "@/components/form/validated-field";

const initial: InboundState = {};

export function ContactForm({ topic, defaultSubject }: { topic?: string; defaultSubject?: string }) {
  const [state, formAction, pending] = useActionState(sendContactMessage, initial);
  const [formRef, f] = useAuthForm(formAction, state, CONTACT_VALIDATORS, {
    initial: defaultSubject ? { subject: defaultSubject } : {},
  });
  const bind = (name: string, filter?: (v: string) => string) => bindControl(f, name, filter);
  const toast = useToast();

  useEffect(() => {
    if (state.error) toast.error(state.error);
    else if (state.ok) toast.success("Responderemos em breve.", { title: "Mensagem enviada" });
  }, [state, toast]);

  if (state.ok) {
    return (
      <div className="flex flex-col items-center justify-center rounded-xl border border-[var(--line)] bg-cream-soft p-10 text-center">
        <h2 className="font-display text-2xl font-semibold text-ink">Obrigado pela sua mensagem!</h2>
        <p className="mt-2 text-muted">Recebemos seu contato e responderemos em breve.</p>
      </div>
    );
  }

  return (
    <form ref={formRef} action={formAction} onSubmit={f.onSubmit} noValidate className="space-y-4">
      {topic && <input type="hidden" name="topic" value={topic} />}
      <input type="text" name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" className="hidden" />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Seu nome" {...f.field("name")}>
          {(a11y) => <input {...a11y} {...bind("name")} autoComplete="name" maxLength={60} placeholder="Ex. Maria Silva" className={control} />}
        </Field>
        <Field label="E-mail" {...f.field("email")}>
          {(a11y) => (
            <input {...a11y} {...bind("email")} type="email" autoComplete="email" spellCheck={false} placeholder="voce@email.com.br" className={control} />
          )}
        </Field>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field label="Telefone (opcional)" hint="Ex. (11) 99999-9999" {...f.field("phone")}>
          {(a11y) => (
            <input {...a11y} {...bind("phone", phoneChars)} type="tel" inputMode="tel" autoComplete="tel" maxLength={20} placeholder="(11) 99999-9999" className={control} />
          )}
        </Field>
        <Field label="Assunto (opcional)" {...f.field("subject")}>
          {(a11y) => <input {...a11y} {...bind("subject")} maxLength={200} placeholder="Sobre o que você quer falar?" className={control} />}
        </Field>
      </div>
      <Field label="Sua mensagem" multiline {...f.field("message")}>
        {(a11y) => (
          <textarea {...a11y} {...bind("message")} rows={5} maxLength={5000} placeholder="Como podemos ajudar?" className={`${control} resize-y`} />
        )}
      </Field>
      {state.error && <AuthAlert>{state.error}</AuthAlert>}
      <button
        type="submit"
        disabled={pending}
        className="rounded-full bg-accent px-9 py-3 text-sm font-semibold uppercase tracking-[0.12em] text-brand-deep shadow-[0_14px_32px_-16px_rgba(15,23,42,0.4)] transition duration-300 hover:-translate-y-0.5 hover:bg-accent-soft disabled:opacity-60"
      >
        {pending ? "Enviando…" : "Enviar mensagem"}
      </button>
    </form>
  );
}
