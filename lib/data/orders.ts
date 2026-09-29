import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface OrderListItem {
  id: string;
  order_number: string;
  created_at: string;
  order_status: string;
  payment_status: string;
  total: number;
}

export interface OrderItemDetail {
  id: string;
  product_name_snapshot: string;
  sku_snapshot: string;
  unit_price: number;
  quantity: number;
  discount_amount: number;
  line_total: number;
}

export interface OrderStatusEvent {
  from_status: string | null;
  to_status: string;
  created_at: string;
}

export interface DeliverySnapshot {
  full_name: string | null;
  phone: string | null;
  email: string | null;
  line1: string | null;
  line2: string | null;
  city: string | null;
  district: string | null;
  label: string | null;
}

export interface OrderDetail extends OrderListItem {
  subtotal: number;
  discount_total: number;
  currency: string;
  payment_method: string;
  fulfillment_type: string;
  notes: string | null;
  guest_name: string | null;
  guest_phone: string | null;
  delivery_snapshot: DeliverySnapshot | null;
  items: OrderItemDetail[];
  statusHistory: OrderStatusEvent[];
}

/**
 * Lists the CURRENT user's own orders only. RLS (0017: "customer can read
 * own orders", customer_id = auth.uid()) is the real boundary — this
 * function doesn't add an extra .eq() because there is no unauthenticated
 * path into it: getOrders() always runs under the caller's own session.
 */
export async function getMyOrders(): Promise<OrderListItem[]> {
  const supabase = createClient();
  // "orders" isn't in the hand-written Database type's Tables map (see
  // types/supabase.ts header) — cast at the call site, same pattern used
  // throughout lib/data/ and lib/services/ for tables Phase 3's type file
  // didn't cover.
  const { data, error } = await (supabase.from("orders") as any)
    .select("id, order_number, created_at, order_status, payment_status, total")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getMyOrders failed:", error.message);
    return [];
  }
  return data ?? [];
}

/**
 * Fetches one order by id, scoped to the current user via RLS. Returns
 * null both when the order doesn't exist AND when it belongs to someone
 * else — RLS makes those two cases indistinguishable at the query level,
 * which is exactly the point (no way to probe for another customer's
 * order id).
 */
export async function getMyOrderById(orderId: string): Promise<OrderDetail | null> {
  const supabase = createClient();

  const { data: order, error } = await (supabase.from("orders") as any)
    .select(
      "id, order_number, created_at, order_status, payment_status, total, subtotal, discount_total, currency, payment_method, fulfillment_type, notes, guest_name, guest_phone, delivery_snapshot",
    )
    .eq("id", orderId)
    .maybeSingle();

  if (error || !order) return null;

  const [{ data: items }, { data: history }] = await Promise.all([
    (supabase.from("order_items") as any)
      .select("id, product_name_snapshot, sku_snapshot, unit_price, quantity, discount_amount, line_total")
      .eq("order_id", orderId),
    (supabase.from("order_status_history") as any)
      .select("from_status, to_status, created_at")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true }),
  ]);

  return { ...order, items: items ?? [], statusHistory: history ?? [] };
}
