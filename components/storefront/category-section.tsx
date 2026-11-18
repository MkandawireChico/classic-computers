import Link from "next/link";
import { getCategories } from "@/lib/data/categories";
import { formatCategoryName } from "@/lib/format/category";

const CATEGORY_STYLES = [
  "bg-cyan-100 text-cyan-800",
  "bg-blue-100 text-blue-800",
  "bg-indigo-100 text-indigo-800",
  "bg-slate-200 text-slate-800",
  "bg-sky-100 text-sky-800",
];

export async function CategorySection() {
  const categories = (await getCategories()).filter(
    (category) => category.parent_id === null && category.name.trim() !== "" && category.slug.trim() !== "",
  );
  if (categories.length === 0) return null;

  return (
    <section aria-labelledby="shop-by-category-heading" className="bg-white">
      <div className="section-shell py-16 sm:py-20 lg:py-24">
        <div className="grid gap-8 lg:grid-cols-[0.72fr_1.28fr] lg:gap-16">
          <div className="lg:sticky lg:top-32 lg:self-start">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.22em] text-brand-700">Browse by category</p>
            <h2 id="shop-by-category-heading" className="mt-4 text-3xl font-semibold leading-[1.06] tracking-[-0.05em] text-[#102033] sm:text-4xl">
              Start with
              <span className="block text-brand-700">what you need.</span>
            </h2>
            <p className="mt-5 max-w-sm text-sm leading-7 text-slate-600 sm:text-base">
              Go straight to the type of equipment you are looking for.
            </p>
            <Link href="/shop" className="mt-7 inline-flex items-center gap-3 text-sm font-extrabold text-[#102033] transition hover:text-brand-700">
              View every product <span aria-hidden="true">↗</span>
            </Link>
          </div>

          <div className="divide-y divide-slate-200 border-y border-slate-200">
            {categories.map((category, index) => {
              const name = formatCategoryName(category.name);
              const style = CATEGORY_STYLES[index % CATEGORY_STYLES.length];
              return (
                <Link
                  key={category.id}
                  href={`/shop/${category.slug}`}
                  className="group flex min-h-[88px] items-center gap-4 py-4 transition-colors hover:bg-slate-50 sm:min-h-[100px] sm:gap-6 sm:px-4"
                  aria-label={`Browse ${name}`}
                >
                  <span className="w-8 shrink-0 font-mono text-xs text-slate-400">{String(index + 1).padStart(2, "0")}</span>
                  <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${style}`}>
                    <CategoryIcon name={name} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-base font-bold tracking-tight text-[#102033] transition-colors group-hover:text-brand-700 sm:text-lg">{name}</span>
                    <span className="mt-1 block text-xs text-slate-500">Explore products</span>
                  </span>
                  <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-lg text-slate-500 transition-all group-hover:border-brand-600 group-hover:bg-brand-600 group-hover:text-white">↗</span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}

function CategoryIcon({ name }: { name: string }) {
  const lower = name.toLowerCase();
  if (/phone|mobile|tablet/i.test(lower)) {
    return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true"><rect x="7" y="2" width="10" height="20" rx="2" stroke="currentColor" strokeWidth="1.6" /><path d="M11 18h2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>;
  }
  if (/printer|scanner/i.test(lower)) {
    return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true"><path d="M6 9V4h12v5M6 17H4V9h16v8h-2M7 14h10v6H7z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>;
  }
  if (/network|router|wifi/i.test(lower)) {
    return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true"><path d="M2 9a15 15 0 0 1 20 0M5 12a10 10 0 0 1 14 0M8.5 15.5a5 5 0 0 1 7 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><circle cx="12" cy="19" r="1" fill="currentColor" /></svg>;
  }
  return <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true"><rect x="3" y="3" width="18" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.6" /><path d="M2 21h20l-2-4H4l-2 4ZM12 17v4" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>;
}