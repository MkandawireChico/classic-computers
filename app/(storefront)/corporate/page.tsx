import type { Metadata } from "next";
import { getBusinessInfo } from "@/lib/data/site-settings";
import { CorporateEnquiryForm } from "@/components/storefront/corporate-enquiry-form";
import { ProductEnquiry } from "@/components/product/product-enquiry";

export const metadata: Metadata = {
  title: "Corporate & Bulk Supply",
  description: "ICT equipment supply for organisations, from Classic Computers LLC, Blantyre.",
};

export default async function CorporatePage() {
  const businessInfo = await getBusinessInfo();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-10 text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Business solutions</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900 sm:text-4xl">Corporate & Bulk Supply</h1>
        <p className="mt-4 max-w-xl mx-auto text-gray-700 leading-relaxed">
          Classic Computers LLC supplies ICT equipment to organisations in Blantyre. Tell us what you need below and our team will follow up with a tailored quote.
        </p>
      </div>

      <div className="rounded-panel border border-surface-border bg-gradient-to-br from-brand-50 to-white p-8 shadow-soft">
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-900">Submit your requirements</h2>
          <p className="mt-2 text-sm text-gray-600">Fill in the details below and we'll get back to you within 1-2 business days.</p>
        </div>
        <CorporateEnquiryForm />
      </div>

      {businessInfo ? (
        <div className="mt-10 rounded-panel border border-surface-border bg-white p-6 shadow-sm">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-600">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-gray-900">Prefer to talk directly?</h3>
              <p className="mt-1 text-sm text-gray-600">Contact us by phone or WhatsApp for immediate assistance with your corporate enquiry.</p>
              <div className="mt-4">
                <ProductEnquiry product={{ name: "Corporate enquiry", sku: "CORPORATE" }} businessInfo={businessInfo} />
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
