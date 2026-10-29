import type { Metadata } from "next";
import { CorporateEnquiryForm } from "@/components/storefront/corporate-enquiry-form";

export const metadata: Metadata = {
  title: "Corporate Enquiry",
  robots: { index: false },
};

export default async function CorporateEnquiryPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="text-2xl font-semibold text-gray-900">Corporate Enquiry</h1>
      <p className="mt-2 text-sm text-gray-600">
        Tell us about your organisation's ICT requirements and our team will follow up with a
        tailored quote.
      </p>

      <div className="mt-8">
        <CorporateEnquiryForm />
      </div>
    </div>
  );
}
