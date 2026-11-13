"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireAdmin, canAccessBranch } from "@/lib/admin";
import { bookShipment, isCourier } from "@/lib/couriers";
import { cancelOrderAndRestock } from "@/lib/orders";
import {
  ORDER_STATUSES,
  PAYMENT_STATUSES,
  canMoveOrder,
  canMovePayment,
  ORDER_STATUS_LABEL,
  PAYMENT_STATUS_LABEL,
  type OrderStatus,
  type PaymentStatus,
} from "@/lib/order-status";

export type ShipState = { error?: string; ok?: boolean; simulated?: boolean };

export async function bookShipmentAction(
  id: string,
  _prev: ShipState,
  formData: FormData
): Promise<ShipState> {
  const session = await requireAdmin();
  const courier = String(formData.get("courier") || "");
  if (!isCourier(courier)) return { error: "Escolha uma transportadora." };

  let order;
  try {
    order = await prisma.order.findUnique({
      where: { id },
      include: { items: { select: { quantity: true } } },
    });
  } catch {
    return { error: "Banco de dados indisponível. Tente novamente." };
  }
  if (!order || !canAccessBranch(session, order.branchId)) return { error: "Pedido não encontrado." };
  if (order.trackingNumber) return { error: "Este pedido já possui envio agendado." };
  if (order.status === "CANCELLED" || order.status === "DELIVERED") {
    return { error: "Um pedido cancelado ou entregue não pode ser enviado." };
  }
  if (order.paymentMethod !== "COD" && order.paymentStatus !== "PAID") {
    return { error: "Este pedido online ainda não foi pago." };
  }

  // Claim the order first (atomic) so a double-click or a second admin can't
  // book the same parcel twice. Released again if the booking fails.
  const claim = await prisma.order.updateMany({
    where: { id, trackingNumber: null, courier: null },
    data: { courier },
  });
  if (claim.count !== 1) return { error: "Este pedido já está sendo agendado." };

  const release = () =>
    prisma.order
      .updateMany({ where: { id, trackingNumber: null }, data: { courier: null } })
      .catch(() => undefined);

  const itemCount = order.items.reduce((n, i) => n + i.quantity, 0);
  const result = await bookShipment(
    {
      orderNumber: order.orderNumber,
      customerName: order.customerName,
      email: order.email,
      phone: order.phone,
      address: order.address ?? "",
      city: order.city ?? "",
      total: Number(order.total),
      paymentMethod: order.paymentMethod,
      itemCount,
    },
    courier
  );

  if (!result.ok) {
    await release();
    return { error: result.error };
  }

  try {
    await prisma.order.update({
      where: { id },
      data: {
        courier,
        trackingNumber: result.trackingNumber,
        shippedAt: new Date(),
        status: "SHIPPED",
      },
    });
  } catch {
    console.error(`[courier] booked ${courier} ${result.trackingNumber} for ${order.orderNumber} but could not save it`);
    return { error: `Agendado (rastreio ${result.trackingNumber}), mas não foi possível salvar. Anote este código e tente novamente.` };
  }

  revalidatePath(`/admin/orders/${id}`);
  revalidatePath("/admin/orders");
  return { ok: true, simulated: result.simulated };
}

export type StatusState = { ok?: boolean; error?: string };

export async function updateOrderStatus(
  id: string,
  _prev: StatusState,
  formData: FormData
): Promise<StatusState> {
  const session = await requireAdmin();
  const status = String(formData.get("status")) as OrderStatus;
  if (!ORDER_STATUSES.includes(status)) return { error: "Status inválido." };
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      select: { status: true, branchId: true },
    });
    if (!order || !canAccessBranch(session, order.branchId)) return { error: "Pedido não encontrado." };
    if (order.status === status) return { ok: true };
    if (!canMoveOrder(order.status, status)) {
      return {
        error: `Não é possível alterar um pedido de "${ORDER_STATUS_LABEL[order.status] ?? order.status}" para "${ORDER_STATUS_LABEL[status] ?? status}".`,
      };
    }
    if (status === "CANCELLED") {
      // Cancelling returns the items to stock (exactly once).
      await cancelOrderAndRestock(id);
    } else {
      // Conditional on the status we validated against (no lost updates).
      const res = await prisma.order.updateMany({ where: { id, status: order.status }, data: { status } });
      if (res.count !== 1) return { error: "O pedido foi alterado enquanto isso. Recarregue e tente novamente." };
    }
    revalidatePath(`/admin/orders/${id}`);
    revalidatePath("/admin/orders");
    return { ok: true };
  } catch {
    return { error: "Não foi possível atualizar. Banco de dados indisponível." };
  }
}

export async function updatePaymentStatus(
  id: string,
  _prev: StatusState,
  formData: FormData
): Promise<StatusState> {
  const session = await requireAdmin();
  const paymentStatus = String(formData.get("paymentStatus")) as PaymentStatus;
  if (!PAYMENT_STATUSES.includes(paymentStatus)) return { error: "Status de pagamento inválido." };
  try {
    const order = await prisma.order.findUnique({
      where: { id },
      select: { paymentStatus: true, branchId: true },
    });
    if (!order || !canAccessBranch(session, order.branchId)) return { error: "Pedido não encontrado." };
    if (order.paymentStatus === paymentStatus) return { ok: true };
    if (!canMovePayment(order.paymentStatus, paymentStatus)) {
      return {
        error: `Não é possível alterar o pagamento de "${PAYMENT_STATUS_LABEL[order.paymentStatus] ?? order.paymentStatus}" para "${PAYMENT_STATUS_LABEL[paymentStatus] ?? paymentStatus}".`,
      };
    }
    const res = await prisma.order.updateMany({
      where: { id, paymentStatus: order.paymentStatus },
      data: { paymentStatus },
    });
    if (res.count !== 1) return { error: "O pedido foi alterado enquanto isso. Recarregue e tente novamente." };
    revalidatePath(`/admin/orders/${id}`);
    revalidatePath("/admin/orders");
    return { ok: true };
  } catch {
    return { error: "Não foi possível atualizar. Banco de dados indisponível." };
  }
}
