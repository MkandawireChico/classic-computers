import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { RepairTrackingForm } from "@/components/storefront/repair-tracking-form";

export const metadata: Metadata = { title: "Track a Repair" };

export default async function TrackRepairPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <h1 className="text-2xl font-semibold text-gray-900">Track a Repair</h1>
      {user ? (
        <p className="mt-2 text-sm text-gray-600">
          Signed-in customers can see all their repairs directly in{" "}
          <Link href="/account/repairs" className="text-brand-600 hover:underline">
            My Repairs
          </Link>{" "}
          — no ticket number needed. You can still track any ticket by number below.
        </p>
      ) : (
        <p className="mt-2 text-sm text-gray-600">
          Enter the ticket number and tracking code you received when you booked your repair.
        </p>
      )}
      <div className="mt-6">
        <RepairTrackingForm />
      </div>
    </div>
  );
}
