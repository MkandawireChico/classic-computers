import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getMyStudentVerification } from "@/lib/data/account-student";
import { getActiveStudentDiscounts } from "@/lib/data/student-deals";
import { getSiteMedia } from "@/lib/data/site-media";
import { getBusinessInfo } from "@/lib/data/site-settings";
import { getPublicStorageUrl } from "@/lib/storage";
import { ProductEnquiry } from "@/components/product/product-enquiry";
import { Badge } from "@/components/ui/badge";
import { StudentDealsRetryButton } from "@/components/storefront/student-deals-retry-button";
import { formatMoney } from "@/lib/format/money";

export const metadata: Metadata = {
  title: "Student Deals",
  description: "Explore eligible student technology offers from Classic Computers in Blantyre.",
};

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-MW", {
    timeZone: "Africa/Blantyre",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function StepIcon({ kind }: { kind: "apply" | "review" | "shop" }) {
  if (kind === "apply") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-6 w-6">
        <path d="M8 4h8l4 4v12H4V4h4Z" stroke="currentColor" strokeWidth="1.7" strokeLinejoin="round" />
        <path d="M8 12h8M8 16h5M15 4v5h5" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  if (kind === "review") {
    return (
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-6 w-6">
        <path d="m12 3 2.4 1.4 2.8.2.9 2.6 1.9 2.1-.9 2.7.3 2.8-2.4 1.5-1.6 2.3-2.8-.5-2.7.5-1.7-2.3-2.3-1.5.2-2.8-.9-2.7 1.9-2.1.9-2.6 2.8-.2L12 3Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
        <path d="m9 12 2 2 4-4" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" className="h-6 w-6">
      <path d="M3 4h2l2.2 11.1a2 2 0 0 0 2 1.6h8.5a2 2 0 0 0 2-1.6L21 8H6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="10" cy="20" r="1" fill="currentColor" />
      <circle cx="18" cy="20" r="1" fill="currentColor" />
    </svg>
  );
}

export default async function StudentDealsPage() {
  const [user, discountResult, businessInfo, heroMedia] = await Promise.all([
    getCurrentUser(),
    getActiveStudentDiscounts(),
    getBusinessInfo(),
    getSiteMedia("homepage_hero", 1),
  ]);
  const verification = user ? await getMyStudentVerification() : null;
  const status = verification?.status ?? "none";
  const heroImage = heroMedia[0] ?? null;
  const heroImageUrl = heroImage ? getPublicStorageUrl("site-media", heroImage.storage_path) : null;
  const verificationPath = "/account/student-verification";
  const signUpPath = `/sign-up?redirectTo=${encodeURIComponent(verificationPath)}`;
  const signInPath = `/sign-in?redirectTo=${encodeURIComponent(verificationPath)}`;
  const statusLabels: Record<string, string> = {
    none: "Not submitted",
    pending: "Pending review",
    approved: "Approved",
    rejected: "Needs resubmission",
    expired: "Expired",
  };
  const statusVariants: Record<string, "neutral" | "success" | "warning" | "danger"> = {
    none: "neutral",
    pending: "warning",
    approved: "success",
    rejected: "danger",
    expired: "neutral",
  };

  return (
    <main>
      <section aria-labelledby="student-deals-heading" className="relative isolate overflow-hidden bg-[#081827] text-white">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_82%_28%,rgba(8,145,178,0.24),transparent_42%)]" />
        <div className="section-shell grid items-center gap-8 py-8 sm:gap-10 sm:py-12 lg:grid-cols-[1.05fr_0.95fr] lg:gap-14 lg:py-16">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-cyan-200 sm:text-sm">
              Classic Computers Student Deals
            </p>
            <h1 id="student-deals-heading" className="mt-3 max-w-xl text-balance text-4xl font-extrabold leading-[1.06] text-white sm:mt-4 sm:text-5xl lg:text-6xl">
              Smart technology. <span className="text-amber-300">Better student prices.</span>
            </h1>
            <p className="mt-4 max-w-xl text-base leading-7 text-slate-200 sm:mt-5 sm:text-lg sm:leading-8">
              Being a student comes with enough expenses. Get access to eligible student offers on selected technology products by verifying your student status with Classic Computers.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:mt-7 sm:flex-row sm:items-center">
              <Link
                href={user ? "#verification" : signUpPath}
                className="inline-flex min-h-13 items-center justify-center gap-2 rounded-xl bg-amber-300 px-6 py-3.5 text-base font-bold text-[#081827] shadow-lg shadow-black/15 transition-colors hover:bg-amber-200 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-200/60"
              >
                {user && verification ? "View your application" : "Apply for student deals"}
              </Link>
              <Link
                href="/shop"
                className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/30 px-5 py-3 text-sm font-bold text-white transition-colors hover:border-white/60 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/40"
              >
                Explore products
              </Link>
            </div>
            <p className="mt-4 max-w-lg text-sm leading-6 text-slate-400">
              Student offers are available to verified students and apply to eligible products while the offers are active.
            </p>
          </div>

          <div className="relative mx-auto w-full max-w-xl overflow-hidden rounded-2xl border border-white/15 bg-[#102b42] shadow-2xl shadow-black/25 lg:rounded-3xl">
            {heroImageUrl ? (
              <Image
                src={heroImageUrl}
                alt={heroImage?.alt_text ?? heroImage?.title ?? "Technology from Classic Computers"}
                width={960}
                height={720}
                priority
                sizes="(max-width: 1023px) 100vw, 45vw"
                className="aspect-[16/8] w-full object-cover sm:aspect-[16/9] lg:aspect-[5/4]"
              />
            ) : (
              <div aria-hidden="true" className="flex aspect-[16/8] items-center justify-center bg-[#102b42] text-amber-200 sm:aspect-[16/9] lg:aspect-[5/4]">
                <svg viewBox="0 0 72 56" fill="none" className="h-20 w-24">
                  <rect x="9" y="4" width="54" height="38" rx="3" stroke="currentColor" strokeWidth="2.5" />
                  <path d="M3 51h66l-6-9H9l-6 9ZM29 51h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
            )}
          </div>
        </div>
      </section>

      <section aria-labelledby="how-it-works-heading" className="border-b border-slate-200 bg-white">
        <div className="section-shell py-11 sm:py-14 lg:py-16">
          <div className="max-w-2xl">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-800">Simple steps</p>
            <h2 id="how-it-works-heading" className="mt-2 text-2xl font-extrabold leading-tight text-slate-950 sm:text-3xl">
              Your student benefits in three simple steps
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-600">
              Getting access to student offers is straightforward. Submit your details, wait for verification and start shopping once approved.
            </p>
          </div>

          <ol className="mt-7 grid gap-3 md:mt-9 md:grid-cols-3 md:gap-4">
            <li className="flex gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-emerald-100 text-cyan-800">
                <StepIcon kind="apply" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-800">Step 01</p>
                <h3 className="mt-1 text-base font-bold text-slate-950">Apply for verification</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">Tell us where you study and submit the required student details. You will need a Classic Computers account to apply.</p>
              </div>
            </li>
            <li className="flex gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
                <StepIcon kind="review" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-amber-800">Step 02</p>
                <h3 className="mt-1 text-base font-bold text-slate-950">Get verified</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">Our team reviews your submission. Check your verification status and decision from your account.</p>
              </div>
            </li>
            <li className="flex gap-4 rounded-xl border border-slate-200 bg-slate-50/70 p-4 sm:p-5">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-sky-100 text-sky-800">
                <StepIcon kind="shop" />
              </div>
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-sky-800">Step 03</p>
                <h3 className="mt-1 text-base font-bold text-slate-950">Enjoy eligible offers</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">Once approved, eligible active student offers are calculated at checkout on qualifying products while you are signed in.</p>
              </div>
            </li>
          </ol>
        </div>
      </section>

      <section id="offers" aria-labelledby="student-offers-heading" className="scroll-mt-24 bg-slate-50">
        <div className="section-shell py-11 sm:py-14 lg:py-16">
          <div className="flex flex-col gap-4 border-b border-slate-200 pb-5 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-800">Selected technology</p>
              <h2 id="student-offers-heading" className="mt-2 text-2xl font-extrabold leading-tight text-slate-950 sm:text-3xl">Offers for verified students</h2>
              <p className="mt-2 text-base leading-7 text-slate-600">Explore current offers available to approved students. Each offer has its own eligibility requirements and terms.</p>
            </div>
            {discountResult.offers.length > 0 ? (
              <Badge variant="success" className="w-fit shrink-0 px-3 py-1.5 text-sm">{discountResult.offers.length} active</Badge>
            ) : null}
          </div>

          {discountResult.unavailable ? (
            <div role="alert" className="mt-6 flex flex-col gap-4 rounded-xl border border-amber-200 bg-amber-50 p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <h3 className="text-lg font-bold text-slate-950">We couldn&apos;t load the student offers</h3>
                <p className="mt-1 text-sm leading-6 text-slate-700">We&apos;re having trouble retrieving the latest offers. Please try again shortly.</p>
              </div>
              <StudentDealsRetryButton />
            </div>
          ) : discountResult.offers.length === 0 ? (
            <div className="mt-6 rounded-xl border border-slate-200 bg-white p-5 sm:p-7">
              <h3 className="text-lg font-bold text-slate-950">No active student offers at the moment</h3>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">We&apos;re working on bringing you more student deals. You can still apply for verification so you&apos;re ready when eligible offers become available.</p>
              <Link href={user ? verificationPath : signUpPath} className="mt-4 inline-flex min-h-11 items-center gap-2 font-bold text-cyan-800 hover:text-[#081827] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700 focus-visible:ring-offset-2">
                {user ? "View your application" : "Apply for student deals"}
              </Link>
            </div>
          ) : (
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {discountResult.offers.map((offer) => (
                <article key={offer.id} className="flex h-full flex-col rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-800">Student offer</p>
                      <h3 className="mt-1 break-words text-lg font-bold text-slate-950">{offer.name}</h3>
                    </div>
                    <div className="shrink-0 rounded-lg bg-cyan-50 px-3 py-2 text-right text-cyan-900">
                      <p className="text-xl font-extrabold leading-tight">{offer.type === "percentage" ? `${offer.value}%` : formatMoney(offer.value)}</p>
                      <p className="text-xs font-semibold">off</p>
                    </div>
                  </div>

                  <ul className="mt-4 grid gap-2 text-sm leading-5 text-slate-700">
                    {offer.min_quantity !== null ? <li>Minimum quantity: <strong>{offer.min_quantity}</strong></li> : null}
                    {offer.min_order_total !== null ? <li>Minimum order: <strong>{formatMoney(offer.min_order_total)}</strong></li> : null}
                    {offer.max_discount_amount !== null ? <li>Maximum discount: <strong>{formatMoney(offer.max_discount_amount)}</strong></li> : null}
                    {offer.starts_at ? <li>Offer starts: <strong>{formatDate(offer.starts_at)}</strong></li> : null}
                    {offer.ends_at ? <li>Offer ends: <strong>{formatDate(offer.ends_at)}</strong></li> : null}
                  </ul>

                  <div className="mt-5 border-t border-slate-200 pt-4">
                    <h4 className="text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Eligible products</h4>
                    {offer.products.length > 0 ? (
                      <ul className="mt-2 grid gap-2">
                        {offer.products.map((product) => (
                          <li key={product.id}>
                            <Link href={`/product/${product.slug}`} className="inline-flex min-h-10 items-center font-semibold text-cyan-800 underline decoration-cyan-300 underline-offset-4 hover:text-[#081827] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-700 focus-visible:ring-offset-2">
                              {product.name}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p className="mt-2 text-sm leading-6 text-slate-600">Eligible products are being updated. Contact us for details.</p>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>
      </section>

      <section id="verification" aria-labelledby="verification-heading" className="scroll-mt-24 border-y border-cyan-100 bg-white">
        <div className="section-shell py-11 sm:py-14 lg:py-16">
          <div className="grid gap-7 lg:grid-cols-[0.8fr_1.2fr] lg:items-start lg:gap-12">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-800">Your next step</p>
              <h2 id="verification-heading" className="mt-2 text-2xl font-extrabold leading-tight text-slate-950 sm:text-3xl">Ready to access student deals?</h2>
              <p className="mt-3 text-base leading-7 text-slate-600">Submit your student details for review and track your application from your Classic Computers account.</p>
            </div>

            {!user ? (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
                <h3 className="text-lg font-bold text-slate-950">Sign in or create an account to apply</h3>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <Link href={signUpPath} className="inline-flex min-h-12 items-center justify-center rounded-xl bg-brand-700 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30">
                    Create an account
                  </Link>
                  <Link href={signInPath} className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20">
                    Sign in
                  </Link>
                </div>
                <p className="mt-3 text-sm leading-6 text-slate-600">Already have an account? Sign in to continue your application.</p>
              </div>
            ) : (
              <div className="rounded-xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-950">Your application</h3>
                    {verification ? <p className="mt-1 text-sm text-slate-600">{verification.institution}</p> : null}
                  </div>
                  <Badge variant={statusVariants[status] ?? "neutral"} className="px-3 py-1.5 text-sm">
                    {statusLabels[status] ?? status}
                  </Badge>
                </div>

                {verification ? (
                  <p className="mt-3 text-sm leading-6 text-slate-600">
                    Submitted {formatDate(verification.created_at)}
                    {verification.reviewed_at ? ` · Reviewed ${formatDate(verification.reviewed_at)}` : ""}
                    {verification.expires_at && status === "approved" ? ` · Approval expires ${formatDate(verification.expires_at)}` : ""}
                  </p>
                ) : null}

                <p className="mt-3 text-sm leading-6 text-slate-700">
                  {status === "approved"
                    ? "You are approved. Sign in at checkout to use active offers on eligible products."
                    : status === "pending"
                      ? "Your application is awaiting staff review. You can check its status and decision in your account."
                      : status === "rejected"
                        ? "Your application was not approved. You can submit corrected details for another review."
                        : status === "expired"
                          ? "Your verification has expired. Submit updated student details for review to regain access to eligible offers."
                          : "You have not applied yet. Submit your student details to begin staff review."}
                </p>

                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <Link href={verificationPath} className="inline-flex min-h-12 items-center justify-center rounded-xl bg-brand-700 px-5 py-3 text-sm font-bold text-white shadow-sm hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/30">
                    {status === "none" ? "Apply for verification" : status === "pending" || status === "approved" ? "View your application" : "Resubmit details"}
                  </Link>
                  {status === "approved" ? (
                    <Link href="/shop" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 py-3 text-sm font-bold text-slate-800 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500/20">
                      Shop eligible products
                    </Link>
                  ) : null}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {businessInfo ? <div className="section-shell py-10 sm:py-12"><ProductEnquiry product={{ name: "Student deal enquiry", sku: "STUDENT" }} businessInfo={businessInfo} /></div> : null}
    </main>
  );
}
