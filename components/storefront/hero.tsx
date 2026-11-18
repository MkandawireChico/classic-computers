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
  const imageUrl = media ? getPublicStorageUrl("site-media", media.storage_path) : null;

  return (
    <section aria-labelledby="hero-heading" className="relative isolate overflow-hidden bg-[#10243a] text-white">
      <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_78%_45%,rgba(16,150,205,0.28),transparent_48%),linear-gradient(112deg,#10243a_0%,#173650_58%,#16445d_100%)]" />
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-cyan-500 via-sky-300 to-cyan-500" />
      <div className="section-shell relative">
        <div className="grid items-center gap-10 py-14 sm:gap-14 sm:py-20 lg:min-h-[590px] lg:grid-cols-[1fr_1fr] lg:gap-14 lg:py-20">
          <div className="relative z-10 max-w-2xl">
            <p className="mb-6 inline-flex items-center gap-3 text-xs font-extrabold uppercase tracking-[0.2em] text-cyan-200">
              <span className="h-0.5 w-9 bg-cyan-300" />
              Classic Computers · Blantyre, Malawi
            </p>
            <h1 id="hero-heading" className="max-w-[720px] text-[clamp(3rem,5.7vw,5.5rem)] font-bold leading-[0.98] tracking-[-0.06em] text-white">
              Technology for <span className="text-cyan-300">work</span>, <span className="text-sky-200">business</span> and everyday life.
            </h1>
            <p className="mt-7 max-w-xl text-base leading-8 text-slate-100 sm:text-lg">
              Shop laptops and ICT equipment from Classic Computers in Blantyre, Malawi. Find technology for personal use, education and business, or request a quotation for your organisation.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href="/shop/laptop-computers" className="inline-flex min-h-14 items-center justify-center gap-3 bg-cyan-400 px-7 text-sm font-extrabold text-[#082238] shadow-lg shadow-black/20 transition hover:bg-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#10243a]">
                Shop laptops <span aria-hidden="true" className="text-lg">↗</span>
              </Link>
              <Link href="/corporate" className="inline-flex min-h-14 items-center justify-center border border-white/50 bg-white/10 px-7 text-sm font-bold text-white transition hover:border-white hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-200">
                Request a business quote
              </Link>
            </div>
            <div className="mt-11 grid max-w-lg grid-cols-3 border-t border-white/30 pt-5">
              <div className="pr-3">
                <p className="text-sm font-extrabold text-white">Sales</p>
                <p className="mt-1 text-xs leading-5 text-slate-200">Computers & equipment</p>
              </div>
              <div className="border-l border-white/30 px-4">
                <p className="text-sm font-extrabold text-white">Rentals</p>
                <p className="mt-1 text-xs leading-5 text-slate-200">Flexible requests</p>
              </div>
              <div className="border-l border-white/30 pl-4">
                <p className="text-sm font-extrabold text-white">Repairs</p>
                <p className="mt-1 text-xs leading-5 text-slate-200">Technical support</p>
              </div>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[680px] lg:ml-auto">
            <div aria-hidden="true" className="absolute -inset-4 rounded-[2rem] bg-cyan-300/15 blur-2xl" />
            {imageUrl ? (
              <div className="relative aspect-[5/4] w-full overflow-hidden rounded-2xl border border-white/35 bg-slate-200 shadow-[0_30px_80px_-25px_rgba(0,0,0,0.65)]">
                <Image src={imageUrl} alt={media?.alt_text ?? "Classic Computers store and technology services"} fill priority sizes="(max-width: 1023px) 100vw, 48vw" className="object-cover" />
                <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-[#071a2b]/35 via-transparent to-white/5" />
                {media?.title ? <p className="absolute bottom-4 left-4 rounded-lg border border-white/30 bg-[#10243a]/90 px-4 py-2 text-xs font-bold text-white shadow-lg backdrop-blur">{media.title}</p> : null}
              </div>
            ) : (
              <div className="relative flex aspect-[5/4] items-center justify-center overflow-hidden rounded-2xl border border-white/30 bg-gradient-to-br from-[#dcecf3] via-white to-[#b8d9e8] p-8 shadow-2xl">
                <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full border border-sky-700/15" />
                <div className="absolute -bottom-28 -left-12 h-80 w-80 rounded-full border border-sky-700/15" />
                <div className="relative text-center text-[#12334c]">
                  <svg viewBox="0 0 240 160" className="mx-auto w-full max-w-[300px]" fill="none" aria-hidden="true">
                    <rect x="34" y="15" width="172" height="112" rx="7" stroke="currentColor" strokeWidth="3" />
                    <path d="M18 143h204l-16-16H34l-16 16Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
                    <path d="M92 143h56" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    <path d="M85 69h70M85 87h46" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity=".65" />
                  </svg>
                  <p className="mt-5 text-xl font-bold sm:text-2xl">Your technology partner in Blantyre.</p>
                  <p className="mt-2 text-sm font-medium text-slate-700">Computers · Rentals · Repairs · ICT support</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
