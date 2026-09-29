import "server-only";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { repairTrackingSchema } from "@/schemas/repair";

export interface TrackedRepair {
  ticketNumber: string;
  status: string;
  deviceType: string;
  brand: string | null;
  model: string | null;
  problemDescription: string;
  createdAt: string;
  updates: Array<{ note: string; createdAt: string }>;
}

/**
 * Guest tracking lookup. Uses the privileged client because
 * repair_tickets intentionally has no anon SELECT policy (an anonymous
 * session has no stable auth.uid() for RLS to key off) — this function
 * IS the access-control check, verifying ticket_number AND
 * tracking_token both match before returning anything. Never returns a
 * ticket on a ticket_number match alone.
 */
export async function trackRepairAsGuest(input: unknown): Promise<TrackedRepair | { error: string }> {
  const parsed = repairTrackingSchema.safeParse(input);
  if (!parsed.success) return { error: "Enter both your ticket number and tracking code." };

  const admin = createAdminClient();
  const { data: ticket, error } = await (admin.from("repair_tickets") as any)
    .select("id, ticket_number, status, device_type, brand, model, problem_description, created_at")
    .eq("ticket_number", parsed.data.ticketNumber.trim())
    .eq("tracking_token", parsed.data.trackingToken.trim())
    .maybeSingle();

  if (error || !ticket) {
    return { error: "No matching repair found. Check your ticket number and tracking code." };
  }

  const { data: updates } = await (admin.from("repair_updates") as any)
    .select("note, created_at")
    .eq("ticket_id", ticket.id)
    .eq("is_internal", false)
    .order("created_at", { ascending: true });

  return {
    ticketNumber: ticket.ticket_number,
    status: ticket.status,
    deviceType: ticket.device_type,
    brand: ticket.brand,
    model: ticket.model,
    problemDescription: ticket.problem_description,
    createdAt: ticket.created_at,
    updates: (updates ?? []).map((u: any) => ({ note: u.note, createdAt: u.created_at })),
  };
}
