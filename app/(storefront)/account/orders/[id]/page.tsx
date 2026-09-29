import { notFound } from "next/navigation";
import { getMyOrderById } from "@/lib/data/orders";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/format/money";

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const order = await getMyOrderById(params.id);
  if (!order) notFound();

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900">Order {order.order_number}</h1>
      <p className="mt-1 text-sm text-gray-500">
        {new Date(order.created_at).toLocaleString("en-MW", { timeZone: "Africa/Blantyre" })}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant="info">{order.order_status.replace(/_/g, " ")}</Badge>
        <Badge variant="neutral">{order.payment_status}</Badge>
        <Badge variant="neutral">{order.fulfillment_type === "pickup" ? "Pickup" : "Delivery"}</Badge>
      </div>

      {order.fulfillment_type === "delivery" && order.delivery_snapshot ? (
        <div className="mt-4 rounded-card border border-surface-border bg-surface-muted p-4 text-sm text-gray-700">
          <p className="mb-1 font-medium text-gray-900">Delivered to</p>
          {order.delivery_snapshot.full_name ? <p>{order.delivery_snapshot.full_name}</p> : null}
          {order.delivery_snapshot.line1 ? <p>{order.delivery_snapshot.line1}</p> : null}
          {order.delivery_snapshot.line2 ? <p>{order.delivery_snapshot.line2}</p> : null}
          <p>{[order.delivery_snapshot.city, order.delivery_snapshot.district].filter(Boolean).join(", ")}</p>
          {order.delivery_snapshot.phone ? <p>{order.delivery_snapshot.phone}</p> : null}
          <p className="mt-1 text-xs text-gray-500">
            This is the address recorded when the order was placed and won&apos;t change if your
            saved address changes later.
          </p>
        </div>
      ) : order.fulfillment_type === "delivery" ? (
        <p className="mt-4 text-xs text-gray-500">
          This order predates delivery-address history tracking, so no address snapshot is
          available for it.
        </p>
      ) : null}

      <div className="mt-6 divide-y divide-surface-border rounded-card border border-surface-border">
        {order.items.map((item) => (
          <div key={item.id} className="flex items-center justify-between p-4 text-sm">
            <div>
              <p className="font-medium text-gray-900">{item.product_name_snapshot}</p>
              <p className="text-gray-500">
                {item.quantity} × {formatMoney(item.unit_price)}
              </p>
            </div>
            <p className="font-medium text-gray-900">{formatMoney(item.line_total)}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-1 text-sm">
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

      {order.statusHistory.length > 0 ? (
        <div className="mt-8">
          <h2 className="mb-2 text-sm font-semibold text-gray-900">Status history</h2>
          <ol className="space-y-2 border-l border-surface-border pl-4">
            {order.statusHistory.map((event, index) => (
              <li key={index} className="text-sm text-gray-600">
                <span className="font-medium text-gray-900 capitalize">{event.to_status.replace(/_/g, " ")}</span>
                {" — "}
                {new Date(event.created_at).toLocaleString("en-MW", { timeZone: "Africa/Blantyre" })}
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  );
}
