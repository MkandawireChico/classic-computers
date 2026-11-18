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
    <article className="group relative h-full">
      <TrackedProductLink
        href={`/product/${product.slug}`}
        productId={product.id}
        trackSearchResult={searchResult}
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-panel focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      >
        <div className="relative aspect-[4/3] w-full overflow-hidden bg-slate-50">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.primary_image?.alt_text ?? product.name}
              fill
              sizes={isCatalog
                ? "(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw"
                : "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"}
              className="object-contain p-4 transition-transform duration-500 group-hover:scale-[1.04] sm:p-6"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-slate-300">
              <svg width="48" height="42" viewBox="0 0 40 32" fill="none" aria-hidden="true">
                <rect x="2" y="2" width="36" height="24" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M14 30h12M20 26v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="text-xs font-medium text-slate-400">Image unavailable</span>
            </div>
          )}

          <div className="absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
            {isCatalog && product.is_featured ? <Badge variant="info">Featured</Badge> : null}
            {onSale && discountPercent ? <Badge variant="danger">Save {discountPercent}%</Badge> : null}
          </div>
        </div>

        <div className={`flex flex-1 flex-col ${isCatalog ? "gap-2.5 p-3.5 sm:p-4" : "gap-3 p-5"}`}>
          <div className="flex min-h-4 items-center justify-between gap-2">
            {product.brand
              ? <span className="truncate text-[10px] font-bold uppercase tracking-[0.15em] text-slate-500 sm:text-[11px]">{product.brand.name}</span>
              : <span />}
            {isCatalog && product.category
              ? <span className="truncate text-[10px] font-medium text-slate-400">{formatCategoryName(product.category.name)}</span>
              : null}
          </div>

          <h3 className={`line-clamp-2 font-semibold leading-snug text-navy-900 ${isCatalog ? "min-h-10 text-sm sm:text-[15px]" : "text-base"}`}>
            {product.name}
          </h3>

          <div className="mt-auto flex items-end justify-between gap-2 pt-1">
            <div className="flex min-w-0 flex-col">
              {onSale ? (
                <>
                  <span className={`font-extrabold text-brand-700 ${isCatalog ? "text-base sm:text-lg" : "text-xl"}`}>{formatMoney(product.sale_price as number)}</span>
                  <span className="text-xs font-medium text-slate-400 line-through">{formatMoney(product.base_price)}</span>
                </>
              ) : (
                <span className={`font-extrabold text-navy-900 ${isCatalog ? "text-base sm:text-lg" : "text-xl"}`}>{formatMoney(product.base_price)}</span>
              )}
            </div>
            {product.condition !== "new" ? (
              <span className="shrink-0 rounded-full bg-slate-100 px-2 py-1 text-[9px] font-semibold uppercase tracking-wide text-slate-600">{product.condition}</span>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-slate-100 pt-3">
            <StockBadge status={product.inventory_status} />
            <span className="text-xs font-semibold text-brand-700 transition-colors group-hover:text-brand-800">View details <span aria-hidden="true">→</span></span>
          </div>
        </div>
      </TrackedProductLink>
    </article>
  );
}
