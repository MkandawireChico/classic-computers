import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCategoryBySlug, normalizeShopCategorySlug } from "@/lib/data/categories";
import { searchShop } from "@/lib/data/products";
import { getBrands } from "@/lib/data/brands";
import { getCategories } from "@/lib/data/categories";
import { ProductGrid } from "@/components/product/product-grid";
import { ShopFilters } from "@/components/storefront/shop-filters";
import { SortSelect } from "@/components/storefront/sort-select";
import { ShopSearch } from "@/components/storefront/shop-search";
import { parseShopSearchParams } from "@/lib/shop-params";
import { formatCategoryName } from "@/lib/format/category";
import { CategoryInterestTracker } from "@/components/storefront/analytics-page-tracker";

interface Params {
  category: string;
}

function categoryPageHref(categorySlug: string, searchParams: Record<string, string | string[] | undefined>, page: number): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(searchParams)) {
    if (Array.isArray(value)) value.forEach((item) => params.append(key, item));
    else if (typeof value === "string") params.set(key, value);
  }
  if (page <= 1) params.delete("page");
  else params.set("page", String(page));
  const query = params.toString();
  return query ? `/shop/${categorySlug}?${query}` : `/shop/${categorySlug}`;
}

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  const normalizedCategory = normalizeShopCategorySlug(params.category);
  const category = await getCategoryBySlug(normalizedCategory);
  if (!category) return {};

  return {
    title: category.name,
    description: `Shop ${category.name} at Classic Computers LLC, Blantyre — genuine products, local warranty and support.`,
    alternates: { canonical: `/shop/${category.slug}` },
  };
}

export default async function CategoryShopPage({
  params,
  searchParams,
}: {
  params: Params;
  searchParams: Record<string, string | string[] | undefined>;
}) {
  const normalizedCategory = normalizeShopCategorySlug(params.category);

  if (params.category.toLowerCase() === "laptops" || params.category.toLowerCase() === "laptop") {
    redirect(`/shop/${normalizedCategory}`);
  }

  if (params.category.toLowerCase() === "phones" || params.category.toLowerCase() === "phone") {
    redirect(`/shop?q=phone`);
  }

  const category = await getCategoryBySlug(normalizedCategory);
  if (!category) notFound();
  const categoryName = formatCategoryName(category.name);

  const filters = parseShopSearchParams(searchParams, { categorySlug: category.slug });
  const [result, brands, categories] = await Promise.all([searchShop({ ...filters, page: filters.page ?? 1, pageSize: filters.pageSize ?? 24 }), getBrands(), getCategories()]);
  const requestedPage = typeof searchParams.page === "string" ? Number(searchParams.page) : undefined;
  if (searchParams.page !== undefined && requestedPage !== result.page) redirect(categoryPageHref(category.slug, searchParams, result.page));

  return (
    <main className="min-h-screen bg-slate-50/60">
      <div className="section-shell py-6 sm:py-9 lg:py-11">
      <CategoryInterestTracker categoryId={category.id} />
      <nav aria-label="Breadcrumb" className="mb-5 text-xs font-medium text-slate-500">
        <Link href="/shop" className="hover:text-brand-700">Shop</Link>
        <span aria-hidden="true" className="mx-2 text-slate-300">/</span>
        <span aria-current="page" className="text-slate-700">{categoryName}</span>
      </nav>
      <header className="rounded-3xl bg-gradient-to-br from-navy-900 via-navy-800 to-brand-900 px-5 py-7 text-white shadow-elevated sm:px-8 sm:py-9">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-300">Browse by category</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">{categoryName}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Explore available {categoryName.toLowerCase()} from Classic Computers, Blantyre.</p>
        <div className="mt-5 max-w-xl border border-white/20 bg-white p-2 text-slate-900 shadow-sm">
          <ShopSearch initialQuery={filters.query ?? ""} />
        </div>
      </header>

      <div className="mt-7 grid grid-cols-1 gap-6 lg:grid-cols-[245px_minmax(0,1fr)] lg:gap-8">
        <aside aria-label="Filters" className="h-fit lg:sticky lg:top-32 lg:max-h-[calc(100vh-9rem)] lg:overflow-y-auto lg:overscroll-contain lg:rounded-2xl lg:border lg:border-slate-200 lg:bg-white lg:p-4 lg:shadow-sm">
          <ShopFilters brands={brands} categories={categories} />
        </aside>

        <section aria-label="Products" className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-navy-900" aria-live="polite">
                {result.total} product{result.total === 1 ? "" : "s"}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {result.total > 0
                  ? `Showing ${((result.page - 1) * result.pageSize) + 1}–${Math.min(result.page * result.pageSize, result.total)} · Prices in MWK, excluding VAT and PPDA`
                  : "Prices in MWK, excluding VAT and PPDA"}
              </p>
            </div>
            <SortSelect />
          </div>

          <ProductGrid products={result.items} mode="catalog" emptyMessage={`No ${categoryName.toLowerCase()} available right now.`} />

          {result.total > result.pageSize ? (
            <nav aria-label="Category catalogue pages" className="mt-8 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-xs font-medium text-slate-500">Showing {((result.page - 1) * result.pageSize) + 1}–{Math.min(result.page * result.pageSize, result.total)} of {result.total} products</p>
              <div className="flex items-center justify-between gap-2 sm:justify-end">
                {result.page > 1 ? <Link href={categoryPageHref(category.slug, searchParams, result.page - 1)} rel="prev" className="inline-flex min-h-10 items-center rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 transition-colors hover:border-brand-300 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">Previous</Link> : <span aria-disabled="true" className="inline-flex min-h-10 items-center rounded-lg border border-slate-100 px-3 text-sm font-semibold text-slate-300">Previous</span>}
                <span className="px-2 text-xs font-semibold tabular-nums text-slate-600">Page {result.page} of {Math.ceil(result.total / result.pageSize)}</span>
                {result.page < Math.ceil(result.total / result.pageSize) ? <Link href={categoryPageHref(category.slug, searchParams, result.page + 1)} rel="next" className="inline-flex min-h-10 items-center rounded-lg bg-navy-900 px-4 text-sm font-semibold text-white transition-colors hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">Next</Link> : <span aria-disabled="true" className="inline-flex min-h-10 items-center rounded-lg border border-slate-100 px-4 text-sm font-semibold text-slate-300">Next</span>}
              </div>
            </nav>
          ) : null}

        </section>
      </div>
      </div>
    </main>
  );
}
