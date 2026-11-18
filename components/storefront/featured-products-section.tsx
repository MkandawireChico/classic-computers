import Link from "next/link";
import { getFeaturedProducts, searchShop } from "@/lib/data/products";
import { ProductGrid } from "@/components/product/product-grid";

export async function FeaturedProductsSection() {
  let products = await getFeaturedProducts(6);
  if (products.length === 0) {
    const fallback = await searchShop({ sort: "featured", pageSize: 6, page: 1 });
    products = fallback.items;
  }
  if (products.length === 0) return null;

  return (
    <section aria-labelledby="featured-products-heading" className="relative overflow-hidden bg-[#f3f5f6]">
      <div aria-hidden="true" className="absolute right-0 top-0 h-72 w-72 rounded-full bg-cyan-100/60 blur-3xl" />
      <div className="section-shell relative py-16 sm:py-20 lg:py-24">
        <div className="mb-10 grid gap-6 border-b border-slate-300 pb-8 lg:grid-cols-[1fr_auto] lg:items-end lg:pb-10">
          <div className="max-w-3xl">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-brand-700">Selected from our catalogue</p>
            <h2 id="featured-products-heading" className="mt-4 text-3xl font-semibold leading-[1.05] tracking-[-0.05em] text-[#102033] sm:text-4xl lg:text-5xl">
              Tools for the way
              <span className="block text-brand-700">you work and live.</span>
            </h2>
            <p className="mt-4 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
              Browse computers and equipment listed by Classic Computers. Product details, prices and availability are shown on each listing.
            </p>
          </div>
          <Link href="/shop" className="inline-flex min-h-12 items-center justify-center gap-4 self-start border border-[#102033] px-5 text-sm font-bold text-[#102033] transition hover:bg-[#102033] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 lg:self-end">
            Browse the catalogue <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <ProductGrid products={products.slice(0, 6)} />
        <div className="mt-8 flex flex-col justify-between gap-3 border-t border-slate-300 pt-5 text-xs text-slate-500 sm:flex-row sm:items-center">
          <span>Need help choosing? Our team is available to assist.</span>
          <Link href="/contact" className="font-bold text-brand-800 transition hover:text-brand-600">Talk to Classic Computers ↗</Link>
        </div>
      </div>
    </section>
  );
}