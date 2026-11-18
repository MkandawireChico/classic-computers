import { notFound } from "next/navigation";
import Image from "next/image";
import { getMyOrderById } from "@/lib/data/orders";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/format/money";
import { getMyReviewStatuses } from "@/lib/data/customer-reviews";
import { CustomerReviewAction } from "@/components/storefront/customer-review-action";

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const order = await getMyOrderById(params.id);
  if (!order) notFound();
  const reviewStatuses = await getMyReviewStatuses({ orderIds: [order.id] });

  return (
    <div className="space-y-6">
      <header className="border-b border-slate-200 pb-5">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-800">Order details</p>
      <h1 className="mt-1 break-all text-2xl font-extrabold text-slate-950 sm:text-3xl">{order.order_number}</h1>
      <p className="mt-2 text-sm text-slate-600">
        {new Date(order.created_at).toLocaleString("en-MW", { timeZone: "Africa/Blantyre" })}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Badge variant="info">{order.order_status.replace(/_/g, " ")}</Badge>
        <Badge variant={order.payment_status === "paid" ? "success" : "warning"}>{order.payment_status.replace(/_/g, " ")}</Badge>
        <Badge variant="neutral">{order.fulfillment_type === "pickup" ? "Pickup" : "Delivery"}</Badge>
      </div>
      </header>

      {order.fulfillment_type === "delivery" && order.delivery_snapshot ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="mb-2 text-sm font-bold text-slate-950">Delivery address</h2>
          {order.delivery_snapshot.full_name ? <p>{order.delivery_snapshot.full_name}</p> : null}
          {order.delivery_snapshot.line1 ? <p>{order.delivery_snapshot.line1}</p> : null}
          {order.delivery_snapshot.line2 ? <p>{order.delivery_snapshot.line2}</p> : null}
          <p>{[order.delivery_snapshot.city, order.delivery_snapshot.district].filter(Boolean).join(", ")}</p>
          {order.delivery_snapshot.phone ? <p>{order.delivery_snapshot.phone}</p> : null}
          <p className="mt-3 text-xs leading-5 text-slate-500">
            This is the address recorded when the order was placed and won&apos;t change if your
            saved address changes later.
          </p>
        </section>
      ) : order.fulfillment_type === "delivery" ? (
        <p className="mt-4 text-xs text-gray-500">
          This order predates delivery-address history tracking, so no address snapshot is
          available for it.
        </p>
      ) : null}

      <section aria-label="Items in this order" className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white shadow-sm">
        {order.items.map((item) => (
          <div key={item.id} className="flex flex-col gap-4 p-4 text-sm sm:flex-row sm:items-start sm:justify-between sm:p-5">
            <div className="flex min-w-0 gap-3">
              {item.image_url ? (
                <Image src={item.image_url} alt="" width={72} height={72} className="h-[72px] w-[72px] shrink-0 rounded-lg border border-slate-200 object-contain" />
              ) : null}
              <div className="min-w-0">
                <p className="font-semibold text-slate-950">{item.product_name_snapshot}</p>
                <p className="mt-1 text-slate-600">
                  {item.quantity} × {formatMoney(item.unit_price)}
                </p>
                <CustomerReviewAction
                  type="product"
                  transactionId={order.id}
                  productId={item.product_id}
                  eligible={order.order_status === "completed"}
                  review={reviewStatuses.products[`${order.id}:${item.product_id}`]}
                  label="product"
                />
              </div>
            </div>
            <p className="shrink-0 font-semibold text-slate-950">{formatMoney(item.line_total)}</p>
          </div>
        ))}
      </section>

      <section aria-label="Order total" className="ml-auto max-w-md space-y-2 rounded-2xl border border-slate-200 bg-white p-5 text-sm shadow-sm sm:p-6">
        <div className="flex justify-between text-slate-600">
          <span>Subtotal</span>
          <span>{formatMoney(order.subtotal)}</span>
        </div>
        {order.discount_total > 0 ? (
          <div className="flex justify-between text-slate-600">
            <span>Discount</span>
            <span>-{formatMoney(order.discount_total)}</span>
          </div>
        ) : null}
        <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-bold text-slate-950">
          <span>Total</span>
          <span>{formatMoney(order.total)}</span>
        </div>
      </section>

      {order.statusHistory.length > 0 ? (
        <div className="mt-8">
          <h2 className="mb-3 text-base font-bold text-slate-950">Status history</h2>
          <ol className="space-y-3 border-l border-slate-200 pl-4">
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
