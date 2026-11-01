import "server-only";
import { getCurrentUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";
import type { ReviewType } from "@/types/catalog";

export interface CustomerReviewStatus {
  id: string;
  status: "pending" | "approved" | "rejected" | "hidden";
  admin_response: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomerReviewStatuses {
  products: Record<string, CustomerReviewStatus>;
  rentals: Record<string, CustomerReviewStatus>;
  repairs: Record<string, CustomerReviewStatus>;
}

export async function getMyReviewStatuses({
  orderIds = [],
  rentalIds = [],
  repairIds = [],
}: {
  orderIds?: string[];
  rentalIds?: string[];
  repairIds?: string[];
}): Promise<CustomerReviewStatuses> {
  const user = await getCurrentUser();
  if (!user) return { products: {}, rentals: {}, repairs: {} };

  const supabase = createClient();
  const queries = [
    orderIds.length
      ? (supabase.from("reviews") as any)
          .select("id, review_type, order_id, product_id, status, admin_response, created_at, updated_at")
          .eq("customer_id", user.id)
          .eq("review_type", "product")
          .in("order_id", orderIds)
          .order("created_at", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    rentalIds.length
      ? (supabase.from("reviews") as any)
          .select("id, review_type, rental_booking_id, status, admin_response, created_at, updated_at")
          .eq("customer_id", user.id)
          .eq("review_type", "rental")
          .in("rental_booking_id", rentalIds)
          .order("created_at", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
    repairIds.length
      ? (supabase.from("reviews") as any)
          .select("id, review_type, repair_ticket_id, status, admin_response, created_at, updated_at")
          .eq("customer_id", user.id)
          .eq("review_type", "repair")
          .in("repair_ticket_id", repairIds)
          .order("created_at", { ascending: true })
      : Promise.resolve({ data: [], error: null }),
  ];
  const [products, rentals, repairs] = await Promise.all(queries);

  for (const result of [products, rentals, repairs]) {
    if (result.error) {
      console.error("Could not load customer review statuses:", result.error.message);
      throw new Error("Could not load your review status.");
    }
  }

  const toStatus = (row: any): CustomerReviewStatus => ({
    id: row.id,
    status: row.status,
    admin_response: row.admin_response,
    created_at: row.created_at,
    updated_at: row.updated_at,
  });
  return {
    products: Object.fromEntries((products.data ?? []).map((row: any) => [`${row.order_id}:${row.product_id}`, toStatus(row)])),
    rentals: Object.fromEntries((rentals.data ?? []).map((row: any) => [row.rental_booking_id, toStatus(row)])),
    repairs: Object.fromEntries((repairs.data ?? []).map((row: any) => [row.repair_ticket_id, toStatus(row)])),
  };
}

export interface CustomerReview {
  id: string;
  review_type: ReviewType;
  product_id: string | null;
  order_id: string | null;
  rental_booking_id: string | null;
  repair_ticket_id: string | null;
  rating: number;
  title: string | null;
  comment: string;
  status: CustomerReviewStatus["status"];
  admin_response: string | null;
  admin_response_at: string | null;
  created_at: string;
  product: { name: string } | null;
}

export async function getMyReviews(): Promise<CustomerReview[]> {
  const user = await getCurrentUser();
  if (!user) return [];

  const supabase = createClient();
  const { data, error } = await (supabase.from("reviews") as any)
    .select("id, review_type, product_id, order_id, rental_booking_id, repair_ticket_id, rating, title, comment, status, admin_response, admin_response_at, created_at, product:products(name)")
    .eq("customer_id", user.id)
    .order("created_at", { ascending: false });
  if (error) {
    console.error("Could not load customer reviews:", error.message);
    throw new Error("Could not load your submitted reviews.");
  }
  return (data ?? []).map((row: any) => ({ ...row, product: row.product ?? null }));
}
