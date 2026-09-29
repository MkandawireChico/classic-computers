import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface AdminReview {
  id: string;
  rating: number;
  title: string | null;
  comment: string | null;
  status: string;
  created_at: string;
  product_name: string | null;
  product_slug: string | null;
  customer_name: string | null;
}

export async function listAdminReviews(status?: string, page = 1, pageSize = 25) {
  const supabase = createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = (supabase.from("reviews") as any)
    .select(
      `
      id, rating, title, comment, status, created_at,
      products ( name, slug ),
      customers ( profiles ( full_name ) )
    `,
      { count: "exact" },
    )
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data, error, count } = await query.range(from, to);
  if (error) {
    console.error("listAdminReviews failed:", error.message);
    return { items: [] as AdminReview[], total: 0, page, pageSize };
  }

  const items: AdminReview[] = (data ?? []).map((row: any) => ({
    id: row.id,
    rating: row.rating,
    title: row.title,
    comment: row.comment,
    status: row.status,
    created_at: row.created_at,
    product_name: row.products?.name ?? null,
    product_slug: row.products?.slug ?? null,
    customer_name: row.customers?.profiles?.full_name ?? null,
  }));

  return { items, total: count ?? items.length, page, pageSize };
}
