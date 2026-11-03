"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";
import { requirePermission, AuthorizationError } from "@/lib/auth/permissions";
import { getCurrentUser } from "@/lib/auth/current-user";

const moderateSchema = z.object({
  reviewId: z.string().uuid(),
  status: z.enum(["approved", "rejected", "hidden"]),
});

const respondSchema = z.object({
  reviewId: z.string().uuid(),
  response: z.string().trim().min(1).max(1000),
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
  const { data, error } = await (supabase.from("reviews") as any)
    .update({ status: parsed.data.status })
    .eq("id", parsed.data.reviewId)
    .select("id")
    .maybeSingle();

  if (error) return { success: false as const, error: "Could not update review." };
  if (!data) return { success: false as const, error: "Review not found or no change was made." };
  revalidatePath("/admin/reviews");
  revalidatePath("/");
  return { success: true as const };
}

export async function respondToReviewAction(input: unknown) {
  try {
    await requirePermission("reviews.moderate");
  } catch (e) {
    if (e instanceof AuthorizationError) {
      return { success: false as const, error: "You don't have permission to respond to reviews." };
    }
    throw e;
  }

  const parsed = respondSchema.safeParse(input);
  if (!parsed.success) return { success: false as const, error: parsed.error.issues[0]?.message ?? "Invalid response." };

  const user = await getCurrentUser();
  if (!user) return { success: false as const, error: "Not authenticated." };

  const supabase = createClient();
  const { data, error } = await (supabase.from("reviews") as any)
    .update({
      admin_response: parsed.data.response,
      admin_response_at: new Date().toISOString(),
      admin_response_by: user.id,
    })
    .eq("id", parsed.data.reviewId)
    .select("id")
    .maybeSingle();

  if (error) return { success: false as const, error: "Could not save response." };
  if (!data) return { success: false as const, error: "Review not found." };
  revalidatePath("/admin/reviews");
  revalidatePath("/");
  return { success: true as const };
}
