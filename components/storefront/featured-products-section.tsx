import Link from "next/link";
import { getFeaturedProducts } from "@/lib/data/products";
import { ProductGrid } from "@/components/product/product-grid";

export async function FeaturedProductsSection() {
  // Keep the homepage focused. The full catalogue is one click away.
  const products = await getFeaturedProducts(4);
  if (products.length === 0) return null;

  return (
    <section aria-labelledby="featured-products-heading" className="relative overflow-hidden bg-[#f1f5f8]">
      <div className="section-shell relative py-14 sm:py-16 lg:py-20">
        <div className="mb-8 grid gap-5 border-b border-slate-300 pb-7 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-brand-800">Selected by our team</p>
            <h2 id="featured-products-heading" className="mt-3 text-3xl font-bold leading-[1.05] tracking-[-0.05em] text-[#10243a] sm:text-4xl lg:text-5xl">
              A few products to start with.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-700 sm:text-base">
              Explore a small selection from our catalogue. Open a product to review its specifications, price and availability.
            </p>
          </div>
          <Link href="/shop" className="inline-flex min-h-12 items-center justify-center gap-4 self-start border border-[#16334c] px-5 text-sm font-extrabold text-[#16334c] transition hover:bg-[#16334c] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-700 lg:self-end">
            Browse all products <span aria-hidden="true">↗</span>
          </Link>
        </div>
        <ProductGrid products={products} />
        <div className="mt-7 flex flex-col justify-between gap-3 border-t border-slate-300 pt-5 text-sm text-slate-700 sm:flex-row sm:items-center">
          <span>Looking for a specific model or configuration?</span>
          <Link href="/contact" className="font-extrabold text-brand-900 transition hover:text-brand-700">Talk to Classic Computers ↗</Link>
        </div>
      </div>
    </section>
  );
}
