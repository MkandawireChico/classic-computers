import type { Metadata } from "next";
import { searchShop } from "@/lib/data/products";
import { ProductGrid } from "@/components/product/product-grid";
import { SearchBox } from "@/components/storefront/search-box";
import { SortSelect } from "@/components/storefront/sort-select";
import { parseShopSearchParams } from "@/lib/shop-params";
import { SearchInterestTracker } from "@/components/storefront/analytics-page-tracker";

export const metadata: Metadata = {
  title: "Search",
  robots: { index: false, follow: true },
};

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const query =
    (typeof searchParams.q === "string" ? searchParams.q : undefined) ??
    (typeof searchParams.query === "string" ? searchParams.query : undefined) ??
    "";
  const filters = parseShopSearchParams(searchParams, { query, page: 1, pageSize: 1000 });
  const result = query.trim() ? await searchShop(filters) : { items: [], total: 0, page: 1, pageSize: 1000 };

  return (
    <main className="min-h-screen bg-[#f4f6f7]"><div className="section-shell py-10 sm:py-14">
      <header className="rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm sm:p-8"><p className="text-[11px] font-bold uppercase tracking-[0.2em] text-brand-700">Find your technology</p><h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">Search the catalogue</h1><p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">Search by product name, brand or SKU to find equipment available from Classic Computers.</p><div className="mt-6 max-w-2xl"><SearchBox initialQuery={query} /></div></header>
            {query.trim() ? (
        <>
          <SearchInterestTracker searchTerm={query} resultCount={result.total} />
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm font-medium text-slate-600" aria-live="polite">
              {result.total} result{result.total === 1 ? "" : "s"} for &ldquo;{query}&rdquo;
            </p>
            <SortSelect />
          </div>
          <div className="mt-5">
            <ProductGrid
              products={result.items}
              searchResults
              emptyMessage={`No products found for "${query}". Try a different search term, or contact us — we may still be able to help.`}
            />
          </div>
        </>
      ) : (
        <p className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-sm text-slate-600">Enter a product name, brand or SKU above to search the catalogue.</p>
      )}
    </div></main>
  );
}
