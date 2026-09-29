import Link from "next/link";
import Image from "next/image";
import { requirePermission } from "@/lib/auth/permissions";
import { listAdminProducts } from "@/lib/data/admin/products";
import { getCategories } from "@/lib/data/categories";
import { getPublicStorageUrl } from "@/lib/storage";
import { formatMoney } from "@/lib/format/money";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/storefront/pagination";

const STATUS_VARIANT: Record<string, "neutral" | "success" | "warning"> = {
  draft: "warning",
  published: "success",
  archived: "neutral",
};

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  await requirePermission("products.read");

  const query = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const status = typeof searchParams.status === "string" ? searchParams.status : undefined;
  const categoryId = typeof searchParams.category === "string" ? searchParams.category : undefined;
  const page = typeof searchParams.page === "string" ? Number(searchParams.page) : 1;

  const [result, categories] = await Promise.all([
    listAdminProducts({ query, status, categoryId, page, pageSize: 25 }),
    getCategories(),
  ]);

  return (
    <div>
      <div className="mb-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-gray-900">Products</h1>
        <Link
          href="/admin/products/new"
          className="inline-flex h-9 items-center rounded-card bg-brand-500 px-4 text-sm font-medium text-white hover:bg-brand-600"
        >
          New product
        </Link>
      </div>

      <form className="mb-4 flex flex-wrap gap-2" method="get">
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search name or SKU…"
          className="rounded-card border border-surface-border px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
        />
        <select
          name="status"
          defaultValue={status ?? ""}
          className="rounded-card border border-surface-border px-3 py-1.5 text-sm"
        >
          <option value="">All statuses</option>
          <option value="draft">Draft</option>
          <option value="published">Published</option>
          <option value="archived">Archived</option>
        </select>
        <select
          name="category"
          defaultValue={categoryId ?? ""}
          className="rounded-card border border-surface-border px-3 py-1.5 text-sm"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
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
              <th className="p-3">Category</th>
              <th className="p-3">Price</th>
              <th className="p-3">Status</th>
              <th className="p-3">Updated</th>
              <th className="p-3"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {result.items.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-6 text-center text-gray-500">
                  No products found.
                </td>
              </tr>
            ) : (
              result.items.map((p) => (
                <tr key={p.id} className="hover:bg-surface-muted">
                  <td className="p-3">
                    <Link href={`/admin/products/${p.id}`} className="flex items-center gap-3">
                      <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded bg-surface-muted">
                        {p.primary_image_path ? (
                          <Image
                            src={getPublicStorageUrl("product-images", p.primary_image_path)}
                            alt=""
                            fill
                            sizes="40px"
                            className="object-cover"
                          />
                        ) : null}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{p.name}</p>
                        <p className="text-xs text-gray-500">{p.brand_name ?? "—"}</p>
                      </div>
                    </Link>
                  </td>
                  <td className="p-3 text-gray-600">{p.sku}</td>
                  <td className="p-3 text-gray-600">{p.category_name ?? "—"}</td>
                  <td className="p-3 text-gray-900">
                    {formatMoney(p.sale_price ?? p.base_price)}
                    {p.sale_price ? <span className="ml-1 text-xs text-gray-400 line-through">{formatMoney(p.base_price)}</span> : null}
                  </td>
                  <td className="p-3">
                    <Badge variant={STATUS_VARIANT[p.status] ?? "neutral"}>{p.status}</Badge>
                    {p.is_featured ? <Badge variant="info" className="ml-1">Featured</Badge> : null}
                  </td>
                  <td className="p-3 text-gray-500">
                    {new Date(p.updated_at).toLocaleDateString("en-MW", { timeZone: "Africa/Blantyre" })}
                  </td>
                  <td className="p-3 text-right">
                    <Link
                      href={`/admin/products/${p.id}`}
                      className="inline-flex min-h-9 items-center rounded-md px-3 text-sm font-medium text-brand-700 hover:bg-brand-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                    >
                      Edit
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={result.page} pageSize={result.pageSize} total={result.total} basePath="/admin/products" searchParams={searchParams} />
    </div>
  );
}
