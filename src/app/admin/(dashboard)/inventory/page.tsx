import Link from "next/link";
import { requireAdmin } from "@/lib/admin";
import { getBranches } from "@/lib/branch";
import { getAdminInventory } from "@/lib/admin-data";
import { getStoreSettings } from "@/lib/settings";
import { DbBanner } from "@/components/admin/db-banner";
import { setBranchProductActive, setBranchStock } from "./actions";

export const metadata = { title: "Estoque" };
export const dynamic = "force-dynamic";

const field =
  "w-24 rounded-lg border border-[var(--line-strong)] bg-surface px-2.5 py-1.5 text-sm text-ink outline-none transition focus:border-accent";

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const session = await requireAdmin();
  const params = await searchParams;
  const branches = await getBranches();
  const branchId = session.branchId ?? branches[0]?.id ?? "";
  const q = typeof params.q === "string" ? params.q.trim() : "";

  const [{ dbConnected, rows }, settings] = await Promise.all([
    getAdminInventory(branchId, q),
    getStoreSettings(),
  ]);
  const lowThreshold = settings.inventory.lowStockThreshold;
  const units = rows.reduce((n, r) => n + r.stock, 0);
  const low = rows.filter((r) => r.available && r.stock <= lowThreshold).length;

  return (
    <div>
      <div>
        <h1 className="font-display text-3xl font-semibold text-ink">Estoque</h1>
        <p className="mt-1 text-sm text-muted">
          Gerencie as quantidades em estoque e a disponibilidade de cada produto na loja online.
        </p>
      </div>

      <form method="get" className="mt-5 flex flex-wrap items-end gap-3">
        <div>
          <label htmlFor="inv-q" className="mb-1.5 block text-xs font-medium uppercase tracking-[0.1em] text-muted">
            Buscar
          </label>
          <input
            id="inv-q"
            name="q"
            defaultValue={q}
            placeholder="Nome, marca ou SKU"
            className="rounded-lg border border-[var(--line-strong)] bg-surface px-3 py-2 text-sm text-ink outline-none focus:border-accent"
          />
        </div>
        <button
          type="submit"
          className="rounded-lg bg-brand px-4 py-2 text-sm font-medium text-light transition hover:bg-brand-dark"
        >
          Filtrar
        </button>
      </form>

      {!dbConnected && <div className="mt-6"><DbBanner /></div>}

      {!branchId ? (
        <div className="mt-6 rounded-xl border border-dashed border-[var(--line)] bg-cream-soft py-16 text-center">
          <p className="font-display text-xl text-ink">Estoque ainda não inicializado</p>
          <p className="mt-1 text-sm text-muted">
            Conecte o banco de dados e execute o seed (<code>npm run db:seed</code>) para gerenciar o estoque da loja.
          </p>
        </div>
      ) : (
        <>
          <div className="mt-6 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <Stat label="Produtos" value={String(rows.length)} />
            <Stat label="Unidades em estoque" value={String(units)} />
            <Stat label={`Estoque baixo (≤ ${lowThreshold})`} value={String(low)} tone={low > 0 ? "warn" : "ok"} />
          </div>

          {rows.length === 0 ? (
            <div className="mt-6 rounded-xl border border-dashed border-[var(--line)] bg-cream-soft py-16 text-center">
              <p className="font-display text-xl text-ink">Sem produtos</p>
              <p className="mt-1 text-sm text-muted">
                {q ? "Nenhum produto corresponde à sua busca." : "Adicione produtos ao catálogo para gerenciar o estoque."}
              </p>
            </div>
          ) : (
            <div className="mt-6 overflow-x-auto rounded-xl border border-[var(--line)] bg-cream-soft">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[var(--line)] text-left text-xs uppercase tracking-wider text-muted">
                    <th className="px-4 py-3">Produto</th>
                    <th className="px-4 py-3">Categoria</th>
                    <th className="px-4 py-3">Estoque</th>
                    <th className="px-4 py-3">Disponibilidade</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((p) => (
                    <tr key={p.id} className="border-b border-[var(--line)] last:border-0">
                      <td className="px-4 py-3">
                        <Link href={`/admin/products/${p.id}`} className="font-medium text-ink hover:text-accent-strong">
                          {p.name}
                        </Link>
                        {p.sku && <p className="text-xs text-muted">SKU {p.sku}</p>}
                        {!p.catalogActive && <p className="text-xs text-amber-700">Oculto no catálogo</p>}
                      </td>
                      <td className="px-4 py-3 text-muted">{p.category}</td>
                      <td className="px-4 py-3">
                        <form action={setBranchStock} className="flex items-center gap-2">
                          <input type="hidden" name="branchId" value={branchId} />
                          <input type="hidden" name="productId" value={p.id} />
                          <input
                            type="number"
                            name="stock"
                            min={0}
                            step={1}
                            defaultValue={p.stock}
                            aria-label={`Estoque de ${p.name}`}
                            className={field}
                          />
                          <button
                            type="submit"
                            className="rounded-lg border border-[var(--line-strong)] px-2.5 py-1.5 text-xs font-medium text-ink transition hover:border-accent hover:text-accent-strong"
                          >
                            Salvar
                          </button>
                        </form>
                        {p.available && p.stock === 0 && (
                          <p className="mt-1 text-xs text-red-600">Sem estoque</p>
                        )}
                        {p.available && p.stock > 0 && p.stock <= lowThreshold && (
                          <p className="mt-1 text-xs text-amber-700">Estoque baixo</p>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <form action={setBranchProductActive} className="flex items-center gap-2">
                          <input type="hidden" name="branchId" value={branchId} />
                          <input type="hidden" name="productId" value={p.id} />
                          <input type="hidden" name="active" value={p.available ? "0" : "1"} />
                          <span
                            className={`rounded-full px-2 py-0.5 text-xs ${
                              p.available ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"
                            }`}
                          >
                            {p.available ? "Disponível" : "Oculto"}
                          </span>
                          <button
                            type="submit"
                            className="text-xs text-accent-strong hover:underline"
                          >
                            {p.available ? "Ocultar" : "Mostrar"}
                          </button>
                        </form>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function Stat({ label, value, tone }: { label: string; value: string; tone?: "ok" | "warn" }) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-cream-soft px-4 py-3">
      <p className="text-xs uppercase tracking-wider text-muted">{label}</p>
      <p className={`mt-1 font-display text-2xl font-semibold ${tone === "warn" ? "text-amber-700" : "text-ink"}`}>
        {value}
      </p>
    </div>
  );
}
