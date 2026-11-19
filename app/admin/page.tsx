import Link from "next/link";
import { getMyPermissions } from "@/lib/auth/permissions";
import {
  getDashboardStats,
  getRecentOrders,
  getRecentReviews,
  getRecentInventoryMovements,
} from "@/lib/data/admin/dashboard";
import { StatCard } from "@/components/admin/stat-card";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/format/money";
import { listAdminCustomers } from "@/lib/data/admin/customers";

const STATUS_VARIANT: Record<string, "neutral" | "success" | "warning" | "danger" | "info"> = {
  pending: "warning",
  confirmed: "info",
  processing: "info",
  ready_for_pickup: "info",
  out_for_delivery: "info",
  completed: "success",
  cancelled: "danger",
  refunded: "neutral",
};

export default async function AdminDashboardPage() {
  const permissions = await getMyPermissions();
  const canSeeOrders = permissions.has("orders.read");
  const canSeeInventory = permissions.has("inventory.read");
  const canSeeCustomers = permissions.has("customers.read");
  const canSeeReviews = permissions.has("reviews.read");
  const canSeeRepairs = permissions.has("repairs.read");
  const canSeeRentals = permissions.has("rentals.read");
  const canSeeStudents = permissions.has("students.read");
  const canSeeReports = permissions.has("reports.read");
  const canSeeSales = canSeeOrders;

  const [stats, recentOrders, recentCustomers, recentReviews, recentMovements] = await Promise.all([
    getDashboardStats({
      orders: canSeeOrders,
      sales: canSeeSales,
      inventory: canSeeInventory,
      enquiries: canSeeCustomers,
      repairs: canSeeRepairs,
      rentals: canSeeRentals,
      students: canSeeStudents,
    }),
    canSeeOrders ? getRecentOrders() : Promise.resolve([]),
    canSeeCustomers ? listAdminCustomers({ page: 1, pageSize: 5 }).then((result) => result.items) : Promise.resolve([]),
    canSeeReviews ? getRecentReviews() : Promise.resolve([]),
    canSeeInventory ? getRecentInventoryMovements() : Promise.resolve([]),
  ]);

  const quickActions = [
    canSeeOrders ? { href: "/admin/orders", label: "Review orders", description: "Check new and active orders" } : null,
    canSeeInventory ? { href: "/admin/inventory", label: "Manage stock", description: "Review low and unavailable stock" } : null,
    canSeeRepairs ? { href: "/admin/repairs", label: "Repair queue", description: "Review open repair tickets" } : null,
    canSeeRentals ? { href: "/admin/rentals", label: "Rental bookings", description: "Review active rental activity" } : null,
    canSeeCustomers ? { href: "/admin/enquiries", label: "Customer enquiries", description: "Respond to incoming requests" } : null,
    canSeeReports ? { href: "/admin/analytics", label: "Customer interest analytics", description: "Review opted-in storefront activity" } : null,
    canSeeStudents ? { href: "/admin/students", label: "Student verification", description: "Review pending applications" } : null,
  ].filter((item): item is { href: string; label: string; description: string } => item !== null);

  const today = new Intl.DateTimeFormat("en-MW", {
    dateStyle: "full",
    timeZone: "Africa/Blantyre",
  }).format(new Date());

  return (
    <div className="space-y-8">
      <header className="flex flex-col gap-4 border-b border-slate-200 pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-brand-700">Classic Computers · Admin</p>
          <h1 className="mt-2 text-3xl font-extrabold tracking-[-0.05em] text-navy-950 sm:text-4xl">Operations overview</h1>
          <p className="mt-2 text-sm text-slate-500">{today}</p>
        </div>
        {canSeeOrders ? (
          <Link href="/admin/orders" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-brand-700 px-5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2">
            View orders
          </Link>
        ) : null}
      </header>

      <section aria-label="Business overview" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {canSeeOrders ? (
          <>
            <StatCard label="Total orders" value={stats.totalOrders} description="All recorded orders" />
            <StatCard label="Pending orders" value={stats.pendingOrders} tone={stats.pendingOrders > 0 ? "warning" : undefined} description="Awaiting initial action" />
            <StatCard label="Awaiting action" value={stats.ordersAwaitingAction} description="Confirmed or processing" />
          </>
        ) : null}
        {canSeeSales ? <StatCard label="Completed sales" value={formatMoney(stats.salesTotalMwk)} description="Completed orders · MWK" /> : null}
        {canSeeInventory ? (
          <>
            <StatCard label="Low stock" value={stats.lowStockCount} tone={stats.lowStockCount > 0 ? "warning" : undefined} description="Below the stock threshold" />
            <StatCard label="Out of stock" value={stats.outOfStockCount} tone={stats.outOfStockCount > 0 ? "danger" : undefined} description="Unavailable inventory" />
          </>
        ) : null}
        {canSeeCustomers ? <StatCard label="Pending enquiries" value={stats.pendingEnquiries} description="New customer enquiries" /> : null}
        {canSeeRepairs ? <StatCard label="Open repairs" value={stats.pendingRepairs} description="Not completed or cancelled" /> : null}
        {canSeeRentals ? <StatCard label="Active rentals" value={stats.activeRentals} description="Currently active bookings" /> : null}
        {canSeeStudents ? <StatCard label="Student verifications" value={stats.pendingStudentVerifications} description="Awaiting review" /> : null}
      </section>

      {quickActions.length > 0 ? (
        <section aria-labelledby="admin-quick-actions-heading">
          <div className="mb-4">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-brand-700">Work queues</p>
            <h2 id="admin-quick-actions-heading" className="mt-1 text-xl font-extrabold tracking-tight text-navy-950">Quick actions</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {quickActions.map((action) => (
              <Link key={action.href} href={action.href} className="group rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
                <span className="text-sm font-bold text-navy-950 transition-colors group-hover:text-brand-800">{action.label}</span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">{action.description}</span>
                <span aria-hidden="true" className="mt-4 block text-sm font-bold text-brand-700">Open queue ↗</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section aria-label="Recent activity" className="grid gap-5 xl:grid-cols-2">
        {canSeeOrders ? (
          <Card>
            <CardHeader>
              <CardTitle>Recent orders</CardTitle>
              <p className="text-sm text-slate-500">The latest orders recorded by the store.</p>
            </CardHeader>
            {recentOrders.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">No orders recorded yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentOrders.map((order) => (
                  <Link key={order.id} href={`/admin/orders/${order.id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                    <span className="min-w-0 flex-1">
                      <span className="block break-all text-sm font-bold text-navy-950">{order.order_number}</span>
                      <span className="mt-1 block text-xs text-slate-500">{new Date(order.created_at).toLocaleDateString("en-MW", { timeZone: "Africa/Blantyre", dateStyle: "medium" })}</span>
                    </span>
                    <span className="text-sm font-bold text-navy-950">{formatMoney(order.total)}</span>
                    <Badge variant={STATUS_VARIANT[order.order_status] ?? "neutral"}>{order.order_status.replace(/_/g, " ")}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        ) : null}

        {canSeeCustomers ? (
          <Card>
            <CardHeader>
              <CardTitle>Recent customers</CardTitle>
              <p className="text-sm text-slate-500">Recently created customer accounts.</p>
            </CardHeader>
            {recentCustomers.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">No customer accounts recorded yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentCustomers.map((customer) => (
                  <Link key={customer.id} href={`/admin/customers/${customer.id}`} className="flex items-center justify-between gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                    <span className="text-sm font-semibold text-navy-950">{customer.full_name ?? "Unnamed customer"}</span>
                    <span className="text-xs text-slate-500">{new Date(customer.created_at).toLocaleDateString("en-MW", { timeZone: "Africa/Blantyre", dateStyle: "medium" })}</span>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        ) : null}

        {canSeeReviews ? (
          <Card>
            <CardHeader>
              <CardTitle>Recent reviews</CardTitle>
              <p className="text-sm text-slate-500">Recent customer feedback awaiting or completing moderation.</p>
            </CardHeader>
            {recentReviews.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">No reviews recorded yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentReviews.map((review) => (
                  <Link key={review.id} href="/admin/reviews" className="flex items-center justify-between gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-navy-950">{review.product_name ?? "Customer experience"}</span>
                      <span className="mt-1 block text-xs text-amber-600">{"★".repeat(review.rating)}</span>
                    </span>
                    <Badge variant={review.status === "approved" ? "success" : "neutral"}>{review.status}</Badge>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        ) : null}

        {canSeeInventory ? (
          <Card>
            <CardHeader>
              <CardTitle>Recent inventory movements</CardTitle>
              <p className="text-sm text-slate-500">Latest stock adjustments and recorded movements.</p>
            </CardHeader>
            {recentMovements.length === 0 ? (
              <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">No inventory movements recorded yet.</p>
            ) : (
              <div className="divide-y divide-slate-100">
                {recentMovements.map((movement) => (
                  <Link key={movement.id} href="/admin/inventory" className="flex items-center justify-between gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-semibold text-navy-950">{movement.product_name ?? "Unknown product"}</span>
                      <span className="mt-1 block text-xs text-slate-500">{movement.movement_type.replace(/_/g, " ")}</span>
                    </span>
                    <span className={`text-sm font-extrabold ${movement.quantity_delta < 0 ? "text-status-danger" : "text-status-success"}`}>
                      {movement.quantity_delta > 0 ? "+" : ""}{movement.quantity_delta}
                    </span>
                  </Link>
                ))}
              </div>
            )}
          </Card>
        ) : null}
      </section>
    </div>
  );
}
