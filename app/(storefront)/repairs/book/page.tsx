import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { RepairBookingForm } from "@/components/storefront/repair-booking-form";

export const metadata: Metadata = { 
  title: "Book a Repair",
  description: "Submit a repair request for your device with Classic Computers in Blantyre.",
};

export default async function BookRepairPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="section-shell max-w-2xl py-10 sm:py-14">
      <div>
        <h1 className="text-2xl font-extrabold text-white sm:text-3xl">Book a Repair</h1>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Tell us about your device and the problem — our team will review your ticket and follow up with next steps.
        </p>
      </div>
      <div className="mt-8">
        <RepairBookingForm isAuthenticated={Boolean(user)} />
      </div>
    </div>
  );
}
