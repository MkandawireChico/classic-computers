import Link from "next/link";
import Image from "next/image";
import { getWishlistWithProducts } from "@/lib/data/wishlist";
import { getPublicStorageUrl } from "@/lib/storage";
import { formatMoney } from "@/lib/format/money";
import { StockBadge } from "@/components/product/stock-badge";
import { RemoveWishlistButton } from "./remove-wishlist-button";

export default async function WishlistPage() {
  const entries = await getWishlistWithProducts();

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-gray-900">Wishlist</h1>

      {entries.length === 0 ? (
        <p className="text-sm text-gray-500">
          Nothing saved yet.{" "}
          <Link href="/shop" className="text-brand-600 hover:underline">
            Browse the shop
          </Link>
          .
        </p>
      ) : (
        <div className="space-y-3">
          {entries.map(({ wishlistItemId, product }) => (
            <div key={wishlistItemId} className="flex items-center gap-4 rounded-card border border-surface-border p-3">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-card bg-surface-muted">
                {product.primary_image ? (
                  <Image
                    src={getPublicStorageUrl("product-images", product.primary_image.storage_path)}
                    alt={product.primary_image.alt_text ?? product.name}
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : null}
              </div>
              <div className="flex-1">
                <Link href={`/product/${product.slug}`} className="text-sm font-medium text-gray-900 hover:underline">
                  {product.name}
                </Link>
                <div className="mt-1 flex items-center gap-2">
                  <span className="text-sm font-semibold text-gray-900">
                    {formatMoney(product.sale_price ?? product.base_price)}
                  </span>
                  <StockBadge status={product.inventory_status} />
                </div>
              </div>
              <RemoveWishlistButton productId={product.id} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
