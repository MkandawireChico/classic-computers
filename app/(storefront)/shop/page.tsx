import type { Metadata } from "next";
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
  description:
    "Browse laptops, desktops, MacBooks, phones, tablets, monitors, printers and accessories at Classic Computers LLC, Blantyre.",
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
    <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <nav aria-label="Breadcrumb" className="mb-4 text-sm text-gray-500">
        <a href="/" className="hover:text-brand-600">Home</a>
        <span aria-hidden="true" className="mx-2">/</span>
        <span aria-current="page" className="text-gray-700">Shop</span>
      </nav>

      <header className="border-b border-surface-border pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-600">Classic Computers LLC</p>
        <h1 className="mt-1 text-3xl font-bold text-slate-900">Shop</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Browse available computers, accessories and electronics.
        </p>
        <div className="mt-5 max-w-2xl">
          <ShopSearch initialQuery={filters.query ?? ""} />
        </div>
      </header>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-8">
        <aside aria-label="Shop filters" className="lg:border-r lg:border-surface-border lg:pr-6">
          <ShopFilters brands={brands} categories={categories} />
        </aside>

        <section aria-label="Products" className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-surface-border pb-4">
            <p className="text-sm font-medium text-gray-700" aria-live="polite">
              Showing {result.total} product{result.total === 1 ? "" : "s"}
            </p>
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
  );
}
