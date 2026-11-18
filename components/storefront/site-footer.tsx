import Link from "next/link";
import Image from "next/image";
import { getSiteMedia } from "@/lib/data/site-media";
import { getPublicStorageUrl } from "@/lib/storage";
import { getBusinessInfo, getHours } from "@/lib/data/site-settings";

const FOOTER_COLUMNS = [
  {
    title: "Shop",
    color: "text-cyan-300",
    hover: "hover:text-cyan-200 hover:translate-x-1 focus-visible:ring-cyan-300",
    links: [
      { href: "/shop", label: "All products" },
      { href: "/shop/laptop-computers", label: "Laptops" },
      { href: "/shop?q=phone", label: "Phones" },
      { href: "/shop?query=monitor", label: "Monitors" },
    ],
  },
  {
    title: "Services",
    color: "text-cyan-300",
    hover: "hover:text-cyan-200 hover:translate-x-1 focus-visible:ring-cyan-300",
    links: [
      { href: "/rentals", label: "Rentals" },
      { href: "/repairs", label: "Repairs" },
      { href: "/corporate", label: "Corporate supply" },
      { href: "/student-deals", label: "Student deals" },
    ],
  },
  {
    title: "Information",
    color: "text-cyan-300",
    hover: "hover:text-cyan-200 hover:translate-x-1 focus-visible:ring-cyan-300",
    links: [
      { href: "/about", label: "About us" },
      { href: "/contact", label: "Contact" },
      { href: "/warranty", label: "Warranty" },
      { href: "/returns", label: "Returns" },
      { href: "/privacy", label: "Privacy policy" },
      { href: "/terms", label: "Terms" },
    ],
  },
];

export async function SiteFooter() {
  const [businessInfo, hours, footerLogoMedia, headerLogoMedia] = await Promise.all([
    getBusinessInfo(),
    getHours(),
    getSiteMedia("footer_logo", 1),
    getSiteMedia("logo", 1),
  ]);
  const logo = footerLogoMedia[0] ?? headerLogoMedia[0] ?? null;
  const logoUrl = logo ? getPublicStorageUrl("site-media", logo.storage_path) : null;

  return (
    <footer className="border-t border-[#31516b] bg-gradient-to-br from-[#17344d] via-[#1b3c56] to-[#153149] text-slate-100">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <div className="mb-10 flex flex-col gap-4 border-b border-white/25 pb-8 sm:flex-row sm:items-center">
          {logoUrl ? (
            <div className="relative h-14 w-40 shrink-0 overflow-hidden rounded-lg bg-white p-2">
              <Image src={logoUrl} alt={logo?.alt_text ?? "Classic Computers logo"} fill sizes="160px" className="object-contain p-2" />
            </div>
          ) : (
            <p className="text-xl font-black tracking-tight text-white">Classic <span className="text-cyan-300">Computers</span></p>
          )}
          <p className="max-w-md text-sm leading-6 text-slate-100">Technology for work, business and everyday life. Sales, rentals, repairs and ICT support in Blantyre.</p>
        </div>
        <div className="grid grid-cols-2 items-start gap-x-4 gap-y-8 sm:gap-x-8 sm:gap-y-10 lg:grid-cols-4 lg:gap-12">
          {/* Navigation Columns */}
          <div className="contents">
            {FOOTER_COLUMNS.map((column) => (
              <FooterColumn key={column.title} {...column} />
            ))}
          </div>

          {/* Contact Section */}
          <div className="min-w-0 space-y-5">
            <h3 className="text-base font-extrabold text-white">Contact us</h3>

            <div className="space-y-4">
              {businessInfo?.address ? (
                <div className="space-y-2">
                  <div className="flex items-start gap-3">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <circle cx="12" cy="10" r="3" stroke="currentColor" strokeWidth="2" />
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-bold uppercase tracking-wider text-slate-200">
                        Address
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-slate-100">
                        {businessInfo.address}
                      </p>
                    </div>
                  </div>
                  {businessInfo.address ? (
                    <a
                      href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${businessInfo.name}, ${businessInfo.address}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-sm font-bold text-cyan-300 transition-colors hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        aria-hidden="true"
                      >
                        <path
                          d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <polyline
                          points="15 3 21 3 21 9"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <line
                          x1="10"
                          y1="14"
                          x2="21"
                          y2="3"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      Get directions
                    </a>
                  ) : null}
                </div>
              ) : null}

              {hours?.enabled && hours.schedule ? (
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" />
                      <path
                        d="M12 6v6l4 2"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Hours
                    </p>
                    <p className="mt-1 text-sm text-slate-100">{hours.schedule}</p>
                  </div>
                </div>
              ) : null}

              {businessInfo?.phone ? (
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Phone
                    </p>
                    <a
                      href={`tel:${businessInfo.phone}`}
                      className="mt-1 block text-sm font-bold text-white transition-colors hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                    >
                      {businessInfo.phone}
                    </a>
                  </div>
                </div>
              ) : null}

              {businessInfo?.email ? (
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-cyan-400/10 text-cyan-300">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path
                        d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2Z"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                      <path
                        d="M22 6l-10 7L2 6"
                        stroke="currentColor"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      Email
                    </p>
                    <a
                      href={`mailto:${businessInfo.email}`}
                      className="mt-1 block break-all text-sm font-bold text-white transition-colors hover:text-cyan-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                    >
                      {businessInfo.email}
                    </a>
                  </div>
                </div>
              ) : null}

              {businessInfo?.whatsapp ? (
                <a
                  href={`https://wa.me/${businessInfo.whatsapp.replace(/[^0-9]/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Message us on WhatsApp"
                  className="group flex items-start gap-3 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950"
                >
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-emerald-500/20 text-brand-300">
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.198-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.611-.916-2.206-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.875 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.693.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64.001 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.89c-.001 2.096.547 4.142 1.588 5.946L.057 24l6.304-1.654a11.88 11.88 0 0 0 5.684 1.447h.005c6.554 0 11.89-5.335 11.893-11.89a11.82 11.82 0 0 0-3.48-8.414Z" />
                    </svg>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold uppercase tracking-wider text-slate-400">
                      WhatsApp
                    </p>
                    <span className="mt-1 block break-words text-sm font-bold text-white transition-colors group-hover:text-brand-200">
                      {businessInfo.whatsapp}
                    </span>
                  </div>
                </a>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      {/* Copyright Bar */}
      <div className="border-t border-white/20 bg-[#10283d] px-4 py-5 sm:px-6 sm:py-6 lg:px-8">
        <div className="mx-auto max-w-7xl text-center text-xs text-slate-200 sm:text-sm">
          © {new Date().getFullYear()} Classic Computers LLC. Blantyre, Malawi.
        </div>
      </div>
    </footer>
  );
}

function FooterColumn({
  title,
  links,
  color,
  hover,
}: {
  title: string;
  color: string;
  hover: string;
  links: { href: string; label: string }[];
}) {
  return (
    <div className="min-w-0">
      <h3 className={`mb-4 text-sm font-extrabold uppercase tracking-wider ${color}`}>{title}</h3>
      <ul className="space-y-3">
        {links.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className={`inline-flex min-h-8 items-center text-sm text-slate-300 transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 ${hover}`}
            >
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
