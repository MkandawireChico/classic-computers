import Link from "next/link";
import { requirePermission } from "@/lib/auth/permissions";
import { listAdminCustomers } from "@/lib/data/admin/customers";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/storefront/pagination";
import { formatMoney } from "@/lib/format/money";

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  await requirePermission("customers.read");
  const query = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const page = typeof searchParams.page === "string" ? Number(searchParams.page) : 1;

  const result = await listAdminCustomers(query, page, 25);

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-gray-900">Customers</h1>

      <form className="mb-4 flex gap-2" method="get">
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search name or phone…"
          className="rounded-card border border-surface-border px-3 py-1.5 text-sm"
        />
        <button type="submit" className="rounded-card border border-surface-border px-3 py-1.5 text-sm hover:bg-surface-muted">
          Search
        </button>
      </form>

      <div className="overflow-x-auto rounded-card border border-surface-border">
        <table className="w-full min-w-[600px] text-sm">
          <thead className="bg-surface-muted text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="p-3">Customer</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Orders</th>
              <th className="p-3">Total spent</th>
              <th className="p-3">Student</th>
              <th className="p-3">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {result.items.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-6 text-center text-gray-500">
                  No customers found.
                </td>
              </tr>
            ) : (
              result.items.map((c) => (
                <tr key={c.id} className="hover:bg-surface-muted">
                  <td className="p-3">
                    <Link href={`/admin/customers/${c.id}`} className="font-medium text-brand-600 hover:underline">
                      {c.full_name ?? "Unnamed customer"}
                    </Link>
                  </td>
                  <td className="p-3 text-gray-600">{c.phone ?? "—"}</td>
                  <td className="p-3 text-gray-900">{c.order_count}</td>
                  <td className="p-3 text-gray-900">{formatMoney(c.total_spent)}</td>
                  <td className="p-3">
                    <Badge variant={c.student_status === "approved" ? "success" : "neutral"}>{c.student_status}</Badge>
                  </td>
                  <td className="p-3 text-gray-500">
                    {new Date(c.created_at).toLocaleDateString("en-MW", { timeZone: "Africa/Blantyre" })}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={result.page} pageSize={result.pageSize} total={result.total} basePath="/admin/customers" searchParams={searchParams} />
    </div>
  );
}
