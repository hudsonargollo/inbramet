import type { Metadata } from "next";
import { getProducts } from "@/lib/catalog";
import { MenuPromoSlider } from "@/components/shop/menu-promo-slider";
import { MenuSection } from "@/components/shop/menu-section";

export const metadata: Metadata = {
  alternates: { canonical: "/shop" },
  title: "Coleção de móveis",
  description:
    "Mesas, cadeiras estofadas, bancos, banquetas e conjuntos de jantar. Compre on-line com entrega para todo o Brasil.",
};

export const dynamic = "force-dynamic";

export default async function ShopPage() {
  const products = await getProducts({});
  const conjuntos = products.filter((p) => p.category.slug === "conjuntos");
  const cadeiras = products.filter((p) => p.category.slug === "cadeiras");
  const mesasEBancos = products.filter(
    (p) =>
      p.category.slug === "mesas" ||
      p.category.slug === "bancos" ||
      p.category.slug === "banquetas"
  );
  const groupedIds = new Set([...conjuntos, ...cadeiras, ...mesasEBancos].map((p) => p.id));
  const others = products.filter((p) => !groupedIds.has(p.id));

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16">
      <header className="max-w-3xl">
        <span className="eyebrow">A coleção</span>
        <h1 className="mt-3 font-display text-4xl font-extrabold leading-[1.05] tracking-tight text-ink text-balance sm:text-5xl lg:text-6xl">
          Mobiliário pensado para a vida real
        </h1>
        <p className="mt-4 max-w-2xl text-pretty text-base text-muted sm:text-lg">
          Mesas de linhas limpas, cadeiras estofadas em tecido resistente, bancos,
          banquetas e conjuntos prontos para sua casa ou escritório.
        </p>
      </header>

      <div className="mt-10">
        <MenuPromoSlider />
      </div>

      <div className="mt-14 space-y-14 sm:mt-16 sm:space-y-16">
        <MenuSection
          id="conjuntos"
          eyebrow="Sala de jantar e escritório"
          title="Conjuntos completos"
          description="Mesas com quatro cadeiras combinando, prontas para equipar seu ambiente em uma única escolha."
          href="/shop/conjuntos"
          linkLabel="Ver conjuntos"
          products={conjuntos}
        />

        <MenuSection
          id="cadeiras"
          eyebrow="Assentos"
          title="Cadeiras"
          description="Cadeiras ergonômicas com estofamento em tecido resistente em tons vibrantes e neutros."
          href="/shop/cadeiras"
          linkLabel="Ver cadeiras"
          products={cadeiras}
        />

        <MenuSection
          id="mesas-y-bancos"
          eyebrow="Superfícies e apoio"
          title="Mesas, bancos e banquetas"
          description="Peças versáteis para cozinha, sala de jantar, bancada ou cantinho de leitura."
          href="/shop/mesas"
          linkLabel="Ver mesas e bancos"
          products={[...mesasEBancos, ...others]}
        />
      </div>

      {products.length === 0 ? (
        <div className="mt-12 rounded-2xl border border-dashed border-[var(--line)] bg-surface py-16 text-center">
          <p className="font-display text-xl text-ink">A coleção está sendo preparada</p>
          <p className="mt-1 text-sm text-muted">Volte em alguns instantes.</p>
        </div>
      ) : null}
    </div>
  );
}
