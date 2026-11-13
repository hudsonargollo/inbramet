import type { LoyaltySettings } from "./settings-shared";

export type LoyaltyLine = {
  productId: string;
  productSlug: string;
  categorySlug: string;
  quantity: number;
};

export function stampEligible(
  line: Pick<LoyaltyLine, "productSlug" | "categorySlug">,
  rules: LoyaltySettings
): boolean {
  if (!rules.enabled) return false;
  if (rules.eligible === "all") return true;
  const slug = rules.eligible === "category" ? line.categorySlug : line.productSlug;
  return rules.eligibleSlugs.includes(slug);
}

export function stampsForLine(
  line: Pick<LoyaltyLine, "quantity">,
  rules: LoyaltySettings,
  ownedForProduct: number
): number {
  const remaining = Math.max(0, rules.stampsToFree - ownedForProduct);
  return Math.min(line.quantity, remaining);
}

export function pointsForOrder(
  amounts: { subtotal: number; shipping: number },
  rules: LoyaltySettings
): number {
  if (!rules.enabled || rules.pointsAmount <= 0 || rules.pointsPer <= 0) return 0;
  const spend = amounts.subtotal + (rules.pointsOnShipping ? amounts.shipping : 0);
  return Math.floor(spend / rules.pointsAmount) * rules.pointsPer;
}

export type StampCard = {
  size: number;
  filled: number;
  remaining: number;
  full: boolean;
};

export function stampCard(owned: number, rules: LoyaltySettings): StampCard {
  const size = Math.max(1, rules.stampsToFree);
  const filled = Math.min(Math.max(0, owned), size);
  return { size, filled, remaining: Math.max(0, size - owned), full: owned >= size };
}

export function previewLoyalty(
  lines: LoyaltyLine[],
  amounts: { subtotal: number; shipping: number },
  rules: LoyaltySettings,
  ownedStamps: Record<string, number> = {}
): { stampsByProduct: Record<string, number>; stamps: number; points: number } {
  const stampsByProduct: Record<string, number> = {};
  let stamps = 0;
  if (rules.enabled) {
    const earned: Record<string, number> = {};
    for (const line of lines) {
      if (!stampEligible(line, rules)) continue;
      const pool = (ownedStamps[line.productId] ?? 0) + (earned[line.productId] ?? 0);
      const got = stampsForLine(line, rules, pool);
      if (got > 0) {
        earned[line.productId] = (earned[line.productId] ?? 0) + got;
        stamps += got;
      }
    }
    for (const [id, n] of Object.entries(earned)) if (n > 0) stampsByProduct[id] = n;
  }
  return { stampsByProduct, stamps, points: pointsForOrder(amounts, rules) };
}

export type LoyaltyCartPreview = {
  ok: true;
  enabled: boolean;
  name: string;
  stampsToFree: number;
  points: number;
  stamps: number;
  balance: { points: number; stamps: number };
  cards: { productId: string; name: string; filled: number; size: number }[];
  redeemable: { productId: string; name: string; price: number }[];
};

export function stampRuleLabel(rules: LoyaltySettings): string {
  const n = rules.stampsToFree;
  return `${n === 1 ? "1 selo" : `${n} selos`} = 1 produto grátis`;
}

export function pointRuleLabel(rules: LoyaltySettings): string {
  const val = new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
    maximumFractionDigits: 0,
  }).format(rules.pointsAmount);
  const pts = rules.pointsPer === 1 ? "1 ponto" : `${rules.pointsPer} pontos`;
  return `${pts} a cada ${val} em compras`;
}

export function movementLabel(h: {
  kind: string;
  product: { name: string } | null;
  reward: { name: string } | null;
  order: { orderNumber: string } | null;
  note: string | null;
}): string {
  switch (h.kind) {
    case "STAMP":
      return `Pedido ${h.order?.orderNumber ?? ""} — ${h.product?.name ?? "produto"}`;
    case "POINT":
      return `Compra ${h.order?.orderNumber ?? ""}`;
    case "REDEEM_STAMP":
      return `Resgate de ${h.product?.name ?? "produto"} grátis`;
    case "REDEEM_PRIZE":
      return `Brinde resgatado: ${h.reward?.name ?? ""}`;
    case "REFUND":
      return `Pedido cancelado ${h.order?.orderNumber ?? ""}`;
    default:
      return h.note ?? "Ajuste";
  }
}
