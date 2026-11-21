import { ProductGrid } from "./product-grid";
import type { ProductListItem } from "@/types/catalog";

export function RelatedProducts({ products }: { products: ProductListItem[] }) {
  if (products.length === 0) return null;

  return (
    <section id="related-products" className="mt-12 scroll-mt-28 border-t border-slate-200 pt-9 sm:mt-16 sm:pt-12" aria-labelledby="related-heading">
      <h2 id="related-heading" className="mb-6 text-2xl font-bold text-navy-900">
        More from this category
      </h2>
      <ProductGrid products={products} />
    </section>
  );
}
