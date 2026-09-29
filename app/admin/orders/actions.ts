"use server";

import { revalidatePath } from "next/cache";
import * as orderService from "@/lib/services/admin/orders";

export async function updateOrderStatusAction(input: unknown) {
  const result = await orderService.updateOrderStatus(input);
  if (result.success && typeof input === "object" && input && "orderId" in input) {
    revalidatePath(`/admin/orders/${(input as any).orderId}`);
    revalidatePath("/admin/orders");
  }
  return result;
}

export async function updatePaymentStatusAction(input: unknown) {
  const result = await orderService.updatePaymentStatus(input);
  if (result.success && typeof input === "object" && input && "orderId" in input) {
    revalidatePath(`/admin/orders/${(input as any).orderId}`);
    revalidatePath("/admin/orders");
  }
  return result;
}

export async function updateInternalNotesAction(orderId: string, notes: string) {
  const result = await orderService.updateInternalNotes(orderId, notes);
  if (result.success) revalidatePath(`/admin/orders/${orderId}`);
  return result;
}
