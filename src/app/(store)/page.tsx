import type { Metadata } from "next";
import Link from "next/link";
import { getFeaturedProducts, getProducts, getCategories } from "@/lib/catalog";
import { ProductImage } from "@/components/product-image";
import { HeroSlider } from "@/components/hero-slider";
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
  "@type": "FurnitureStore",
  name: "Inbramet",
  url: siteUrl,
  slogan: "Design pensado para a vida real",
  description:
    "Inbramet — mobiliário contemporâneo em tecido, madeira e aço: mesas, cadeiras, bancos, banquetas e conjuntos de jantar. Entrega para todo o Brasil.",
  priceRange: "R$ 150–2500",
  address: {
    "@type": "PostalAddress",
    addressLocality: "São Paulo",
    addressRegion: "SP",
    addressCountry: "BR",
  },
  areaServed: "Brasil",
  currenciesAccepted: "BRL",
  paymentAccepted: "Dinheiro, Cartão",
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
  { title: "Design funcional", body: "Cada peça é pensada para se encaixar no seu dia a dia." },
  { title: "Compra simples", body: "Peça on-line e receba no seu endereço com acompanhamento." },
  {
    title: "Frete grátis",
    body:
      freeThreshold > 0
        ? `Em pedidos a partir de ${formatPrice(freeThreshold)}.`
        : "Em todos os pedidos da Inbramet.",
  },
  { title: "Acabamento sólido", body: "Estruturas firmes e acabamentos que resistem ao uso diário." },
];

const COVER_BY_SLUG: Record<string, string> = {
  mesas: "/products/bancoazul.webp",
  cadeiras: "/products/cadeira-amarela1.webp",
  bancos: "/products/cadeira-preta1.webp",
  banquetas: "/products/mesa-pretobranca.webp",
  conjuntos: "/products/jogomesa4cadeirasazul.webp",
};

export const revalidate = 300;

