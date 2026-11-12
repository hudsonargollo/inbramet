import type { Metadata } from "next";
import Link from "next/link";
import { getFeaturedProducts, getProducts, getCategories } from "@/lib/catalog";
import { getSelectedBranch, getBranches } from "@/lib/branch";
import { ProductImage } from "@/components/product-image";
import { HeroSlider } from "@/components/hero-slider";
import { BranchSuggest } from "@/components/branch-suggest";
import { PromoSlider } from "@/components/promo-slider";
import { PromoOverlay } from "@/components/promo-overlay";
import { CategoryArt } from "@/components/category-art";
import { FeaturedCarousel } from "@/components/featured-carousel";
import { Commitments } from "@/components/commitments";
import { Newsletter } from "@/components/newsletter";
import { DeliveryBand } from "@/components/delivery-band";
import { ClubBand } from "@/components/loyalty/club-band";
import { Reveal } from "@/components/reveal";
import { SplitText } from "@/components/text-reveal";
import { JsonLd } from "@/components/json-ld";

import { siteUrl } from "@/lib/site";
import { getStoreSettings } from "@/lib/settings";
import { formatPrice } from "@/lib/format";
import { InstagramIcon } from "@/components/icons";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

const orgJsonLd = {
  "@context": "https://schema.org",
  "@type": "Restaurant",
  name: "Inbramet",
  url: siteUrl,
  slogan: "El mejor sabor de Santa Cruz",
  description:
    "Inbramet — comida típica cruceña desde 1986: majao, picantes, empanadas de keperí y parrilla en Santa Cruz, Bolivia. Delivery y retiro en tienda con pago contra entrega.",
  servesCuisine: ["comida típica cruceña", "Comida criolla", "Parrilla"],
  priceRange: "Bs 12–330",
  address: {
    "@type": "PostalAddress",
    streetAddress: "Avenida Cristóbal de Mendoza #1365",
    addressLocality: "Santa Cruz de la Sierra",
    addressRegion: "Santa Cruz",
    addressCountry: "BO",
  },
  areaServed: "Santa Cruz de la Sierra",
  currenciesAccepted: "BOB",
  paymentAccepted: "Efectivo",
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Inbramet",
  url: siteUrl,
  potentialAction: {
    "@type": "SearchAction",
    target: `${siteUrl}/search?q={search_term_string}`,
    "query-input": "required name=search_term_string",
  },
};

const trustBadges = (freeThreshold: number) => [
  { title: "Hecho al momento", body: "Cocina criolla preparada cuando confirmas tu pedido." },
  { title: "Delivery y retiro", body: "Recíbelo en tu puerta o retíralo en tienda." },
  {
    title: "Delivery gratis",
    body:
      freeThreshold > 0
        ? `En pedidos desde ${formatPrice(freeThreshold)}.`
        : "En todos los pedidos de Inbramet.",
  },
  { title: "Desde 1986", body: "El sabor Inbramet de siempre, en el corazón de Santa Cruz." },
];

// Category covers from the brand photo set (fallback: first product photo).
const COVER_BY_SLUG: Record<string, string> = {
  "platos-tipicos-y-combinados": "/imgs/menu/majao-de-pato.jpeg",
  parrilla: "/imgs/menu/churrasco.jpeg",
  empanadas: "/imgs/menu/empanadas-de-carne-6-unid.jpeg",
  postres: "/imgs/menu/tres-cambitas.jpeg",
  bebidas: "/imgs/menu/gaseosa-coca-cola-500-ml.jpg",
};

export const revalidate = 300;

