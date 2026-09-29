import Image from "next/image";
import Link from "next/link";
import { getSiteMedia } from "@/lib/data/site-media";
import { getPublicStorageUrl } from "@/lib/storage";

export async function Hero() {
  const [hero] = await getSiteMedia("homepage_hero", 1);
  const imageUrl = hero ? getPublicStorageUrl("site-media", hero.storage_path) : null;
  const heroAlt = hero?.alt_text ?? "Classic Computers storefront";

  return (
    <section aria-labelledby="hero-heading" className="border-b border-surface-border bg-white">
      <div className="section-shell">
        <div className="grid items-center gap-8 py-12 md:py-16 lg:grid-cols-[1.08fr_0.92fr] lg:gap-12 lg:py-20">
          <div className="max-w-xl">
            <p className="mb-4 inline-flex items-center rounded-md bg-brand-50 px-3 py-1.5 text-[11px] font-semibold uppercase tracking-[0.12em] text-brand-700">
              CLASSIC COMPUTERS
            </p>
            <h1 id="hero-heading" className="text-4xl font-bold leading-tight text-slate-900 sm:text-5xl">
              Laptops and technology for work, business and everyday life.
            </h1>
            <p className="mt-4 max-w-lg text-base leading-7 text-slate-700 sm:text-lg">
              Shop laptops and ICT products from Classic Computers in Blantyre, with options for individuals, students and businesses.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/shop"
                className="inline-flex h-12 items-center justify-center rounded-card bg-brand-500 px-6 text-sm font-semibold text-white transition-colors duration-150 hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                Shop Laptops
              </Link>
              <Link
                href="/contact"
                className="inline-flex h-12 items-center justify-center rounded-card border border-surface-border bg-white px-6 text-sm font-semibold text-slate-800 transition-colors duration-150 hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
              >
                Contact Us
              </Link>
            </div>

            <ul className="mt-6 flex flex-wrap gap-2 text-sm text-slate-600" aria-label="Store highlights">
              <li className="rounded-md bg-slate-100 px-3 py-1.5 ring-1 ring-slate-200">Laptops</li>
              <li className="rounded-md bg-slate-100 px-3 py-1.5 ring-1 ring-slate-200">ICT products</li>
              <li className="rounded-md bg-slate-100 px-3 py-1.5 ring-1 ring-slate-200">Business supply</li>
            </ul>
          </div>

          <div className="relative">
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-panel border border-slate-200 bg-slate-50">
              {imageUrl ? (
                <Image
                  src={imageUrl}
                  alt={heroAlt}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              ) : (
                <div className="flex h-full flex-col items-center justify-center gap-2 p-6 text-center">
                  <p className="text-sm font-semibold text-slate-600">Shop photograph not yet added</p>
                  <p className="max-w-xs text-xs leading-5 text-slate-500">
                    Upload the approved Classic Computers storefront photo via site media settings when it is ready.
                  </p>
                </div>
              )}
            </div>
            <div className="pointer-events-none absolute -bottom-3 left-4 rounded-card border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-soft">
              Blantyre, Malawi
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
