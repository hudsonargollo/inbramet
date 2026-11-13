"use server";

import { revalidatePath } from "next/cache";
import { unstable_rethrow } from "next/navigation";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/admin";
import { saveStoreSettings } from "@/lib/settings";
import { slugify } from "@/lib/slug";
import { adjustBalance } from "@/lib/loyalty";
import type { LoyaltySettings } from "@/lib/settings-shared";
import type { RedemptionStatus } from "@prisma/client";

export type LoyaltyState = { ok?: boolean; error?: string; values?: Record<string, string> };

// Rules and prize catalogue are owner-only; the redemption counter is a daily
// task, so staff can move a canje through its statuses too.
async function requireOwner() {
  const session = await requireAdmin();
  if (session.role !== "ADMIN")
    throw new Error("Apenas administradores podem alterar as regras do programa.");
  return session;
}

function guard<T>(fn: () => Promise<T>): Promise<T | null> {
  return fn().catch((e) => {
    unstable_rethrow(e); // a signed-out redirect must reach the browser
    return null;
  });
}

function touched() {
  // The club page, the header/footer links and every product hint read these.
  revalidatePath("/", "layout");
  revalidatePath("/admin/loyalty");
}

// ---------- Rules ----------
export async function saveLoyaltyRules(
  _p: LoyaltyState,
  fd: FormData
): Promise<LoyaltyState> {
  const session = await guard(requireOwner);
  if (!session) return { error: "Você não tem permissão para alterar as regras." };

  const raw = {
    enabled: fd.get("enabled") === "on",
    name: String(fd.get("name") ?? "").trim(),
    stampsToFree: String(fd.get("stampsToFree") ?? "").trim(),
    eligible: String(fd.get("eligible") ?? "all"),
    pointsPer: String(fd.get("pointsPer") ?? "").trim(),
    pointsAmount: String(fd.get("pointsAmount") ?? "").trim(),
    pointsOnShipping: fd.get("pointsOnShipping") === "on",
    expiryDays: String(fd.get("expiryDays") ?? "").trim(),
  };
  const values = Object.fromEntries(
    Object.entries(raw).map(([k, v]) => [k, typeof v === "boolean" ? String(v) : v])
  );

  const parsed = z
    .object({
      enabled: z.boolean(),
      name: z.string().min(2, "Dê um nome ao programa").max(40),
      stampsToFree: z.coerce
        .number()
        .int("Deve ser um número inteiro")
        .min(1, "Mínimo de 1 selo")
        .max(100, "Máximo de 100 selos"),
      eligible: z.enum(["all", "category", "product"]),
      pointsPer: z.coerce.number().int().min(0, "Use 0 para pausar os pontos").max(10_000),
      pointsAmount: z.coerce.number().int().min(1, "O valor base deve ser pelo menos R$ 1").max(100_000),
      pointsOnShipping: z.boolean(),
      expiryDays: z.coerce.number().int().min(0, "0 significa que não expiram").max(3650),
    })
    .safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message, values };

  // Slugs arrive as repeated fields from the checkbox groups; anything outside
  // the mode that was saved is dropped so a stale list can't leak in.
  const wanted =
    parsed.data.eligible === "all"
      ? []
      : fd.getAll("eligibleSlugs").map((s) => String(s)).filter(Boolean);
  const known =
    parsed.data.eligible === "category"
      ? new Set((await prisma.category.findMany({ select: { slug: true } })).map((c) => c.slug))
      : parsed.data.eligible === "product"
        ? new Set((await prisma.product.findMany({ select: { slug: true } })).map((p) => p.slug))
        : new Set<string>();
  const eligibleSlugs = [...new Set(wanted)].filter((s) => known.has(s)).slice(0, 200);

  const loyalty: LoyaltySettings = { ...parsed.data, eligibleSlugs };
  try {
    await saveStoreSettings("loyalty", loyalty);
  } catch (err) {
    console.error("[loyalty] rules save failed:", err);
    return { error: "Não foi possível salvar: banco de dados indisponível.", values };
  }
  touched();
  return { ok: true, values };
}

