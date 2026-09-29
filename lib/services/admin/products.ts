import "server-only";
import { createClient } from "@/lib/supabase/server";
import { requirePermission, AuthorizationError } from "@/lib/auth/permissions";
import {
  productSchema,
  productUpdateSchema,
  variantSchema,
  variantUpdateSchema,
  specificationValueSchema,
  batchSpecificationValuesSchema,
  imageMetaUpdateSchema,
} from "@/schemas/admin/product";

export type ServiceResult<T = undefined> =
  | { success: true; data: T }
  | { success: false; error: string };

function fail(error: string): ServiceResult<never> {
  return { success: false, error };
}

async function guard(permission: string): Promise<{ userId: string } | null> {
  try {
    return await requirePermission(permission);
  } catch (e) {
    if (e instanceof AuthorizationError) return null;
    throw e;
  }
}

// ------------------------------------------------------------------
// Products
// ------------------------------------------------------------------

export async function createProduct(input: unknown): Promise<ServiceResult<{ id: string }>> {
  const auth = await guard("products.write");
  if (!auth) return fail("You don't have permission to create products.");

  const parsed = productSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid product data.");
  const d = parsed.data;

  const supabase = createClient();
  const { data, error } = await (supabase.from("products") as any)
    .insert({
      name: d.name,
      slug: d.slug,
      sku: d.sku,
      brand_id: d.brandId || null,
      category_id: d.categoryId,
      product_type: d.productType,
      condition: d.condition,
      description: d.description || null,
      base_price: d.basePrice,
      sale_price: d.salePrice || null,
      warranty_text: d.warrantyText || null,
      status: d.status,
      is_featured: d.isFeatured ?? false,
      seo_title: d.seoTitle || null,
      seo_description: d.seoDescription || null,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") return fail("A product with that SKU or slug already exists.");
    return fail("Could not create product.");
  }

  // Every product needs a product-level inventory row (used when it has
  // no variants). Created here, not left to be missing until someone
  // remembers — a product with variants will simply never reference this
  // row (create_order() and the storefront both key inventory lookups off
  // product_id + variant_id, and a variant's OWN row is what's used once
  // variants exist).
  await (supabase.from("inventory") as any).insert({ product_id: data.id, quantity_on_hand: 0 });

  return { success: true, data: { id: data.id } };
}

export async function updateProduct(input: unknown): Promise<ServiceResult> {
  const auth = await guard("products.write");
  if (!auth) return fail("You don't have permission to edit products.");

  const parsed = productUpdateSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid product data.");
  const d = parsed.data;

  const supabase = createClient();
  const { error } = await (supabase.from("products") as any)
    .update({
      name: d.name,
      slug: d.slug,
      sku: d.sku,
      brand_id: d.brandId || null,
      category_id: d.categoryId,
      product_type: d.productType,
      condition: d.condition,
      description: d.description || null,
      base_price: d.basePrice,
      sale_price: d.salePrice || null,
      warranty_text: d.warrantyText || null,
      status: d.status,
      is_featured: d.isFeatured ?? false,
      seo_title: d.seoTitle || null,
      seo_description: d.seoDescription || null,
    })
    .eq("id", d.id);

  if (error) {
    if (error.code === "23505") return fail("A product with that SKU or slug already exists.");
    return fail("Could not update product.");
  }
  return { success: true, data: undefined };
}

export async function deleteProduct(id: string): Promise<ServiceResult> {
  const auth = await guard("products.delete");
  if (!auth) return fail("You don't have permission to delete products.");

  const supabase = createClient();
  // Prefer archiving over a hard delete where the product has any order
  // history — order_items references products with ON DELETE RESTRICT
  // (0017), so a hard delete on a product that's ever been ordered would
  // fail at the database level anyway. Try delete; on the FK violation,
  // archive instead so the action still does something useful rather than
  // just erroring.
  const { error } = await (supabase.from("products") as any).delete().eq("id", id);
  if (error) {
    if (error.code === "23503") {
      const { error: archiveError } = await (supabase.from("products") as any)
        .update({ status: "archived" })
        .eq("id", id);
      if (archiveError) return fail("Could not delete or archive product.");
      return { success: true, data: undefined };
    }
    return fail("Could not delete product.");
  }
  return { success: true, data: undefined };
}

// ------------------------------------------------------------------
// Variants
// ------------------------------------------------------------------

export async function createVariant(input: unknown): Promise<ServiceResult<{ id: string }>> {
  const auth = await guard("products.write");
  if (!auth) return fail("You don't have permission to manage variants.");

  const parsed = variantSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid variant data.");
  const d = parsed.data;

  const supabase = createClient();

  if (d.isDefault) {
    await (supabase.from("product_variants") as any)
      .update({ is_default: false })
      .eq("product_id", d.productId)
      .eq("is_default", true);
  }

  const { data, error } = await (supabase.from("product_variants") as any)
    .insert({
      product_id: d.productId,
      sku: d.sku,
      name: d.name,
      price: d.price,
      sale_price: d.salePrice || null,
      is_default: d.isDefault ?? false,
      status: d.status,
    })
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") return fail("A variant with that SKU already exists.");
    console.error("createVariant insert failed:", error.message);
    return fail("Could not create variant.");
  }

  const { error: inventoryError } = await (supabase.from("inventory") as any).insert({
    product_id: d.productId,
    variant_id: data.id,
    quantity_on_hand: d.initialQuantity ?? 0,
  });
  if (inventoryError) {
    console.error("createVariant inventory insert failed:", inventoryError.message);
    const { error: cleanupError } = await (supabase.from("product_variants") as any).delete().eq("id", data.id);
    if (cleanupError) console.error("createVariant cleanup failed:", cleanupError.message);
    return fail("Could not create variant inventory. Check your inventory permissions.");
  }

  return { success: true, data: { id: data.id } };
}

