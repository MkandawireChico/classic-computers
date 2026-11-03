import type { Metadata } from "next";
import Link from "next/link";
import { ContentCallout, ContentPage, ContentSection } from "@/components/storefront/content-page";

export const metadata: Metadata = {
  title: "Warranty",
  description:
    "Understand product warranty coverage and how to request support from Classic Computers.",
};

export default function WarrantyPage() {
  return (
    <ContentPage
      eyebrow="Customer care"
      title="Product warranty and support"
      description="Warranty coverage depends on the product, its condition and the terms shown for that specific item. Keep your proof of purchase and contact us if you experience a fault."
    >
      <section aria-label="Laptop warranty coverage" className="grid gap-4 md:grid-cols-2">
        <article className="rounded-2xl border border-brand-200 bg-gradient-to-br from-brand-50 to-white p-5 shadow-sm sm:p-7">
          <span className="inline-flex rounded-full bg-brand-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-800">
            New, sealed laptops
          </span>
          <h2 className="mt-4 text-2xl font-black text-slate-900">Manufacturer warranty</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            New, sealed laptops are covered by the manufacturer warranty stated for the product. The
            applicable coverage and duration can vary by model; check the product listing or ask us
            before purchase.
          </p>
        </article>
        <article className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-5 shadow-sm sm:p-7">
          <span className="inline-flex rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-900">
            Pre-owned laptops
          </span>
          <h2 className="mt-4 text-2xl font-black text-slate-900">Three-month coverage</h2>
          <p className="mt-3 text-sm leading-7 text-slate-600">
            The published policy provides three months of warranty coverage for certified
            refurbished and ex-UK laptops. Product-specific terms shown on the listing should also
            be checked.
          </p>
        </article>
      </section>

      <ContentSection id="coverage" title="What coverage means">
        <p>
          Warranty claims are assessed against the applicable product terms. The existing policy
          describes cover for internal hardware faults, and excludes damage caused by accidents or
          other external causes.
        </p>
        <ul className="grid gap-2 sm:grid-cols-2">
          <li className="rounded-xl bg-slate-50 p-4">
            <strong className="text-slate-800">Keep your proof of purchase.</strong>
            <br />
            It helps us confirm the product and applicable coverage.
          </li>
          <li className="rounded-xl bg-slate-50 p-4">
            <strong className="text-slate-800">Check product-specific details.</strong>
            <br />
            Listings may include additional warranty information for an individual item.
          </li>
        </ul>
        <p>
          The current published exclusions include physical or liquid damage, unauthorised
          third-party repairs, software or virus issues, and power-surge damage. Coverage for phones
          and other products can differ, so refer to the product listing or contact us.
        </p>
      </ContentSection>

      <ContentSection id="parts" title="Replacement parts and accessories">
        <p>
          Replacement parts such as chargers, keyboards and LCD screens do not carry a supplier
          warranty under the current policy. Ask us about a specific part before purchase if you
          need clarification.
        </p>
      </ContentSection>

      <ContentSection id="request-support" title="Request warranty assistance">
        <ol className="grid gap-3 sm:grid-cols-2">
          {[
            "Contact us and describe the problem.",
            "Share your proof of purchase where available.",
            "Provide the product model and serial number, if available.",
            "Follow our guidance on bringing the product in for assessment.",
          ].map((step, index) => (
            <li
              key={step}
              className="flex items-start gap-3 rounded-xl border border-slate-200 p-4"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-100 text-sm font-bold text-brand-800">
                {index + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        <div className="flex flex-wrap gap-3 pt-1">
          <Link
            href="/contact"
            className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-700 px-5 text-sm font-bold text-white hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
          >
            Contact support
          </Link>
          <Link
            href="/returns"
            className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
          >
            Return information
          </Link>
        </div>
      </ContentSection>

      <ContentCallout title="Need help deciding what applies?" tone="amber">
        Contact us with the product model and your purchase details. We can help you find the
        relevant product-specific warranty information.
      </ContentCallout>
    </ContentPage>
  );
}
