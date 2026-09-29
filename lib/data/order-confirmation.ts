import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { guestHasConfirmationAccess } from "@/lib/services/checkout";
import type { OrderDetail } from "./orders";

export async function getOrderConfirmation(orderNumber: string): Promise<OrderDetail | null> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const client: SupabaseClient<Database> = user ? supabase : createAdminClient();

  if (!user) {
    const allowed = await guestHasConfirmationAccess(orderNumber);
    if (!allowed) return null;
  }

  const { data: order, error } = await (client
    .from("orders") as any)
    .select(
      "id, order_number, created_at, order_status, payment_status, total, subtotal, discount_total, currency, payment_method, fulfillment_type, notes, guest_name, guest_phone, delivery_snapshot, customer_id",
    )
    .eq("order_number", orderNumber)
    .maybeSingle();

  if (error || !order) return null;

  // For an authenticated request, RLS already restricts the row above to
  // the caller's own orders — but since the admin client bypasses RLS for
  // the guest path, this explicit check is the actual boundary there, not
  // just defense in depth: without it, a signed-in user guessing another
  // customer's order number would get nothing back anyway (RLS), but a
  // guest is only ever using the admin client, so the cookie check above
  // is what stands in for that boundary.
  if (user && order.customer_id && order.customer_id !== user.id) return null;

  const [{ data: items }, { data: history }] = await Promise.all([
    (client.from("order_items") as any)
      .select("id, product_name_snapshot, sku_snapshot, unit_price, quantity, discount_amount, line_total")
      .eq("order_id", order.id),
    (client.from("order_status_history") as any)
      .select("from_status, to_status, created_at")
      .eq("order_id", order.id)
      .order("created_at", { ascending: true }),
  ]);

  return { ...order, items: items ?? [], statusHistory: history ?? [] };
}
