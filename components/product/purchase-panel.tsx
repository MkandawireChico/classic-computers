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
  rentalOffers = [],
}: {
  product: ProductDetail;
  businessInfo: BusinessInfo | null;
  isAuthenticated: boolean;
  initialInWishlist: boolean;
  rentalOffers?: Array<{
    rentalProductId: string;
    productId: string;
    variantId: string | null;
    productName: string;
    variantName: string | null;
    productSlug: string;
    dailyRate: number | null;
    weeklyRate: number | null;
    monthlyRate: number | null;
    depositAmount: number | null;
    availableQuantity: number;
  }>;
}) {
  const hasVariants = product.variants.length > 0;
  const activeVariants = useMemo(
    () => product.variants.filter((variant) => variant.status === "active"),
    [product.variants],
  );
  const defaultVariant =
    activeVariants.find((variant) => variant.is_default) ?? activeVariants[0] ?? null;
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(defaultVariant?.id ?? null);

  // Resolve against the current active list. A stale/default discontinued
  // variant must never become the selected purchase configuration.
  const selectedVariant =
    activeVariants.find((variant) => variant.id === selectedVariantId) ?? defaultVariant;
  const effectiveVariantId = selectedVariant?.id ?? null;

  const price = selectedVariant?.price ?? product.base_price;
  const salePrice = selectedVariant ? selectedVariant.sale_price : product.sale_price;
  const onSale = salePrice !== null && salePrice > 0 && salePrice < price;
  const effectivePrice = onSale ? (salePrice as number) : price;

  // Phase 4 correction (item 3): the SELECTED variant's own inventory
  // status is authoritative for a product that has variants — a product
  // with one variant out of stock must not show every other variant as
  // unavailable, and a product-level status (which usually doesn't exist
  // at all once variants exist) must never be used here instead.
  const currentStatus = hasVariants
    ? effectiveVariantId
      ? (product.inventory_by_variant[effectiveVariantId] ?? null)
      : null
    : product.inventory_status;
  const canOrder = currentStatus === "in_stock" || currentStatus === "low_stock";
  const rentalOffer = rentalOffers.find((offer) => {
    if (effectiveVariantId) {
      return offer.variantId === effectiveVariantId;
    }
    return offer.variantId === null || offer.variantId === undefined;
  }) ?? null;
  const rentalPrice = rentalOffer?.dailyRate ?? rentalOffer?.weeklyRate ?? rentalOffer?.monthlyRate ?? null;
  const quickSpecifications = product.specifications.slice(0, 4);

  return (
    <div className="space-y-4 sm:space-y-5">
      {quickSpecifications.length > 0 ? (
        <section aria-label="Key product specifications" className="rounded-xl border border-slate-200 bg-white p-4">
          <p className="mb-3 text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-500">Key specifications</p>
          <dl className="grid grid-cols-2 gap-x-4 gap-y-3">
            {quickSpecifications.map((spec) => (
              <div key={spec.key} className="min-w-0">
                <dt className="text-[11px] font-medium text-slate-500">{spec.label}</dt>
                <dd className="mt-0.5 break-words text-sm font-bold text-navy-950">{spec.value}{spec.unit ? " " + spec.unit : ""}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}
      <div className="rounded-2xl border border-brand-100 bg-brand-50/60 px-4 py-4 sm:px-5">
        <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.18em] text-slate-500">Catalogue price</p>
        <div className="flex flex-wrap items-baseline gap-2">
        {onSale ? (
          <>
            <span className="text-3xl font-extrabold text-brand-700">{formatMoney(salePrice as number)}</span>
            <span className="text-base font-medium text-slate-500 line-through">{formatMoney(price)}</span>
          </>
        ) : (
            <span className="text-3xl font-extrabold text-navy-900">{formatMoney(price)}</span>
        )}
        </div>
        <p className="mt-2 text-xs leading-5 text-slate-600">Displayed price excludes VAT and PPDA. These are calculated separately on quotations and invoices.</p>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
        <p className="text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Availability</p>
        <StockBadge status={currentStatus} />
      </div>

      {hasVariants ? (
        <div>
          <label htmlFor="variant" className="mb-1.5 block text-sm font-semibold text-slate-700">
            Configuration
          </label>
          {activeVariants.length > 0 ? (
          <select
            id="variant"
            value={effectiveVariantId ?? ""}
            onChange={(e) => setSelectedVariantId(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm font-medium text-slate-900 shadow-sm focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-500/20"
          >
            {activeVariants.map((variant) => {
              const status = product.inventory_by_variant[variant.id] ?? null;
              const availabilityLabel =
                status === "out_of_stock" ? " · Out of stock" :
                status === "coming_soon" ? " · Coming soon" :
                status === "discontinued" ? " · Discontinued" :
                status === "low_stock" ? " · Limited stock" :
                status === "in_stock" ? " · In stock" : " · Availability unconfirmed";
              return (
                <option key={variant.id} value={variant.id}>
                  {variant.name} — {formatMoney(variant.sale_price !== null && variant.sale_price > 0 && variant.sale_price < variant.price ? variant.sale_price : variant.price)}{availabilityLabel}
                </option>
              );
            })}
          </select>
          ) : (
            <p className="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
              No active configurations are available for purchase. Please contact us for assistance.
            </p>
          )}
        </div>
      ) : null}

      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.12em] text-slate-500">Purchase options</p>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
        <AddToCartButton
          productId={product.id}
          variantId={effectiveVariantId}
          disabled={!canOrder}
        />
        <AddToCartButton
          productId={product.id}
          variantId={effectiveVariantId}
          disabled={!canOrder}
          buyNow
        />
        </div>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        {isAuthenticated ? (
          <WishlistButton
            productId={product.id}
            variantId={effectiveVariantId}
            initialInWishlist={initialInWishlist}
          />
        ) : (
          <Link
            href="/sign-in"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-navy-900 transition-colors hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            Sign in to save
          </Link>
        )}
      </div>

      {rentalOffer ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-xs font-bold uppercase tracking-[0.12em] text-slate-600">Rental pricing</p>
          <div className="mt-2 flex items-center justify-between gap-3">
            <div>
              <p className="text-lg font-bold text-navy-950">{rentalPrice ? formatMoney(rentalPrice) : "Quote on request"}</p>
              <p className="text-xs text-slate-700">
                {rentalOffer.dailyRate ? `${formatMoney(rentalOffer.dailyRate)}/day` : ""}
                {rentalOffer.weeklyRate ? ` · ${formatMoney(rentalOffer.weeklyRate)}/week` : ""}
                {rentalOffer.monthlyRate ? ` · ${formatMoney(rentalOffer.monthlyRate)}/month` : ""}
              </p>
              <p className="mt-1 text-[11px] font-medium text-slate-500">Rental rate excludes VAT and PPDA.</p>
            </div>
            <span className="rounded-full bg-white px-2 py-1 text-xs font-semibold text-navy-900 ring-1 ring-slate-200">
              {rentalOffer.availableQuantity > 0 ? `${rentalOffer.availableQuantity} available` : "Unavailable"}
            </span>
          </div>
          {rentalOffer.availableQuantity > 0 ? (
            <Link
              href={`/rentals/book?product=${encodeURIComponent(rentalOffer.productId)}&variant=${encodeURIComponent(effectiveVariantId ?? rentalOffer.variantId ?? "")}`}
              className="mt-3 inline-flex w-full items-center justify-center rounded-lg border border-brand-300 bg-white px-4 py-2.5 text-sm font-semibold text-brand-800 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              Request rental
            </Link>
          ) : (
            <p className="mt-3 rounded-lg bg-slate-100 px-4 py-2.5 text-center text-sm font-semibold text-slate-600" role="status">
              This item is currently unavailable for rental
            </p>
          )}
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
          unitPrice: effectivePrice,
        }}
      />

    </div>
  );
}
