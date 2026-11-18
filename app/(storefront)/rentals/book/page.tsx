import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRentableProducts } from "@/lib/data/rental-tracking";
import { RentalBookingForm } from "@/components/storefront/rental-booking-form";
import { formatMoney } from "@/lib/format/money";

export const metadata: Metadata = {
  title: "Book a Rental",
  description: "Submit a rental request for laptops and technology equipment from Classic Computers.",
  robots: { index: false },
};

export default async function BookRentalPage({
  searchParams,
}: {
  searchParams?: { product?: string; variant?: string };
}) {
  const supabase = createClient();
  const [
    {
      data: { user },
    },
    products,
  ] = await Promise.all([supabase.auth.getUser(), getRentableProducts()]);

  const selectedProductId = searchParams?.product ?? null;
  const selectedVariantId = searchParams?.variant ?? null;

  const selectedProduct = products.find(
    (product) =>
      product.productId === selectedProductId &&
      (selectedVariantId ? product.variantId === selectedVariantId : product.variantId === null),
  );

  if (!selectedProduct && selectedProductId) {
    notFound();
  }

  const defaultRentalProductId =
    selectedProduct?.rentalProductId ?? products[0]?.rentalProductId ?? "";

  return (
    <div className="section-shell max-w-5xl py-10 sm:py-14">
      <div className="mb-8 rounded-2xl bg-navy-950 px-6 py-7 text-white shadow-elevated sm:px-8 sm:py-9">
        <Link href="/rentals" className="inline-flex items-center gap-1 text-sm font-medium text-brand-700 transition-colors hover:text-brand-900">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6" />
            <path d="M9 18h6" />
          </svg>
          Back to rentals
        </Link>
        <h1 className="mt-4 text-2xl font-extrabold text-white sm:text-3xl">Book a rental</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">
          Complete the form below to submit your rental request for review.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <RentalBookingForm
            products={products}
            isAuthenticated={Boolean(user)}
            defaultRentalProductId={defaultRentalProductId}
          />
        </div>

        {selectedProduct ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.12em] text-brand-700">
              Selected equipment
            </p>
            <h2 className="mt-3 text-lg font-semibold text-slate-900">
              {selectedProduct.productName}
            </h2>
            {selectedProduct.variantName ? (
              <p className="mt-1 text-sm text-slate-600">{selectedProduct.variantName}</p>
            ) : null}
            <div className="mt-4 space-y-1">
              {selectedProduct.dailyRate ? (
                <p className="text-sm font-semibold text-slate-900">{formatMoney(selectedProduct.dailyRate)}/day</p>
              ) : null}
              {selectedProduct.weeklyRate ? (
                <p className="text-xs text-slate-600">{formatMoney(selectedProduct.weeklyRate)}/week</p>
              ) : null}
              {selectedProduct.monthlyRate ? (
                <p className="text-xs text-slate-600">{formatMoney(selectedProduct.monthlyRate)}/month</p>
              ) : null}
              {!selectedProduct.dailyRate &&
              !selectedProduct.weeklyRate &&
              !selectedProduct.monthlyRate ? (
                <p className="text-sm text-slate-600">Pricing on request</p>
              ) : null}
              {selectedProduct.depositAmount ? (
                <p className="text-xs text-slate-600">Deposit: {formatMoney(selectedProduct.depositAmount)}</p>
              ) : null}
            </div>
            <span className={`mt-4 inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${selectedProduct.availableQuantity > 0 ? "bg-brand-100 text-brand-700" : "bg-slate-200 text-slate-600"}`}>
              {selectedProduct.availableQuantity > 0
                ? `${selectedProduct.availableQuantity} available`
                : "Out of stock"}
            </span>
          </div>
        ) : null}
      </div>
    </div>
  );
}
