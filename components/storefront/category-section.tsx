import Link from "next/link";
import { getCategories } from "@/lib/data/categories";
import { formatCategoryName } from "@/lib/format/category";

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
          {categories.map((category) => {
            const categoryName = formatCategoryName(category.name);
            return (
            <Link
              key={category.id}
              href={`/shop/${category.slug}`}
              aria-label={`Browse ${categoryName}`}
              className="group flex min-h-[120px] items-center justify-center rounded-card border border-slate-200 bg-slate-50/60 px-3 py-4 text-center transition-colors duration-150 hover:border-brand-300 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              <div className="flex flex-col items-center gap-3">
                <CategoryIcon name={categoryName} />
                <span className="text-sm font-semibold text-slate-800 group-hover:text-brand-700">{categoryName}</span>
              </div>
            </Link>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function CategoryIcon({ name }: { name: string }) {
  const lowerName = name.toLowerCase();

  let icon: React.ReactNode;

  if (/laptop|notebook|macbook/i.test(lowerName)) {
    icon = (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="4" width="18" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M2 20h20l-2-4H4l-2 4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    );
  } else if (/desktop|computer/i.test(lowerName)) {
    icon = (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="3" y="3" width="18" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8 20h8M12 16v4" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  } else if (/phone|mobile/i.test(lowerName)) {
    icon = (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="7" y="2" width="10" height="20" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 17v0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  } else if (/tablet/i.test(lowerName)) {
    icon = (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="5" y="2" width="14" height="20" rx="2" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 17v0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  } else if (/monitor|display/i.test(lowerName)) {
    icon = (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="2" y="3" width="20" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M8 20h8M12 17v3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  } else if (/printer/i.test(lowerName)) {
    icon = (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M6 9v8h12V9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 5h12v4H6z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M6 13h3M15 13h3" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  } else if (/mouse/i.test(lowerName)) {
    icon = (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="6.5" y="2.5" width="11" height="19" rx="5.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M12 3v5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
    );
  } else if (/network|router|wifi/i.test(lowerName)) {
    icon = (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M5 12.55a11 11 0 0 1 14.08 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M1.42 9a16 16 0 0 1 21.16 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <path d="M8.53 16.11a6 6 0 0 1 6.95 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        <circle cx="12" cy="20" r="2" stroke="currentColor" strokeWidth="1.6" />
      </svg>
    );
  } else {
    icon = (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <rect x="4" y="3" width="16" height="13" rx="1.5" stroke="currentColor" strokeWidth="1.6" />
        <path d="M2.5 20h19l-1.5-4H4l-1.5 4Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      </svg>
    );
  }

  return (
    <span className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-50 text-brand-700">
      {icon}
    </span>
  );
}
