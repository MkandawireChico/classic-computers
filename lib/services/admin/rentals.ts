import "server-only";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requirePermission, AuthorizationError } from "@/lib/auth/permissions";
import { rentalConfigurationSchema } from "@/schemas/admin/rental";

export type ServiceResult = { success: true } | { success: false; error: string };

const RENTAL_STATUS_TRANSITIONS: Record<string, string[]> = {
  requested: ["approved", "cancelled"],
  approved: ["ready", "cancelled"],
  ready: ["active", "cancelled"],
  active: ["returned", "overdue", "damaged", "lost"],
  overdue: ["returned", "damaged", "lost"],
  returned: [],
  damaged: [],
  lost: [],
  cancelled: [],
};

// Movement type + delta sign for each transition that touches inventory.
// 'active' (checkout) removes stock; 'returned' restores it. 'damaged'/
// 'lost' from an active rental do NOT restore stock (the unit doesn't
// come back sellable) but still record a zero-delta movement for audit
// visibility, so the ledger explains what happened to that unit.
const INVENTORY_EFFECT: Record<string, { movementType: string; sign: 1 | -1 | 0 } | null> = {
  active: { movementType: "rental_checkout", sign: -1 },
  returned: { movementType: "rental_return", sign: 1 },
  damaged: { movementType: "damage", sign: 0 },
  lost: { movementType: "lost", sign: 0 },
};

async function guard(): Promise<{ success: false; error: string } | null> {
  try {
    await requirePermission("rentals.write");
    return null;
  } catch (e) {
    if (e instanceof AuthorizationError) return { success: false, error: "You don't have permission to manage rentals." };
    throw e;
  }
}

export async function saveRentalConfiguration(
  input: unknown,
): Promise<{ success: true; data: { productSlug: string } } | { success: false; error: string }> {
  const rentalGuard = await guard();
  if (rentalGuard) return rentalGuard;

  try {
    await requirePermission("products.write");
  } catch (error) {
    if (error instanceof AuthorizationError) return { success: false, error: "You don't have permission to edit products." };
    throw error;
  }

  const parsed = rentalConfigurationSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid rental settings." };
  }
  const configuration = parsed.data;
  const supabase = createClient();

  const { data: product, error: productError } = await (supabase.from("products") as any)
    .select("id, slug")
    .eq("id", configuration.productId)
    .maybeSingle();
  if (productError || !product) return { success: false, error: "Product not found or unavailable." };

  const { data: variants, error: variantsError } = await (supabase.from("product_variants") as any)
    .select("id, status, is_default")
    .eq("product_id", configuration.productId);
  if (variantsError) return { success: false, error: "Could not verify product variants." };

  let selectedVariant: any = null;
  if (configuration.variantId) {
    selectedVariant = (variants ?? []).find((variant: any) => variant.id === configuration.variantId) ?? null;
    if (!selectedVariant) return { success: false, error: "That variant does not belong to this product." };
    if (configuration.isAvailable && selectedVariant.status !== "active") {
      return { success: false, error: "Only active variants can be made available for rental." };
    }
  } else if ((variants ?? []).length > 0) {
    return { success: false, error: "Choose a specific variant for this product's rental settings." };
  }

  let existingQuery = (supabase.from("rental_products") as any)
    .select("id")
    .eq("product_id", configuration.productId);
  existingQuery = configuration.variantId
    ? existingQuery.eq("variant_id", configuration.variantId)
    : existingQuery.is("variant_id", null);

  const { data: existing, error: lookupError } = await existingQuery.maybeSingle();
  if (lookupError) return { success: false, error: "Could not load the existing rental settings." };

  let rentalRow = existing;
  if (!rentalRow && selectedVariant?.is_default) {
    const { data: legacyDefault, error: legacyError } = await (supabase.from("rental_products") as any)
      .select("id")
      .eq("product_id", configuration.productId)
      .is("variant_id", null)
      .maybeSingle();
    if (legacyError) return { success: false, error: "Could not load the existing rental settings." };
    rentalRow = legacyDefault;
  }

  const values = {
    product_id: configuration.productId,
    variant_id: configuration.variantId,
    is_available: configuration.isAvailable,
    daily_rate: configuration.dailyRate,
    weekly_rate: configuration.weeklyRate,
    monthly_rate: configuration.monthlyRate,
    deposit_amount: configuration.depositAmount,
  };
  const result = rentalRow
    ? await (supabase.from("rental_products") as any).update(values).eq("id", rentalRow.id)
    : await (supabase.from("rental_products") as any).insert(values);

  if (result.error) {
    if (result.error.code === "23505") {
      return { success: false, error: "Rental settings already exist for this product variant. Refresh and try again." };
    }
    console.error("saveRentalConfiguration failed:", result.error.message);
    return { success: false, error: "Could not save rental settings. Check your rental permissions and try again." };
  }

  return { success: true, data: { productSlug: product.slug } };
}

