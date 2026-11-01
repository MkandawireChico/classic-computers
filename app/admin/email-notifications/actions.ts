"use server";

import { revalidatePath } from "next/cache";
import { retryAdminEmailNotification } from "@/lib/services/admin-email-outbox";

export async function retryAdminEmailNotificationAction(notificationId: string) {
  const result = await retryAdminEmailNotification(notificationId);
  revalidatePath("/admin/email-notifications");
  return result;
}