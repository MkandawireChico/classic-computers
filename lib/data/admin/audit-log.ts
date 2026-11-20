import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface AdminAuditEntry {
  id: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
  actor_name: string | null;
}

export async function listAdminAuditEntries(limit = 100): Promise<AdminAuditEntry[]> {
  const supabase = createClient();
  const { data, error } = await (supabase.from("audit_logs") as any)
    .select("id, actor_id, action, entity_type, entity_id, metadata, created_at")
    .order("created_at", { ascending: false })
    .limit(Math.min(Math.max(limit, 1), 200));

  if (error) {
    console.error("listAdminAuditEntries failed:", error.message);
    throw new Error("Could not load the activity log. Refresh the page and try again.");
  }

  const rows = data ?? [];
  const actorIds = Array.from(new Set(rows.map((row: any) => row.actor_id).filter(Boolean)));
  const { data: profiles, error: profileError } = actorIds.length
    ? await (supabase.from("profiles") as any).select("id, full_name").in("id", actorIds)
    : { data: [], error: null };
  if (profileError) {
    console.error("listAdminAuditEntries actor lookup failed:", profileError.message);
  }
  const names = new Map((profiles ?? []).map((profile: any) => [profile.id, profile.full_name]));

  return rows.map((row: any) => ({
    id: row.id,
    action: row.action,
    entity_type: row.entity_type,
    entity_id: row.entity_id,
    metadata: row.metadata ?? {},
    created_at: row.created_at,
    actor_name: row.actor_id ? names.get(row.actor_id) ?? "Staff member" : "System",
  }));
}
