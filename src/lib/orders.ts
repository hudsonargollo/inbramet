import { randomInt } from "node:crypto";
import { z } from "zod";
import { dbConfigured, prisma } from "./prisma";
import { shippingFor } from "./settings-shared";
import { getStoreSettings } from "./settings";
import { after } from "next/server";
import { sendOrderEmails } from "./email";
import { refreshCatalog } from "./cache-tags";
import { accrueOrder, getBalances, redeemStamps, refundOrderLoyalty } from "./loyalty";
import { stampCard, type LoyaltyLine } from "./loyalty-shared";

export const checkoutSchema = z.object({
  customerName: z.string().trim().min(2, "Informe seu nome completo").max(120),
  email: z.string().trim().email("Informe um e-mail válido").max(200),
  phone: z.string().trim().min(7, "Informe um telefone válido").max(30),
  branchId: z.string().optional().nullable(),
  fulfillment: z.enum(["DELIVERY", "PICKUP"]).default("DELIVERY"),
  address: z.string().trim().max(500).nullish(),
  city: z.string().trim().max(100).nullish(),
  postalCode: z.string().max(20).nullish(),
  notes: z.string().max(1000).nullish(),
  paymentMethod: z.enum(["COD", "PAYFAST", "SAFEPAY"]),
  /** Produto cuja cartela completa está sendo usada neste pedido (1 unidade grátis). */
  redeemProductId: z.string().max(100).nullish(),
  items: z
    .array(
      z.object({
        productId: z.string().max(100),
        name: z.string().max(200),
        price: z.number().nonnegative(),
        quantity: z.number().int().positive().max(99),
      })
    )
    .min(1, "Seu carrinho está vazio")
    .max(50),
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

export type CreateOrderResult =
  | {
      ok: true;
      orderNumber: string;
      total: number;
      loyalty: { stamps: number; points: number; redeemedProduct: string | null };
    }
  | { ok: false; error: string };

class OrderValidationError extends Error {}

const ORDER_ALPHABET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

function generateOrderNumber(prefix = "IN01"): string {
  const stamp = Date.now().toString(36).toUpperCase().slice(-6);
  let rand = "";
  for (let i = 0; i < 8; i++) rand += ORDER_ALPHABET[randomInt(ORDER_ALPHABET.length)];
  return `${prefix}-${stamp}-${rand}`;
}

export async function cancelOrderAndRestock(orderId: string): Promise<boolean> {
  if (!dbConfigured) return false;
  const restocked = await prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { id: orderId },
      select: { branchId: true, status: true },
    });
    if (!order || order.status === "CANCELLED") return false;
    const res = await tx.order.updateMany({
      where: { id: orderId, status: { not: "CANCELLED" } },
      data: { status: "CANCELLED" },
    });
    if (res.count !== 1) return false;
    const items = await tx.orderItem.findMany({
      where: { orderId },
      select: { productId: true, quantity: true },
    });
    for (const i of items) {
      await tx.branchStock.updateMany({
        where: { branchId: order.branchId, productId: i.productId },
        data: { stock: { increment: i.quantity } },
      });
    }
    return true;
  });
  if (restocked) {
    refreshCatalog();
    await refundOrderLoyalty(orderId).catch((err) =>
      console.error("[loyalty] refund entry failed:", err)
    );
  }
  return restocked;
}

