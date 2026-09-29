import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrderConfirmation } from "@/lib/data/order-confirmation";
import { formatMoney } from "@/lib/format/money";

export const metadata: Metadata = { title: "Order Confirmed", robots: { index: false } };

export default async function OrderConfirmationPage({ params }: { params: { orderNumber: string } }) {
  const order = await getOrderConfirmation(params.orderNumber);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-2xl px-4 py-12">
      <div className="rounded-card border border-status-success bg-green-50 p-4 text-sm text-green-900">
        Order placed successfully.
      </div>

      <h1 className="mt-6 text-2xl font-semibold text-gray-900">Order {order.order_number}</h1>
      <p className="mt-1 text-sm text-gray-600">
        Placed {new Date(order.created_at).toLocaleString("en-MW", { timeZone: "Africa/Blantyre" })}
      </p>
      <p className="mt-1 text-sm text-gray-600 capitalize">Status: {order.order_status.replace(/_/g, " ")}</p>
      <p className="text-sm text-gray-600 capitalize">
        {order.fulfillment_type === "pickup" ? "Pickup in-store" : "Delivery"} ·{" "}
        {order.payment_method.replace(/_/g, " ")}
      </p>

      {order.fulfillment_type === "delivery" && order.delivery_snapshot ? (
        <div className="mt-4 rounded-card border border-surface-border bg-surface-muted p-4 text-sm text-gray-700">
          <p className="mb-1 font-medium text-gray-900">Delivering to</p>
          {order.delivery_snapshot.full_name ? <p>{order.delivery_snapshot.full_name}</p> : null}
          {order.delivery_snapshot.line1 ? <p>{order.delivery_snapshot.line1}</p> : null}
          {order.delivery_snapshot.line2 ? <p>{order.delivery_snapshot.line2}</p> : null}
          <p>{[order.delivery_snapshot.city, order.delivery_snapshot.district].filter(Boolean).join(", ")}</p>
          {order.delivery_snapshot.phone ? <p>{order.delivery_snapshot.phone}</p> : null}
        </div>
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

      <div className="mt-8 rounded-card border border-dashed border-surface-border bg-surface-muted p-4 text-sm text-gray-600">
        We&apos;ll be in touch about your order using the contact details you provided. You can
        {order.guest_name ? " keep this page for your records" : " check your order status any time"}{" "}
        {!order.guest_name ? (
          <>
            in{" "}
            <Link href="/account/orders" className="text-brand-600 hover:underline">
              your order history
            </Link>
            .
          </>
        ) : (
          "."
        )}
      </div>
    </div>
  );
}
