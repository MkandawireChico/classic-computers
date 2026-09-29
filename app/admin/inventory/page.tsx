import Link from "next/link";
import { requirePermission } from "@/lib/auth/permissions";
import { listInventory } from "@/lib/data/admin/inventory";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/storefront/pagination";

const STATUS_VARIANT: Record<string, "neutral" | "success" | "warning" | "danger" | "info"> = {
  in_stock: "success",
  low_stock: "warning",
  out_of_stock: "danger",
  discontinued: "neutral",
  coming_soon: "info",
};

export default async function AdminInventoryPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  await requirePermission("inventory.read");

  const query = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const status = typeof searchParams.status === "string" ? searchParams.status : undefined;
  const page = typeof searchParams.page === "string" ? Number(searchParams.page) : 1;

  const result = await listInventory({ query, status, page, pageSize: 30 });

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-gray-900">Inventory</h1>

      <form className="mb-4 flex flex-wrap gap-2" method="get">
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search product or SKU…"
          className="rounded-card border border-surface-border px-3 py-1.5 text-sm"
        />
        <select name="status" defaultValue={status ?? ""} className="rounded-card border border-surface-border px-3 py-1.5 text-sm">
          <option value="">All statuses</option>
          <option value="in_stock">In stock</option>
          <option value="low_stock">Low stock</option>
          <option value="out_of_stock">Out of stock</option>
          <option value="discontinued">Discontinued</option>
          <option value="coming_soon">Coming soon</option>
        </select>
        <button type="submit" className="rounded-card border border-surface-border px-3 py-1.5 text-sm hover:bg-surface-muted">
          Filter
        </button>
      </form>

      <div className="overflow-x-auto rounded-card border border-surface-border">
        <table className="w-full min-w-[700px] text-sm">
          <thead className="bg-surface-muted text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">SKU</th>
              <th className="p-3">On hand</th>
              <th className="p-3">Threshold</th>
              <th className="p-3">Status</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {result.items.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  No inventory records found.
                </td>
              </tr>
            ) : (
              result.items.map((row) => (
                <tr key={row.id} className="hover:bg-surface-muted">
                  <td className="p-3">
                    <p className="font-medium text-gray-900">{row.product_name}</p>
                    {row.variant_name ? <p className="text-xs text-gray-500">{row.variant_name}</p> : null}
                  </td>
                  <td className="p-3 text-gray-600">{row.sku}</td>
                  <td className="p-3 text-gray-900">{row.quantity_on_hand}</td>
                  <td className="p-3 text-gray-500">{row.low_stock_threshold}</td>
                  <td className="p-3">
                    <Badge variant={STATUS_VARIANT[row.status] ?? "neutral"}>{row.status.replace(/_/g, " ")}</Badge>
                  </td>
                  <td className="p-3">
                    <Link href={`/admin/inventory/${row.id}`} className="text-xs text-brand-600 hover:underline">
                      Adjust / history
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={result.page} pageSize={result.pageSize} total={result.total} basePath="/admin/inventory" searchParams={searchParams} />
    </div>
  );
}
