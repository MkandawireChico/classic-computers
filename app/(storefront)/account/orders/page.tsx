import Link from "next/link";
import { getMyOrders } from "@/lib/data/orders";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/format/money";

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

export default async function OrdersPage() {
  const orders = await getMyOrders();

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-gray-900">Orders</h1>

      {orders.length === 0 ? (
        <p className="empty-state">
          No orders yet.{" "}
          <Link href="/shop" className="text-brand-600 hover:underline">
            Start shopping
          </Link>
          .
        </p>
      ) : (
        <div className="divide-y divide-surface-border rounded-card border border-surface-border">
          {orders.map((order) => (
            <Link
              key={order.id}
              href={`/account/orders/${order.id}`}
              className="flex items-center justify-between p-4 hover:bg-surface-muted"
            >
              <div>
                <p className="text-sm font-medium text-gray-900">{order.order_number}</p>
                <p className="text-xs text-gray-500">
                  {new Date(order.created_at).toLocaleDateString("en-MW", { timeZone: "Africa/Blantyre" })}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-medium text-gray-900">{formatMoney(order.total)}</span>
                <Badge variant={STATUS_VARIANT[order.order_status] ?? "neutral"}>
                  {order.order_status.replace(/_/g, " ")}
                </Badge>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
