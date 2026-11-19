import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getRentableProducts } from "@/lib/data/rental-tracking";
import { RentalTrackingWidget } from "@/components/storefront/rental-tracking-widget";
import { ReviewCategorySection } from "@/components/storefront/review-category-section";
import { formatMoney } from "@/lib/format/money";
import { getPublicStorageUrl } from "@/lib/storage";
import { getSiteMedia } from "@/lib/data/site-media";

export const metadata: Metadata = {
  title: "Laptop & Equipment Rentals",
  description:
    "Request laptop and technology equipment rentals from Classic Computers in Blantyre. Browse available equipment, compare rental rates and submit your requirements.",
};

const rentalSteps = [
  {
    number: "01",
    title: "Choose equipment",
    description: "Browse the equipment currently listed for rental and compare the available rates.",
  },
  {
    number: "02",
    title: "Set your dates",
    description: "Tell us when you need the equipment and how many units your work requires.",
  },
  {
    number: "03",
    title: "Send your request",
    description: "Share your contact details and any setup or usage requirements.",
  },
  {
    number: "04",
    title: "Confirm with our team",
    description: "We review availability and contact you to agree on the rental details.",
  },
];

const rentalFaqs = [
  {
    question: "Is my rental confirmed once I submit the form?",
    answer:
      "No. Your submission is a request, not a confirmed booking. Our team checks the dates and equipment requirements, then contacts you to confirm availability and the next steps.",
  },
  {
    question: "How is the rental price calculated?",
    answer:
      "Where published, daily, weekly and monthly rates are shown on each equipment listing. A deposit or other arrangements are discussed with you before the rental is confirmed.",
  },
  {
    question: "Can I request more than one device?",
    answer:
      "Yes. Select the quantity you need in the request form. The team will confirm whether the requested quantity is available for your dates.",
  },
  {
    question: "What if I need equipment for a longer project?",
    answer:
      "Include the dates and project details in your request. You can also add special requirements so the team understands how you plan to use the equipment.",
  },
];

