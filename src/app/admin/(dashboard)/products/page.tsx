import Link from "next/link";
import { getAdminProducts } from "@/lib/admin-data";
import { formatPrice } from "@/lib/format";
import { DbBanner } from "@/components/admin/db-banner";
import { DeleteButton } from "@/components/admin/delete-button";
import { deleteProduct } from "./actions";
import { requireAdmin, scopeBranchId } from "@/lib/admin";

export const metadata = { title: "Produtos" };

export const dynamic = "force-dynamic";

export default async function AdminProductsPage() {
  const session = await requireAdmin(); // layouts don't re-run on client navigation
  const { dbConnected, products } = await getAdminProducts(scopeBranchId(session));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <h1 className="font-display text-3xl font-semibold text-ink">Produtos</h1>
        <div className="flex flex-wrap gap-3">
          <Link href="/admin/products/new?type=combo" className="rounded-full border border-brand px-5 py-2.5 text-sm font-medium text-brand transition hover:bg-brand hover:text-light">
            + Criar combo
          </Link>
          <Link
            href="/admin/products/new"
            className="rounded-full bg-brand px-5 py-2.5 text-sm font-medium text-light transition hover:bg-brand-dark"
          >
            + Adicionar produto
          </Link>
        </div>
      </div>

      <div className="mt-6">
        {!dbConnected && <DbBanner />}

        {products.length === 0 ? (
          <div className="rounded-xl border border-dashed border-[var(--line)] bg-cream-soft py-16 text-center">
            <p className="font-display text-xl text-ink">Ainda não há produtos</p>
            <p className="mt-1 text-sm text-muted">
              {dbConnected ? "Adicione seu primeiro produto para começar." : "Conecte o banco de dados para gerenciar produtos."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-[var(--line)] bg-cream-soft">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[var(--line)] text-left text-xs uppercase tracking-wider text-muted">
                  <th className="px-4 py-3">Nome</th>
                  <th className="px-4 py-3">Categoria</th>
                  <th className="px-4 py-3">Preço</th>
                  <th className="px-4 py-3">Estoque</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Ações</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} className="border-b border-[var(--line)] last:border-0">
                    <td className="px-4 py-3">
                      <span className="font-medium text-ink">{p.name}</span>
                      {p.featured && (
                        <span className="ml-2 rounded-full bg-accent/20 px-2 py-0.5 text-[0.65rem] text-accent-strong">
                          Destaque
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-muted">{p.category}</td>
                    <td className="px-4 py-3 text-ink">{formatPrice(p.price)}</td>
                    <td className="px-4 py-3 text-ink">{p.stock}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs ${
                          p.active ? "bg-green-100 text-green-800" : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {p.active ? "Ativo" : "Oculto"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-end gap-4">
                        <Link href={`/admin/products/${p.id}`} className="text-sm text-accent-strong hover:underline">
                          Editar
                        </Link>
                        <DeleteButton
                          action={deleteProduct.bind(null, p.id)}
                          confirmText={`Excluir «${p.name}»?`}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
