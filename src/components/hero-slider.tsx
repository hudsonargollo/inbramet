"use client";

import { preload } from "react-dom";
import Link from "next/link";
import { RotatingWord, SplitText } from "./text-reveal";

const HERO = "/products/jogomesa4cadeirasazul.webp";
const LOGO = "/products/inbramet-icon-transparent.png";

export function HeroSlider() {
  preload(HERO, { as: "image", fetchPriority: "high" });
  preload(LOGO, { as: "image", fetchPriority: "high" });

  return (
    <section className="relative overflow-hidden bg-brand text-light">
      <div
        aria-hidden="true"
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: `url(${HERO})` }}
      />
      <div
        aria-hidden="true"
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(90deg, rgba(15,23,42,0.96) 0%, rgba(15,23,42,0.84) 44%, rgba(15,23,42,0.45) 72%, rgba(15,23,42,0.18) 100%)",
        }}
      />
      <div aria-hidden="true" className="absolute inset-0 bg-brand/55 lg:hidden" />

      <div className="relative mx-auto max-w-6xl px-6 py-24 sm:py-32 lg:py-36">
        <div className="mx-auto max-w-xl text-center lg:mx-0 lg:text-left">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={LOGO}
            alt="Inbramet"
            width={228}
            height={169}
            className="mx-auto h-20 w-auto drop-shadow-[0_18px_40px_rgba(0,0,0,0.55)] sm:h-24 lg:mx-0 lg:h-28"
          />
          <span className="mt-6 inline-flex items-center gap-2.5 text-xs font-semibold uppercase tracking-[0.2em] text-accent">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden="true" />
            Móveis Inbramet · Design funcional
          </span>
          <h1 className="mt-3 max-w-[19ch] font-display text-4xl font-extrabold leading-[1.04] tracking-tight text-balance sm:text-5xl lg:text-[4rem]">
            <SplitText text="Espaços pensados" delay={80} />{" "}
            <RotatingWord
              words={["para viver bem", "com conforto real", "para compartilhar"]}
              className="text-accent"
            />
          </h1>
          <p className="mt-5 max-w-md text-pretty text-lg leading-relaxed text-light/85">
            Mesas, cadeiras, bancos e conjuntos em aço, madeira e polímero de alta
            resistência. Compre on-line com entrega programada para todo o Brasil.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Link
              href="/shop"
              className="inline-block rounded-full bg-accent px-8 py-3.5 text-sm font-bold text-brand-deep transition duration-300 hover:-translate-y-0.5 hover:bg-accent-soft"
            >
              Ver a coleção
            </Link>
            <Link
              href="/custom"
              className="inline-block rounded-full border border-light/50 px-8 py-3.5 text-sm font-semibold text-light transition hover:border-accent hover:bg-light/5 hover:text-accent"
            >
              Pedidos sob medida
            </Link>
          </div>

          <p className="mt-8 text-xs font-medium uppercase tracking-[0.16em] text-light/60">
            Entrega especializada em todo o Brasil · Pagamento na entrega ou on-line
          </p>
        </div>
      </div>
    </section>
  );
}
