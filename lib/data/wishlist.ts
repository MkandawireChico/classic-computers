import "server-only";
import { createClient } from "@/lib/supabase/server";
import type { ProductListItem } from "@/types/catalog";

export interface WishlistProductEntry {
  wishlistItemId: string;
  variantId: string | null;
  variantName: string | null;
  price: number;
  salePrice: number | null;
  inventoryStatus: string | null;
  product: ProductListItem;
}

export async function getWishlistWithProducts(): Promise<WishlistProductEntry[]> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: wishlist, error: wishlistError } = await (supabase.from("wishlists") as any)
    .select("id")
    .eq("customer_id", user.id)
    .maybeSingle();
  if (wishlistError) {
    console.error("getWishlistWithProducts wishlist lookup failed:", wishlistError.message);
    throw new Error("Could not load your wishlist. Please refresh the page and try again.");
  }
  if (!wishlist) return [];

  const { data, error } = await (supabase
    .from("wishlist_items") as any)
    .select(`
      id,
      variant_id,
      products (
        id, sku, slug, name, base_price, sale_price, condition, is_featured,
        brand:brands ( id, name, slug ),
        category:categories ( id, name, slug ),
        product_images ( id, storage_path, alt_text, display_order, is_primary, variant_id ),
        product_variants ( id, name, price, sale_price, status, created_at ),
        inventory:storefront_inventory_status ( status, variant_id )
      )
    `)
    .eq("wishlist_id", wishlist.id)
    .order("added_at", { ascending: false });

  if (error) {
    console.error("getWishlistWithProducts failed:", error.message);
    throw new Error("Could not load your wishlist items. Please refresh the page and try again.");
  }

  return (data ?? [])
    .filter((row: any) => row.products)
    .map((row: any) => {
      const p = row.products;
      const variantId = row.variant_id ?? null;
      const selectedVariant = variantId
        ? (p.product_variants ?? []).find((variant: any) => variant.id === variantId) ?? null
        : null;
      const images = (p.product_images ?? []).filter((i: any) => i.variant_id === variantId);
      const fallbackImages = (p.product_images ?? []).filter((i: any) => i.variant_id === null);
      const primary = images.find((i: any) => i.is_primary) ?? images[0] ?? fallbackImages.find((i: any) => i.is_primary) ?? fallbackImages[0] ?? null;
      const inventoryRows = (p.inventory ?? []).filter((i: any) => i.variant_id === variantId);
      const price = selectedVariant ? Number(selectedVariant.price) : Number(p.base_price);
      const salePrice = selectedVariant
        ? (selectedVariant.sale_price === null ? null : Number(selectedVariant.sale_price))
        : (p.sale_price === null ? null : Number(p.sale_price));
      const activeVariants = (p.product_variants ?? [])
        .filter((variant: any) => variant.status === "active")
        .sort((a: any, b: any) => {
          const aRegular = Number(a.price);
          const bRegular = Number(b.price);
          const aSale = a.sale_price === null ? null : Number(a.sale_price);
          const bSale = b.sale_price === null ? null : Number(b.sale_price);
          const aDisplay = aSale !== null && aSale > 0 && aSale < aRegular ? aSale : aRegular;
          const bDisplay = bSale !== null && bSale > 0 && bSale < bRegular ? bSale : bRegular;
          return aDisplay - bDisplay || aRegular - bRegular || a.created_at.localeCompare(b.created_at);
        });
      const startingVariant = activeVariants[0] ?? null;
      const startingRegular = startingVariant ? Number(startingVariant.price) : Number(p.base_price);
      const startingSale = startingVariant?.sale_price === null || startingVariant?.sale_price === undefined
        ? null
        : Number(startingVariant.sale_price);
      const startingDisplay = startingSale !== null && startingSale > 0 && startingSale < startingRegular
        ? startingSale
        : startingRegular;
      const inventoryStatus = inventoryRows[0]?.status ?? null;

      const product: ProductListItem = {
        id: p.id,
        sku: p.sku,
        slug: p.slug,
        name: p.name,
        base_price: Number(p.base_price),
        sale_price: p.sale_price === null ? null : Number(p.sale_price),
        display_price: startingDisplay,
        regular_price: startingRegular,
        has_active_variants: Boolean(startingVariant),
        condition: p.condition,
        is_featured: p.is_featured,
        brand: p.brand ?? null,
        category: p.category ?? null,
        primary_image: primary,
        inventory_status: inventoryStatus,
      };

      return {
        wishlistItemId: row.id,
        variantId,
        variantName: selectedVariant?.name ?? null,
        price,
        salePrice,
        inventoryStatus,
        product,
      };
    });
}