export default async function HomePage() {
  const settings = await getStoreSettings();
  const TRUST = trustBadges(settings.shipping.freeThreshold);
  const CONTACT = settings.social;
  const [featured, newest, categories] = await Promise.all([
    getFeaturedProducts(8),
    getProducts({ sort: "newest" }),
    getCategories(),
  ]);
  const topCategories = categories.slice(0, 4);

  const countBySlug: Record<string, number> = {};
  const imageBySlug: Record<string, string> = {};
  for (const p of newest) {
    countBySlug[p.category.slug] = (countBySlug[p.category.slug] ?? 0) + 1;
    if (!imageBySlug[p.category.slug] && p.images.length > 0) {
      imageBySlug[p.category.slug] = p.images[0];
    }
  }

  const galleryProducts = newest.filter((p) => p.images.length > 0).slice(0, 6);

  return (
    <>
      <JsonLd data={orgJsonLd} />
      <JsonLd data={websiteJsonLd} />

      <HeroSlider />

      <PromoOverlay />

      <section className="border-y border-[var(--line)] bg-cream-soft/50 px-5 py-11">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-x-4 gap-y-9 lg:grid-cols-4">
          {TRUST.map((t, i) => (
            <div
              key={t.title}
              className={`flex flex-col items-center px-2 text-center sm:px-6 ${
                i > 0 ? "lg:border-l lg:border-[var(--line)]" : ""
              }`}
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-full border border-accent/40 bg-[radial-gradient(circle,rgba(230,255,87,0.18),transparent_70%)] text-accent-strong">
                <TrustIcon i={i} />
              </span>
              <p className="mt-3.5 font-display text-lg font-bold text-ink">{t.title}</p>
              <p className="mt-1 text-sm leading-snug text-muted">{t.body}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-5 py-20">
        <Reveal>
          <div className="text-center">
            <span className="eyebrow">Coleção</span>
            <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
              <SplitText text="Escolha sua peça" />
            </h2>
            <p className="mx-auto mt-4 max-w-md text-pretty text-muted">
              Mesas, cadeiras, bancos e conjuntos projetados para a vida real.
              Encontre a peça ideal para o seu espaço.
            </p>
          </div>
        </Reveal>
        <div className="mt-12 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
          {topCategories.map((c, idx) => {
            const count = countBySlug[c.slug] ?? 0;
            const comingSoon = count === 0;
            const img = COVER_BY_SLUG[c.slug] ?? imageBySlug[c.slug];
            const cardCls =
              "group relative block aspect-[4/5] overflow-hidden rounded-2xl border border-[var(--line)] transition-all duration-500 hover:-translate-y-1 hover:border-accent hover:shadow-[0_28px_55px_-28px_rgba(15,23,42,0.45)]";

            const body =
              comingSoon || !img ? (
                <div
                  className="relative flex h-full flex-col items-center justify-center gap-3 p-6 text-center"
                  style={{ background: "linear-gradient(160deg, #1e293b, #0f172a)" }}
                >
                  <div className="pointer-events-none absolute inset-3 rounded-xl border border-accent/25" />
                  <CategoryArt slug={c.slug} className="h-20 w-20 text-accent-soft transition duration-500 group-hover:scale-105" />
                  <div>
                    <h3 className="font-display text-xl font-bold text-light">{c.name}</h3>
                    {comingSoon ? (
                      <span className="mt-2 inline-block rounded-full border border-accent/40 px-3 py-1 text-[0.6rem] uppercase tracking-[0.16em] text-accent-soft">
                        Em breve
                      </span>
                    ) : (
                      <span className="mt-1 block text-xs uppercase tracking-[0.16em] text-accent-soft">Ver coleção →</span>
                    )}
                  </div>
                </div>
              ) : (
                <>
                  <div className="absolute inset-0 transition-transform duration-700 ease-out group-hover:scale-110">
                    <ProductImage src={img} alt={c.name} seed={c.slug} />
                  </div>
                  <div
                    className="absolute inset-0"
                    style={{ background: "linear-gradient(180deg, rgba(15,23,42,0) 35%, rgba(15,23,42,0.52) 68%, rgba(15,23,42,0.88) 100%)" }}
                  />
                  <div className="pointer-events-none absolute inset-3 rounded-xl border border-[rgba(255,255,255,0.16)]" />
                  <div className="relative flex h-full flex-col items-center justify-end p-5 text-center">
                    <h3 className="font-display text-2xl font-bold text-light drop-shadow-sm">{c.name}</h3>
                    <span className="mt-1 text-xs uppercase tracking-[0.16em] text-accent-soft">Ver coleção →</span>
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

      <PromoSlider />

      <section className="mx-auto max-w-6xl px-5 py-20">
        <Reveal>
          <div className="flex items-end justify-between">
            <div>
              <span className="eyebrow">Favoritos</span>
              <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-balance sm:text-5xl">
                <SplitText text="Os mais pedidos" />
              </h2>
            </div>
            <Link href="/shop" className="text-sm font-semibold text-accent-strong hover:text-accent">
              Ver tudo →
            </Link>
          </div>
        </Reveal>
        <div className="mt-10">
          <FeaturedCarousel products={featured} />
        </div>
      </section>

      <ClubBand rules={settings.loyalty} />

      <DeliveryBand
        hours={settings.contact.hours}
        deliveryTime={settings.shipping.deliveryTime}
        freeThreshold={settings.shipping.freeThreshold}
      />

      <section className="bg-cream px-5 py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 md:grid-cols-2">
          <Reveal>
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-panel">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/products/jogomesa4cadeirasestampado.webp"
                alt="Conjunto de mesa e quatro cadeiras estofadas Inbramet"
                className="h-full w-full object-cover"
              />
              <div className="pointer-events-none absolute inset-3 rounded-xl border border-[rgba(248,250,246,0.6)]" />
            </div>
          </Reveal>
          <Reveal delay={120}>
            <div>
              <span className="eyebrow">Nossa história</span>
              <h2 className="mt-3 font-display text-4xl font-extrabold tracking-tight text-ink text-balance sm:text-5xl">
                <SplitText text="Móveis" />{" "}
                <span className="brand-text">feitos para durar</span>
              </h2>
              <p className="mt-5 text-pretty leading-relaxed text-ink/80">
                Cada peça nasce de uma ideia clara: ser funcional, resistente e manter
                o visual impecável no dia a dia. Reunimos uma curadoria pensada para
                valorizar cada ambiente da sua casa ou escritório.
              </p>
              <p className="mt-4 text-pretty leading-relaxed text-ink/80">
                Compre on-line com praticidade, escolha os acabamentos que combinam com
                seu espaço e receba no conforto do seu endereço.
              </p>
              <Link
                href="/about"
                className="mt-7 inline-block rounded-full bg-accent px-8 py-3 text-sm font-semibold text-brand-deep shadow-[0_16px_36px_-18px_rgba(230,255,87,0.95)] transition duration-300 hover:-translate-y-0.5 hover:bg-accent-soft"
              >
                Conheça a coleção
              </Link>
            </div>
          </Reveal>
        </div>
      </section>

      <Commitments />

      <section className="relative overflow-hidden bg-cream-soft px-5 py-24">
        <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-accent/40 to-transparent" />
        <div
          className="pointer-events-none absolute left-1/2 top-0 h-72 w-[60rem] -translate-x-1/2"
          style={{ background: "radial-gradient(50% 60% at 50% 0%, rgba(230,255,87,0.16), transparent 70%)" }}
        />

        <div className="relative mx-auto max-w-6xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-[var(--line-strong)] bg-cream px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.16em] text-accent-strong">
            <InstagramIcon size={15} />
            Galeria
          </span>
          <h2 className="mt-4 font-display text-4xl font-extrabold tracking-tight text-ink text-balance sm:text-5xl">
            <SplitText text="Peças que transformam o ambiente" />
          </h2>
          <p className="mt-3 text-pretty text-muted">
            Um olhar sobre os destaques mais procurados — compartilhe com{" "}
            <span className="font-semibold text-accent-strong">#Inbramet</span>
          </p>

          <div className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-6">
            {galleryProducts.map((p) => (
              <Link
                key={p.id}
                href={`/product/${p.slug}`}
                aria-label={p.name}
                className="group relative block aspect-square overflow-hidden rounded-xl ring-1 ring-[var(--line)] transition-all duration-500 hover:-translate-y-1 hover:ring-2 hover:ring-accent hover:shadow-[0_24px_48px_-24px_rgba(15,23,42,0.45)]"
              >
                <div className="h-full w-full transition-transform duration-700 ease-out group-hover:scale-110">
                  <ProductImage src={p.images[0]} alt={p.name} seed={p.slug} />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-brand-deep/85 via-brand-deep/10 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <span className="absolute inset-x-0 bottom-0 translate-y-2 px-3 pb-3 text-left text-[0.72rem] font-medium leading-tight text-light opacity-0 transition-all duration-500 group-hover:translate-y-0 group-hover:opacity-100">
                  {p.name}
                </span>
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
                className="inline-flex items-center gap-2 rounded-full bg-accent px-8 py-3.5 text-sm font-semibold text-brand-deep shadow-[0_16px_36px_-18px_rgba(230,255,87,0.75)] transition duration-300 hover:-translate-y-0.5 hover:bg-accent-soft"
              >
                <InstagramIcon size={18} />
                Siga-nos no Instagram
              </a>
            )}
            <Link
              href="/shop"
              className="rounded-full border border-[var(--line-strong)] px-8 py-3.5 text-sm font-semibold text-ink transition hover:border-accent hover:text-accent-strong"
            >
              Ver a coleção
            </Link>
          </div>
        </div>
      </section>

      <Newsletter />
    </>
  );
}

function TrustIcon({ i }: { i: number }) {
  const p = { width: 22, height: 22, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
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
