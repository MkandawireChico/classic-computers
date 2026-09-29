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
  const cartId = await getCartIdReadOnly();
  if (!cartId) return 0;

  const client = await getCartClient();
  const { data, error } = await (client.from("cart_items") as any).select("quantity").eq("cart_id", cartId);
  if (error || !data) return 0;
  return data.reduce((sum: number, row: any) => sum + row.quantity, 0);
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
    return { cartId, items: [], subtotal: 0 };
  }

  // Separate query for images/inventory keyed by product_id/variant_id —
  // kept simple (two queries) rather than a deeper nested embed, since
  // cart sizes are small and this stays easy to reason about.
  const productIds = Array.from(new Set(data.map((row: any) => row.product_id)));
  const [{ data: images }, { data: inventoryRows }] = await Promise.all([
    productIds.length
      ? client
          .from("product_images")
          .select("product_id, variant_id, storage_path, alt_text, is_primary")
          .in("product_id", productIds as string[])
      : Promise.resolve({ data: [] as any[] }),
    productIds.length
      ? client
          .from("storefront_inventory_status" as any)
          .select("product_id, variant_id, status")
          .in("product_id", productIds as string[])
      : Promise.resolve({ data: [] as any[] }),
  ]);

  let subtotal = 0;
  const items: CartLineItem[] = data.map((row: any) => {
    const product = row.products;
    const variant = row.product_variants;
    const unitPrice = variant ? (variant.sale_price ?? variant.price) : (product.sale_price ?? product.base_price);
    const isPublished = product?.status === "published";
    const variantOk = !row.variant_id || variant?.status === "active";
    const isAvailable = Boolean(isPublished && variantOk);

    const productImage = (images ?? []).find(
      (img: any) => img.product_id === row.product_id && img.variant_id === null && img.is_primary,
    ) ?? (images ?? []).find((img: any) => img.product_id === row.product_id && img.variant_id === null);

    const inventoryRow = (inventoryRows ?? []).find(
      (inv: any) =>
        inv.product_id === row.product_id &&
        (row.variant_id ? inv.variant_id === row.variant_id : inv.variant_id === null),
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