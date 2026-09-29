import type { Metadata } from "next";
import { Card, CardTitle } from "@/components/ui/card";
import { ContentPage } from "@/components/storefront/content-page";

export const metadata: Metadata = { title: "Privacy Policy" };

export default function PrivacyPage() {
  return (
    <ContentPage eyebrow="Legal information" title="Privacy Policy">
      <Card>
        <p className="text-sm leading-6 text-gray-700">Classic Computers (&quot;we&quot;, &quot;our&quot;) values your privacy. This policy outlines how we collect and protect your personal information when you use our website or visit our shop.</p>
      </Card>
      <Card>
        <CardTitle>1. Information We Collect</CardTitle>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-gray-700">
          <li>Contact information (name, phone number, email address, physical location) provided when placing orders or contacting customer service.</li>
          <li>Transaction data required to process sales receipts, rentals, or corporate quotes.</li>
        </ul>
      </Card>
      <Card>
        <CardTitle>2. How We Use Your Data</CardTitle>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-gray-700">
          <li>To fulfill orders, process rentals, and provide warranty service support.</li>
          <li>To communicate order updates, invoice details, or respond to WhatsApp/form inquiries.</li>
          <li>We <strong>never</strong> sell, rent, or share customer data with third-party advertisers.</li>
        </ul>
      </Card>
    </ContentPage>
  );
}
