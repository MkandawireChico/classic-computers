import Link from "next/link";

const SERVICES = [
  {
    href: "/rentals",
    title: "Laptop rentals",
    description: "Contact our team to ask about rental availability and pricing.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
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
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    href: "/corporate",
    title: "Corporate & bulk supply",
    description: "ICT equipment supply for organisations and offices.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.6" />
        <rect x="14" y="3" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.6" />
        <rect x="14" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.6" />
        <rect x="3" y="14" width="7" height="7" rx="1" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
  },
  {
    href: "/student-deals",
    title: "Student deals",
    description: "Apply for student verification and view any active offers.",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M22 10v6M2 10l10-7 10 7-10 7-10-7Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    ),
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
                {service.icon}
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
