import Link from "next/link";
import { getBusinessInfo, getHours } from "@/lib/data/site-settings";

const FOOTER_COLUMNS = [
  {
    title: "Shop",
    color: "text-amber-300",
    hover: "hover:bg-amber-300/10 hover:text-amber-200 focus-visible:ring-amber-300",
    links: [
      { href: "/shop", label: "All products" },
      { href: "/shop/laptop-computers", label: "Laptops" },
      { href: "/shop?q=phone", label: "Phones" },
      { href: "/shop?query=monitor", label: "Monitors" },
    ],
  },
  {
    title: "Services",
    color: "text-emerald-300",
    hover: "hover:bg-emerald-300/10 hover:text-emerald-200 focus-visible:ring-emerald-300",
    links: [
      { href: "/rentals", label: "Rentals" },
      { href: "/repairs", label: "Repairs" },
      { href: "/corporate", label: "Corporate supply" },
      { href: "/student-deals", label: "Student deals" },
    ],
  },
  {
    title: "Information",
    color: "text-violet-300",
    hover: "hover:bg-violet-300/10 hover:text-violet-200 focus-visible:ring-violet-300",
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
  const [businessInfo, hours] = await Promise.all([getBusinessInfo(), getHours()]);

  return (
    <footer className="border-t border-slate-800 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 text-slate-200">
      <div className="section-shell py-8 sm:py-10">
        <div className="grid grid-cols-3 gap-3 sm:gap-6 lg:gap-10">
          {FOOTER_COLUMNS.map((column) => (
            <FooterColumn key={column.title} {...column} />
          ))}
        </div>

        <div className="mt-7 rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:mt-8 sm:p-5">
          <h3 className="mb-3 text-sm font-bold text-amber-200">Visit us</h3>
          <address className="grid min-w-0 gap-4 text-sm not-italic leading-relaxed text-slate-200 sm:grid-cols-2 lg:grid-cols-4">
            {businessInfo?.address ? <p className="break-words">{businessInfo.address}</p> : null}
            {businessInfo?.address ? (
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${businessInfo.name}, ${businessInfo.address}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex min-h-9 items-center gap-1.5 rounded-md text-sm font-semibold text-emerald-300 transition-colors hover:text-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
              >
                <span>Get directions in Google Maps</span>
                <span aria-hidden="true">↗</span>
              </a>
            ) : null}
            {businessInfo?.phone ? (
              <p>
                <a href={`tel:${businessInfo.phone}`} className="font-medium text-slate-100 transition-colors hover:text-amber-200">
                  {businessInfo.phone}
                </a>
              </p>
            ) : null}
            {businessInfo?.email ? (
              <p>
                <a href={`mailto:${businessInfo.email}`} className="break-all font-medium text-slate-100 transition-colors hover:text-violet-200">
                  {businessInfo.email}
                </a>
              </p>
            ) : null}
            {hours?.enabled && hours.schedule ? <p>{hours.schedule}</p> : null}
          </address>
          {businessInfo?.whatsapp ? (
            <a
              href={`https://wa.me/${businessInfo.whatsapp.replace(/[^0-9]/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-3 inline-flex min-h-9 items-center gap-1.5 rounded-md text-sm font-semibold text-emerald-300 transition-colors hover:text-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-300"
            >
              Chat on WhatsApp
            </a>
          ) : null}
        </div>
      </div>

      <div className="border-t border-white/10 px-4 py-4 text-center text-xs text-slate-400 sm:px-6 lg:px-8">
        © {new Date().getFullYear()} Classic Computers LLC. Blantyre, Malawi.
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
      <h3 className={`mb-3 text-sm font-bold ${color}`}>{title}</h3>
      <ul className="space-y-0.5 sm:space-y-1">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className={`inline-flex min-h-8 items-center rounded-md px-1.5 -ml-1.5 text-xs text-slate-200 transition-colors focus-visible:outline-none focus-visible:ring-2 sm:min-h-9 sm:px-2 sm:text-sm ${hover}`}>
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
