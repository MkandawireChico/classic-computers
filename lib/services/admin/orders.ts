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
  completed: [],
  cancelled: [],
  refunded: [],
};

const statusSchema = z.object({
  orderId: z.string().uuid(),
  newStatus: z.enum([
    "pending", "confirmed", "processing", "ready_for_pickup",
    "out_for_delivery", "completed", "cancelled",
  ]),
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
  const { data: order, error: lookupError } = await (supabase.from("orders") as any)
    .select("order_status")
    .eq("id", orderId)
    .maybeSingle();
  if (lookupError) {
    console.error("Order status lookup failed:", lookupError.message);
    return { success: false, error: "Could not load the current order status." };
  }
  if (!order) return { success: false, error: "Order not found." };

  const allowed = ORDER_STATUS_TRANSITIONS[order.order_status] ?? [];
  if (!allowed.includes(newStatus)) {
    return { success: false, error: `Cannot move an order from "${order.order_status}" to "${newStatus}".` };
  }

  // The audit_order_status_trigger (0017) automatically writes an
  // order_status_history row and an audit_logs entry on this update — no
  // separate call needed here.
  // Compare-and-set the status read above. This prevents two staff actions
  // based on the same stale status from both succeeding and bypassing the
  // transition map.
  const { data: updated, error } = await (supabase.from("orders") as any)
    .update({ order_status: newStatus })
    .eq("id", orderId)
    .eq("order_status", order.order_status)
    .select("id")
    .maybeSingle();
  if (error) {
    console.error("Order status update failed:", { orderId, code: error.code, message: error.message });
    return { success: false, error: "Could not update order status. Check database permissions and try again." };
  }
  if (!updated) {
    return { success: false, error: "Another staff member changed this order. Refresh the page and review its current status." };
  }
  return { success: true };
}

export async function updateInternalNotes(orderId: string, internalNotes: string): Promise<ServiceResult> {
  const guardResult = await guard();
  if (guardResult) return guardResult;

  const supabase = createClient();
  // internal_notes (0035) — separate from orders.notes, which is the
  // customer's own checkout notes and must never be overwritten here.
  const { error } = await (supabase.from("orders") as any).update({ internal_notes: internalNotes }).eq("id", orderId);
  if (error) {
    console.error("Order internal notes update failed:", { orderId, code: error.code, message: error.message });
    return { success: false, error: "Could not update internal notes. Check database permissions and try again." };
  }
  return { success: true };
}

const paymentTransactionSchema = z.object({
  orderId: z.string().uuid(),
  transactionType: z.enum(["payment", "refund"]),
  provider: z.string().trim().min(1).max(80),
  amount: z.number().positive().finite().refine((value) => Math.abs(value * 100 - Math.round(value * 100)) < 1e-7, "Amount must have no more than two decimal places."),
  currency: z.string().trim().length(3).default("MWK"),
  providerReference: z.string().trim().max(120).optional().or(z.literal("")),
});

export async function recordPaymentTransaction(input: unknown): Promise<ServiceResult> {
  const guardResult = await guard();
  if (guardResult) return guardResult;

  const parsed = paymentTransactionSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Enter a valid transaction type, provider and amount." };

  const value = parsed.data;
  const supabase = createClient();
  const { error } = await supabase.from("order_payment_transactions").insert({
    order_id: value.orderId,
    transaction_type: value.transactionType,
    provider: value.provider,
    amount: value.amount,
    currency: value.currency.toUpperCase(),
    provider_reference: value.providerReference || null,
  });

  if (error) {
    console.error("recordPaymentTransaction failed:", {
      orderId: value.orderId,
      code: error.code,
      message: error.message,
    });
    const message = error.message.toLowerCase();
    if (message.includes("exceeds the outstanding")) {
      return { success: false, error: "This amount exceeds the remaining order balance." };
    }
    if (message.includes("exceeds the verified amount")) {
      return { success: false, error: "The refund exceeds the verified amount received." };
    }
    if (message.includes("duplicate key")) {
      return { success: false, error: "This provider reference has already been recorded." };
    }
    if (message.includes("permission")) {
      return { success: false, error: "You do not have permission to record payment transactions." };
    }
    return { success: false, error: "Could not record this transaction. Check the details and try again." };
  }

  return { success: true };
}
