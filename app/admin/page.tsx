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
  const canManageProducts = permissions.has("products.write");
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
    canManageProducts ? { href: "/admin/products/new", label: "Add a product", description: "Create a listing with pricing, images and specifications" } : null,
    canSeeOrders ? { href: "/admin/orders", label: "Review orders", description: "Check new and active orders" } : null,
    canSeeInventory ? { href: "/admin/inventory", label: "Manage stock", description: "Review low and unavailable stock" } : null,
    canSeeRepairs ? { href: "/admin/repairs", label: "Repair queue", description: "Review open repair tickets" } : null,
    canSeeRentals ? { href: "/admin/rentals", label: "Rental bookings", description: "Review active rental activity" } : null,
    canSeeCustomers ? { href: "/admin/enquiries", label: "Customer enquiries", description: "Respond to incoming requests" } : null,
    canSeeReports ? { href: "/admin/analytics", label: "Customer interest analytics", description: "Review opted-in storefront activity" } : null,
    canSeeStudents ? { href: "/admin/students", label: "Student verification", description: "Review pending applications" } : null,
    permissions.has("settings.write") ? { href: "/admin/settings", label: "Store settings", description: "Review storefront, payment and business settings" } : null,
  ].filter((item): item is { href: string; label: string; description: string } => item !== null);

  const today = new Intl.DateTimeFormat("en-MW", {
    dateStyle: "full",
    timeZone: "Africa/Blantyre",
  }).format(new Date());

  return (
    <div className="space-y-8 sm:space-y-10">
      <header className="relative overflow-hidden rounded-[1.75rem] bg-slate-950 px-5 py-7 text-white shadow-[0_18px_45px_rgba(15,23,42,0.12)] sm:px-8 sm:py-9">
        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border-[36px] border-cyan-400/10" />
        <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 right-28 h-64 w-64 rounded-full bg-blue-500/10 blur-3xl" />
        <div className="relative flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-cyan-300">Classic Computers · Control centre</p>
            <h1 className="mt-3 text-3xl font-extrabold tracking-[-0.05em] text-white sm:text-4xl">Operations overview</h1>
            <p className="mt-2 text-sm text-slate-300">{today}</p>
            <p className="mt-4 max-w-xl text-sm leading-6 text-slate-300">A live view of store activity, customer requests and the work requiring attention.</p>
          </div>
          {canSeeOrders ? (
            <Link href="/admin/orders" className="inline-flex min-h-11 items-center justify-center gap-2 self-start rounded-xl bg-cyan-400 px-5 text-sm font-extrabold text-slate-950 shadow-sm transition hover:bg-cyan-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 sm:self-auto">
              Open order desk <span aria-hidden="true">↗</span>
            </Link>
          ) : null}
        </div>
      </header>

      <section aria-label="Business overview">
        <div className="mb-4 flex items-end justify-between gap-3">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-brand-700">At a glance</p>
            <h2 className="mt-1 text-lg font-extrabold tracking-tight text-navy-950">Store performance</h2>
          </div>
          <p className="text-xs text-slate-400">Current recorded totals</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
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
        </div>
      </section>

      {quickActions.length > 0 ? (
        <section aria-labelledby="admin-quick-actions-heading">
          <div className="mb-4">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-brand-700">Daily workflow</p>
            <h2 id="admin-quick-actions-heading" className="mt-1 text-xl font-extrabold tracking-tight text-navy-950">Your work queues</h2>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            {quickActions.map((action, index) => (
              <Link key={action.href} href={action.href} className="group flex min-h-[142px] flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_2px_10px_rgba(15,23,42,0.035)] transition-all hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-[0_12px_28px_rgba(15,23,42,0.08)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-[10px] font-black text-slate-600 transition-colors group-hover:bg-cyan-50 group-hover:text-cyan-800">{String(index + 1).padStart(2, "0")}</span>
                <span className="mt-4 text-sm font-extrabold text-navy-950 transition-colors group-hover:text-brand-800">{action.label}</span>
                <span className="mt-1 block text-xs leading-5 text-slate-500">{action.description}</span>
                <span aria-hidden="true" className="mt-auto pt-4 text-xs font-extrabold text-brand-700">Open workspace ↗</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section aria-label="Recent activity">
        <div className="mb-4">
          <p className="text-[10px] font-extrabold uppercase tracking-[0.18em] text-brand-700">Latest updates</p>
          <h2 className="mt-1 text-xl font-extrabold tracking-tight text-navy-950">Recent activity</h2>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {canSeeOrders ? (
            <Card className="border-slate-200 shadow-[0_3px_16px_rgba(15,23,42,0.04)]">
              <CardHeader className="mb-3 flex flex-row items-start justify-between gap-3">
                <div><CardTitle>Recent orders</CardTitle><p className="mt-1 text-xs text-slate-500">The latest orders recorded by the store.</p></div>
                <Link href="/admin/orders" className="shrink-0 text-xs font-bold text-brand-700 hover:text-brand-900">View all ↗</Link>
              </CardHeader>
              {recentOrders.length === 0 ? (
                <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">No orders recorded yet.</p>
              ) : (
                <div className="divide-y divide-slate-100">
                  {recentOrders.map((order) => (
                    <Link key={order.id} href={`/admin/orders/${order.id}`} className="flex flex-wrap items-center justify-between gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                      <span className="min-w-0 flex-1"><span className="block break-all text-sm font-bold text-navy-950">{order.order_number}</span><span className="mt-1 block text-xs text-slate-500">{new Date(order.created_at).toLocaleDateString("en-MW", { timeZone: "Africa/Blantyre", dateStyle: "medium" })}</span></span>
                      <span className="text-sm font-bold text-navy-950">{formatMoney(order.total)}</span>
                      <Badge variant={STATUS_VARIANT[order.order_status] ?? "neutral"}>{order.order_status.replace(/_/g, " ")}</Badge>
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          ) : null}

          {canSeeCustomers ? (
            <Card className="border-slate-200 shadow-[0_3px_16px_rgba(15,23,42,0.04)]">
              <CardHeader className="mb-3 flex flex-row items-start justify-between gap-3">
                <div><CardTitle>Recent customers</CardTitle><p className="mt-1 text-xs text-slate-500">Recently created customer accounts.</p></div>
                <Link href="/admin/customers" className="shrink-0 text-xs font-bold text-brand-700 hover:text-brand-900">View all ↗</Link>
              </CardHeader>
              {recentCustomers.length === 0 ? <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">No customer accounts recorded yet.</p> : (
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
            <Card className="border-slate-200 shadow-[0_3px_16px_rgba(15,23,42,0.04)]">
              <CardHeader className="mb-3 flex flex-row items-start justify-between gap-3">
                <div><CardTitle>Recent reviews</CardTitle><p className="mt-1 text-xs text-slate-500">Recent customer feedback and moderation status.</p></div>
                <Link href="/admin/reviews" className="shrink-0 text-xs font-bold text-brand-700 hover:text-brand-900">Moderate ↗</Link>
              </CardHeader>
              {recentReviews.length === 0 ? <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">No reviews recorded yet.</p> : (
                <div className="divide-y divide-slate-100">
                  {recentReviews.map((review) => (
                    <Link key={review.id} href="/admin/reviews" className="flex items-center justify-between gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                      <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-navy-950">{review.product_name ?? "Customer experience"}</span><span className="mt-1 block text-xs text-amber-600">{"★".repeat(review.rating)}</span></span>
                      <Badge variant={review.status === "approved" ? "success" : "neutral"}>{review.status}</Badge>
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          ) : null}

          {canSeeInventory ? (
            <Card className="border-slate-200 shadow-[0_3px_16px_rgba(15,23,42,0.04)]">
              <CardHeader className="mb-3 flex flex-row items-start justify-between gap-3">
                <div><CardTitle>Inventory movements</CardTitle><p className="mt-1 text-xs text-slate-500">Latest stock adjustments and recorded movements.</p></div>
                <Link href="/admin/inventory" className="shrink-0 text-xs font-bold text-brand-700 hover:text-brand-900">View stock ↗</Link>
              </CardHeader>
              {recentMovements.length === 0 ? <p className="rounded-xl border border-dashed border-slate-200 bg-slate-50 p-5 text-sm text-slate-500">No inventory movements recorded yet.</p> : (
                <div className="divide-y divide-slate-100">
                  {recentMovements.map((movement) => (
                    <Link key={movement.id} href="/admin/inventory" className="flex items-center justify-between gap-3 rounded-lg px-2 py-3 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
                      <span className="min-w-0 flex-1"><span className="block truncate text-sm font-semibold text-navy-950">{movement.product_name ?? "Unknown product"}</span><span className="mt-1 block text-xs text-slate-500">{movement.movement_type.replace(/_/g, " ")}</span></span>
                      <span className={`text-sm font-extrabold ${movement.quantity_delta < 0 ? "text-status-danger" : "text-status-success"}`}>{movement.quantity_delta > 0 ? "+" : ""}{movement.quantity_delta}</span>
                    </Link>
                  ))}
                </div>
              )}
            </Card>
          ) : null}
        </div>
      </section>
    </div>
  );
}
