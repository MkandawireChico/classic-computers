import "server-only";
import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import type {
  ProductListItem,
  ProductDetail,
  ShopFilters,
  ShopResult,
  ProductImage,
} from "@/types/catalog";

/**
 * All public storefront product reads go through this file. Nothing here
 * ever selects draft/archived products for anonymous/customer callers —
 * that's enforced by RLS (products.status = 'published' policy) as the
 * real boundary, and mirrored here in the query filter as defense in depth.
 *
 * Note on typing: the hand-written Database type (types/supabase.ts) does
 * not encode foreign-table relationships the way real `supabase gen types`
 * output does, so the `brand:brands(...)`/`category:categories(...)`
 * embedded-select results are cast to the domain shape after the query
 * rather than inferred. Replace these casts with real inference once real
 * generated types exist.
 */

function productListSelect(requireMatchingInventory = false) {
  const inventoryRelation = requireMatchingInventory
    ? "inventory:storefront_inventory_status!inner"
    : "inventory:storefront_inventory_status";
  return `
  id, sku, slug, name, base_price, sale_price, condition, is_featured,
  brand:brands ( id, name, slug ),
  category:categories ( id, name, slug ),
  product_images ( id, storage_path, alt_text, display_order, is_primary, variant_id ),
  ${inventoryRelation} ( status, variant_id )
`;
}

function toListItem(row: any): ProductListItem {
  const allImages: ProductImage[] = row.product_images ?? [];
  const productImages = allImages.filter((image) => image.variant_id === null);
  const primary =
    productImages.find((image) => image.is_primary) ??
    productImages[0] ??
    allImages.find((image) => image.is_primary) ??
    allImages[0] ??
    null;

  // Phase 4 correction (item 3): a product WITH variants typically has no
  // product-level (variant_id = null) inventory row at all — only each
  // variant does. Falling back to that empty filter meant every
  // multi-variant product's card silently showed "Available on request"
  // regardless of real stock. Aggregate across variant rows instead: any
  // variant in stock -> show in_stock; else any low_stock -> low_stock;
  // else out_of_stock. This is a display-only rollup for the card, not an
  // authorization or ordering decision — the actual selected variant's own
  // status still governs the product page and checkout.
  const allInventoryRows: any[] = row.inventory ?? [];
  const productLevelRow = allInventoryRows.find((i) => i.variant_id === null);
  let status: string | null = productLevelRow?.status ?? null;
  if (!status && allInventoryRows.length > 0) {
    if (allInventoryRows.some((i) => i.status === "in_stock")) status = "in_stock";
    else if (allInventoryRows.some((i) => i.status === "low_stock")) status = "low_stock";
    else if (allInventoryRows.some((i) => i.status === "coming_soon")) status = "coming_soon";
    else status = allInventoryRows[0].status;
  }

  return {
    id: row.id,
    sku: row.sku,
    slug: row.slug,
    name: row.name,
    base_price: Number(row.base_price),
    sale_price: row.sale_price === null ? null : Number(row.sale_price),
    condition: row.condition,
    is_featured: row.is_featured,
    brand: row.brand ?? null,
    category: row.category ?? null,
    primary_image: primary,
    inventory_status: status as any,
  };
}

export async function getFeaturedProducts(limit = 8): Promise<ProductListItem[]> {
  const supabase = createClient();
  // Cast to `any` at the join boundary: the hand-written Database type has
  // no Relationships metadata for embedded selects like `brand:brands(...)`,
  // which real `supabase gen types` output would provide. This is a typing
  // gap only — the query itself is unaffected and runs against real RLS.
  const { data, error } = await (supabase
    .from("products")
    .select(productListSelect()) as any)
    .eq("status", "published")
    .eq("is_featured", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) {
    console.error("getFeaturedProducts failed:", error.message);
    return [];
  }
  return (data ?? []).map(toListItem);
}

