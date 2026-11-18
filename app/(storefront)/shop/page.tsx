import type { Metadata } from "next";
import Link from "next/link";
import { searchShop } from "@/lib/data/products";
import { getBrands } from "@/lib/data/brands";
import { getCategories } from "@/lib/data/categories";
import { ProductGrid } from "@/components/product/product-grid";
import { ShopFilters } from "@/components/storefront/shop-filters";
import { ShopSearch } from "@/components/storefront/shop-search";
import { SortSelect } from "@/components/storefront/sort-select";
import { Pagination } from "@/components/storefront/pagination";
import { parseShopSearchParams } from "@/lib/shop-params";

export const metadata: Metadata = {
  title: "Shop",
  description: "Browse the products currently listed by Classic Computers LLC in Blantyre.",
};

export default async function ShopPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const filters = parseShopSearchParams(searchParams);
  const [result, brands, categories] = await Promise.all([searchShop(filters), getBrands(), getCategories()]);
  const hasActiveFilters = Boolean(
    filters.query || filters.brandSlugs?.length || filters.minPrice !== undefined || filters.maxPrice !== undefined || filters.availableOnly,
  );

  return (
    <main className="min-h-screen bg-slate-50/60">
      <div className="section-shell py-6 sm:py-9 lg:py-11">
        <nav aria-label="Breadcrumb" className="mb-5 text-xs font-medium text-slate-500">
          <Link href="/" className="hover:text-brand-700">Home</Link>
          <span aria-hidden="true" className="mx-2 text-slate-300">/</span>
          <span aria-current="page" className="text-slate-700">Shop</span>
        </nav>

        <header className="overflow-hidden rounded-3xl bg-gradient-to-br from-navy-950 via-navy-900 to-[#123a55] px-5 py-7 text-white shadow-elevated sm:px-8 sm:py-9">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-300">The Classic Computers store</p>
          <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Find the right technology.</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-300 sm:text-base">
                Explore computers, accessories and electronics, with local support from our Blantyre team.
              </p>
            </div>
            <div className="w-full max-w-xl rounded-2xl border border-white/10 bg-white/10 p-2 backdrop-blur-sm">
              <ShopSearch initialQuery={filters.query ?? ""} />
            </div>
          </div>
        </header>

        <div className="mt-7 grid grid-cols-1 gap-6 lg:grid-cols-[245px_minmax(0,1fr)] lg:gap-8">
          <aside aria-label="Shop filters" className="h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-32">
            <ShopFilters brands={brands} categories={categories} />
          </aside>

          <section aria-label="Products" className="min-w-0">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
              <div>
                <p className="text-sm font-semibold text-navy-900" aria-live="polite">
                  {result.total} product{result.total === 1 ? "" : "s"}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">Prices shown in Malawi Kwacha</p>
              </div>
              <SortSelect />
            </div>

            <ProductGrid
              products={result.items}
              mode="catalog"
              emptyMessage={hasActiveFilters ? "No products match your search or filters." : "No products are currently available."}
            />

            <Pagination
              page={result.page}
              pageSize={result.pageSize}
              total={result.total}
              basePath="/shop"
              searchParams={searchParams}
            />
          </section>
        </div>
      </div>
    </main>
  );
}
