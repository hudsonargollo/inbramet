"use client";

import { useActionState } from "react";
import Link from "next/link";
import {
  requestPasswordResetAction,
  resetPasswordAction,
  type AuthState,
} from "@/app/(store)/auth-actions";
import { AuthShell } from "@/components/auth/auth-shell";
import { AuthAlert, AuthField, AuthSubmit, PasswordStrength, useAuthForm } from "@/components/auth/auth-field";
import { emailError, newPasswordError } from "@/lib/auth-rules";

const initial: AuthState = {};

export function ForgotPasswordForm() {
  const [state, formAction, pending] = useActionState(requestPasswordResetAction, initial);
  const [formRef, f] = useAuthForm(formAction, state, { email: emailError });

  return (
    <AuthShell backHref="/login" backLabel="Voltar para o login">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold text-ink">Esqueci minha senha</h1>
        <p className="mt-1 text-sm text-muted">Enviaremos um link por e-mail para você criar uma nova.</p>
      </div>

      {state.ok ? (
        <div className="mt-7 rounded-xl border border-ok/40 bg-ok/[0.07] px-4 py-4 text-center text-sm text-ink">
          <p className="font-display text-lg font-semibold text-ok">Verifique seu e-mail</p>
          <p className="mt-1">{state.message}</p>
        </div>
      ) : (
        <form ref={formRef} action={formAction} onSubmit={f.onSubmit} noValidate className="mt-7 space-y-5">
          <AuthField
            name="email"
            label="E-mail"
            icon="mail"
            type="email"
            autoComplete="email"
            placeholder="voce@email.com.br"
            {...f.bind("email")}
            {...f.field("email")}
          />
          {state.error && <AuthAlert>{state.error}</AuthAlert>}
          <AuthSubmit pending={pending} label="Enviar link" pendingLabel="Enviando…" />
        </form>
      )}

      <p className="mt-6 text-center text-sm text-muted">
        Lembrou a senha?{" "}
        <Link href="/login" className="font-semibold text-accent-strong hover:underline">
          Entrar
        </Link>
      </p>
    </AuthShell>
  );
}

export function ResetPasswordForm({ token }: { token: string }) {
  const [state, formAction, pending] = useActionState(resetPasswordAction, initial);
  const [formRef, f] = useAuthForm(formAction, state, { password: newPasswordError });
  const password = f.field("password");

  return (
    <AuthShell backHref="/login" backLabel="Voltar para o login">
      <div className="text-center">
        <h1 className="font-display text-3xl font-bold text-ink">Escolha uma nova senha</h1>
        <p className="mt-1 text-sm text-muted">Você entrará na sua conta logo em seguida.</p>
      </div>

      {token ? (
        <form ref={formRef} action={formAction} onSubmit={f.onSubmit} noValidate className="mt-7 space-y-5">
          <input type="hidden" name="token" value={token} />
          <AuthField
            name="password"
            label="Nova senha"
            icon="lock"
            password
            autoComplete="new-password"
            placeholder="Crie uma senha"
            {...f.bind("password")}
            {...password}
          >
            <PasswordStrength value={f.value("password")} highlight={password.status === "invalid"} />
          </AuthField>
          {state.error && <AuthAlert>{state.error}</AuthAlert>}
          <AuthSubmit pending={pending} label="Atualizar senha" pendingLabel="Salvando…" />
        </form>
      ) : (
        <div className="mt-7">
          <AuthAlert>
            Este link de recuperação está incompleto.{" "}
            <Link href="/forgot-password" className="font-semibold underline">
              Solicitar um novo
            </Link>
            .
          </AuthAlert>
        </div>
      )}
    </AuthShell>
  );
}
