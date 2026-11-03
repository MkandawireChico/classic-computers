import type { Metadata } from "next";
import Link from "next/link";
import { ContentCallout, ContentPage, ContentSection } from "@/components/storefront/content-page";

export const metadata: Metadata = {
  title: "Terms and Conditions",
  description:
    "Terms for using the Classic Computers website and enquiring about products and services.",
};

const terms = [
  ["acceptance", "Using this website"],
  ["business", "About Classic Computers"],
  ["products", "Products and availability"],
  ["pricing", "Pricing and payment"],
  ["orders", "Orders and confirmation"],
  ["fulfilment", "Delivery and collection"],
  ["rentals", "Laptop rentals"],
  ["repairs", "Repairs and technical services"],
  ["warranty", "Warranty"],
  ["returns", "Returns and refunds"],
  ["accounts", "Customer accounts"],
  ["use", "Acceptable website use"],
  ["content", "Website content"],
  ["liability", "Liability"],
  ["changes", "Changes to these terms"],
  ["contact", "Contact information"],
] as const;

export default function TermsPage() {
  return (
    <ContentPage
      eyebrow="Legal information"
      title="Terms and conditions"
      description="These terms explain the general conditions for using the Classic Computers website and making product or service enquiries. Product-specific and agreed purchase terms may provide additional details."
    >
      <nav
        aria-label="Terms sections"
        className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6"
      >
        <h2 className="font-extrabold text-slate-900">Contents</h2>
        <ol className="mt-4 grid gap-x-6 gap-y-2 sm:grid-cols-2 lg:grid-cols-3">
          {terms.map(([id, label], index) => (
            <li key={id}>
              <a
                href={`#${id}`}
                className="inline-flex min-h-9 items-center gap-2 text-sm font-semibold text-brand-700 underline decoration-brand-200 underline-offset-4 hover:text-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
              >
                <span className="text-xs text-slate-400">{String(index + 1).padStart(2, "0")}</span>
                {label}
              </a>
            </li>
          ))}
        </ol>
      </nav>

      <ContentSection id="acceptance" title="1. Using this website">
        <p>
          By browsing or using this website, you agree to use it lawfully and provide accurate
          information when placing an order or submitting a request. If you do not agree with these
          terms, please do not use the website.
        </p>
      </ContentSection>

      <ContentSection id="business" title="2. About Classic Computers">
        <p>
          Classic Computers LLC is a technology and electronics business based in Blantyre, Malawi.
          The website provides product information and ways to enquire about sales, rentals, repairs
          and ICT supply.
        </p>
      </ContentSection>

      <ContentSection id="products" title="3. Products and availability">
        <p>
          Product images and descriptions are provided to help you understand the items offered.
          Colour, appearance, included accessories and specifications may vary by model or stock.
          Product condition and any item-specific details should be checked on the product page and
          confirmed with us when needed.
        </p>
        <p>
          Listings and stock availability may change. Contact us to confirm that an item and its
          stated specifications are available before making arrangements.
        </p>
      </ContentSection>

      <ContentSection id="pricing" title="4. Pricing and payment">
        <p>
          Prices and the payment options available for an order are shown on the website or
          confirmed by our team. Checkout currently supports the payment methods enabled for the
          site, which may include pay at the shop, bank transfer, mobile money or cash on delivery.
          Follow the instructions shown for your order and contact us if anything is unclear.
        </p>
        <p>
          Prices and payment arrangements may change; the details applicable to a submitted order
          should be confirmed with Classic Computers.
        </p>
      </ContentSection>

      <ContentSection id="orders" title="5. Orders and confirmation">
        <p>
          Submitting an order is a request to purchase. We process it using the contact and
          fulfilment details provided and confirm the order status through the website or the
          contact details associated with the order. Please contact us if you notice an error in
          your order information.
        </p>
      </ContentSection>

      <ContentSection id="fulfilment" title="6. Delivery and collection">
        <p>
          Available fulfilment options are shown during checkout. Confirm the delivery location,
          collection arrangements, any applicable charges and expected timing with us when these
          details are not shown for your order.
        </p>
      </ContentSection>

      <ContentSection id="rentals" title="7. Laptop rentals">
        <p>
          Rental requests are subject to product availability and confirmation by Classic Computers.
          Rental duration, price, collection and return arrangements, and any other applicable
          conditions should be agreed before equipment is released. The current website requests
          proof of identity and signed rental terms before release.
        </p>
      </ContentSection>

      <ContentSection id="repairs" title="8. Repairs and technical services">
        <p>
          Repair requests are assessed by the team. The issue, scope of work, any quoted cost and
          the next step should be discussed with you before repair work proceeds. Do not send
          equipment until you have received instructions from Classic Computers.
        </p>
      </ContentSection>

      <ContentSection id="warranty" title="9. Warranty">
        <p>
          Warranty coverage varies by product and condition. Please review the product listing and
          our{" "}
          <Link
            href="/warranty"
            className="font-semibold text-brand-700 underline underline-offset-4 hover:text-brand-900"
          >
            Warranty information
          </Link>{" "}
          before purchase, or contact us to clarify which terms apply.
        </p>
      </ContentSection>

      <ContentSection id="returns" title="10. Returns and refunds">
        <p>
          Return requests are assessed individually. The currently published store policy asks
          customers to contact us within seven days of purchase and provide proof of purchase; this
          does not guarantee that a request will be approved. See{" "}
          <Link
            href="/returns"
            className="font-semibold text-brand-700 underline underline-offset-4 hover:text-brand-900"
          >
            Returns and refunds
          </Link>{" "}
          for current guidance.
        </p>
      </ContentSection>

      <ContentSection id="accounts" title="11. Customer accounts">
        <p>
          Keep your sign-in details secure and notify us if you believe someone else has accessed
          your account. You are responsible for keeping the contact and account information you
          provide accurate and up to date.
        </p>
      </ContentSection>

      <ContentSection id="use" title="12. Acceptable website use">
        <p>
          Do not misuse the website, attempt to access systems or accounts without permission,
          interfere with its operation, or submit information that is unlawful, misleading or
          harmful.
        </p>
      </ContentSection>

      <ContentSection id="content" title="13. Website content">
        <p>
          Website text, graphics and other materials are provided for the operation and presentation
          of Classic Computers and its products. Do not reproduce or use them in a way that suggests
          endorsement or ownership without permission from the relevant rights holder.
        </p>
      </ContentSection>

      <ContentSection id="liability" title="14. Liability">
        <p>
          Nothing in these terms is intended to exclude rights or responsibilities that cannot be
          excluded under applicable law. Questions about the legal effect of these terms should be
          reviewed by a qualified professional.
        </p>
      </ContentSection>

      <ContentSection id="changes" title="15. Changes to these terms">
        <p>
          We may update website information and these terms as our services or processes change. The
          version published on this page is the current website version; please review it when you
          use the site.
        </p>
      </ContentSection>

      <ContentSection id="contact" title="16. Contact information">
        <p>
          For questions about an order, rental, repair or these terms, contact Classic Computers
          through our contact page.
        </p>
        <Link
          href="/contact"
          className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-700 px-5 text-sm font-bold text-white hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
        >
          Contact us
        </Link>
      </ContentSection>

      <ContentCallout title="Legal review">
        These terms are a plain-language summary of website practices, not legal advice. The
        business should have them reviewed for completeness and consistency with its current sales,
        rental, repair and consumer obligations before treating them as final legal terms.
      </ContentCallout>
    </ContentPage>
  );
}
