import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { getRentableProducts } from "@/lib/data/rental-tracking";
import { RentalTrackingWidget } from "@/components/storefront/rental-tracking-widget";
import { ReviewCategorySection } from "@/components/storefront/review-category-section";
import { formatMoney } from "@/lib/format/money";
import { getPublicStorageUrl } from "@/lib/storage";

export const metadata: Metadata = {
  title: "Laptop Rentals",
  description: "Rent laptops and technology equipment from Classic Computers in Blantyre. Flexible rental periods for business, training and projects.",
};

export default async function RentalsPage() {
  const supabase = createClient();
  const [, products] = await Promise.all([supabase.auth.getUser(), getRentableProducts()]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Hero Section */}
      <div className="mb-12 rounded-2xl bg-gradient-to-br from-violet-600 to-violet-800 p-8 text-white sm:p-12">
        <h1 className="text-3xl font-extrabold sm:text-4xl lg:text-5xl">Get the technology you need. Rent with confidence.</h1>
        <p className="mt-4 max-w-2xl text-base text-violet-100 sm:text-lg">
          Access reliable laptops and essential technology for business, training, education and short-term projects. Find the right equipment and submit a rental request with ease.
        </p>
        <div className="mt-8 flex flex-wrap gap-3 sm:gap-4">
          <Link
            href="#equipment"
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-white px-6 py-3 text-sm font-bold text-violet-900 shadow-lg shadow-black/15 transition-colors hover:bg-violet-50 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60"
          >
            Browse Rental Equipment
          </Link>
          <Link
            href="/rentals/book"
            className="inline-flex min-h-12 items-center justify-center rounded-xl border-2 border-white px-6 py-3 text-sm font-bold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/60"
          >
            Request a Rental
          </Link>
        </div>
      </div>

      {/* How It Works */}
      <div className="mb-16">
        <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">How rentals work</h2>
        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { step: 1, title: "Choose your equipment", description: "Browse our available laptops and technology equipment." },
            { step: 2, title: "Submit your requirements", description: "Select dates, quantity and provide rental details." },
            { step: 3, title: "Team reviews request", description: "We confirm availability and prepare your equipment." },
            { step: 4, title: "Receive confirmation", description: "Get rental arrangements and pick up your equipment." },
          ].map((item) => (
            <div key={item.step} className="flex gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-violet-100 text-sm font-bold text-violet-700">
                {item.step}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-6 text-sm text-slate-600">
          Submitting a request does not automatically guarantee equipment availability or confirm a booking. Our team will review your request and confirm availability.
        </p>
      </div>

      {/* Available Equipment */}
      <div id="equipment" className="mb-16">
        <h2 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Available rental equipment</h2>
        {products.length > 0 ? (
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => {
              const imageUrl = product.imagePath ? getPublicStorageUrl("product-images", product.imagePath) : null;
              return (
                <div key={`${product.productId}-${product.variantId ?? "default"}`} className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all hover:border-violet-300 hover:shadow-md">
                  <div className="relative aspect-[4/3] overflow-hidden bg-slate-100">
                    {imageUrl ? (
                      <Image src={imageUrl} alt={product.productName} fill className="object-contain p-4 transition-transform group-hover:scale-105" sizes="(max-width: 768px) 100vw, 25vw" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm font-medium text-slate-400">Image unavailable</div>
                    )}
                    <span className={`absolute top-3 right-3 rounded-full px-2.5 py-1 text-xs font-semibold ${product.availableQuantity > 0 ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-600"}`}>
                      {product.availableQuantity > 0 ? `${product.availableQuantity} available` : "Out of stock"}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-4">
                    <h3 className="text-base font-bold text-slate-900">{product.productName}</h3>
                    {product.variantName ? <p className="mt-1 text-sm text-slate-600">{product.variantName}</p> : null}

                    <div className="mt-3 space-y-1">
                      {product.dailyRate ? <p className="text-sm font-semibold text-slate-900">{formatMoney(product.dailyRate)}/day</p> : null}
                      {product.weeklyRate ? <p className="text-xs text-slate-600">{formatMoney(product.weeklyRate)}/week</p> : null}
                      {product.monthlyRate ? <p className="text-xs text-slate-600">{formatMoney(product.monthlyRate)}/month</p> : null}
                      {!product.dailyRate && !product.weeklyRate && !product.monthlyRate ? <p className="text-sm text-slate-600">Pricing on request</p> : null}
                      {product.depositAmount ? <p className="text-xs text-slate-600">Deposit: {formatMoney(product.depositAmount)}</p> : null}
                    </div>

                    <div className="mt-4 flex gap-2">
                      <Link
                        href={`/rentals/book?product=${encodeURIComponent(product.productId)}&variant=${encodeURIComponent(product.variantId ?? "")}`}
                        className={`inline-flex flex-1 items-center justify-center rounded-xl px-4 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 ${
                          product.availableQuantity > 0
                            ? "bg-violet-600 text-white hover:bg-violet-700"
                            : "bg-slate-200 text-slate-500 cursor-not-allowed"
                        }`}
                        aria-disabled={product.availableQuantity <= 0}
                      >
                        Rent Now
                      </Link>
                      <Link
                        href={`/product/${product.productSlug}`}
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
                      >
                        Details
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
            <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 mx-auto text-slate-300">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
            <h3 className="text-lg font-semibold text-slate-900">No rentals available</h3>
            <p className="mt-2 text-sm text-slate-600">Check back later or contact us for rental availability.</p>
          </div>
        )}
      </div>

      <ReviewCategorySection reviewType="rental" />

      {/* Tracking Widget */}
      <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
        <RentalTrackingWidget />
      </div>
    </div>
  );
}
