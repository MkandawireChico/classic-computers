import Image from "next/image";
import Link from "next/link";
import { getSiteMedia } from "@/lib/data/site-media";
import { getPublicStorageUrl } from "@/lib/storage";

export async function Hero() {
  const [hero] = await getSiteMedia("homepage_hero", 1);
  const imageUrl = hero ? getPublicStorageUrl("site-media", hero.storage_path) : null;
  const heroAlt = hero?.alt_text ?? "Technology products available from Classic Computers";

  return (
    <section aria-labelledby="hero-heading" className="relative isolate overflow-hidden bg-navy-900 text-white">
      <div aria-hidden="true" className="absolute inset-0 overflow-hidden">
        <div className="absolute -right-40 -top-48 h-[34rem] w-[34rem] rounded-full border border-white/[0.07]" />
        <div className="absolute -right-20 -top-28 h-[26rem] w-[26rem] rounded-full border border-white/[0.08]" />
        <div className="absolute -bottom-72 left-[28%] h-[38rem] w-[38rem] rounded-full bg-brand-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(9,20,38,0.98)_0%,rgba(16,29,53,0.96)_52%,rgba(16,61,91,0.82)_100%)]" />
      </div>

      <div className="section-shell relative">
        <div className="grid items-center gap-12 py-16 sm:py-20 lg:grid-cols-[1.02fr_0.98fr] lg:gap-14 lg:py-24">
          <div className="max-w-2xl space-y-8 sm:space-y-9">
            <div className="space-y-5">
              <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.19em] text-cyan-200 backdrop-blur sm:text-xs">
                <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-cyan-300" />
                Technology, made accessible · Blantyre, Malawi
              </p>
              <h1 id="hero-heading" className="text-display font-bold leading-[1.02] text-white">
                Technology for <span className="text-cyan-300">what&apos;s next.</span>
              </h1>
              <p className="max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
                Find laptops, computers and ICT equipment for work, learning and business. Shop with confidence or speak to our team about the right solution.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link
                href="/shop"
                className="inline-flex min-h-14 items-center justify-center gap-3 rounded-xl bg-brand-500 px-7 py-4 text-sm font-bold text-white shadow-lg shadow-black/20 transition-all duration-200 hover:-translate-y-0.5 hover:bg-brand-400 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900 sm:text-base"
              >
                Explore products
                <span aria-hidden="true">→</span>
              </Link>
              <Link
                href="/corporate"
                className="inline-flex min-h-14 items-center justify-center rounded-xl border border-white/20 bg-white/[0.06] px-7 py-4 text-sm font-semibold text-white backdrop-blur transition-colors hover:border-white/35 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-navy-900 sm:text-base"
              >
                Business solutions
              </Link>
            </div>

            <div className="flex flex-wrap items-center gap-x-7 gap-y-3 border-t border-white/10 pt-6 text-xs font-medium text-slate-300 sm:text-sm">
              <span className="inline-flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-cyan-300" /> Sales and rentals</span>
              <span className="inline-flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-cyan-300" /> Repairs and support</span>
              <span className="inline-flex items-center gap-2"><span className="h-1.5 w-1.5 rounded-full bg-cyan-300" /> Corporate supply</span>
            </div>
          </div>

          {imageUrl ? (
            <div className="relative mx-auto w-full max-w-2xl lg:ml-auto">
              <div className="absolute -inset-4 rounded-[2rem] bg-brand-400/15 blur-2xl" />
              <div className="relative aspect-[5/4] overflow-hidden rounded-[1.6rem] border border-white/15 bg-navy-800 shadow-elevated">
                <Image src={imageUrl} alt={heroAlt} fill priority sizes="(max-width: 1023px) 100vw, 48vw" className="object-cover" />
                <div className="absolute inset-0 bg-gradient-to-tr from-navy-950/35 via-transparent to-white/10" />
                <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/15 bg-navy-950/70 p-4 backdrop-blur-md sm:bottom-5 sm:left-5 sm:right-5">
                  <p className="text-xs font-semibold uppercase tracking-[0.16em] text-cyan-200">Classic Computers</p>
                  <p className="mt-1 text-lg font-semibold text-white sm:text-xl">The right technology. The right support.</p>
                </div>
              </div>
            </div>
          ) : (
            <div aria-hidden="true" className="relative mx-auto flex aspect-[5/4] w-full max-w-2xl items-center justify-center overflow-hidden rounded-[1.6rem] border border-white/15 bg-gradient-to-br from-navy-700 via-navy-800 to-[#0b526e] shadow-elevated">
              <div className="absolute -right-16 -top-16 h-72 w-72 rounded-full border border-white/10" />
              <div className="absolute -bottom-24 -left-16 h-80 w-80 rounded-full border border-white/10" />
              <div className="relative flex flex-col items-center gap-6 px-8 text-center">
                <svg width="112" height="96" viewBox="0 0 68 58" fill="none" className="text-cyan-200">
                  <rect x="8" y="4" width="52" height="38" rx="3" stroke="currentColor" strokeWidth="2" />
                  <path d="M3 50h62l-5-8H8l-5 8Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
                  <path d="M27 50h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                <p className="max-w-sm text-2xl font-semibold leading-snug text-white sm:text-3xl">Technology for your next step.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
