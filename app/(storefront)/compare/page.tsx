import Link from "next/link";
import Image from "next/image";
import { getCompareIdsReadOnly } from "@/lib/services/compare";
import { getCompareProducts, collectSpecLabels } from "@/lib/data/compare";
import { formatMoney } from "@/lib/format/money";
import { StockBadge } from "@/components/product/stock-badge";
import { ClearCompareButton } from "./clear-compare-button";
import { RemoveComparedProductButton } from "./remove-compared-product-button";

export default async function ComparePage() {
  const ids = getCompareIdsReadOnly();
  const products = await getCompareProducts(ids);

  if (products.length === 0) {
    return (
      <main className="min-h-screen bg-[#f4f6f7]"><div className="section-shell py-10 sm:py-14"><div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="mb-4 text-2xl font-semibold tracking-tight text-[#102033] sm:text-3xl">Compare products</h1>
        <p className="text-sm text-gray-500">
          Nothing to compare yet. Use the &ldquo;Compare&rdquo; button on product cards in the{" "}
          <Link href="/shop" className="text-brand-600 hover:underline">
            shop
          </Link>{" "}
          to add up to 4 products.
        </p>
      </div></div></main>
    );
  }

  const specLabels = collectSpecLabels(products);
  const firstProductType = products[0]?.productType;
  const sameType = firstProductType ? products.every((p) => p.productType === firstProductType) : false;

  return (
    <main className="min-h-screen bg-[#f4f6f7]"><div className="section-shell py-10 sm:py-14"><div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-gradient-to-r from-brand-50 via-white to-cyan-50 p-5 text-navy-900 sm:p-7">
        <h1 className="text-2xl font-semibold tracking-tight text-navy-950">Compare products</h1>
        <ClearCompareButton />
      </div>

      {!sameType ? (
        <p className="mb-4 text-sm text-amber-700">
          You&apos;re comparing products of different types — some specifications may not apply to
          every item.
        </p>
      ) : null}

      <div className="overflow-x-auto p-4 sm:p-6">
        <table className="w-full min-w-[600px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="w-40 p-2 text-left" scope="col">
                <span className="sr-only">Attribute</span>
              </th>
              {products.map((product) => (
                <th key={product.id} scope="col" className="p-2 text-left align-top">
                  <div className="mb-3 flex h-28 w-full items-center justify-center overflow-hidden rounded-lg border border-slate-100 bg-slate-50 p-2">
                    {product.imageUrl ? (
                      <Image src={product.imageUrl} alt={product.imageAlt} width={180} height={140} className="h-full w-full object-contain" />
                    ) : (
                      <span className="text-xs font-medium text-slate-400">Image unavailable</span>
                    )}
                  </div>
                  <Link href={`/product/${product.slug}`} className="font-semibold text-gray-900 hover:text-brand-700 hover:underline">
                    {product.name}
                  </Link>
                  {product.brandName ? <p className="mt-1 text-xs text-gray-500">{product.brandName}</p> : null}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-surface-border">
              <th scope="row" className="p-2 text-left font-medium text-gray-700">
                Condition
              </th>
              {products.map((product) => (
                <td key={product.id} className="p-2 capitalize text-gray-800">{product.condition.replaceAll("_", " ")}</td>
              ))}
            </tr>
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
    </div></div></main>
  );
}
