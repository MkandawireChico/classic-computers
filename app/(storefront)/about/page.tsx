import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardTitle } from "@/components/ui/card";
import { ContentPage } from "@/components/storefront/content-page";
import { getBusinessInfo } from "@/lib/data/site-settings";

export const metadata: Metadata = {
  title: "About Us",
  description: "Find Classic Computers LLC in Blantyre, Malawi, and explore our products and services.",
};

export default async function AboutPage() {
  const businessInfo = await getBusinessInfo();

  return (
    <ContentPage
      eyebrow="About"
      title="About Classic Computers"
      description="Classic Computers LLC is based in Blantyre, Malawi."
    >
      <Card>
        <CardTitle>Our shop</CardTitle>
        <p className="mt-3 text-sm leading-6 text-gray-700">
          {businessInfo?.address
            ? `Visit Classic Computers LLC at ${businessInfo.address}.`
            : "Visit Classic Computers LLC in Blantyre, Malawi."} Browse the products listed on our site or contact us with questions about an order or service.
        </p>
      </Card>
      <Card>
        <CardTitle>Products and services</CardTitle>
        <p className="mt-3 text-sm leading-6 text-gray-700">
          Explore available products, request a repair, ask about rentals, or send a corporate supply enquiry.
        </p>
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium text-brand-700">
          <li><Link href="/shop" className="hover:underline">Shop products</Link></li>
          <li><Link href="/repairs" className="hover:underline">Repairs</Link></li>
          <li><Link href="/rentals" className="hover:underline">Rentals</Link></li>
          <li><Link href="/corporate" className="hover:underline">Corporate supply</Link></li>
        </ul>
      </Card>
    </ContentPage>
  );
}
