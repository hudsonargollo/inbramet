import type { CategoryView, ProductView } from "./types";

export type SearchCategory = CategoryView & { count: number };

export type SearchResult = {
  products: ProductView[];
  category: SearchCategory | null;
  corrections: { from: string; to: string }[];
  minPrice: number | null;
  maxPrice: number | null;
  onSale: boolean;
  partial: boolean;
};

const STOP = new Set(
  "a o os as um uma uns umas de da do das dos ao aos e ou para por com em no na nos nas que qual como quanto valor preco preço quero preciso busco buscar mostra tem e for of with in on to my me i want need show find all produto produtos item items r$ brl"
    .split(" ")
);

const ALIASES: Record<string, string> = {
  cadeiras: "cadeira",
  silla: "cadeira",
  sillas: "cadeira",
  poltrona: "cadeira",
  escrivaninha: "mesa",
  escritorio: "mesa",
  jantar: "conjunto",
  banquetas: "banqueta",
  taburete: "banqueta",
  bancos: "banco",
  jogo: "conjunto",
  jogos: "conjunto",
  kit: "conjunto",
  set: "conjunto",
  preta: "preto",
  amarela: "amarelo",
  vermelha: "vermelho",
  branca: "branco",
};

const CATEGORY_HINTS: Record<string, string> = {
  mesa: "mesa",
  bancada: "mesa",
  cadeira: "cadeira",
  silla: "cadeira",
  banco: "banco",
  banqueta: "banqueta",
  conjunto: "conjunto",
  jogo: "conjunto",
};

const SALE_WORDS = new Set([
  "sale", "sales", "discount", "offer", "offers", "deal", "deals", "off",
  "oferta", "ofertas", "desconto", "descontos", "promo", "promos", "promocao", "promocoes",
]);

function fold(s: string): string {
  return s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function singular(w: string): string {
  if (w.length > 3 && w.endsWith("s") && !w.endsWith("ss")) return w.slice(0, -1);
  return w;
}

function words(s: string): string[] {
  return fold(s)
    .split(/[^a-z0-9]+/)
    .filter(Boolean)
    .map(singular);
}

function distance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  const d: number[][] = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    let rowMin = Infinity;
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost);
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1);
      }
      rowMin = Math.min(rowMin, d[i][j]);
    }
    if (rowMin > max) return max + 1;
  }
  return d[a.length][b.length];
}

function similarity(q: string, t: string): number {
  if (q === t) return 1;
  if (q.length >= 3 && t.startsWith(q)) return 0.85;
  if (q.length < 3 || (q.length === 3 && t.length < 4)) return 0;
  const allowed = q.length >= 7 ? 2 : 1;
  return distance(q, t, allowed) <= allowed ? 0.65 : 0;
}

type Field = { words: string[]; weight: number };

function fieldsOf(p: ProductView): Field[] {
  return [
    { words: words(p.name), weight: 5 },
    { words: words(p.category.name), weight: 6 },
    { words: words(p.material ?? ""), weight: 3 },
    { words: words(`${p.description ?? ""} ${p.specs ?? ""}`), weight: 1 },
  ];
}

function parsePrice(text: string): { min: number | null; max: number | null; rest: string } {
  let min: number | null = null;
  let max: number | null = null;
  const num = (s: string) => {
    const n = Number(s.replace(/[.,]/g, "").replace(/k$/i, ""));
    return /k$/i.test(s) ? n * 1000 : n;
  };
  const N = String.raw`(?:R\$\s*)?(\d[\d.,]*k?)`;
  let rest = text
    .replace(new RegExp(String.raw`\b${N}\s*(?:-|a|ate|até|to)\s*${N}\b`, "gi"), (_, a, b) => {
      min = num(a);
      max = num(b);
      return " ";
    })
    .replace(new RegExp(String.raw`\b(?:menos de|ate|até|abaixo de|max|maximo|máximo|under|below)\s*${N}`, "gi"), (_, a) => {
      max = num(a);
      return " ";
    })
    .replace(new RegExp(String.raw`\b(?:a partir de|mais de|minimo|mínimo|acima de|from|min|over)\s*${N}`, "gi"), (_, a) => {
      min = num(a);
      return " ";
    });
  rest = rest.replace(new RegExp(String.raw`${N}\s*(?:ou menos|para baixo)\b`, "gi"), (_, a) => {
    max = num(a);
    return " ";
  });
  return { min, max, rest };
}

