# Inbramet rebrand — status & remaining work

Last audit: 2026-11-12 (working tree, branch `main`, HEAD `6bd15f5`)

Goal: replace every `casadelcamba` / "Casa del Camba" reference and brand asset in this
folder with `Inbramet` (furniture brand, inbramet.clubemkt.digital), including logos and
product images. Nothing from the old food brand should survive.

---

## 1. DONE — storefront & admin copy (40 files)

Global text replacement `Casa del Camba` → `Inbramet` across `src/**` (pages, components,
lib). Verified: `grep -r "Casa del Camba" src/` returns 0 hits.

- `src/app/layout.tsx` — metadata title/template/applicationName/siteName
- `src/app/(store)/**` — home, shop, product, about, faq, shipping, care, custom, club-camba,
  sucursal, contact, search, account, cart, checkout, login/register/verify
- `src/app/admin/**` — dashboard, products, orders, invoices, settings, branches, loyalty,
  customers, messages, analytics, insights, performance, login
- `src/components/**` — header, footer, hero, emblem, promo, commitments, delivery-band,
  newsletter, auth, cart, checkout, support-chat, admin shell, loyalty, icons
- `src/lib/**` — email, payments, auth, otp, ai-assistant, customer-auth

## 2. DONE — brand assets

Old food logos deleted from `public/images/`:
- `casadelcamba-icon.png`, `casadelcamba-logo.png`, `hero-casadelcamba.webp` (staged `D`)

New Inbramet assets added (untracked):
- `public/images/inbramet-icon.png`
- `public/images/inbramet-logo.png`
- `public/images/hero-inbramet.webp`
- `public/products/inbramet-icon.png`, `inbramet-icon-transparent.png`, `inbramet-logotype.png`

All 9 call sites now point at the new files (header, footer, admin shell ×2, auth shell,
hero-slider, emblem, home page).

## 3. DONE — config & docs

`.env.example`, `netlify.env.example`, `README.md`, `prisma/seed.ts`, `prisma/copy-data.ts`,
`prisma/create-admin.ts` — all `casadelcamba` → `inbramet` (DB name, admin email, mail from,
uploads volume, Instagram handle, Linktree link).

## 4. DONE — build & deploy (verified live)

- `npm run build` (Next 16.4.3) ✓
- `opennextjs-cloudflare build` ✓ (`.open-next/worker.js`)
- `opennextjs-cloudflare deploy` ✓ — Version `db7bf35a`, worker `inbramet`
- Live check: `https://inbramet.hudsonargollo2.workers.dev/` and
  `https://inbramet.clubemkt.digital/` both serve the Inbramet home page (50 "Inbramet" hits).

---

## 5. REMAINING — old food brand still in the repo

### 5a. Catalog data (food → furniture)
- `public/imgs/menu/` — **51 food photos** (majao, empanadas, parrilla, gaseosas…). These are
  the old restaurant's product images and must be replaced with Inbramet furniture photos.
- `src/lib/sample-data.ts` — 58 food products / 10 food categories (Entradas, Empanadas,
  Sopas, Platos típicos, Parrilla, Bebidas, Postres…). Fallback catalog used when the DB is
  unreachable.
- `prisma/seed.ts` — same food menu (PedidosYa listing), categories + branches + products.
- 66 references to `/imgs/menu/*` across `src/`.

### 5b. Theme CSS
- `src/app/globals.css` — comment still says "Casa del Camba — brand theme … client's
  'La Casa del Camba' logo (palm, sun and orange roof)". Palette is still the camba green
  `#4c8a23 / #3c6e1b / #1d3a0e` + sun yellow `#ffcc04`. Inbramet tokens (per
  `rebrand-plan.md`) are slate `#0f172a / #1e293b / #334155` + gold `#E6FF57` + paper
  `#F8FAF6`. Not yet applied.

### 5c. Copy that still reads as the old restaurant
- `src/components/hero-slider.tsx:55` — `words={["de Santa Cruz", "camba de verdad", "para compartir"]}`
- `src/components/promo-slider.tsx:23` — "El sabor camba de siempre, a Bs 55"
- `src/app/(store)/shop/page.tsx:47`, `shop/[category]/page.tsx` — "sabores camba", "guarniciones"
- `src/app/(store)/page.tsx` — "sabor camba", "Desde 1986", "comida típica cruceña"
- `src/components/site-footer.tsx:28` — "Tradición camba desde 1986"
- `src/components/site-header.tsx` / `mobile-menu.tsx` — nav label "Menú", loyalty link `/club-camba`
- `src/lib/settings.ts` — announcements ("Delivery en moto en Santa Cruz · 13 sucursales",
  "Tradición camba desde 1986"), loyalty name "Club Camba"

### 5d. Session token signing secret (functional)
- `src/lib/session-token.ts:25,29` — HMAC label still `CasaDelCamba`. Changing it invalidates
  every existing admin/customer/reset/verify token (all sessions logged out). Safe to change
  now (fresh brand, no live users to preserve).

### 5e. Deploy scripts
- `Dockerfile:34`, `scripts/deploy.sh:2,7,8`, `start-store.sh:2,4,8,9,15` — comments/paths still
  `casadelcamba` (`/var/www/casadelcamba`, `casadelcamba.service`).

### 5f. Planning notes
- `rebrand-plan.md`, `rebrand-tracker.md` — describe the old brand. Update or delete.

---

## 6. Not a blocker

- `wrangler.jsonc` declares an `assets.binding` named `ASSET_BINDING`. Wrangler reserves the
  binding name `ASSETS` for Pages asset binding; this custom name works (deploy succeeded,
  `env.ASSET_BINDING` bound). Consider renaming to avoid confusion.
- Cloudflare Pages project `inbramet` still has `inbramet.clubemkt.digital` registered as a
  Pages domain (status pending CNAME). The Worker route serves the site; non-Worker routes
  (`/shop`, etc.) 404 because the Pages domain registration takes precedence. Removing the
  Pages domain registration requires an API token with DNS/pages-domain scope.
