import Image from "next/image";
import { formatMoney } from "@/lib/format/money";
import { getPublicStorageUrl } from "@/lib/storage";
import { StockBadge } from "./stock-badge";
import { Badge } from "@/components/ui/badge";
import { formatCategoryName } from "@/lib/format/category";
import type { ProductListItem } from "@/types/catalog";
import { TrackedProductLink } from "./tracked-product-link";

export function ProductCard({
  product,
  variant = "default",
  searchResult = false,
}: {
  product: ProductListItem;
  variant?: "default" | "catalog";
  searchResult?: boolean;
}) {
  const isCatalog = variant === "catalog";
  const imageUrl = product.primary_image
    ? getPublicStorageUrl("product-images", product.primary_image.storage_path)
    : null;
  const onSale = product.sale_price !== null && product.sale_price < product.base_price;
  const discountPercent = onSale
    ? Math.round((1 - (product.sale_price as number) / product.base_price) * 100)
    : null;

  return (
    <div className="group relative h-full">
      <TrackedProductLink
        href={`/product/${product.slug}`}
        productId={product.id}
        trackSearchResult={searchResult}
        className="flex h-full flex-col overflow-hidden rounded-2xl border-2 border-slate-200 bg-white shadow-xl shadow-slate-900/10 transition-all duration-300 hover:-translate-y-2 hover:border-brand-400 hover:shadow-2xl hover:shadow-slate-900/15 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden border-b-2 border-slate-100 bg-gradient-to-br from-slate-50 to-slate-100">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.primary_image?.alt_text ?? product.name}
              fill
              sizes={
                isCatalog
                  ? "(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
                  : "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
              }
              className="object-contain p-5 transition-transform duration-300 group-hover:scale-[1.08] sm:p-7"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-slate-300">
              {isCatalog ? (
                <>
                  <svg width="56" height="48" viewBox="0 0 40 32" fill="none" aria-hidden="true">
                    <rect
                      x="2"
                      y="2"
                      width="36"
                      height="24"
                      rx="2"
                      stroke="currentColor"
                      strokeWidth="2"
                    />
                    <path
                      d="M14 30h12M20 26v4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="text-sm font-semibold text-slate-400">Image unavailable</span>
                </>
              ) : (
                <span className="text-base font-semibold text-slate-400">No image yet</span>
              )}
            </div>
          )}

          <div className="absolute left-4 top-4 z-10 flex flex-col items-start gap-2 sm:left-5 sm:top-5">
            {isCatalog && product.is_featured ? (
              <Badge variant="info" className="text-xs font-bold shadow-lg">
                Featured
              </Badge>
            ) : null}
            {onSale && discountPercent ? (
              <Badge variant="danger" className="text-xs font-bold shadow-lg">
                Save {discountPercent}%
              </Badge>
            ) : null}
          </div>
        </div>

        <div className={`flex flex-1 flex-col ${isCatalog ? "gap-3 p-5 sm:p-6" : "gap-4 p-6"}`}>
          {isCatalog ? (
            <div className="flex min-h-4 items-center justify-between gap-2">
              {product.brand ? (
                <span className="truncate text-xs font-bold uppercase tracking-[0.16em] text-slate-500">
                  {product.brand.name}
                </span>
              ) : (
                <span />
              )}
              {product.category ? (
                <span className="truncate text-xs font-medium text-slate-400">
                  {formatCategoryName(product.category.name)}
                </span>
              ) : null}
            </div>
          ) : product.brand ? (
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">
              {product.brand.name}
            </span>
          ) : null}

          <h3
            className={`line-clamp-2 font-bold leading-tight text-slate-900 ${isCatalog ? "min-h-10 text-sm sm:text-base" : "text-base"}`}
          >
            {product.name}
          </h3>

          <div className="mt-auto flex items-end justify-between gap-3 pt-2">
            <div className="flex flex-col">
              {onSale ? (
                <>
                  <span
                    className={`font-extrabold text-brand-700 ${isCatalog ? "text-lg sm:text-xl" : "text-xl"}`}
                  >
                    {formatMoney(product.sale_price as number)}
                  </span>
                  <span className="text-sm font-medium text-slate-400 line-through">
                    {formatMoney(product.base_price)}
                  </span>
                </>
              ) : (
                <span
                  className={`font-extrabold text-slate-900 ${isCatalog ? "text-lg sm:text-xl" : "text-xl"}`}
                >
                  {formatMoney(product.base_price)}
                </span>
              )}
            </div>

            {product.condition !== "new" ? (
              <span className="rounded-full border-2 border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-bold uppercase tracking-[0.14em] text-slate-600">
                {product.condition}
              </span>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-2 border-t-2 border-slate-100 pt-4">
            <StockBadge status={product.inventory_status} />
            <span className="text-sm font-bold text-brand-700 transition-colors group-hover:text-brand-600">
              View item
            </span>
          </div>
        </div>
      </TrackedProductLink>
    </div>
  );
}
