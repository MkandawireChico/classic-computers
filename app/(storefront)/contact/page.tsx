import type { Metadata } from "next";
import { getBusinessInfo, getHours } from "@/lib/data/site-settings";
import { createClient } from "@/lib/supabase/server";
import { ProductEnquiry } from "@/components/product/product-enquiry";
import { GeneralEnquiryForm } from "@/components/storefront/general-enquiry-form";

export const metadata: Metadata = { title: "Contact Us" };

export default async function ContactPage() {
  const supabase = createClient();
  const [businessInfo, hours, { data: { user } }] = await Promise.all([
    getBusinessInfo(),
    getHours(),
    supabase.auth.getUser(),
  ]);

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-semibold text-gray-900">Contact Us</h1>
      {businessInfo ? (
        <div className="mt-4 space-y-2 text-gray-700">
          <p>{businessInfo.address}</p>
          {businessInfo.phone ? <p>Phone: {businessInfo.phone}</p> : null}
          {businessInfo.email ? <p>Email: {businessInfo.email}</p> : null}
          {hours?.enabled && hours.schedule ? <p>Hours: {hours.schedule}</p> : null}
        </div>
      ) : null}
      {businessInfo ? (
        <div className="mt-6">
          <ProductEnquiry product={{ name: "General enquiry", sku: "GENERAL" }} businessInfo={businessInfo} />
        </div>
      ) : null}

      <div className="mt-8 border-t border-surface-border pt-6">
        <h2 className="mb-3 text-lg font-semibold text-gray-900">Send us a message</h2>
        <GeneralEnquiryForm isAuthenticated={Boolean(user)} />
      </div>
    </div>
  );
}
