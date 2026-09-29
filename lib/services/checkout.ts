import "server-only";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { getCartIdReadOnly, clearGuestCartCookie } from "./cart";
import { checkoutSchema } from "@/schemas/checkout";

const GUEST_ORDER_COOKIE_PREFIX = "cc_order_";

export type CheckoutResult =
  | { success: true; orderNumber: string }
  | { success: false; error: string };

export async function submitCheckout(input: unknown): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }
  const data = parsed.data;

  const cartId = await getCartIdReadOnly();
  if (!cartId) {
    return { success: false, error: "Your cart is empty." };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const client: SupabaseClient<Database> = user ? supabase : createAdminClient();

  // Self-heal: the /cart page already shows unavailable items separately
  // and excludes them from the displayed total, so silently drop them here
  // too rather than letting create_order() reject the whole checkout over
  // an item the customer was never going to pay for anyway. create_order()
  // itself stays strict about publication status — this pruning is what
  // keeps the customer-facing path from tripping over that strictness.
  const { data: cartItems } = await (client.from("cart_items") as any)
    .select("id, product_id, variant_id, products ( status ), product_variants ( status )")
    .eq("cart_id", cartId);

  const staleIds = (cartItems ?? [])
    .filter((row: any) => row.products?.status !== "published" || (row.variant_id && row.product_variants?.status !== "active"))
    .map((row: any) => row.id);

  if (staleIds.length > 0) {
    await (client.from("cart_items") as any).delete().in("id", staleIds);
  }

  const { data: remaining } = await (client.from("cart_items") as any).select("id").eq("cart_id", cartId).limit(1);
  if (!remaining || remaining.length === 0) {
    return { success: false, error: "The items in your cart are no longer available." };
  }

  // Guest delivery address is now passed as structured fields directly to
  // create_order() (migration 0033), which builds orders.delivery_snapshot
  // itself — notes stays plain, no more address-in-notes folding.
  const notes = data.notes ?? null;

  // Authenticated: the normal RLS-bound client carries the user's session,
  // so auth.uid() inside create_order() resolves correctly and the
  // function's own ownership check applies.
  // Guest: no Supabase Auth session exists at all, so the privileged
  // client (already selected above) is required to invoke the RPC —
  // ownership was already verified by construction, since
  // getCartIdReadOnly() only returns a cart id that matches this guest's
  // own session_token cookie.
  const isDelivery = data.fulfillmentType === "delivery";
  const { data: result, error } = await (client.rpc as any)("create_order", {
    p_cart_id: cartId,
    p_fulfillment_type: data.fulfillmentType,
    p_payment_method: data.paymentMethod,
    p_guest_name: user ? null : data.guestName ?? null,
    p_guest_phone: user ? null : data.guestPhone ?? null,
    p_guest_email: user ? null : data.guestEmail || null,
    p_delivery_address_id: isDelivery ? data.deliveryAddressId ?? null : null,
    p_notes: notes,
    p_guest_delivery_line1: !user && isDelivery ? data.guestDeliveryLine1 ?? null : null,
    p_guest_delivery_line2: !user && isDelivery ? data.guestDeliveryLine2 ?? null : null,
    p_guest_delivery_city: !user && isDelivery ? data.guestDeliveryCity ?? null : null,
    p_guest_delivery_district: !user && isDelivery ? data.guestDeliveryDistrict ?? null : null,
  } as any);

  if (error) {
    console.error("create_order failed:", error.message);
    // The function raises specific, non-sensitive exceptions (e.g. "X is
    // no longer available") — safe to surface directly rather than a
    // generic message, since nothing internal leaks through them.
    return { success: false, error: error.message.replace(/^.*?: /, "") };
  }

  const row = Array.isArray((result as any)) ? (result as any[])[0] : (result as any);
  if (!row?.order_number) {
    return { success: false, error: "Something went wrong creating your order. Please try again." };
  }

  if (!user) {
    await clearGuestCartCookie();
    // Gate for the /checkout/confirmation/[orderNumber] page: possession of
    // this cookie — not knowledge of the order number itself — is what
    // authorizes a guest to view their own confirmation. Order numbers
    // (CC-YYYY-NNNNNN) are sequential and low-entropy, so without this
    // cookie check, a guest confirmation route keyed only on order_number
    // would let anyone enumerate other guests' order details.
    cookies().set(`${GUEST_ORDER_COOKIE_PREFIX}${row.order_number}`, "1", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60, // 1 hour — long enough to view the confirmation, not a standing credential
    });
  }

  return { success: true, orderNumber: row.order_number };
}

export async function guestHasConfirmationAccess(orderNumber: string): Promise<boolean> {
  return cookies().get(`${GUEST_ORDER_COOKIE_PREFIX}${orderNumber}`) !== undefined;
}
