import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server-admin";
import type { ApprovedReview, ReviewType } from "@/types/catalog";

export type ReviewRatingDistribution = Record<1 | 2 | 3 | 4 | 5, number>;

export interface ReviewCategoryStats {
  count: number;
  averageRating: number;
  distribution: ReviewRatingDistribution;
}

export type ReviewStats = {
  totalReviews: number;
  byType: Record<ReviewType, ReviewCategoryStats>;
};

const EMPTY_DISTRIBUTION: ReviewRatingDistribution = {
  1: 0,
  2: 0,
  3: 0,
  4: 0,
  5: 0,
};

function emptyStats(): ReviewStats {
  return {
    totalReviews: 0,
    byType: {
      product: { count: 0, averageRating: 0, distribution: { ...EMPTY_DISTRIBUTION } },
      rental: { count: 0, averageRating: 0, distribution: { ...EMPTY_DISTRIBUTION } },
      repair: { count: 0, averageRating: 0, distribution: { ...EMPTY_DISTRIBUTION } },
    },
  };
}

async function attachSignedImages(rows: any[]): Promise<ApprovedReview[]> {
  const paths = rows.flatMap((row) => row.review_images ?? []).map((image: any) => image.image_url);
  const signedByPath = new Map<string, string>();

  if (paths.length > 0) {
    try {
      const { data, error } = await createAdminClient()
        .storage.from("review-images")
        .createSignedUrls(paths, 60 * 60);
      if (error) {
        console.error("Could not sign approved review photos:", error.message);
        // Return reviews without images rather than failing entirely
        return rows.map((row) => ({
          ...row,
          images: [],
        })) as ApprovedReview[];
      }
      for (const item of data ?? []) {
        if (!item.path || !item.signedUrl || item.error) {
          console.error("Could not sign approved review photo:", item.error);
          continue; // Skip this image but don't fail the entire request
        }
        signedByPath.set(item.path, item.signedUrl);
      }
    } catch (err) {
      console.error("Error signing review images:", err instanceof Error ? err.message : String(err));
      // Return reviews without images rather than failing entirely
      return rows.map((row) => ({
        ...row,
        images: [],
      })) as ApprovedReview[];
    }
  }

  return rows.map((row) => ({
    ...row,
    images: (row.review_images ?? []).map((image: any) => ({
      id: image.id,
      image_url: signedByPath.get(image.image_url) ?? "",
      alt_text: image.alt_text,
    })).filter((image: any) => image.image_url),
  })) as ApprovedReview[];
}

async function loadStats(reviewType?: ReviewType, productId?: string): Promise<ReviewStats> {
  try {
    const supabase = createClient();
    const { data, error } = await (supabase.rpc as any)("get_public_review_stats", {
      p_review_type: reviewType ?? null,
      p_product_id: productId ?? null,
    });

    if (error) {
      console.error("get_public_review_stats failed:", error.message);
      // Return empty stats rather than failing entirely
      return emptyStats();
    }

    const stats = emptyStats();
    for (const row of data ?? []) {
      const type = row.review_type as ReviewType;
      if (!(type in stats.byType)) continue;
      stats.byType[type] = {
        count: Number(row.review_count),
        averageRating: Number(row.average_rating),
        distribution: {
          1: Number(row.one_star),
          2: Number(row.two_star),
          3: Number(row.three_star),
          4: Number(row.four_star),
          5: Number(row.five_star),
        },
      };
    }
    stats.totalReviews = Object.values(stats.byType).reduce((sum, category) => sum + category.count, 0);
    return stats;
  } catch (err) {
    console.error("Error loading review stats:", err instanceof Error ? err.message : String(err));
    // Return empty stats rather than failing entirely
    return emptyStats();
  }
}

export const getApprovedReviews = cache(async function getApprovedReviews(
  limit = 6,
  reviewType?: ReviewType,
): Promise<ApprovedReview[]> {
  const supabase = createClient();
  let query = (supabase
    .from("reviews")
    .select(`
      id, review_type, rating, title, comment, verified_purchase, created_at, updated_at, admin_response,
      product:products ( name, slug ),
      review_images ( id, image_url, alt_text )
    `) as any)
    .eq("status", "approved");

  if (reviewType) query = query.eq("review_type", reviewType);

  const { data, error } = await query.order("created_at", { ascending: false }).limit(limit);
  if (error) {
    console.error("getApprovedReviews failed:", error.message);
    throw new Error("Could not load approved reviews.");
  }
  return attachSignedImages(data ?? []);
});

export const getReviewStats = cache(async function getReviewStats(): Promise<ReviewStats> {
  return loadStats();
});

export const getProductReviews = cache(async function getProductReviews(
  productId: string,
  limit = 10,
): Promise<ApprovedReview[]> {
  const supabase = createClient();
  const { data, error } = await (supabase
    .from("reviews")
    .select(`
      id, review_type, rating, title, comment, verified_purchase, created_at, updated_at, admin_response,
      product:products ( name, slug ),
      review_images ( id, image_url, alt_text )
    `) as any)
    .eq("product_id", productId)
    .eq("review_type", "product")
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getProductReviews failed:", error.message);
    throw new Error("Could not load product reviews.");
  }
  return attachSignedImages(data ?? []);
});

export const getProductRatingSummary = cache(async function getProductRatingSummary(
  productId: string,
): Promise<ReviewCategoryStats> {
  const stats = await loadStats("product", productId);
  return stats.byType.product;
});

export async function getPublicReviewsPage({
  reviewType,
  rating,
  sort = "newest",
  page = 1,
  pageSize = 10,
}: {
  reviewType?: ReviewType;
  rating?: number;
  sort?: "newest" | "highest";
  page?: number;
  pageSize?: number;
}): Promise<{ items: ApprovedReview[]; total: number; page: number; pageSize: number }> {
  const supabase = createClient();
  const normalizedPage = Math.max(1, Math.floor(page));
  const from = (normalizedPage - 1) * pageSize;
  let query = (supabase
    .from("reviews")
    .select(`
      id, review_type, rating, title, comment, verified_purchase, created_at, updated_at, admin_response,
      product:products ( name, slug ),
      review_images ( id, image_url, alt_text )
    `, { count: "exact" }) as any)
    .eq("status", "approved");

  if (reviewType) query = query.eq("review_type", reviewType);
  if (rating) query = query.eq("rating", rating);

  if (sort === "highest") {
    query = query.order("rating", { ascending: false }).order("created_at", { ascending: false });
  } else {
    query = query.order("created_at", { ascending: false });
  }
  query = query.range(from, from + pageSize - 1);

  const { data, error, count } = await query;
  if (error) {
    console.error("getPublicReviewsPage failed:", error.message);
    throw new Error("Could not load customer reviews.");
  }

  const total = count ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (normalizedPage > totalPages) {
    return getPublicReviewsPage({ reviewType, rating, sort, page: totalPages, pageSize });
  }
  return {
    items: await attachSignedImages(data ?? []),
    total,
    page: normalizedPage,
    pageSize,
  };
}
