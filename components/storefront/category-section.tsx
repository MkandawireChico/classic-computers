import Link from "next/link";
import { getCategories } from "@/lib/data/categories";
import { formatCategoryName } from "@/lib/format/category";

const DEFAULT_CATEGORY_STYLE = {
  card: "border-t-brand-500 hover:border-brand-300 hover:bg-brand-50/40",
  icon: "bg-brand-100 text-brand-800 group-hover:bg-brand-200",
  link: "text-brand-800",
};

const CATEGORY_STYLES = [
  DEFAULT_CATEGORY_STYLE,
  { card: "border-t-emerald-500 hover:border-emerald-300 hover:bg-emerald-50/50", icon: "bg-emerald-100 text-emerald-800 group-hover:bg-emerald-200", link: "text-emerald-800" },
  { card: "border-t-amber-500 hover:border-amber-300 hover:bg-amber-50/60", icon: "bg-amber-100 text-amber-900 group-hover:bg-amber-200", link: "text-amber-900" },
  { card: "border-t-violet-500 hover:border-violet-300 hover:bg-violet-50/50", icon: "bg-violet-100 text-violet-800 group-hover:bg-violet-200", link: "text-violet-800" },
  { card: "border-t-rose-500 hover:border-rose-300 hover:bg-rose-50/50", icon: "bg-rose-100 text-rose-800 group-hover:bg-rose-200", link: "text-rose-800" },
];

export async function CategorySection() {
  const categories = (await getCategories()).filter(
    (category) => category.parent_id === null && category.name.trim() !== "" && category.slug.trim() !== "",
  );

  if (categories.length === 0) return null;

  return (
    <section aria-labelledby="shop-by-category-heading" className="border-y border-amber-100 bg-gradient-to-br from-amber-50 via-white to-violet-50/60">
      <div className="section-shell py-14 sm:py-18 lg:py-20">
        <div className="mb-8 flex flex-col gap-4 sm:mb-10 sm:flex-row sm:items-end sm:justify-between">
          <div className="space-y-3">
            <p className="inline-flex rounded-full border border-violet-200 bg-white/80 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-violet-800 shadow-sm">
              Browse
            </p>
            <h2 id="shop-by-category-heading" className="text-h2 font-extrabold leading-tight text-slate-900">
              Shop by <span className="text-violet-700">category</span>
            </h2>
            <p className="max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Find the technology you need.
            </p>
          </div>
          <div aria-hidden="true" className="hidden h-1.5 w-28 shrink-0 rounded-full bg-gradient-to-r from-amber-400 via-emerald-500 to-violet-500 sm:mb-2 sm:block" />
        </div>

        <div className="grid auto-rows-fr grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
          {categories.map((category, index) => {
            const categoryName = formatCategoryName(category.name);
            const style = CATEGORY_STYLES[index % CATEGORY_STYLES.length] ?? DEFAULT_CATEGORY_STYLE;
            return (
              <Link
                key={category.id}
                href={`/shop/${category.slug}`}
                aria-label={`Browse ${categoryName}`}
                className={`group flex min-h-[168px] h-full flex-col items-center justify-between rounded-2xl border border-slate-200 border-t-4 bg-white/95 px-3 py-4 text-center shadow-sm transition-all duration-200 hover:-translate-y-1 hover:shadow-lg focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-violet-500 focus-visible:ring-offset-2 sm:px-5 sm:py-5 ${style.card}`}
              >
                <CategoryIcon name={categoryName} className={style.icon} />
                <span className="mt-4 flex min-h-10 items-center text-sm font-bold leading-snug text-slate-800 transition-colors group-hover:text-slate-950 sm:text-base">
                  {categoryName}
                </span>
                <span className={`mt-3 inline-flex items-center gap-1 text-xs font-bold sm:text-sm ${style.link}`}>
                  Browse <span aria-hidden="true" className="transition-transform group-hover:translate-x-1">→</span>
                </span>
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
    icon = (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="4" width="18" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M2 20h20l-2-4H4l-2 4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    );
  } else if (/desktop|computer/i.test(lowerName)) {
    icon = (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="3" width="18" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8 20h8M12 16v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  } else if (/phone|mobile/i.test(lowerName)) {
    icon = (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="7" y="2" width="10" height="20" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 17v0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  } else if (/tablet/i.test(lowerName)) {
    icon = (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 17v0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  } else if (/monitor|display/i.test(lowerName)) {
    icon = (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="2" y="3" width="20" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8 20h8M12 17v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  } else if (/printer/i.test(lowerName)) {
    icon = (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 9v8h12V9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 5h12v4H6z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 13h3M15 13h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  } else if (/mouse/i.test(lowerName)) {
    icon = (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="6.5" y="2.5" width="11" height="19" rx="5.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 3v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  } else if (/network|router|wifi/i.test(lowerName)) {
    icon = (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 12.55a11 11 0 0 1 14.08 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M1.42 9a16 16 0 0 1 21.16 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="12" cy="20" r="2" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  } else {
    icon = (
      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="4" y="3" width="16" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M2.5 20h19l-1.5-4H4l-1.5 4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <span className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl shadow-sm transition-all duration-200 group-hover:scale-105 sm:h-16 sm:w-16 ${className}`}>
      {icon}
    </span>
  );
}
