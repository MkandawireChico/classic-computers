import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface MyNotification {
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
 * Relies entirely on RLS ("user can read own notifications", 0025:
 * recipient_user_id = auth.uid()) — no additional filter is added here
 * because there is no unauthenticated or cross-user path into this
 * function. Staff-only role-targeted notifications (recipient_role_id)
 * are structurally invisible here: they have recipient_user_id = null,
 * so the RLS policy this query relies on never matches them.
 */
export async function getMyNotifications(): Promise<MyNotification[]> {
  const supabase = createClient();
  const { data, error } = await (supabase.from("notifications") as any)
    .select("id, type, title, body, is_read, related_entity_type, related_entity_id, created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  if (error) {
    console.error("getMyNotifications failed:", error.message);
    return [];
  }
  return data ?? [];
}

export function notificationLink(notification: MyNotification): string | null {
  switch (notification.related_entity_type) {
    case "order":
      return `/account/orders/${notification.related_entity_id}`;
    case "repair_ticket":
      return `/account/repairs/${notification.related_entity_id}`;
    case "rental_booking":
      return `/account/rentals/${notification.related_entity_id}`;
    case "student_verification":
      return "/account/student-verification";
    case "referral":
      return "/account/referrals";
    default:
      return null;
  }
}
