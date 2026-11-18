import type { Metadata } from "next";
import Link from "next/link";
import { ContentCallout, ContentPage, ContentSection } from "@/components/storefront/content-page";
import { AnalyticsConsentControls } from "@/components/storefront/analytics-consent";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How Classic Computers handles information when you browse, shop or contact us.",
};

const sections = [
  ["information", "Information we handle"],
  ["use", "How we use information"],
  ["cookies", "Cookies and essential technologies"],
  ["analytics", "Optional analytics"],
  ["sharing", "When information is shared"],
  ["security-retention", "Security and retention"],
  ["your-choices", "Your choices and questions"],
] as const;

export default function PrivacyPage() {
  return (
    <ContentPage
      eyebrow="Your information"
      title="Privacy policy"
      description="This page explains, in plain language, the information Classic Computers may handle when you browse the website, place an order or contact our team."
    >
      <nav
        aria-label="Privacy policy sections"
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <h2 className="font-extrabold text-slate-900">On this page</h2>
        <ul className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {sections.map(([id, label]) => (
            <li key={id}>
              <a
                href={`#${id}`}
                className="inline-flex min-h-10 items-center text-sm font-semibold text-brand-700 underline decoration-brand-200 underline-offset-4 hover:text-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
              >
                {label}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <ContentSection id="information" title="Information we handle">
        <p>Depending on how you use the site, information may include:</p>
        <ul className="grid gap-3 sm:grid-cols-2">
          <li className="rounded-xl bg-slate-50 p-4">
            <strong className="text-slate-800">Contact and account details</strong>
            <br />
            Name, email, phone number, sign-in details, and information you choose to add to your
            profile.
          </li>
          <li className="rounded-xl bg-slate-50 p-4">
            <strong className="text-slate-800">Orders and transactions</strong>
            <br />
            Items ordered, delivery or collection details, order status and payment method or
            payment status.
          </li>
          <li className="rounded-xl bg-slate-50 p-4">
            <strong className="text-slate-800">Requests and messages</strong>
            <br />
            Information submitted through enquiry, rental, repair, corporate and student
            verification forms, and any reply details you provide.
          </li>
          <li className="rounded-xl bg-slate-50 p-4">
            <strong className="text-slate-800">Optional usage analytics</strong>
            <br />
            If you consent, limited information about pages, products, categories, searches and
            actions on the site.
          </li>
        </ul>
        <p>
          Please avoid including payment card details or other sensitive information in a message or
          search field.
        </p>
      </ContentSection>

      <ContentSection id="use" title="How we use information">
        <p>We use information to operate the services you request, including to:</p>
        <ul className="list-inside list-disc space-y-1">
          <li>manage accounts, shopping carts, orders and fulfilment;</li>
          <li>respond to product questions and customer enquiries;</li>
          <li>process rental, repair, corporate and student verification requests;</li>
          <li>provide customer support and relevant order or request updates;</li>
          <li>protect the website and maintain reliable service; and</li>
          <li>understand site usage when a visitor has allowed optional analytics.</li>
        </ul>
      </ContentSection>

      <ContentSection id="cookies" title="Cookies and essential technologies">
        <p>
          The site uses technologies needed for functions such as sign-in, account security and
          shopping-cart continuity. A browser cookie also remembers whether you allowed or declined
          optional analytics. Some forms use temporary session storage to prevent accidental
          duplicate submissions.
        </p>
        <p>
          These essential features are separate from optional analytics. You can browse and shop if
          you decline analytics; blocking essential browser storage may affect account or cart
          functions.
        </p>
      </ContentSection>

      <ContentSection id="analytics" title="Optional website analytics">
        <p>
          Analytics is off unless you choose to allow it. When enabled, the site records limited
          events such as page and product views, category interest, search activity and selected
          shopping or service actions. It may include a pseudonymous visitor or session identifier,
          the relevant page path, product/category identifiers, broad device category and limited
          event metadata.
        </p>
        <p>
          The application does not send form contents or payment credentials as analytics events.
          Search terms that look like an email address or phone number are rejected. Account,
          sign-in, checkout and administration pages are excluded from page tracking. Optional
          analytics uses first-party identifiers rather than a third-party analytics provider.
        </p>
        <p>
          Analytics records older than 180 days can be removed by a database cleanup function. The
          project does not establish an automatic schedule for running that function; retention
          operations should be confirmed by the site operator.
        </p>
        <div className="rounded-xl border border-cyan-200 bg-cyan-50/70 p-4">
          <p className="font-semibold text-cyan-950">Manage your analytics choice</p>
          <div className="mt-3">
            <AnalyticsConsentControls />
          </div>
        </div>
      </ContentSection>

      <ContentSection id="sharing" title="When information is shared">
        <p>
          Information may be processed by service providers that support the site and business
          operations. The application uses Supabase for hosted data, account authentication and file
          storage, and an SMTP provider for operational email. Information needed to complete a
          transaction may also be handled through the payment or delivery arrangement you select.
          The providers involved depend on the service used.
        </p>
        <p>
          We do not describe customer information as never being shared: limited information may be
          shared with a provider when needed to deliver a requested service or operate the website.
        </p>
      </ContentSection>

      <ContentSection id="security-retention" title="Security and retention">
        <p>
          The application uses access controls and server-side safeguards designed to help protect
          account and request information. No online service can guarantee absolute security.
        </p>
        <p>
          We keep information for operational, customer-support, security, legal and record-keeping
          needs, and remove or de-identify it when it is no longer needed, subject to applicable
          requirements.
        </p>
      </ContentSection>

      <ContentSection id="your-choices" title="Your choices and privacy questions">
        <p>
          You can change or withdraw optional analytics consent using the controls above. To ask
          about information associated with you, request a correction, or raise a privacy concern,
          contact us and describe your request. We may need to verify your identity before making
          changes.
        </p>
        <Link
          href="/contact"
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-700 px-5 text-sm font-bold text-white hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
        >
          Contact Classic Computers
        </Link>
      </ContentSection>

      <ContentCallout title="Policy review">
        This page describes current application behaviour and is not legal advice. The business
        should have the final privacy policy reviewed for its operations and applicable
        requirements.
      </ContentCallout>
    </ContentPage>
  );
}
