"use server";

import { revalidatePath } from "next/cache";
import * as discountService from "@/lib/services/admin/discounts";

export async function createDiscountAction(input: unknown) {
  const result = await discountService.createDiscount(input);
  if (result.success) revalidatePath("/admin/discounts");
  return result;
}
export async function updateDiscountAction(input: unknown) {
  const result = await discountService.updateDiscount(input);
  if (result.success) revalidatePath("/admin/discounts");
  return result;
}
export async function toggleDiscountActiveAction(id: string, isActive: boolean) {
  const result = await discountService.toggleDiscountActive(id, isActive);
  if (result.success) revalidatePath("/admin/discounts");
  return result;
}
