import type { Metadata } from "next";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getMyStudentVerification } from "@/lib/data/account-student";
import { getActiveStudentDiscounts } from "@/lib/data/student-deals";
import { formatMoney } from "@/lib/format/money";
import { Alert } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Card, CardTitle } from "@/components/ui/card";
import { ContentPage } from "@/components/storefront/content-page";

export const metadata: Metadata = {
  title: "Student Deals | Classic Computers Malawi",
  description: "Learn how student verification and currently active student offers work at Classic Computers.",
};

const statusStyles = {
  none: { label: "Not submitted", tone: "neutral" },
  pending: { label: "Pending review", tone: "warning" },
  approved: { label: "Approved", tone: "success" },
  rejected: { label: "Rejected", tone: "danger" },
  expired: { label: "Expired", tone: "neutral" },
} as const;

export default async function StudentDealsPage() {
  const [user, discountResult] = await Promise.all([getCurrentUser(), getActiveStudentDiscounts()]);
  const verification = user ? await getMyStudentVerification() : null;
  const statusKey = (verification?.status ?? "none") as keyof typeof statusStyles;
  const status = statusStyles[statusKey] ?? statusStyles.none;

  return (
    <ContentPage
      eyebrow="Student deals"
      title="Student verification and pricing"
      description="Submit your student details for staff review. If approved, the checkout system can apply an active student offer to your order."
    >
      <Card>
        <CardTitle>How it works</CardTitle>
        <ol className="mt-4 grid gap-5 md:grid-cols-3">
          <StepCard
            number="1"
            title="Submit your details"
            description="Create an account, then submit your institution, student ID, contact details, and institution email. A supporting document is optional."
          />
          <StepCard
            number="2"
            title="Wait for staff review"
            description="A Classic Computers admin reviews the request and approves or rejects it. You can track its status in your account and receive an in-app decision notification."
          />
          <StepCard
            number="3"
            title="Checkout while signed in"
            description="After approval, sign in and place your order. Checkout checks your approved student status and evaluates active student discounts automatically."
          />
        </ol>
      </Card>

      <section>
        <div className="flex flex-wrap items-end justify-between gap-3 border-b border-surface-border pb-3">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Current student offers</h2>
            <p className="mt-1 text-sm text-gray-600">Offers below are read from active, currently valid student discounts.</p>
          </div>
          {discountResult.offers.length > 0 ? <Badge variant="success">{discountResult.offers.length} active</Badge> : null}
        </div>

        {discountResult.unavailable ? (
          <Alert variant="warning" className="mt-4">Student offers could not be loaded right now. Please check again later.</Alert>
        ) : discountResult.offers.length === 0 ? (
          <Alert variant="info" className="mt-4">There are no active student offers right now. Once an offer is activated, eligible approved students can receive it through checkout.</Alert>
        ) : (
          <div className="mt-4 divide-y divide-surface-border border-y border-surface-border">
            {discountResult.offers.map((offer) => (
              <article key={offer.id} className="py-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <h3 className="font-semibold text-gray-900">{offer.name}</h3>
                  <p className="text-lg font-bold text-brand-700">
                    {offer.type === "percentage" ? `${offer.value}% off` : `${formatMoney(offer.value)} off`}
                  </p>
                </div>
                <ul className="mt-2 flex flex-wrap gap-x-5 gap-y-1 text-sm text-gray-600">
                  {offer.min_quantity !== null ? <li>Minimum quantity: {offer.min_quantity}</li> : null}
                  {offer.min_order_total !== null ? <li>Minimum order: {formatMoney(offer.min_order_total)}</li> : null}
                  {offer.max_discount_amount !== null ? <li>Maximum discount: {formatMoney(offer.max_discount_amount)}</li> : null}
                  {offer.ends_at ? <li>Ends {new Date(offer.ends_at).toLocaleDateString("en-MW", { timeZone: "Africa/Blantyre" })}</li> : null}
                </ul>
              </article>
            ))}
          </div>
        )}
      </section>

      <Card>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <CardTitle>Your verification</CardTitle>
            <p className="mt-2 text-sm text-gray-600">
              {user
                ? verification
                  ? `Submitted for ${verification.institution}`
                  : "No student verification has been submitted for this account yet."
                : "Sign in or create an account to submit and track a student verification."}
            </p>
            {user && verification ? (
              <p className="mt-2 text-xs text-gray-500">
                Submitted {new Date(verification.created_at).toLocaleDateString("en-MW", { timeZone: "Africa/Blantyre" })}
              </p>
            ) : null}
          </div>
          <Badge variant={status.tone}>{user ? status.label : "Sign in required"}</Badge>
        </div>
        {user && verification?.status === "pending" ? (
          <Alert variant="info" className="mt-4">Your request is waiting for staff review.</Alert>
        ) : null}
        {user && verification?.status === "rejected" ? (
          <Alert variant="warning" className="mt-4">Your request was not approved. You may submit a new request from the verification page.</Alert>
        ) : null}
        <div className="mt-5 flex flex-wrap gap-3">
          <Link
            href={user ? "/account/student-verification" : "/sign-up"}
            className="inline-flex items-center justify-center rounded-card bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            {user ? "Manage verification" : "Create an account to apply"}
          </Link>
          {!user ? (
            <Link href="/sign-in" className="inline-flex items-center justify-center rounded-card border border-surface-border px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
              Sign in
            </Link>
          ) : null}
          <Link href="/shop" className="inline-flex items-center justify-center rounded-card border border-surface-border px-4 py-2.5 text-sm font-medium text-gray-800 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
            Browse products
          </Link>
        </div>
      </Card>
    </ContentPage>
  );
}

function StepCard({ number, title, description }: { number: string; title: string; description: string }) {
  return (
    <div className="rounded-panel border border-surface-border bg-white p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 text-sm font-semibold text-brand-700">
        {number}
      </div>
      <h3 className="mt-4 text-lg font-semibold text-gray-900">{title}</h3>
      <p className="mt-2 text-sm text-gray-700">{description}</p>
    </div>
  );
}
