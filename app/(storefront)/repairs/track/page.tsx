import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { RepairTrackingForm } from "@/components/storefront/repair-tracking-form";

export const metadata: Metadata = {
  title: "Track Your Repair",
  description: "Check the latest customer-visible update for your Classic Computers repair request.",
  robots: { index: false },
};

export default async function TrackRepairPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-[#f5f7f8]">
      <div className="section-shell max-w-5xl py-8 sm:py-12">
        <Link href="/repairs" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-800 transition-colors hover:text-brand-950">
          <span aria-hidden="true">←</span> Back to repair services
        </Link>

        <header className="mt-6 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Repair support</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#10243a] sm:text-4xl">Check your repair progress.</h1>
          {user ? (
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              Your account includes a list of your repair requests. Open{" "}
              <Link href="/account/repairs" className="font-semibold text-brand-800 underline decoration-brand-300 underline-offset-4 hover:text-brand-950">My Repairs</Link>
              {" "}to view them. Use the form below if you have a guest repair reference.
            </p>
          ) : (
            <p className="mt-3 text-sm leading-7 text-slate-600 sm:text-base">
              Enter the reference and private tracking code from your repair confirmation. Both details are required to view a guest request.
            </p>
          )}
        </header>

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:gap-8">
          <section aria-label="Repair tracking lookup" className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-7">
            <RepairTrackingForm />
          </section>

          <aside className="space-y-4">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-bold text-slate-950">Where do I find my details?</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">Your repair reference and tracking code appear on the confirmation screen after a guest repair request is submitted. Keep the code somewhere private.</p>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-bold text-slate-950">No tracking code?</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">If you submitted the request while signed in, open My Repairs. If you submitted as a guest and lost the code, contact the team for assistance.</p>
              <Link href="/contact" className="mt-3 inline-flex text-sm font-bold text-brand-800 underline decoration-brand-300 underline-offset-4 hover:text-brand-950">Contact the team</Link>
            </div>
            <div className="rounded-2xl bg-[#102f49] p-5 text-white">
              <h2 className="text-base font-bold">Need to request a repair?</h2>
              <p className="mt-2 text-sm leading-6 text-slate-200">Start a new request and tell us about your device and the fault.</p>
              <Link href="/repairs/book" className="mt-4 inline-flex min-h-10 items-center justify-center rounded-lg bg-white px-4 py-2 text-sm font-bold text-[#102f49] hover:bg-cyan-50">Request a repair</Link>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
