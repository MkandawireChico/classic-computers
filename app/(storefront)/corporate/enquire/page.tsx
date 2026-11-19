import type { Metadata } from "next";
import { CorporateEnquiryForm } from "@/components/storefront/corporate-enquiry-form";

export const metadata: Metadata = {
  title: "Corporate Enquiry",
  robots: { index: false },
};

export default async function CorporateEnquiryPage() {
  return (
    <div className="section-shell pb-16 pt-5 sm:pt-8">
      <header className="relative isolate overflow-hidden rounded-[2rem] border border-slate-200 bg-white px-6 py-9 text-slate-950 shadow-panel sm:px-10 sm:py-12">
        <div
          aria-hidden="true"
          className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,rgba(14,165,233,0.10),transparent_48%),linear-gradient(120deg,#ffffff,#f1f7fb)]"
        />
        <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">
          Corporate ICT supply
        </p>
        <h1 className="mt-3 text-balance text-3xl font-extrabold leading-tight text-slate-950 sm:text-4xl">
          Tell us what your organisation needs
        </h1>
        <p className="mt-3 max-w-3xl text-sm leading-relaxed text-slate-600 sm:text-base">
          Share your equipment requirements and our team will review your enquiry and follow up.
          Submitting this form is a request for a quote, not a confirmed order.
        </p>
      </header>

      <div className="mt-6 grid items-start gap-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(260px,0.7fr)] lg:gap-8">
        <section
          aria-labelledby="corporate-enquiry-form-title"
          className="rounded-3xl border border-slate-200 bg-white p-5 shadow-panel sm:p-8"
        >
          <div className="mb-7 border-b border-slate-200 pb-5">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-800">
              Your enquiry
            </p>
            <h2
              id="corporate-enquiry-form-title"
              className="mt-2 text-2xl font-extrabold text-slate-950"
            >
              Request a quotation
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">
              Required fields are marked. Add as much detail as you have available.
            </p>
          </div>
          <CorporateEnquiryForm />
        </section>

        <aside className="space-y-5 lg:sticky lg:top-6">
          <section className="rounded-3xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-800">
              Helpful to include
            </p>
            <h2 className="mt-2 text-xl font-bold text-slate-950">Make your request clear</h2>
            <ul className="mt-5 space-y-4">
              {[
                ["Equipment", "Product types, preferred models, or specifications."],
                ["Quantity", "Approximate quantities for each item, where known."],
                ["Delivery", "The location relevant to your request."],
                ["Budget", "An optional budget indication, if available."],
              ].map(([title, detail], index) => (
                <li key={title} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-white text-xs font-extrabold text-emerald-800 shadow-sm">
                    0{index + 1}
                  </span>
                  <div>
                    <p className="text-sm font-bold text-slate-900">{title}</p>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{detail}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
            <p className="text-sm font-bold text-amber-950">What happens next?</p>
            <p className="mt-2 text-sm leading-relaxed text-amber-900">
              Your details are recorded as a corporate enquiry. Our team will follow up about
              availability, pricing, and any next steps.
            </p>
          </div>
        </aside>
      </div>
    </div>
  );
}
