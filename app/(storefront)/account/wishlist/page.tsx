import { AccountPageHeader } from "@/components/storefront/account-page-header";
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
    <div className="space-y-6">
      <AccountPageHeader eyebrow="Shopping · Saved products" title="Wishlist" description="Products you have saved to come back to later." />

      {entries.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-7 text-center shadow-sm sm:p-10">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-slate-300">
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
          </svg>
          <h3 className="text-lg font-bold text-slate-950">Your wishlist is empty</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">Save products from the shop and they will be collected here.</p>
          <Link
            href="/shop"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4.05 3 5.5l7 7Z" />
            </svg>
            Browse Shop
          </Link>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {entries.map(({ wishlistItemId, variantId, variantName, price, salePrice, inventoryStatus, product }) => (
            <div key={wishlistItemId} className="group flex flex-col rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-brand-300">
              <div className="relative aspect-square overflow-hidden rounded-xl bg-slate-100">
                {product.primary_image ? (
                  <Image
                    src={getPublicStorageUrl("product-images", product.primary_image.storage_path)}
                    alt={product.primary_image.alt_text ?? product.name}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover"
                  />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm font-medium text-slate-400">Image unavailable</div>
                )}
              </div>
              <div className="mt-4 flex-1">
                <Link href={`/product/${product.slug}`} className="text-base font-bold text-slate-900 hover:text-brand-600">
                  {product.name}
                </Link>
                <div className="mt-2 flex items-center gap-2">
                  <span className="text-lg font-bold text-slate-900">
                    {formatMoney(salePrice !== null && salePrice < price ? salePrice : price)}
                  </span>
                  <StockBadge status={inventoryStatus as any} />
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <Link
                  href={`/product/${product.slug}`}
                  className="flex-1 inline-flex items-center justify-center rounded-xl bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-brand-600"
                >
                  View Details
                </Link>
                <RemoveWishlistButton productId={product.id} variantId={variantId} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
