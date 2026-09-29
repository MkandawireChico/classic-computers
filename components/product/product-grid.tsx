import { ProductCard } from "./product-card";
import { getCompareIdsReadOnly } from "@/lib/services/compare";
import type { ProductListItem } from "@/types/catalog";

export function ProductGrid({
  products,
  emptyMessage,
  mode = "default",
}: {
  products: ProductListItem[];
  emptyMessage?: string;
  mode?: "default" | "catalog";
}) {
  const compareIds = getCompareIdsReadOnly();

  if (products.length === 0) {
    return (
      <div className={mode === "catalog" ? "flex flex-col items-center justify-center gap-2 rounded-md border border-dashed border-surface-border bg-white px-5 py-12 text-center" : "flex flex-col items-center justify-center gap-2 rounded-card border border-dashed border-surface-border py-16 text-center"}>
        {mode === "catalog" ? (
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true" className="mb-1 text-slate-300">
            <rect x="3" y="4" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="1.5" />
            <path d="M8 21h8M12 17v4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        ) : null}
        <p className="text-sm font-medium text-gray-700">{emptyMessage ?? "No products found."}</p>
        <p className="text-sm text-gray-500">
          {mode === "catalog" ? "Try a different search or adjust your filters." : "Try adjusting your search or filters."}
        </p>
      </div>
    );
  }

  return (
    <div className={mode === "catalog" ? "grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4" : "grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5"}>
      {products.map((product) => (
        <ProductCard key={product.id} product={product} isComparing={compareIds.includes(product.id)} variant={mode} />
      ))}
    </div>
  );
}
