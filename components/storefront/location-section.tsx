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

  return (
    <section className="section-shell pb-10 sm:pb-12">
      <div className="rounded-panel border border-surface-border bg-white p-6 sm:p-8">
        <div className={`grid items-center gap-6 ${storePhotoUrl ? "md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-8" : ""}`}>
          {storePhoto && storePhotoUrl ? (
            <div className="relative aspect-[16/10] w-full overflow-hidden rounded-md bg-surface-muted">
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
            <div className="mb-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Visit</p>
              <h2 className="mt-1 text-2xl font-bold text-gray-900">Visit our shop</h2>
            </div>
            <div className="grid gap-5 text-sm text-gray-700 xl:grid-cols-2">
              <div className="space-y-2 rounded-md bg-surface-muted p-4">
                <p className="font-semibold text-gray-900">{businessInfo.name}</p>
                <p>{businessInfo.address}</p>
                {hours?.enabled && hours.schedule ? <p className="text-gray-600">{hours.schedule}</p> : null}
              </div>
              <div className="space-y-3 rounded-md bg-surface-muted p-4">
                {businessInfo.phone ? (
                  <a href={`tel:${businessInfo.phone}`} aria-label={`Call ${businessInfo.phone}`} className="flex items-center gap-3 font-medium text-brand-600 hover:underline">
                    <PhoneIcon />
                    <span>{businessInfo.phone}</span>
                  </a>
                ) : null}
                {businessInfo.email ? (
                  <a href={`mailto:${businessInfo.email}`} aria-label={`Email ${businessInfo.email}`} className="flex items-center gap-3 font-medium text-brand-600 hover:underline">
                    <EmailIcon />
                    <span>{businessInfo.email}</span>
                  </a>
                ) : null}
                {businessInfo.whatsapp ? (
                  <p>
                    <a
                      href={`https://wa.me/${businessInfo.whatsapp.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label="Message us on WhatsApp"
                      className="flex items-center gap-3 font-medium text-emerald-600 hover:underline"
                    >
                      <WhatsAppIcon />
                      <span>{businessInfo.whatsapp}</span>
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
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
      <path d="M7.5 3.5h2l1.25 4-1.75 1.75a14.5 14.5 0 0 0 5.75 5.75l1.75-1.75 4 1.25v2c0 1.1-.9 2-2 2C11.6 18.5 5.5 12.4 5.5 5.5c0-1.1.9-2 2-2Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function EmailIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
      <rect x="3" y="5" width="18" height="14" rx="2" stroke="currentColor" strokeWidth="1.6" />
      <path d="m4 7 8 6 8-6" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function WhatsAppIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="shrink-0">
      <path d="M20 11.5a8 8 0 0 1-11.9 7L4 20l1.5-4.1A8 8 0 1 1 20 11.5Z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 8.5c.25-.45.55-.45.8-.08l.7 1c.18.25.15.48-.08.7l-.5.5c.45.8 1.1 1.45 1.9 1.9l.5-.5c.22-.23.45-.26.7-.08l1 .7c.37.25.37.55-.08.8-.55.32-1.2.27-1.9-.12a8.2 8.2 0 0 1-2.82-2.82c-.39-.7-.44-1.35-.12-1.9Z" fill="currentColor" />
    </svg>
  );
}