const statusSchema = z.object({
  bookingId: z.string().uuid(),
  newStatus: z.enum(["approved", "ready", "active", "returned", "overdue", "damaged", "lost", "cancelled"]),
});

export async function updateRentalStatus(input: unknown): Promise<ServiceResult> {
  const guardResult = await guard();
  if (guardResult) return guardResult;

  const parsed = statusSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid status." };
  const { bookingId, newStatus } = parsed.data;

  const supabase = createClient();
  const { data: booking } = await (supabase.from("rental_bookings") as any)
    .select("status, quantity, rental_product_id, rental_products ( product_id, variant_id )")
    .eq("id", bookingId)
    .maybeSingle();
  if (!booking) return { success: false, error: "Rental not found." };

  const allowed = RENTAL_STATUS_TRANSITIONS[booking.status] ?? [];
  if (!allowed.includes(newStatus)) {
    return { success: false, error: `Cannot move from "${booking.status}" to "${newStatus}".` };
  }

  const requiredConditionEvent: Record<string, string> = {
    active: "checkout",
    returned: "return",
    damaged: "damage",
    lost: "loss",
  };
  const conditionEvent = requiredConditionEvent[newStatus];
  if (conditionEvent) {
    const { data: report, error: reportError } = await (supabase.from("rental_condition_reports") as any)
      .select("id")
      .eq("booking_id", bookingId)
      .eq("event_type", conditionEvent)
      .limit(1)
      .maybeSingle();
    if (reportError) return { success: false, error: "Could not verify the required equipment condition report. No status change was made." };
    if (!report) return { success: false, error: `Record the equipment ${conditionEvent} condition before changing this rental status.` };
  }

  const inventoryEffect = INVENTORY_EFFECT[newStatus];
  if (inventoryEffect && booking.rental_products?.product_id) {
    let inventoryRowQuery = (supabase.from("inventory") as any)
      .select("id")
      .eq("product_id", booking.rental_products.product_id);

    if (booking.rental_products.variant_id) {
      inventoryRowQuery = inventoryRowQuery.eq("variant_id", booking.rental_products.variant_id);
    } else {
      inventoryRowQuery = inventoryRowQuery.is("variant_id", null);
    }

    const { data: inventoryRow, error: inventoryLookupError } = await inventoryRowQuery.maybeSingle();
    if (inventoryLookupError) {
      return { success: false, error: "Could not verify the rental stock record. No status change was made." };
    }
    if (!inventoryRow) {
      return { success: false, error: "This rental has no matching inventory record. Add or correct its stock record before processing handover or return." };
    }

    const delta = inventoryEffect.sign * booking.quantity;
    const { error: movementError } = await supabase.rpc("apply_inventory_movement" as any, {
      p_inventory_id: inventoryRow.id,
      p_movement_type: inventoryEffect.movementType,
      p_quantity_delta: delta,
      p_reference_type: "rental_booking",
      p_reference_id: bookingId,
      p_note: `Rental ${newStatus} (booking ${bookingId})`,
    } as any);
    if (movementError) {
      return { success: false, error: movementError.message.includes("check constraint")
        ? "There is not enough available stock to complete this rental handover."
        : "Could not record the inventory movement. No status change was made." };
    }

    // The stock movement and status update use separate existing database
    // operations. Use a conditional status update to prevent two staff
    // members processing the same transition at once. If another update
    // wins the race, compensate the stock movement before returning.
    const { data: updatedBooking, error: statusError } = await (supabase.from("rental_bookings") as any)
      .update({ status: newStatus })
      .eq("id", bookingId)
      .eq("status", booking.status)
      .select("id")
      .maybeSingle();

    if (statusError || !updatedBooking) {
      if (inventoryEffect.sign !== 0) {
        const compensationType = inventoryEffect.sign < 0 ? "rental_return" : "rental_checkout";
        const { error: compensationError } = await supabase.rpc("apply_inventory_movement" as any, {
          p_inventory_id: inventoryRow.id,
          p_movement_type: compensationType,
          p_quantity_delta: -delta,
          p_reference_type: "rental_booking_compensation",
          p_reference_id: bookingId,
          p_note: `Compensation for unsuccessful ${newStatus} transition`,
        } as any);
        if (compensationError) {
          console.error("Rental stock compensation failed:", compensationError.message);
          return { success: false, error: "The rental status was not changed, but stock compensation failed. Stop processing this booking and reconcile its inventory ledger." };
        }
      }
      return { success: false, error: "Another staff member updated this rental. Refresh the page before trying again." };
    }
    return { success: true };
  }

  const { data: updatedBooking, error } = await (supabase.from("rental_bookings") as any)
    .update({ status: newStatus })
    .eq("id", bookingId)
    .eq("status", booking.status)
    .select("id")
    .maybeSingle();
  if (error || !updatedBooking) {
    return { success: false, error: "Another staff member updated this rental. Refresh the page before trying again." };
  }
  return { success: true };
}

const notesSchema = z.object({ bookingId: z.string().uuid(), notes: z.string().max(1000) });

