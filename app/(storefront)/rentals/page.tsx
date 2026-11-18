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
    <div className="min-h-screen bg-[#f5f7f8] pb-16">
      {/* Hero Section */}
      <section className="relative isolate overflow-hidden bg-[#081827] text-white">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_82%_28%,rgba(8,145,178,0.28),transparent_42%),linear-gradient(120deg,#081827_0%,#102b42_100%)]" />
        <div className="section-shell py-14 sm:py-20 lg:py-24">
        <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-cyan-300">Equipment rental · Blantyre, Malawi</p>
        <h1 className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.04] tracking-[-0.045em] sm:text-5xl lg:text-6xl">Technology when you need it. <span className="text-cyan-300">Without buying it.</span></h1>
        <p className="mt-5 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg sm:leading-8">
          Access reliable laptops and essential technology for business, training, education and short-term projects. Find the right equipment and submit a rental request with ease.
        </p>
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
          <Link
            href="#equipment"
            className="inline-flex min-h-12 items-center justify-center rounded-xl bg-cyan-400 px-6 py-3 text-sm font-extrabold text-[#081827] shadow-lg shadow-black/15 transition-colors hover:bg-cyan-300 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-200/60"
          >
            Browse Rental Equipment
          </Link>
          <Link
            href="/rentals/book"
            className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/30 px-6 py-3 text-sm font-bold text-white transition-colors hover:border-cyan-200 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
          >
            Request a Rental
          </Link>
        </div>
        </div>
      </section>

      {/* How It Works */}
      <div className="section-shell py-14 sm:py-16">
        <h2 className="text-3xl font-semibold tracking-tight text-[#102033] sm:text-4xl">How rentals work</h2>
        <div className="mt-8 grid gap-px overflow-hidden border border-slate-200 bg-slate-200 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { step: 1, title: "Choose your equipment", description: "Browse our available laptops and technology equipment." },
            { step: 2, title: "Submit your requirements", description: "Select dates, quantity and provide rental details." },
            { step: 3, title: "Team reviews request", description: "We confirm availability and prepare your equipment." },
            { step: 4, title: "Receive confirmation", description: "Get rental arrangements and pick up your equipment." },
          ].map((item) => (
            <div key={item.step} className="flex min-h-[190px] gap-4 bg-white p-5 sm:p-6">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-cyan-50 text-sm font-bold text-cyan-800">
                {item.step}
              </div>
              <div>
                <h3 className="font-semibold text-slate-900">{item.title}</h3>
                <p className="mt-1 text-sm text-slate-600">{item.description}</p>
              </div>
            </div>
          ))}
        </div>
        <p className="mt-6 max-w-3xl border-l-2 border-cyan-500 pl-4 text-sm leading-6 text-slate-600">
          Submitting a request does not automatically guarantee equipment availability or confirm a booking. Our team will review your request and confirm availability.
        </p>
      </div>

      {/* Available Equipment */}
      <div id="equipment" className="section-shell pb-14 sm:pb-16">
        <h2 className="text-3xl font-semibold tracking-tight text-[#102033] sm:text-4xl">Available rental equipment</h2>
        {products.length > 0 ? (
          <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {products.map((product) => {
              const imageUrl = product.imagePath ? getPublicStorageUrl("product-images", product.imagePath) : null;
              return (
                <div key={`${product.productId}-${product.variantId ?? "default"}`} className="group flex flex-col overflow-hidden rounded-[1.4rem] border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-cyan-300 hover:shadow-xl">
                  <div className="relative aspect-[4/3] overflow-hidden bg-[#f0f4f6]">
                    {imageUrl ? (
                      <Image src={imageUrl} alt={product.productName} fill className="object-contain p-4 transition-transform group-hover:scale-105" sizes="(max-width: 768px) 100vw, 25vw" />
                    ) : (
                      <div className="flex h-full items-center justify-center text-sm font-medium text-slate-400">Image unavailable</div>
                    )}
                    <span className={`absolute top-3 right-3 rounded-full px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] ${product.availableQuantity > 0 ? "bg-cyan-50 text-cyan-800" : "bg-slate-200 text-slate-600"}`}>
                      {product.availableQuantity > 0 ? `${product.availableQuantity} available` : "Out of stock"}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-base font-bold leading-snug text-[#102033]">{product.productName}</h3>
                    {product.variantName ? <p className="mt-1 text-sm text-slate-600">{product.variantName}</p> : null}

                    <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                      {product.dailyRate ? <p className="text-sm font-semibold text-slate-900">{formatMoney(product.dailyRate)}/day</p> : null}
                      {product.weeklyRate ? <p className="text-xs text-slate-600">{formatMoney(product.weeklyRate)}/week</p> : null}
                      {product.monthlyRate ? <p className="text-xs text-slate-600">{formatMoney(product.monthlyRate)}/month</p> : null}
                      {!product.dailyRate && !product.weeklyRate && !product.monthlyRate ? <p className="text-sm text-slate-600">Pricing on request</p> : null}
                      {product.depositAmount ? <p className="text-xs text-slate-600">Deposit: {formatMoney(product.depositAmount)}</p> : null}
                    </div>

                    <div className="mt-4 flex gap-2">
                      {product.availableQuantity > 0 ? (
                        <Link
                          href={`/rentals/book?product=${encodeURIComponent(product.productId)}&variant=${encodeURIComponent(product.variantId ?? "")}`}
                          className="inline-flex flex-1 items-center justify-center rounded-xl bg-[#0b2238] px-4 py-3 text-sm font-bold text-white transition-colors hover:bg-cyan-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2"
                        >
                          Rent Now
                        </Link>
                      ) : (
                        <span aria-disabled="true" className="inline-flex flex-1 cursor-not-allowed items-center justify-center rounded-xl bg-slate-100 px-4 py-3 text-sm font-bold text-slate-400">
                          Unavailable
                        </span>
                      )}
                      <Link
                        href={`/product/${product.productSlug}`}
                        className="inline-flex items-center justify-center rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2"
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
          <div className="mt-8 rounded-[1.5rem] border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
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

      <div className="section-shell"><ReviewCategorySection reviewType="rental" /></div>

      {/* Tracking Widget */}
      <section className="section-shell mt-4">
        <div className="rounded-[1.5rem] border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          <RentalTrackingWidget />
        </div>
      </section>
    </div>
  );
}
