import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getRentableProducts } from "@/lib/data/rental-tracking";
import { RentalBookingForm } from "@/components/storefront/rental-booking-form";
import { RentalTrackingWidget } from "@/components/storefront/rental-tracking-widget";
import { formatMoney } from "@/lib/format/money";
import { getPublicStorageUrl } from "@/lib/storage";

export const metadata: Metadata = {
  title: "Laptop Rentals",
  description: "Laptop rentals from Classic Computers LLC, Blantyre.",
};

export default async function RentalsPage({
  searchParams,
}: {
  searchParams?: { product?: string; variant?: string };
}) {
  const supabase = createClient();
  const [{ data: { user } }, products] = await Promise.all([supabase.auth.getUser(), getRentableProducts()]);
  const selectedProductId = searchParams?.product ?? products[0]?.productId ?? null;
  const selectedVariantId = searchParams?.variant ?? products.find((product) => product.productId === selectedProductId)?.variantId ?? null;

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900">Laptop Rentals</h1>
      <p className="mt-3 max-w-2xl text-gray-700">
        Classic Computers LLC offers laptop rentals in Blantyre for individuals and businesses.
        Choose a rentable configuration below and submit a request for review.
      </p>

      {products.length > 0 ? (
        <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {products.map((product) => {
            const imageUrl = product.imagePath ? getPublicStorageUrl("product-images", product.imagePath) : null;
            return (
              <div key={`${product.productId}-${product.variantId ?? "default"}`} className="rounded-panel border border-surface-border bg-white p-4 shadow-soft">
                <div className="relative aspect-[4/3] overflow-hidden rounded-card border border-surface-border bg-slate-100">
                  {imageUrl ? (
                    <Image src={imageUrl} alt={product.productName} fill className="object-contain p-2" sizes="(max-width: 768px) 100vw, 33vw" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-sm font-medium text-slate-400">Image unavailable</div>
                  )}
                </div>

                <div className="mt-4">
                  <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-600">Rental ready</p>
                  <h2 className="mt-2 text-lg font-semibold text-gray-900">{product.productName}</h2>
                  {product.variantName ? <p className="mt-1 text-sm text-gray-600">{product.variantName}</p> : null}

                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div>
                      {product.dailyRate ? <p className="text-lg font-bold text-slate-900">{formatMoney(product.dailyRate)}/day</p> : null}
                      {product.weeklyRate ? <p className="text-sm text-gray-600">{formatMoney(product.weeklyRate)}/week</p> : null}
                      {product.monthlyRate ? <p className="text-sm text-gray-600">{formatMoney(product.monthlyRate)}/month</p> : null}
                      {!product.dailyRate && !product.weeklyRate && !product.monthlyRate ? <p className="text-sm text-gray-600">Pricing on request</p> : null}
                    </div>
                    <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
                      {product.availableQuantity > 0 ? `${product.availableQuantity} avail.` : "Out of stock"}
                    </span>
                  </div>

                  <div className="mt-4 flex gap-2">
                    <Link
                      href={`/rentals?product=${encodeURIComponent(product.productId)}&variant=${encodeURIComponent(product.variantId ?? "")}`}
                      className="inline-flex flex-1 items-center justify-center rounded-card bg-brand-500 px-4 py-2.5 text-sm font-semibold text-white hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                    >
                      Rent Now
                    </Link>
                    <Link
                      href={`/product/${product.productSlug}`}
                      className="inline-flex items-center justify-center rounded-card border border-surface-border px-4 py-2.5 text-sm font-medium text-slate-800 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      <div className="mt-10">
        <RentalBookingForm
          products={products}
          isAuthenticated={Boolean(user)}
          defaultRentalProductId={
            products.find(
              (product) =>
                product.productId === selectedProductId &&
                (product.variantId === selectedVariantId || (!selectedVariantId && !product.variantId)),
            )?.rentalProductId ?? products[0]?.rentalProductId ?? ""
          }
        />
      </div>

      <div className="mt-10">
        <RentalTrackingWidget />
      </div>
    </div>
  );
}
