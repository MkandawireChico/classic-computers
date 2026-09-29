import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { RepairBookingForm } from "@/components/storefront/repair-booking-form";

export const metadata: Metadata = { title: "Book a Repair" };

export default async function BookRepairPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-semibold text-gray-900">Book a Repair</h1>
      <p className="mt-2 text-sm text-gray-600">
        Tell us about your device and the problem — our team will review your ticket and follow
        up with next steps.
      </p>
      <div className="mt-6">
        <RepairBookingForm isAuthenticated={Boolean(user)} />
      </div>
    </div>
  );
}
