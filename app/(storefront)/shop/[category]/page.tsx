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

  const filters = parseShopSearchParams(searchParams, { categorySlug: category.slug });
  const [result, brands] = await Promise.all([searchShop(filters), getBrands()]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <nav aria-label="Breadcrumb" className="mb-2 text-sm text-gray-500">
        <a href="/shop" className="hover:text-brand-600">
          Shop
        </a>{" "}
        / <span className="text-gray-700">{category.name}</span>
      </nav>
      <h1 className="text-2xl font-semibold text-gray-900">{category.name}</h1>

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-[240px_1fr]">
        <aside aria-label="Filters">
          <ShopFilters brands={brands} />
        </aside>

        <div>
          <div className="mb-4 flex items-center justify-between">
            <p className="text-sm text-gray-600" aria-live="polite">
              {result.total} product{result.total === 1 ? "" : "s"}
            </p>
            <SortSelect />
          </div>

          <ProductGrid products={result.items} emptyMessage={`No ${category.name.toLowerCase()} available right now.`} />

          <Pagination
            page={result.page}
            pageSize={result.pageSize}
            total={result.total}
            basePath={`/shop/${category.slug}`}
            searchParams={searchParams}
          />
        </div>
      </div>
    </div>
  );
}
