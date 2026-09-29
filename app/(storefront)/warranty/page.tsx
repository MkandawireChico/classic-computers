import type { Metadata } from "next";
import Link from "next/link";
import { Card, CardTitle } from "@/components/ui/card";
import { ContentPage } from "@/components/storefront/content-page";

export const metadata: Metadata = { title: "Warranty" };

export default function WarrantyPage() {
  return (
    <ContentPage eyebrow="Customer information" title="Classic Computers Warranty Policy">
      <Card>
        <p className="text-sm leading-6 text-gray-700">We stand behind the quality of every product we sell. All devices purchased from Classic Computers include standard warranty coverage.</p>
      </Card>
      <Card>
        <CardTitle>1. Coverage Terms</CardTitle>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-gray-700">
          <li><strong className="text-gray-900">Laptops &amp; Smartphones:</strong> Included standard hardware warranty (3 months for certified refurbished/ex-UK units, manufacturer warranty for brand-new sealed units).</li>
          <li><strong className="text-gray-900">Covered Components:</strong> Internal hardware failures including motherboard, processor, RAM, internal storage, and display defects not caused by physical damage.</li>
        </ul>
      </Card>
      <Card>
        <CardTitle>2. Exclusions</CardTitle>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-gray-700">
          <li>Physical drops, cracked screens, liquid damage, or unauthorized third-party repairs.</li>
          <li>Software issues, virus infections, or OS modifications made after purchase.</li>
          <li>Power surge damages (we strongly recommend using surge protectors).</li>
        </ul>
      </Card>
      <Card>
        <CardTitle>3. How to Claim</CardTitle>
        <p className="mt-3 text-sm leading-6 text-gray-700">Bring your device along with your original purchase receipt to our Blantyre shop. Our technical team will inspect the device and provide repair, replacement, or service within 2–5 business days.</p>
      </Card>
      <section className="border-t border-surface-border pt-5">
        <h2 className="text-lg font-semibold text-gray-900">Product-specific warranty details</h2>
        <p className="mt-2 text-sm leading-6 text-gray-700">
          Any warranty details entered for an individual product are also displayed on that product&apos;s page.
        </p>
        <Link href="/shop" className="mt-3 inline-flex text-sm font-medium text-brand-700 hover:underline">Browse products</Link>
      </section>
    </ContentPage>
  );
}
