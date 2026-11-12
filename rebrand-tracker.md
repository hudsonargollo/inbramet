# inbramet rebrand — task tracker

## Goal
Rebrand the Casa del Camba food store (casadelcamba.clubemkt.digital) into the Inbramet
furniture brand. Completed so far (partial, in working tree):
- src/app/layout.tsx — title/desc/keywords/icons → Inbramet furniture ✓
- src/lib/sample-data.ts — sample catalog → furniture ✓

## Remaining scope (from audit of src/ + public/ + docs)
- [ ] CSS theme: replace Casa-del-Camba green theme → Inbramet slate + gold
- [ ] Brand mark: site-header/footer/emblem/logo images, favicon (food logo → Inbramet icon)
- [ ] Copy: replace food/restaurant copy (menu, 1986, Santa Cruz,Bolivia, criollo) with furniture copy
- [ ] Pages: shop, product, about, club-camba, cart, checkout, account, search, shipping, sucursal, success, custom, faq, contact, newsletter, commitments, delivery-band, hero-slider, promo-overlay/slider, category-art, mobile-menu, etc.
- [ ] Admin: dashboard, products, settings, orders, invoices, auth, branch, inventory, loyalty, messages, performance, insights, analytics
- [ ] Docs: DEPLOY.md, README.md, design-system.md (update status), catalogo-pil.md
- [ ] Images: remove food photos, keep furniture

## Design tokens (Inbramet)
- Slate: #0f172a bg / #1e293b cards / #334155 elevated
- Gold: #E6FF57 accent (single per page), gold-soft #F6F9E0, paper #F8FAF6
- Ink: #0F172A text (dark) / #F8FAF6 (light)
- Serif display (headings), sans body. Mobile-first, bento, rounded-3xl.
