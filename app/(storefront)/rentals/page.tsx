import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { getRentableProducts } from "@/lib/data/rental-tracking";
import { RentalBookingForm } from "@/components/storefront/rental-booking-form";
import { RentalTrackingWidget } from "@/components/storefront/rental-tracking-widget";

export const metadata: Metadata = {
  title: "Laptop Rentals",
  description: "Laptop rentals from Classic Computers LLC, Blantyre.",
};

export default async function RentalsPage() {
  const supabase = createClient();
  const [{ data: { user } }, products] = await Promise.all([supabase.auth.getUser(), getRentableProducts()]);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold text-gray-900">Laptop Rentals</h1>
      <p className="mt-3 text-gray-700">
        Classic Computers LLC offers laptop rentals in Blantyre for individuals and businesses.
        Submit a request below and our team will confirm availability and pricing.
      </p>

      <div className="mt-6">
        <RentalBookingForm products={products} isAuthenticated={Boolean(user)} />
      </div>

      <div className="mt-10">
        <RentalTrackingWidget />
      </div>
    </div>
  );
}
