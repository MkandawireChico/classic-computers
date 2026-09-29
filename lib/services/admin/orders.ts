import "server-only";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requirePermission, AuthorizationError } from "@/lib/auth/permissions";

export type ServiceResult = { success: true } | { success: false; error: string };

const ORDER_STATUS_TRANSITIONS: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["ready_for_pickup", "out_for_delivery", "cancelled"],
  ready_for_pickup: ["completed", "cancelled"],
  out_for_delivery: ["completed", "cancelled"],
  completed: ["refunded"],
  cancelled: [],
  refunded: [],
};

const PAYMENT_STATUS_TRANSITIONS: Record<string, string[]> = {
  unpaid: ["paid", "partial"],
  partial: ["paid", "refunded"],
  paid: ["refunded"],
  refunded: [],
};

const statusSchema = z.object({
  orderId: z.string().uuid(),
  newStatus: z.enum([
    "pending", "confirmed", "processing", "ready_for_pickup",
    "out_for_delivery", "completed", "cancelled", "refunded",
  ]),
});

const paymentSchema = z.object({
  orderId: z.string().uuid(),
  newPaymentStatus: z.enum(["unpaid", "paid", "partial", "refunded"]),
});

async function guard(): Promise<ServiceResult | null> {
  try {
    await requirePermission("orders.write");
    return null;
  } catch (e) {
    if (e instanceof AuthorizationError) {
      return { success: false, error: "You don't have permission to update orders." };
    }
    throw e;
  }
}

export async function updateOrderStatus(input: unknown): Promise<ServiceResult> {
  const guardResult = await guard();
  if (guardResult) return guardResult;

  const parsed = statusSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid status." };
  const { orderId, newStatus } = parsed.data;

  const supabase = createClient();
  const { data: order } = await (supabase.from("orders") as any).select("order_status").eq("id", orderId).maybeSingle();
  if (!order) return { success: false, error: "Order not found." };

  const allowed = ORDER_STATUS_TRANSITIONS[order.order_status] ?? [];
  if (!allowed.includes(newStatus)) {
    return { success: false, error: `Cannot move an order from "${order.order_status}" to "${newStatus}".` };
  }

  // The audit_order_status_trigger (0017) automatically writes an
  // order_status_history row and an audit_logs entry on this update — no
  // separate call needed here.
  const { error } = await (supabase.from("orders") as any).update({ order_status: newStatus }).eq("id", orderId);
  if (error) return { success: false, error: "Could not update order status." };
  return { success: true };
}

export async function updatePaymentStatus(input: unknown): Promise<ServiceResult> {
  const guardResult = await guard();
  if (guardResult) return guardResult;

  const parsed = paymentSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid payment status." };
  const { orderId, newPaymentStatus } = parsed.data;

  const supabase = createClient();
  const { data: order } = await (supabase.from("orders") as any).select("payment_status").eq("id", orderId).maybeSingle();
  if (!order) return { success: false, error: "Order not found." };

  const allowed = PAYMENT_STATUS_TRANSITIONS[order.payment_status] ?? [];
  if (!allowed.includes(newPaymentStatus)) {
    return { success: false, error: `Cannot move payment status from "${order.payment_status}" to "${newPaymentStatus}".` };
  }

  const { error } = await (supabase.from("orders") as any)
    .update({ payment_status: newPaymentStatus })
    .eq("id", orderId);
  if (error) return { success: false, error: "Could not update payment status." };
  return { success: true };
}

export async function updateInternalNotes(orderId: string, internalNotes: string): Promise<ServiceResult> {
  const guardResult = await guard();
  if (guardResult) return guardResult;

  const supabase = createClient();
  // internal_notes (0035) — separate from orders.notes, which is the
  // customer's own checkout notes and must never be overwritten here.
  const { error } = await (supabase.from("orders") as any).update({ internal_notes: internalNotes }).eq("id", orderId);
  if (error) return { success: false, error: "Could not update internal notes." };
  return { success: true };
}
