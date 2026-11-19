import Link from "next/link";
import { getCategories } from "@/lib/data/categories";
import { formatCategoryName } from "@/lib/format/category";

export async function CategorySection() {
  const categories = (await getCategories()).filter(
    (category) => category.parent_id === null && category.name.trim() !== "" && category.slug.trim() !== "",
  );
  if (categories.length === 0) return null;

  return (
    <section aria-labelledby="shop-by-category-heading" className="bg-white">
      <div className="section-shell py-14 sm:py-18 lg:py-20">
        <div className="mb-8 flex flex-col gap-5 border-b border-slate-200 pb-7 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.18em] text-brand-700">Product categories</p>
            <h2 id="shop-by-category-heading" className="mt-3 text-3xl font-bold leading-tight tracking-[-0.045em] text-[#10243a] sm:text-4xl">
              Browse by category.
            </h2>
            <p className="mt-3 max-w-xl text-sm leading-7 text-slate-600 sm:text-base">
              Browse by equipment type and compare the available options.
            </p>
          </div>
          <Link href="/shop" className="inline-flex min-h-11 items-center gap-2 self-start text-sm font-extrabold text-brand-800 transition-colors hover:text-brand-950 sm:self-auto">
            View all products <span aria-hidden="true">↗</span>
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {categories.map((category, index) => {
            const name = formatCategoryName(category.name);
            return (
              <Link
                key={category.id}
                href={`/shop/${category.slug}`}
                className="group grid min-h-[150px] grid-cols-[minmax(0,1fr)_112px] items-center gap-3 overflow-hidden rounded-xl border border-slate-200 bg-white p-4 transition-colors hover:border-brand-300 hover:bg-[#fbfdfe] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 sm:min-h-[166px] sm:grid-cols-[minmax(0,1fr)_128px] sm:p-5"
                aria-label={`Browse ${name}`}
              >
                <span className="min-w-0">
                  <span className="block text-lg font-bold tracking-tight text-[#10243a] transition-colors group-hover:text-brand-800 sm:text-xl">{name}</span>
                  <span className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 group-hover:text-brand-700">
                    Browse category <span aria-hidden="true">↗</span>
                  </span>
                </span>
                <span aria-hidden="true" className="relative flex h-28 w-28 items-center justify-center justify-self-end overflow-hidden rounded-full bg-[#edf4f7] text-brand-800 sm:h-32 sm:w-32">
                  <span className="absolute right-2 top-2 h-7 w-7 rounded-full border border-brand-200/80" />
                  <span className="absolute -bottom-5 -left-3 h-16 w-16 rounded-full border border-cyan-200/80" />
                  <CategoryIllustration name={name} />
                  <span className="absolute bottom-2 right-3 font-mono text-[9px] font-bold text-slate-400">{String(index + 1).padStart(2, "0")}</span>
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
    return <svg viewBox="0 0 64 64" className="relative z-10 h-14 w-14" fill="none"><rect x="20" y="6" width="24" height="52" rx="4" stroke="currentColor" strokeWidth="2.5" /><path d="M27 12h10M29 50h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /><circle cx="32" cy="55" r="1" fill="currentColor" /></svg>;
  }
  if (/printer|scanner/i.test(lower)) {
    return <svg viewBox="0 0 64 64" className="relative z-10 h-14 w-14" fill="none"><path d="M18 23V9h28v14M16 45H9V25h46v20h-7" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" /><path d="M18 38h28v17H18zM23 14h18M23 44h18M23 49h12" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /><circle cx="48" cy="31" r="1.5" fill="currentColor" /></svg>;
  }
  if (/network|router|wifi/i.test(lower)) {
    return <svg viewBox="0 0 64 64" className="relative z-10 h-14 w-14" fill="none"><rect x="9" y="30" width="46" height="21" rx="5" stroke="currentColor" strokeWidth="2.5" /><path d="M19 30a13 13 0 0 1 26 0M25 30a7 7 0 0 1 14 0" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" /><circle cx="21" cy="41" r="2" fill="currentColor" /><circle cx="29" cy="41" r="2" fill="currentColor" /></svg>;
  }
  return <svg viewBox="0 0 64 64" className="relative z-10 h-14 w-14" fill="none"><rect x="7" y="8" width="50" height="36" rx="3" stroke="currentColor" strokeWidth="2.5" /><path d="M3 54h58l-6-10H9L3 54ZM27 44v10M37 44v10" stroke="currentColor" strokeWidth="2.5" strokeLinejoin="round" /></svg>;
}