export async function updateRentalInternalNotes(input: unknown): Promise<ServiceResult> {
  const guardResult = await guard();
  if (guardResult) return guardResult;

  const parsed = notesSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid notes." };

  const supabase = createClient();
  // internal_notes (0043) — separate from rental_bookings.notes, which is
  // the customer's own request notes and must never be overwritten here.
  const { error } = await (supabase.from("rental_bookings") as any)
    .update({ internal_notes: parsed.data.notes })
    .eq("id", parsed.data.bookingId);
  if (error) return { success: false, error: "Could not update notes." };
  return { success: true };
}

const chargeSchema = z.object({
  bookingId: z.string().uuid(),
  totalCharge: z.coerce.number().min(0).finite()
    .refine((value) => Math.abs(value * 100 - Math.round(value * 100)) < 1e-7, "Charge must have no more than two decimal places."),
});

export async function setRentalCharge(input: unknown): Promise<ServiceResult> {
  const guardResult = await guard();
  if (guardResult) return guardResult;

  const parsed = chargeSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid amount." };

  const supabase = createClient();
  const { data: transactions, error: transactionError } = await (supabase.from("rental_payment_transactions") as any)
    .select("transaction_type, amount")
    .eq("booking_id", parsed.data.bookingId);
  if (transactionError) return { success: false, error: "Could not verify existing rental payments before changing the charge." };
  const verifiedNet = (transactions ?? []).reduce((sum: number, row: any) =>
    sum + Number(row.amount) * (row.transaction_type === "refund" ? -1 : 1), 0);
  if (parsed.data.totalCharge < verifiedNet) {
    return { success: false, error: "The agreed charge cannot be lower than verified funds already received." };
  }
  const { error } = await (supabase.from("rental_bookings") as any)
    .update({ total_charge: parsed.data.totalCharge })
    .eq("id", parsed.data.bookingId);
  if (error) return { success: false, error: "Could not set charge." };
  return { success: true };
}

const rentalPaymentSchema = z.object({
  bookingId: z.string().uuid(),
  transactionType: z.enum(["payment", "refund"]),
  provider: z.string().trim().min(1).max(80),
  amount: z.number().positive().finite().refine((value) => Math.abs(value * 100 - Math.round(value * 100)) < 1e-7),
  providerReference: z.string().trim().max(120).optional().or(z.literal("")),
});

export async function recordRentalPayment(input: unknown): Promise<ServiceResult> {
  const guardResult = await guard();
  if (guardResult) return guardResult;
  const parsed = rentalPaymentSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Enter a valid transaction type, provider and amount." };
  const value = parsed.data;
  const supabase = createClient();
  const { error } = await (supabase.from("rental_payment_transactions") as any).insert({
    booking_id: value.bookingId,
    transaction_type: value.transactionType,
    provider: value.provider,
    amount: value.amount,
    currency: "MWK",
    provider_reference: value.providerReference || null,
  });
  if (error) {
    console.error("recordRentalPayment failed:", { bookingId: value.bookingId, code: error.code, message: error.message });
    const message = error.message.toLowerCase();
    if (message.includes("set the agreed rental charge")) return { success: false, error: "Set the agreed rental charge before recording a payment." };
    if (message.includes("exceeds the outstanding")) return { success: false, error: "This amount exceeds the outstanding rental balance." };
    if (message.includes("exceeds verified rental")) return { success: false, error: "The refund exceeds verified rental payments." };
    if (message.includes("after a refund")) return { success: false, error: "Further payments are blocked after a refund has been recorded." };
    if (message.includes("duplicate key")) return { success: false, error: "This provider reference has already been recorded." };
    if (message.includes("permission")) return { success: false, error: "You do not have permission to record rental payments." };
    return { success: false, error: "Could not record this transaction. Check the details and try again." };
  }
  return { success: true };
}

const conditionSchema = z.object({
  bookingId: z.string().uuid(),
  eventType: z.enum(["checkout", "return", "damage", "loss"]),
  condition: z.enum(["excellent", "good", "fair", "damaged", "missing"]),
  notes: z.string().trim().min(3).max(1500),
});

export async function recordRentalCondition(input: unknown): Promise<ServiceResult> {
  const guardResult = await guard();
  if (guardResult) return guardResult;
  const parsed = conditionSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Choose a condition and enter notes of at least 3 characters." };
  const value = parsed.data;
  const supabase = createClient();
  const { error } = await (supabase.from("rental_condition_reports") as any).insert({
    booking_id: value.bookingId,
    event_type: value.eventType,
    condition: value.condition,
    notes: value.notes,
  });
  if (error) {
    console.error("recordRentalCondition failed:", { bookingId: value.bookingId, code: error.code, message: error.message });
    if (error.code === "23505") return { success: false, error: "A condition report for this inspection stage has already been recorded." };
    if (error.message.toLowerCase().includes("permission")) return { success: false, error: "You do not have permission to record equipment condition." };
    return { success: false, error: "Could not save the equipment condition report. Check the details and try again." };
  }
  return { success: true };
}
