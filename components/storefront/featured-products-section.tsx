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
    <section aria-labelledby="featured-products-heading" className="border-t border-surface-border bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:px-8 lg:py-20">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-brand-600">Shop</p>
            <h2 id="featured-products-heading" className="mt-2 text-3xl font-bold text-slate-900 sm:text-4xl">
              Shop our latest products
            </h2>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-2 self-start rounded-card border-2 border-brand-200 bg-brand-50 px-5 py-2.5 text-sm font-semibold text-brand-700 transition-all hover:border-brand-400 hover:bg-brand-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            View all products
            <span aria-hidden="true" className="text-lg">→</span>
          </Link>
        </div>

        <p className="mb-8 max-w-2xl text-base leading-7 text-slate-600">
          Browse products currently listed by Classic Computers.
        </p>

        <div className="relative">
          <ProductGrid products={products.slice(0, 6)} />
        </div>
      </div>
    </section>
  );
}
