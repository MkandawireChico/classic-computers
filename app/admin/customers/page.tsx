import Link from "next/link";
import { requirePermission } from "@/lib/auth/permissions";
import { AdminPageHeader } from "@/components/admin/admin-page-header";
import { listAdminCustomers, type CustomerActivityFilter } from "@/lib/data/admin/customers";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/storefront/pagination";
import { formatMoney } from "@/lib/format/money";

function validDateFilter(value: string | undefined): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const parsed = new Date(`${value}T00:00:00.000Z`);
  return !Number.isNaN(parsed.getTime()) && parsed.toISOString().slice(0, 10) === value;
}

export default async function AdminCustomersPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  await requirePermission("customers.read");
  const query = typeof searchParams.q === "string" ? searchParams.q : undefined;
  const parsedPage = typeof searchParams.page === "string" ? Number(searchParams.page) : 1;
  const page = Number.isInteger(parsedPage) && parsedPage > 0 ? parsedPage : 1;
  const fromValue = typeof searchParams.from === "string" ? searchParams.from : undefined;
  const toValue = typeof searchParams.to === "string" ? searchParams.to : undefined;
  const invalidDateFilter = Boolean(
    (fromValue && !validDateFilter(fromValue))
    || (toValue && !validDateFilter(toValue))
    || (validDateFilter(fromValue) && validDateFilter(toValue) && fromValue > toValue),
  );
  const registeredFrom = invalidDateFilter ? undefined : fromValue;
  const registeredTo = invalidDateFilter ? undefined : toValue;
  const activities: CustomerActivityFilter[] = ["all", "purchases", "active_orders", "rentals", "repairs", "enquiries_no_purchases"];
  const activityValue = typeof searchParams.activity === "string" ? searchParams.activity : "all";
  const activity = activities.includes(activityValue as CustomerActivityFilter)
    ? activityValue as CustomerActivityFilter
    : "all";

  const result = await listAdminCustomers({ query, page, pageSize: 25, registeredFrom, registeredTo, activity });

  return (
    <div>
      <AdminPageHeader eyebrow="Commerce · Customer records" title="Customers" description="Review customer accounts and their store activity." />
      {invalidDateFilter ? <p role="status" className="mb-3 rounded-card bg-amber-50 p-3 text-sm text-amber-900">The registration date range is invalid. The date filter was ignored.</p> : null}

      <form className="mb-4 grid gap-2 rounded-card border border-surface-border bg-white p-3 sm:grid-cols-2 xl:grid-cols-5" method="get">
        <input
          type="search"
          name="q"
          defaultValue={query}
          placeholder="Search name, email or phone"
          aria-label="Search customers"
          className="min-h-10 rounded-card border border-surface-border px-3 py-1.5 text-sm"
        />
        <input type="date" name="from" aria-label="Registered from" defaultValue={fromValue} className="min-h-10 rounded-card border border-surface-border px-3 py-1.5 text-sm" />
        <input type="date" name="to" aria-label="Registered to" defaultValue={toValue} className="min-h-10 rounded-card border border-surface-border px-3 py-1.5 text-sm" />
        <select name="activity" aria-label="Filter by customer activity" defaultValue={activity} className="min-h-10 rounded-card border border-surface-border bg-white px-3 py-1.5 text-sm">
          <option value="all">All registered customers</option>
          <option value="purchases">Completed purchases</option>
          <option value="active_orders">Active orders</option>
          <option value="rentals">Rental activity</option>
          <option value="repairs">Repair activity</option>
          <option value="enquiries_no_purchases">Enquiries, no completed purchase</option>
        </select>
        <button type="submit" className="min-h-10 rounded-card border border-surface-border px-3 py-1.5 text-sm hover:bg-surface-muted">
          Search
        </button>
      </form>

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full min-w-[1120px] text-sm">
          <thead className="bg-surface-muted text-left text-xs uppercase text-gray-500">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Account</th>
              <th className="p-3">Orders</th>
              <th className="p-3">Rentals</th>
              <th className="p-3">Repairs</th>
              <th className="p-3">Enquiries</th>
              <th className="p-3">Completed purchases</th>
              <th className="p-3">Student</th>
              <th className="p-3">Joined</th>
              <th className="p-3">Last activity</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {result.items.length === 0 ? (
              <tr>
                <td colSpan={12} className="p-6 text-center text-gray-500">
                  No customers found.
                </td>
              </tr>
            ) : (
              result.items.map((c) => {
                const displayName = (c.full_name ?? "").trim() || c.email || "Unnamed customer";
                return (
                  <tr key={c.id} className="hover:bg-surface-muted">
                    <td className="p-3">
                      <Link href={`/admin/customers/${c.id}`} className="font-medium text-brand-600 hover:underline">
                        {displayName}
                      </Link>
                    </td>
                    <td className="p-3 text-gray-600">{c.email ?? "—"}</td>
                    <td className="p-3 text-gray-600">{c.phone ?? "—"}</td>
                    <td className="p-3"><Badge variant={c.account_status === "active" ? "success" : "warning"}>{c.account_status}</Badge></td>
                    <td className="p-3 text-gray-900">{c.completed_order_count} completed · {c.active_order_count} active</td>
                    <td className="p-3 text-gray-900">{c.rental_count}</td>
                    <td className="p-3 text-gray-900">{c.repair_count}</td>
                    <td className="p-3 text-gray-900">{c.enquiry_count}{c.completed_order_count === 0 && c.enquiry_count > 0 ? <span className="ml-1 text-xs text-amber-800">Prospect</span> : null}</td>
                    <td className="p-3 text-gray-900">{formatMoney(c.completed_purchase_value)}</td>
                    <td className="p-3">
                      <Badge variant={c.student_status === "approved" ? "success" : "neutral"}>{c.student_status}</Badge>
                    </td>
                    <td className="p-3 text-gray-500">
                      {new Date(c.created_at).toLocaleDateString("en-MW", { timeZone: "Africa/Blantyre" })}
                    </td>
                    <td className="p-3 text-gray-500">{c.last_activity ? new Date(c.last_activity).toLocaleDateString("en-MW", { timeZone: "Africa/Blantyre" }) : "—"}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={result.page} pageSize={result.pageSize} total={result.total} basePath="/admin/customers" searchParams={searchParams} />
    </div>
  );
}