// ---------- Rewards catalogue ----------
export async function saveReward(
  _p: LoyaltyState,
  fd: FormData
): Promise<LoyaltyState> {
  const session = await guard(requireOwner);
  if (!session) return { error: "Você não tem permissão para editar os prêmios." };

  const id = String(fd.get("id") ?? "").trim();
  const raw = {
    name: String(fd.get("name") ?? "").trim(),
    description: String(fd.get("description") ?? "").trim(),
    image: String(fd.get("image") ?? "").trim(),
    costPoints: String(fd.get("costPoints") ?? "").trim(),
    stock: String(fd.get("stock") ?? "").trim(),
    order: String(fd.get("order") ?? "").trim(),
  };
  const values = { ...raw, id };
  const parsed = z
    .object({
      name: z.string().min(2, "Dê um nome ao prêmio").max(80),
      description: z.string().max(240),
      image: z.string().refine((v) => v === "" || /^\/|^https:\/\//i.test(v), "Link de imagem inválido"),
      costPoints: z.coerce.number().int().min(1, "Mínimo de 1 ponto").max(1_000_000),
      stock: z.coerce.number().int().min(0).max(100_000),
      order: z.coerce.number().int().min(0).max(9999),
    })
    .safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message, values };

  const data = {
    ...parsed.data,
    description: parsed.data.description || null,
    image: parsed.data.image || null,
  };
  try {
    if (id) {
      await prisma.reward.update({ where: { id }, data });
    } else {
      // Slug is unique and only used for the URL/seed matching.
      let slug = slugify(parsed.data.name) || "premio";
      for (let n = 2; await prisma.reward.findUnique({ where: { slug } }); n++)
        slug = `${slugify(parsed.data.name)}-${n}`;
      await prisma.reward.create({ data: { ...data, slug } });
    }
  } catch (err) {
    console.error("[loyalty] reward save failed:", err);
    return { error: "Não foi possível salvar o prêmio.", values };
  }
  touched();
  return { ok: true, values };
}

export async function setRewardActive(id: string, active: boolean): Promise<void> {
  const session = await guard(requireOwner);
  if (!session) return;
  await prisma.reward
    .update({ where: { id }, data: { active } })
    .catch((err) => console.error("[loyalty] reward toggle failed:", err));
  touched();
}

export async function deleteReward(id: string): Promise<{ ok?: boolean; error?: string }> {
  const session = await guard(requireOwner);
  if (!session) return { error: "Sem permissão." };
  try {
    await prisma.reward.delete({ where: { id } });
  } catch {
    return { error: "Este prêmio já foi resgatado: desative-o em vez de excluí-lo." };
  }
  touched();
  return { ok: true };
}

// ---------- Redemption counter ----------
const STATUSES: RedemptionStatus[] = ["PENDING", "READY", "COLLECTED", "CANCELLED"];

export async function setRedemptionStatus(id: string, status: string): Promise<void> {
  const session = await guard(requireAdmin);
  if (!session) return;
  if (!STATUSES.includes(status as RedemptionStatus)) return;
  const to = status as RedemptionStatus;
  const redemption = await prisma.redemption.findUnique({ where: { id } });
  if (!redemption || redemption.status === to) return;
  try {
    await prisma.$transaction(async (tx) => {
      await tx.redemption.update({ where: { id }, data: { status: to } });
      if (to === "CANCELLED") {
        await tx.reward.update({ where: { id: redemption.rewardId }, data: { stock: { increment: 1 } } });
        await tx.loyaltyEntry.create({
          data: {
            customerId: redemption.customerId,
            rewardId: redemption.rewardId,
            kind: "ADJUST",
            points: redemption.costPoints,
            note: `Devolução por resgate cancelado ${redemption.code}`,
          },
        });
      }
    });
  } catch (err) {
    console.error("[loyalty] status change failed:", err);
    return;
  }
  revalidatePath("/admin/loyalty");
}

// ---------- Manual corrections ----------
export async function adjustCustomer(
  _p: LoyaltyState,
  fd: FormData
): Promise<LoyaltyState> {
  const session = await guard(requireOwner);
  if (!session) return { error: "Apenas administradores podem ajustar saldos." };

  const raw = {
    customerId: String(fd.get("customerId") ?? ""),
    stamps: String(fd.get("stamps") ?? "").trim(),
    points: String(fd.get("points") ?? "").trim(),
    productId: String(fd.get("productId") ?? ""),
    note: String(fd.get("note") ?? "").trim(),
  };
  const values = { stamps: raw.stamps, points: raw.points, note: raw.note };
  const parsed = z
    .object({
      customerId: z.string().min(1),
      stamps: z.coerce.number().int().min(-1000).max(1000),
      points: z.coerce.number().int().min(-100_000).max(100_000),
      productId: z.string(),
      note: z.string().min(3, "Informe o motivo do ajuste").max(200),
    })
    .safeParse(raw);
  if (!parsed.success) return { error: parsed.error.issues[0]?.message, values };
  if (parsed.data.stamps === 0 && parsed.data.points === 0)
    return { error: "Informe os selos ou pontos que deseja ajustar.", values };

  const customer = await prisma.customer.findUnique({ where: { id: parsed.data.customerId } });
  if (!customer) return { error: "Este cliente não existe mais.", values };

  try {
    await adjustBalance({
      customerId: parsed.data.customerId,
      stamps: parsed.data.stamps,
      points: parsed.data.points,
      productId: parsed.data.productId || null,
      note: parsed.data.note,
    });
  } catch (err) {
    console.error("[loyalty] adjust failed:", err);
    return { error: "Não foi possível registrar o ajuste.", values };
  }
  revalidatePath("/admin/loyalty");
  return { ok: true, values };
}
