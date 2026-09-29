import "server-only";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requirePermission, AuthorizationError } from "@/lib/auth/permissions";

export type ServiceResult = { success: true } | { success: false; error: string };

const REPAIR_STATUS_TRANSITIONS: Record<string, string[]> = {
  checked_in: ["diagnosing", "cancelled"],
  diagnosing: ["quoted", "cancelled"],
  quoted: ["awaiting_approval", "cancelled"],
  awaiting_approval: ["in_progress", "cancelled"],
  in_progress: ["ready_for_pickup", "cancelled"],
  ready_for_pickup: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
};

async function guard(permission: string): Promise<ServiceResult | null> {
  try {
    await requirePermission(permission);
    return null;
  } catch (e) {
    if (e instanceof AuthorizationError) return { success: false, error: "You don't have permission for this action." };
    throw e;
  }
}

/**
 * A technician may only act on repairs assigned to them — enforced here,
 * on top of the RLS policy that already scopes their SELECT the same way
 * (0023: "assigned technician can read ticket"). Staff/admin with
 * repairs.write can act on any ticket.
 */
async function assertCanActOnTicket(ticketId: string): Promise<ServiceResult | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "Not signed in." };

  const { data: roleCheck } = await supabase.rpc("has_permission" as any, {
    uid: user.id,
    permission_key: "repairs.write",
  } as any);
  if (roleCheck) return null; // staff/admin with repairs.write can act on anything

  const { data: ticket } = await (supabase.from("repair_tickets") as any)
    .select("assigned_technician_id")
    .eq("id", ticketId)
    .maybeSingle();
  if (ticket?.assigned_technician_id === user.id) return null;

  return { success: false, error: "This repair isn't assigned to you." };
}

const statusSchema = z.object({
  ticketId: z.string().uuid(),
  newStatus: z.enum(["diagnosing", "quoted", "awaiting_approval", "in_progress", "ready_for_pickup", "completed", "cancelled"]),
});

export async function updateRepairStatus(input: unknown): Promise<ServiceResult> {
  const parsed = statusSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid status." };

  const actionGuard = await assertCanActOnTicket(parsed.data.ticketId);
  if (actionGuard) return actionGuard;

  const supabase = createClient();
  const { data: ticket } = await (supabase.from("repair_tickets") as any)
    .select("status")
    .eq("id", parsed.data.ticketId)
    .maybeSingle();
  if (!ticket) return { success: false, error: "Repair not found." };

  const allowed = REPAIR_STATUS_TRANSITIONS[ticket.status] ?? [];
  if (!allowed.includes(parsed.data.newStatus)) {
    return { success: false, error: `Cannot move from "${ticket.status}" to "${parsed.data.newStatus}".` };
  }

  // notify_repair_status_trigger (0036) + audit_repair_ticket_change
  // (Phase 2) both fire automatically on this update.
  const { error } = await (supabase.from("repair_tickets") as any)
    .update({ status: parsed.data.newStatus })
    .eq("id", parsed.data.ticketId);
  if (error) return { success: false, error: "Could not update status." };
  return { success: true };
}

const assignSchema = z.object({ ticketId: z.string().uuid(), technicianId: z.string().uuid().nullable() });

export async function assignTechnician(input: unknown): Promise<ServiceResult> {
  const guardResult = await guard("repairs.write");
  if (guardResult) return guardResult;

  const parsed = assignSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid assignment." };

  const supabase = createClient();
  const { error } = await (supabase.from("repair_tickets") as any)
    .update({ assigned_technician_id: parsed.data.technicianId })
    .eq("id", parsed.data.ticketId);
  if (error) return { success: false, error: "Could not assign technician." };
  return { success: true };
}

const quoteSchema = z.object({ ticketId: z.string().uuid(), quoteAmount: z.coerce.number().min(0) });

export async function setRepairQuote(input: unknown): Promise<ServiceResult> {
  const actionGuard = await assertCanActOnTicket((input as any)?.ticketId);
  if (actionGuard) return actionGuard;

  const parsed = quoteSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid quote amount." };

  const supabase = createClient();
  const { error } = await (supabase.from("repair_tickets") as any)
    .update({ quote_amount: parsed.data.quoteAmount })
    .eq("id", parsed.data.ticketId);
  if (error) return { success: false, error: "Could not set quote." };
  return { success: true };
}

const noteSchema = z.object({ ticketId: z.string().uuid(), note: z.string().trim().min(1).max(1000), isInternal: z.coerce.boolean() });

