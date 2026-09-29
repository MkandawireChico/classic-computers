import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/permissions";
import { getAdminOrderById } from "@/lib/data/admin/orders";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/format/money";
import { OrderStatusControls } from "@/components/admin/order-status-controls";
import { InternalNotesEditor } from "@/components/admin/internal-notes-editor";

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  await requirePermission("orders.read");
  const order = await getAdminOrderById(params.id);
  if (!order) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">Order {order.order_number}</h1>
        <p className="text-sm text-gray-500">
          {new Date(order.created_at).toLocaleString("en-MW", { timeZone: "Africa/Blantyre" })}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Items</CardTitle>
            </CardHeader>
            <div className="divide-y divide-surface-border">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between py-2 text-sm">
                  <div>
                    <p className="font-medium text-gray-900">{item.product_name_snapshot}</p>
                    <p className="text-xs text-gray-500">
                      {item.sku_snapshot} · {item.quantity} × {formatMoney(item.unit_price)}
                      {item.discount_amount > 0 ? ` (−${formatMoney(item.discount_amount)})` : ""}
                    </p>
                  </div>
                  <p className="font-medium text-gray-900">{formatMoney(item.line_total)}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 space-y-1 border-t border-surface-border pt-3 text-sm">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{formatMoney(order.subtotal)}</span>
              </div>
              {order.discount_total > 0 ? (
                <div className="flex justify-between text-gray-600">
                  <span>Discount</span>
                  <span>-{formatMoney(order.discount_total)}</span>
                </div>
              ) : null}
              <div className="flex justify-between text-base font-semibold text-gray-900">
                <span>Total</span>
                <span>{formatMoney(order.total)}</span>
              </div>
            </div>
          </Card>

          {order.fulfillment_type === "delivery" && order.delivery_snapshot ? (
            <Card>
              <CardHeader>
                <CardTitle>Delivery address (recorded at order time)</CardTitle>
              </CardHeader>
              <div className="text-sm text-gray-700">
                {order.delivery_snapshot.full_name ? <p>{order.delivery_snapshot.full_name}</p> : null}
                {order.delivery_snapshot.line1 ? <p>{order.delivery_snapshot.line1}</p> : null}
                {order.delivery_snapshot.line2 ? <p>{order.delivery_snapshot.line2}</p> : null}
                <p>{[order.delivery_snapshot.city, order.delivery_snapshot.district].filter(Boolean).join(", ")}</p>
                {order.delivery_snapshot.phone ? <p>{order.delivery_snapshot.phone}</p> : null}
              </div>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>Status history</CardTitle>
            </CardHeader>
            {order.statusHistory.length === 0 ? (
              <p className="text-sm text-gray-500">No history yet.</p>
            ) : (
              <ol className="space-y-2 border-l border-surface-border pl-4">
                {order.statusHistory.map((event, i) => (
                  <li key={i} className="text-sm text-gray-600">
                    <span className="font-medium capitalize text-gray-900">{event.to_status.replace(/_/g, " ")}</span>
                    {" — "}
                    {new Date(event.created_at).toLocaleString("en-MW", { timeZone: "Africa/Blantyre" })}
                  </li>
                ))}
              </ol>
            )}
          </Card>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status</CardTitle>
            </CardHeader>
            <div className="mb-3 flex gap-2">
              <Badge variant="info">{order.order_status.replace(/_/g, " ")}</Badge>
              <Badge variant="neutral">{order.payment_status}</Badge>
            </div>
            <OrderStatusControls orderId={order.id} currentStatus={order.order_status} currentPaymentStatus={order.payment_status} />
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <p className="text-sm text-gray-900">{order.customer_name ?? order.guest_name ?? "—"}</p>
            {order.customer_phone || order.guest_phone ? (
              <p className="text-sm text-gray-600">{order.customer_phone ?? order.guest_phone}</p>
            ) : null}
            {order.guest_email ? <p className="text-sm text-gray-600">{order.guest_email}</p> : null}
            {!order.customer_id ? <Badge variant="neutral" className="mt-2">Guest order</Badge> : null}
            <p className="mt-2 text-xs text-gray-500 capitalize">
              {order.fulfillment_type} · {order.payment_method.replace(/_/g, " ")}
            </p>
          </Card>

          {order.notes ? (
            <Card>
              <CardHeader>
                <CardTitle>Customer notes</CardTitle>
              </CardHeader>
              <p className="whitespace-pre-line text-sm text-gray-700">{order.notes}</p>
            </Card>
          ) : null}

          <Card>
            <CardHeader>
              <CardTitle>Internal notes (staff only)</CardTitle>
            </CardHeader>
            <InternalNotesEditor orderId={order.id} initialNotes={order.internal_notes ?? ""} />
          </Card>
        </div>
      </div>
    </div>
  );
}
