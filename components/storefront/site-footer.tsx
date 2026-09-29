import Link from "next/link";
import { getBusinessInfo, getHours } from "@/lib/data/site-settings";

const SHOP_LINKS = [
  { href: "/shop", label: "All products" },
  { href: "/shop/laptop-computers", label: "Laptops" },
  { href: "/shop?q=phone", label: "Phones" },
  { href: "/shop?query=monitor", label: "Monitors" },
];

const SERVICE_LINKS = [
  { href: "/rentals", label: "Rentals" },
  { href: "/repairs", label: "Repairs" },
  { href: "/corporate", label: "Corporate supply" },
  { href: "/student-deals", label: "Student deals" },
];

const INFO_LINKS = [
  { href: "/about", label: "About us" },
  { href: "/contact", label: "Contact" },
  { href: "/warranty", label: "Warranty" },
  { href: "/returns", label: "Returns" },
  { href: "/privacy", label: "Privacy policy" },
  { href: "/terms", label: "Terms" },
];

export async function SiteFooter() {
  const [businessInfo, hours] = await Promise.all([getBusinessInfo(), getHours()]);

  return (
    <footer className="border-t border-surface-border bg-slate-950 text-slate-200">
      <div className="mx-auto grid max-w-7xl grid-cols-2 gap-8 px-4 py-10 sm:grid-cols-4 sm:px-6 lg:px-8">
        <FooterColumn title="Shop" links={SHOP_LINKS} />
        <FooterColumn title="Services" links={SERVICE_LINKS} />
        <FooterColumn title="Information" links={INFO_LINKS} />

        <div>
          <h3 className="mb-3 text-sm font-semibold text-white">Visit us</h3>
            <address className="min-w-0 space-y-1 text-sm not-italic text-slate-300">
            {businessInfo?.address ? <p>{businessInfo.address}</p> : null}
            {businessInfo?.address ? (
              <a
                href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${businessInfo.name}, ${businessInfo.address}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-200 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-200"
              >
                <span>Get directions in Google Maps</span>
                <span aria-hidden="true">↗</span>
              </a>
            ) : null}
            {businessInfo?.phone ? (
              <p>
                <a href={`tel:${businessInfo.phone}`} className="transition-colors hover:text-brand-200">
                  {businessInfo.phone}
                </a>
              </p>
            ) : null}
            {businessInfo?.email ? (
              <p>
                  <a href={`mailto:${businessInfo?.email}`} className="break-words transition-colors hover:text-brand-200">
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
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-300 transition-colors hover:text-emerald-200"
            >
              Chat on WhatsApp
            </a>
          ) : null}
        </div>
      </div>

      <div className="border-t border-slate-800 px-4 py-4 text-center text-xs text-slate-400 sm:px-6 lg:px-8">
        © {new Date().getFullYear()} Classic Computers LLC. Blantyre, Malawi.
      </div>
    </footer>
  );
}

function FooterColumn({ title, links }: { title: string; links: { href: string; label: string }[] }) {
  return (
    <div>
      <h3 className="mb-3 text-sm font-semibold text-white">{title}</h3>
      <ul className="space-y-2">
        {links.map((link) => (
          <li key={link.href}>
            <Link href={link.href} className="text-sm text-slate-300 transition-colors hover:text-brand-200">
              {link.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
