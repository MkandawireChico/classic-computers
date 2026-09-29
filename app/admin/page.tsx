import Link from "next/link";
import { getMyPermissions } from "@/lib/auth/permissions";
import {
  getDashboardStats,
  getRecentOrders,
  getRecentCustomers,
  getRecentReviews,
  getRecentInventoryMovements,
} from "@/lib/data/admin/dashboard";
import { StatCard } from "@/components/admin/stat-card";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/format/money";

export default async function AdminDashboardPage() {
  const permissions = await getMyPermissions();
  const canSeeOrders = permissions.has("orders.read");
  const canSeeInventory = permissions.has("inventory.read");
  const canSeeCustomers = permissions.has("customers.read");
  const canSeeReviews = permissions.has("reviews.read");
  const canSeeReports = permissions.has("reports.read") || permissions.has("orders.read");

  const [stats, recentOrders, recentCustomers, recentReviews, recentMovements] = await Promise.all([
    getDashboardStats(),
    canSeeOrders ? getRecentOrders() : Promise.resolve([]),
    canSeeCustomers ? getRecentCustomers() : Promise.resolve([]),
    canSeeReviews ? getRecentReviews() : Promise.resolve([]),
    canSeeInventory ? getRecentInventoryMovements() : Promise.resolve([]),
  ]);

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-semibold text-gray-900">Dashboard</h1>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        {canSeeOrders ? (
          <>
            <StatCard label="Total orders" value={stats.totalOrders} />
            <StatCard label="Pending orders" value={stats.pendingOrders} tone={stats.pendingOrders > 0 ? "warning" : undefined} />
            <StatCard label="Awaiting action" value={stats.ordersAwaitingAction} />
          </>
        ) : null}
        {canSeeReports ? <StatCard label="Completed sales (MWK)" value={formatMoney(stats.salesTotalMwk)} /> : null}
        {canSeeInventory ? (
          <>
            <StatCard label="Low stock" value={stats.lowStockCount} tone={stats.lowStockCount > 0 ? "warning" : undefined} />
            <StatCard label="Out of stock" value={stats.outOfStockCount} tone={stats.outOfStockCount > 0 ? "danger" : undefined} />
          </>
        ) : null}
        <StatCard label="Pending enquiries" value={stats.pendingEnquiries} />
        <StatCard label="Pending repairs" value={stats.pendingRepairs} />
        <StatCard label="Active rentals" value={stats.activeRentals} />
        <StatCard label="Pending student verifications" value={stats.pendingStudentVerifications} />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {canSeeOrders ? (
          <Card>
            <CardHeader>
              <CardTitle>Recent orders</CardTitle>
            </CardHeader>
            {recentOrders.length === 0 ? (
              <p className="empty-state">No orders yet.</p>
            ) : (
              <div className="space-y-2">
                {recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="flex items-center justify-between rounded-card p-2 text-sm hover:bg-surface-muted"
                  >
                    <span className="font-medium text-gray-900">{order.order_number}</span>
                    <span className="text-gray-500">{formatMoney(order.total)}</span>
                    <Badge variant="neutral">{order.order_status.replace(/_/g, " ")}</Badge>
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
            </CardHeader>
            {recentCustomers.length === 0 ? (
              <p className="empty-state">No customers yet.</p>
            ) : (
              <div className="space-y-2">
                {recentCustomers.map((c) => (
                  <div key={c.id} className="flex items-center justify-between p-2 text-sm">
                    <span className="text-gray-900">{c.full_name ?? "Unnamed customer"}</span>
                    <span className="text-gray-400">
                      {new Date(c.created_at).toLocaleDateString("en-MW", { timeZone: "Africa/Blantyre" })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ) : null}

        {canSeeReviews ? (
          <Card>
            <CardHeader>
              <CardTitle>Recent reviews</CardTitle>
            </CardHeader>
            {recentReviews.length === 0 ? (
              <p className="empty-state">No reviews yet.</p>
            ) : (
              <div className="space-y-2">
                {recentReviews.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-2 text-sm">
                    <span className="text-gray-900">{r.product_name ?? "Unknown product"}</span>
                    <span className="text-amber-500">{"★".repeat(r.rating)}</span>
                    <Badge variant={r.status === "approved" ? "success" : "neutral"}>{r.status}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ) : null}

        {canSeeInventory ? (
          <Card>
            <CardHeader>
              <CardTitle>Recent inventory movements</CardTitle>
            </CardHeader>
            {recentMovements.length === 0 ? (
              <p className="empty-state">No inventory movements yet.</p>
            ) : (
              <div className="space-y-2">
                {recentMovements.map((m) => (
                  <div key={m.id} className="flex items-center justify-between p-2 text-sm">
                    <span className="text-gray-900">{m.product_name ?? "Unknown product"}</span>
                    <span className={m.quantity_delta < 0 ? "text-status-danger" : "text-status-success"}>
                      {m.quantity_delta > 0 ? "+" : ""}
                      {m.quantity_delta}
                    </span>
                    <Badge variant="neutral">{m.movement_type.replace(/_/g, " ")}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>
        ) : null}
      </div>
    </div>
  );
}
