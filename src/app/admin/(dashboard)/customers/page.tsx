import { getAdminCustomers } from "@/lib/admin-data";
import { formatPrice, formatDate } from "@/lib/format";
import { DbBanner } from "@/components/admin/db-banner";
import { requireAdmin, scopeBranchId } from "@/lib/admin";

export const metadata = { title: "Clientes" };

export const dynamic = "force-dynamic";

export default async function AdminCustomersPage() {
  const session = await requireAdmin(); // layouts don't re-run on client navigation
  const { dbConnected, customers } = await getAdminCustomers(scopeBranchId(session));

  return (
    <div>
      <h1 className="font-display text-3xl font-bold text-ink">Clientes</h1>
      <p className="mt-1 text-sm text-muted">Clientes cadastrados e histórico de pedidos.</p>

      <div className="mt-6">
        {!dbConnected && <DbBanner />}

        {customers.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-[var(--line)] bg-surface py-16 text-center">
            <p className="font-display text-xl text-ink">Ainda não há clientes</p>
            <p className="mt-1 text-sm text-muted">
              As contas criadas no checkout ou no cadastro aparecerão aqui.
            </p>
          </div>
        ) : (
          <div className="rounded-2xl border border-[var(--line)] bg-surface shadow-[0_10px_30px_-22px_rgba(15,23,42,0.35)]">
            {/* Desktop table */}
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--line)] text-left text-[0.68rem] uppercase tracking-wider text-muted">
                    <th className="px-4 py-3 font-medium">Cliente</th>
                    <th className="px-4 py-3 font-medium">Telefone</th>
                    <th className="px-4 py-3 font-medium">Pedidos</th>
                    <th className="px-4 py-3 text-right font-medium">Total gasto</th>
                    <th className="px-4 py-3 font-medium">Cadastro</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id} className="border-b border-[var(--line)] last:border-0 hover:bg-cream-soft">
                      <td className="px-4 py-3">
                        <span className="block font-medium text-ink">{c.name}</span>
                        <span className="block text-xs text-muted">{c.email}</span>
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted">{c.phone || "—"}</td>
                      <td className="px-4 py-3 text-ink">{c.orders}</td>
                      <td className="px-4 py-3 text-right font-medium text-ink [font-variant-numeric:tabular-nums]">
                        {formatPrice(c.spent)}
                      </td>
                      <td className="whitespace-nowrap px-4 py-3 text-muted">{formatDate(c.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile cards */}
            <div className="divide-y divide-[var(--line)] sm:hidden">
              {customers.map((c) => (
                <div key={c.id} className="p-4">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-medium text-ink">{c.name}</span>
                    <span className="text-sm font-semibold text-ink [font-variant-numeric:tabular-nums]">{formatPrice(c.spent)}</span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted">{c.email}</p>
                  <p className="mt-1 text-xs text-muted">
                    {c.orders} pedido{c.orders === 1 ? "" : "s"} · {c.phone || "sem telefone"} · cadastro em {formatDate(c.createdAt)}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
