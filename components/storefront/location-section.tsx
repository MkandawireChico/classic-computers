import Image from "next/image";
import Link from "next/link";
import { getSiteMedia } from "@/lib/data/site-media";
import { getBusinessInfo, getHours } from "@/lib/data/site-settings";
import { getPublicStorageUrl } from "@/lib/storage";

export async function LocationSection() {
  const [[storePhoto], businessInfo, hours] = await Promise.all([
    getSiteMedia("store_photo", 1),
    getBusinessInfo(),
    getHours(),
  ]);

  if (!businessInfo) return null;

  const storePhotoUrl = storePhoto ? getPublicStorageUrl("site-media", storePhoto.storage_path) : null;
  const directionsUrl = businessInfo.address.trim() !== ""
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${businessInfo.name}, ${businessInfo.address}`)}`
    : null;

  return (
    <section aria-labelledby="location-heading" className="border-t border-slate-200 bg-white">
      <div className="section-shell grid gap-8 py-14 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:gap-14 lg:py-20">
        {storePhotoUrl ? (
          <div className="relative aspect-[16/10] overflow-hidden rounded-xl border border-slate-200 bg-slate-100">
            <Image
              src={storePhotoUrl}
              alt={storePhoto?.alt_text?.trim() || "Classic Computers store in Blantyre"}
              fill
              sizes="(max-width: 1023px) 100vw, 52vw"
              className="object-cover"
            />
          </div>
        ) : (
          <div className="flex min-h-[260px] flex-col justify-between rounded-xl border border-slate-200 bg-surface-muted p-7 sm:min-h-[340px] sm:p-9">
            <p className="text-xs font-extrabold uppercase tracking-[0.16em] text-brand-700">Classic Computers</p>
            <div>
              <h3 className="max-w-md text-3xl font-extrabold leading-tight tracking-tight text-navy-900">Your local technology shop in Blantyre.</h3>
              <p className="mt-3 text-sm leading-6 text-slate-600">Visit us for product enquiries and service support.</p>
            </div>
          </div>
        )}

        <div className="min-w-0">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-700">Find our shop</p>
          <h2 id="location-heading" className="mt-3 text-3xl font-extrabold leading-[1.05] tracking-[-0.05em] text-navy-900 sm:text-4xl">
            Visit Classic Computers in Blantyre.
          </h2>
          <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
            Visit the shop or contact the team for help with products, rentals, repairs and business supply.
          </p>

          <div className="mt-7 divide-y divide-slate-200 border-y border-slate-200">
            {businessInfo.address.trim() !== "" ? (
              <div className="py-4">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-500">Address</p>
                <p className="mt-1 text-sm font-semibold leading-6 text-slate-800">{businessInfo.address}</p>
                {directionsUrl ? (
                  <a href={directionsUrl} target="_blank" rel="noopener noreferrer" className="mt-2 inline-flex min-h-8 items-center rounded-sm text-sm font-bold text-brand-800 underline underline-offset-4 hover:text-brand-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
                    Get directions ↗
                  </a>
                ) : null}
              </div>
            ) : null}
            {hours?.enabled && hours.schedule ? (
              <div className="py-4">
                <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-slate-500">Business hours</p>
                <p className="mt-1 text-sm font-semibold leading-6 text-slate-800">{hours.schedule}</p>
              </div>
            ) : null}
          </div>

          <div className="mt-5 grid grid-cols-1 gap-2.5 md:grid-cols-3">
            {businessInfo.phone ? (
              <a
                href={`tel:${businessInfo.phone}`}
                aria-label={`Call Classic Computers at ${businessInfo.phone}`}
                className="group flex min-h-[68px] min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition-colors hover:border-brand-300 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-800 transition-colors group-hover:bg-white">
                  <PhoneIcon />
                </span>
                <span className="min-w-0">
                  <span className="block text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">Call us</span>
                  <span className="mt-1 block break-words text-sm font-bold leading-5 text-navy-900 [overflow-wrap:anywhere]">{businessInfo.phone}</span>
                </span>
              </a>
            ) : null}
            {businessInfo.email ? (
              <a
                href={`mailto:${businessInfo.email}`}
                aria-label={`Email Classic Computers at ${businessInfo.email}`}
                className="group flex min-h-[68px] min-w-0 items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 transition-colors hover:border-brand-300 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-800 transition-colors group-hover:bg-white">
                  <MailIcon />
                </span>
                <span className="min-w-0">
                  <span className="block text-[10px] font-extrabold uppercase tracking-[0.14em] text-slate-500">Email us</span>
                  <span className="mt-1 block break-words text-sm font-bold leading-5 text-navy-900 [overflow-wrap:anywhere]">{businessInfo.email}</span>
                </span>
              </a>
            ) : null}
            {businessInfo.whatsapp ? (
              <a
                href={`https://wa.me/${businessInfo.whatsapp.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Message Classic Computers on WhatsApp"
                className="group flex min-h-[68px] min-w-0 items-center gap-3 rounded-xl border border-green-200 bg-green-50/70 px-4 py-3 transition-colors hover:border-green-300 hover:bg-green-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-green-100 text-green-800 transition-colors group-hover:bg-white">
                  <WhatsAppIcon />
                </span>
                <span className="min-w-0">
                  <span className="block text-[10px] font-extrabold uppercase tracking-[0.14em] text-green-800">WhatsApp</span>
                  <span className="mt-1 block text-sm font-bold leading-5 text-green-900">Chat with our team</span>
                </span>
              </a>
            ) : null}
          </div>
          <Link href="/contact" className="mt-7 inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700 transition-colors hover:border-brand-300 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
            Contact our team
          </Link>
        </div>
      </div>
    </section>
  );
}

function PhoneIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M5 4h3l2 5-2 1.5a15 15 0 005.5 5.5L15 14l5 2v3a2 2 0 01-2 2C10 21 3 14 3 6a2 2 0 012-2z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.7" />
      <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="19" height="19" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M20 11.7a8.2 8.2 0 01-12.1 7.2L4 20l1.1-3.7A8.2 8.2 0 1120 11.7z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 8.5c.3-.5.6-.5.9-.5l.6 1.5-.7.9c.6 1.1 1.5 2 2.6 2.6l.9-.7 1.5.6c0 .3 0 .6-.5.9-.6.4-1.2.5-1.9.3-2.2-.6-4-2.4-4.6-4.6-.2-.7-.1-1.3.2-1.9z" fill="currentColor" />
    </svg>
  );
}
