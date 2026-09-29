import Image from "next/image";
import Link from "next/link";
import { formatMoney } from "@/lib/format/money";
import { getPublicStorageUrl } from "@/lib/storage";
import { StockBadge } from "./stock-badge";
import { CompareToggle } from "./compare-toggle";
import { Badge } from "@/components/ui/badge";
import type { ProductListItem } from "@/types/catalog";

export function ProductCard({
  product,
  isComparing = false,
  variant = "default",
}: {
  product: ProductListItem;
  isComparing?: boolean;
  variant?: "default" | "catalog";
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
    <Link
      href={`/product/${product.slug}`}
      className="group relative flex h-full flex-col overflow-hidden rounded-card border border-surface-border bg-white transition-colors duration-150 hover:border-brand-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
    >
      <div className="relative aspect-[4/3] w-full overflow-hidden border-b border-surface-border bg-slate-50">
        {imageUrl ? (
          <Image
            src={imageUrl}
            alt={product.primary_image?.alt_text ?? product.name}
            fill
            sizes={isCatalog ? "(max-width: 640px) 50vw, (max-width: 1280px) 33vw, 25vw" : "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"}
            className="object-contain p-3 transition-transform duration-200 group-hover:scale-[1.02] sm:p-5"
          />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-2 text-slate-300">
            {isCatalog ? (
              <>
                <svg width="40" height="32" viewBox="0 0 40 32" fill="none" aria-hidden="true">
                  <rect x="2" y="2" width="36" height="24" rx="2" stroke="currentColor" strokeWidth="1.5" />
                  <path d="M14 30h12M20 26v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
                <span className="text-xs font-medium text-slate-400">Image unavailable</span>
              </>
            ) : <span className="text-sm font-medium text-slate-400">No image yet</span>}
          </div>
        )}

        <div className="absolute left-2 top-2 z-10 flex flex-col items-start gap-1 sm:left-3 sm:top-3">
          {isCatalog && product.is_featured ? <Badge variant="info" className="text-[10px]">Featured</Badge> : null}
          {onSale && discountPercent ? (
            <Badge variant="danger" className="text-[10px]">
              Save {discountPercent}%
            </Badge>
          ) : null}
        </div>

        <div className="absolute right-3 top-3 z-10">
          <CompareToggle productId={product.id} isComparing={isComparing} />
        </div>
      </div>

      <div className={`flex flex-1 flex-col ${isCatalog ? "gap-2 p-3 sm:p-4" : "gap-3 p-4"}`}>
        {isCatalog ? (
          <div className="flex min-h-4 items-center justify-between gap-2">
            {product.brand ? (
              <span className="truncate text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-500">
                {product.brand.name}
              </span>
            ) : <span />}
            {product.category ? <span className="truncate text-[10px] text-slate-400">{product.category.name}</span> : null}
          </div>
        ) : product.brand ? (
          <span className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">{product.brand.name}</span>
        ) : null}

        <h3 className={`line-clamp-2 font-semibold leading-snug text-slate-900 ${isCatalog ? "min-h-10 text-sm sm:text-base" : "text-base"}`}>
          {product.name}
        </h3>

        <div className="mt-auto flex items-end justify-between gap-3 pt-2">
          <div className="flex flex-col">
            {onSale ? (
              <>
                <span className={`font-bold text-brand-700 ${isCatalog ? "text-base sm:text-lg" : "text-lg"}`}>
                  {formatMoney(product.sale_price as number)}
                </span>
                <span className="text-xs text-slate-400 line-through">{formatMoney(product.base_price)}</span>
              </>
            ) : (
              <span className={`font-bold text-slate-900 ${isCatalog ? "text-base sm:text-lg" : "text-lg"}`}>{formatMoney(product.base_price)}</span>
            )}
          </div>

          {product.condition !== "new" ? (
              <span className="rounded-md border border-slate-200 bg-slate-50 px-2 py-1 text-[10px] font-medium uppercase tracking-[0.12em] text-slate-600">
              {product.condition}
            </span>
          ) : null}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-slate-200 pt-3">
          <StockBadge status={product.inventory_status} />
          <span className="text-[11px] font-semibold text-brand-700">
            View item{isCatalog ? <span aria-hidden="true"> →</span> : null}
          </span>
        </div>
      </div>
    </Link>
  );
}
