"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";

const SLIDES = [
  {
    src: "/products/jogomesa4cadeirasazul.webp",
    focus: "center center",
    tag: "Conjuntos",
    cta: "Ver conjuntos",
    href: "/shop/conjuntos",
  },
  {
    src: "/products/cadeira-amarela1.webp",
    focus: "center center",
    tag: "Cadeiras",
    cta: "Ver cadeiras",
    href: "/shop/cadeiras",
  },
  {
    src: "/products/mesa-pretobranca.webp",
    focus: "center center",
    tag: "Mesas",
    cta: "Ver mesas",
    href: "/shop/mesas",
  },
  {
    src: "/products/bancoazul.webp",
    focus: "center center",
    tag: "Bancos",
    cta: "Ver bancos",
    href: "/shop/bancos",
  },
];

const INTERVAL = 5600;

export function MenuPromoSlider() {
  const trackRef = useRef<HTMLDivElement>(null);
  const pausedRef = useRef(false);
  const [index, setIndex] = useState(0);

  const goTo = useCallback((next: number) => {
    const el = trackRef.current;
    if (!el) return;
    el.scrollTo({ left: el.clientWidth * next, behavior: "smooth" });
  }, []);

  const step = useCallback(
    (dir: number) => {
      const el = trackRef.current;
      if (!el) return;
      const current = Math.round(el.scrollLeft / Math.max(el.clientWidth, 1));
      goTo((current + dir + SLIDES.length) % SLIDES.length);
    },
    [goTo]
  );

  useEffect(() => {
    const id = window.setInterval(() => {
      if (pausedRef.current) return;
      const el = trackRef.current;
      if (!el) return;
      const current = Math.round(el.scrollLeft / Math.max(el.clientWidth, 1));
      const next = current >= SLIDES.length - 1 ? 0 : current + 1;
      el.scrollTo({ left: el.clientWidth * next, behavior: "smooth" });
    }, INTERVAL);
    return () => window.clearInterval(id);
  }, []);

  return (
    <section role="region" aria-roledescription="carrossel" aria-label="Destaques da coleção">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="max-w-xl">
          <span className="eyebrow">Destaques</span>
          <h2 className="mt-2 font-display text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            As linhas mais procuradas
          </h2>
          <p className="mt-2 text-sm text-muted sm:text-base">
            Explore nossas peças-chave para sala de jantar, cozinha e escritório. Escolha sua favorita na coleção.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => step(-1)}
            aria-label="Destaque anterior"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line-strong)] text-brand transition hover:border-accent hover:bg-accent hover:text-brand-deep"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M15 6l-6 6 6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => step(1)}
            aria-label="Próximo destaque"
            className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line-strong)] text-brand transition hover:border-accent hover:bg-accent hover:text-brand-deep"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>

      <div
        className="relative mt-6 overflow-hidden rounded-3xl border border-[var(--line)] bg-brand-deep"
        onMouseEnter={() => {
          if (window.matchMedia("(hover: hover)").matches) pausedRef.current = true;
        }}
        onMouseLeave={() => {
          pausedRef.current = false;
        }}
      >
        <div
          ref={trackRef}
          onScroll={(event) => {
            const el = event.currentTarget;
            const next = Math.round(el.scrollLeft / Math.max(el.clientWidth, 1));
            setIndex((prev) => (prev === next ? prev : next));
          }}
          className="flex snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
        >
          {SLIDES.map((slide, i) => (
            <div
              key={slide.src}
              role="group"
              aria-roledescription="slide"
              aria-label={`${i + 1} de ${SLIDES.length}`}
              className="w-full shrink-0 snap-start"
            >
              <div className="relative aspect-[16/10] w-full sm:aspect-[2.3/1] lg:aspect-[1640/620]">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 bg-cover"
                  style={{
                    backgroundImage: Math.abs(i - index) <= 1 ? `url(${slide.src})` : undefined,
                    backgroundPosition: slide.focus,
                  }}
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(15,23,42,0) 45%, rgba(15,23,42,0.62) 100%)",
                  }}
                />
                <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-4 sm:p-6">
                  <span className="rounded-full bg-brand-deep/80 px-3 py-1 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-accent-soft backdrop-blur-sm">
                    {slide.tag}
                  </span>
                  <Link
                    href={slide.href}
                    className="inline-flex items-center gap-1.5 rounded-full bg-accent px-4 py-2 text-xs font-bold text-brand-deep transition hover:bg-accent-soft sm:px-5 sm:py-2.5 sm:text-sm"
                  >
                    {slide.cta}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                      <path d="M5 12h14M13 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="absolute bottom-4 left-1/2 flex -translate-x-1/2 items-center gap-1.5 sm:bottom-5">
          {SLIDES.map((slide, i) => (
            <button
              key={slide.src}
              type="button"
              onClick={() => goTo(i)}
              aria-label={`Ir para o destaque ${i + 1}`}
              aria-current={i === index}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? "w-6 bg-accent" : "w-1.5 bg-light/50 hover:bg-light/80"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
