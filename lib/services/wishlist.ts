import "server-only";
import { getCurrentUser } from "@/lib/auth/current-user";
import { createClient } from "@/lib/supabase/server";

async function getCustomerId(): Promise<string | null> {
  const user = await getCurrentUser();
  return user?.id ?? null;
}

async function getOrCreateWishlistId(customerId: string): Promise<string> {
  const supabase = createClient();
  const { data: existing } = await (supabase
    .from("wishlists") as any)
    .select("id")
    .eq("customer_id", customerId)
    .maybeSingle();
  if (existing) return existing.id;

  const { data: created, error } = await (supabase
    .from("wishlists") as any)
    .insert({ customer_id: customerId })
    .select("id")
    .single();
  if (error || !created) throw new Error("Could not create wishlist.");
  return created.id;
}

export async function toggleWishlist(
  productId: string,
  variantId: string | null,
): Promise<{ success: true; inWishlist: boolean } | { success: false; error: string }> {
  const customerId = await getCustomerId();
  if (!customerId) return { success: false, error: "Sign in to use your wishlist." };

  const supabase = createClient();
  const wishlistId = await getOrCreateWishlistId(customerId);

  const { data: existing } = await (supabase.from("wishlist_items") as any)
    .select("id")
    .eq("wishlist_id", wishlistId)
    .eq("product_id", productId)
    .is("variant_id", variantId ?? null)
    .maybeSingle();

  if (existing) {
    const { error } = await (supabase.from("wishlist_items") as any).delete().eq("id", existing.id);
    if (error) return { success: false, error: "Could not update your wishlist." };
    return { success: true, inWishlist: false };
  }

  const { error } = await (supabase.from("wishlist_items") as any).insert({
    wishlist_id: wishlistId,
    product_id: productId,
    variant_id: variantId,
  });
  if (error) return { success: false, error: "Could not update your wishlist." };
  return { success: true, inWishlist: true };
}

export interface WishlistEntry {
  wishlistItemId: string;
  productId: string;
  variantId: string | null;
}

export async function getWishlistProductIds(): Promise<WishlistEntry[]> {
  const customerId = await getCustomerId();
  if (!customerId) return [];

  const supabase = createClient();
  const { data: wishlist } = await (supabase
    .from("wishlists") as any)
    .select("id")
    .eq("customer_id", customerId)
    .maybeSingle();
  if (!wishlist) return [];

  const { data } = await (supabase.from("wishlist_items") as any)
    .select("id, product_id, variant_id")
    .eq("wishlist_id", wishlist.id);

  return (data ?? []).map((row: any) => ({
    wishlistItemId: row.id,
    productId: row.product_id,
    variantId: row.variant_id,
  }));
}
