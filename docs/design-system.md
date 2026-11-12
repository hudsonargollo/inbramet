# Inbramet — Brand Guidelines & Design System

> Living document. Version: 1.0 · Draft. Status: `docs/design-system.md` — Inbramet v1.0

## 1 · Brand Overview

**inbramet** is a furniture brand manufacturing and selling chairs, tables, and related
pieces. Clean, durable, modern — built for people who care about the edges.

**Brand promise:** furniture that looks considered and feels solid, without the noise.

**Brand essence:** *Defined craft.*
Shape you can feel. Lines that read even at a glance. No decoration for its own sake.

**Personality:** Restrained · Grounded · Considered · Premium-but-not-pretentious.
Think warm workshop, quiet modern living room — not a showroom flash.

**Tone of voice:**
- Editorial and calm. Short, confident sentences. No hype.
- Describe the piece, not the "lifestyle." Say *"a heavy oak table with a pouring edge"*
  not *"the table that changes your room."*
- Hospitality language, not feature-bullets: "designed to hold," "finished to last,"
  "commands a corner."
- pt-BR (Brazil) for the patient-facing/lifecycle copy; strong nouns, active verbs,
  zero fluff.

**Do / Don't:**
- ✅ Do use warm, natural materials language (oak, walnut, steel, clay, leather).
- ✅ Do let negative space breathe.
- ✅ ✅ Do keep headings quiet and typographic.
- ❌ Don't use decorative glows, pulse/ping animations, or heavy gradients.
- ❌ Don't use generic AI-looking imagery or clip-art.
- ❌ Don't use decorative borders/frames around everything.

---

## 2 · Logo & Wordmark

**Primary lockup:** Stacked. Icon above, wordmark below.
```
   [inbramet]
   inbramet
```
- **Icon:** A custom SVG mark (not a clip-art icon). Concept: a stacked form —
  a subtle "compass/arch" suggesting both furniture construction and a held form.
  Single path, filled, geometric.
