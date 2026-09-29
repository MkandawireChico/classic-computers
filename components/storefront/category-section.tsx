import Link from "next/link";
import { getCategories } from "@/lib/data/categories";

export async function CategorySection() {
  const categories = (await getCategories()).filter((c) => c.parent_id === null);

  if (categories.length === 0) return null;

  return (
    <section aria-labelledby="shop-by-category-heading" className="border-t border-slate-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-12 lg:px-8">
        <div className="mb-6 flex flex-col gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-brand-600">Browse</p>
          <h2 id="shop-by-category-heading" className="text-2xl font-bold text-slate-900 sm:text-3xl">
            Shop by category
          </h2>
          <p className="text-sm leading-6 text-slate-600 sm:text-base">Find the technology you need.</p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((category) => (
            <Link
              key={category.id}
              href={`/shop/${category.slug}`}
              aria-label={`Browse ${category.name}`}
              className="group flex min-h-[132px] items-center justify-center rounded-card border border-slate-200 bg-slate-50/60 px-3 py-5 text-center transition-colors duration-150 hover:border-brand-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              <div className="flex flex-col items-center gap-3">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-sm font-bold tracking-[0.12em] text-brand-700 shadow-inner shadow-brand-100">
                  {category.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-sm font-semibold text-slate-800 group-hover:text-brand-700">{category.name}</span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
