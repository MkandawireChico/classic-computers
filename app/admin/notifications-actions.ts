"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function markNotificationRead(notificationId: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { success: false as const, error: "Not signed in." };

  // Note: role-targeted notifications (recipient_role_id) are shared
  // across every staff member holding that role — Phase 2's schema has a
  // single is_read flag per notification, not a per-user read-receipt
  // table, so marking one read marks it read for all staff who'd see it.
  // This is a deliberate simplification within the existing architecture
  // (see PHASE_5 completion report), not an oversight.
  const { error } = await (supabase.from("notifications") as any)
    .update({ is_read: true })
    .eq("id", notificationId);

  if (error) return { success: false as const, error: "Could not update notification." };
  revalidatePath("/admin", "layout");
  return { success: true as const };
}
