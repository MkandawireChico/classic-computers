"use server";

import { revalidatePath } from "next/cache";
import * as taxonomy from "@/lib/services/admin/taxonomy";

export async function createCategoryAction(input: unknown) {
  const result = await taxonomy.createCategory(input);
  if (result.success) revalidatePath("/admin/categories");
  return result;
}
export async function updateCategoryAction(input: unknown) {
  const result = await taxonomy.updateCategory(input);
  if (result.success) revalidatePath("/admin/categories");
  return result;
}
export async function deleteCategoryAction(id: string) {
  const result = await taxonomy.deleteCategory(id);
  if (result.success) revalidatePath("/admin/categories");
  return result;
}
export async function createBrandAction(input: unknown) {
  const result = await taxonomy.createBrand(input);
  if (result.success) revalidatePath("/admin/brands");
  return result;
}
export async function updateBrandAction(input: unknown) {
  const result = await taxonomy.updateBrand(input);
  if (result.success) revalidatePath("/admin/brands");
  return result;
}
export async function deleteBrandAction(id: string) {
  const result = await taxonomy.deleteBrand(id);
  if (result.success) revalidatePath("/admin/brands");
  return result;
}
