import type { Metadata } from "next";
import Link from "next/link";
import { CorporateEnquiryForm } from "@/components/storefront/corporate-enquiry-form";

export const metadata: Metadata = {
  title: "Corporate Enquiry",
  robots: { index: false },
};

export default async function CorporateEnquiryPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <Link
        href="/corporate"
        className="inline-flex items-center gap-2 text-sm font-medium text-gray-600 hover:text-brand-600 transition-colors"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <path d="M19 12H5M12 19l-7-7 7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Back to corporate
      </Link>

      <h1 className="mt-4 text-2xl font-semibold text-gray-900">Corporate Enquiry</h1>
      <p className="mt-2 text-sm text-gray-600">
        Tell us about your organisation's ICT requirements and our team will follow up with a tailored quote.
      </p>

      <div className="mt-8">
        <CorporateEnquiryForm />
      </div>
    </div>
  );
}
