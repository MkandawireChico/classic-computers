import Image from "next/image";
import Link from "next/link";
import { getSiteMedia } from "@/lib/data/site-media";
import { getPublicStorageUrl } from "@/lib/storage";

export async function Hero() {
  const [banner, heroImage, storePhoto] = await Promise.all([
    getSiteMedia("homepage_banner", 1),
    getSiteMedia("homepage_hero", 1),
    getSiteMedia("store_photo", 1),
  ]);
  const media = banner[0] ?? heroImage[0] ?? storePhoto[0] ?? null;
  const isHomepageBanner = Boolean(banner[0]);
  const imageUrl = media ? getPublicStorageUrl("site-media", media.storage_path) : null;

  return (
    <section aria-labelledby="hero-heading" className="border-b border-slate-200 bg-[#f4f7f9]">
      <div className="section-shell">
        <div className="grid items-center gap-8 py-10 sm:gap-10 sm:py-14 lg:min-h-[570px] lg:grid-cols-[0.92fr_1.08fr] lg:gap-14 lg:py-16">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-800">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-cyan-500" />
              Computers and ICT equipment · Blantyre
            </p>
            <h1 id="hero-heading" className="mt-5 max-w-[650px] text-[clamp(2.7rem,5.2vw,4.8rem)] font-extrabold leading-[0.99] tracking-[-0.065em] text-[#10243a]">
              Technology for the way you <span className="text-brand-700">work and live.</span>
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-700 sm:text-lg sm:leading-8">
              Shop computers, laptops and ICT equipment, or speak with our Blantyre team about rentals, repairs and business supply.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/shop" className="inline-flex min-h-13 items-center justify-center gap-3 rounded-lg bg-[#123653] px-7 py-3.5 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2">
                Browse products <span aria-hidden="true" className="text-lg">↗</span>
              </Link>
              <Link href="/corporate" className="inline-flex min-h-13 items-center justify-center rounded-lg border border-slate-300 bg-white px-7 py-3.5 text-sm font-bold text-[#17344d] transition-colors hover:border-brand-400 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2">
                Business enquiries
              </Link>
            </div>
            <div className="mt-9 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-slate-300 pt-5 text-xs font-semibold text-slate-600 sm:text-sm">
              <Link href="/rentals" className="transition-colors hover:text-brand-800">Equipment rentals</Link>
              <span aria-hidden="true" className="h-1 w-1 rounded-full bg-slate-400" />
              <Link href="/repairs" className="transition-colors hover:text-brand-800">Repairs and support</Link>
              <span aria-hidden="true" className="h-1 w-1 rounded-full bg-slate-400" />
              <Link href="/student-deals" className="transition-colors hover:text-brand-800">Student deals</Link>
            </div>
          </div>

          <div className="relative w-full">
            {imageUrl ? (
              <div className={`relative w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-[0_18px_55px_-35px_rgba(15,35,55,0.35)] ${isHomepageBanner ? "aspect-[16/9]" : "aspect-[5/4]"}`}>
                <Image
                  src={imageUrl}
                  alt={media?.alt_text ?? "Classic Computers and its technology services in Blantyre"}
                  fill
                  priority
                  sizes="(max-width: 1023px) 100vw, 56vw"
                  className={isHomepageBanner ? "object-contain" : "object-cover"}
                />
              </div>
            ) : (
              <div className="flex min-h-[280px] flex-col justify-between rounded-xl border border-slate-200 bg-white p-7 shadow-sm sm:min-h-[360px] sm:p-10">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">Classic Computers · Blantyre</p>
                <div>
                  <p className="max-w-md text-3xl font-extrabold leading-tight tracking-tight text-[#10243a] sm:text-4xl">Computers, equipment and practical technology support.</p>
                  <p className="mt-4 max-w-md text-sm leading-6 text-slate-600">Visit our shop or contact the team for help choosing the right equipment.</p>
                </div>
                <Link href="/contact" className="mt-7 inline-flex min-h-11 items-center gap-2 self-start border-b-2 border-brand-600 text-sm font-bold text-brand-800 hover:text-brand-950">
                  Find our shop <span aria-hidden="true">↗</span>
                </Link>
              </div>
            )}
            {media?.title && !isHomepageBanner ? (
              <p className="mt-3 text-xs font-medium text-slate-500">{media.title}</p>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
