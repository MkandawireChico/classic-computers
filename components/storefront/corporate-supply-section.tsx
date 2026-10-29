import Link from "next/link";

export function CorporateSupplySection() {
  return (
    <section aria-labelledby="corporate-supply-heading" className="bg-gradient-to-br from-slate-900 via-brand-900 to-slate-900 py-20 sm:py-24">
      <div className="section-shell">
        <div className="grid gap-12 rounded-3xl bg-slate-950/60 px-10 py-12 text-white backdrop-blur-md shadow-2xl sm:px-12 sm:py-16 lg:grid-cols-[1fr_auto] lg:items-center lg:gap-20 lg:py-20">
          <div className="max-w-2xl space-y-8">
            <p className="text-sm font-bold uppercase tracking-[0.25em] text-brand-400">For organisations</p>
            <h2 id="corporate-supply-heading" className="text-h2 font-bold leading-tight text-white">
              Technology supply for businesses and institutions
            </h2>
            <p className="max-w-xl text-lg leading-relaxed text-slate-300 sm:text-xl">
              Need laptops or ICT equipment for your team, school, organisation or project? Contact Classic Computers
              for a tailored quotation.
            </p>
            <ul className="flex flex-wrap gap-x-10 gap-y-4 text-base text-slate-200 sm:text-lg">
              <li className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-brand-400 shadow-lg shadow-brand-400/50" />
                Bulk computer supply
              </li>
              <li className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-brand-400 shadow-lg shadow-brand-400/50" />
                ICT equipment quotations
              </li>
              <li className="flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-brand-400 shadow-lg shadow-brand-400/50" />
                Laptop rentals
              </li>
            </ul>
          </div>
          <div className="flex flex-col gap-5 sm:flex-row lg:flex-col">
            <Link
              href="/corporate"
              className="inline-flex min-h-14 items-center justify-center rounded-2xl bg-brand-500 px-9 py-5 text-lg font-bold text-white shadow-2xl shadow-brand-500/40 transition-all duration-300 hover:bg-brand-400 hover:shadow-3xl hover:shadow-brand-500/50 hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Request a Business Quote
            </Link>
            <Link
              href="/rentals"
              className="inline-flex min-h-14 items-center justify-center rounded-2xl border-2 border-slate-500 bg-white/10 px-9 py-5 text-lg font-bold text-white shadow-lg transition-all duration-300 hover:border-slate-400 hover:bg-white/20 hover:shadow-xl hover:-translate-y-1 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
            >
              Explore Rentals
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
