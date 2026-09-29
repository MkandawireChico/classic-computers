"use server";

import { revalidatePath } from "next/cache";
import { updateReferralStatus } from "@/lib/data/admin/referrals";

export async function updateReferralStatusAction(input: unknown) {
  const result = await updateReferralStatus(input);
  if (result.success) revalidatePath("/admin/referrals");
  return result;
}
