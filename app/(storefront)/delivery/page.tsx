import type { Metadata } from "next";
import Link from "next/link";
import { ContentCallout, ContentPage, ContentSection } from "@/components/storefront/content-page";

export const metadata: Metadata = {
  title: "Delivery and Collection",
  description:
    "Information about delivery and collection arrangements for Classic Computers orders in Malawi.",
};

export default function DeliveryPage() {
  return (
    <ContentPage
      eyebrow="Order fulfilment"
      title="Delivery and collection"
      description="Choose from the fulfilment options available for your order. The exact arrangements depend on the items, destination and options offered at checkout."
    >
      <ContentSection id="available-options" title="Available fulfilment options">
        <div className="grid gap-4 sm:grid-cols-2">
          <article className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-lg font-bold text-slate-900">Collection from the shop</h3>
            <p className="mt-2">
              If collection is available for your order, follow the confirmation instructions and
              contact the team if you need to agree a collection time. Bring your order reference
              and any information requested in your confirmation.
            </p>
          </article>
          <article className="rounded-xl border border-slate-200 bg-slate-50 p-5">
            <h3 className="text-lg font-bold text-slate-900">Delivery</h3>
            <p className="mt-2">
              If delivery is available, provide a complete and reachable delivery address and
              contact number. Confirm any delivery charge, destination coverage and expected
              timing with the team where checkout does not display those details.
            </p>
          </article>
        </div>
      </ContentSection>

      <ContentSection id="before-order" title="Before placing your order">
        <ul className="list-inside list-disc space-y-2">
          <li>Check the fulfilment options displayed during checkout.</li>
          <li>Enter accurate contact and delivery details.</li>
          <li>Review any delivery charge shown before submitting the order.</li>
          <li>Contact us if your destination or delivery arrangement is not clear.</li>
        </ul>
      </ContentSection>

      <ContentSection id="after-order" title="After placing your order">
        <p>
          Check your order confirmation for the recorded fulfilment details. Our team will confirm
          arrangements where further coordination is needed. Keep your order number available when
          contacting us about collection or delivery.
        </p>
        <div className="flex flex-wrap gap-3 pt-1">
          <Link
            href="/account/orders"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-700 px-5 text-sm font-bold text-white hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
          >
            View your orders
          </Link>
          <Link
            href="/contact"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
          >
            Ask about delivery
          </Link>
        </div>
      </ContentSection>

      <ContentCallout title="Need to confirm a delivery arrangement?" tone="amber">
        Delivery charges, coverage and timing are not presented as fixed promises on this page.
        Please rely on the details shown for your order or confirm the arrangement with Classic
        Computers before making plans.
      </ContentCallout>
    </ContentPage>
  );
}
