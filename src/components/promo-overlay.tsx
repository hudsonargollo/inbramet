"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { CONTACT } from "@/lib/contact";

const PROMO_IMAGE = "/products/jogomesa4cadeirasestampado.webp";

const slideUp = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0 },
};

export function PromoOverlay() {
  return (
    <motion.section
      initial="hidden"
      animate="show"
      transition={{ staggerChildren: 0.12 }}
      className="relative overflow-hidden bg-brand text-light"
    >
      <div className="mx-auto max-w-6xl px-5 py-16 sm:py-24">
        <div className="grid items-center gap-10 md:grid-cols-2">
          <motion.div variants={slideUp} className="text-center md:text-left">
            <motion.span
              variants={slideUp}
              className="inline-block rounded-full border border-[rgba(230,255,87,0.5)] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.22em] text-accent"
            >
              Conjunto destaque
            </motion.span>

            <motion.h2
              variants={slideUp}
              className="mt-5 font-display text-4xl font-black leading-tight tracking-tight sm:text-6xl"
            >
              JOGO DE MESA + 4 CADEIRAS
              <br />
              <span className="bg-gradient-to-r from-accent-soft to-accent bg-clip-text text-transparent">
                PRONTO PARA SUA SALA
              </span>
            </motion.h2>

            <motion.p variants={slideUp} className="mt-4 text-lg text-light/80">
              Estrutura metálica com tampo estampado polimérico e quatro cadeiras
              ergonômicas combinando. Peça hoje na Inbramet com entrega programada para todo o Brasil.
              <br className="hidden sm:block" />
              Pagamento na entrega ou on-line · Sem complicações.
            </motion.p>

            <motion.div variants={slideUp} className="mt-8 flex flex-wrap items-center justify-center gap-3 md:justify-start">
              <Link
                href="/shop/conjuntos"
                className="inline-block rounded-full bg-accent px-9 py-3.5 text-sm font-bold uppercase tracking-[0.14em] text-brand-deep transition hover:bg-accent-soft"
              >
                Ver conjuntos
              </Link>
              <a
                href={CONTACT.whatsappUrl || "/contact"}
                {...(CONTACT.whatsappUrl ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                className="inline-block rounded-full border border-[rgba(230,255,87,0.45)] px-9 py-3.5 text-sm font-medium uppercase tracking-[0.14em] text-light transition hover:border-accent hover:text-accent"
              >
                WhatsApp
              </a>
            </motion.div>
          </motion.div>

          <motion.div variants={slideUp} className="flex justify-center">
            <motion.img
              animate={{ scale: [1, 1.03, 1] }}
              transition={{ duration: 3.4, repeat: Infinity, ease: "easeInOut" }}
              src={PROMO_IMAGE}
              alt="Jogo de Mesa 4 Cadeiras Estampado — Inbramet"
              className="max-h-[340px] w-auto rounded-3xl bg-cream p-3 shadow-[0_28px_50px_-18px_rgba(0,0,0,0.65)]"
            />
          </motion.div>
        </div>
      </div>

      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgba(230,255,87,0.45)] to-transparent"
        aria-hidden="true"
      />
    </motion.section>
  );
}
