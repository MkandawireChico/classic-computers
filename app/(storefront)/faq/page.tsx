import type { Metadata } from "next";
import Link from "next/link";
import { ContentCallout, ContentPage, ContentSection } from "@/components/storefront/content-page";

export const metadata: Metadata = {
  title: "Frequently Asked Questions",
  description: "Answers about shopping, payments, delivery, rentals, repairs and student offers at Classic Computers.",
};

function Question({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <details className="group border-b border-slate-200 py-4 last:border-b-0">
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 text-left text-sm font-bold text-slate-900 marker:hidden focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 sm:text-base">
        <span>{title}</span>
        <span aria-hidden="true" className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border border-slate-200 text-lg font-normal text-brand-800 transition-transform group-open:rotate-45">+</span>
      </summary>
      <div className="max-w-3xl pt-3 text-sm leading-7 text-slate-600">{children}</div>
    </details>
  );
}

export default function FAQPage() {
  return (
    <ContentPage
      eyebrow="Customer help"
      title="Frequently asked questions"
      description="Quick answers about buying from Classic Computers, arranging services and getting support with an order."
    >
      <ContentSection id="shopping" title="Shopping and orders">
        <Question title="How do I place an order?">
          Browse the <Link href="/shop" className="font-semibold text-brand-800 underline underline-offset-4">product catalogue</Link>, open a product to review its price, availability and specifications, then add the item to your cart. At checkout, enter your details, select an available fulfilment option and choose one of the payment methods displayed.
        </Question>
        <Question title="Does the website show live stock quantities?">
          Product pages show availability status rather than exact stock quantities. Stock is checked again during checkout. If an item becomes unavailable, the order process will ask you to review your cart.
        </Question>
        <Question title="Which payment methods are available?">
          The methods enabled for your order appear during checkout. Some payment options use manual confirmation. Follow the payment instructions on your order confirmation and keep your payment reference. Never share a mobile money PIN, one-time password or card security code with anyone.
        </Question>
        <Question title="How do I check my order?">
          Sign in and visit <Link href="/account/orders" className="font-semibold text-brand-800 underline underline-offset-4">your orders</Link> to review order details and available updates. Keep your order number when contacting the team.
        </Question>
        <Question title="Can I collect my order or have it delivered?">
          Choose from the fulfilment options offered at checkout. Delivery charges, destination coverage and timing depend on the order and arrangement. Review the details shown during checkout or contact the team if anything needs confirmation. Read the <Link href="/delivery" className="font-semibold text-brand-800 underline underline-offset-4">delivery and collection information</Link>.
        </Question>
      </ContentSection>

      <ContentSection id="services" title="Rentals, repairs and business enquiries">
        <Question title="How do I request equipment for rent?">
          Browse the <Link href="/rentals" className="font-semibold text-brand-800 underline underline-offset-4">rental equipment</Link> page and submit a request for the item and period you need. A request is not a confirmed booking. The team reviews availability and follows up with the arrangements.
        </Question>
        <Question title="How do I book a repair?">
          Submit the device details and describe the problem through the <Link href="/repairs/book" className="font-semibold text-brand-800 underline underline-offset-4">repair request form</Link>. After submission, keep your repair reference and tracking code. Use the <Link href="/repairs/track" className="font-semibold text-brand-800 underline underline-offset-4">repair tracking page</Link> for available updates.
        </Question>
        <Question title="How do I request a corporate quotation?">
          Visit the <Link href="/corporate" className="font-semibold text-brand-800 underline underline-offset-4">corporate supply page</Link> and submit your equipment requirements, quantities and contact details. The team will review your enquiry and follow up.
        </Question>
        <Question title="How do student deals work?">
          Create an account, submit your details for student verification and wait for the team to review your application. Approved students who are signed in receive eligible active offers on qualifying products. Visit <Link href="/student-deals" className="font-semibold text-brand-800 underline underline-offset-4">student deals</Link> for the process and current offers.
        </Question>
      </ContentSection>

      <ContentSection id="after-sales" title="Returns, warranty and reviews">
        <Question title="How do I request a return or refund?">
          Contact Classic Computers before returning a product. The published policy asks customers to make return requests within seven days of purchase and provide proof of purchase. Requests are assessed individually. Read the full <Link href="/returns" className="font-semibold text-brand-800 underline underline-offset-4">returns and refunds policy</Link>.
        </Question>
        <Question title="Does every product have the same warranty?">
          No. Coverage depends on the product, condition and product-specific terms. Check the warranty information on the product listing and read the <Link href="/warranty" className="font-semibold text-brand-800 underline underline-offset-4">warranty page</Link> before purchase.
        </Question>
        <Question title="When am I eligible to leave a review?">
          Product reviews are available after a completed purchase. Rental reviews are available after a rental is returned or completed. Repair reviews are available after a repair is completed. Reviews are checked before publication.
        </Question>
      </ContentSection>

      <ContentCallout title="Still need help?">
        <p>Contact the team with your order number, product model or service reference so we can direct your request.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/contact" className="inline-flex min-h-11 items-center justify-center rounded-lg bg-[#123653] px-5 text-sm font-bold text-white hover:bg-brand-800">Contact Classic Computers</Link>
          <Link href="/reviews" className="inline-flex min-h-11 items-center justify-center rounded-lg border border-brand-300 bg-white px-5 text-sm font-bold text-brand-800 hover:bg-brand-50">Customer reviews</Link>
        </div>
      </ContentCallout>
    </ContentPage>
  );
}