export async function updateVariant(input: unknown): Promise<ServiceResult> {
  const auth = await guard("products.write");
  if (!auth) return fail("You don't have permission to manage variants.");

  const parsed = variantUpdateSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid variant data.");
  const d = parsed.data;

  const supabase = createClient();

  if (d.isDefault) {
    await (supabase.from("product_variants") as any)
      .update({ is_default: false })
      .eq("product_id", d.productId)
      .eq("is_default", true)
      .neq("id", d.id);
  }

  const { error } = await (supabase.from("product_variants") as any)
    .update({
      sku: d.sku,
      name: d.name,
      price: d.price,
      sale_price: d.salePrice || null,
      is_default: d.isDefault ?? false,
      status: d.status,
    })
    .eq("id", d.id);

  if (error) {
    if (error.code === "23505") return fail("A variant with that SKU already exists.");
    return fail("Could not update variant.");
  }
  return { success: true, data: undefined };
}

/** Deactivate rather than delete — order_items references variants with
 * ON DELETE RESTRICT (0017), so a hard delete would fail once the variant
 * has ever been ordered. Deactivating is also the reversible, safer
 * default for a real retailer (section 7 of the brief: "deactivate
 * variants" is the named operation, not "delete"). */
export async function deactivateVariant(id: string): Promise<ServiceResult> {
  const auth = await guard("products.write");
  if (!auth) return fail("You don't have permission to manage variants.");

  const supabase = createClient();
  const { error } = await (supabase.from("product_variants") as any)
    .update({ status: "discontinued" })
    .eq("id", id);
  if (error) return fail("Could not deactivate variant.");
  return { success: true, data: undefined };
}

// ------------------------------------------------------------------
// Specifications
// ------------------------------------------------------------------

async function saveSpecificationRow(
  supabase: ReturnType<typeof createClient>,
  productId: string,
  variantId: string | null,
  specDefinitionId: string,
  value: string,
): Promise<void> {
  let query = (supabase.from("product_specifications") as any)
    .select("id")
    .eq("product_id", productId)
    .eq("spec_definition_id", specDefinitionId);

  if (variantId === null || variantId === undefined) {
    query = query.is("variant_id", null);
  } else {
    query = query.eq("variant_id", variantId);
  }

  const { data: existing, error: lookupError } = await query.maybeSingle();
  if (lookupError) {
    throw new Error(lookupError.message);
  }

  if (existing?.id) {
    const { error: updateError } = await (supabase.from("product_specifications") as any)
      .update({ value })
      .eq("id", existing.id);

    if (updateError) {
      throw new Error(updateError.message);
    }
    return;
  }

  const { error: insertError } = await (supabase.from("product_specifications") as any).insert({
    product_id: productId,
    variant_id: variantId ?? null,
    spec_definition_id: specDefinitionId,
    value,
  });

  if (insertError) {
    throw new Error(insertError.message);
  }
}

export async function upsertSpecificationValue(input: unknown): Promise<ServiceResult> {
  const auth = await guard("products.write");
  if (!auth) return fail("You don't have permission to manage specifications.");

  const parsed = specificationValueSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid specification value.");
  const d = parsed.data;

  const supabase = createClient();

  try {
    await saveSpecificationRow(supabase, d.productId, d.variantId ?? null, d.specDefinitionId, d.value);
  } catch (error) {
    return fail(`Could not save specification: ${error instanceof Error ? error.message : "Unknown error"}`);
  }

  return { success: true, data: undefined };
}

