"use server";

import { revalidatePath } from "next/cache";
import { toggleWishlist } from "@/lib/services/wishlist";

export async function toggleWishlistAction(input: {
  productId: string;
  variantId: string | null;
}): Promise<{ success: true; inWishlist: boolean } | { success: false; error: string }> {
  const result = await toggleWishlist(input.productId, input.variantId);
  if (result.success) revalidatePath("/account/wishlist");
  return result;
}
