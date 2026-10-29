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
    <section aria-labelledby="featured-products-heading" className="border-y border-rose-100 bg-gradient-to-br from-rose-50/70 via-white to-amber-50/70">
      <div className="section-shell py-14 sm:py-18 lg:py-20">
        <div className="mb-8 flex flex-col gap-5 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <p className="inline-flex rounded-full border border-rose-200 bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-rose-800 shadow-sm">
              Product catalogue
            </p>
            <h2 id="featured-products-heading" className="text-h2 font-extrabold leading-tight text-slate-900">
              Find your next <span className="text-rose-700">laptop</span>
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Explore products currently available from Classic Computers.
            </p>
          </div>

          <Link
            href="/shop"
            className="inline-flex min-h-12 items-center justify-center gap-2 self-start rounded-xl bg-rose-700 px-5 py-3 text-sm font-bold text-white shadow-md shadow-rose-900/10 transition-all duration-200 hover:-translate-y-0.5 hover:bg-rose-800 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-600 focus-visible:ring-offset-2 sm:self-auto"
          >
            View all products
            <span aria-hidden="true" className="text-lg">→</span>
          </Link>
        </div>

        <div className="relative">
          <ProductGrid products={products.slice(0, 6)} />
        </div>
      </div>
    </section>
  );
}
