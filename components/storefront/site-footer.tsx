import Link from "next/link";
import { getBusinessInfo, getHours } from "@/lib/data/site-settings";

const FOOTER_COLUMNS = [
  {
    title: "Shop",
    links: [
      { href: "/shop", label: "All products" },
      { href: "/shop?q=laptop", label: "Laptops" },
      { href: "/reviews", label: "Customer reviews" },
    ],
  },
  {
    title: "Services",
    links: [
      { href: "/rentals", label: "Equipment rentals" },
      { href: "/repairs", label: "Repairs and support" },
      { href: "/repairs/track", label: "Track a repair" },
      { href: "/student-deals", label: "Student deals" },
      { href: "/corporate", label: "Corporate supply" },
    ],
  },
  {
    title: "Help and information",
    links: [
      { href: "/about", label: "About us" },
      { href: "/contact", label: "Contact" },
      { href: "/faq", label: "Frequently asked questions" },
      { href: "/delivery", label: "Delivery and collection" },
      { href: "/warranty", label: "Warranty" },
      { href: "/returns", label: "Returns" },
      { href: "/privacy", label: "Privacy policy" },
      { href: "/terms", label: "Terms and conditions" },
    ],
  },
];

export async function SiteFooter() {
  const [businessInfo, hours] = await Promise.all([getBusinessInfo(), getHours()]);
  const directionsUrl = businessInfo?.address
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${businessInfo.name}, ${businessInfo.address}`)}`
    : null;
  const contactPhones = [
    ...new Set(
      [businessInfo?.phone, businessInfo?.phone_alt].filter(
        (value): value is string => Boolean(value),
      ),
    ),
  ];

  return (
    <footer className="border-t border-slate-200 bg-[#f1f5f7] text-slate-700">
      <div className="section-shell grid gap-10 py-11 sm:py-14 lg:grid-cols-[1.25fr_0.7fr_0.85fr_1fr] lg:gap-12">
        <section className="min-w-0">
          <p className="text-xl font-extrabold tracking-tight text-[#10243a]">Classic <span className="text-brand-700">Computers</span></p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-slate-600">
            Computers, ICT equipment and practical technology support for individuals, students and organisations.
          </p>
          <div className="mt-6 space-y-3 border-t border-slate-200 pt-5 text-sm">
            {businessInfo?.address ? (
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-500">Visit our shop</p>
                <p className="mt-1 max-w-xs leading-6 text-slate-700">{businessInfo.address}</p>
                {directionsUrl ? <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-8 items-center font-bold text-brand-800 underline underline-offset-4 hover:text-brand-950">Get directions ↗</a> : null}
              </div>
            ) : null}
            {hours?.enabled && hours.schedule ? (
              <div>
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-500">Business hours</p>
                <p className="mt-1 leading-6 text-slate-700">{hours.schedule}</p>
              </div>
            ) : null}
          </div>
        </section>

        {FOOTER_COLUMNS.map((column) => (
          <nav key={column.title} aria-label={column.title} className="min-w-0">
            <h2 className="mb-4 text-xs font-extrabold uppercase tracking-[0.16em] text-[#17344d]">{column.title}</h2>
            <ul className="space-y-2.5">
              {column.links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="inline-flex min-h-8 items-center text-sm text-slate-600 transition-colors hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>

      <div className="border-t border-slate-200 bg-white">
        <div className="section-shell flex flex-col gap-3 py-5 text-xs text-slate-500 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Classic Computers LLC. Blantyre, Malawi.</p>
          <div aria-label="Contact details" className="flex flex-wrap gap-x-5 gap-y-2">
            {contactPhones.map((phone) => (
              <a
                key={phone}
                href={`tel:${phone.replace(/[^\\d+]/g, "")}`}
                aria-label={`Call Classic Computers at ${phone}`}
                className="font-semibold text-slate-600 hover:text-brand-800"
              >
                {phone}
              </a>
            ))}
            {businessInfo?.email ? <a href={`mailto:${businessInfo.email}`} className="font-semibold text-slate-600 hover:text-brand-800">{businessInfo.email}</a> : null}
            {businessInfo?.whatsapp ? <a href={`https://wa.me/${businessInfo.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" className="font-semibold text-slate-600 hover:text-brand-800">WhatsApp</a> : null}
          </div>
        </div>
      </div>
    </footer>
  );
}
