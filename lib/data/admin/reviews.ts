import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface AdminReview {
  id: string;
  review_type: string;
  rating: number;
  title: string | null;
  comment: string | null;
  status: string;
  verified_purchase: boolean;
  created_at: string;
  updated_at: string;
  admin_response: string | null;
  admin_response_at: string | null;
  product_name: string | null;
  product_slug: string | null;
  customer_name: string | null;
  order_id: string | null;
  rental_booking_id: string | null;
  repair_ticket_id: string | null;
  transaction_reference: string;
}

export async function listAdminReviews(status?: string, page = 1, pageSize = 25) {
  const supabase = createClient();
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = (supabase.from("reviews") as any)
    .select(
      `
      id, review_type, rating, title, comment, status, verified_purchase, created_at, updated_at, admin_response, admin_response_at,
      order_id, rental_booking_id, repair_ticket_id,
      products ( name, slug ),
      orders ( order_number ),
      rental_bookings ( id ),
      repair_tickets ( ticket_number ),
      customers ( profiles ( full_name ) )
    `,
      { count: "exact" },
    )
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data, error, count } = await query.range(from, to);
  if (error) {
    console.error("listAdminReviews failed:", error.message);
    throw new Error("Could not load reviews for moderation.");
  }

  const items: AdminReview[] = (data ?? []).map((row: any) => ({
    id: row.id,
    review_type: row.review_type,
    rating: row.rating,
    title: row.title,
    comment: row.comment,
    status: row.status,
    verified_purchase: row.verified_purchase,
    created_at: row.created_at,
    updated_at: row.updated_at,
    admin_response: row.admin_response,
    admin_response_at: row.admin_response_at,
    product_name: row.products?.name ?? null,
    product_slug: row.products?.slug ?? null,
    customer_name: row.customers?.profiles?.full_name ?? null,
    order_id: row.order_id,
    rental_booking_id: row.rental_booking_id,
    repair_ticket_id: row.repair_ticket_id,
    transaction_reference:
      row.review_type === "product"
        ? row.orders?.order_number ?? row.order_id ?? "Unknown order"
        : row.review_type === "rental"
          ? row.rental_booking_id ?? "Unknown rental"
          : row.repair_tickets?.ticket_number ?? row.repair_ticket_id ?? "Unknown repair",
  }));

  return { items, total: count ?? items.length, page, pageSize };
}
