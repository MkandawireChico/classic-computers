import Link from "next/link";
import { getCompareIdsReadOnly } from "@/lib/services/compare";
import { getCompareProducts, collectSpecLabels } from "@/lib/data/compare";
import { formatMoney } from "@/lib/format/money";
import { StockBadge } from "@/components/product/stock-badge";
import { ClearCompareButton } from "./clear-compare-button";

export default async function ComparePage() {
  const ids = getCompareIdsReadOnly();
  const products = await getCompareProducts(ids);

  if (products.length === 0) {
    return (
      <div>
        <h1 className="mb-4 text-xl font-semibold text-gray-900">Compare</h1>
        <p className="text-sm text-gray-500">
          Nothing to compare yet. Use the &ldquo;Compare&rdquo; button on product cards in the{" "}
          <Link href="/shop" className="text-brand-600 hover:underline">
            shop
          </Link>{" "}
          to add up to 4 products.
        </p>
      </div>
    );
  }

  const specLabels = collectSpecLabels(products);
  const firstProductType = products[0]?.productType;
  const sameType = firstProductType ? products.every((p) => p.productType === firstProductType) : false;

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Compare</h1>
        <ClearCompareButton />
      </div>

      {!sameType ? (
        <p className="mb-4 text-sm text-amber-700">
          You&apos;re comparing products of different types — some specifications may not apply to
          every item.
        </p>
      ) : null}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-40 p-2 text-left" scope="col">
                <span className="sr-only">Attribute</span>
              </th>
              {products.map((product) => (
                <th key={product.id} scope="col" className="p-2 text-left align-top">
                  <Link href={`/product/${product.slug}`} className="font-medium text-gray-900 hover:underline">
                    {product.name}
                  </Link>
                  {product.brandName ? <p className="text-xs text-gray-500">{product.brandName}</p> : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-surface-border">
              <th scope="row" className="p-2 text-left font-medium text-gray-700">
                Price
              </th>
              {products.map((product) => (
                <td key={product.id} className="p-2 font-semibold text-gray-900">
                  {formatMoney(product.price)}
                </td>
              ))}
            </tr>
            <tr className="border-t border-surface-border bg-surface-muted">
              <th scope="row" className="p-2 text-left font-medium text-gray-700">
                Availability
              </th>
              {products.map((product) => (
                <td key={product.id} className="p-2">
                  <StockBadge status={product.inventoryStatus as any} />
                </td>
              ))}
            </tr>
            {specLabels.map((label, index) => (
              <tr
                key={label}
                className={`border-t border-surface-border ${index % 2 === 1 ? "bg-surface-muted" : ""}`}
              >
                <th scope="row" className="p-2 text-left font-medium text-gray-700">
                  {label}
                </th>
                {products.map((product) => (
                  <td key={product.id} className="p-2 text-gray-800">
                    {product.specs[label] ?? "—"}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
