"use server";

import { revalidatePath } from "next/cache";
import * as productService from "@/lib/services/admin/products";
import * as rentalService from "@/lib/services/admin/rentals";

export async function createProductAction(input: unknown) {
  const result = await productService.createProduct(input);
  if (result.success) revalidatePath("/admin/products");
  return result;
}

export async function updateProductAction(input: unknown) {
  const result = await productService.updateProduct(input);
  if (result.success && typeof input === "object" && input && "id" in input) {
    revalidatePath(`/admin/products/${(input as any).id}`);
    revalidatePath("/admin/products");
  }
  return result;
}

export async function saveRentalConfigurationAction(input: unknown) {
  const result = await rentalService.saveRentalConfiguration(input);
  if (result.success && input && typeof input === "object" && "productId" in input) {
    const productId = String((input as any).productId);
    revalidatePath(`/admin/products/${productId}`);
    revalidatePath("/rentals");
    revalidatePath(`/product/${result.data.productSlug}`);
  }
  return result;
}

export async function deleteProductAction(id: string) {
  const result = await productService.deleteProduct(id);
  if (result.success) revalidatePath("/admin/products");
  return result;
}

export async function createVariantAction(input: unknown) {
  const result = await productService.createVariant(input);
  if (result.success && typeof input === "object" && input && "productId" in input) {
    revalidatePath(`/admin/products/${(input as any).productId}`);
  }
  return result;
}

export async function updateVariantAction(input: unknown) {
  const result = await productService.updateVariant(input);
  if (result.success && typeof input === "object" && input && "productId" in input) {
    revalidatePath(`/admin/products/${(input as any).productId}`);
  }
  return result;
}

export async function deactivateVariantAction(id: string, productId: string) {
  const result = await productService.deactivateVariant(id);
  if (result.success) revalidatePath(`/admin/products/${productId}`);
  return result;
}

export async function upsertSpecificationValueAction(input: unknown) {
  const result = await productService.upsertSpecificationValue(input);
  if (result.success && typeof input === "object" && input && "productId" in input) {
    revalidatePath(`/admin/products/${(input as any).productId}`);
  }
  return result;
}

export async function saveProductSpecificationsAction(input: unknown) {
  const result = await productService.saveProductSpecifications(input);
  if (result.success && typeof input === "object" && input && "productId" in input) {
    revalidatePath(`/admin/products/${(input as any).productId}`);
  }
  return result;
}

export async function deleteSpecificationValueAction(id: string, productId: string) {
  const result = await productService.deleteSpecificationValue(id);
  if (result.success) revalidatePath(`/admin/products/${productId}`);
  return result;
}

export async function uploadProductImageAction(formData: FormData) {
  const productId = formData.get("productId")?.toString();
  const variantId = formData.get("variantId")?.toString() || null;
  const altText = formData.get("altText")?.toString() ?? "";
  const file = formData.get("file") as File | null;

  if (!productId || !file) {
    return { success: false as const, error: "Missing file or product." };
  }

  const result = await productService.uploadProductImage(productId, variantId, file, altText);
  if (result.success) revalidatePath(`/admin/products/${productId}`);
  return result;
}

export async function updateImageMetaAction(input: unknown, productId: string) {
  const result = await productService.updateImageMeta(input);
  if (result.success) revalidatePath(`/admin/products/${productId}`);
  return result;
}

export async function deleteProductImageAction(id: string, productId: string) {
  const result = await productService.deleteProductImage(id);
  if (result.success) revalidatePath(`/admin/products/${productId}`);
  return result;
}

export async function reorderProductImagesAction(productId: string, variantId: string | null, imageIds: string[]) {
  const result = await productService.reorderProductImages(productId, variantId, imageIds);
  if (result.success) revalidatePath(`/admin/products/${productId}`);
  return result;
}
