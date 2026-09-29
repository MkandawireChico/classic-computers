import { Hero } from "@/components/storefront/hero";
import { CategorySection } from "@/components/storefront/category-section";
import { FeaturedProductsSection } from "@/components/storefront/featured-products-section";
import { ServicesSection } from "@/components/storefront/services-section";
import { ReviewsSection } from "@/components/storefront/reviews-section";
import { LocationSection } from "@/components/storefront/location-section";

export default function HomePage() {
  return (
    <>
      <Hero />
      <FeaturedProductsSection />
      <CategorySection />
      <ServicesSection />
      <ReviewsSection />
      <LocationSection />
    </>
  );
}
