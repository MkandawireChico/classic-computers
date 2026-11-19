import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getSiteMedia } from "@/lib/data/site-media";
import { getPublicStorageUrl } from "@/lib/storage";
import { ReviewCategorySection } from "@/components/storefront/review-category-section";

export const metadata: Metadata = {
  title: "Computer Repairs",
  description: "Professional computer and device repair services from Classic Computers LLC in Blantyre.",
};

export default async function RepairsPage() {
  const heroMedia = await getSiteMedia("store_photo", 1);
  const heroImage = heroMedia[0] ?? null;
  const heroImageUrl = heroImage ? getPublicStorageUrl("site-media", heroImage.storage_path) : null;

  return (
    <main>
      {/* Hero Section */}
      <section aria-labelledby="repairs-heading" className="border-b border-slate-200 bg-[#f4f7f9] text-[#10243a]">
        
        <div className="section-shell grid items-center gap-8 py-8 sm:gap-10 sm:py-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:py-16">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700 sm:text-sm">
              CLASSIC COMPUTERS REPAIR SERVICES
            </p>
            <h1 id="repairs-heading" className="mt-3 max-w-xl text-balance text-4xl font-extrabold leading-[1.06] text-[#10243a] sm:mt-4 sm:text-5xl lg:text-6xl">
              Your device deserves a second chance.
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-600 sm:mt-5 sm:text-lg sm:leading-8">
              Laptop or desktop giving you trouble? Bring it to Classic Computers. Tell us what's happening and let our team assess how we can help get your device working again.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:mt-7 sm:flex-row sm:items-center">
              <Link
                href="/repairs/book"
                className="inline-flex min-h-13 items-center justify-center gap-2 rounded-xl bg-[#123653] px-6 py-3.5 text-base font-bold text-white shadow-sm transition-colors hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                Request a repair
              </Link>
              <Link
                href="/repairs/track"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-700 transition-colors hover:border-brand-300 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
              >
                Track a repair
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            {heroImageUrl ? (
              <Image
                src={heroImageUrl}
                alt={heroImage?.alt_text ?? heroImage?.title ?? "Classic Computers store in Blantyre"}
                width={960}
                height={720}
                priority
                sizes="(max-width: 1023px) 100vw, 45vw"
                className="aspect-[16/8] w-full object-cover sm:aspect-[16/9] lg:aspect-[5/4]"
              />
            ) : (
              <div aria-hidden="true" className="flex aspect-[16/8] items-center justify-center bg-slate-100 text-brand-700 sm:aspect-[16/9] lg:aspect-[5/4]">
                <svg viewBox="0 0 72 56" fill="none" className="h-20 w-24">
                  <rect x="9" y="4" width="54" height="38" rx="3" stroke="currentColor" strokeWidth="2.5" />
                  <path d="M3 51h66l-6-9H9l-6 9ZM29 51h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section aria-labelledby="how-it-works-heading" className="border-b border-slate-200 bg-white">
        <div className="section-shell py-11 sm:py-14 lg:py-16">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-800">Simple process</p>
            <h2 id="how-it-works-heading" className="mt-2 text-2xl font-extrabold leading-tight text-slate-950 sm:text-3xl">
              How the repair process works
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-600">
              Getting your device repaired is straightforward. Submit your request, our team reviews it, and we follow up with next steps.
            </p>
          </div>

          <ol className="mt-7 grid gap-3 md:mt-9 md:grid-cols-2 lg:grid-cols-4">
            <li className="flex gap-4 rounded-lg border border-slate-200 bg-white p-4 sm:p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-800">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-6 w-6">
                  <path d="M8 4h8l4 4v12H4V4h4Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
                  <path d="M8 12h8M8 16h5M15 4v5h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-800">Step 01</p>
                <h3 className="mt-1 text-base font-bold text-slate-950">Tell us about the problem</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">Select your device and explain what's happening.</p>
              </div>
            </li>
            <li className="flex gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-800">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-6 w-6">
                  <path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-800">Step 02</p>
                <h3 className="mt-1 text-base font-bold text-slate-950">Submit your repair request</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">Provide your contact information and review your submission.</p>
              </div>
            </li>
            <li className="flex gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-800">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-6 w-6">
                  <path d="m12 3 2.4 1.4 2.8.2.9 2.6 1.9 2.1-.9 2.7.3 2.8-2.4 1.5-1.6 2.3-2.8-.5-2.7.5-1.7-2.3-2.3-1.5.2-2.8-.9-2.7 1.9-2.1.9-2.6 2.8-.2L12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-800">Step 03</p>
                <h3 className="mt-1 text-base font-bold text-slate-950">Device assessment</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">Our team reviews the request and follows up regarding next steps.</p>
              </div>
            </li>
            <li className="flex gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-6 w-6">
                  <path d="M3 4h2l2.2 11.1a2 2 0 0 0 2 1.6h8.5a2 2 0 0 0 2-1.6L21 8H6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  <circle cx="10" cy="20" r="1" fill="currentColor" />
                  <circle cx="18" cy="20" r="1" fill="currentColor" />
                </svg>
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-600">Step 04</p>
                <h3 className="mt-1 text-base font-bold text-slate-950">Track your repair</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">Use your customer account or tracking code to follow available repair updates.</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      {/* Services We Support */}
      <section aria-labelledby="services-heading" className="bg-slate-50">
        <div className="section-shell py-11 sm:py-14 lg:py-16">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-800">What we repair</p>
            <h2 id="services-heading" className="mt-2 text-2xl font-extrabold leading-tight text-slate-950 sm:text-3xl">
              Devices and issues we can help with
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-600">
              We handle a range of computer devices and common problems. Submit your device details and our team will assess how we can assist.
            </p>
          </div>

          <div className="mt-7 grid gap-4 sm:mt-9 sm:grid-cols-2 lg:grid-cols-3">
            <Link
              href="/repairs/book"
              className="group flex gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 transition-colors group-hover:bg-cyan-100 group-hover:text-brand-800">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-6 w-6">
                  <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="1.7" />
                  <path d="M2 17h20" stroke="currentColor" strokeWidth="1.7" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-800">Laptop repairs</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">Screen issues, keyboard problems, power failures and more.</p>
              </div>
            </Link>

            <Link
              href="/repairs/book"
              className="group flex gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 transition-colors group-hover:bg-cyan-100 group-hover:text-brand-800">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-6 w-6">
                  <rect x="4" y="2" width="16" height="20" rx="2" stroke="currentColor" strokeWidth="1.7" />
                  <path d="M8 6h8M8 10h8M8 14h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-800">Desktop computer repairs</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">Tower units, all-in-one systems and custom builds.</p>
              </div>
            </Link>

            <Link
              href="/repairs/book"
              className="group flex gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 transition-colors group-hover:bg-cyan-100 group-hover:text-brand-800">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-6 w-6">
                  <path d="M12 2v20M2 12h20" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-800">Hardware problems</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">Component failures, upgrades and replacements.</p>
              </div>
            </Link>

            <Link
              href="/repairs/book"
              className="group flex gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 transition-colors group-hover:bg-cyan-100 group-hover:text-brand-800">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-6 w-6">
                  <path d="M18 8h1a4 4 0 0 1 0 8h-1M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8Z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-800">Charging and power</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">Battery issues, charging port problems and power failures.</p>
              </div>
            </Link>

            <Link
              href="/repairs/book"
              className="group flex gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 transition-colors group-hover:bg-cyan-100 group-hover:text-brand-800">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-6 w-6">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2Z" stroke="currentColor" strokeWidth="1.7" />
                  <path d="M9 9h6M9 12h6M9 15h4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-800">Software and operating systems</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">OS issues, software conflicts and performance problems.</p>
              </div>
            </Link>

            <Link
              href="/repairs/book"
              className="group flex gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-slate-300 hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-700 transition-colors group-hover:bg-cyan-100 group-hover:text-brand-800">
                <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-6 w-6">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.7" />
                  <path d="M12 6v6l4 2" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900 group-hover:text-brand-800">Performance issues</h3>
                <p className="mt-1 text-sm leading-6 text-slate-600">Slow startup, freezing and general performance problems.</p>
              </div>
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="repair-faq-heading" className="border-y border-slate-200 bg-[#f7f9fa]">
        <div className="section-shell grid gap-8 py-11 sm:py-14 lg:grid-cols-[0.7fr_1.3fr] lg:gap-16">
          <div>
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">Before you book</p>
            <h2 id="repair-faq-heading" className="mt-2 text-2xl font-extrabold leading-tight text-[#10243a] sm:text-3xl">Repair questions, answered.</h2>
            <p className="mt-3 text-sm leading-6 text-slate-600">Here are a few things to know before sending a repair request.</p>
            <Link href="/contact" className="mt-5 inline-flex text-sm font-bold text-brand-800 underline decoration-brand-300 underline-offset-4 hover:text-brand-950">Ask our team</Link>
          </div>
          <div className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white px-5 sm:px-7">
            <details className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-sm font-semibold text-slate-900 marker:content-none">
                Do I need an account to request a repair?
                <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg font-normal text-slate-600 transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 pr-8 text-sm leading-6 text-slate-600">No. You can submit as a guest with your name and phone number, or sign in and view your requests from your account.</p>
            </details>
            <details className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-sm font-semibold text-slate-900 marker:content-none">
                Does submitting a request confirm the repair price?
                <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg font-normal text-slate-600 transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 pr-8 text-sm leading-6 text-slate-600">No. The request gives our team the details needed to follow up. Diagnosis, any estimate and approval are discussed with you before repair work proceeds.</p>
            </details>
            <details className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-sm font-semibold text-slate-900 marker:content-none">
                What should I include with my device?
                <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg font-normal text-slate-600 transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 pr-8 text-sm leading-6 text-slate-600">Describe the fault and list any charger, cable or accessory you plan to leave with the device. Our team will advise you if anything else is needed.</p>
            </details>
            <details className="group py-5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-left text-sm font-semibold text-slate-900 marker:content-none">
                How do I follow repair progress?
                <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-slate-100 text-lg font-normal text-slate-600 transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 pr-8 text-sm leading-6 text-slate-600">Signed-in customers can open My Repairs. Guest customers need the repair reference and private tracking code shown after submission.</p>
            </details>
          </div>
        </div>
      </section>

      <ReviewCategorySection reviewType="repair" />

      {/* Tracking CTA */}
      <section aria-labelledby="tracking-heading" className="border-y border-slate-200 bg-white">
        <div className="section-shell py-11 sm:py-14 lg:py-16">
          <div className="mx-auto max-w-2xl text-center">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-800">Already submitted a repair?</p>
            <h2 id="tracking-heading" className="mt-2 text-2xl font-extrabold leading-tight text-slate-950 sm:text-3xl">
              Keep track of your device's repair progress
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-600">
              Use your repair reference and tracking code to check the latest available update on your device.
            </p>
            <Link
              href="/repairs/track"
              className="mt-6 inline-flex min-h-13 items-center justify-center gap-2 rounded-xl bg-[#123653] px-8 py-3.5 text-base font-bold text-white transition-colors hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-cyan-300/60"
            >
              Track my repair
            </Link>
          </div>
        </div>
      </section>

      <section aria-labelledby="repair-help-heading" className="border-t border-slate-200 bg-[#f4f7f9]">
        <div className="section-shell flex flex-col gap-5 py-10 sm:flex-row sm:items-center sm:justify-between sm:py-12">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">Need help before booking?</p>
            <h2 id="repair-help-heading" className="mt-2 text-2xl font-extrabold tracking-tight text-[#10243a]">Tell us what your device is doing.</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">Contact our team if you are unsure which repair option to choose.</p>
          </div>
          <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
            <Link href="/repairs/book" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#123653] px-5 text-sm font-bold text-white hover:bg-brand-800">Request a repair</Link>
            <Link href="/contact" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 text-sm font-bold text-[#17344d] hover:border-brand-300 hover:bg-brand-50">Contact us</Link>
          </div>
        </div>
      </section>
    </main>
  );
}