export async function createOrder(
  input: CheckoutInput,
  customerId?: string | null
): Promise<CreateOrderResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? "Pedido inválido" };
  }
  const data = parsed.data;

  const address = data.address?.trim() || null;
  const city = data.city?.trim() || null;
  if (!address || address.length < 5) {
    return { ok: false, error: "Informe o endereço de entrega" };
  }
  if (!city || city.length < 2) {
    return { ok: false, error: "Informe sua cidade" };
  }

  if (!dbConfigured) {
    return {
      ok: false,
      error: "O banco de dados de pedidos ainda não está conectado neste ambiente de demonstração.",
    };
  }

  try {
    const branch = data.branchId
      ? await prisma.branch.findFirst({ where: { id: data.branchId, active: true } })
      : await prisma.branch.findFirst({ where: { active: true }, orderBy: { sortOrder: "asc" } });

    if (!branch) {
      throw new OrderValidationError("Loja indisponível no momento para finalizar o pedido.");
    }

    const ids = data.items.map((i) => i.productId);
    const stocks = await prisma.branchStock.findMany({
      where: { branchId: branch.id, productId: { in: ids }, active: true, product: { active: true } },
      select: {
        productId: true,
        stock: true,
        product: {
          select: {
            id: true,
            name: true,
            price: true,
            slug: true,
            category: { select: { slug: true } },
          },
        },
      },
    });
    const byId = new Map(stocks.map((s) => [s.productId, s]));

    const qtyById = new Map<string, number>();
    for (const i of data.items) qtyById.set(i.productId, (qtyById.get(i.productId) ?? 0) + i.quantity);

    const lineItems = [...qtyById].map(([productId, quantity]) => {
      const s = byId.get(productId);
      const name = data.items.find((i) => i.productId === productId)?.name ?? "Produto";
      if (!s)
        throw new OrderValidationError(
          `"${name}" não está mais disponível. Remova-o do carrinho e tente novamente.`
        );
      if (s.stock < quantity)
        throw new OrderValidationError(
          s.stock <= 0
            ? `"${s.product.name}" está esgotado. Remova-o do carrinho.`
            : `Restam apenas ${s.stock} unidades de "${s.product.name}". Ajuste a quantidade.`
        );
      return { productId: s.product.id, name: s.product.name, price: Number(s.product.price), quantity };
    });

    let subtotal = lineItems.reduce((s, i) => s + i.price * i.quantity, 0);
    const settings = await getStoreSettings();
    const calcShipping = (base: number) => shippingFor(base, settings.shipping);
    let shipping = calcShipping(subtotal);
    let total = subtotal + shipping;
    const email = data.email.trim().toLowerCase();

    let safeCustomerId: string | null = null;
    if (customerId) {
      const customer = await prisma.customer.findUnique({
        where: { id: customerId },
        select: { id: true },
      });
      safeCustomerId = customer?.id ?? null;
    }

    const rules = settings.loyalty;
    let ownedStamps: Record<string, number> = {};
    let redeemed: { productId: string; name: string } | null = null;
    if (rules.enabled && safeCustomerId && data.redeemProductId) {
      const target = lineItems.find((i) => i.productId === data.redeemProductId);
      if (!target)
        throw new OrderValidationError("Escolha um produto do carrinho para resgatar seus selos.");
      const balances = await getBalances(safeCustomerId, rules);
      ownedStamps = balances.stampsByProduct;
      const card = stampCard(ownedStamps[target.productId] ?? 0, rules);
      if (!card.full)
        throw new OrderValidationError(
          `Ainda faltam ${card.remaining} selos de "${target.name}" para resgatar gratuitamente.`
        );
      redeemed = { productId: target.productId, name: target.name };
      ownedStamps[target.productId] = Math.max(0, (ownedStamps[target.productId] ?? 0) - rules.stampsToFree);
      target.quantity -= 1;
      if (target.quantity === 0) lineItems.splice(lineItems.indexOf(target), 1);
      lineItems.push({ productId: target.productId, name: target.name, price: 0, quantity: 1 });
      subtotal = lineItems.reduce((s, i) => s + i.price * i.quantity, 0);
      shipping = calcShipping(subtotal);
      total = subtotal + shipping;
    }

    const loyaltyLines: LoyaltyLine[] = lineItems
      .filter((i) => i.price > 0)
      .map((i) => {
        const p = byId.get(i.productId)?.product;
        return {
          productId: i.productId,
          productSlug: p?.slug ?? "",
          categorySlug: p?.category.slug ?? "",
          quantity: i.quantity,
        };
      });
    const noLoyalty = { stamps: 0, points: 0, redeemedProduct: null as string | null };
    let earned = noLoyalty;

    let orderNumber = "";
    let createdOrder: { id: string; createdAt: Date } | null = null;
    for (let attempt = 0; attempt < 3 && !createdOrder; attempt++) {
      orderNumber = generateOrderNumber(branch.code || "IN01");
      try {
        createdOrder = await prisma.$transaction(async (tx) => {
          for (const i of lineItems) {
            const res = await tx.branchStock.updateMany({
              where: {
                branchId: branch.id,
                productId: i.productId,
                active: true,
                stock: { gte: i.quantity },
              },
              data: { stock: { decrement: i.quantity } },
            });
            if (res.count !== 1)
              throw new OrderValidationError(
                `"${i.name}" esgotou ou há menos unidades disponíveis. Atualize seu carrinho.`
              );
          }
          const created = await tx.order.create({
            data: {
              orderNumber,
              branchId: branch.id,
              fulfillment: "DELIVERY",
              customerName: data.customerName.trim(),
              email,
              phone: data.phone.trim(),
              address,
              city,
              postalCode: data.postalCode?.trim() || null,
              notes: data.notes?.trim() || null,
              paymentMethod: data.paymentMethod,
              customerId: safeCustomerId,
              subtotal,
              shipping,
              total,
              items: { create: lineItems },
            },
            select: { id: true, createdAt: true },
          });

          if (safeCustomerId) {
            if (redeemed)
              await redeemStamps(tx, {
                customerId: safeCustomerId,
                productId: redeemed.productId,
                orderId: created.id,
                rules,
              });
            const gained = await accrueOrder(tx, {
              orderId: created.id,
              customerId: safeCustomerId,
              lines: loyaltyLines,
              amounts: { subtotal, shipping },
              rules,
              ownedStamps,
            });
            earned = { ...gained, redeemedProduct: redeemed?.name ?? null };
          }
          return created;
        });
      } catch (err) {
        const msg = err instanceof Error ? err.message : "";
        if (!(err instanceof OrderValidationError) && /P2002|Unique constraint/i.test(msg) && /orderNumber/.test(msg)) continue;
        throw err;
      }
    }
    if (!createdOrder) throw new Error("Could not allocate an order number");
    refreshCatalog();

    after(async () => {
      try {
        await sendOrderEmails({
          orderNumber,
          customerName: data.customerName,
          email,
          phone: data.phone,
          address,
          city,
          fulfillment: "DELIVERY",
          paymentMethod: data.paymentMethod,
          items: lineItems.map((i) => ({ name: i.name, quantity: i.quantity, price: i.price })),
          subtotal,
          shipping,
          total,
        });
      } catch (emailErr) {
        console.error("[order] email send failed (order still saved):", emailErr);
      }
    });

    return { ok: true, orderNumber, total, loyalty: earned };
  } catch (err) {
    if (err instanceof OrderValidationError) {
      return { ok: false, error: err.message };
    }
    console.error("[order] failed to create order:", err);
    return {
      ok: false,
      error: "Desculpe, não foi possível registrar seu pedido agora. Tente novamente em instantes.",
    };
  }
}
