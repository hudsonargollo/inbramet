import type { Metadata } from "next";
import { NotifyForm } from "@/components/notify-form";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getCategoryBySlug, getProducts, getShopFacets } from "@/lib/catalog";
import { parseProductFilters } from "@/lib/filters";
import { ShopBrowser } from "@/components/shop/shop-browser";
import { Emblem } from "@/components/brand/emblem";

const CATEGORY_COPY: Record<string, { title: string; description: string }> = {
  mesas: {
    title: "Mesas",
    description:
      "Mesas de jantar e apoio com estrutura firme e acabamentos fáceis de limpar.",
  },
  cadeiras: {
    title: "Cadeiras",
    description:
      "Cadeiras estofadas em tecido resistente com tons que valorizam qualquer ambiente.",
  },
  bancos: {
    title: "Bancos",
    description:
      "Bancos compactos e versáteis para salas, quartos, halls de entrada ou escritórios.",
  },
  banquetas: {
    title: "Banquetas",
    description:
      "Banquetas confortáveis para bancadas, ilhas de cozinha e áreas gourmet.",
  },
  conjuntos: {
    title: "Conjuntos",
    description:
      "Jogos de mesa com quatro cadeiras combinadas para montar sua sala de jantar sem complicação.",
  },
};

export async function generateMetadata({
  params,
}: PageProps<"/shop/[category]">): Promise<Metadata> {
  const { category } = await params;
  const cat = await getCategoryBySlug(category);
  if (!cat) return { title: "Não encontrado" };
  const copy = CATEGORY_COPY[cat.slug];
  return {
    title: copy?.title ?? cat.name,
    description:
      copy?.description ?? cat.description ?? `Compre ${cat.name.toLowerCase()} na Inbramet.`,
    alternates: { canonical: `/shop/${cat.slug}` },
  };
}

export default async function CategoryPage({
  params,
  searchParams,
}: PageProps<"/shop/[category]">) {
  const { category } = await params;
  const cat = await getCategoryBySlug(category);
  if (!cat) notFound();

  const sp = await searchParams;
  const parsed = parseProductFilters(sp);
  const filters = { ...parsed, categorySlug: cat.slug };
  const [products, facets] = await Promise.all([
    getProducts(filters),
    getShopFacets(cat.slug),
  ]);

  const hasFilters = Boolean(
    parsed.q || parsed.material || parsed.minPrice || parsed.maxPrice || parsed.onSale || parsed.inStock
  );

  if (products.length === 0 && !hasFilters) {
    return (
      <div className="mx-auto max-w-2xl px-5 py-24 text-center">
        <Emblem size={48} className="mx-auto text-brand" accent="var(--color-accent)" />
        <span className="eyebrow mt-4 block">{cat.name}</span>
        <h1 className="mt-2 font-display text-4xl font-extrabold tracking-tight text-ink sm:text-5xl">
          Em breve
        </h1>
        <p className="relative mx-auto mt-2 max-w-md text-muted">
          Estamos preparando nossa seleção de {cat.name.toLowerCase()}. Deixe seu e-mail e avisaremos assim que chegar.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            href="/shop"
            className="rounded-full bg-accent px-8 py-3 text-sm font-semibold text-brand-deep shadow-[0_14px_32px_-16px_rgba(230,255,87,0.75)] transition duration-300 hover:-translate-y-0.5 hover:bg-accent-soft"
          >
            Ver a coleção
          </Link>
        </div>
        <div className="mt-8">
          <p className="mb-3 text-sm text-muted">Avise-me quando chegar:</p>
          <NotifyForm slug={cat.slug} label={cat.name} />
        </div>
      </div>
    );
  }

  return (
    <ShopBrowser
      eyebrow="A coleção"
      title={CATEGORY_COPY[cat.slug]?.title ?? cat.name}
      description={CATEGORY_COPY[cat.slug]?.description ?? cat.description}
      products={products}
      facets={facets}
    />
  );
}
