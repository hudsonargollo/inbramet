import { randomInt } from "node:crypto";
import type { Prisma } from "@prisma/client";
import { dbConfigured, prisma } from "./prisma";
import type { LoyaltySettings } from "./settings-shared";
import { previewLoyalty, stampCard, type LoyaltyLine } from "./loyalty-shared";

export type LoyaltyBalances = {
  points: number;
  stampsByProduct: Record<string, number>;
  readyForRedemption: string[];
  totalStamps: number;
};

class LoyaltySpendError extends Error {}

function withinWindow(createdAt: Date, expiryDays: number, now: number): boolean {
  if (!expiryDays || expiryDays <= 0) return true;
  return now - createdAt.getTime() <= expiryDays * 86_400_000;
}

export async function getBalances(
  customerId: string,
  rules: LoyaltySettings
): Promise<LoyaltyBalances> {
  if (!dbConfigured) {
    return { points: 0, stampsByProduct: {}, readyForRedemption: [], totalStamps: 0 };
  }
  const rows = await prisma.loyaltyEntry.findMany({
    where: { customerId },
    select: { stamps: true, points: true, productId: true, createdAt: true },
  });
  const now = Date.now();
  const stampsByProduct: Record<string, number> = {};
  let points = 0;
  let totalStamps = 0;
  for (const r of rows) {
    if (!withinWindow(r.createdAt, rules.expiryDays, now)) continue;
    if (r.points) points += r.points;
    if (r.stamps) {
      totalStamps += r.stamps;
      const key = r.productId ?? "";
      stampsByProduct[key] = (stampsByProduct[key] ?? 0) + r.stamps;
    }
  }
  const full = Math.max(1, rules.stampsToFree);
  const readyForRedemption = Object.entries(stampsByProduct)
    .filter(([id, n]) => id !== "" && n >= full)
    .map(([id]) => id);
  return { points, stampsByProduct, readyForRedemption, totalStamps };
}

async function balanceOf(
  tx: Prisma.TransactionClient,
  customerId: string,
  field: "points" | "stamps",
  productId?: string
): Promise<number> {
  const res = await tx.loyaltyEntry.aggregate({
    where: { customerId, ...(productId ? { productId } : {}) },
    _sum: { [field]: true },
  });
  return res._sum[field] ?? 0;
}

export async function accrueOrder(
  tx: Prisma.TransactionClient,
  input: {
    orderId: string;
    customerId: string;
    lines: LoyaltyLine[];
    amounts: { subtotal: number; shipping: number };
    rules: LoyaltySettings;
    ownedStamps: Record<string, number>;
  }
): Promise<{ stamps: number; points: number }> {
  const preview = previewLoyalty(input.lines, input.amounts, input.rules, input.ownedStamps);
  for (const [productId, stamps] of Object.entries(preview.stampsByProduct)) {
    await tx.loyaltyEntry.create({
      data: {
        customerId: input.customerId,
        orderId: input.orderId,
        productId,
        kind: "STAMP",
        stamps,
      },
    });
  }
  if (preview.points > 0) {
    await tx.loyaltyEntry.create({
      data: {
        customerId: input.customerId,
        orderId: input.orderId,
        kind: "POINT",
        points: preview.points,
      },
    });
  }
  return { stamps: preview.stamps, points: preview.points };
}

export async function redeemStamps(
  tx: Prisma.TransactionClient,
  input: { customerId: string; productId: string; orderId?: string; rules: LoyaltySettings }
): Promise<void> {
  const owned = await balanceOf(tx, input.customerId, "stamps", input.productId);
  const card = stampCard(owned, input.rules);
  if (!card.full)
    throw new LoyaltySpendError(
      `Faltam ${card.remaining} selos para resgatar este produto.`
    );
  await tx.loyaltyEntry.create({
    data: {
      customerId: input.customerId,
      productId: input.productId,
      orderId: input.orderId,
      kind: "REDEEM_STAMP",
      stamps: -input.rules.stampsToFree,
    },
  });
}

const REDEEM_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

function generateRedemptionCode(): string {
  let code = "";
  for (let i = 0; i < 6; i++) code += REDEEM_ALPHABET[randomInt(REDEEM_ALPHABET.length)];
  return code;
}

export type RedeemResult = { ok: true; code: string } | { ok: false; error: string };

