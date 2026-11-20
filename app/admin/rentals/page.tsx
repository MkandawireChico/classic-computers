import Link from "next/link";
import { requirePermission } from "@/lib/auth/permissions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { listAdminRentals } from "@/lib/data/admin/rentals";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/storefront/pagination";

const STATUS_VARIANT: Record<string, "neutral" | "success" | "warning" | "danger" | "info"> = {
  requested: "warning",
  approved: "info",
  ready: "info",
  active: "info",
  returned: "success",
  overdue: "danger",
  damaged: "danger",
  lost: "danger",
  cancelled: "neutral",
};

export default async function AdminRentalsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  await requirePermission("rentals.read");
  const status = typeof searchParams.status === "string" ? searchParams.status : undefined;
  const page = typeof searchParams.page === "string" ? Number(searchParams.page) : 1;

  const result = await listAdminRentals({ status, page, pageSize: 25 });

  return (
    <div>
      <AdminPageHeader eyebrow="Operations · Equipment hire" title="Rentals" description="Manage booking requests, active rentals, returns and exceptions." />

      <form className="mb-5 flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200 bg-white p-3 shadow-sm sm:p-4" method="get" aria-label="Filter rental bookings">
        <select name="status" defaultValue={status ?? ""} className="rounded-card border border-surface-border px-3 py-1.5 text-sm">
          <option value="">All statuses</option>
          {["requested", "approved", "ready", "active", "returned", "overdue", "damaged", "lost", "cancelled"].map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <button type="submit" className="rounded-card border border-surface-border px-3 py-1.5 text-sm hover:bg-surface-muted">
          Filter
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[600px] text-sm">
          <thead className="bg-surface-muted text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="p-3">Product</th>
              <th className="p-3">Customer</th>
              <th className="p-3">Dates</th>
              <th className="p-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {result.items.length === 0 ? (
              <tr>
                <td colSpan={4} className="p-6 text-center text-gray-500">
                  No rentals found.
                </td>
              </tr>
            ) : (
              result.items.map((r) => (
                <tr key={r.id} className="hover:bg-surface-muted">
                  <td className="p-3">
                    <Link href={`/admin/rentals/${r.id}`} className="font-medium text-brand-600 hover:underline">
                      {r.product_name ?? "Rental"}
                    </Link>
                  </td>
                  <td className="p-3 text-gray-700">{r.customer_name ?? r.guest_name ?? "—"}</td>
                  <td className="p-3 text-gray-600">
                    <span>{r.start_date} – {r.end_date}</span> (×{r.quantity})
                  </td>
                  <td className="p-3">
                    <Badge variant={STATUS_VARIANT[r.status] ?? "neutral"}>{r.status}</Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={result.page} pageSize={result.pageSize} total={result.total} basePath="/admin/rentals" searchParams={searchParams} />
    </div>
  );
}
