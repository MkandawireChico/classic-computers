import Link from "next/link";
import { getCategories } from "@/lib/data/categories";
import { formatCategoryName } from "@/lib/format/category";

const CATEGORY_STYLES = [
  "bg-brand-50 text-brand-700",
  "bg-cyan-50 text-cyan-700",
  "bg-indigo-50 text-indigo-700",
  "bg-slate-100 text-navy-700",
  "bg-sky-50 text-sky-700",
];

export async function CategorySection() {
  const categories = (await getCategories()).filter(
    (category) => category.parent_id === null && category.name.trim() !== "" && category.slug.trim() !== "",
  );

  if (categories.length === 0) return null;

  return (
    <section aria-labelledby="shop-by-category-heading" className="border-y border-slate-200/80 bg-slate-50/80">
      <div className="section-shell section-space">
        <div className="mb-9 flex flex-col gap-3 sm:mb-11">
          <p className="section-kicker"><span className="h-1.5 w-1.5 rounded-full bg-brand-500" /> Browse the range</p>
          <h2 id="shop-by-category-heading" className="section-heading">Find what you <span className="text-brand-600">need.</span></h2>
          <p className="section-description">Explore our product categories and find the right equipment for your needs.</p>
        </div>

        <div className="grid auto-rows-fr grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {categories.map((category, index) => {
            const categoryName = formatCategoryName(category.name);
            const style = CATEGORY_STYLES[index % CATEGORY_STYLES.length];
            return (
              <Link
                key={category.id}
                href={`/shop/${category.slug}`}
                aria-label={`Browse ${categoryName}`}
                className="group flex min-h-40 h-full flex-col items-start justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-brand-200 hover:shadow-panel focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-brand-300 focus-visible:ring-offset-2 sm:min-h-44 sm:p-5"
              >
                <CategoryIcon name={categoryName} className={style} />
                <span className="mt-5 text-sm font-bold leading-snug text-navy-900 transition-colors group-hover:text-brand-700 sm:text-base">{categoryName}</span>
                <span className="mt-2 inline-flex items-center gap-2 text-xs font-semibold text-slate-500 transition-colors group-hover:text-brand-700">Explore <span aria-hidden="true">→</span></span>
              </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CategoryIcon({ name, className }: { name: string; className: string }) {
  const lowerName = name.toLowerCase();
  let icon: React.ReactNode;

  if (/laptop|notebook|macbook/i.test(lowerName)) {
    icon = <svg width="27" height="27" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="4" width="18" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.6" /><path d="M2 20h20l-2-4H4l-2 4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>;
  } else if (/desktop|computer/i.test(lowerName)) {
    icon = <svg width="27" height="27" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="3" y="3" width="18" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.6" /><path d="M8 20h8M12 16v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>;
  } else if (/phone|mobile/i.test(lowerName)) {
    icon = <svg width="27" height="27" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="7" y="2" width="10" height="20" rx="2" stroke="currentColor" strokeWidth="1.6" /><path d="M12 17v0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
  } else if (/tablet/i.test(lowerName)) {
    icon = <svg width="27" height="27" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="1.6" /><path d="M12 17v0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>;
  } else if (/monitor|display/i.test(lowerName)) {
    icon = <svg width="27" height="27" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="2" y="3" width="20" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.6" /><path d="M8 20h8M12 17v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>;
  } else if (/printer/i.test(lowerName)) {
    icon = <svg width="27" height="27" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M6 9v8h12V9M6 5h12v4H6zM6 13h3M15 13h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;
  } else if (/mouse/i.test(lowerName)) {
    icon = <svg width="27" height="27" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="6.5" y="2.5" width="11" height="19" rx="5.5" stroke="currentColor" strokeWidth="1.6" /><path d="M12 3v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>;
  } else if (/network|router|wifi/i.test(lowerName)) {
    icon = <svg width="27" height="27" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M5 12.55a11 11 0 0 1 14.08 0M1.42 9a16 16 0 0 1 21.16 0M8.53 16.11a6 6 0 0 1 6.95 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><circle cx="12" cy="20" r="2" stroke="currentColor" strokeWidth="1.6" /></svg>;
  } else {
    icon = <svg width="27" height="27" viewBox="0 0 24 24" fill="none" aria-hidden="true"><rect x="4" y="3" width="16" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.6" /><path d="M2.5 20h19l-1.5-4H4l-1.5 4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>;
  }

  return <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl transition-transform duration-200 group-hover:scale-105 sm:h-14 sm:w-14 ${className}`}>{icon}</span>;
}
