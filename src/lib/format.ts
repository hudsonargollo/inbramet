// Valores monetários em Reais (BRL): "R$ 159,00" ou "R$ 1.249,00".
const brl = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatPrice(amount: number): string {
  return brl.format(amount);
}

/** Campo legado `material` pode conter texto de preenchimento antigo. */
export function visiblePack(material: string | null | undefined): string | null {
  if (!material || /f[oó]rmula|matem[aá]tica/i.test(material)) return null;
  return material;
}

export function discountPercent(price: number, compareAt: number | null | undefined): number | null {
  if (!compareAt || compareAt <= price) return null;
  return Math.round(((compareAt - price) / compareAt) * 100);
}

/** Economia por produto em relação ao preço de comparação. */
export function savingsOf(price: number, compareAt: number | null | undefined): number | null {
  if (!compareAt || compareAt <= price) return null;
  return compareAt - price;
}

/** "12 de out. de 2026" em pt-BR. */
export function formatDate(
  date: Date | string,
  { year = true, time = false }: { year?: boolean; time?: boolean } = {}
): string {
  const d = typeof date === "string" ? new Date(date) : date;
  const opts: Intl.DateTimeFormatOptions = { day: "numeric", month: "short" };
  if (year) opts.year = "numeric";
  if (time) Object.assign(opts, { hour: "2-digit", minute: "2-digit" });
  return time ? d.toLocaleString("pt-BR", opts) : d.toLocaleDateString("pt-BR", opts);
}
