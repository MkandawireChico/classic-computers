import "server-only";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/types/supabase";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/server-admin";
import { getCartIdReadOnly, clearGuestCartCookie } from "./cart";
import { checkoutSchema } from "@/schemas/checkout";
import { appendManualPaymentSelection } from "@/lib/payments/manual-payment";
import { deliverAdminEmailForRequest } from "@/lib/services/admin-email-outbox";
import { getPaymentMethods } from "@/lib/data/site-settings";

const GUEST_ORDER_COOKIE_PREFIX = "cc_order_";

export type CheckoutResult =
  | { success: true; orderNumber: string; productIds: string[] }
  | { success: false; error: string };

export async function submitCheckout(input: unknown): Promise<CheckoutResult> {
  const parsed = checkoutSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Please check the form and try again." };
  }
  const data = parsed.data;

  // The storefront hides disabled payment options, but server actions are
  // callable independently. Enforce the current public payment settings
  // here as well so a forged request cannot select a disabled method.
  const paymentMethods = await getPaymentMethods();
  if (!paymentMethods[data.paymentMethod]) {
    return { success: false, error: "This payment method is currently unavailable. Please choose another option." };
  }

  const cartId = await getCartIdReadOnly();
  if (!cartId) {
    return { success: false, error: "Your cart is empty." };
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const client: SupabaseClient<Database> = user ? supabase : createAdminClient();

  // Re-check publication, variant status and inventory because stock may
  // change between viewing the cart and submitting checkout. Keep stale
  // lines visible and stop submission so the customer must review the
  // changed basket rather than unknowingly placing a different order.
  const { data: cartItems, error: cartItemsError } = await (client.from("cart_items") as any)
    .select("id, product_id, variant_id, products ( status ), product_variants ( status )")
    .eq("cart_id", cartId);

  if (cartItemsError || !cartItems) {
    console.error("Checkout cart validation failed:", cartItemsError?.message);
    return { success: false, error: "We could not verify your cart. Please return to your cart and try again." };
  }

  const productIds = Array.from(new Set((cartItems ?? []).map((row: any) => row.product_id)));
  const { data: inventoryRows, error: inventoryError } = productIds.length
    ? await (client.from("storefront_inventory_status" as any) as any)
        .select("product_id, variant_id, status")
        .in("product_id", productIds)
    : { data: [], error: null };

  if (inventoryError) {
    console.error("Checkout inventory validation failed:", inventoryError.message);
    return { success: false, error: "We could not verify product availability. Please return to your cart and try again." };
  }

  const staleIds = (cartItems ?? [])
    .filter((row: any) => {
      const inventory = (inventoryRows ?? []).find(
        (entry: any) =>
          entry.product_id === row.product_id &&
          (row.variant_id ? entry.variant_id === row.variant_id : entry.variant_id === null),
      );
      const productAndVariantAvailable =
        row.products?.status === "published" &&
        (!row.variant_id || row.product_variants?.status === "active");
      const stockAvailable = inventory && ["in_stock", "low_stock"].includes(inventory.status);
      return !productAndVariantAvailable || !stockAvailable;
    })
    .map((row: any) => row.id);
  const staleIdSet = new Set(staleIds);
  const orderedProductIds: string[] = [];
  for (const row of cartItems ?? []) {
    if (staleIdSet.has(row.id) || typeof row.product_id !== "string" || orderedProductIds.includes(row.product_id)) continue;
    orderedProductIds.push(row.product_id);
  }

  if (staleIds.length > 0) {
    // Keep unavailable lines in the cart so the customer can see and remove
    // them. Never change the basket behind the customer's back.
    return {
      success: false,
      error: "Stock changed while you were checking out. Please review your cart, remove unavailable items and submit your order again.",
    };
  }

  const { data: remaining, error: remainingError } = await (client.from("cart_items") as any)
    .select("id")
    .eq("cart_id", cartId)
    .limit(1);
  if (remainingError) {
    console.error("Checkout remaining-cart verification failed:", remainingError.message);
    return { success: false, error: "We could not verify the items in your cart. Please return to your cart and try again." };
  }
  if (!remaining || remaining.length === 0) {
    return { success: false, error: "The items in your cart are no longer available." };
  }

  // Guest delivery address is now passed as structured fields directly to
  // create_order() (migration 0033), which builds orders.delivery_snapshot
  // itself — notes stays plain, no more address-in-notes folding.
  const notes =
    data.paymentProvider &&
    (data.paymentMethod === "bank_transfer" || data.paymentMethod === "mobile_money")
      ? appendManualPaymentSelection(
          data.notes ?? null,
          data.paymentMethod,
          data.paymentProvider,
          data.paymentReference,
        )
      : data.notes ?? null;

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
    console.error("create_order failed:", { code: error.code, message: error.message });

    // Inventory is decremented inside the database transaction. A customer
    // may reach checkout while another order takes the remaining stock.
    // Translate the inventory CHECK constraint instead of exposing SQL
    // constraint names or raw database errors in the storefront.
    if (error.code === "23514" || error.message.includes("inventory_quantity_on_hand_check")) {
      return {
        success: false,
        error: "One or more items no longer have enough stock for the requested quantity. Your order was not placed. Please review your cart and try again.",
      };
    }

    const safeBusinessError =
      /^.+ is no longer available$/.test(error.message) ||
      /^The selected configuration for .+ is no longer available$/.test(error.message) ||
      error.message === "The selected configuration does not belong to this product" ||
      [
        "Cart not found or already checked out",
        "Not authorized for this cart",
        "Guest name and phone are required for guest checkout",
        "A delivery address is required",
        "Delivery address not found",
        "Cart is empty",
        "Payment method is invalid",
        "This payment method is currently unavailable",
        "Guest checkout must be submitted through the storefront",
      ].includes(error.message);

    return {
      success: false,
      error: safeBusinessError
        ? error.message
        : "We could not place your order. Your cart has not been converted. Please review your details and try again. If the problem continues, contact Classic Computers.",
    };
  }

  const row = Array.isArray((result as any)) ? (result as any[])[0] : (result as any);
  if (!row?.order_number) {
    return { success: false, error: "Something went wrong creating your order. Please try again." };
  }

  if (row.order_id) await deliverAdminEmailForRequest("order_placed", row.order_id);

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

  return { success: true, orderNumber: row.order_number, productIds: orderedProductIds };
}

export async function guestHasConfirmationAccess(orderNumber: string): Promise<boolean> {
  return cookies().get(`${GUEST_ORDER_COOKIE_PREFIX}${orderNumber}`) !== undefined;
}
