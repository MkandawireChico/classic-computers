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
    <div className="mx-auto max-w-2xl px-4 py-12 sm:px-6 lg:px-8">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 sm:text-3xl">Track a Repair</h1>
        {user ? (
          <p className="mt-2 text-sm text-slate-600">
            Signed-in customers can see all their repairs directly in{" "}
            <Link href="/account/repairs" className="text-emerald-600 hover:underline font-semibold">
              My Repairs
            </Link>{" "}
            — no ticket number needed. You can still track any ticket by number below.
          </p>
        ) : (
          <p className="mt-2 text-sm text-slate-600">
            Enter the ticket number and tracking code you received when you booked your repair.
          </p>
        )}
      </div>
      <div className="mt-8">
        <RepairTrackingForm />
      </div>
    </div>
  );
}
