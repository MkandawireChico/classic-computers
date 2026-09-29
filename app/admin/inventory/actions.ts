"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requirePermission, AuthorizationError } from "@/lib/auth/permissions";

const adjustSchema = z.object({
  inventoryId: z.string().uuid(),
  movementType: z.enum(["opening", "adjustment", "damage", "lost", "correction", "return"]),
  quantityDelta: z.coerce.number().int().refine((v) => v !== 0, "Quantity change cannot be zero"),
  note: z.string().max(500).optional(),
});

export async function adjustInventoryAction(input: unknown) {
  try {
    await requirePermission("inventory.adjust");
  } catch (e) {
    if (e instanceof AuthorizationError) {
      return { success: false as const, error: "You don't have permission to adjust inventory." };
    }
    throw e;
  }

  const parsed = adjustSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false as const, error: parsed.error.issues[0]?.message ?? "Invalid adjustment." };
  }
  const d = parsed.data;

  const supabase = createClient();
  // apply_inventory_movement() (0015) does its own permission check,
  // the atomic quantity_on_hand update, and the ledger insert all inside
  // one security-definer function call — this Server Action's own
  // requirePermission() above is a friendlier early error, not a
  // replacement for the function's own check.
  const { error } = await supabase.rpc("apply_inventory_movement" as any, {
    p_inventory_id: d.inventoryId,
    p_movement_type: d.movementType,
    p_quantity_delta: d.quantityDelta,
    p_reference_type: "manual_admin_adjustment",
    p_reference_id: null,
    p_note: d.note || null,
  } as any);

  if (error) {
    // The function's own CHECK-constraint-driven negative-stock rejection
    // surfaces here as a Postgres error — safe to show directly, it's not
    // an internal detail, it's the actual business reason the adjustment
    // was rejected.
    return { success: false as const, error: error.message.includes("check constraint") ? "This would make stock negative." : "Could not apply adjustment." };
  }

  revalidatePath("/admin/inventory");
  return { success: true as const };
}
