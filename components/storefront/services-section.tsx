import Link from "next/link";

const SERVICES = [
  {
    href: "/rentals",
    title: "Laptop rentals",
    description: "Contact our team to ask about rental availability and pricing.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="4" width="18" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M2 20h20l-2-4H4l-2 4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/repairs",
    title: "Computer repairs",
    description: "Book a repair and track your ticket status online.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/student-deals",
    title: "Student deals",
    description: "Apply for student verification and view any active offers.",
    icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M22 10v6M2 10l10-7 10 7-10 7-10-7Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },
];

export function ServicesSection() {
  return (
    <section aria-labelledby="services-heading" className="border-y border-slate-200 bg-slate-50/80">
      <div className="section-shell py-14 sm:py-18 lg:py-20">
        <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <p className="inline-flex rounded-full border border-brand-200 bg-white px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-brand-800 shadow-sm">
              More from Classic Computers
            </p>
            <h2 id="services-heading" className="text-h2 font-extrabold leading-tight text-slate-900">
              Services and <span className="text-brand-700">support</span>
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Practical help for work, study, and keeping your technology running.
            </p>
          </div>
          <div aria-hidden="true" className="hidden h-1.5 w-28 shrink-0 rounded-full bg-gradient-to-r from-brand-500 via-cyan-400 to-brand-700 sm:mb-2 sm:block" />
        </div>
        <div className="grid items-stretch grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
          {SERVICES.map((service) => (
            <Link
              key={service.href}
              href={service.href}
              className="group flex h-full flex-col rounded-2xl border border-slate-200 border-t-4 border-t-brand-500 bg-white/95 p-5 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-brand-300 hover:shadow-xl hover:shadow-emerald-950/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500 focus-visible:ring-offset-2 sm:p-6"
            >
              <div className="mb-5 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-50 text-brand-800 transition-colors group-hover:bg-brand-100">
                {service.icon}
              </div>
              <h3 className="text-xl font-bold leading-snug text-slate-900">{service.title}</h3>
              <p className="mt-3 flex-1 text-base leading-relaxed text-slate-600">{service.description}</p>
              <span className="mt-5 inline-flex items-center text-sm font-bold text-brand-800">
                Explore service
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
