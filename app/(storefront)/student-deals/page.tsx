import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getMyStudentVerification } from "@/lib/data/account-student";
import { getActiveStudentDiscounts } from "@/lib/data/student-deals";
import { getBusinessInfo } from "@/lib/data/site-settings";
import { ProductEnquiry } from "@/components/product/product-enquiry";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ContentPage } from "@/components/storefront/content-page";
import { formatMoney } from "@/lib/format/money";

export const metadata: Metadata = {
  title: "Student Deals",
  description: "Verified student pricing from Classic Computers LLC, Blantyre.",
};

export default async function StudentDealsPage() {
  const [user, discountResult, businessInfo] = await Promise.all([
    getCurrentUser(),
    getActiveStudentDiscounts(),
    getBusinessInfo(),
  ]);
  const verification = user ? await getMyStudentVerification() : null;
  const status = verification?.status ?? "none";
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
    <ContentPage
      eyebrow="Student deals"
      title="Student verification and pricing"
      description="Submit your student details for staff review. Once approved, active offers apply automatically to their selected products at checkout."
    >
      <div className="rounded-panel border border-surface-border bg-gradient-to-br from-brand-50 to-white p-8 shadow-soft">
        <h2 className="text-2xl font-bold text-gray-900">How it works</h2>
        <p className="mt-2 text-sm text-gray-600">Three simple steps to unlock student pricing</p>
        <ol className="mt-8 grid gap-8 md:grid-cols-3">
          <li className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 text-2xl font-bold text-white shadow-lg">1</div>
            <div className="mt-4">
              <p className="font-semibold text-gray-900">Submit your details</p>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">Create an account and provide your institution and student details for review.</p>
            </div>
          </li>
          <li className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 text-2xl font-bold text-white shadow-lg">2</div>
            <div className="mt-4">
              <p className="font-semibold text-gray-900">Wait for staff review</p>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">Track your request and its decision from your account dashboard.</p>
            </div>
          </li>
          <li className="relative">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-500 text-2xl font-bold text-white shadow-lg">3</div>
            <div className="mt-4">
              <p className="font-semibold text-gray-900">Shop eligible products</p>
              <p className="mt-2 text-sm text-gray-600 leading-relaxed">When approved, sign in and the active student offer is calculated at checkout for eligible products.</p>
            </div>
          </li>
        </ol>
      </div>

      <section aria-labelledby="student-offers-heading" className="mt-10">
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-surface-border pb-4">
          <div>
            <h2 id="student-offers-heading" className="text-2xl font-bold text-gray-900">Current student offers</h2>
            <p className="mt-1 text-sm text-gray-600">Offers are subject to the terms shown and require an approved student account.</p>
          </div>
          {discountResult.offers.length > 0 ? <Badge variant="success">{discountResult.offers.length} active</Badge> : null}
        </div>

        {discountResult.unavailable ? (
          <Alert variant="warning" className="mt-6">Student offers could not be loaded right now. Please check again later.</Alert>
        ) : discountResult.offers.length === 0 ? (
          <div className="mt-6 rounded-panel border border-surface-border bg-surface-muted/50 p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-600">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 2v20M2 12h20" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              </svg>
            </div>
            <p className="text-lg font-medium text-gray-900">No active student offers</p>
            <p className="mt-2 text-sm text-gray-600">Check back later or contact us for student pricing.</p>
          </div>
        ) : (
          <div className="mt-6 space-y-4">
            {discountResult.offers.map((offer) => (
              <article key={offer.id} className="rounded-panel border border-surface-border bg-white p-6 shadow-sm transition-all hover:shadow-soft">
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{offer.name}</h3>
                    <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-600">
                      {offer.min_quantity !== null ? <li>Minimum quantity: {offer.min_quantity}</li> : null}
                      {offer.min_order_total !== null ? <li>Minimum order: {formatMoney(offer.min_order_total)}</li> : null}
                      {offer.max_discount_amount !== null ? <li>Maximum discount: {formatMoney(offer.max_discount_amount)}</li> : null}
                      {offer.ends_at ? <li>Ends {new Date(offer.ends_at).toLocaleDateString("en-MW", { timeZone: "Africa/Blantyre" })}</li> : null}
                    </ul>
                  </div>
                  <div className="flex shrink-0 items-center rounded-full bg-brand-50 px-4 py-2">
                    <p className="text-2xl font-bold text-brand-700">
                      {offer.type === "percentage" ? `${offer.value}%` : formatMoney(offer.value)}
                    </p>
                    <span className="ml-1 text-sm font-medium text-brand-600">off</span>
                  </div>
                </div>
                {offer.products.length > 0 ? (
                  <div className="mt-4 pt-4 border-t border-surface-border">
                    <p className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-2">Eligible products</p>
                    <ul className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
                      {offer.products.map((product) => (
                        <li key={product.id}>
                          <Link href={`/product/${product.slug}`} className="font-medium text-brand-700 hover:underline">
                            {product.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p className="mt-4 pt-4 border-t border-surface-border text-sm text-gray-500">Eligible products are being updated. Please contact us for details.</p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>

      <div className="rounded-panel border border-surface-border bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1">
            <h2 className="text-xl font-bold text-gray-900">Your verification</h2>
            <p className="mt-2 text-sm text-gray-600 leading-relaxed">
              {!user
                ? "Sign in or create an account to apply and track your student verification."
                : verification
                  ? `Submitted for ${verification.institution}.`
                  : "No student verification has been submitted for this account yet."}
            </p>
            {user && verification ? (
              <p className="mt-2 text-xs text-gray-500">
                Submitted {new Date(verification.created_at).toLocaleDateString("en-MW", { timeZone: "Africa/Blantyre" })}
              </p>
            ) : null}
          </div>
          <Badge variant={statusVariants[status] ?? "neutral"} className="shrink-0">{user ? statusLabels[status] ?? status : "Sign in required"}</Badge>
        </div>
        {user && status === "pending" ? <Alert variant="info" className="mt-4">Your request is waiting for staff review. You can continue shopping while it is reviewed.</Alert> : null}
        {user && status === "approved" ? <Alert variant="success" className="mt-4">Your account is approved. Sign in at checkout to receive active offers on eligible products.</Alert> : null}
        {user && status === "rejected" ? <Alert variant="warning" className="mt-4">Your request was not approved. You can submit corrected details for another review.</Alert> : null}
        <div className="mt-6 flex flex-wrap gap-3">
          {user ? (
            <Link href="/account/student-verification" className="inline-flex items-center justify-center rounded-card bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 transition-colors">
              {status === "pending" ? "View verification" : "Manage verification"}
            </Link>
          ) : (
            <>
              <Link href="/sign-up?redirectTo=%2Faccount%2Fstudent-verification" className="inline-flex items-center justify-center rounded-card bg-brand-500 px-5 py-2.5 text-sm font-medium text-white hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 transition-colors">Create an account to apply</Link>
              <Link href="/sign-in?redirectTo=%2Fstudent-deals" className="inline-flex items-center justify-center rounded-card border border-surface-border px-5 py-2.5 text-sm font-medium text-gray-800 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 transition-colors">Sign in</Link>
            </>
          )}
          <Link href="/shop" className="inline-flex items-center justify-center rounded-card border border-surface-border px-5 py-2.5 text-sm font-medium text-gray-800 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 transition-colors">Browse products</Link>
        </div>
      </div>
      {businessInfo ? <ProductEnquiry product={{ name: "Student deal enquiry", sku: "STUDENT" }} businessInfo={businessInfo} /> : null}
    </ContentPage>
  );
}