export function searchCatalog(
  query: string,
  products: ProductView[],
  categories: SearchCategory[]
): SearchResult {
  const { min, max, rest } = parsePrice(fold(query));
  const raw = words(rest).filter((w) => !STOP.has(w) && !/^\d+$/.test(w));
  const onSale = raw.some((w) => SALE_WORDS.has(w));
  const terms = raw.filter((w) => !SALE_WORDS.has(w)).map((w) => ALIASES[w] ?? w);

  const vocab = new Set<string>();
  const known = new Set<string>();
  for (const p of products) {
    fieldsOf(p).forEach((f, i) => f.words.forEach((w) => (i < 3 ? vocab : known).add(w)));
  }
  for (const c of categories) words(c.name).forEach((w) => vocab.add(w));
  vocab.forEach((w) => known.add(w));

  const corrections: { from: string; to: string }[] = [];
  const fixed = terms.map((t) => {
    if (known.has(t) || (t.length >= 3 && [...known].some((v) => v.startsWith(t)))) return t;
    let best = "";
    let bestScore = 0;
    for (const v of vocab) {
      const s = similarity(t, v);
      if (s > bestScore) [best, bestScore] = [v, s];
    }
    if (best) {
      corrections.push({ from: t, to: best });
      return best;
    }
    return t;
  });

  let category: SearchCategory | null = null;
  for (const t of fixed) {
    const target = CATEGORY_HINTS[t] ?? t;
    const hit = categories.find((c) => words(c.name).includes(target));
    if (hit) {
      category = hit;
      break;
    }
  }

  const inRange = (p: ProductView) =>
    (min == null || p.price >= min) &&
    (max == null || p.price <= max) &&
    (!onSale || (p.compareAtPrice != null && p.compareAtPrice > p.price));

  const categoryWord = category ? words(category.name)[0] : null;
  const scored = products.filter(inRange).map((p) => {
    const fields = fieldsOf(p);
    let score = 0;
    let matched = 0;
    for (const t of fixed) {
      const isCategoryWord = (CATEGORY_HINTS[t] ?? t) === categoryWord;
      const usable = isCategoryWord && p.category.slug !== category!.slug ? fields.slice(0, 3) : fields;
      let best = 0;
      for (const f of usable) for (const w of f.words) best = Math.max(best, similarity(t, w) * f.weight);
      if (isCategoryWord && p.category.slug === category!.slug) {
        const named = fields[0].words.some((w) => similarity(t, w) > 0);
        best = Math.max(best, 6) + (named ? 2 : 0);
      }
      if (best > 0) matched++;
      score += best;
    }
    score += (p.stock > 0 ? 0.3 : 0) + (p.featured ? 0.1 : 0);
    return { p, score, matched };
  });

  if (fixed.length === 0) {
    const list = scored.sort((a, b) => b.score - a.score).map((x) => x.p);
    return { products: list, category: null, corrections, minPrice: min, maxPrice: max, onSale, partial: false };
  }

  const all = scored.filter((x) => x.matched === fixed.length);
  const some = scored.filter((x) => x.matched > 0);
  const partial = all.length === 0 && some.length > 0;
  const list = (partial ? some : all).sort((a, b) => b.matched - a.matched || b.score - a.score).map((x) => x.p);

  return { products: list, category, corrections, minPrice: min, maxPrice: max, onSale, partial };
}
