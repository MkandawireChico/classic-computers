import "server-only";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getMyRoleAssignments } from "@/lib/auth/permissions";
import { createClient } from "@/lib/supabase/server";

export interface AdminNotification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  is_read: boolean;
  related_entity_type: string | null;
  related_entity_id: string | null;
  created_at: string;
}

/**
 * Notifications visible to the current staff member: ones addressed to
 * them directly, plus ones addressed to any role they hold (e.g. every
 * order.created notification goes to admin/staff/sales via
 * recipient_role_id — see create_order() in 0032/0033).
 */
export async function getMyAdminNotifications(limit = 20): Promise<AdminNotification[]> {
  const supabase = createClient();
  const user = await getCurrentUser();
  if (!user) return [];

  const roleAssignments = await getMyRoleAssignments();
  const roleIds = roleAssignments.map((assignment) => assignment.role_id);

  let query = (supabase.from("notifications") as any)
    .select("id, type, title, body, is_read, related_entity_type, related_entity_id, created_at")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (roleIds.length > 0) {
    query = query.or(`recipient_user_id.eq.${user.id},recipient_role_id.in.(${roleIds.join(",")})`);
  } else {
    query = query.eq("recipient_user_id", user.id);
  }

  const { data, error } = await query;
  if (error) {
    console.error("getMyAdminNotifications failed:", error.message);
    return [];
  }
  return data ?? [];
}

export async function getUnreadAdminNotificationCount(): Promise<number> {
  const notifications = await getMyAdminNotifications(50);
  return notifications.filter((n) => !n.is_read).length;
}
