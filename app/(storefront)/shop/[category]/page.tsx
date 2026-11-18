import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { getCategoryBySlug, normalizeShopCategorySlug } from "@/lib/data/categories";
import { searchShop } from "@/lib/data/products";
import { getBrands } from "@/lib/data/brands";
import { ProductGrid } from "@/components/product/product-grid";
import { ShopFilters } from "@/components/storefront/shop-filters";
import { SortSelect } from "@/components/storefront/sort-select";
import { Pagination } from "@/components/storefront/pagination";
import { parseShopSearchParams } from "@/lib/shop-params";
import { formatCategoryName } from "@/lib/format/category";
import { CategoryInterestTracker } from "@/components/storefront/analytics-page-tracker";

interface Params {
  category: string;
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
  const [result, brands] = await Promise.all([searchShop(filters), getBrands()]);

  return (
    <main className="min-h-screen bg-slate-50/60">
      <div className="section-shell py-6 sm:py-9 lg:py-11">
      <CategoryInterestTracker categoryId={category.id} />
      <nav aria-label="Breadcrumb" className="mb-5 text-xs font-medium text-slate-500">
        <a href="/shop" className="hover:text-brand-700">Shop</a>
        <span aria-hidden="true" className="mx-2 text-slate-300">/</span>
        <span className="text-slate-700">{categoryName}</span>
      </nav>
      <header className="rounded-3xl bg-gradient-to-br from-navy-950 via-navy-900 to-[#123a55] px-5 py-7 text-white shadow-elevated sm:px-8 sm:py-9">
        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-cyan-300">Browse by category</p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight sm:text-4xl">{categoryName}</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300">Explore available {categoryName.toLowerCase()} from Classic Computers, Blantyre.</p>
      </header>

      <div className="mt-7 grid grid-cols-1 gap-6 lg:grid-cols-[245px_minmax(0,1fr)] lg:gap-8">
        <aside aria-label="Filters" className="h-fit rounded-2xl border border-slate-200 bg-white p-4 shadow-sm lg:sticky lg:top-32">
          <ShopFilters brands={brands} />
        </aside>

        <section aria-label="Products" className="min-w-0">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3">
            <p className="text-sm font-semibold text-navy-900" aria-live="polite">
              {result.total} product{result.total === 1 ? "" : "s"}
            </p>
            <SortSelect />
          </div>

          <ProductGrid products={result.items} mode="catalog" emptyMessage={`No ${categoryName.toLowerCase()} available right now.`} />

          <Pagination
            page={result.page}
            pageSize={result.pageSize}
            total={result.total}
            basePath={`/shop/${category.slug}`}
            searchParams={searchParams}
          />
        </section>
      </div>
      </div>
    </main>
  );
}
