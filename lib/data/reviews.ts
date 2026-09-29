import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type { ApprovedReview } from "@/types/catalog";

/**
 * Only ever selects status='approved'. RLS already enforces this for
 * anon/authenticated callers (see 0019_reviews.sql) — this filter is
 * defense in depth, not the actual boundary.
 */
export const getApprovedReviews = cache(async function getApprovedReviews(limit = 6): Promise<ApprovedReview[]> {
  const supabase = createClient();
  const { data, error } = await (supabase
    .from("reviews")
    .select(`
      id, rating, title, comment, created_at,
      product:products ( name, slug )
    `) as any)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getApprovedReviews failed:", error.message);
    return [];
  }
  return (data ?? []) as ApprovedReview[];
});