export default async function RentalsPage() {
  const [products, rentalMedia] = await Promise.all([
    getRentableProducts(),
    getSiteMedia("rental_promo", 1),
  ]);
  const rentalPromo = rentalMedia[0] ?? null;
  const rentalPromoUrl = rentalPromo
    ? getPublicStorageUrl("site-media", rentalPromo.storage_path)
    : null;

  return (
    <main className="min-h-screen bg-white pb-16">
      <section aria-labelledby="rentals-heading" className="overflow-hidden border-b border-slate-200 bg-[#f3f7fa] text-[#10243a]">
        <div className={`section-shell grid items-center gap-10 py-12 sm:py-16 lg:py-20 ${rentalPromoUrl ? "lg:grid-cols-[1.02fr_0.98fr] lg:gap-14" : ""}`}>
          <div className="max-w-3xl">
            <p className="text-xs font-bold uppercase tracking-[0.2em] text-brand-700">Equipment rental · Blantyre, Malawi</p>
            <h1 id="rentals-heading" className="mt-5 max-w-3xl text-4xl font-semibold leading-[1.06] tracking-[-0.045em] text-[#10243a] sm:text-5xl lg:text-6xl">
              The right technology for the work ahead.
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg sm:leading-8">
              Get access to laptops and technology equipment for business, training, education and short-term projects. Browse the listed equipment, request the dates you need and let our team help with the arrangements.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link href="#equipment" className="inline-flex min-h-12 items-center justify-center rounded-xl bg-[#123653] px-6 py-3 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-200">
                Browse equipment
              </Link>
              <Link href="/rentals/book" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-bold text-slate-700 transition-colors hover:border-brand-300 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                Start a rental request
              </Link>
            </div>
            <p className="mt-4 text-xs leading-5 text-slate-500">No booking is confirmed until our team has reviewed and confirmed your request.</p>
          </div>
          {rentalPromoUrl ? (
            <div className="relative aspect-[5/4] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
              <Image
                src={rentalPromoUrl}
                alt={rentalPromo?.alt_text ?? "Technology equipment available from Classic Computers"}
                fill
                priority
                sizes="(max-width: 1023px) 100vw, 44vw"
                className="object-cover"
              />
              {rentalPromo?.title ? (
                <p className="absolute bottom-4 left-4 rounded-lg border border-slate-200 bg-white/95 px-4 py-2 text-xs font-bold text-slate-700 shadow-sm">
                  {rentalPromo.title}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      <section aria-labelledby="rental-process-heading" className="border-b border-slate-200 bg-white">
        <div className="section-shell py-12 sm:py-16">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">A clear process</p>
            <h2 id="rental-process-heading" className="mt-3 text-3xl font-semibold tracking-tight text-[#102033] sm:text-4xl">From request to ready-to-use equipment.</h2>
            <p className="mt-4 text-base leading-7 text-slate-600">Tell us what you need and when you need it. We will review your request and follow up with the details.</p>
          </div>
          <ol className="mt-9 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {rentalSteps.map((step) => (
              <li key={step.number} className="rounded-xl border border-slate-200 bg-[#fbfcfd] p-5 sm:p-6">
                <span className="text-xs font-bold tracking-[0.16em] text-brand-700">{step.number}</span>
                <h3 className="mt-4 text-base font-semibold text-slate-950">{step.title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section id="equipment" aria-labelledby="equipment-heading" className="scroll-mt-24 bg-[#f7f9fa]">
        <div className="section-shell py-12 sm:py-16">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">Rental catalogue</p>
              <h2 id="equipment-heading" className="mt-3 text-3xl font-semibold tracking-tight text-[#102033] sm:text-4xl">Equipment available to request.</h2>
              <p className="mt-3 text-sm leading-6 text-slate-600 sm:text-base">Availability and rates are displayed from the current rental listings. Final availability is confirmed by our team.</p>
            </div>
            <Link href="/rentals/book" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-brand-300 hover:text-brand-800">
              Request equipment
            </Link>
          </div>

          {products.length > 0 ? (
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => {
                const imageUrl = product.imagePath ? getPublicStorageUrl("product-images", product.imagePath) : null;
                return (
                  <article key={`${product.productId}-${product.variantId ?? "default"}`} className="group flex min-w-0 flex-col overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition duration-200 hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md">
                    <Link href={`/product/${product.productSlug}`} className="relative block aspect-[4/3] overflow-hidden bg-[#eef2f4]" aria-label={`View details for ${product.productName}`}>
                      {imageUrl ? (
                        <Image src={imageUrl} alt={product.productName} fill sizes="(max-width: 768px) 100vw, 25vw" className="object-contain p-5 transition-transform duration-300 group-hover:scale-[1.03]" />
                      ) : (
                        <div className="flex h-full items-center justify-center text-sm text-slate-400">Product image unavailable</div>
                      )}
                      <span className="absolute left-3 top-3 rounded-full border border-slate-200 bg-white/95 px-3 py-1 text-[11px] font-semibold text-slate-700">
                        {product.availableQuantity} {product.availableQuantity === 1 ? "unit" : "units"} listed
                      </span>
                    </Link>
                    <div className="flex flex-1 flex-col p-5">
                      <div>
                        <h3 className="text-base font-semibold leading-snug text-[#102033]">{product.productName}</h3>
                        {product.variantName ? <p className="mt-1 text-sm text-slate-500">{product.variantName}</p> : null}
                      </div>
                      <div className="mt-4 space-y-2 border-t border-slate-100 pt-4">
                        {product.dailyRate ? <p className="text-sm font-semibold text-slate-900">{formatMoney(product.dailyRate)} <span className="font-normal text-slate-500">/ day</span></p> : null}
                        {product.weeklyRate ? <p className="text-sm text-slate-600">{formatMoney(product.weeklyRate)} <span className="text-slate-500">/ week</span></p> : null}
                        {product.monthlyRate ? <p className="text-sm text-slate-600">{formatMoney(product.monthlyRate)} <span className="text-slate-500">/ month</span></p> : null}
                        {!product.dailyRate && !product.weeklyRate && !product.monthlyRate ? <p className="text-sm text-slate-600">Pricing confirmed on request</p> : null}
                        {product.depositAmount ? <p className="border-t border-slate-100 pt-2 text-xs text-slate-500">Deposit: {formatMoney(product.depositAmount)}</p> : null}
                      </div>
                      <div className="mt-5 flex gap-2">
                        <Link href={`/rentals/book?product=${encodeURIComponent(product.productId)}&variant=${encodeURIComponent(product.variantId ?? "")}`} className="inline-flex min-h-11 flex-1 items-center justify-center rounded-lg bg-[#123653] px-3 py-2.5 text-sm font-bold text-white transition-colors hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
                          Request rental
                        </Link>
                        <Link href={`/product/${product.productSlug}`} className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-200 px-3 py-2.5 text-sm font-semibold text-slate-700 transition-colors hover:border-brand-300 hover:bg-brand-50">
                          Details
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center">
              <div aria-hidden="true" className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-brand-700">
                <svg viewBox="0 0 24 24" fill="none" className="h-7 w-7" stroke="currentColor" strokeWidth="1.6">
                  <rect x="3" y="4" width="18" height="13" rx="2" />
                  <path d="M8 21h8M12 17v4" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900">No equipment is listed right now</h3>
              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">Contact our team with your requirements. We will let you know whether suitable equipment is available.</p>
              <Link href="/contact" className="mt-5 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#123653] px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-800">Contact the team</Link>
            </div>
          )}
        </div>
      </section>

      <section aria-labelledby="prepare-heading" className="border-y border-slate-200 bg-white">
        <div className="section-shell grid gap-8 py-12 sm:py-16 lg:grid-cols-[0.9fr_1.1fr] lg:gap-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">Before you submit</p>
            <h2 id="prepare-heading" className="mt-3 text-3xl font-semibold tracking-tight text-[#102033] sm:text-4xl">A few details help us prepare.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">Have the basic information ready so our team can assess your request and get back to you with relevant options.</p>
            <Link href="/rentals/book" className="mt-6 inline-flex min-h-11 items-center justify-center rounded-xl bg-[#123653] px-5 py-3 text-sm font-bold text-white hover:bg-brand-800">Start your request</Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {[
              ["Equipment", "The laptop or equipment type, model or quantity you need."],
              ["Rental dates", "Your preferred collection date and the date you expect to return the equipment."],
              ["Your contact details", "A name and phone number so the team can reach you. Email is optional for guest requests."],
              ["How you will use it", "Your project, training, business or study requirements, including any setup needs."],
            ].map(([title, description], index) => (
              <div key={title} className="rounded-xl border border-slate-200 bg-[#fbfcfd] p-5">
                <span className="text-xs font-bold text-brand-700">0{index + 1}</span>
                <h3 className="mt-3 text-base font-semibold text-slate-950">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section aria-labelledby="rental-faq-heading" className="bg-[#f7f9fa]">
        <div className="section-shell grid gap-8 py-12 sm:py-16 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">Good to know</p>
            <h2 id="rental-faq-heading" className="mt-3 text-3xl font-semibold tracking-tight text-[#102033] sm:text-4xl">Rental questions, answered.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">Need more information before requesting equipment? Contact the team and explain what you need.</p>
            <Link href="/contact" className="mt-5 inline-flex items-center text-sm font-bold text-brand-800 underline decoration-brand-300 underline-offset-4 hover:text-brand-950">Contact Classic Computers</Link>
          </div>
          <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white px-5 sm:px-7">
            {rentalFaqs.map((faq) => (
              <details key={faq.question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-sm font-semibold text-slate-900 marker:content-none">
                  {faq.question}
                  <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg font-normal text-slate-600 transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="mt-3 max-w-2xl pr-8 text-sm leading-6 text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell mt-12">
        <div className="rounded-2xl bg-[#102f49] px-6 py-8 text-white sm:px-9 sm:py-10 lg:flex lg:items-center lg:justify-between lg:gap-8">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">Need an update?</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">Track your rental request.</h2>
            <p className="mt-2 text-sm leading-6 text-slate-200">Use the tracking code provided after submitting a guest request. Customers with an account can also view rental requests from their account.</p>
          </div>
          <div className="mt-6 w-full max-w-md rounded-xl bg-white p-4 text-slate-900 lg:mt-0">
            <RentalTrackingWidget />
          </div>
        </div>
      </section>

      <div className="section-shell mt-12">
        <ReviewCategorySection reviewType="rental" />
      </div>
    </main>
  );
}
