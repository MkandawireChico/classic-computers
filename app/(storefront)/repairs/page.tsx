import type { Metadata } from "next";
import Link from "next/link";
import { getBusinessInfo } from "@/lib/data/site-settings";
import { ProductEnquiry } from "@/components/product/product-enquiry";

export const metadata: Metadata = {
  title: "Computer Repairs",
  description: "Computer and device repairs from Classic Computers LLC, Blantyre.",
};

export default async function RepairsPage() {
  const businessInfo = await getBusinessInfo();

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold text-gray-900">Computer Repairs</h1>
      <p className="mt-3 text-gray-700">
        Classic Computers LLC repairs laptops, desktops and other devices in Blantyre.
      </p>
      <div className="mt-6 flex gap-3">
        <Link
          href="/repairs/book"
          className="inline-flex h-10 items-center rounded-card bg-brand-500 px-4 text-sm font-medium text-white hover:bg-brand-600"
        >
          Book a repair
        </Link>
        <Link
          href="/repairs/track"
          className="inline-flex h-10 items-center rounded-card border border-surface-border px-4 text-sm font-medium text-gray-800 hover:bg-surface-muted"
        >
          Track a repair
        </Link>
      </div>
      {businessInfo ? (
        <div className="mt-6">
          <ProductEnquiry product={{ name: "Repair enquiry", sku: "REPAIR" }} businessInfo={businessInfo} />
        </div>
      ) : null}
    </div>
  );
}
