import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getRentableProducts } from "@/lib/data/rental-tracking";
import { RentalBookingForm } from "@/components/storefront/rental-booking-form";
import { formatMoney } from "@/lib/format/money";

export const metadata: Metadata = {
  title: "Request Equipment Rental",
  description: "Tell Classic Computers which equipment you need and when you need it. Submit a rental request for review.",
  robots: { index: false },
};

export default async function BookRentalPage({
  searchParams,
}: {
  searchParams?: { product?: string; variant?: string };
}) {
  const supabase = createClient();
  const [
    { data: { user } },
    products,
  ] = await Promise.all([supabase.auth.getUser(), getRentableProducts()]);

  const selectedProductId = searchParams?.product ?? null;
  const selectedVariantId = searchParams?.variant ?? null;
  const selectedProduct = products.find(
    (product) =>
      product.productId === selectedProductId &&
      (selectedVariantId ? product.variantId === selectedVariantId : product.variantId === null),
  );

  if (!selectedProduct && selectedProductId) notFound();

  const defaultRentalProductId = selectedProduct?.rentalProductId ?? products[0]?.rentalProductId ?? "";

  return (
    <main className="min-h-screen bg-[#f5f7f8]">
      <div className="section-shell max-w-6xl py-8 sm:py-12">
        <Link href="/rentals" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-800 transition-colors hover:text-brand-950">
          <span aria-hidden="true">←</span> Back to equipment rentals
        </Link>

        <div className="mt-6 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Rental request</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#10243a] sm:text-4xl">Tell us what you need.</h1>
          <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
            Choose your equipment, select your dates and send your details. You can submit a request as a guest or while signed in.
          </p>
        </div>

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_340px] lg:gap-8">
          <section aria-label="Rental request form" className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-7">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-950">Your rental details</h2>
                <p className="mt-1 text-sm text-slate-500">Fields are shown as you move through the request.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                {user ? "Signed in" : "Guest request"}
              </span>
            </div>
            <RentalBookingForm
              products={products}
              isAuthenticated={Boolean(user)}
              defaultRentalProductId={defaultRentalProductId}
            />
          </section>

          <aside className="space-y-5 lg:sticky lg:top-24">
            {selectedProduct ? (
              <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
                <div className="border-b border-slate-100 bg-[#f7f9fa] px-5 py-4">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-700">Selected equipment</p>
                </div>
                <div className="p-5">
                  <h2 className="text-lg font-semibold leading-snug text-slate-950">{selectedProduct.productName}</h2>
                  {selectedProduct.variantName ? <p className="mt-1 text-sm text-slate-600">{selectedProduct.variantName}</p> : null}
                  <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                    {selectedProduct.dailyRate ? <p className="text-sm font-semibold text-slate-900">{formatMoney(selectedProduct.dailyRate)} <span className="font-normal text-slate-500">/ day</span></p> : null}
                    {selectedProduct.weeklyRate ? <p className="text-sm text-slate-600">{formatMoney(selectedProduct.weeklyRate)} / week</p> : null}
                    {selectedProduct.monthlyRate ? <p className="text-sm text-slate-600">{formatMoney(selectedProduct.monthlyRate)} / month</p> : null}
                    {!selectedProduct.dailyRate && !selectedProduct.weeklyRate && !selectedProduct.monthlyRate ? <p className="text-sm text-slate-600">Pricing confirmed on request</p> : null}
                    {selectedProduct.depositAmount ? <p className="border-t border-slate-100 pt-2 text-xs text-slate-500">Listed deposit: {formatMoney(selectedProduct.depositAmount)}</p> : null}
                  </div>
                  <p className="mt-4 rounded-lg bg-brand-50 px-3 py-2 text-xs leading-5 text-brand-900">
                    {selectedProduct.availableQuantity} {selectedProduct.availableQuantity === 1 ? "unit is" : "units are"} currently listed as available. Dates and final quantities are confirmed by our team.
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <p className="text-sm font-semibold text-slate-900">Choose equipment first</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">Select an item in the request form. Its current rates and listing information will appear here when you start from an equipment card.</p>
              </div>
            )}

            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-semibold text-slate-950">What happens next?</h2>
              <ol className="mt-4 space-y-4">
                {[
                  ["Request received", "Your details are sent to the Classic Computers team."],
                  ["Availability review", "The team checks the requested dates and quantity."],
                  ["Follow-up", "We contact you to discuss confirmation and arrangements."],
                ].map(([title, description], index) => (
                  <li key={title} className="flex gap-3">
                    <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-bold text-brand-800">{index + 1}</span>
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{title}</p>
                      <p className="mt-1 text-xs leading-5 text-slate-600">{description}</p>
                    </div>
                  </li>
                ))}
              </ol>
              <p className="mt-5 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500">Submitting this form does not reserve equipment or confirm a booking.</p>
            </div>

            <div className="rounded-2xl bg-[#102f49] p-5 text-white">
              <h2 className="text-base font-semibold">Need help choosing?</h2>
              <p className="mt-2 text-sm leading-6 text-slate-200">Contact the team if you are unsure which equipment suits your project or training needs.</p>
              <Link href="/contact" className="mt-4 inline-flex items-center text-sm font-bold text-cyan-200 underline decoration-cyan-200/50 underline-offset-4 hover:text-white">Contact Classic Computers</Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
