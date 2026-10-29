import type { Metadata } from "next";
import { getBusinessInfo } from "@/lib/data/site-settings";
import "./globals.css";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  title: {
    default: "Classic Computers LLC",
    template: "%s | Classic Computers LLC",
  },
  description:
    "Computers, laptops, phones, tablets, printers and ICT equipment in Blantyre, Malawi — sales, rentals, and repairs.",
  openGraph: {
    siteName: "Classic Computers LLC",
    type: "website",
    locale: "en_MW",
  },
  twitter: {
    card: "summary",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const businessInfo = await getBusinessInfo();

  const localBusinessJsonLd = {
    "@context": "https://schema.org",
    "@type": "ComputerStore",
    name: businessInfo?.name ?? "Classic Computers LLC",
    image: `${siteUrl}/logo.png`,
    "@id": siteUrl,
    url: siteUrl,
    telephone: businessInfo?.phone ?? "+265995837735",
    email: businessInfo?.email ?? "info@classiccomputers.mw",
    address: {
      "@type": "PostalAddress",
      streetAddress: businessInfo?.address ?? "Shree Satyanarayan Building, Shop No. 4, Glyn Jones Road, Opposite First Capital Bank",
      addressLocality: "Blantyre Town",
      addressRegion: "Southern Region",
      addressCountry: "MW",
    },
    geo: {
      "@type": "GeoCoordinates",
      latitude: -15.7861,
      longitude: 35.0058,
    },
    openingHoursSpecification: [
      {
        "@type": "OpeningHoursSpecification",
        dayOfWeek: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
        opens: "08:00",
        closes: "18:00",
      },
    ],
    areaServed: [
      { "@type": "City", name: "Blantyre" },
      { "@type": "City", name: "Lilongwe" },
      { "@type": "City", name: "Mzuzu" },
      { "@type": "Country", name: "Malawi" },
    ],
    sameAs: ["https://www.facebook.com/classiccomputersmw"],
    priceRange: "MWK",
  };

  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessJsonLd) }} />
        {children}
      </body>
    </html>
  );
}