export async function searchShop(filters: ShopFilters): Promise<ShopResult> {
  const supabase = createClient();
  const page = filters.page && filters.page > 0 ? filters.page : 1;
  const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 24;
  const from = (page - 1) * pageSize;
  const to = from + pageSize - 1;

  let query: any = supabase
    .from("products")
    .select(productListSelect(filters.availableOnly), { count: "exact" })
    .eq("status", "published");

  if (filters.availableOnly) {
    query = query.in("inventory.status", ["in_stock", "low_stock"]);
  }

  if (filters.categorySlug) {
    // Resolve slug -> id first so the filter stays a normal equality check.
    const { data: category } = await (supabase
      .from("categories") as any)
      .select("id")
      .eq("slug", filters.categorySlug)
      .maybeSingle();
    if (category) {
      query = query.eq("category_id", category.id);
    } else {
      return { items: [], total: 0, page, pageSize };
    }
  }

  if (filters.brandSlugs && filters.brandSlugs.length > 0) {
    const { data: brands } = await (supabase.from("brands") as any).select("id").in("slug", filters.brandSlugs);
    const ids = (brands ?? []).map((b: any) => b.id);
    if (ids.length === 0) return { items: [], total: 0, page, pageSize };
    query = query.in("brand_id", ids);
  }

  if (typeof filters.minPrice === "number") {
    query = query.gte("base_price", filters.minPrice);
  }
  if (typeof filters.maxPrice === "number") {
    query = query.lte("base_price", filters.maxPrice);
  }

  if (filters.query && filters.query.trim().length > 0) {
    const term = filters.query.trim().replace(/[%_]/g, "");
    query = query.or(`name.ilike.%${term}%,sku.ilike.%${term}%,description.ilike.%${term}%`);
  }

  switch (filters.sort) {
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    case "price_asc":
      query = query.order("base_price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("base_price", { ascending: false });
      break;
    case "name":
      query = query.order("name", { ascending: true });
      break;
    case "featured":
    default:
      query = query.order("is_featured", { ascending: false }).order("created_at", { ascending: false });
      break;
  }

  const { data, error, count } = await query.range(from, to);

  if (error) {
    console.error("searchShop failed:", error.message);
    return { items: [], total: 0, page, pageSize };
  }

  const items = (data ?? []).map((row: any) => toListItem(row));

  return { items, total: count ?? items.length, page, pageSize };
}

export const getProductBySlug = cache(async function getProductBySlug(slug: string): Promise<ProductDetail | null> {
  const supabase = createClient();

  const { data: product, error } = await (supabase
    .from("products")
    .select(`
      id, sku, slug, name, description, base_price, sale_price, condition,
      is_featured, warranty_text, seo_title, seo_description,
      brand:brands ( id, name, slug ),
      category:categories ( id, name, slug ),
      product_images ( id, storage_path, alt_text, display_order, is_primary, variant_id ),
      product_variants ( id, sku, name, price, sale_price, is_default, status ),
      inventory:storefront_inventory_status ( status, variant_id ),
      product_specifications (
        value,
        variant_id,
        specification_definitions ( key, label, unit, display_order )
      )
    `) as any)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (error) {
    console.error("getProductBySlug failed:", error.message);
    return null;
  }
  if (!product) return null;

  const row: any = product;
  const images: ProductImage[] = (row.product_images ?? []).sort(
    (a: ProductImage, b: ProductImage) => a.display_order - b.display_order,
  );
  const productLevelImages = images.filter((image) => image.variant_id === null);
  const primary =
    productLevelImages.find((image) => image.is_primary) ??
    productLevelImages[0] ??
    images.find((image) => image.is_primary) ??
    images[0] ??
    null;

  const specifications = (row.product_specifications ?? [])
    .filter((s: any) => s.variant_id === null)
    .map((s: any) => ({
      key: s.specification_definitions?.key ?? "",
      label: s.specification_definitions?.label ?? "",
      value: s.value,
      unit: s.specification_definitions?.unit ?? null,
      display_order: s.specification_definitions?.display_order ?? 0,
    }))
    .sort((a: any, b: any) => a.display_order - b.display_order);

  const inventoryRows = (row.inventory ?? []).filter((i: any) => i.variant_id === null);
  const inventoryByVariant: Record<string, any> = {};
  for (const invRow of row.inventory ?? []) {
    if (invRow.variant_id) inventoryByVariant[invRow.variant_id] = invRow.status;
  }

  return {
    id: row.id,
    sku: row.sku,
    slug: row.slug,
    name: row.name,
    description: row.description,
    base_price: Number(row.base_price),
    sale_price: row.sale_price === null ? null : Number(row.sale_price),
    condition: row.condition,
    is_featured: row.is_featured,
    warranty_text: row.warranty_text,
    seo_title: row.seo_title,
    seo_description: row.seo_description,
    brand: row.brand ?? null,
    category: row.category ?? null,
    primary_image: primary,
    images,
    variants: (row.product_variants ?? []).map((v: any) => ({
      id: v.id,
      sku: v.sku,
      name: v.name,
      price: Number(v.price),
      sale_price: v.sale_price === null ? null : Number(v.sale_price),
      is_default: v.is_default,
      status: v.status,
    })),
    specifications,
    inventory_status: inventoryRows[0]?.status ?? null,
    inventory_by_variant: inventoryByVariant,
  };
});

export async function getRelatedProducts(categoryId: string, excludeProductId: string, limit = 4): Promise<ProductListItem[]> {
  const supabase = createClient();
  const { data, error } = await (supabase
    .from("products")
    .select(productListSelect()) as any)
    .eq("status", "published")
    .eq("category_id", categoryId)
    .neq("id", excludeProductId)
    .limit(limit);

  if (error) {
    console.error("getRelatedProducts failed:", error.message);
    return [];
  }
  return (data ?? []).map(toListItem);
}

/**
 * Fire-and-forget product view log (product_views, 0013). Errors are
 * swallowed — a failed analytics write must never break the product page.
 */
export async function logProductView(productId: string): Promise<void> {
  const supabase = createClient();
  const { error } = await (supabase.from("product_views" as any) as any).insert({ product_id: productId });
  if (error) {
    console.error("logProductView failed:", error.message);
  }
}