- **Lockups:**
  - *Primary:* mark + wordmark stacked (as above).
  - *Secondary:* stacked mark + "inbramet" in title case.
  - *Icon-only:* single SVG tile (for padding, favicon, app icon).
  - *Clear space:* lockup clearspace = height of the "i" dot horizontally; min 4px margin around icon.
  - *Minimum size:* mark width 24px. Do not scale below.
  - *Application:* never place on busy photos; use a dark or light "safe zone" plate
    (solid #0f172a or #fff) when overlay is unavoidable.

**Colors associated with the mark:** deep slate (`#0f172a`) + warm gold accent
(`#E6FF57`). The gold carries the mark; slate carries the page.

---

## 3 · Color System

Palette: *slate + warm gold*. Dark, grounded, finished in a calm gold.

| Token | Name | Hex | Usage |
|---|---|---|---|
| `slate-950` | Background | `#0f172a` | Page/base dark |
| `slate-900` | Surface | `#1e293b` | Cards, panels |
| `slate-800` | Elevated | `#334155` | Hover states, borders |
| `slate-700` | Subtext | `#475569` | Body emphasis |
| `slate-600` | Text muted | `#64748b` | Captions, meta |
| `gold` | Accent | `#E6FF57` | Primary actions, headings accent |
| `gold-soft` | Gold tint | `#F6F9E0` | Background hints, highlights |
| `paper` | Paper | `#F8FAF6` | Light mode cards, alt light |
| `ink` | Ink | `#0F172A` | Light mode text |

**Rules:**
- Base background on dark mode: `slate-950` + single subtle layer (never noise/gradient).
- Gold is used sparingly: one per page as an accent, not repeated as a background.
- Light mode: `paper` background + `slate-900` text + `gold` accents.
- Do not use gold as a page background or on text larger than heading size.
- Borders: `slate-800` (dark) / `slate-200` (light), 1px.

---

## 4 · Typography

**Typefaces:** One serif (headings) + one sans (body/UI). No other families.

| Role | Family | Style | Weight |
|---|---|---|---|
| Display / headings | *A classical serif* (e.g. a clean old-style serif) | Titles, section heads, product names | Light / Regular / SemiBold |
| Body / UI / metadata | *A neutral sans* (e.g. a humanist sans) | Body copy, labels, nav, meta | Regular / Medium |

**Scale** (mobile first, rem units):
```
3.0rem   —  H1 / hero eyebrow
2.25rem  —  H2 / page title
1.75rem  —  section heading
1.5rem   —  H3 / product card title
1.25rem  —  panel / modal title
1rem     —  body base
0.875rem —  small / caption
0.75rem  —  meta / footnote
```

**Rules:**
- Headings: serif, not all-caps, not feature-lists. One idea per heading.
- Body: max-width ~65ch for prose. Line-height 1.6.
- Captions/metadata: sans, `slate-600`, 0.875rem.
- Never use more than two font families per page. Never use gold for text (reserved as
  a mark/accent color).
- For the gold-accented heading variant (used in a few premium spots), keep the serif
  weight Light/SemiBold and let the `gold` color do the emphasis — not the size.

---

## 5 · Imagery & Iconography

**Photography:** Warm, natural light. Real products on real surfaces (wood, clay,
steel, leather). Product shots on seamless light neutral ground (paper/light-slate),
occasionally on a human scale. No sterile white backgrounds.

**Icons:** Custom SVG line icons, thin stroke (1.5–2px), consistent anchor.
- *Custom SVG* only (per the design direction). No emoji, no dashicons, no external icon
  library.
- Used for: nav, section labels, product attributes (material, finish), pagination,
  cart actions, admin nav.

**Illustration:** None. Decorative illustration is out of scope for v1.

**Qty/sound:** No sound. No pulse/ping/rising animations anywhere. A single subtle
layer (e.g. a faint background texture or a soft fade-in on load), never repeated.

---

## 6 · Layout & Grid

**Grid:** Bento layout as the backbone. Squares/rectangles of varying size, staggered to
create rhythm. Mobile-first: bento folds into a single column on small screens.

**Container:** `max-w-6xl` (72rem) centered, `px-4 sm:px-6 lg:px-8`.

**Spacing scale** (mobile-first, rem):
```
1rem  —  base section gap
1.5rem —  moderate gap
2rem   —  generous gap
3rem   —  page-top / major section
4rem+  —  spotlight / full-bleed
```

**Component minimums:**
- Rounded-3xl (`rounded-3xl` = ~1.5rem) for product cards, cards, panels.
- Buttons: `rounded-full` for primary; `rounded-xl` for outlined/secondary.
- Images: `rounded-3xl` (product card), `rounded-2xl` (banners/hero).

**Bento rules:**
- Even numbers of equal tiles prefer odd-numbered splits (e.g. 3, 5) to avoid a
  "matching-grid" feel.
- Dense areas balanced by a large negative space.
- Never let a tile exceed the container width by more than 1 tile's worth.

---

## 7 · Components

**Button — Primary:**
```
Display: inline-flex items-center gap-2
Padding: px-6 py-3
Radius: rounded-full
Border: 1px solid gold (dark) / gold-soft (light)
BG: solid gold (dark) / ink (light)
Text: slate-950 (dark) / white (light)
Hover: slightly darken gold / lift 1px
Active: scale 0.98
```

**Button — Secondary (outlined):**
```
Border: 1px solid slate-800 (dark) / slate-300 (light)
BG: transparent
Text: slate-800 (dark) / slate-900 (light)
Hover: bg slate-800 (dark) / slate-100 (light)
```

**Product card:**
```
Border: 1px solid slate-800 / slate-200
Radius: rounded-3xl
Overflow: hidden (image on top, content below)
Image: `aspect-[4/3]` or natural, object-cover
Body: product name (1.5rem serif), price, 1-line category, material/finish pill
Hover: border lightens, image zooms ~8%, gold pill lights up
```

**Badge / pill (material, finish, stock):**
```
Size: px-2 py-0.5, text 0.75rem
Radius: rounded-full
Colors (per material): 
  oak = #B45309 (warm brown)
  walnut = #6B4226 (dark brown)
  steel = #475569 (slate)
  clay = #7C5CBF (warm purple) 
  leather = #4C1D95 (deep purple)
  gold = #B45309 (falls back to accent)
Text: slate-900 (dark) / slate-100 (light)
```

**Nav / header:**
```
Fixed or sticky top, 1px border bottom
Height: ~64px (mobile) / 80px (desktop)
Text: 0.875rem sans, slate-800 (dark) / slate-200 (light)
Gold: "inbramet" wordmark in nav, or a single gold accent at the center
Mobile menu: slide-down with bento sections; no overlay blur.
```

**Footer:**
```
Border top slate-800 (dark) / slate-200 (light)
Rows: links, social, contact, legal
Text: 0.875rem, slate-600 (dark) / slate-500 (light)
```

---

## 8 · Templates

**Homepage (mobile-first, bento):**
1. *Hero* — editorial heading + feature product image, single gold accent on the H1.
2. *Brand / About* — short narrative copy + one hero imagery (no header/footer clutter).
3. *Bento: shops & categories* — odd split (e.g. 3/5 + 2/5), product cards in slate
   cards with material pills.
4. *Featured pieces* — 2-row bento (large image left, editorial right).
5. *Trust / how it works* — 3-cell bento (right 3, left 2), icons + copy.
6. *Footer* — as above.

**Product page:**
- Left: product image (larger), right: info.
- Name (serif, 2.25rem) · price · material/finish pills · short description.
- "Quick add" CTA button (gold, rounded-full).
- Supporting images in a row (2 x `aspect-[4/3]` cards), no hover zoom beyond 8%.

**Checkout:**
- Narrower container (`max-w-3xl`), single-column form cards.
- Step indicators as simple gold bullets (no animation).
- Error states: solid red `slate-900`/`#DC2626` border, inline message, no shake.

**Admin dashboard:**
- Sidebar: nav items, custom SVG icons, slate-900 background.
- Main: white/light cards, table rows, data visualizations in `slate-700` lines,
  gold as the single highlight accent.
- No decorative borders around everything; reduce border density.

---

## 9 · Brand Do / Don't

**Do:**
- Use warm natural materials language.
- Let negative space breathe.
- Keep headings clean and typographic.
- Use gold as the single accent, not a background.
- Use custom SVG icons.

**Don't:**
- Don't use decorative glows, pulse/ping animations, or heavy gradients.
- Don't use generic AI-slope imagery or clip-art icons.
- Don't repeat gold as a background or on body text.
- Don't stack more than two font families per page.
- Don't use brights (neon, pure white, primary blue) as page background.

---

## 10 · Next Steps

1. Migrate brand assets into `public/` once finalized:
   - `inbramet-logo.svg` (mark + lockups)
   - `inbramet-icon.svg` (icon-only)
   - `favicon.svg`
   - `library/` (SVG icon set, patterns)
2. Replace `inbramet` references in code/placeholders with `inbramet`.
3. Re-skin the global CSS tokens (`slate-950`, `gold`, etc.) in Tailwind.
4. Build the homepage template to the design spec above.
5. Product photo replacement from the uploaded images.

---

*Ingest ref: public/instagram.png, public/subheader.png (placed in repo, path recorded).*
*design direction carried over from inbramet: glassmorphism-gold-on-slate, bento, rounded-3xl, medical-pastel → furniture adaptation.*
