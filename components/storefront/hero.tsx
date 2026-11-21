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
    <section aria-labelledby="hero-heading" className="relative isolate overflow-hidden bg-surface-muted">
      <div aria-hidden="true" className="pointer-events-none absolute -right-32 -top-40 -z-10 h-[34rem] w-[34rem] rounded-full border-[5rem] border-brand-100/60" />
      <div className="section-shell">
        <div className="grid items-center gap-9 py-10 sm:gap-12 sm:py-14 lg:min-h-[590px] lg:grid-cols-[0.9fr_1.1fr] lg:gap-14 lg:py-16">
          <div className="max-w-2xl">
            <p className="inline-flex items-center gap-2 rounded-full border border-brand-100 bg-white px-3.5 py-2 text-[10px] font-extrabold uppercase tracking-[0.17em] text-brand-800 shadow-sm sm:text-[11px]">
              <span aria-hidden="true" className="h-2 w-2 rounded-full bg-brand-500" />
              Technology and ICT solutions · Blantyre
            </p>
            <h1 id="hero-heading" className="mt-6 max-w-[650px] text-[clamp(2.55rem,5.1vw,4.65rem)] font-extrabold leading-[0.99] tracking-[-0.065em] text-navy-900">
              Technology for <span className="text-brand-700">work, study</span> and business.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-7 text-slate-700 sm:text-lg sm:leading-8">
              Find laptops, computers and ICT equipment. Get help with equipment rentals, repairs and technology supply for your organisation.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/shop" className="inline-flex min-h-12 items-center justify-center gap-3 rounded-xl bg-navy-900 px-7 py-3.5 text-sm font-extrabold text-white shadow-sm transition-colors hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2">
                Explore the catalogue <span aria-hidden="true" className="text-lg">↗</span>
              </Link>
              <Link href="/corporate/enquire" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-slate-300 bg-white px-7 py-3.5 text-sm font-bold text-navy-900 transition-colors hover:border-brand-400 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2">
                Request a business quote
              </Link>
            </div>
            <div className="mt-9 grid grid-cols-3 gap-3 border-t border-slate-300 pt-5">
              <Link href="/shop" className="group min-w-0 rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
                <span className="block text-xs font-extrabold text-navy-900 transition-colors group-hover:text-brand-800 sm:text-sm">Shop</span>
                <span className="mt-1 block text-[10px] leading-4 text-slate-500 sm:text-xs">Browse equipment</span>
              </Link>
              <Link href="/rentals" className="group min-w-0 rounded-sm border-l border-slate-300 pl-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
                <span className="block text-xs font-extrabold text-navy-900 transition-colors group-hover:text-brand-800 sm:text-sm">Rent</span>
                <span className="mt-1 block text-[10px] leading-4 text-slate-500 sm:text-xs">Short-term equipment</span>
              </Link>
              <Link href="/repairs" className="group min-w-0 rounded-sm border-l border-slate-300 pl-3 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
                <span className="block text-xs font-extrabold text-navy-900 transition-colors group-hover:text-brand-800 sm:text-sm">Repair</span>
                <span className="mt-1 block text-[10px] leading-4 text-slate-500 sm:text-xs">Technical support</span>
              </Link>
            </div>
          </div>

          <div className="relative w-full">
            {imageUrl ? (
              <div className={`relative w-full overflow-hidden rounded-[1.5rem] border border-white bg-white shadow-[0_28px_70px_-38px_rgba(15,35,55,0.42)] ${isHomepageBanner ? "aspect-[16/10]" : "aspect-[5/4]"}`}>
                <Image
                  src={imageUrl}
                  alt={media?.alt_text?.trim() || "Classic Computers and its technology services in Blantyre"}
                  fill
                  priority
                  sizes="(max-width: 1023px) 100vw, 56vw"
                  className={isHomepageBanner ? "object-contain" : "object-cover"}
                />
              </div>
            ) : (
              <div className="flex min-h-[300px] flex-col justify-between rounded-[1.5rem] border border-slate-200 bg-white p-7 shadow-[0_28px_70px_-38px_rgba(15,35,55,0.32)] sm:min-h-[390px] sm:p-10">
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-brand-700">Classic Computers · Blantyre</p>
                <div>
                  <p className="max-w-md text-3xl font-extrabold leading-tight tracking-tight text-navy-900 sm:text-4xl">Computers, equipment and practical technology support.</p>
                  <p className="mt-4 max-w-md text-sm leading-6 text-slate-600">Visit our shop or contact the team for help choosing equipment for your needs.</p>
                </div>
                <Link href="/contact" className="mt-7 inline-flex min-h-11 items-center gap-2 self-start rounded-sm border-b-2 border-brand-600 text-sm font-bold text-brand-800 hover:text-brand-950 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
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
