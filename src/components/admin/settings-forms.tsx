"use client";

import { useActionState, useEffect, useRef, useState, type ReactNode } from "react";
import { useToast } from "@/components/ui/toast";
import type { StoreSettings } from "@/lib/settings-shared";
import {
  saveContactSettings,
  saveSocialSettings,
  saveShippingSettings,
  saveAnnouncementSettings,
  saveAlertSettings,
  changePassword,
  addTeamMember,
  type SettingsState,
} from "@/app/admin/(dashboard)/settings/actions";

type Action = (prev: SettingsState, fd: FormData) => Promise<SettingsState>;

const input =
  "w-full rounded-lg border border-[var(--line-strong)] bg-surface px-3.5 py-2.5 text-sm text-ink outline-none transition focus:border-accent focus:ring-2 focus:ring-accent/25 disabled:opacity-60";
const labelCls = "mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-muted";
const saveBtn =
  "rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-brand-deep transition hover:bg-accent-soft disabled:opacity-60";

/** One settings card: a form wired to a server action with toast feedback. */
function Card({
  id,
  title,
  description,
  action,
  success,
  disabled,
  resetOnSuccess,
  children,
}: {
  id: string;
  title: string;
  description: string;
  action: Action;
  success: string;
  disabled?: boolean;
  resetOnSuccess?: boolean;
  children: (state: SettingsState) => ReactNode;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const toast = useToast();
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state.ok) {
      toast.success(success, { title: "Salvo" });
      if (resetOnSuccess) formRef.current?.reset();
    } else if (state.error) toast.error(state.error);
  }, [state, toast, success, resetOnSuccess]);

  return (
    <section id={id} className="scroll-mt-24 rounded-2xl border border-[var(--line)] bg-surface p-5 shadow-[0_10px_30px_-22px_rgba(15,23,42,0.35)] sm:p-6">
      <h2 className="font-display text-xl font-semibold text-ink">{title}</h2>
      <p className="mt-1 text-sm text-muted">{description}</p>
      <form ref={formRef} action={formAction} className="mt-5 space-y-4">
        <fieldset disabled={disabled || pending} className="space-y-4">
          {children(state)}
        </fieldset>
        {state.error && (
          <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
        )}
        {!disabled && (
          <div className="flex justify-end">
            <button type="submit" disabled={pending} className={saveBtn}>
              {pending ? "Salvando…" : "Salvar"}
            </button>
          </div>
        )}
      </form>
    </section>
  );
}

