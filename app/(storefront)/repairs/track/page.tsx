import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { RepairTrackingForm } from "@/components/storefront/repair-tracking-form";

export const metadata: Metadata = { 
  title: "Track a Repair",
  description: "Track your repair status using your ticket number and tracking code.",
};

export default async function TrackRepairPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-[#f4f6f7]"><div className="section-shell max-w-2xl py-12 sm:py-14">
      <header className="rounded-[1.5rem] border border-slate-200 bg-white p-6 text-slate-950 shadow-sm sm:p-8">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-700">Repair support</p>
        <h1 className="mt-3 text-2xl font-semibold tracking-tight text-slate-950 sm:text-3xl">Track a repair</h1>
        {user ? (
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Signed-in customers can see all their repairs directly in{" "}
            <Link href="/account/repairs" className="font-semibold text-brand-700 underline underline-offset-4 hover:text-brand-900">
              My Repairs
            </Link>{" "}
            — no ticket number needed. You can still track any ticket by number below.
          </p>
        ) : (
          <p className="mt-2 text-sm text-slate-600">
            Enter the ticket number and tracking code you received when you booked your repair.
          </p>
        )}
      </header>
      <div className="mt-8">
        <RepairTrackingForm />
      </div>
    </div></main>
  );
}
