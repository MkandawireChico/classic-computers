import type { Metadata } from "next";
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

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans antialiased">{children}</body>
    </html>
  );
}
