"use server";

import { revalidatePath } from "next/cache";
import * as cartItems from "@/lib/services/cart-items";
import type { CartActionResult } from "@/lib/services/cart-items";

export async function addToCartAction(input: {
  productId: string;
  variantId?: string | null;
  quantity: number;
}): Promise<CartActionResult> {
  const result = await cartItems.addToCart(input);
  if (result.success) revalidatePath("/cart");
  return result;
}

export async function updateCartItemQuantityAction(input: {
  cartItemId: string;
  quantity: number;
}): Promise<CartActionResult> {
  const result = await cartItems.updateCartItemQuantity(input);
  if (result.success) revalidatePath("/cart");
  return result;
}

export async function removeCartItemAction(input: { cartItemId: string }): Promise<CartActionResult> {
  const result = await cartItems.removeCartItem(input);
  if (result.success) revalidatePath("/cart");
  return result;
}
