import Image from "next/image";
import Link from "next/link";
import { searchShop } from "@/lib/data/products";
import { getPublicStorageUrl } from "@/lib/storage";
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
  const categoryProducts = await Promise.all(
    categories.map(async (category) => {
      const result = await searchShop({ categorySlug: category.slug, page: 1, pageSize: 1, sort: "featured" });
      return [category.id, result.items[0] ?? null] as const;
    }),
  );
  const productByCategory = new Map(categoryProducts);

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

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {categories.map((category) => {
              const name = formatCategoryName(category.name);
              const product = productByCategory.get(category.id);
              const imageUrl = product?.primary_image
                ? getPublicStorageUrl("product-images", product.primary_image.storage_path)
                : null;
              return (
                <Link
                  key={category.id}
                  href={`/shop/${category.slug}`}
                  className="group overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-brand-300 hover:shadow-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                  aria-label={`Browse ${name}`}
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#f3f7fa]">
                    {imageUrl ? (
                      <Image
                        src={imageUrl}
                        alt={product?.primary_image?.alt_text ?? product?.name ?? name}
                        fill
                        sizes="(max-width: 639px) 100vw, (max-width: 1279px) 50vw, 33vw"
                        className="object-contain p-5 transition-transform duration-500 group-hover:scale-105 sm:p-7"
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center bg-gradient-to-br from-[#eaf2f7] to-[#f8fafc]">
                        <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white text-brand-700 shadow-sm">
                          <CategoryIcon name={name} />
                        </span>
                      </div>
                    )}
                    <span className="absolute left-3 top-3 rounded-full border border-white/80 bg-white/90 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-brand-800 backdrop-blur">
                      Category
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-3 p-4 sm:p-5">
                    <span className="min-w-0">
                      <span className="block text-base font-bold tracking-tight text-[#102033] transition-colors group-hover:text-brand-700 sm:text-lg">{name}</span>
                      <span className="mt-1 block text-xs text-slate-500">Browse available products</span>
                    </span>
                    <span aria-hidden="true" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-lg text-slate-500 transition-all group-hover:border-brand-600 group-hover:bg-brand-600 group-hover:text-white">↗</span>
                  </div>
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