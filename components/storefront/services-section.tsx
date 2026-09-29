import Link from "next/link";

const SERVICES = [
  {
    href: "/rentals",
    title: "Laptop rentals",
    description: "Short and long-term laptop rentals for individuals and businesses.",
  },
  {
    href: "/repairs",
    title: "Computer repairs",
    description: "Book a repair and track your ticket status online.",
  },
  {
    href: "/corporate",
    title: "Corporate & bulk supply",
    description: "ICT equipment supply for organisations and offices.",
  },
  {
    href: "/student-deals",
    title: "Student deals",
    description: "Verified student pricing on selected products.",
  },
];

export function ServicesSection() {
  return (
    <section className="border-y border-surface-border bg-surface-muted/70">
      <div className="section-shell py-10 sm:py-12">
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Support</p>
          <h2 className="mt-1 text-2xl font-bold text-gray-900">Beyond the shop</h2>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((service) => (
            <Link
              key={service.href}
              href={service.href}
              className="group rounded-card border border-surface-border bg-surface p-5 shadow-sm transition-all hover:-translate-y-1 hover:border-brand-300 hover:shadow-soft"
            >
              <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-full bg-brand-50 text-brand-600 group-hover:bg-brand-100">
                <span className="sr-only">Service</span>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="text-brand-600">
                  <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.2" />
                  <path d="M8 12h8" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </div>
              <h3 className="text-base font-semibold text-slate-900">
                <span className="text-brand-600 hover:underline">{service.title}</span>
              </h3>
              <p className="mt-2 text-sm leading-6 text-slate-600">{service.description}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
