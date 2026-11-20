import Image from "next/image";
import Link from "next/link";
import { getCategories } from "@/lib/data/categories";
import { getFeaturedProducts } from "@/lib/data/products";
import { formatCategoryName } from "@/lib/format/category";
import { getPublicStorageUrl } from "@/lib/storage";

export async function CategorySection() {
  const [allCategories, featuredProducts] = await Promise.all([
    getCategories(),
    getFeaturedProducts(16),
  ]);
  const categories = allCategories.filter(
    (category) => category.parent_id === null && category.name.trim() !== "" && category.slug.trim() !== "",
  );
  if (categories.length === 0) return null;

  return (
    <section aria-labelledby="shop-by-category-heading" className="bg-white">
      <div className="section-shell py-12 sm:py-16 lg:py-20">
        <div className="mb-7 flex flex-col gap-4 border-b border-slate-200 pb-6 sm:mb-8 sm:flex-row sm:items-end sm:justify-between sm:pb-7">
          <div className="max-w-2xl">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-700">Shop the catalogue</p>
            <h2 id="shop-by-category-heading" className="mt-3 text-3xl font-bold leading-tight tracking-[-0.045em] text-navy-900 sm:text-4xl">
              Find the equipment you need.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
              Start with a product category, then compare models, specifications and availability.
            </p>
          </div>
          <Link href="/shop" className="inline-flex min-h-11 items-center gap-2 self-start text-sm font-extrabold text-brand-800 transition-colors hover:text-brand-950 sm:self-auto">
            View full catalogue <span aria-hidden="true">↗</span>
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((category, index) => {
            const name = formatCategoryName(category.name);
            const matchingProduct = featuredProducts.find((product) => product.category?.id === category.id && product.primary_image);
            const imageUrl = matchingProduct?.primary_image
              ? getPublicStorageUrl("product-images", matchingProduct.primary_image.storage_path)
              : null;

            return (
              <Link
                key={category.id}
                href={`/shop/${category.slug}`}
                className="group grid min-h-[132px] grid-cols-[minmax(0,1fr)_112px] items-center gap-3 overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition-all hover:border-brand-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 sm:min-h-[150px] sm:grid-cols-[minmax(0,1fr)_124px] sm:p-5"
                aria-label={`Browse ${name}`}
              >
                <span className="min-w-0">
                  <span className="block text-lg font-bold tracking-tight text-navy-900 transition-colors group-hover:text-brand-800 sm:text-xl">{name}</span>
                  <span className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition-colors group-hover:text-brand-700">
                    View products <span aria-hidden="true">↗</span>
                  </span>
                </span>
                <span aria-hidden="true" className="relative flex h-24 w-24 items-center justify-center justify-self-end overflow-hidden rounded-lg bg-[#f2f6f8] sm:h-28 sm:w-28">
                  {imageUrl ? (
                    <Image
                      src={imageUrl}
                      alt=""
                      fill
                      sizes="112px"
                      className="object-contain p-2 transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <CategoryIllustration name={name} />
                  )}
                  <span className="absolute bottom-1.5 right-2 font-mono text-[9px] font-bold text-slate-400">{String(index + 1).padStart(2, "0")}</span>
                </span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CategoryIllustration({ name }: { name: string }) {
  const lower = name.toLowerCase();
  if (/phone|mobile|tablet/i.test(lower)) {
    return <svg viewBox="0 0 64 64" className="relative z-10 h-14 w-14 text-brand-800" fill="none"><rect x="20" y="6" width="24" height="52" rx="4" stroke="currentColor" strokeWidth="2.5" /><path d="M27 12h10M29 50h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
  }
  if (/printer|scanner/i.test(lower)) {
    return <svg viewBox="0 0 64 64" className="relative z-10 h-14 w-14 text-brand-800" fill="none"><path d="M18 23V9h28v14M16 45H9V25h46v20h-7" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" /><path d="M18 38h28v17H18zM23 14h18M23 44h18M23 49h12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>;
  }
  if (/network|router|wifi/i.test(lower)) {
    return <svg viewBox="0 0 64 64" className="relative z-10 h-14 w-14 text-brand-800" fill="none"><rect x="9" y="30" width="46" height="21" rx="5" stroke="currentColor" strokeWidth="2.5" /><path d="M19 30a13 13 0 0 1 26 0M25 30a7 7 0 0 1 14 0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /></svg>;
  }
  return <svg viewBox="0 0 64 64" className="relative z-10 h-14 w-14 text-brand-800" fill="none"><rect x="7" y="8" width="50" height="36" rx="3" stroke="currentColor" strokeWidth="2.5" /><path d="M3 54h58l-6-10H9L3 54ZM27 44v10M37 44v10" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" /></svg>;
}
