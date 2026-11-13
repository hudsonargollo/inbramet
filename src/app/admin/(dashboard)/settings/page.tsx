import { prisma, dbConfigured } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { getStoreSettings } from "@/lib/settings";
import { DbBanner } from "@/components/admin/db-banner";
import { DeleteButton } from "@/components/admin/delete-button";
import { StoreSettingsForms, PasswordForm, AddTeamMemberForm } from "@/components/admin/settings-forms";
import { removeTeamMember } from "./actions";

export const metadata = { title: "Configurações" };
export const dynamic = "force-dynamic";

const SECTIONS = [
  { id: "contact", label: "Contato" },
  { id: "social", label: "Redes sociais" },
  { id: "shipping", label: "Frete" },
  { id: "announcements", label: "Barra de avisos" },
  { id: "alerts", label: "Alertas" },
  { id: "account", label: "Minha conta" },
  { id: "team", label: "Equipe" },
];

async function loadTeam() {
  if (!dbConfigured) return { dbConnected: false, users: [] };
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: "asc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    return { dbConnected: true, users };
  } catch {
    return { dbConnected: false, users: [] };
  }
}

export default async function AdminSettingsPage() {
  const session = await requireAdmin();
  const [settings, team] = await Promise.all([getStoreSettings(), loadTeam()]);
  const isOwner = session.role === "ADMIN";
  const adminCount = team.users.filter((u) => u.role === "ADMIN").length;

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-ink">Configurações</h1>
      <p className="mt-1 text-sm text-muted">
        Dados da loja, frete, barra de avisos, sua senha e sua equipe. As alterações são aplicadas na loja imediatamente.
      </p>

      <nav className="mt-5 flex flex-wrap gap-2" aria-label="Seções de configurações">
        {SECTIONS.map((s) => (
          <a
            key={s.id}
            href={`#${s.id}`}
            className="rounded-full border border-[var(--line-strong)] px-3.5 py-1.5 text-xs font-medium text-ink transition hover:border-accent hover:text-accent-strong"
          >
            {s.label}
          </a>
        ))}
      </nav>

      <div className="mt-6 space-y-6">
        {!team.dbConnected && <DbBanner />}
        {!isOwner && (
          <p className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Você entrou como <strong>equipe operacional</strong>: apenas administradores podem alterar as
            configurações da loja e a equipe. Você ainda pode alterar sua própria senha abaixo.
          </p>
        )}

        <StoreSettingsForms settings={settings} canEdit={isOwner} />
        <PasswordForm />

        {/* Team */}
        <section
          id="team"
          className="scroll-mt-24 rounded-2xl border border-[var(--line)] bg-surface p-5 shadow-[0_10px_30px_-22px_rgba(15,23,42,0.35)] sm:p-6"
        >
          <h2 className="font-display text-xl font-semibold text-ink">Equipe</h2>
          <p className="mt-1 text-sm text-muted">
            Pessoas com acesso ao painel de gestão da Inbramet.
          </p>
          <ul className="mt-4 divide-y divide-[var(--line)]">
            {team.users.map((u) => {
              const isSelf = u.email === session.email;
              const lastAdmin = u.role === "ADMIN" && adminCount <= 1;
              return (
                <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
                  <div className="min-w-0">
                    <p className="font-medium text-ink">
                      {u.name || u.email}
                      {isSelf && <span className="ml-2 text-xs font-normal text-muted">(você)</span>}
                    </p>
                    <p className="text-xs text-muted">{u.email}</p>
                  </div>
                  <div className="flex flex-wrap items-center gap-4">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        u.role === "ADMIN" ? "bg-brand text-accent" : "bg-cream-soft text-ink"
                      }`}
                    >
                      {u.role === "ADMIN" ? "Administrador" : "Equipe"}
                    </span>
                    {isOwner && !isSelf && !lastAdmin && (
                      <DeleteButton
                        action={removeTeamMember.bind(null, u.id)}
                        label="Remover"
                        confirmText={`Remover ${u.email} da equipe? Esta pessoa perderá o acesso ao painel.`}
                      />
                    )}
                  </div>
                </li>
              );
            })}
          </ul>
        </section>

        {isOwner && <AddTeamMemberForm />}
      </div>
    </div>
  );
}
