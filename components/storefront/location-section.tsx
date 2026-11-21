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

          <div className="mt-5 flex flex-wrap gap-x-5 gap-y-3 text-sm">
            {businessInfo.phone ? <a href={`tel:${businessInfo.phone}`} aria-label={`Call Classic Computers at ${businessInfo.phone}`} className="inline-flex min-h-8 items-center font-bold text-brand-800 underline-offset-4 hover:text-brand-950 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">{businessInfo.phone}</a> : null}
            {businessInfo.email ? <a href={`mailto:${businessInfo.email}`} aria-label={`Email Classic Computers at ${businessInfo.email}`} className="inline-flex min-h-8 items-center font-bold text-brand-800 underline-offset-4 hover:text-brand-950 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">{businessInfo.email}</a> : null}
            {businessInfo.whatsapp ? <a href={`https://wa.me/${businessInfo.whatsapp.replace(/[^0-9]/g, "")}`} target="_blank" rel="noopener noreferrer" aria-label="Message Classic Computers on WhatsApp" className="inline-flex min-h-8 items-center font-bold text-brand-800 underline-offset-4 hover:text-brand-950 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">WhatsApp</a> : null}
          </div>
          <Link href="/contact" className="mt-7 inline-flex min-h-11 items-center justify-center rounded-lg border border-slate-300 bg-white px-5 text-sm font-bold text-slate-700 transition-colors hover:border-brand-300 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
            Contact our team
          </Link>
        </div>
      </div>
    </section>
  );
}
