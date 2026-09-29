import { z } from "zod";

export const addToCartSchema = z.object({
  productId: z.string().uuid(),
  variantId: z.string().uuid().nullable().optional(),
  quantity: z.coerce.number().int().min(1, "Quantity must be at least 1").max(20, "Maximum 20 per order"),
});

export const updateCartItemSchema = z.object({
  cartItemId: z.string().uuid(),
  quantity: z.coerce.number().int().min(1).max(20),
});

export const removeCartItemSchema = z.object({
  cartItemId: z.string().uuid(),
});

export type AddToCartInput = z.infer<typeof addToCartSchema>;
export type UpdateCartItemInput = z.infer<typeof updateCartItemSchema>;
