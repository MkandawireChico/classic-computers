import type { Metadata } from "next";
import Link from "next/link";
import { ContentCallout, ContentPage, ContentSection } from "@/components/storefront/content-page";

export const metadata: Metadata = {
  title: "Returns and Refunds",
  description: "How to contact Classic Computers about a product return or refund request.",
};

export default function ReturnsPage() {
  return (
    <ContentPage
      eyebrow="Customer care"
      title="Returns and refunds"
      description="If there is a problem with a purchase or a product does not match what was agreed, contact Classic Computers so we can review the details with you."
    >
      <ContentCallout title="Please contact us before returning an item">
        The currently published store policy says return requests should be made within seven days
        of purchase and accompanied by proof of purchase. A request is reviewed individually; this
        does not guarantee that a return, refund or exchange will be approved.
      </ContentCallout>

      <ContentSection id="before-request" title="Before requesting a return">
        <p>To help us assess your request, please:</p>
        <ul className="grid gap-3 sm:grid-cols-2">
          {[
            "Keep your receipt, order confirmation or other proof of purchase.",
            "Contact us before bringing or sending a product back.",
            "Explain the issue and include the product model and order details.",
            "Keep the original accessories and packaging where available.",
          ].map((item) => (
            <li key={item} className="flex items-start gap-3 rounded-xl bg-slate-50 p-4">
              <span
                aria-hidden="true"
                className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-800"
              >
                ✓
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </ContentSection>

      <ContentSection id="assessment" title="How requests are assessed">
        <p>
          We review each request based on the circumstances of the purchase, the product condition,
          the information provided and any warranty coverage that applies. Please do not send or
          leave a product with us until you have contacted the team for instructions.
        </p>
        <p>
          If you are reporting a fault, include when it started and any troubleshooting you have
          already tried. We may ask to inspect the item before discussing next steps.
        </p>
      </ContentSection>

      <ContentSection id="refunds-exchanges" title="Refunds and exchanges">
        <p>
          The website does not specify the circumstances in which an assessed request results in a
          refund or exchange, nor how an approved refund is issued. Contact us for the decision and
          available options for your specific purchase. We do not promise an automatic refund or
          exchange on this page.
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <Link
            href="/contact"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-700 px-5 text-sm font-bold text-white hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
          >
            Contact us about a purchase
          </Link>
          <Link
            href="/warranty"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
          >
            View warranty information
          </Link>
        </div>
      </ContentSection>

      <ContentCallout title="Business policy details to confirm" tone="amber">
        The current published information does not define change-of-mind eligibility, exceptions to
        the seven-day request window, refund methods, or any fees. Please contact the team for
        guidance; these details should be confirmed by the business before being stated as fixed
        policy.
      </ContentCallout>
    </ContentPage>
  );
}
