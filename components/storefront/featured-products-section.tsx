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
    <section aria-labelledby="featured-products-heading" className="bg-white">
      <div className="section-shell section-space">
        <div className="mb-9 flex flex-col gap-5 sm:mb-11 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <p className="section-kicker"><span className="h-1.5 w-1.5 rounded-full bg-brand-500" /> The catalogue</p>
            <h2 id="featured-products-heading" className="section-heading">Technology worth <span className="text-brand-600">bringing home.</span></h2>
            <p className="section-description">Explore selected products available from Classic Computers.</p>
          </div>
          <Link href="/shop" className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl border border-slate-200 bg-white px-5 py-3 text-sm font-bold text-navy-800 transition-all hover:border-brand-300 hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 sm:self-auto">
            View all products <span aria-hidden="true">→</span>
          </Link>
        </div>
        <ProductGrid products={products.slice(0, 6)} />
      </div>
    </section>
  );
}
