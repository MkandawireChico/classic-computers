import "server-only";
import { createClient } from "@/lib/supabase/server";

export interface AdminOrderListItem {
  id: string;
  order_number: string;
  created_at: string;
  order_status: string;
  payment_status: string;
  fulfillment_type: string;
  total: number;
  customer_name: string | null;
  guest_name: string | null;
}

export interface AdminOrderFilters {
  query?: string;
  status?: string;
  paymentStatus?: string;
  fulfillmentType?: string;
  page?: number;
  pageSize?: number;
}

export async function listAdminOrders(filters: AdminOrderFilters) {
  const supabase = createClient();
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 25;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query = (supabase.from("orders") as any)
    .select(
      `
      id, order_number, created_at, order_status, payment_status, fulfillment_type, total,
      guest_name,
      customers ( profiles ( full_name ) )
    `,
      { count: "exact" },
    )
    .order("created_at", { ascending: false });

  if (filters.status) query = query.eq("order_status", filters.status);
  if (filters.paymentStatus) query = query.eq("payment_status", filters.paymentStatus);
  if (filters.fulfillmentType) query = query.eq("fulfillment_type", filters.fulfillmentType);
  if (filters.query && filters.query.trim()) {
    query = query.ilike("order_number", `%${filters.query.trim()}%`);
  }

  const { data, error, count } = await query.range(from, to);
  if (error) {
    console.error("listAdminOrders failed:", error.message);
    return { items: [] as AdminOrderListItem[], total: 0, page, pageSize };
  }

  const items: AdminOrderListItem[] = (data ?? []).map((row: any) => ({
    id: row.id,
    order_number: row.order_number,
    created_at: row.created_at,
    order_status: row.order_status,
    payment_status: row.payment_status,
    fulfillment_type: row.fulfillment_type,
    total: Number(row.total),
    customer_name: row.customers?.profiles?.full_name ?? null,
    guest_name: row.guest_name,
  }));

  return { items, total: count ?? items.length, page, pageSize };
}

export interface AdminOrderDetail {
  id: string;
  order_number: string;
  created_at: string;
  order_status: string;
  payment_status: string;
  fulfillment_type: string;
  payment_method: string;
  subtotal: number;
  discount_total: number;
  total: number;
  notes: string | null;
  internal_notes: string | null;
  guest_name: string | null;
  guest_phone: string | null;
  guest_email: string | null;
  customer_id: string | null;
  customer_name: string | null;
  customer_phone: string | null;
  delivery_snapshot: any;
  items: Array<{
    id: string;
    product_name_snapshot: string;
    sku_snapshot: string;
    unit_price: number;
    quantity: number;
    discount_amount: number;
    line_total: number;
  }>;
  statusHistory: Array<{ from_status: string | null; to_status: string; created_at: string }>;
}

export async function getAdminOrderById(id: string): Promise<AdminOrderDetail | null> {
  const supabase = createClient();

  const { data: order, error } = await (supabase
    .from("orders") as any)
    .select(`
      id, order_number, created_at, order_status, payment_status, fulfillment_type, payment_method,
      subtotal, discount_total, total, notes, internal_notes, guest_name, guest_phone, guest_email, customer_id,
      delivery_snapshot,
      customers ( profiles ( full_name, phone ) )
    `)
    .eq("id", id)
    .maybeSingle();

  if (error || !order) return null;

  const [{ data: items }, { data: history }] = await Promise.all([
    (supabase.from("order_items") as any)
      .select("id, product_name_snapshot, sku_snapshot, unit_price, quantity, discount_amount, line_total")
      .eq("order_id", id),
    (supabase.from("order_status_history") as any)
      .select("from_status, to_status, created_at")
      .eq("order_id", id)
      .order("created_at", { ascending: true }),
  ]);

  return {
    id: order.id,
    order_number: order.order_number,
    created_at: order.created_at,
    order_status: order.order_status,
    payment_status: order.payment_status,
    fulfillment_type: order.fulfillment_type,
    payment_method: order.payment_method,
    subtotal: Number(order.subtotal),
    discount_total: Number(order.discount_total),
    total: Number(order.total),
    notes: order.notes,
    internal_notes: order.internal_notes,
    guest_name: order.guest_name,
    guest_phone: order.guest_phone,
    guest_email: order.guest_email,
    customer_id: order.customer_id,
    customer_name: order.customers?.profiles?.full_name ?? null,
    customer_phone: order.customers?.profiles?.phone ?? null,
    delivery_snapshot: order.delivery_snapshot,
    items: items ?? [],
    statusHistory: history ?? [],
  };
}
