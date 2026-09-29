import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardTitle } from "@/components/ui/card";
import { ContentPage } from "@/components/storefront/content-page";

export const metadata: Metadata = { title: "About Us" };

export default function AboutPage() {
  return (
    <ContentPage
      eyebrow="About"
      title="About Classic Computers"
      description="Classic Computers Blantyre"
    >
      <Card>
        <CardTitle>About Classic Computers</CardTitle>
        <p className="mt-3 text-sm leading-6 text-gray-700">
          Founded in Blantyre, Classic Computers is a trusted provider of high-quality laptops, smartphones, IT hardware, and corporate technology solutions across Malawi. Located at Shree Satyanarayan Building along Glyn Jones Road, we serve individual retail customers, students, and enterprise clients with genuine, rigorously tested technology.
        </p>
      </Card>
      <Card>
        <CardTitle>What we do</CardTitle>
        <p className="mt-3 text-sm leading-6 text-gray-700">
          We serve individual retail customers, students, and enterprise clients with laptops, smartphones, IT hardware, and corporate technology solutions.
        </p>
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm font-medium text-brand-700">
          <li><Link href="/shop" className="hover:underline">Shop products</Link></li>
          <li><Link href="/repairs" className="hover:underline">Repairs</Link></li>
          <li><Link href="/rentals" className="hover:underline">Rentals</Link></li>
          <li><Link href="/corporate" className="hover:underline">Corporate supply</Link></li>
        </ul>
      </Card>
      <Card>
        <CardTitle>Why choose us?</CardTitle>
        <ul className="mt-4 space-y-3 text-sm leading-6 text-gray-700">
          <li><strong className="text-gray-900">Quality Guaranteed:</strong> Every device undergoes multi-point testing before going on sale.</li>
          <li><strong className="text-gray-900">Local Warranty Support:</strong> Complete peace of mind with hardware warranties and local technical repair support.</li>
          <li><strong className="text-gray-900">Flexible Services:</strong> From individual retail sales to laptop rentals and corporate bulk supply, we power your digital needs.</li>
        </ul>
      </Card>
    </ContentPage>
  );
}
