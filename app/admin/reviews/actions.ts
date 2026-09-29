"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requirePermission, AuthorizationError } from "@/lib/auth/permissions";

const moderateSchema = z.object({
  reviewId: z.string().uuid(),
  status: z.enum(["approved", "rejected", "hidden"]),
});

export async function moderateReviewAction(input: unknown) {
  try {
    await requirePermission("reviews.moderate");
  } catch (e) {
    if (e instanceof AuthorizationError) {
      return { success: false as const, error: "You don't have permission to moderate reviews." };
    }
    throw e;
  }

  const parsed = moderateSchema.safeParse(input);
  if (!parsed.success) return { success: false as const, error: "Invalid moderation action." };

  const supabase = createClient();
  // audit_reviews_trigger (0034) logs this status change to audit_logs
  // automatically — no separate log_audit_event() call needed here.
  const { error } = await (supabase.from("reviews") as any)
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.reviewId);

  if (error) return { success: false as const, error: "Could not update review." };
  revalidatePath("/admin/reviews");
  return { success: true as const };
}
