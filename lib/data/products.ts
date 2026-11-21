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

function getValidSalePrice(salePrice: unknown, regularPrice: number): number | null {
  const value = salePrice === null || salePrice === undefined ? null : Number(salePrice);
  return value !== null && Number.isFinite(value) && value > 0 && value < regularPrice
    ? value
    : null;
}

function productListSelect(requireMatchingInventory = false) {
  const inventoryRelation = requireMatchingInventory
    ? "inventory:storefront_inventory_status!inner"
    : "inventory:storefront_inventory_status";
  return `
  id, sku, slug, name, base_price, sale_price, condition, is_featured,
  brand:brands ( id, name, slug ),
  category:categories ( id, name, slug ),
  product_images ( id, storage_path, alt_text, display_order, is_primary, variant_id ),
  ${inventoryRelation} ( status, variant_id ),
  product_variants ( id, price, sale_price, status, created_at )
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
    const variantStatuses = allInventoryRows.map((row) => row.status);
    if (variantStatuses.includes("in_stock")) status = "in_stock";
    else if (variantStatuses.includes("low_stock")) status = "low_stock";
    else if (variantStatuses.includes("coming_soon")) status = "coming_soon";
    else if (variantStatuses.includes("out_of_stock")) status = "out_of_stock";
    else if (variantStatuses.includes("discontinued")) status = "discontinued";
  }

  const cataloguePrice = Array.isArray(row.catalogue_price)
    ? row.catalogue_price[0]
    : row.catalogue_price;
  const activeVariants = (row.product_variants ?? [])
    .filter((variant: any) => variant.status === "active")
    .sort((a: any, b: any) => {
      const aPrice = getValidSalePrice(a.sale_price, Number(a.price)) ?? Number(a.price);
      const bPrice = getValidSalePrice(b.sale_price, Number(b.price)) ?? Number(b.price);
      return aPrice - bPrice || Number(a.price) - Number(b.price) || a.created_at.localeCompare(b.created_at) || a.id.localeCompare(b.id);
    });
  const startingVariant = activeVariants[0] ?? null;
  const startingVariantPrice = startingVariant
    ? getValidSalePrice(startingVariant.sale_price, Number(startingVariant.price)) ?? Number(startingVariant.price)
    : null;

  return {
    id: row.id,
    sku: row.sku,
    slug: row.slug,
    name: row.name,
    base_price: Number(row.base_price),
    sale_price: getValidSalePrice(row.sale_price, Number(row.base_price)),
    display_price: Number(cataloguePrice?.display_price ?? startingVariantPrice ?? getValidSalePrice(row.sale_price, Number(row.base_price)) ?? row.base_price),
    regular_price: Number(cataloguePrice?.regular_price ?? startingVariant?.price ?? row.base_price),
    has_active_variants: Boolean(cataloguePrice?.has_active_variants ?? startingVariant),
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
  let page = filters.page && filters.page > 0 ? filters.page : 1;
  const pageSize = filters.pageSize && filters.pageSize > 0 ? filters.pageSize : 24;

  let categoryId: string | null = null;
  if (filters.categorySlug) {
    const { data: category, error: categoryError } = await (supabase
      .from("categories") as any)
      .select("id")
      .eq("slug", filters.categorySlug)
      .maybeSingle();
    if (categoryError || !category) {
      return { items: [], total: 0, page, pageSize };
    }
    categoryId = category.id;
  }

  let brandIds: string[] | null = null;
  if (filters.brandSlugs && filters.brandSlugs.length > 0) {
    const { data: brands, error: brandError } = await (supabase.from("brands") as any)
      .select("id")
      .in("slug", filters.brandSlugs);
    if (brandError) {
      console.error("searchShop brand lookup failed:", brandError.message);
      return { items: [], total: 0, page, pageSize };
    }
    brandIds = (brands ?? []).map((brand: any) => brand.id);
    if (!brandIds || brandIds.length === 0) return { items: [], total: 0, page, pageSize };
  }

  const queryTerm = filters.query?.trim().replace(/[%_]/g, "") || null;
  const fetchPriceRows = async (offset: number, limit: number) => {
    const { data, error } = await (supabase.rpc("search_storefront_products" as any, {
      p_category_id: categoryId,
      p_brand_ids: brandIds,
      p_min_price: filters.minPrice ?? null,
      p_max_price: filters.maxPrice ?? null,
      p_query: queryTerm,
      p_available_only: Boolean(filters.availableOnly),
      p_sort: filters.sort ?? "featured",
      p_limit: limit,
      p_offset: offset,
    }) as any);
    if (error) {
      console.error("searchShop price query failed:", error.message);
      return { rows: null, error };
    }
    return { rows: data ?? [], error: null };
  };

  let priceRowsResult = await fetchPriceRows((page - 1) * pageSize, pageSize);
  if (priceRowsResult.error) return { items: [], total: 0, page, pageSize };
  let priceRows: any[] = priceRowsResult.rows ?? [];
  let total = Number(priceRows[0]?.total_count ?? 0);

  // An out-of-range URL has no page rows. Ask for one row from the first
  // page to recover the count, then fetch the last valid page.
  if (priceRows.length === 0 && page > 1) {
    const firstPageResult = await fetchPriceRows(0, 1);
    if (firstPageResult.error) return { items: [], total: 0, page, pageSize };
    total = Number(firstPageResult.rows?.[0]?.total_count ?? 0);
    if (total > 0) {
      page = Math.max(1, Math.ceil(total / pageSize));
      priceRowsResult = await fetchPriceRows((page - 1) * pageSize, pageSize);
      if (priceRowsResult.error) return { items: [], total, page, pageSize };
      priceRows = priceRowsResult.rows ?? [];
    }
  }

  if (priceRows.length === 0) return { items: [], total, page: total === 0 ? 1 : page, pageSize };

  const ids = priceRows.map((row: any) => row.product_id);
  const { data: products, error: productsError } = await (supabase
    .from("products")
    .select(productListSelect()) as any)
    .eq("status", "published")
    .in("id", ids);

  if (productsError) {
    console.error("searchShop product fetch failed:", productsError.message);
    return { items: [], total, page, pageSize };
  }

  const productById = new Map((products ?? []).map((product: any) => [product.id, product]));
  const priceById = new Map(priceRows.map((row: any) => [row.product_id, row]));
  const items = ids
    .map((id: string) => {
      const product = productById.get(id);
      if (!product) return null;
      return toListItem({ ...product, catalogue_price: priceById.get(id) });
    })
    .filter((item: ProductListItem | null): item is ProductListItem => item !== null);

  return { items, total, page, pageSize };
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
      product_variants ( id, sku, name, price, sale_price, is_default, status, created_at ),
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
    .map((s: any) => ({
      variant_id: s.variant_id ?? null,
      key: s.specification_definitions?.key ?? "",
      label: s.specification_definitions?.label ?? "",
      value: s.value,
      unit: s.specification_definitions?.unit ?? null,
      display_order: s.specification_definitions?.display_order ?? 0,
    }))
    .sort((a: any, b: any) => a.display_order - b.display_order);

  const activeVariants = (row.product_variants ?? [])
    .filter((variant: any) => variant.status === "active")
    .sort((a: any, b: any) => {
      const aPrice = getValidSalePrice(a.sale_price, Number(a.price)) ?? Number(a.price);
      const bPrice = getValidSalePrice(b.sale_price, Number(b.price)) ?? Number(b.price);
      return aPrice - bPrice || Number(a.price) - Number(b.price) || a.created_at.localeCompare(b.created_at);
    });
  const startingVariant = activeVariants[0] ?? null;
  const startingVariantPrice = startingVariant
    ? getValidSalePrice(startingVariant.sale_price, Number(startingVariant.price)) ?? Number(startingVariant.price)
    : null;

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
    sale_price: getValidSalePrice(row.sale_price, Number(row.base_price)),
    display_price: Number(startingVariantPrice ?? getValidSalePrice(row.sale_price, Number(row.base_price)) ?? row.base_price),
    regular_price: Number(startingVariant?.price ?? row.base_price),
    has_active_variants: Boolean(startingVariant),
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
      sale_price: getValidSalePrice(v.sale_price, Number(v.price)),
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
    .order("is_featured", { ascending: false })
    .order("created_at", { ascending: false })
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
