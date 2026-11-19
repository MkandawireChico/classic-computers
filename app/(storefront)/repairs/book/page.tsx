import type { Metadata } from "next";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { RepairBookingForm } from "@/components/storefront/repair-booking-form";

export const metadata: Metadata = {
  title: "Request a Computer Repair",
  description: "Tell Classic Computers about your device and the fault you are experiencing. Submit a repair request for assessment in Blantyre.",
};

export default async function BookRepairPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-[#f5f7f8]">
      <div className="section-shell max-w-6xl py-8 sm:py-12">
        <Link href="/repairs" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-800 transition-colors hover:text-brand-950">
          <span aria-hidden="true">←</span> Back to repair services
        </Link>

        <header className="mt-6 max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Repair request · Classic Computers</p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight text-[#10243a] sm:text-4xl lg:text-5xl">Tell us what is happening with your device.</h1>
          <p className="mt-4 text-sm leading-7 text-slate-600 sm:text-base">
            Share the device details and describe the fault. We will record your request and contact you about assessment and the next steps.
          </p>
        </header>

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:gap-8">
          <section aria-label="Repair request form" className="min-w-0 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:p-7">
            <div className="mb-6 flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-5">
              <div>
                <h2 className="text-lg font-bold text-slate-950">Repair details</h2>
                <p className="mt-1 text-sm text-slate-500">Complete each step, then review before sending.</p>
              </div>
              <span className="rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-700">
                {user ? "Signed-in customer" : "Guest request"}
              </span>
            </div>
            <RepairBookingForm isAuthenticated={Boolean(user)} />
          </section>

          <aside className="space-y-5 lg:sticky lg:top-24">
            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-bold text-slate-950">Before you submit</h2>
              <ul className="mt-4 space-y-4">
                <li className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-800">1</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Describe the symptoms</p>
                    <p className="mt-1 text-xs leading-5 text-slate-600">Include error messages, when the problem started and what you have already tried.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-800">2</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">List accessories</p>
                    <p className="mt-1 text-xs leading-5 text-slate-600">Mention chargers, cables or other items you plan to leave with the device.</p>
                  </div>
                </li>
                <li className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-brand-50 text-xs font-bold text-brand-800">3</span>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">Keep your data safe</p>
                    <p className="mt-1 text-xs leading-5 text-slate-600">Back up important files where possible. Do not enter account passwords in this form.</p>
                  </div>
                </li>
              </ul>
            </section>

            <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="text-base font-bold text-slate-950">What happens after submission?</h2>
              <ol className="mt-4 space-y-3">
                <li className="flex gap-3">
                  <span className="text-xs font-bold text-brand-700">01</span>
                  <p className="text-sm leading-6 text-slate-600">Your request is recorded and a repair reference is generated.</p>
                </li>
                <li className="flex gap-3">
                  <span className="text-xs font-bold text-brand-700">02</span>
                  <p className="text-sm leading-6 text-slate-600">The team reviews the information and follows up about bringing in or assessing the device.</p>
                </li>
                <li className="flex gap-3">
                  <span className="text-xs font-bold text-brand-700">03</span>
                  <p className="text-sm leading-6 text-slate-600">Any estimate, approval and repair arrangements are discussed with you before work proceeds.</p>
                </li>
              </ol>
              <p className="mt-4 border-t border-slate-100 pt-4 text-xs leading-5 text-slate-500">Sending a request does not confirm a diagnosis, price or completion date.</p>
            </section>

            <section className="rounded-2xl bg-[#102f49] p-5 text-white">
              <h2 className="text-base font-bold">Need help first?</h2>
              <p className="mt-2 text-sm leading-6 text-slate-200">If you are unsure what to select or need to explain a special situation, contact the team before submitting.</p>
              <Link href="/contact" className="mt-4 inline-flex items-center text-sm font-bold text-cyan-200 underline decoration-cyan-200/50 underline-offset-4 hover:text-white">Contact Classic Computers</Link>
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}
