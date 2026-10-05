import Image from "next/image";
import Link from "next/link";
import { getSiteMedia } from "@/lib/data/site-media";
import { getPublicStorageUrl } from "@/lib/storage";

export async function Hero() {
  const [hero] = await getSiteMedia("homepage_hero", 1);
  const imageUrl = hero ? getPublicStorageUrl("site-media", hero.storage_path) : null;
  const heroAlt = hero?.alt_text ?? "Classic Computers storefront";

  return (
    <section aria-labelledby="hero-heading" className="border-b border-surface-border bg-gradient-to-br from-brand-50 via-white to-surface-muted/30">
      <div className="section-shell">
        <div className="grid items-center gap-10 py-16 md:py-20 lg:grid-cols-[1.08fr_0.92fr] lg:gap-16 lg:py-24">
          <div className="max-w-xl">
            <p className="mb-5 inline-flex items-center rounded-full bg-brand-500 px-4 py-2 text-sm font-bold uppercase tracking-[0.16em] text-white shadow-md sm:px-5 sm:py-2.5 sm:text-base">
              CLASSIC COMPUTERS
            </p>
            <h1 id="hero-heading" className="text-h1 font-bold text-slate-900 leading-tight">
              Laptops and technology for work, business and everyday life.
            </h1>
            <p className="mt-6 max-w-lg text-lg leading-8 text-slate-700">
              Shop laptops and ICT products from Classic Computers in Blantyre, with options for individuals, students and businesses.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Link
                href="/shop"
                className="inline-flex h-14 items-center justify-center rounded-card bg-brand-500 px-8 text-base font-semibold text-white shadow-lg transition-all duration-200 hover:bg-brand-600 hover:shadow-xl hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                Shop Laptops
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-14 items-center justify-center rounded-card border-2 border-slate-200 bg-white px-8 text-base font-semibold text-slate-800 shadow-md transition-all duration-200 hover:border-brand-400 hover:bg-brand-50 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                Contact Us
              </Link>
            </div>

            <ul className="mt-8 flex flex-wrap gap-3 text-sm text-slate-600" aria-label="Store highlights">
              <li className="rounded-full bg-white px-4 py-2 font-medium shadow-sm ring-1 ring-slate-200">Laptops</li>
              <li className="rounded-full bg-white px-4 py-2 font-medium shadow-sm ring-1 ring-slate-200">ICT products</li>
              <li className="rounded-full bg-white px-4 py-2 font-medium shadow-sm ring-1 ring-slate-200">Business supply</li>
            </ul>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-100 to-slate-50 shadow-2xl">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={heroAlt}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover transition-transform duration-500 hover:scale-105"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <rect x="3" y="3" width="18" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
                      <path d="M8 20h8M12 16v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
                    </svg>
                  </div>
                  <p className="text-base font-semibold text-slate-600">Shop photograph not yet added</p>
                  <p className="max-w-xs text-sm leading-6 text-slate-500">
                    Upload the approved Classic Computers storefront photo via site media settings when it is ready.
                  </p>
                </div>
              )}
            </div>
            <div className="pointer-events-none absolute -bottom-4 left-6 rounded-xl border border-slate-200 bg-white/95 backdrop-blur-sm px-4 py-3 text-sm font-semibold text-slate-800 shadow-lg">
              Blantyre, Malawi
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
