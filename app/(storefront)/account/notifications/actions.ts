"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

/**
 * RLS ("user can mark own notifications read", 0025:
 * recipient_user_id = auth.uid()) is the real boundary — this action
 * adds no extra filter because RLS already rejects any row that isn't
 * the caller's own.
 */
export async function markMyNotificationReadAction(notificationId: string) {
  const supabase = createClient();
  const { error } = await (supabase.from("notifications") as any).update({ is_read: true }).eq("id", notificationId);
  if (error) return { success: false as const, error: "Could not update notification." };
  revalidatePath("/account/notifications");
  revalidatePath("/account");
  return { success: true as const };
}

export async function markAllMyNotificationsReadAction() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false as const, error: "Not signed in." };

  const { error } = await (supabase.from("notifications") as any)
    .update({ is_read: true })
    .eq("recipient_user_id", user.id)
    .eq("is_read", false);
  if (error) return { success: false as const, error: "Could not update notifications." };
  revalidatePath("/account/notifications");
  revalidatePath("/account");
  return { success: true as const };
}
