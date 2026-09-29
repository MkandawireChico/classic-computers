"use server";

import { revalidatePath } from "next/cache";
import { updateSetting } from "@/lib/services/admin/settings";

export async function updateSettingAction(key: string, value: Record<string, unknown>) {
  const result = await updateSetting(key, value);
  if (result.success) {
    revalidatePath("/admin/settings");
    revalidatePath("/", "layout");
  }
  return result;
}
