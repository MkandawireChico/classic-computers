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
    <section aria-labelledby="featured-products-heading" className="border-t border-slate-200 bg-slate-50/60">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-600">Shop</p>
            <h2 id="featured-products-heading" className="mt-2 text-2xl font-bold text-slate-900 sm:text-3xl">
              Shop our latest products
            </h2>
          </div>

          <Link
            href="/shop"
            className="inline-flex items-center gap-2 self-start text-sm font-semibold text-brand-700 transition hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            View all products
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <p className="mb-6 max-w-2xl text-sm leading-6 text-slate-600 sm:text-base">
          Browse the products our customers are looking for most right now.
        </p>

        <div className="relative">
          <ProductGrid products={products.slice(0, 6)} />
        </div>
      </div>
    </section>
  );
}
