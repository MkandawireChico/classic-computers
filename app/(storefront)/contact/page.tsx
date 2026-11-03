import type { ReactNode } from "react";
import type { Metadata } from "next";
import Link from "next/link";
import { getBusinessInfo, getHours } from "@/lib/data/site-settings";
import { createClient } from "@/lib/supabase/server";
import { GeneralEnquiryForm } from "@/components/storefront/general-enquiry-form";

export const metadata: Metadata = {
  title: "Contact Us",
  description:
    "Contact Classic Computers in Blantyre for product questions, orders, rentals, repairs and ICT supply.",
};

export default async function ContactPage() {
  const supabase = createClient();
  const [
    businessInfo,
    hours,
    {
      data: { user },
    },
  ] = await Promise.all([getBusinessInfo(), getHours(), supabase.auth.getUser()]);
  const directionsUrl = businessInfo?.address
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${businessInfo.name}, ${businessInfo.address}`)}`
    : null;

  return (
    <div className="bg-gradient-to-b from-brand-50/70 via-white to-slate-50">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <nav aria-label="Breadcrumb" className="mb-5 text-sm text-slate-500">
          <Link
            href="/"
            className="font-medium hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
          >
            Home
          </Link>
          <span aria-hidden="true" className="mx-2">
            /
          </span>
          <span aria-current="page" className="font-semibold text-slate-700">
            Contact
          </span>
        </nav>

        <header className="rounded-3xl border border-brand-100 bg-gradient-to-br from-white via-brand-50 to-emerald-50 p-6 shadow-sm sm:p-9 lg:p-12">
          <p className="inline-flex rounded-full border border-brand-200 bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-brand-800">
            Get in touch
          </p>
          <h1 className="mt-4 max-w-3xl text-3xl font-black leading-tight text-slate-950 sm:text-4xl lg:text-5xl">
            We&apos;re here to help
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-slate-600 sm:text-lg">
            Have a question about a laptop, need help choosing a computer, or looking for ICT
            equipment for your organisation? Our team can help with product enquiries, orders,
            rentals, repairs and corporate supply.
          </p>
        </header>

        <div className="mt-7 grid items-start gap-6 lg:mt-9 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8">
          <section
            aria-labelledby="contact-options-heading"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
          >
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-800">
              Contact details
            </p>
            <h2 id="contact-options-heading" className="mt-2 text-2xl font-black text-slate-900">
              Reach our team
            </h2>
            <div className="mt-5 space-y-3">
              {businessInfo?.phone ? (
                <ContactDetail
                  label="Phone"
                  value={businessInfo.phone}
                  href={`tel:${businessInfo.phone.replace(/[^\d+]/g, "")}`}
                  icon={<PhoneIcon />}
                  tone="brand"
                  compactLabel
                />
              ) : null}
              {businessInfo?.phone_alt && businessInfo.phone_alt !== businessInfo.phone ? (
                <ContactDetail
                  label="Phone"
                  value={businessInfo.phone_alt}
                  href={`tel:${businessInfo.phone_alt.replace(/[^\d+]/g, "")}`}
                  icon={<PhoneIcon />}
                  tone="brand"
                  compactLabel
                />
              ) : null}
              {businessInfo?.email ? (
                <ContactDetail
                  label="Email"
                  value={businessInfo.email}
                  href={`mailto:${businessInfo.email}`}
                  icon={<EmailIcon />}
                  tone="violet"
                />
              ) : null}
              {businessInfo?.whatsapp ? (
                <ContactDetail
                  label="WhatsApp"
                  value={businessInfo.whatsapp}
                  href={`https://wa.me/${businessInfo.whatsapp.replace(/[^0-9]/g, "")}`}
                  icon={<WhatsAppIcon />}
                  tone="emerald"
                  compactLabel
                  external
                />
              ) : null}
            </div>

            {businessInfo?.address ? (
              <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-800">
                    <LocationIcon />
                  </span>
                  <div className="min-w-0">
                    <h3 className="font-bold text-slate-900">Visit our shop</h3>
                    <p className="mt-1 text-sm leading-6 text-slate-600">{businessInfo.address}</p>
                  </div>
                </div>
                {directionsUrl ? (
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 inline-flex min-h-10 items-center rounded-lg px-2 text-sm font-bold text-brand-700 underline decoration-brand-300 underline-offset-4 hover:text-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                  >
                    Get directions{" "}
                    <span aria-hidden="true" className="ml-1">
                      ↗
                    </span>
                  </a>
                ) : null}
              </div>
            ) : null}

            {hours?.enabled && hours.schedule ? (
              <div className="mt-4 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50/70 p-4">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white text-amber-800">
                  <ClockIcon />
                </span>
                <div>
                  <h3 className="font-bold text-slate-900">Business hours</h3>
                  <p className="mt-1 text-sm leading-6 text-slate-600">{hours.schedule}</p>
                </div>
              </div>
            ) : null}

            <div className="mt-6 border-t border-slate-200 pt-5">
              <p className="text-sm font-bold text-slate-800">Looking for a specific service?</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {[
                  { href: "/rentals", label: "Laptop rentals" },
                  { href: "/repairs", label: "Repairs" },
                  { href: "/corporate", label: "Corporate supply" },
                ].map(({ href, label }) => (
                  <Link
                    key={href}
                    href={href}
                    className="inline-flex min-h-9 items-center rounded-full border border-slate-200 bg-white px-3 text-xs font-semibold text-slate-700 hover:border-brand-300 hover:bg-brand-50 hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                  >
                    {label}
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <section
            aria-labelledby="contact-form-heading"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7"
          >
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">
              Send an enquiry
            </p>
            <h2 id="contact-form-heading" className="mt-2 text-2xl font-black text-slate-900">
              How can we help?
            </h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Share a few details and include a phone number or email so we can respond.
            </p>
            <div className="mt-6">
              <GeneralEnquiryForm isAuthenticated={Boolean(user)} />
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function ContactDetail({
  label,
  value,
  href,
  icon,
  tone,
  external = false,
  compactLabel = false,
}: {
  label: string;
  value: string;
  href: string;
  icon: ReactNode;
  tone: "brand" | "violet" | "emerald";
  external?: boolean;
  compactLabel?: boolean;
}) {
  const toneClasses = {
    brand: "bg-brand-50 text-brand-800 ring-brand-100",
    violet: "bg-violet-50 text-violet-800 ring-violet-100",
    emerald: "bg-emerald-50 text-emerald-800 ring-emerald-100",
  };

  return (
    <a
      href={href}
      aria-label={external ? `${label}: ${value} (opens in a new tab)` : `${label}: ${value}`}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      className="flex min-h-16 min-w-0 items-center gap-3 rounded-xl border border-slate-100 p-3 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
    >
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${toneClasses[tone]}`}
      >
        {icon}
      </span>
      <span className="min-w-0">
        <span
          className={
            compactLabel
              ? "sr-only"
              : "block text-xs font-bold uppercase tracking-wider text-slate-500"
          }
        >
          {label}
        </span>
        <span className="mt-0.5 block break-all text-sm font-bold text-slate-800">{value}</span>
      </span>
    </a>
  );
}

function PhoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M7.5 3.5h2l1.25 4-1.75 1.75a14.5 14.5 0 0 0 5.75 5.75l1.75-1.75 4 1.25v2c0 1.1-.9 2-2 2C11.6 18.5 5.5 12.4 5.5 5.5c0-1.1.9-2 2-2Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="m4 7 8 6 8-6"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx="12" cy="10" r="2.5" stroke="currentColor" strokeWidth="1.7" />
    </svg>
  );
}

function ClockIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.7" />
      <path
        d="M12 7v5l3 2"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M20 11.5a8 8 0 0 1-11.9 7L4 20l1.5-4.1A8 8 0 1 1 20 11.5Z"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9 8.5c.25-.45.55-.45.8-.08l.7 1c.18.25.15.48-.08.7l-.5.5c.45.8 1.1 1.45 1.9 1.9l.5-.5c.22-.23.45-.26.7-.08l1 .7c.37.25.37.55-.08.8-.55.32-1.2.27-1.9-.12a8.2 8.2 0 0 1-2.82-2.82c-.39-.7-.44-1.35-.12-1.9Z"
        fill="currentColor"
      />
    </svg>
  );
}