function Field({
  name,
  label,
  hint,
  defaultValue,
  type = "text",
  placeholder,
  required,
  autoComplete,
}: {
  name: string;
  label: string;
  hint?: string;
  defaultValue?: string | number;
  type?: string;
  placeholder?: string;
  required?: boolean;
  autoComplete?: string;
}) {
  const id = `set-${name}`;
  return (
    <div>
      <label htmlFor={id} className={labelCls}>
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        defaultValue={defaultValue}
        placeholder={placeholder}
        required={required}
        autoComplete={autoComplete}
        className={input}
      />
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}

export function StoreSettingsForms({ settings, canEdit }: { settings: StoreSettings; canEdit: boolean }) {
  const v = (state: SettingsState, key: string, fallback: string | number) => state.values?.[key] ?? fallback;
  const lock = !canEdit;

  return (
    <>
      <Card
        id="contact"
        title="Contato da loja"
        description="Exibido no rodapé, na página de contato e no chat de atendimento. Deixe um campo vazio para ocultá-lo."
        action={saveContactSettings}
        success="Dados de contato atualizados"
        disabled={lock}
      >
        {(s) => (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field name="email" label="E-mail" type="email" defaultValue={v(s, "email", settings.contact.email)} placeholder="contato@inbramet.com.br" />
            <Field name="phone" label="Telefone" defaultValue={v(s, "phone", settings.contact.phone)} placeholder="+55 11 99999-9999" />
            <Field
              name="whatsapp"
              label="Número de WhatsApp"
              defaultValue={v(s, "whatsapp", settings.contact.whatsapp)}
              placeholder="5511999999999"
              hint="Formato internacional, somente dígitos. Ativa o ícone de WhatsApp e o botão de chat."
            />
            <Field name="city" label="Cidade / região" defaultValue={v(s, "city", settings.contact.city)} placeholder="São Paulo, SP" />
            <div className="sm:col-span-2">
              <Field name="hours" label="Horário de atendimento" defaultValue={v(s, "hours", settings.contact.hours)} placeholder="Segunda a sábado · 09:00 às 19:00" />
            </div>
          </div>
        )}
      </Card>

      <Card
        id="social"
        title="Redes sociais"
        description="Ícones do rodapé e botão «Siga-nos» da página inicial. Use o link completo com https://; vazio = oculto."
        action={saveSocialSettings}
        success="Redes sociais atualizadas"
        disabled={lock}
      >
        {(s) => (
          <div className="grid gap-4">
            <Field name="instagram" label="Instagram" defaultValue={v(s, "instagram", settings.social.instagram)} placeholder="https://www.instagram.com/…" />
            <Field name="facebook" label="Facebook" defaultValue={v(s, "facebook", settings.social.facebook)} placeholder="https://www.facebook.com/…" />
            <Field name="tiktok" label="TikTok" defaultValue={v(s, "tiktok", settings.social.tiktok)} placeholder="https://www.tiktok.com/@…" />
          </div>
        )}
      </Card>

      <Card
        id="shipping"
        title="Frete e entrega"
        description="Usado no checkout (o total do pedido é calculado com estes valores) e nas páginas de frete, FAQ e produto."
        action={saveShippingSettings}
        success="Configurações de frete atualizadas"
        disabled={lock}
      >
        {(s) => (
          <div className="grid gap-4 sm:grid-cols-3">
            <Field name="flatFee" label="Valor do frete (R$)" type="number" defaultValue={v(s, "flatFee", settings.shipping.flatFee)} required />
            <Field
              name="freeThreshold"
              label="Frete grátis a partir de (R$)"
              type="number"
              defaultValue={v(s, "freeThreshold", settings.shipping.freeThreshold)}
              required
              hint="Use 0 para frete grátis em todos os pedidos."
            />
            <Field name="deliveryTime" label="Estimativa de entrega" hint="Texto orientativo (máx. 60 caracteres)." defaultValue={v(s, "deliveryTime", settings.shipping.deliveryTime)} required />
          </div>
        )}
      </Card>

      <Card
        id="announcements"
        title="Barra de avisos"
        description="A faixa que passa no topo da loja. Uma mensagem por linha (máx. 10). {freeThreshold} e {flatFee} inserem os valores atuais. Vazio = oculta."
        action={saveAnnouncementSettings}
        success="Barra de avisos atualizada"
        disabled={lock}
      >
        {(s) => (
          <div>
            <label htmlFor="set-announcements" className={labelCls}>
              Mensagens
            </label>
            <textarea
              id="set-announcements"
              name="announcements"
              rows={6}
              defaultValue={v(s, "announcements", settings.announcements.join("\n")) as string}
              className={input}
            />
          </div>
        )}
      </Card>

      <Card
        id="alerts"
        title="Estoque e notificações"
        description="Define quando um produto está com «estoque baixo» e para onde vão os e-mails de novos pedidos e contato (requer SMTP)."
        action={saveAlertSettings}
        success="Configurações de alertas atualizadas"
        disabled={lock}
      >
        {(s) => (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field
              name="lowStockThreshold"
              label="Alerta de estoque baixo em"
              type="number"
              defaultValue={v(s, "lowStockThreshold", settings.inventory.lowStockThreshold)}
              hint="Produtos com esta quantidade ou menos são sinalizados."
              required
            />
            <Field
              name="orderEmail"
              label="Enviar alertas de pedidos para"
              type="email"
              defaultValue={v(s, "orderEmail", settings.notifications.orderEmail)}
              placeholder="proprietario@exemplo.com.br"
            />
          </div>
        )}
      </Card>
    </>
  );
}

export function PasswordForm() {
  return (
    <Card
      id="account"
      title="Minha conta"
      description="Altere a senha que você usa para entrar neste painel."
      action={changePassword}
      success="Senha atualizada"
      resetOnSuccess
    >
      {() => (
        <div className="grid gap-4 sm:grid-cols-3">
          <Field name="current" label="Senha atual" type="password" required autoComplete="current-password" />
          <Field name="next" label="Nova senha" type="password" required autoComplete="new-password" hint="Pelo menos 10 caracteres." />
          <Field name="confirm" label="Repita a nova senha" type="password" required autoComplete="new-password" />
        </div>
      )}
    </Card>
  );
}

export function AddTeamMemberForm() {
  const [role, setRole] = useState<"STAFF" | "ADMIN">("STAFF");
  return (
    <Card
      id="team-add"
      title="Adicionar membro da equipe"
      description="A equipe operacional gerencia pedidos, estoque e produtos. Apenas administradores alteram configurações e membros da equipe."
      action={addTeamMember}
      success="Membro da equipe adicionado"
      resetOnSuccess
    >
      {(s) => (
        <div className="grid gap-4 sm:grid-cols-2">
          <Field name="name" label="Nome" defaultValue={s.ok ? "" : s.values?.name} />
          <Field name="email" label="E-mail" type="email" required defaultValue={s.ok ? "" : s.values?.email} />
          <Field name="password" label="Senha temporária" type="password" required autoComplete="new-password" hint="Pelo menos 10 caracteres: poderá alterar em Minha conta." />
          <div>
            <label htmlFor="set-role" className={labelCls}>
              Função
            </label>
            <select
              key={s.ok ? "reset" : s.values?.role ?? "STAFF"}
              id="set-role"
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value === "ADMIN" ? "ADMIN" : "STAFF")}
              className={input}
            >
              <option value="STAFF">Equipe operacional</option>
              <option value="ADMIN">Administrador</option>
            </select>
          </div>
        </div>
      )}
    </Card>
  );
}