export default async function HomePage() {
  const settings = await getStoreSettings();
  const branch = await getSelectedBranch();
  const TRUST = trustBadges(settings.shipping.freeThreshold);
  const CONTACT = settings.social;
  const [featured, newest, categories, branches] = await Promise.all([
    getFeaturedProducts(8, branch?.id),
    getProducts({ sort: "newest" }, branch?.id),
    getCategories(),
    getBranches(),
  ]);
  const topCategories = categories.slice(0, 4);
  const branchSuggestions = branches.flatMap((b) =>
    b.latitude == null || b.longitude == null
      ? []
      : [
          {
            slug: b.slug,
            name: b.name,
            address: b.address,
            latitude: b.latitude,
            longitude: b.longitude,
          },
        ]
  );

  // Product count + a representative image per category (falls back to the
  // category cover when no product photo exists yet).
  const countBySlug: Record<string, number> = {};
  const imageBySlug: Record<string, string> = {};
  for (const p of newest) {
    countBySlug[p.category.slug] = (countBySlug[p.category.slug] ?? 0) + 1;
    if (!imageBySlug[p.category.slug] && p.images.length > 0) {
      imageBySlug[p.category.slug] = p.images[0];
    }
  }

  // Real product images for the Instagram-style grid.
  const galleryProducts = newest.filter((p) => p.images.length > 0).slice(0, 6);

  return (
    <>
      <JsonLd data={orgJsonLd} />
      <JsonLd data={websiteJsonLd} />

      <BranchSuggest branches={branchSuggestions} hasBranch={!!branch} />

      {/* Hero */}
      <HeroSlider />

      {/* Immediate local promo for Santa Cruz delivery */}
      <PromoOverlay />

      {/* Trust badges */}
      <section className="border-y border-[var(--line)] bg-cream-soft/50 px-5 py-11">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-4 gap-y-9 lg:grid-cols-4">
          {TRUST.map((t, i) => (
            <div
              key={t.title}
              className={`flex flex-col items-center px-2 text-center sm:px-6 ${
                i > 0 ? "lg:border-l lg:border-[var(--line)]" : ""
              }`}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-[rgba(255,204,4,0.35)] bg-[radial-gradient(circle,rgba(255,216,102,0.18),transparent_70%)] text-accent-strong">
                <TrustIcon i={i} />
              </span>
              <p className="mt-3.5 font-display text-lg font-bold text-ink">{t.title}</p>
              <p className="mt-1 text-sm leading-snug text-muted">{t.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Shop by category */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <Reveal>
          <div className="text-center">
            <span className="eyebrow">El menú</span>
            <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
              <SplitText text="Elige tu antojo" />
            </h2>
            <p className="mx-auto mt-4 max-w-md text-pretty text-muted">
              Platos típicos, parrilla, empanadas, postres y bebidas bien frías. Todo el
              sabor Inbramet, en un mismo pedido.
            </p>
          </div>
        </Reveal>
        <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {topCategories.map((c, idx) => {
            const count = countBySlug[c.slug] ?? 0;
            const comingSoon = count === 0;
            const img = COVER_BY_SLUG[c.slug] ?? imageBySlug[c.slug];
            const cardCls =
              "group relative block aspect-[4/5] overflow-hidden rounded-2xl border border-[var(--line)] transition-all duration-500 hover:-translate-y-1 hover:border-accent hover:shadow-[0_28px_55px_-28px_rgba(29,58,14,0.55)]";

            const body =
              comingSoon || !img ? (
                // No products / no photo yet → green card with a menu icon
                <div
                  className="relative flex h-full flex-col items-center justify-center gap-3 p-6 text-center"
                  style={{ background: "linear-gradient(160deg, #3c6e1b, #1d3a0e)" }}
                >
                  <div className="pointer-events-none absolute inset-3 rounded-xl border border-[rgba(255,216,102,0.25)]" />
                  <CategoryArt slug={c.slug} className="h-20 w-20 text-accent-soft transition duration-500 group-hover:scale-105" />
                  <div>
                    <h3 className="font-display text-xl font-bold text-light">{c.name}</h3>
                    {comingSoon ? (
                      <span className="mt-2 inline-block rounded-full border border-[rgba(255,216,102,0.4)] px-3 py-1 text-[0.6rem] uppercase tracking-[0.16em] text-accent-soft">
                        Próximamente
                      </span>
                    ) : (
                      <span className="mt-1 block text-xs uppercase tracking-[0.16em] text-accent-soft">Ver menú →</span>
                    )}
                  </div>
                </div>
              ) : (
                // Product / category photo as the cover
                <>
                  <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-110">
                    <ProductImage src={img} alt={c.name} seed={c.slug} />
                  </div>
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(180deg, rgba(29,58,14,0) 35%, rgba(29,58,14,0.55) 68%, rgba(29,58,14,0.88) 100%)" }}
                  />
                  <div className="pointer-events-none absolute inset-3 rounded-xl border border-[rgba(255,255,255,0.16)]" />
                  <div className="relative flex h-full flex-col items-center justify-end p-5 text-center">
                    <h3 className="font-display text-2xl font-bold text-light drop-shadow-sm">{c.name}</h3>
                    <span className="mt-1 text-xs uppercase tracking-[0.16em] text-accent-soft">Ver menú →</span>
                  </div>
                </>
              );

            return (
              <Reveal key={c.slug} delay={(idx % 4) * 80}>
                {comingSoon ? (
                  <div className={cardCls}>{body}</div>
                ) : (
                  <Link href={`/shop/${c.slug}`} className={cardCls}>
                    {body}
                  </Link>
                )}
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* Favourites band — cross-fading dish slider */}
      <PromoSlider />

      {/* Destacado carousel */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <Reveal>
          <div className="flex items-end justify-between">
            <div>
              <span className="eyebrow">Favoritos</span>
              <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
                <SplitText text="Los más pedidos" />
              </h2>
            </div>
            <Link href="/shop" className="text-sm font-semibold text-accent-strong hover:text-accent">
              Ver todo →
            </Link>
          </div>
        </Reveal>
        <div className="mt-10">
          <FeaturedCarousel products={featured} />
        </div>
      </section>

      {/* Club Camba — loyalty programme billboard */}
      <ClubBand rules={settings.loyalty} />

      {/* Same-day local delivery, built around the moto courier illustration */}
      <DeliveryBand
        hours={settings.contact.hours}
        deliveryTime={settings.shipping.deliveryTime}
        freeThreshold={settings.shipping.freeThreshold}
      />

      {/* Brand story */}
      <section className="bg-cream px-5 py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
          <Reveal>
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-panel">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/images/hero-inbramet.webp"
                alt="El patio de Inbramet en Santa Cruz"
                className="h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-3 rounded-xl border border-[rgba(246,243,232,0.6)]" />
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div>
              <span className="eyebrow">Nuestra historia</span>
              <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink text-balance sm:text-5xl">
                <SplitText text="La casa del" />{" "}
                <span className="brand-text">sabor Inbramet</span>
              </h2>
              <p className="mt-5 text-pretty leading-relaxed text-ink/80">
                Desde el 6 de diciembre de 1986, Inbramet cocina los sabores criollos
                de Santa Cruz: majao, picante de lengua, empanadas de keperí y
                parrilla, como se han hecho siempre.
              </p>
              <p className="mt-4 text-pretty leading-relaxed text-ink/80">
                Fundada por Juan Carlos Medina y Rosa Parada de Medina, hoy somos la
                referencia de la comida camba en la ciudad. Pide en línea con delivery o
                retira en tienda, con pago contra entrega.
              </p>
              <Link
                href="/about"
                className="mt-7 inline-block rounded-full bg-accent px-8 py-3 text-sm font-semibold text-brand-deep shadow-[0_16px_36px_-18px_rgba(255,204,4,0.95)] transition duration-300 hover:-translate-y-0.5 hover:bg-accent-soft"
              >
                Conoce nuestra historia
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Commitments (replaces the pre-launch sample testimonials) */}
      <Commitments />

      {/* Product gallery */}
      <section className="relative overflow-hidden bg-cream-soft px-5 py-24">
        {/* accent hairline + soft glow */}
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(255,204,4,0.4)] to-transparent" />
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-72 w-[60rem] -translate-x-1/2"
          style={{ background: "radial-gradient(50% 60% at 50% 0%, rgba(255,216,102,0.16), transparent 70%)" }}
        />

        <div className="relative mx-auto max-w-6xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--line-strong)] bg-cream px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-accent-strong">
            <InstagramIcon size={15} />
            Galería
          </span>
          <h2 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-ink text-balance sm:text-5xl">
            <SplitText text="Bocados que ya son de casa" />
          </h2>
          <p className="mt-3 text-pretty text-muted">
            Un vistazo a lo que más piden nuestros clientes — compártelo con{" "}
            <span className="font-semibold text-accent-strong">#Inbramet</span>
          </p>

          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
            {galleryProducts.map((p) => (
              <Link
                key={p.id}
                href={`/product/${p.slug}`}
                aria-label={p.name}
                className="group relative block aspect-square overflow-hidden rounded-xl ring-1 ring-[var(--line)] transition-all duration-500 hover:-translate-y-1 hover:ring-2 hover:ring-accent hover:shadow-[0_24px_48px_-24px_rgba(29,58,14,0.5)]"
              >
                <div className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-110">
                  <ProductImage src={p.images[0]} alt={p.name} seed={p.slug} />
                </div>
                {/* darkening gradient on hover */}
                <div className="absolute inset-0 bg-gradient-to-t from-brand-deep/85 via-brand-deep/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                {/* product name reveal */}
                <span className="absolute inset-x-0 bottom-0 translate-y-2 px-3 pb-3 text-left text-[0.72rem] font-medium leading-tight text-light opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  {p.name}
                </span>
                {/* Instagram glyph */}
                <span className="absolute right-2.5 top-2.5 text-accent-soft opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  <InstagramIcon size={18} />
                </span>
              </Link>
            ))}
          </div>

          <div className="mt-12 flex flex-wrap items-center justify-center gap-3">
            {CONTACT.instagram && (
              <a
                href={CONTACT.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-3.5 text-sm font-semibold text-brand-deep shadow-[0_16px_36px_-18px_rgba(255,204,4,0.95)] transition duration-300 hover:-translate-y-0.5 hover:bg-accent-soft"
              >
                <InstagramIcon size={18} />
                Síguenos en Instagram
              </a>
            )}
            <Link
              href="/shop"
              className="rounded-full border border-[var(--line-strong)] px-8 py-3.5 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent-strong"
            >
              Ver el menú
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <Newsletter />
    </>
  );
}

function TrustIcon({ i }: { i: number }) {
  const p = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  // 0 Hecho al momento · 1 Delivery y retiro · 2 Delivery gratis · 3 Desde 1986
  if (i === 0)
    return (
      <svg {...p}>
        <path d="M4 17h16" />
        <path d="M5 17a7 7 0 0 1 14 0" />
        <path d="M12 10V8" />
        <path d="M10.5 8h3" />
        <path d="M3 20h18" />
      </svg>
    );
  if (i === 1)
    return (
      <svg {...p}>
        <circle cx="5.5" cy="17.5" r="2.5" />
        <circle cx="18.5" cy="17.5" r="2.5" />
        <path d="M8 17.5h5.5l2-5h3" />
        <path d="M14 12.5 12.8 8H10" />
        <path d="M15.5 8.5h3" />
      </svg>
    );
  if (i === 2)
    return (
      <svg {...p}>
        <rect x="2.5" y="6" width="19" height="12" rx="2" />
        <circle cx="12" cy="12" r="2.4" />
        <path d="M6 9.5v5M18 9.5v5" />
      </svg>
    );
  return (
    <svg {...p}>
      <path d="M4 5h16v11H9l-5 4V5z" />
      <path d="M8 10h8M8 13h5" />
    </svg>
  );
}
