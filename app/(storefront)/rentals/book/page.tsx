import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRentableProducts } from "@/lib/data/rental-tracking";
import { RentalBookingForm } from "@/components/storefront/rental-booking-form";

export const metadata: Metadata = {
  title: "Book a Rental",
  robots: { index: false },
};

export default async function BookRentalPage({
  searchParams,
}: {
  searchParams?: { product?: string; variant?: string };
}) {
  const supabase = createClient();
  const [{ data: { user } }, products] = await Promise.all([
    supabase.auth.getUser(),
    getRentableProducts(),
  ]);

  const selectedProductId = searchParams?.product ?? null;
  const selectedVariantId = searchParams?.variant ?? null;

  // Find the selected rental product
  const selectedProduct = products.find(
    (product) =>
      product.productId === selectedProductId &&
      (selectedVariantId
        ? product.variantId === selectedVariantId
        : product.variantId === null)
  );

  if (!selectedProduct && selectedProductId) {
    notFound();
  }

  const defaultRentalProductId = selectedProduct?.rentalProductId ?? products[0]?.rentalProductId ?? "";

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link
        href="/rentals"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to rentals
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-gray-900">Book a Rental</h1>
      <p className="mt-2 text-sm text-gray-600">
        Select your rental period and submit your request for review.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        {/* Selected Product Card */}
        {selectedProduct ? (
          <div className="rounded-panel border border-surface-border bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-600">Selected rental</p>
            <h2 className="mt-3 text-lg font-semibold text-gray-900">{selectedProduct.productName}</h2>
            {selectedProduct.variantName ? (
              <p className="mt-1 text-sm text-gray-600">{selectedProduct.variantName}</p>
            ) : null}
            <div className="mt-4 space-y-1">
              {selectedProduct.dailyRate ? (
                <p className="text-lg font-bold text-slate-900">{selectedProduct.dailyRate}/day</p>
              ) : null}
              {selectedProduct.weeklyRate ? (
                <p className="text-sm text-gray-600">{selectedProduct.weeklyRate}/week</p>
              ) : null}
              {selectedProduct.monthlyRate ? (
                <p className="text-sm text-gray-600">{selectedProduct.monthlyRate}/month</p>
              ) : null}
              {!selectedProduct.dailyRate && !selectedProduct.weeklyRate && !selectedProduct.monthlyRate ? (
                <p className="text-sm text-gray-600">Pricing on request</p>
              ) : null}
              {selectedProduct.depositAmount ? (
                <p className="text-sm text-gray-600">Deposit: {selectedProduct.depositAmount}</p>
              ) : null}
            </div>
            <span className="mt-4 inline-block rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700">
              {selectedProduct.availableQuantity > 0
                ? `${selectedProduct.availableQuantity} available`
                : "Out of stock"}
            </span>
          </div>
        ) : (
          <div className="rounded-panel border border-surface-border bg-surface-muted/50 p-6 text-center">
            <p className="text-sm text-gray-600">
              No rental product selected.{" "}
              <Link href="/rentals" className="font-medium text-brand-600 hover:underline">
                Browse rentals
              </Link>
            </p>
          </div>
        )}

        {/* Booking Form */}
        <div>
          <RentalBookingForm
            products={products}
            isAuthenticated={Boolean(user)}
            defaultRentalProductId={defaultRentalProductId}
          />
        </div>
      </div>
    </div>
  );
}
