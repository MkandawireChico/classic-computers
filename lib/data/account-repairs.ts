import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface MyRepairListItem {
  id: string;
  ticket_number: string;
  device_type: string;
  status: string;
  created_at: string;
}

export async function getMyRepairs(): Promise<MyRepairListItem[]> {
  const supabase = createClient();
  const { data, error } = await (supabase.from("repair_tickets") as any)
    .select("id, ticket_number, device_type, status, created_at")
    .order("created_at", { ascending: false });
  if (error) {
    console.error("getMyRepairs failed:", error.message);
    return [];
  }
  return data ?? [];
}

export interface MyRepairDetail extends MyRepairListItem {
  brand: string | null;
  model: string | null;
  serial_number: string | null;
  problem_description: string;
  accessories_received: string | null;
  quote_amount: number | null;
  quote_approved_at: string | null;
  updates: Array<{ note: string; created_at: string }>;
}

/**
 * RLS ("customer can read own ticket") already scopes this to the
 * caller's own tickets. repair_updates similarly only exposes
 * is_internal = false rows to the owning customer (0023) — internal
 * technician notes never reach this query at all, not just hidden in the
 * UI.
 */
export async function getMyRepairById(id: string): Promise<MyRepairDetail | null> {
  const supabase = createClient();

  const { data: ticket, error } = await (supabase.from("repair_tickets") as any)
    .select(
      "id, ticket_number, device_type, brand, model, serial_number, status, problem_description, accessories_received, quote_amount, quote_approved_at, created_at",
    )
    .eq("id", id)
    .maybeSingle();
  if (error || !ticket) return null;

  const { data: updates } = await (supabase.from("repair_updates") as any)
    .select("note, created_at")
    .eq("ticket_id", id)
    .order("created_at", { ascending: true });

  return { ...ticket, quote_amount: ticket.quote_amount ? Number(ticket.quote_amount) : null, updates: updates ?? [] };
}
