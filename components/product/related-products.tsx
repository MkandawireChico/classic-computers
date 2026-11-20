import { ProductGrid } from "./product-grid";
import type { ProductListItem } from "@/types/catalog";

export function RelatedProducts({ products }: { products: ProductListItem[] }) {
  if (products.length === 0) return null;

  return (
    <section className="mt-16" aria-labelledby="related-heading">
      <h2 id="related-heading" className="mb-6 text-2xl font-bold text-navy-900">
        You might also like
      </h2>
      <ProductGrid products={products} />
    </section>
  );
}
