import Image from "next/image";
import Link from "next/link";
import { getSiteMedia } from "@/lib/data/site-media";
import { getPublicStorageUrl } from "@/lib/storage";

export async function Hero() {
  const [hero] = await getSiteMedia("homepage_hero", 1);
  const imageUrl = hero ? getPublicStorageUrl("site-media", hero.storage_path) : null;
  const heroAlt = hero?.alt_text ?? "Technology products available from Classic Computers";

  return (
    <section aria-labelledby="hero-heading" className="relative overflow-hidden bg-gradient-to-br from-amber-50 via-white to-emerald-50/70">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-200/35 via-transparent to-transparent" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_left,_var(--tw-gradient-stops))] from-amber-200/30 via-transparent to-transparent" />

      <div className="section-shell relative">
        <div className="grid items-center gap-10 py-14 sm:gap-14 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:gap-16 lg:py-24">
          <div className="max-w-2xl space-y-7 sm:space-y-9">
            <div className="space-y-4 sm:space-y-5">
              <p className="inline-flex rounded-full border border-emerald-200 bg-white/80 px-4 py-2 text-xs font-bold uppercase tracking-[0.16em] text-emerald-800 shadow-sm sm:text-sm">
                Classic Computers · Blantyre, Malawi
              </p>
              <h1 id="hero-heading" className="text-display font-extrabold leading-[1.05] tracking-tight text-slate-900">
                Technology for <span className="text-emerald-700">work</span>, <span className="text-amber-700">business</span> and everyday life.
              </h1>
              <p className="max-w-xl text-lg leading-relaxed text-slate-700 sm:text-xl">
                Shop laptops and ICT equipment from Classic Computers in Blantyre, Malawi. Find technology for personal use,
                education and business, or request a quotation for your organisation.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:gap-4">
              <Link
                href="/shop/laptop-computers"
                className="inline-flex min-h-14 items-center justify-center rounded-xl bg-brand-700 px-7 py-4 text-base font-bold text-white shadow-lg shadow-brand-900/15 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-800 hover:shadow-xl focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-500 focus-visible:ring-offset-2 sm:px-8 sm:text-lg"
              >
                Shop Laptops
              </Link>
              <Link
                href="/corporate"
                className="inline-flex min-h-14 items-center justify-center rounded-xl border border-amber-300 bg-white/90 px-7 py-4 text-base font-bold text-amber-900 shadow-md transition-all duration-200 hover:-translate-y-0.5 hover:border-amber-400 hover:bg-amber-50 hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-amber-500 focus-visible:ring-offset-2 sm:px-8 sm:text-lg"
              >
                Request a Business Quote
              </Link>
            </div>
          </div>

          {imageUrl ? (
            <div className="relative aspect-[4/3] w-full overflow-hidden rounded-3xl border border-emerald-100 bg-white shadow-2xl shadow-emerald-950/10 ring-1 ring-white">
              <div className="absolute inset-0 z-[1] bg-gradient-to-br from-amber-100/20 via-transparent to-emerald-900/10" />
              <Image
                src={imageUrl}
                alt={heroAlt}
                fill
                priority
                sizes="(max-width: 1023px) 100vw, 45vw"
                className="object-cover"
              />
            </div>
          ) : (
            <div
              aria-hidden="true"
              className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden rounded-3xl border border-emerald-300/50 bg-gradient-to-br from-emerald-800 via-teal-700 to-brand-800 p-8 text-white shadow-2xl shadow-emerald-950/20 sm:p-14"
            >
              <div className="absolute -right-20 -top-24 h-96 w-96 rounded-full border border-white/10" />
              <div className="absolute -bottom-40 -left-16 h-[28rem] w-[28rem] rounded-full border border-white/10" />
              <div className="relative flex max-w-sm flex-col items-center gap-8 text-center">
                <svg width="96" height="80" viewBox="0 0 68 58" fill="none" className="text-amber-200">
                  <rect x="8" y="4" width="52" height="38" rx="3" stroke="currentColor" strokeWidth="2.5" />
                  <path d="M3 50h62l-5-8H8l-5 8Z" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" />
                  <path d="M27 50h14" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
                </svg>
                <p className="text-2xl font-bold leading-snug sm:text-3xl">
                  Laptops and ICT equipment for your next step.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
