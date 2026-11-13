# Inbramet rebrand — status

Updated 2026-11-13. Branch `pivot-furniture` (base: AI Studio commit `c9c2d40`).

## Done
- [x] Furniture pivot (AI Studio `c9c2d40`): catalog, theme, metadata, pt-BR copy
- [x] CSS theme → Inbramet slate + gold (`src/app/globals.css`)
- [x] Brand mark → `public/products/inbramet-icon.png` (favicon + layout icons)
- [x] All `casadelcamba` / `Casa del Camba` references removed from code, config, docs
  - cookies (`inbramet_admin`, `inbramet_customer`, `inbramet_verify`), `proxy.ts`
  - session-token HMAC label, deploy scripts, Dockerfile, README, package-lock
- [x] Loyalty route `/club-camba` → `/clube-inbramet` (dir renamed, all links updated)
- [x] Chairs consolidated: 9 → 3 products, each with 3 images
  (`src/lib/sample-data.ts`, `prisma/seed.ts`)
- [x] Build passes

## Catalog (current)
3 chairs (Amarela / Preta / Vermelha, 3 photos each), 2 mesas, 2 bancos,
3 conjuntos = 10 products. Images in `public/products/`.

## Remaining
- [ ] Seed the live DB: create `.env` (DATABASE_URL etc.), run migration + `npm run db:seed`
- [ ] Remove leftover food photos in `public/imgs/menu/` (51 files, now unreferenced)
- [ ] Deploy `pivot-furniture` to Cloudflare (build + `opennextjs-cloudflare deploy`)
- [ ] Verify products render from DB (not sample fallback) after seed
