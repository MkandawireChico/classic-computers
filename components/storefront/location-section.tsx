import Image from "next/image";
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
  const directionsUrl =
    businessInfo.address.trim() !== ""
      ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(`${businessInfo.name}, ${businessInfo.address}`)}`
      : null;

  return (
    <section aria-labelledby="location-heading" className="section-shell pb-16 sm:pb-20 lg:pb-24">
      <div className="overflow-hidden rounded-3xl border border-brand-100 bg-gradient-to-br from-brand-50 via-white to-emerald-50/60 p-5 shadow-xl shadow-brand-900/5 sm:p-8 lg:p-10">
        <div className={`grid items-center gap-7 ${storePhotoUrl ? "md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-10" : ""}`}>
          {storePhoto && storePhotoUrl ? (
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-2xl bg-brand-100 shadow-lg shadow-brand-900/10 ring-1 ring-white/80">
              <Image
                src={storePhotoUrl}
                alt={storePhoto.alt_text}
                fill
                sizes="(max-width: 767px) calc(100vw - 64px), (max-width: 1279px) 40vw, 520px"
                className="object-cover"
              />
            </div>
          ) : null}
          <div>
            <div className="mb-6 space-y-3">
              <p className="inline-flex rounded-full border border-brand-200 bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-[0.18em] text-brand-700 shadow-sm">
                Find us
              </p>
              <h2 id="location-heading" className="text-h2 font-extrabold leading-tight text-slate-900">
                Visit us <span className="text-brand-700">or get in touch</span>
              </h2>
              <p className="max-w-xl text-sm leading-relaxed text-slate-600 sm:text-base">
                We&apos;re here to help with your computer and technology needs.
              </p>
            </div>
            <div className="grid gap-4 text-base text-slate-700 xl:grid-cols-2">
              <div className="space-y-3 rounded-2xl border border-brand-100 bg-white/90 p-5 shadow-md shadow-brand-900/5 sm:p-6">
                <p className="font-bold text-brand-800">{businessInfo.name}</p>
                {businessInfo.address.trim() !== "" ? <p className="leading-relaxed text-slate-700">{businessInfo.address}</p> : null}
                {hours?.enabled && hours.schedule ? <p className="border-t border-brand-100 pt-3 text-sm leading-relaxed text-slate-600">{hours.schedule}</p> : null}
                {directionsUrl ? (
                  <a
                    href={directionsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex min-h-11 items-center rounded-lg bg-brand-700 px-4 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2"
                  >
                    Get directions
                    <span aria-hidden="true" className="ml-1.5">↗</span>
                  </a>
                ) : null}
              </div>
              <div className="space-y-3 rounded-2xl border border-emerald-100 bg-white/90 p-5 shadow-md shadow-emerald-900/5 sm:p-6">
                {businessInfo.phone ? (
                  <a href={`tel:${businessInfo.phone}`} aria-label={`Call ${businessInfo.phone}`} className="flex min-h-14 items-center gap-3 rounded-xl p-2 font-semibold text-brand-700 transition-colors hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700"><PhoneIcon /></span>
                    <span><span className="mb-0.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">Call</span>{businessInfo.phone}</span>
                  </a>
                ) : null}
                {businessInfo.phone_alt && businessInfo.phone_alt !== businessInfo.phone ? (
                  <a href={`tel:${businessInfo.phone_alt}`} aria-label={`Call ${businessInfo.phone_alt}`} className="flex min-h-14 items-center gap-3 rounded-xl p-2 font-semibold text-brand-700 transition-colors hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700"><PhoneIcon /></span>
                    <span><span className="mb-0.5 block text-[11px] font-bold uppercase tracking-wider text-slate-500">Or call</span>{businessInfo.phone_alt}</span>
                  </a>
                ) : null}
                {businessInfo.email ? (
                  <a href={`mailto:${businessInfo.email}`} aria-label={`Email ${businessInfo.email}`} className="flex min-h-14 items-center gap-3 rounded-xl p-2 font-semibold text-brand-700 transition-colors hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-100 text-brand-700"><EmailIcon /></span>
                    <span className="min-w-0 break-all">{businessInfo.email}</span>
                  </a>
                ) : null}
                {businessInfo.whatsapp ? (
                  <p>
                    <a
                      href={`https://wa.me/${businessInfo.whatsapp.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Message us on WhatsApp"
                      className="flex min-h-14 items-center gap-3 rounded-xl p-2 font-semibold text-emerald-700 transition-colors hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700"
                    >
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700"><WhatsAppIcon /></span>
                      <span><span className="mb-0.5 block text-[11px] font-bold uppercase tracking-wider text-emerald-700">WhatsApp</span>{businessInfo.whatsapp}</span>
                    </a>
                  </p>
                ) : null}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function PhoneIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
      <path d="M7.5 3.5h2l1.25 4-1.75 1.75a14.5 14.5 0 0 0 5.75 5.75l1.75-1.75 4 1.25v2c0 1.1-.9 2-2 2C11.6 18.5 5.5 12.4 5.5 5.5c0-1.1.9-2 2-2Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
      <path d="M20 11.5a8 8 0 0 1-11.9 7L4 20l1.5-4.1A8 8 0 1 1 20 11.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 8.5c.25-.45.55-.45.8-.08l.7 1c.18.25.15.48-.08.7l-.5.5c.45.8 1.1 1.45 1.9 1.9l.5-.5c.22-.23.45-.26.7-.08l1 .7c.37.25.37.55-.08.8-.55.32-1.2.27-1.9-.12a8.2 8.2 0 0 1-2.82-2.82c-.39-.7-.44-1.35-.12-1.9Z" fill="currentColor" />
    </svg>
  );
}
