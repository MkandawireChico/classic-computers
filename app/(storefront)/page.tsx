import type { Metadata } from "next";
import { Hero } from "@/components/storefront/hero";
import { FeaturedProductsSection } from "@/components/storefront/featured-products-section";
import { CategorySection } from "@/components/storefront/category-section";
import { CorporateSupplySection } from "@/components/storefront/corporate-supply-section";
import { ServicesSection } from "@/components/storefront/services-section";
import { ReviewsSection } from "@/components/storefront/reviews-section";
import { LocationSection } from "@/components/storefront/location-section";

export const metadata: Metadata = {
  title: "Laptops, Computers & ICT Equipment in Blantyre",
  description:
    "Shop laptops and ICT equipment from Classic Computers in Blantyre, Malawi. Browse products, explore services, or request a business quotation.",
  alternates: { canonical: "/" },
  openGraph: {
    title: "Laptops, Computers & ICT Equipment in Blantyre | Classic Computers",
    description:
      "Shop laptops and ICT equipment from Classic Computers in Blantyre, Malawi, or request a business quotation.",
    url: "/",
    type: "website",
    siteName: "Classic Computers LLC",
    locale: "en_MW",
  },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedProductsSection />
      <CategorySection />
      <CorporateSupplySection />
      <ServicesSection />
      <ReviewsSection />
      <LocationSection />
    </>
  );
}
