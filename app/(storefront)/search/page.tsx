import type { Metadata } from "next";
import { searchShop } from "@/lib/data/products";
import { ProductGrid } from "@/components/product/product-grid";
import { SearchBox } from "@/components/storefront/search-box";
import { SortSelect } from "@/components/storefront/sort-select";
import { Pagination } from "@/components/storefront/pagination";
import { parseShopSearchParams } from "@/lib/shop-params";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const query = typeof searchParams.q === "string" ? searchParams.q : "";
  const filters = parseShopSearchParams(searchParams, { query });
  const result = query.trim() ? await searchShop(filters) : { items: [], total: 0, page: 1, pageSize: 24 };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <h1 className="text-2xl font-semibold text-gray-900">Search</h1>
      <div className="mt-4 max-w-md">
        <SearchBox initialQuery={query} />
      </div>

      {query.trim() ? (
        <>
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-gray-600" aria-live="polite">
              {result.total} result{result.total === 1 ? "" : "s"} for &ldquo;{query}&rdquo;
            </p>
            <SortSelect />
          </div>
          <div className="mt-4">
            <ProductGrid
              products={result.items}
              emptyMessage={`No products found for "${query}". Try a different search term, or contact us — we may still be able to help.`}
            />
          </div>
          <Pagination
            page={result.page}
            pageSize={result.pageSize}
            total={result.total}
            basePath="/search"
            searchParams={searchParams}
          />
        </>
      ) : (
        <p className="mt-8 text-sm text-gray-500">Enter a product name, brand or SKU to search.</p>
      )}
    </div>
  );
}
