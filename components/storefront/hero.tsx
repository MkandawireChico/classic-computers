import Image from "next/image";
import Link from "next/link";
import { getFeaturedProducts, searchShop } from "@/lib/data/products";
import { getPublicStorageUrl } from "@/lib/storage";
import { formatMoney } from "@/lib/format/money";
import type { ProductListItem } from "@/types/catalog";

async function getHeroProducts(): Promise<ProductListItem[]> {
  const featured = await getFeaturedProducts(3);
  if (featured.length > 0) return featured.slice(0, 3);
  const fallback = await searchShop({ sort: "featured", page: 1, pageSize: 3 });
  return fallback.items.slice(0, 3);
}

export async function Hero() {
  const products = await getHeroProducts();
  const leadProduct = products[0];

  return (
    <section aria-labelledby="hero-heading" className="relative isolate overflow-hidden bg-[#071321] text-white">
      <div aria-hidden="true" className="absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_78%_42%,rgba(17,139,196,0.24),transparent_43%),linear-gradient(112deg,#071321_0%,#0b1c30_57%,#102d43_100%)]" />
        <div className="absolute -left-40 top-24 h-96 w-96 rounded-full border border-white/[0.06]" />
        <div className="absolute -left-24 top-40 h-64 w-64 rounded-full border border-white/[0.06]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-300/40 to-transparent" />
      </div>

      <div className="section-shell relative">
        <div className="grid min-h-[620px] items-center gap-12 py-14 sm:py-20 lg:grid-cols-[0.9fr_1.1fr] lg:gap-8 lg:py-24">
          <div className="relative z-10 max-w-2xl">
            <p className="mb-7 inline-flex items-center gap-3 text-[11px] font-bold uppercase tracking-[0.22em] text-cyan-200 sm:text-xs">
              <span className="h-px w-9 bg-cyan-300" />
              Your technology partner in Blantyre
            </p>
            <h1 id="hero-heading" className="max-w-[720px] text-[clamp(3.25rem,6.2vw,5.8rem)] font-semibold leading-[0.98] tracking-[-0.065em] text-white">
              The right tech.
              <span className="block text-cyan-300">For what&apos;s next.</span>
            </h1>
            <p className="mt-7 max-w-xl text-base leading-8 text-slate-300 sm:text-lg">
              Shop computers and ICT equipment, arrange a rental, or get expert help with repairs. Practical technology support for individuals, teams and organisations.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link href="/shop" className="inline-flex min-h-14 items-center justify-center gap-5 bg-cyan-400 px-7 text-sm font-extrabold text-[#071321] transition hover:bg-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[#071321]">
                Shop technology <span aria-hidden="true" className="text-lg">↗</span>
              </Link>
              <Link href="/contact" className="inline-flex min-h-14 items-center justify-center border border-white/25 px-7 text-sm font-bold text-white transition hover:border-white/60 hover:bg-white/[0.06] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
                Speak to our team
              </Link>
            </div>

            <div className="mt-12 grid max-w-lg grid-cols-3 border-t border-white/15 pt-5">
              <div className="pr-3">
                <p className="text-sm font-bold text-white">Sales</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">Computers & equipment</p>
              </div>
              <div className="border-l border-white/15 px-4">
                <p className="text-sm font-bold text-white">Rentals</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">Flexible requests</p>
              </div>
              <div className="border-l border-white/15 pl-4">
                <p className="text-sm font-bold text-white">Repairs</p>
                <p className="mt-1 text-xs leading-5 text-slate-400">Technical support</p>
              </div>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-[660px] lg:ml-auto">
            <div aria-hidden="true" className="absolute left-[18%] top-[12%] h-[70%] w-[70%] rounded-full bg-cyan-400/10 blur-3xl" />
            {leadProduct ? (
              <div className="relative grid grid-cols-[1.15fr_0.85fr] items-center gap-3 sm:gap-4">
                <HeroProduct product={leadProduct} featured />
                <div className="flex flex-col gap-3 sm:gap-4">
                  {products.slice(1, 3).map((product) => <HeroProduct key={product.id} product={product} />)}
                  {products.length === 1 ? (
                    <div className="flex min-h-36 items-center border border-dashed border-white/20 bg-white/[0.04] p-5 text-sm leading-6 text-slate-300">
                      Explore the full catalogue for more computers and accessories.
                    </div>
                  ) : null}
                </div>
                <div className="absolute -bottom-5 left-4 border border-white/15 bg-[#0b1c30]/95 px-4 py-3 shadow-2xl backdrop-blur sm:left-8 sm:px-5">
                  <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-cyan-200">Classic Computers LLC</p>
                  <p className="mt-1 text-xs text-white sm:text-sm">Technology for work, study and business</p>
                </div>
              </div>
            ) : (
              <div className="relative flex aspect-[5/4] items-center justify-center border border-white/15 bg-white/[0.04] p-8">
                <div className="absolute inset-5 border border-white/10" />
                <div className="relative text-center">
                  <svg viewBox="0 0 240 160" className="mx-auto w-full max-w-[300px] text-cyan-200" fill="none" aria-hidden="true">
                    <rect x="34" y="15" width="172" height="112" rx="7" stroke="currentColor" strokeWidth="3" />
                    <path d="M18 143h204l-16-16H34l-16 16Z" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
                    <path d="M92 143h56" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                    <path d="M85 69h70M85 87h46" stroke="currentColor" strokeWidth="3" strokeLinecap="round" opacity=".65" />
                  </svg>
                  <p className="mt-5 text-xl font-semibold text-white">Technology that moves you forward.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

function HeroProduct({ product, featured = false }: { product: ProductListItem; featured?: boolean }) {
  const imageUrl = product.primary_image
    ? getPublicStorageUrl("product-images", product.primary_image.storage_path)
    : null;
  const price = product.sale_price !== null && product.sale_price < product.base_price
    ? product.sale_price
    : product.base_price;

  return (
    <Link
      href={`/product/${product.slug}`}
      className={`group relative flex min-w-0 flex-col border border-white/15 bg-[#f5f7f8] p-3 text-[#102033] shadow-[0_25px_70px_-35px_rgba(0,0,0,0.8)] transition duration-300 hover:-translate-y-1 hover:border-cyan-300 sm:p-4 ${featured ? "row-span-2" : ""}`}
    >
      <div className={`relative w-full overflow-hidden bg-white ${featured ? "aspect-[4/4.5]" : "aspect-[5/4]"}`}>
        {imageUrl ? (
          <Image src={imageUrl} alt={product.primary_image?.alt_text ?? product.name} fill sizes="(max-width: 1023px) 45vw, 28vw" className="object-contain p-3 transition-transform duration-500 group-hover:scale-105 sm:p-5" />
        ) : (
          <div className="flex h-full items-center justify-center text-slate-300">
            <svg viewBox="0 0 80 64" className="w-16" fill="none" aria-hidden="true"><rect x="8" y="5" width="64" height="44" rx="3" stroke="currentColor" strokeWidth="2" /><path d="M3 58h74l-7-9H10l-7 9Z" stroke="currentColor" strokeWidth="2" /></svg>
          </div>
        )}
        {featured ? <span className="absolute left-2 top-2 bg-[#0b1c30] px-2 py-1 text-[9px] font-bold uppercase tracking-[0.15em] text-cyan-200">Featured</span> : null}
      </div>
      <div className="min-w-0 pt-3 sm:pt-4">
        {product.brand?.name ? <p className="truncate text-[9px] font-bold uppercase tracking-[0.15em] text-slate-500 sm:text-[10px]">{product.brand.name}</p> : null}
        <p className={`mt-1 line-clamp-2 font-bold leading-snug text-[#102033] ${featured ? "text-sm sm:text-base" : "text-xs sm:text-sm"}`}>{product.name}</p>
        <div className="mt-2 flex items-center justify-between gap-2">
          <span className={`font-extrabold text-[#0872b2] ${featured ? "text-base sm:text-lg" : "text-sm"}`}>{formatMoney(price)}</span>
          <span className="text-[10px] font-bold text-slate-400 transition group-hover:text-[#0872b2]">↗</span>
        </div>
      </div>
    </Link>
  );
}
