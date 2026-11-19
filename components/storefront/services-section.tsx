import Link from "next/link";

const SERVICES = [
  {
    number: "01",
    href: "/rentals",
    title: "Laptop rentals",
    description: "Ask our team about equipment availability, rental periods and pricing.",
    action: "Explore rentals",
    icon: <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true"><rect x="3" y="3" width="18" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.6" /><path d="M2 21h20l-2-4H4l-2 4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>,
  },
  {
    number: "02",
    href: "/repairs",
    title: "Repairs & support",
    description: "Submit a repair request and follow your ticket through the service process.",
    action: "Book a repair",
    icon: <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  },
  {
    number: "03",
    href: "/student-deals",
    title: "Student deals",
    description: "Visit the student deals page for verification information and current offers.",
    action: "View student deals",
    icon: <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" aria-hidden="true"><path d="m2 9 10-6 10 6-10 6L2 9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /><path d="M6 12v5c3.5 3 8.5 3 12 0v-5M22 9v7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>,
  },
];

export function ServicesSection() {
  return (
    <section aria-labelledby="services-heading" className="bg-[#f3f5f6]">
      <div className="section-shell py-16 sm:py-20 lg:py-24">
        <div className="mb-10 grid gap-5 border-b border-slate-300 pb-8 sm:mb-12 sm:pb-10 lg:grid-cols-[1fr_auto] lg:items-end">
          <div>
            <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-brand-700">More services</p>
            <h2 id="services-heading" className="mt-4 max-w-2xl text-3xl font-semibold leading-[1.05] tracking-[-0.05em] text-[#102033] sm:text-4xl lg:text-5xl">
              Support for every
              <span className="block text-brand-700">stage of your tech journey.</span>
            </h2>
          </div>
          <p className="max-w-sm text-sm leading-7 text-slate-600 sm:text-base">Need equipment temporarily, a repair, or a student offer? Start here.</p>
        </div>

        <div className="grid gap-px overflow-hidden border border-slate-300 bg-slate-300 md:grid-cols-3">
          {SERVICES.map((service) => (
            <Link key={service.href} href={service.href} className="group flex min-h-[280px] flex-col bg-white p-6 transition-colors hover:bg-[#f8fbfc] sm:p-8 lg:min-h-[320px]">
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs text-slate-400">{service.number}</span>
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#e8f5fa] text-brand-800 transition duration-300 group-hover:scale-105 group-hover:bg-brand-700 group-hover:text-white">{service.icon}</span>
              </div>
              <div className="mt-auto pt-12">
                <h3 className="text-xl font-bold tracking-tight text-[#102033] sm:text-2xl">{service.title}</h3>
                <p className="mt-3 min-h-[52px] text-sm leading-6 text-slate-600">{service.description}</p>
                <span className="mt-6 inline-flex items-center gap-3 text-sm font-extrabold text-brand-800 transition group-hover:gap-5">
                  {service.action} <span aria-hidden="true">↗</span>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}