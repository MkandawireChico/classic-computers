import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { searchShop } from "@/lib/data/products";
import { getBrands } from "@/lib/data/brands";
import { getCategories } from "@/lib/data/categories";
import { ProductGrid } from "@/components/product/product-grid";
import { ShopFilters } from "@/components/storefront/shop-filters";
import { ShopSearch } from "@/components/storefront/shop-search";
import { SortSelect } from "@/components/storefront/sort-select";
import { parseShopSearchParams } from "@/lib/shop-params";

function pageHref(searchParams: Record<string, string | string[] | undefined>, page: number): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) value.forEach((item) => params.append(key, item));
    else if (typeof value === "string") params.set(key, value);
  }
  if (page <= 1) params.delete("page");
  else params.set("page", String(page));
  const query = params.toString();
  return query ? `/shop?${query}` : "/shop";
}

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
  const [result, brands, categories] = await Promise.all([searchShop({ ...filters, page: filters.page ?? 1, pageSize: filters.pageSize ?? 24 }), getBrands(), getCategories()]);
  const requestedPage = typeof searchParams.page === "string" ? Number(searchParams.page) : undefined;
  if (searchParams.page !== undefined && requestedPage !== result.page) redirect(pageHref(searchParams, result.page));
  const hasActiveFilters = Boolean(
    filters.query || filters.brandSlugs?.length || filters.minPrice !== undefined || filters.maxPrice !== undefined || filters.availableOnly,
  );

  return (
    <main className="min-h-screen bg-[#f4f7f9]">
      <div className="section-shell py-6 sm:py-9 lg:py-11">
        <nav aria-label="Breadcrumb" className="mb-5 text-xs font-medium text-slate-500">
          <Link href="/" className="hover:text-brand-700">Home</Link>
          <span aria-hidden="true" className="mx-2 text-slate-300">/</span>
          <span aria-current="page" className="text-slate-700">Shop</span>
        </nav>

        <header className="rounded-2xl border border-slate-200 bg-white px-5 py-7 shadow-sm sm:px-8 sm:py-9">
          <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-700">Classic Computers catalogue</p>
          <div className="mt-3 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl">
              <h1 className="text-3xl font-extrabold tracking-[-0.045em] text-[#10243a] sm:text-4xl">Shop computers and ICT equipment.</h1>
              <p className="mt-3 max-w-xl text-sm leading-6 text-slate-600 sm:text-base">
                Compare products, check availability and find equipment for home, study or work.
              </p>
            </div>
            <div className="w-full max-w-xl border border-slate-200 bg-slate-50 p-2">
              <ShopSearch initialQuery={filters.query ?? ""} />
            </div>
          </div>
        </header>

        <div className="mt-7 grid grid-cols-1 gap-6 lg:grid-cols-[245px_minmax(0,1fr)] lg:gap-8">
          <aside aria-label="Shop filters" className="h-fit lg:sticky lg:top-32 lg:rounded-2xl lg:border lg:border-slate-200 lg:bg-white lg:p-4 lg:shadow-sm">
            <ShopFilters brands={brands} categories={categories} />
          </aside>

          <section aria-label="Products" className="min-w-0">
            <div className="mb-4 flex flex-col items-stretch justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 sm:flex-row sm:items-center">
              <div>
                <p className="text-sm font-semibold text-navy-900" aria-live="polite">
                  {result.total === 0 ? "No matching products" : `${result.total} product${result.total === 1 ? "" : "s"} found`}
                </p>
                <p className="mt-0.5 text-xs text-slate-500">Catalogue prices in MWK, excluding VAT and PPDA</p>
              </div>
              <SortSelect />
            </div>

            {result.items.length > 0 ? (
              <ProductGrid products={result.items} mode="catalog" searchResults={Boolean(filters.query)} />
            ) : (
              <div className="rounded-3xl border border-dashed border-slate-300 bg-white px-6 py-14 text-center sm:px-10">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-500">
                  <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
                    <rect x="3" y="4" width="18" height="13" rx="2" />
                    <path d="M8 21h8M12 17v4" strokeLinecap="round" />
                    <path d="m9 9 6 4m0-4-6 4" strokeLinecap="round" />
                  </svg>
                </div>
                <h2 className="mt-5 text-lg font-bold text-navy-950">
                  {hasActiveFilters ? "No products match those filters" : "No products are listed right now"}
                </h2>
                <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                  {hasActiveFilters
                    ? "Try a different search, remove a filter or return to the full catalogue."
                    : "Please check back soon or contact our team for help finding a product."}
                </p>
                <div className="mt-6 flex flex-col justify-center gap-2 sm:flex-row">
                  {hasActiveFilters ? (
                    <Link href="/shop" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-navy-950 px-5 text-sm font-semibold text-white transition-colors hover:bg-navy-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
                      Clear search and filters
                    </Link>
                  ) : null}
                  <Link href="/contact" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-navy-900 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
                    Contact the team
                  </Link>
                </div>
              </div>
            )}

        {result.total > result.pageSize ? (
          <nav aria-label="Catalogue pages" className="mt-8 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs font-medium text-slate-500">
              Showing {((result.page - 1) * result.pageSize) + 1}–{Math.min(result.page * result.pageSize, result.total)} of {result.total} products
            </p>
            <div className="flex items-center justify-between gap-2 sm:justify-end">
              {result.page > 1 ? (
                <Link
                  href={pageHref(searchParams, result.page - 1)}
                  rel="prev"
                  className="inline-flex min-h-10 items-center rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition-colors hover:border-brand-300 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  Previous
                </Link>
              ) : (
                <span className="inline-flex min-h-10 items-center rounded-lg border border-slate-100 px-3 text-sm font-semibold text-slate-300" aria-disabled="true">Previous</span>
              )}
              <span className="px-2 text-xs font-semibold tabular-nums text-slate-600">Page {result.page} of {Math.ceil(result.total / result.pageSize)}</span>
              {result.page < Math.ceil(result.total / result.pageSize) ? (
                <Link
                  href={pageHref(searchParams, result.page + 1)}
                  rel="next"
                  className="inline-flex min-h-10 items-center rounded-lg bg-[#123653] px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                >
                  Next
                </Link>
              ) : (
                <span className="inline-flex min-h-10 items-center rounded-lg border border-slate-100 px-4 text-sm font-semibold text-slate-300" aria-disabled="true">Next</span>
              )}
            </div>
          </nav>
        ) : null}

          </section>
        </div>
      </div>
    </main>
  );
}
