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
    <main className="min-h-screen bg-[#f4f6f7]">
      <div className="section-shell max-w-2xl py-10 sm:py-14">
      <header className="rounded-[1.5rem] bg-[#081827] p-6 text-white shadow-xl shadow-slate-900/10 sm:p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-300">Technical support</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-white sm:text-3xl">Book a repair</h1>
        <p className="mt-2 text-sm leading-6 text-slate-300">
          Tell us about your device and the problem. Our team will review your request and follow up with next steps.
        </p>
      </header>
      <div className="mt-8">
        <RepairBookingForm isAuthenticated={Boolean(user)} />
      </div>
      </div>
    </main>
  );
}
