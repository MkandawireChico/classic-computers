import type { Metadata } from "next";
import { Card, CardTitle } from "@/components/ui/card";
import { ContentPage } from "@/components/storefront/content-page";

export const metadata: Metadata = { title: "Terms of Service" };

export default function TermsPage() {
  return (
    <ContentPage eyebrow="Legal information" title="Terms & Conditions">
      <Card>
        <p className="text-sm leading-6 text-gray-700">By placing an order or using services from Classic Computers, you agree to the following terms:</p>
      </Card>
      <Card>
        <CardTitle>1. Pricing &amp; Availability</CardTitle>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-gray-700">
          <li>Prices listed on the site are in Malawian Kwacha (MWK) and subject to change based on stock availability and market conditions.</li>
          <li>Quotations provided for corporate supply or laptop rentals remain valid for 7 days from the issuance date.</li>
        </ul>
      </Card>
      <Card>
        <CardTitle>2. Orders &amp; Payments</CardTitle>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-gray-700">
          <li>Orders are processed upon payment confirmation via supported payment methods (Cash, Mobile Money, or Direct Bank Transfer).</li>
          <li>Rental agreements require proof of identity and signed contractual terms prior to equipment release.</li>
        </ul>
      </Card>
    </ContentPage>
  );
}