export async function addRepairUpdate(input: unknown): Promise<ServiceResult> {
  const parsed = noteSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Note is required." };

  const actionGuard = await assertCanActOnTicket(parsed.data.ticketId);
  if (actionGuard) return actionGuard;

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { error } = await (supabase.from("repair_updates") as any).insert({
    ticket_id: parsed.data.ticketId,
    note: parsed.data.note,
    is_internal: parsed.data.isInternal,
    created_by: user?.id ?? null,
  });
  if (error) return { success: false, error: "Could not add update." };
  return { success: true };
}

const addPartSchema = z.object({
  ticketId: z.string().uuid(),
  partName: z.string().trim().min(1),
  cost: z.coerce.number().min(0),
  quantity: z.coerce.number().int().positive(),
  productId: z.string().uuid().nullable().optional(),
  variantId: z.string().uuid().nullable().optional(),
});

export async function addRepairPart(input: unknown): Promise<ServiceResult> {
  const guardResult = await guard("repairs.write");
  if (guardResult) return guardResult;

  const parsed = addPartSchema.safeParse(input);
  if (!parsed.success) return { success: false, error: "Invalid part." };
  const d = parsed.data;

  const supabase = createClient();
  const { data: part, error } = await (supabase.from("repair_parts") as any)
    .insert({
      ticket_id: d.ticketId,
      part_name: d.partName,
      cost: d.cost,
      quantity: d.quantity,
      product_id: d.productId || null,
      variant_id: d.variantId || null,
    })
    .select("id")
    .single();
  if (error) return { success: false, error: "Could not add part." };

  // If this part maps to a real stocked item, consume the inventory now,
  // through the existing atomic movement RPC — never a direct quantity
  // write. inventory_movement_id is set immediately after, which is what
  // stops a duplicate submission from double-consuming (see
  // consumeRepairPartInventory below, which checks this column first).
  if (d.productId) {
    await consumeRepairPartInventoryInternal(part.id, d.productId, d.variantId ?? null, d.quantity, d.ticketId);
  }

  return { success: true };
}

async function consumeRepairPartInventoryInternal(
  repairPartId: string,
  productId: string,
  variantId: string | null,
  quantity: number,
  ticketId: string,
): Promise<void> {
  const supabase = createClient();

  const { data: inventoryRow } = await (supabase.from("inventory") as any)
    .select("id")
    .eq("product_id", productId)
    .is("variant_id", variantId)
    .maybeSingle();
  if (!inventoryRow) return;

  const { data: ticket } = await (supabase.from("repair_tickets") as any).select("ticket_number").eq("id", ticketId).maybeSingle();

  // apply_inventory_movement() does its own inventory.write/adjust
  // permission check and the atomic decrement + ledger insert — this is
  // the SAME rpc used by admin manual stock adjustments (Phase 5), not a
  // separate path.
  const { error } = await supabase.rpc("apply_inventory_movement" as any, {
    p_inventory_id: inventoryRow.id,
    p_movement_type: "adjustment",
    p_quantity_delta: -quantity,
    p_reference_type: "repair_part",
    p_reference_id: repairPartId,
    p_note: `Used in repair ${ticket?.ticket_number ?? ticketId}`,
  } as any);

  if (!error) {
    const { data: movement } = await (supabase.from("inventory_movements") as any)
      .select("id")
      .eq("reference_type", "repair_part")
      .eq("reference_id", repairPartId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();
    if (movement) {
      await (supabase.from("repair_parts") as any).update({ inventory_movement_id: movement.id }).eq("id", repairPartId);
    }
  }
}

export async function removeRepairPart(partId: string, ticketId: string): Promise<ServiceResult> {
  const guardResult = await guard("repairs.write");
  if (guardResult) return guardResult;

  const supabase = createClient();
  const { data: part } = await (supabase.from("repair_parts") as any)
    .select("product_id, variant_id, quantity, inventory_movement_id")
    .eq("id", partId)
    .maybeSingle();

  // If inventory was consumed for this part, return it via a proper
  // 'return' movement before deleting the row — never silently drop the
  // consumption from the ledger.
  if (part?.inventory_movement_id && part.product_id) {
    const { data: inventoryRow } = await (supabase.from("inventory") as any)
      .select("id")
      .eq("product_id", part.product_id)
      .is("variant_id", part.variant_id)
      .maybeSingle();
    if (inventoryRow) {
      await supabase.rpc("apply_inventory_movement" as any, {
        p_inventory_id: inventoryRow.id,
        p_movement_type: "return",
        p_quantity_delta: part.quantity,
        p_reference_type: "repair_part",
        p_reference_id: partId,
        p_note: `Removed from repair ${ticketId}`,
      } as any);
    }
  }

  const { error } = await (supabase.from("repair_parts") as any).delete().eq("id", partId);
  if (error) return { success: false, error: "Could not remove part." };
  return { success: true };
}
