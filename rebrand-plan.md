# Inbramet rebrand — full plan

## Target
- Repo: /root/ClubeMkt/inbramet (Next.js 16 + Tailwind v4 + Prisma + PostgreSQL)
- Brand: Inbramet — furniture (chairs, tables, benches, sets), pt-BR, Brazil/São Paulo
- Design system: `docs/design-system.md`
- Old brand: Casa del Camba (restaurant, Santa Cruz, Bolivia) — fully removed

## Design tokens (applied in `src/app/globals.css`)
- Slate: #0f172a bg / #1e293b cards / #334155 elevated
- Gold: #E6FF57 accent (single per page), gold-soft #F6F9E0, paper #F8FAF6
- Ink: #0F172A text / #F8FAF6 on dark
- Outfit (display) + Inter (body). Mobile-first bento, max-w-6xl, rounded-3xl.
- Do: natural materials language, negative space, clean headings.
- Don't: glows, pulse/ping, gradients, generic AI imagery, decorative borders.

## Execution order
1. [x] Furniture pivot (AI Studio) — catalog, theme, metadata, pt-BR copy
2. [x] Remove all old-brand references (code, cookies, session token, deploy, docs)
3. [x] Loyalty route `/club-camba` → `/clube-inbramet`
4. [x] Chairs: 9 → 3 products × 3 images each
5. [ ] Seed live DB (`.env` + migration + `npm run db:seed`)
6. [ ] Remove unreferenced food photos (`public/imgs/menu/`)
7. [ ] Deploy to Cloudflare + verify products from DB