export async function saveProductSpecifications(
  input: unknown,
): Promise<ServiceResult<{ savedCount: number; deletedCount: number }>> {
  const auth = await guard("products.write");
  if (!auth) return fail("You don't have permission to manage specifications.");

  const parsed = batchSpecificationValuesSchema.safeParse(input);
  if (!parsed.success) return fail(parsed.error.issues[0]?.message ?? "Invalid specification data.");

  const d = parsed.data;
  const supabase = createClient();

  let savedCount = 0;
  for (const item of d.values) {
    try {
      await saveSpecificationRow(supabase, item.productId, item.variantId ?? null, item.specDefinitionId, item.value);
      savedCount += 1;
    } catch (error) {
      return fail(`Could not save specification: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  }

  let deletedCount = 0;
  for (const item of d.cleared) {
    let query = (supabase.from("product_specifications") as any)
      .delete()
      .eq("product_id", item.productId)
      .eq("spec_definition_id", item.specDefinitionId);

    if (item.variantId === null || item.variantId === undefined) {
      query = query.is("variant_id", null);
    } else {
      query = query.eq("variant_id", item.variantId);
    }

    const { error } = await query;
    if (error) {
      return fail(`Could not remove specification: ${error.message}`);
    }
    deletedCount += 1;
  }

  return { success: true, data: { savedCount, deletedCount } };
}

export async function deleteSpecificationValue(id: string): Promise<ServiceResult> {
  const auth = await guard("products.write");
  if (!auth) return fail("You don't have permission to manage specifications.");

  const supabase = createClient();
  const { error } = await (supabase.from("product_specifications") as any).delete().eq("id", id);
  if (error) return fail("Could not remove specification.");
  return { success: true, data: undefined };
}

// ------------------------------------------------------------------
// Images
// ------------------------------------------------------------------

const ALLOWED_IMAGE_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5MB

export async function uploadProductImages(
  productId: string,
  variantId: string | null,
  files: File[],
  altText: string,
): Promise<ServiceResult<{ uploadedCount: number; imageIds: string[]; failedFiles: string[] }>> {
  const auth = await guard("products.write");
  if (!auth) return fail("You don't have permission to manage product images.");

  if (files.length === 0) return fail("Select at least one image.");

  for (const file of files) {
    if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
      return fail(`${file.name}: only JPEG, PNG, or WebP images are allowed.`);
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return fail(`${file.name}: image must be 5MB or smaller.`);
    }
  }

  const supabase = createClient();
  if (variantId) {
    const { data: variant, error: variantError } = await (supabase.from("product_variants") as any)
      .select("id")
      .eq("id", variantId)
      .eq("product_id", productId)
      .maybeSingle();
    if (variantError || !variant) return fail("The selected variant does not belong to this product.");
  }

  const { data: existing, error: existingError } = await (supabase.from("product_images") as any)
    .select("id, display_order, is_primary")
    .eq("product_id", productId)
    .is("variant_id", variantId)
    .order("display_order", { ascending: true });
  if (existingError) return fail("Could not load existing product images.");

  let nextOrder = (existing ?? []).reduce((max: number, image: any) => Math.max(max, image.display_order), -1) + 1;
  let primaryAssigned = (existing ?? []).some((image: any) => image.is_primary);
  const imageIds: string[] = [];
  const failedFiles: string[] = [];

  for (const file of files) {
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";
    const path = `${productId}/${crypto.randomUUID()}.${ext}`;
    const { error: uploadError } = await supabase.storage.from("product-images").upload(path, file, {
      contentType: file.type,
      upsert: false,
    });

    if (uploadError) {
      failedFiles.push(`${file.name}: could not upload image.`);
      continue;
    }

    const { data, error } = await (supabase.from("product_images") as any)
      .insert({
        product_id: productId,
        variant_id: variantId,
        storage_path: path,
        alt_text: altText.trim() || null,
        is_primary: !primaryAssigned,
        display_order: nextOrder,
      })
      .select("id")
      .single();

    if (error || !data) {
      const { error: cleanupError } = await supabase.storage.from("product-images").remove([path]);
      if (cleanupError) console.error("Product image cleanup failed after metadata insert:", cleanupError.message);
      failedFiles.push(`${file.name}: could not save image metadata.`);
      continue;
    }

    imageIds.push(data.id);
    nextOrder += 1;
    primaryAssigned = true;
  }

  if (imageIds.length === 0) return fail(failedFiles.join(" ") || "Could not upload images.");
  return { success: true, data: { uploadedCount: imageIds.length, imageIds, failedFiles } };
}

export async function uploadProductImage(
  productId: string,
  variantId: string | null,
  file: File,
  altText: string,
): Promise<ServiceResult<{ id: string }>> {
  const result = await uploadProductImages(productId, variantId, [file], altText);
  if (!result.success) return result;
  const id = result.data.imageIds[0];
  return id ? { success: true, data: { id } } : fail("Could not upload image.");
}

export async function updateImageMeta(input: unknown): Promise<ServiceResult> {
  const auth = await guard("products.write");
  if (!auth) return fail("You don't have permission to manage product images.");

  const parsed = imageMetaUpdateSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid image data.");
  const d = parsed.data;

  const supabase = createClient();

  const { data: image, error: imageError } = await (supabase.from("product_images") as any)
    .select("product_id, variant_id, is_primary")
    .eq("id", d.id)
    .maybeSingle();
  if (imageError || !image) return fail("Could not find product image.");

  let previousPrimaryId: string | null = null;
  if (d.isPrimary) {
    if (!image.is_primary) {
      const { data: previous } = await (supabase.from("product_images") as any)
        .select("id")
        .eq("product_id", image.product_id)
        .is("variant_id", image.variant_id)
        .eq("is_primary", true)
        .maybeSingle();
      previousPrimaryId = previous?.id ?? null;
      if (previousPrimaryId) {
        const { error } = await (supabase.from("product_images") as any)
          .update({ is_primary: false })
          .eq("id", previousPrimaryId);
        if (error) return fail("Could not change the primary image.");
      }
    }
  }

  const patch: Record<string, unknown> = {};
  if (d.altText !== undefined) patch.alt_text = d.altText;
  if (d.isPrimary !== undefined) patch.is_primary = d.isPrimary;
  if (d.displayOrder !== undefined) patch.display_order = d.displayOrder;

  const { error } = await (supabase.from("product_images") as any).update(patch).eq("id", d.id);
  if (error) {
    if (previousPrimaryId) {
      await (supabase.from("product_images") as any).update({ is_primary: true }).eq("id", previousPrimaryId);
    }
    return fail("Could not update image.");
  }
  return { success: true, data: undefined };
}

export async function reorderProductImages(
  productId: string,
  variantId: string | null,
  imageIds: string[],
): Promise<ServiceResult> {
  const auth = await guard("products.write");
  if (!auth) return fail("You don't have permission to manage product images.");
  if (imageIds.length === 0 || new Set(imageIds).size !== imageIds.length) return fail("Invalid image order.");

  const supabase = createClient();
  const { data: current, error: currentError } = await (supabase.from("product_images") as any)
    .select("id")
    .eq("product_id", productId)
    .is("variant_id", variantId);
  if (currentError) return fail("Could not load images to reorder.");

  const currentIds = new Set((current ?? []).map((image: any) => image.id));
  if (currentIds.size !== imageIds.length || imageIds.some((id) => !currentIds.has(id))) {
    return fail("Image list changed. Refresh and try again.");
  }

  for (const [displayOrder, id] of imageIds.entries()) {
    const { error } = await (supabase.from("product_images") as any)
      .update({ display_order: displayOrder })
      .eq("id", id);
    if (error) return fail("Could not update image order.");
  }
  return { success: true, data: undefined };
}

export async function deleteProductImage(id: string): Promise<ServiceResult> {
  const auth = await guard("products.write");
  if (!auth) return fail("You don't have permission to manage product images.");

  const supabase = createClient();
  const { data: image, error: imageError } = await (supabase.from("product_images") as any)
    .select("storage_path, product_id, variant_id, is_primary")
    .eq("id", id)
    .maybeSingle();
  if (imageError || !image) return fail("Could not find product image.");

  const { error } = await (supabase.from("product_images") as any).delete().eq("id", id);
  if (error) return fail("Could not delete image.");

  if (image.is_primary) {
    const { data: nextImage } = await (supabase.from("product_images") as any)
      .select("id")
      .eq("product_id", image.product_id)
      .is("variant_id", image.variant_id)
      .order("display_order", { ascending: true })
      .limit(1)
      .maybeSingle();
    if (nextImage) {
      const { error: primaryError } = await (supabase.from("product_images") as any)
        .update({ is_primary: true })
        .eq("id", nextImage.id);
      if (primaryError) return fail("Image was deleted, but a new primary image could not be selected.");
    }
  }

  if (image.storage_path) {
    const { error: storageError } = await supabase.storage.from("product-images").remove([image.storage_path]);
    if (storageError) {
      console.error("Product image Storage cleanup failed:", storageError.message);
      return fail("Image record was deleted, but its Storage file could not be removed.");
    }
  }
  return { success: true, data: undefined };
}
