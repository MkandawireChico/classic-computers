import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/permissions";
import { getAdminOrderById } from "@/lib/data/admin/orders";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/format/money";
import { OrderStatusControls } from "@/components/admin/order-status-controls";
import { InternalNotesEditor } from "@/components/admin/internal-notes-editor";
import { AdminDetailHeader } from "@/components/admin/admin-detail-header";
import { AdminOrderPaymentCard } from "@/components/admin/admin-order-payment-card";
import { PaymentTransactionForm } from "@/components/admin/payment-transaction-form";

export default async function AdminOrderDetailPage({ params }: { params: { id: string } }) {
  await requirePermission("orders.read");
  const order = await getAdminOrderById(params.id);
  if (!order) notFound();

  const totalPaid = order.paymentTransactions.reduce((sum, transaction) => sum + (transaction.transaction_type === "payment" ? Number(transaction.amount) : 0), 0);
  const totalRefunded = order.paymentTransactions.reduce((sum, transaction) => sum + (transaction.transaction_type === "refund" ? Number(transaction.amount) : 0), 0);
  const totalReceived = totalPaid - totalRefunded;
  const outstandingBalance = totalRefunded > 0 ? 0 : Math.max(order.total - totalReceived, 0);
  const refundableBalance = Math.max(totalReceived, 0);
  const needsLegacyReconciliation = order.paymentTransactions.length === 0 && order.payment_status !== "unpaid";

  return (
    <div className="space-y-6">
      <AdminDetailHeader
        eyebrow="Commerce · Order desk"
        title={`Order ${order.order_number}`}
        description={`Placed ${new Date(order.created_at).toLocaleString("en-MW", { timeZone: "Africa/Blantyre" })}. Review items, customer details, payment and fulfilment.`}
        backHref="/admin/orders"
        backLabel="Back to orders"
      />

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
          <AdminOrderPaymentCard
            paymentMethod={order.payment_method}
            paymentStatus={order.payment_status}
            total={order.total}
            notes={order.notes}
            hasVerifiedTransactions={order.paymentTransactions.length > 0}
          />
          {needsLegacyReconciliation ? (
            <Card>
              <CardHeader><CardTitle>Historical payment record needs reconciliation</CardTitle></CardHeader>
              <p className="text-sm leading-6 text-amber-800">
                This order has a historical “{order.payment_status}” status but no verified transaction entries. Confirm the original payment in the provider account, then record the verified amount below. Do not issue a refund until the payment has been reconciled.
              </p>
            </Card>
          ) : null}
          <Card>
            <CardHeader>
              <CardTitle>Payment balance</CardTitle>
            </CardHeader>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between text-slate-600"><span>Verified net received</span><strong className="text-slate-900">{formatMoney(totalReceived)}</strong></div>
              <div className="flex justify-between text-slate-600"><span>Outstanding</span><strong className="text-slate-900">{formatMoney(outstandingBalance)}</strong></div>
              <div className="flex justify-between text-slate-600"><span>Total refunded</span><strong className="text-slate-900">{formatMoney(totalRefunded)}</strong></div>
              <div className="flex justify-between text-slate-600"><span>Available to refund</span><strong className="text-slate-900">{formatMoney(refundableBalance)}</strong></div>
            </div>
          </Card>
          <PaymentTransactionForm
            orderId={order.id}
            currency={order.currency}
            paymentMethod={order.payment_method}
            outstanding={outstandingBalance}
            refundable={refundableBalance}
          />
          <Card>
            <CardHeader><CardTitle>Verified transactions</CardTitle></CardHeader>
            {order.paymentTransactions.length === 0 ? (
              <p className="text-sm text-gray-500">No verified payment or refund transactions recorded.</p>
            ) : (
              <ol className="space-y-3">
                {order.paymentTransactions.map((transaction) => (
                  <li key={transaction.id} className="rounded-lg border border-slate-200 p-3 text-sm">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span className="font-semibold capitalize text-slate-900">{transaction.transaction_type} · {transaction.provider}</span>
                      <strong className={transaction.transaction_type === "refund" ? "text-rose-700" : "text-emerald-700"}>{transaction.transaction_type === "refund" ? "−" : "+"}{formatMoney(Number(transaction.amount))}</strong>
                    </div>
                    {transaction.provider_reference ? <p className="mt-1 text-xs text-slate-500">Reference: {transaction.provider_reference}</p> : null}
                    <p className="mt-1 text-xs text-slate-500">{new Date(transaction.created_at).toLocaleString("en-MW", { timeZone: "Africa/Blantyre" })}</p>
                  </li>
                ))}
              </ol>
            )}
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Payment status history</CardTitle>
            </CardHeader>
            {order.paymentHistory.length === 0 ? (
              <p className="text-sm text-gray-500">No payment status changes recorded.</p>
            ) : (
              <ol className="space-y-3 border-l border-surface-border pl-4">
                {order.paymentHistory.map((event, index) => (
                  <li key={index} className="text-sm text-gray-600">
                    <p className="font-semibold capitalize text-gray-900">
                      {event.from_status ? event.from_status.replace(/_/g, " ") + " → " : ""}
                      {event.to_status.replace(/_/g, " ")}
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      {new Date(event.created_at).toLocaleString("en-MW", { timeZone: "Africa/Blantyre" })}
                    </p>
                  </li>
                ))}
              </ol>
            )}
            <p className="mt-3 text-xs leading-5 text-slate-500">
              This history records payment-status changes. Verified payment amounts, provider references and refunds appear in the transaction ledger above.
            </p>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Order progress</CardTitle>
            </CardHeader>
            <div className="mb-3 flex gap-2">
              <Badge variant="info">{order.order_status.replace(/_/g, " ")}</Badge>
            </div>
            <OrderStatusControls
              orderId={order.id}
              currentStatus={order.order_status}
              fulfillmentType={order.fulfillment_type}
            />
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Customer</CardTitle>
            </CardHeader>
            <div className="space-y-2 text-sm">
              <div>
                <p className="font-semibold text-slate-950">{order.customer_name ?? order.guest_name ?? "Customer details unavailable"}</p>
                <p className="text-xs text-slate-500">{order.customer_id ? "Registered customer" : "Guest checkout"}</p>
              </div>
              {order.customer_phone || order.guest_phone ? (
                <a href={`tel:${order.customer_phone ?? order.guest_phone}`} className="inline-flex min-h-9 items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 font-semibold text-slate-700 hover:border-brand-300 hover:text-brand-800">
                  <span aria-hidden="true">☎</span>{order.customer_phone ?? order.guest_phone}
                </a>
              ) : <p className="text-xs text-slate-500">No phone number supplied.</p>}
              {order.guest_email ? (
                <a href={`mailto:${order.guest_email}`} className="block break-all text-sm font-medium text-brand-700 hover:text-brand-900">{order.guest_email}</a>
              ) : null}
              {!order.customer_id ? <Badge variant="neutral">Guest order</Badge> : null}
              <div className="border-t border-slate-100 pt-3 text-xs text-slate-500">
                <p className="capitalize">{order.fulfillment_type} · {order.payment_method.replace(/_/g, " ")}</p>
                {order.delivery_snapshot?.phone && order.delivery_snapshot.phone !== (order.customer_phone ?? order.guest_phone) ? (
                  <p className="mt-1">Delivery contact: {order.delivery_snapshot.phone}</p>
                ) : null}
              </div>
            </div>
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
