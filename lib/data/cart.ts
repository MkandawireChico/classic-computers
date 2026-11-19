import "server-only";
import { getCartClient, getCartIdReadOnly } from "@/lib/services/cart";

export interface CartLineItem {
  cartItemId: string;
  productId: string;
  variantId: string | null;
  productName: string;
  productSlug: string;
  variantName: string | null;
  quantity: number;
  unitPrice: number;
  imagePath: string | null;
  imageAlt: string | null;
  inventoryStatus: string | null;
  isAvailable: boolean;
}

export interface CartSummary {
  cartId: string | null;
  items: CartLineItem[];
  subtotal: number;
}

export async function getCartItemCount(): Promise<number> {
  try {
    const cartId = await getCartIdReadOnly();
    if (!cartId) return 0;

    const client = await getCartClient();
    const { data, error } = await (client.from("cart_items") as any).select("quantity").eq("cart_id", cartId);
    if (error || !data) return 0;
    return data.reduce((sum: number, row: any) => sum + row.quantity, 0);
  } catch (err) {
    console.error("getCartItemCount failed:", err instanceof Error ? err.message : String(err));
    return 0;
  }
}

export async function getCartSummary(): Promise<CartSummary> {
  const cartId = await getCartIdReadOnly();
  if (!cartId) return { cartId: null, items: [], subtotal: 0 };

  const client = await getCartClient();

  const { data, error } = await (client
    .from("cart_items") as any)
    .select(`
      id, product_id, variant_id, quantity,
      products ( name, slug, status, base_price, sale_price ),
      product_variants ( name, status, price, sale_price )
    `)
    .eq("cart_id", cartId);

  if (error || !data) {
    console.error("getCartSummary failed:", error?.message);
    throw new Error("We could not load your cart. Please refresh the page and try again.");
  }

  // Separate query for images/inventory keyed by product_id/variant_id —
  // kept simple (two queries) rather than a deeper nested embed, since
  // cart sizes are small and this stays easy to reason about.
  const productIds = Array.from(new Set(data.map((row: any) => row.product_id)));
  const [imageResult, inventoryResult] = await Promise.all([
    productIds.length
      ? client
          .from("product_images")
          .select("product_id, variant_id, storage_path, alt_text, is_primary")
          .in("product_id", productIds as string[])
      : Promise.resolve({ data: [] as any[], error: null }),
    productIds.length
      ? client
          .from("storefront_inventory_status" as any)
          .select("product_id, variant_id, status")
          .in("product_id", productIds as string[])
      : Promise.resolve({ data: [] as any[], error: null }),
  ]);

  if (imageResult.error) {
    console.error("getCartSummary image lookup failed:", imageResult.error.message);
  }
  if (inventoryResult.error) {
    console.error("getCartSummary inventory lookup failed:", inventoryResult.error.message);
    throw new Error("We could not verify product availability. Please refresh your cart and try again.");
  }
  const images = imageResult.data ?? [];
  const inventoryRows = inventoryResult.data ?? [];

  let subtotal = 0;
  const items: CartLineItem[] = data.map((row: any) => {
    const product = row.products;
    const variant = row.product_variants;
    const regularPrice = Number(variant ? variant.price : product?.base_price);
    const configuredSalePrice = variant ? variant.sale_price : product?.sale_price;
    const salePrice = configuredSalePrice === null || configuredSalePrice === undefined
      ? null
      : Number(configuredSalePrice);
    // A sale price only applies when it is a valid, positive amount below
    // the regular price. Keep cart, checkout and catalogue totals aligned.
    const unitPrice = salePrice !== null && Number.isFinite(salePrice) && salePrice > 0 && salePrice < regularPrice
      ? salePrice
      : regularPrice;
    const isPublished = product?.status === "published";
    const variantOk = !row.variant_id || variant?.status === "active";

    const productImages = images.filter((img: any) => img.product_id === row.product_id);
    const variantImages = productImages.filter((img: any) => img.variant_id === row.variant_id);
    const baseImages = productImages.filter((img: any) => img.variant_id === null);
    const productImage = variantImages.find((img: any) => img.is_primary)
      ?? variantImages[0]
      ?? baseImages.find((img: any) => img.is_primary)
      ?? baseImages[0];

    const inventoryRow = (inventoryRows ?? []).find(
      (inv: any) =>
        inv.product_id === row.product_id &&
        (row.variant_id ? inv.variant_id === row.variant_id : inv.variant_id === null),
    );
    // A published product or active variant is not necessarily in stock.
    // Fail closed when its inventory row is missing or unavailable.
    const isAvailable = Boolean(
      isPublished &&
      variantOk &&
      inventoryRow &&
      ["in_stock", "low_stock"].includes(inventoryRow.status),
    );

    if (isAvailable) {
      subtotal += unitPrice * row.quantity;
    }

    return {
      cartItemId: row.id,
      productId: row.product_id,
      variantId: row.variant_id,
      productName: product?.name ?? "Unknown product",
      productSlug: product?.slug ?? "",
      variantName: variant?.name ?? null,
      quantity: row.quantity,
      unitPrice,
      imagePath: productImage?.storage_path ?? null,
      imageAlt: productImage?.alt_text ?? null,
      inventoryStatus: inventoryRow?.status ?? null,
      isAvailable,
    };
  });

  return { cartId, items, subtotal };
}