export async function redeemReward(input: {
  customerId: string;
  rewardId: string;
  branchId?: string | null;
  rules: LoyaltySettings;
}): Promise<RedeemResult> {
  if (!input.rules.enabled) return { ok: false, error: "O programa de pontos está pausado." };
  if (!dbConfigured) return { ok: false, error: "Programa indisponível sem conexão com o banco." };
  for (let attempt = 0; attempt < 4; attempt++) {
    const code = generateRedemptionCode();
    try {
      return await prisma.$transaction(async (tx) => {
        const reward = await tx.reward.findFirst({
          where: { id: input.rewardId, active: true },
          select: { id: true, name: true, costPoints: true, stock: true },
        });
        if (!reward) return { ok: false, error: "Este brinde não está mais disponível." };
        if (reward.stock <= 0)
          return { ok: false, error: `"${reward.name}" está esgotado no momento.` };

        await tx.loyaltyEntry.create({
          data: {
            customerId: input.customerId,
            rewardId: reward.id,
            kind: "REDEEM_PRIZE",
            points: -reward.costPoints,
          },
        });
        const balance = await balanceOf(tx, input.customerId, "points");
        if (balance < 0) throw new LoyaltySpendError("Seus pontos não são suficientes para este brinde.");
        const stock = await tx.reward.updateMany({
          where: { id: reward.id, stock: { gt: 0 } },
          data: { stock: { decrement: 1 } },
        });
        if (stock.count !== 1) throw new LoyaltySpendError(`"${reward.name}" está esgotado no momento.`);

        await tx.redemption.create({
          data: {
            code,
            customerId: input.customerId,
            rewardId: reward.id,
            rewardName: reward.name,
            costPoints: reward.costPoints,
            branchId: input.branchId ?? null,
          },
        });
        return { ok: true as const, code };
      });
    } catch (err) {
      if (err instanceof LoyaltySpendError) return { ok: false, error: err.message };
      const msg = err instanceof Error ? err.message : "";
      if (/P2002|Unique constraint/i.test(msg) && /code/.test(msg)) continue;
      console.error("[loyalty] reward redemption failed:", err);
      return { ok: false, error: "Não foi possível registrar o resgate. Tente novamente." };
    }
  }
  return { ok: false, error: "Não foi possível registrar o resgate. Tente novamente." };
}

export async function refundOrderLoyalty(orderId: string): Promise<boolean> {
  if (!dbConfigured) return false;
  return prisma.$transaction(async (tx) => {
    const earned = await tx.loyaltyEntry.findMany({
      where: { orderId, kind: { in: ["STAMP", "POINT", "REDEEM_STAMP"] } },
      select: { customerId: true, productId: true, kind: true, stamps: true, points: true },
    });
    if (earned.length === 0) return false;
    const already = await tx.loyaltyEntry.count({ where: { orderId, kind: "REFUND" } });
    if (already > 0) return false;
    for (const e of earned) {
      let stamps = -e.stamps;
      let points = -e.points;
      if (e.stamps > 0) {
        const left = await balanceOf(tx, e.customerId, "stamps", e.productId ?? undefined);
        stamps = -Math.min(e.stamps, Math.max(0, left));
      }
      if (e.points > 0) {
        const left = await balanceOf(tx, e.customerId, "points");
        points = -Math.min(e.points, Math.max(0, left));
      }
      await tx.loyaltyEntry.create({
        data: {
          customerId: e.customerId,
          productId: e.productId,
          orderId,
          kind: "REFUND",
          stamps,
          points,
          note:
            stamps === -e.stamps && points === -e.points
              ? null
              : "Estorno parcial: parte do saldo já havia sido resgatada.",
        },
      });
    }
    return true;
  });
}

export async function adjustBalance(input: {
  customerId: string;
  stamps?: number;
  points?: number;
  productId?: string | null;
  note: string;
}): Promise<void> {
  const stamps = Math.trunc(input.stamps ?? 0);
  const points = Math.trunc(input.points ?? 0);
  if (stamps === 0 && points === 0) return;
  await prisma.loyaltyEntry.create({
    data: {
      customerId: input.customerId,
      productId: input.productId ?? null,
      kind: "ADJUST",
      stamps,
      points,
      note: input.note.trim() || "Ajuste manual",
    },
  });
}

export async function orderLoyalty(
  orderId: string
): Promise<{ stamps: number; points: number; redeemed: boolean }> {
  if (!dbConfigured) return { stamps: 0, points: 0, redeemed: false };
  try {
    const rows = await prisma.loyaltyEntry.findMany({
      where: { orderId },
      select: { kind: true, stamps: true, points: true },
    });
    let stamps = 0;
    let points = 0;
    let redeemed = false;
    for (const r of rows) {
      if (r.kind === "STAMP") stamps += r.stamps;
      else if (r.kind === "POINT") points += r.points;
      else if (r.kind === "REDEEM_STAMP") redeemed = true;
    }
    return { stamps, points, redeemed };
  } catch {
    return { stamps: 0, points: 0, redeemed: false };
  }
}

export async function getHistory(customerId: string, take = 30) {
  if (!dbConfigured) return [];
  return prisma.loyaltyEntry.findMany({
    where: { customerId },
    orderBy: { createdAt: "desc" },
    take,
    select: {
      id: true,
      kind: true,
      stamps: true,
      points: true,
      note: true,
      createdAt: true,
      product: { select: { name: true, slug: true } },
      reward: { select: { name: true } },
      order: { select: { orderNumber: true } },
    },
  });
}
