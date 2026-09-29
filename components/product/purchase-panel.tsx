"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { formatMoney } from "@/lib/format/money";
import { StockBadge } from "./stock-badge";
import { AddToCartButton } from "./add-to-cart-button";
import { WishlistButton } from "./wishlist-button";
import { BuyNowLink } from "./buy-now-link";
import type { BusinessInfo } from "@/lib/data/site-settings";
import type { ProductDetail } from "@/types/catalog";

export function PurchasePanel({
  product,
  businessInfo,
  isAuthenticated,
  initialInWishlist,
}: {
  product: ProductDetail;
  businessInfo: BusinessInfo | null;
  isAuthenticated: boolean;
  initialInWishlist: boolean;
}) {
  const hasVariants = product.variants.length > 0;
  const defaultVariant = product.variants.find((v) => v.is_default) ?? product.variants[0] ?? null;
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(defaultVariant?.id ?? null);

  const selectedVariant = useMemo(
    () => product.variants.find((v) => v.id === selectedVariantId) ?? null,
    [product.variants, selectedVariantId],
  );

  const price = selectedVariant?.price ?? product.base_price;
  const salePrice = selectedVariant ? selectedVariant.sale_price : product.sale_price;
  const onSale = salePrice !== null && salePrice < price;

  // Phase 4 correction (item 3): the SELECTED variant's own inventory
  // status is authoritative for a product that has variants — a product
  // with one variant out of stock must not show every other variant as
  // unavailable, and a product-level status (which usually doesn't exist
  // at all once variants exist) must never be used here instead.
  const currentStatus = hasVariants
    ? selectedVariantId
      ? (product.inventory_by_variant[selectedVariantId] ?? null)
      : null
    : product.inventory_status;
  const canOrder = currentStatus === "in_stock" || currentStatus === "low_stock";

  return (
    <div className="space-y-5">
      <div className="flex items-baseline gap-2">
        {onSale ? (
          <>
            <span className="text-2xl font-bold text-status-danger">{formatMoney(salePrice as number)}</span>
            <span className="text-base text-gray-400 line-through">{formatMoney(price)}</span>
          </>
        ) : (
            <span className="text-2xl font-bold text-slate-900">{formatMoney(price)}</span>
        )}
      </div>

      <StockBadge status={currentStatus} />

      {hasVariants ? (
        <div>
          <label htmlFor="variant" className="mb-1.5 block text-sm font-semibold text-slate-700">
            Configuration
          </label>
          <select
            id="variant"
            value={selectedVariantId ?? ""}
            onChange={(e) => setSelectedVariantId(e.target.value)}
            className="w-full rounded-card border border-surface-border bg-white px-3 py-2.5 text-sm text-slate-900 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            {product.variants
              .filter((v) => v.status === "active")
              .map((variant) => (
                <option key={variant.id} value={variant.id}>
                  {variant.name} — {formatMoney(variant.sale_price ?? variant.price)}
                </option>
              ))}
          </select>
        </div>
      ) : null}

      <BuyNowLink
        businessInfo={businessInfo}
        product={{
          name: product.name,
          sku: product.sku,
          slug: product.slug,
          variantName: selectedVariant?.name ?? null,
          variantSku: selectedVariant?.sku ?? null,
          unitPrice: salePrice ?? price,
        }}
      />

      <div className="flex flex-col gap-2 sm:flex-row">
        <AddToCartButton
          productId={product.id}
          variantId={selectedVariantId}
          redirectTo={`/product/${product.slug}`}
          isAuthenticated={isAuthenticated}
          disabled={!canOrder}
        />
        {isAuthenticated ? (
          <WishlistButton
            productId={product.id}
            variantId={selectedVariantId}
            initialInWishlist={initialInWishlist}
          />
        ) : (
          <Link
            href="/sign-in"
            className="inline-flex h-10 items-center justify-center rounded-card border border-surface-border px-4 text-sm font-medium text-slate-800 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            Sign in to save
          </Link>
        )}
      </div>

    </div>
  );
}
