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
  const onSale = product.display_price > 0 && product.display_price < product.regular_price;
  const discountPercent = onSale
    ? Math.round((1 - product.display_price / product.regular_price) * 100)
    : null;

  return (
    <article className="group relative h-full">
      <TrackedProductLink
        href={"/product/" + product.slug}
        productId={product.id}
        trackSearchResult={searchResult}
        className="flex h-full flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white transition-all duration-200 hover:border-brand-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
      >
        <div className="relative aspect-[16/10] w-full overflow-hidden border-b border-slate-100 bg-gradient-to-br from-slate-50 to-white sm:aspect-square">
          {imageUrl ? (
            <Image
              src={imageUrl}
              alt={product.primary_image?.alt_text?.trim() || product.name}
              fill
              sizes={isCatalog
                ? "(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 33vw"
                : "(max-width: 639px) 100vw, (max-width: 1023px) 50vw, 25vw"}
              className="object-contain p-5 transition-transform duration-300 group-hover:scale-[1.025] sm:p-6"
            />
          ) : (
            <div className="flex h-full flex-col items-center justify-center gap-2 bg-slate-50 text-slate-300">
              <svg width="48" height="42" viewBox="0 0 40 32" fill="none" aria-hidden="true">
                <rect x="2" y="2" width="36" height="24" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M14 30h12M20 26v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
              <span className="text-[11px] font-medium text-slate-500">Image unavailable</span>
            </div>
          )}
          <div className="absolute left-3 top-3 z-10 flex flex-col items-start gap-1.5">
            {isCatalog && product.is_featured ? <Badge variant="info">Featured</Badge> : null}
            {onSale && discountPercent ? <Badge variant="danger">Save {discountPercent}%</Badge> : null}
          </div>
        </div>

        <div className={"flex flex-1 flex-col gap-3 " + (isCatalog ? "p-4 sm:p-4" : "p-5")}>
          <div className="flex min-h-4 items-center justify-between gap-2">
            {product.brand
              ? <span className="truncate text-[10px] font-bold uppercase tracking-[0.14em] text-slate-500 sm:text-[11px]">{product.brand.name}</span>
              : <span />}
            {isCatalog && product.category
              ? <span className="truncate text-[10px] font-medium text-slate-400">{formatCategoryName(product.category.name)}</span>
              : null}
          </div>

          <h3 className={"line-clamp-2 font-semibold leading-snug text-navy-950 " + (isCatalog ? "min-h-10 text-[15px] sm:text-base" : "text-base")}>
            {product.name}
          </h3>

          <div className="mt-auto flex items-end justify-between gap-2 border-t border-slate-100 pt-3">
            <div className="flex min-w-0 flex-col">
              {onSale ? (
                <>
                  <span className={"font-extrabold text-brand-800 " + (isCatalog ? "text-lg sm:text-xl" : "text-xl")}>{product.has_active_variants ? "From " : ""}{formatMoney(product.display_price)}</span>
                  <span className="text-xs font-medium text-slate-400 line-through">{formatMoney(product.regular_price)}</span>
                </>
              ) : (
                <span className={"font-extrabold text-navy-950 " + (isCatalog ? "text-lg sm:text-xl" : "text-xl")}>{product.has_active_variants ? "From " : ""}{formatMoney(product.display_price)}</span>
              )}
              <span className="mt-1 text-[10px] font-medium text-slate-500">{product.has_active_variants ? "Starting price · " : ""}Excludes VAT and PPDA</span>
            </div>
            {product.condition !== "new" ? (
              <span className="shrink-0 rounded-md bg-slate-100 px-2 py-1 text-[9px] font-semibold uppercase tracking-wide text-slate-600">{product.condition}</span>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-2 border-t border-slate-50 pt-2">
            <StockBadge status={product.inventory_status} />
            <span className="text-xs font-bold text-brand-800 transition-colors group-hover:text-brand-950">View details <span aria-hidden="true">↗</span></span>
          </div>
        </div>
      </TrackedProductLink>
    </article>
  );
}
