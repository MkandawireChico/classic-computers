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
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-semibold text-gray-900">Corporate &amp; Bulk Supply</h1>
      <p className="mt-3 text-gray-700">
        Classic Computers LLC supplies ICT equipment to organisations in Blantyre. Tell us what
        you need below and our team will follow up.
      </p>
      <div className="mt-6">
        <CorporateEnquiryForm />
      </div>
      {businessInfo ? (
        <div className="mt-6 border-t border-surface-border pt-4">
          <p className="mb-2 text-sm text-gray-500">Prefer to talk directly?</p>
          <ProductEnquiry product={{ name: "Corporate enquiry", sku: "CORPORATE" }} businessInfo={businessInfo} />
        </div>
      ) : null}
    </div>
  );
}
