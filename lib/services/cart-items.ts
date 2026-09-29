import "server-only";
import { getCartClient, getOrCreateCartId, getCartIdReadOnly } from "./cart";
import { createClient } from "@/lib/supabase/server";
import { addToCartSchema, updateCartItemSchema, removeCartItemSchema } from "@/schemas/cart";

export type CartActionResult = { success: true } | { success: false; error: string };

/**
 * Confirms a cart_item belongs to the CURRENT caller's cart before any
 * update/delete. This matters most for guests: their mutations run
 * through the service-role client (bypasses RLS), so without this check a
 * guest could pass any cart_item_id — including another cart's — and the
 * admin client would happily modify it. For authenticated customers, RLS
 * (0016) already enforces this too; this is deliberate defense in depth
 * so the same rule holds regardless of which client executes the query.
 */
async function assertOwnsCartItem(client: any, cartItemId: string): Promise<string | null> {
  const currentCartId = await getCartIdReadOnly();
  if (!currentCartId) return null;

  const { data } = await (client.from("cart_items") as any).select("id, cart_id").eq("id", cartItemId).maybeSingle();
  if (!data || data.cart_id !== currentCartId) return null;
  return currentCartId;
}

export async function addToCart(input: unknown): Promise<CartActionResult> {
  const supabase = createClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) return { success: false, error: "Sign in before adding items to your cart." };

  const parsed = addToCartSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid request." };
  }
  const { productId, variantId, quantity } = parsed.data;

  const client = await getCartClient();

  // Validate against the database, never trust the client further than the
  // productId/variantId it supplied — existence and publication status are
  // re-checked here, and again authoritatively at checkout.
  const { data: product, error: productError } = await (client
    .from("products") as any)
    .select("id, status")
    .eq("id", productId)
    .maybeSingle();
  if (productError || !product || product.status !== "published") {
    if (productError) console.error("addToCart product lookup failed:", productError.message);
    return { success: false, error: "This product is not currently available." };
  }

  if (variantId) {
    const { data: variant, error: variantError } = await (client
      .from("product_variants") as any)
      .select("id, status")
      .eq("id", variantId)
      .eq("product_id", productId)
      .maybeSingle();
    if (variantError || !variant || variant.status !== "active") {
      if (variantError) console.error("addToCart variant lookup failed:", variantError.message);
      return { success: false, error: "This configuration is not currently available." };
    }
  }

  let stockQuery = (client.from("storefront_inventory_status" as any) as any)
    .select("status")
    .eq("product_id", productId);
  stockQuery = variantId ? stockQuery.eq("variant_id", variantId) : stockQuery.is("variant_id", null);
  const { data: inventory, error: inventoryError } = await stockQuery.maybeSingle();
  if (inventoryError) console.error("addToCart inventory lookup failed:", inventoryError.message);
  if (inventoryError || !inventory || !["in_stock", "low_stock"].includes(inventory.status)) {
    return { success: false, error: "This item is currently out of stock. Please contact us to check availability." };
  }

  const cartId = await getOrCreateCartId();

  // Upsert-by-hand: cart_items has a UNIQUE(cart_id, product_id, variant_id)
  // constraint, so we check for an existing row and add to its quantity
  // rather than risk a constraint violation or a silent duplicate.
  const { data: existing } = await (client
    .from("cart_items") as any)
    .select("id, quantity")
    .eq("cart_id", cartId)
    .eq("product_id", productId)
    .is("variant_id", variantId ?? null)
    .maybeSingle();

  if (existing) {
    const newQuantity = Math.min(existing.quantity + quantity, 20);
    const { error } = await (client.from("cart_items") as any)
      .update({ quantity: newQuantity })
      .eq("id", existing.id);
    if (error) {
      console.error("addToCart update failed:", error.message);
      return { success: false, error: "Could not update your cart. Please try again." };
    }
    return { success: true };
  }

  const { error: insertError } = await (client.from("cart_items") as any).insert({
    cart_id: cartId,
    product_id: productId,
    variant_id: variantId ?? null,
    quantity,
  });
  if (insertError) {
    console.error("addToCart insert failed:", insertError.message);
    return { success: false, error: "Could not add to your cart. Please try again." };
  }
  return { success: true };
}

export async function updateCartItemQuantity(input: unknown): Promise<CartActionResult> {
  const parsed = updateCartItemSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: parsed.error.issues[0]?.message ?? "Invalid request." };
  }
  const client = await getCartClient();

  const owns = await assertOwnsCartItem(client, parsed.data.cartItemId);
  if (!owns) return { success: false, error: "Item not found in your cart." };

  const { error } = await (client.from("cart_items") as any)
    .update({ quantity: parsed.data.quantity })
    .eq("id", parsed.data.cartItemId);
  if (error) return { success: false, error: "Could not update quantity. Please try again." };
  return { success: true };
}

export async function removeCartItem(input: unknown): Promise<CartActionResult> {
  const parsed = removeCartItemSchema.safeParse(input);
  if (!parsed.success) {
    return { success: false, error: "Invalid request." };
  }
  const client = await getCartClient();

  const owns = await assertOwnsCartItem(client, parsed.data.cartItemId);
  if (!owns) return { success: false, error: "Item not found in your cart." };

  const { error } = await (client.from("cart_items") as any).delete().eq("id", parsed.data.cartItemId);
  if (error) return { success: false, error: "Could not remove item. Please try again." };
  return { success: true };
}

export async function clearCart(cartId: string): Promise<CartActionResult> {
  const client = await getCartClient();
  const { error } = await (client.from("cart_items") as any).delete().eq("cart_id", cartId);
  if (error) return { success: false, error: "Could not clear cart. Please try again." };
  return { success: true };
}
