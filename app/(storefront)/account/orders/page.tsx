import { AccountPageHeader } from "@/components/storefront/account-page-header";
import Link from "next/link";
import { getMyOrders } from "@/lib/data/orders";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/format/money";
import { getMyReviewStatuses } from "@/lib/data/customer-reviews";
import { CustomerReviewAction } from "@/components/storefront/customer-review-action";

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
  const reviewStatuses = await getMyReviewStatuses({ orderIds: orders.map((order) => order.id) });

  return (
    <div className="space-y-6">
      <AccountPageHeader eyebrow="Purchases · Order history" title="My orders" description="Review purchases, payment status and order progress." />

      {orders.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-7 text-center shadow-sm sm:p-9">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-slate-300">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          <h3 className="text-lg font-semibold text-slate-900">No orders yet</h3>
          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-600">Your order history will appear here after your first purchase.</p>
          <Link
            href="/shop"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-brand-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="9" cy="21" r="1" />
              <circle cx="20" cy="21" r="1" />
              <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
            </svg>
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => (
            <article
              key={order.id}
              className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-panel sm:p-5"
            >
              <Link href={`/account/orders/${order.id}`} className="group flex items-start justify-between gap-4 rounded-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="break-all text-base font-bold text-slate-950">{order.order_number}</p>
                    <Badge variant={STATUS_VARIANT[order.order_status] ?? "neutral"} className="text-xs">
                      {order.order_status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">
                    {new Date(order.created_at).toLocaleDateString("en-MW", { timeZone: "Africa/Blantyre", year: "numeric", month: "long", day: "numeric" })}
                  </p>
                  <div className="mt-2">
                    <Badge variant={order.payment_status === "paid" ? "success" : order.payment_status === "refunded" || order.payment_status === "partially_refunded" ? "neutral" : "warning"}>
                      Payment {order.payment_status.replace(/_/g, " ")}
                    </Badge>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-base font-bold text-slate-950 sm:text-lg">{formatMoney(order.total)}</p>
                  <p className="mt-1 text-xs font-semibold text-brand-700 transition-colors group-hover:text-brand-900">View details</p>
                </div>
              </Link>
              {order.items.length > 0 ? (
                <ul className="mt-4 divide-y divide-slate-100 border-t border-slate-100">
                  {Array.from(new Map(order.items.map((item) => [item.product_id, item])).values()).map((item) => (
                    <li key={item.product_id} className="py-3">
                      <p className="text-sm font-semibold text-slate-900">{item.product_name_snapshot}</p>
                      <CustomerReviewAction
                        type="product"
                        transactionId={order.id}
                        productId={item.product_id}
                        eligible={order.order_status === "completed"}
                        review={reviewStatuses.products[`${order.id}:${item.product_id}`]}
                        label="product"
                      />
                    </li>
                  ))}
                </ul>
              ) : null}
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
