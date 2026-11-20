import "server-only";
import { createClient } from "@/lib/supabase/server";
import { getPublicStorageUrl } from "@/lib/storage";

export interface OrderListItem {
  id: string;
  order_number: string;
  created_at: string;
  order_status: string;
  payment_status: string;
  total: number;
  verified_received: number;
  total_refunded: number;
  outstanding_balance: number | null;
  has_verified_transactions: boolean;
  items: Array<{ product_id: string; product_name_snapshot: string }>;
}

export interface OrderItemDetail {
  id: string;
  product_id: string;
  product_name_snapshot: string;
  sku_snapshot: string;
  unit_price: number;
  quantity: number;
  discount_amount: number;
  line_total: number;
  image_url: string | null;
}

export interface OrderStatusEvent {
  from_status: string | null;
  to_status: string;
  created_at: string;
}

export interface OrderPaymentEvent {
  from_status: string | null;
  to_status: string;
  created_at: string;
}

export interface OrderPaymentTransaction {
  id: string;
  transaction_type: string;
  provider: string;
  amount: number;
  currency: string;
  provider_reference: string | null;
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
  paymentHistory: OrderPaymentEvent[];
  paymentTransactions: OrderPaymentTransaction[];
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
    .select("id, order_number, created_at, order_status, payment_status, total, order_items(product_id, product_name_snapshot)")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("getMyOrders failed:", error.message);
    throw new Error("Could not load your orders. Please refresh the page and try again.");
  }

  const orders = data ?? [];
  const orderIds = orders.map((order: any) => order.id);
  const transactionResult = orderIds.length
    ? await supabase.from("order_payment_transactions")
        .select("order_id, transaction_type, amount")
        .in("order_id", orderIds)
    : { data: [], error: null };

  if (transactionResult.error) {
    console.error("getMyOrders payment summary failed:", transactionResult.error.message);
    throw new Error("Could not load your payment summaries. Please refresh the page and try again.");
  }

  const totals = new Map<string, { paid: number; refunded: number }>();
  for (const transaction of transactionResult.data ?? []) {
    const current = totals.get(transaction.order_id) ?? { paid: 0, refunded: 0 };
    if (transaction.transaction_type === "refund") current.refunded += Number(transaction.amount);
    else current.paid += Number(transaction.amount);
    totals.set(transaction.order_id, current);
  }

  return orders.map((order: any) => {
    const ledger = totals.get(order.id);
    const hasVerifiedTransactions = Boolean(ledger);
    const paid = ledger?.paid ?? 0;
    const refunded = ledger?.refunded ?? 0;
    const verifiedReceived = paid - refunded;
    const outstandingBalance = !hasVerifiedTransactions && order.payment_status !== "unpaid"
      ? null
      : refunded > 0
        ? 0
        : Math.max(Number(order.total) - verifiedReceived, 0);

    return {
      ...order,
      verified_received: verifiedReceived,
      total_refunded: refunded,
      outstanding_balance: outstandingBalance,
      has_verified_transactions: hasVerifiedTransactions,
      items: order.order_items ?? [],
    };
  });
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

  if (error) {
    console.error("getMyOrderById failed:", error.message);
    throw new Error("Could not load this order. Please refresh the page and try again.");
  }
  if (!order) return null;

  const [itemsResult, historyResult, paymentHistoryResult, transactionsResult] = await Promise.all([
    (supabase.from("order_items") as any)
      .select("id, product_id, product_name_snapshot, sku_snapshot, unit_price, quantity, discount_amount, line_total, product:products(product_images(storage_path, alt_text, is_primary, display_order, variant_id))")
      .eq("order_id", orderId),
    (supabase.from("order_status_history") as any)
      .select("from_status, to_status, created_at")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true }),
    supabase.from("order_payment_history")
      .select("from_status, to_status, created_at")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true }),
    supabase.from("order_payment_transactions")
      .select("id, transaction_type, provider, amount, currency, provider_reference, created_at")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true }),
  ]);
  if (itemsResult.error || historyResult.error || paymentHistoryResult.error || transactionsResult.error) {
    console.error("getMyOrderById related data failed:", {
      items: itemsResult.error?.message,
      history: historyResult.error?.message,
      paymentHistory: paymentHistoryResult.error?.message,
      transactions: transactionsResult.error?.message,
    });
    throw new Error("Could not load the full order history. Please refresh the page and try again.");
  }
  const items = itemsResult.data;
  const history = historyResult.data;

  const orderItems = (items ?? []).map((item: any) => {
    const images = item.product?.product_images ?? [];
    const productImage = images.find((image: any) => image.is_primary && image.variant_id === null)
      ?? images.find((image: any) => image.variant_id === null)
      ?? images.find((image: any) => image.is_primary)
      ?? images[0];
    return {
      ...item,
      image_url: productImage ? getPublicStorageUrl("product-images", productImage.storage_path) : null,
    };
  });
  return { ...order, items: orderItems, statusHistory: history ?? [], paymentHistory: paymentHistoryResult.data ?? [], paymentTransactions: transactionsResult.data ?? [] };
}
