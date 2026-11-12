# Inbramet rebrand — full plan

## Current state
- Repo: /root/ClubeMkt/inbramet (Next.js 16 + Tailwind v4 + Prisma + PostgreSQL)
- Food brand: Casa del Camba (restaurant, Santa Cruz, Bolivia, since 1986)
- Target: Inbramet (furniture: chairs, tables, sets)
- Design system: /root/ClubeMkt/inbramet/docs/design-system.md (v1.0 draft)
- Working tree partial: layout.tsx + sample-data.ts renamed to furniture ✓

## Design system (from docs/design-system.md)
- Colors: slate-950 #0f172a (bg) / slate-900 #1e293b (cards) / gold #E6FF57 (single accent)
- Typography: serif headings (Outfit Light/Regular/SemiBold) + sans body (Inter)
- Layout: mobile-first bento, max-w-6xl, rounded-3xl
- Do: warm natural materials language, negative space, clean typographic headings
- Don't: glows, pulse/ping, gradients, generic AI imagery, decorative borders

## Execution order (highest impact first)
1. [x] CSS theme → Inbramet slate+gold (emojis/semantic utils added)
2. [x] Brand mark → InbrametIcon/InbrametMark (custom SVG stacked mark)
3. [x] layout.tsx → furniture (done in working tree; verify)
4. [x] sample-data.ts → furniture (done in working tree; verify)
5. [ ] site-header.tsx / site-footer.tsx / emblem.tsx → InbrametMark
6. [ ] Copy overhaul: home, shop, product, about, club-camba, cart, checkout, account, search, shipping, sucursal, contact, newsletter
7. [ ] Components: commitments, delivery-band, hero-slider, promo-overlay/slider, category-art, mobile-menu, support-chat, ai-assistant
8. [ ] Admin: dashboard, products, settings, orders, invoices, auth, branch, inventory, loyalty, messages, performance, insights, analytics
9. [ ] Docs: DEPLOY.md, README.md, design-system.md update, catalogo-pil.md
10. [ ] Images: replace food photos with furniture
11. [ ] Verify build + typecheck
