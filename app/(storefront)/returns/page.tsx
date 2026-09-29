import type { Metadata } from "next";
import { Card, CardTitle } from "@/components/ui/card";
import { ContentPage } from "@/components/storefront/content-page";

export const metadata: Metadata = { title: "Returns" };

export default function ReturnsPage() {
  return (
    <ContentPage eyebrow="Customer information" title="Return & Refund Policy">
      <Card>
        <CardTitle>1. Return Window</CardTitle>
        <p className="mt-3 text-sm leading-6 text-gray-700">Customers may request an exchange or return within <strong>7 days</strong> of purchase date, provided the item is accompanied by the original receipt.</p>
      </Card>
      <Card>
        <CardTitle>2. Eligibility Criteria</CardTitle>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-gray-700">
          <li>The product must be in its original condition with all accessories, chargers, and box packaging included.</li>
          <li>Items suffering from hardware defects upon unboxing qualify for immediate replacement or repair under warranty.</li>
          <li>Returns due to &quot;change of mind&quot; are subject to verification and may incur a restocking inspection fee if packaging has been unsealed.</li>
        </ul>
      </Card>
      <Card>
        <CardTitle>3. Non-Refundable Items</CardTitle>
        <p className="mt-3 text-sm leading-6 text-gray-700">Software licenses, digital activations, and items damaged through customer misuse or liquid exposure.</p>
      </Card>
    </ContentPage>
  );
}
