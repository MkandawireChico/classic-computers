import "server-only";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requirePermission, AuthorizationError } from "@/lib/auth/permissions";

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

async function guard(): Promise<ServiceResult | null> {
  try {
    await requirePermission("rentals.write");
    return null;
  } catch (e) {
    if (e instanceof AuthorizationError) return { success: false, error: "You don't have permission to manage rentals." };
    throw e;
  }
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
    .select("status, quantity, rental_product_id, rental_products ( product_id )")
    .eq("id", bookingId)
    .maybeSingle();
  if (!booking) return { success: false, error: "Rental not found." };

  const allowed = RENTAL_STATUS_TRANSITIONS[booking.status] ?? [];
  if (!allowed.includes(newStatus)) {
    return { success: false, error: `Cannot move from "${booking.status}" to "${newStatus}".` };
  }

  const inventoryEffect = INVENTORY_EFFECT[newStatus];
  if (inventoryEffect && booking.rental_products?.product_id) {
    const { data: inventoryRow } = await (supabase.from("inventory") as any)
      .select("id")
      .eq("product_id", booking.rental_products.product_id)
      .is("variant_id", null)
      .maybeSingle();

    if (inventoryRow) {
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
        return { success: false, error: "Could not record the inventory movement for this rental." };
      }
    }
  }

  const { error } = await (supabase.from("rental_bookings") as any).update({ status: newStatus }).eq("id", bookingId);
  if (error) return { success: false, error: "Could not update rental status." };
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

const chargeSchema = z.object({ bookingId: z.string().uuid(), totalCharge: z.coerce.number().min(0) });

export async function setRentalCharge(input: unknown): Promise<ServiceResult> {
  const guardResult = await guard();
  if (guardResult) return guardResult;

  const parsed = chargeSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid amount." };

  const supabase = createClient();
  const { error } = await (supabase.from("rental_bookings") as any)
    .update({ total_charge: parsed.data.totalCharge })
    .eq("id", parsed.data.bookingId);
  if (error) return { success: false, error: "Could not set charge." };
  return { success: true };
}
