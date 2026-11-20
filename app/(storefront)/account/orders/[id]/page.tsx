import { notFound } from "next/navigation";
import { AccountPageHeader } from "@/components/storefront/account-page-header";
import Image from "next/image";
import { getMyOrderById } from "@/lib/data/orders";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/format/money";
import { getMyReviewStatuses } from "@/lib/data/customer-reviews";
import { CustomerReviewAction } from "@/components/storefront/customer-review-action";
import { getManualPaymentProviderFromNotes } from "@/lib/payments/manual-payment";
import { CopyPaymentValue } from "@/components/storefront/copy-payment-value";

export default async function OrderDetailPage({ params }: { params: { id: string } }) {
  const order = await getMyOrderById(params.id);
  if (!order) notFound();
  const reviewStatuses = await getMyReviewStatuses({ orderIds: [order.id] });
  const paymentProvider = getManualPaymentProviderFromNotes(order.payment_method, order.notes);
  const totalPaid = order.paymentTransactions.reduce((sum, transaction) => sum + (transaction.transaction_type === "payment" ? Number(transaction.amount) : 0), 0);
  const totalRefunded = order.paymentTransactions.reduce((sum, transaction) => sum + (transaction.transaction_type === "refund" ? Number(transaction.amount) : 0), 0);
  const totalReceived = totalPaid - totalRefunded;
  const outstandingBalance = totalRefunded > 0 ? 0 : Math.max(order.total - totalReceived, 0);
  const hasVerifiedTransactions = order.paymentTransactions.length > 0;
  const shouldShowPaymentInstructions = Boolean(paymentProvider)
    && (order.payment_status === "unpaid" || (order.payment_status === "partial" && hasVerifiedTransactions && totalRefunded === 0 && outstandingBalance > 0));
  const amountToSend = order.payment_status === "partial" ? outstandingBalance : order.total;
  const isBankProvider = paymentProvider && "accountNumber" in paymentProvider;
  const walletNumber = paymentProvider && "walletNumber" in paymentProvider ? paymentProvider.walletNumber : null;
  const paymentCopyDetails = paymentProvider
    ? [
        paymentProvider.name,
        `Account holder: ${paymentProvider.accountHolder}`,
        isBankProvider ? `Account number: ${paymentProvider.accountNumber}` : `Wallet number: ${walletNumber}`,
        ...(isBankProvider ? [`Branch: ${paymentProvider.branch}`] : []),
        `Order: ${order.order_number}`,
        `Amount to send: ${formatMoney(amountToSend)}`,
      ].join("\n")
    : null;

  return (
    <div className="space-y-6">
      <AccountPageHeader
        eyebrow="Purchases · Order details"
        title={order.order_number}
        description={`Placed ${new Date(order.created_at).toLocaleString("en-MW", { timeZone: "Africa/Blantyre" })}. Follow payment and fulfilment progress for this purchase.`}
      />
      <div className="flex flex-wrap gap-2">
        <Badge variant="info">{order.order_status.replace(/_/g, " ")}</Badge>
        <Badge variant={order.payment_status === "paid" ? "success" : order.payment_status === "refunded" || order.payment_status === "partially_refunded" ? "neutral" : "warning"}>{order.payment_status.replace(/_/g, " ")}</Badge>
        <Badge variant="neutral">{order.fulfillment_type === "pickup" ? "Pickup" : "Delivery"}</Badge>
      </div>

      {paymentProvider && paymentCopyDetails && shouldShowPaymentInstructions ? (
        <section className="rounded-2xl border border-cyan-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="order-payment-heading">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-cyan-800">Payment still required</p>
          <h2 id="order-payment-heading" className="mt-1 text-lg font-bold text-slate-950">
            Pay using {paymentProvider.name}
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Send the outstanding amount below. Include your order number as the payment reference where possible. Your order status updates after our team verifies the transaction.
          </p>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <PaymentDetail label="Account holder" value={paymentProvider.accountHolder} />
            {isBankProvider ? (
              <>
                <PaymentDetail label="Account number" value={paymentProvider.accountNumber} />
                <PaymentDetail label="Branch" value={paymentProvider.branch} />
              </>
            ) : null}
            {walletNumber ? <PaymentDetail label="Wallet number" value={walletNumber} /> : null}
            <PaymentDetail label="Order number" value={order.order_number} />
            <PaymentDetail label="Amount to send" value={formatMoney(amountToSend)} />
          </dl>
          <div className="mt-4 flex flex-wrap gap-2">
            {isBankProvider ? <CopyPaymentValue value={paymentProvider.accountNumber} label="account number" /> : null}
            {walletNumber ? <CopyPaymentValue value={walletNumber} label="wallet number" /> : null}
            <CopyPaymentValue value={paymentCopyDetails} label="payment details" />
          </div>
        </section>
      ) : null}

      {order.payment_status === "partial" && !hasVerifiedTransactions ? (
        <section className="rounded-2xl border border-amber-200 bg-amber-50 p-5 sm:p-6" aria-live="polite">
          <p className="text-sm font-bold text-amber-950">Partial payment recorded</p>
          <p className="mt-1 text-sm leading-6 text-amber-900">
            Our payment records do not yet show a verified remaining balance. Contact our team before sending another payment so we confirm the exact amount due.
          </p>
        </section>
      ) : null}
      {!hasVerifiedTransactions && ["paid", "partial"].includes(order.payment_status) ? (
        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
          <p className="text-sm font-bold text-slate-900">Payment record</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            The payment status is available, but detailed transaction history is not available for this order. Contact our team if you need payment or refund confirmation.
          </p>
        </section>
      ) : null}

      {order.payment_status === "partially_refunded" ? (
        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
          <p className="text-sm font-bold text-slate-900">Partial refund recorded</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">
            We have recorded a refund of {formatMoney(totalRefunded)}. No further payment is due for this order. Contact our team if you need the transaction details.
          </p>
        </section>
      ) : null}
      {order.payment_status === "refunded" ? (
        <section className="rounded-2xl border border-slate-200 bg-slate-50 p-5 sm:p-6">
          <p className="text-sm font-bold text-slate-900">Payment marked as refunded</p>
          <p className="mt-1 text-sm leading-6 text-slate-600">Contact our team if you need the refund transaction details.</p>
        </section>
      ) : null}

      {hasVerifiedTransactions ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="verified-payments-heading">
          <h2 id="verified-payments-heading" className="text-sm font-bold text-slate-950">Verified payments and refunds</h2>
          <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <PaymentDetail label="Net amount retained" value={formatMoney(totalReceived)} />
            <PaymentDetail label="Total refunded" value={formatMoney(totalRefunded)} />
            <PaymentDetail label="Order total" value={formatMoney(order.total)} />
            <PaymentDetail label="Outstanding balance" value={formatMoney(outstandingBalance)} />
          </div>
          <ol className="mt-4 space-y-3">
            {order.paymentTransactions.map((transaction) => (
              <li key={transaction.id} className="flex flex-wrap items-start justify-between gap-3 border-t border-slate-100 pt-3 text-sm">
                <div>
                  <p className="font-semibold capitalize text-slate-900">{transaction.transaction_type} · {transaction.provider}</p>
                  {transaction.provider_reference ? <p className="mt-1 text-xs text-slate-500">Reference: {transaction.provider_reference}</p> : null}
                  <p className="mt-1 text-xs text-slate-500">{new Date(transaction.created_at).toLocaleString("en-MW", { timeZone: "Africa/Blantyre" })}</p>
                </div>
                <p className={transaction.transaction_type === "refund" ? "font-semibold text-rose-700" : "font-semibold text-emerald-700"}>
                  {transaction.transaction_type === "refund" ? "−" : "+"}{formatMoney(Number(transaction.amount))}
                </p>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {order.paymentHistory.length > 0 ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="payment-history-heading">
          <h2 id="payment-history-heading" className="text-sm font-bold text-slate-950">Payment updates</h2>
          <ol className="mt-4 space-y-3 border-l border-slate-200 pl-4">
            {order.paymentHistory.map((event, index) => (
              <li key={index} className="text-sm text-slate-600">
                <p className="font-semibold capitalize text-slate-900">
                  {event.from_status ? event.from_status.replace(/_/g, " ") + " → " : ""}
                  {event.to_status.replace(/_/g, " ")}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  {new Date(event.created_at).toLocaleString("en-MW", { timeZone: "Africa/Blantyre" })}
                </p>
              </li>
            ))}
          </ol>
          <p className="mt-3 text-xs leading-5 text-slate-500">
            These updates show payment status changes. Contact our team for individual transaction or refund details.
          </p>
        </section>
      ) : null}

      {order.fulfillment_type === "delivery" && order.delivery_snapshot ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-[0_4px_18px_rgba(15,23,42,0.045)] sm:p-6">
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

      <section aria-label="Items in this order" className="divide-y divide-slate-200 rounded-2xl border border-slate-200 bg-white shadow-[0_4px_18px_rgba(15,23,42,0.045)]">
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

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="order-updates-heading">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <p className="text-[10px] font-extrabold uppercase tracking-[0.16em] text-brand-700">Order fulfilment</p>
            <h2 id="order-updates-heading" className="mt-1 text-base font-bold text-slate-950">Order updates</h2>
          </div>
          <Badge variant="info">{order.order_status.replace(/_/g, " ")}</Badge>
        </div>
        {order.statusHistory.length > 0 ? (
          <ol className="mt-5 space-y-4 border-l border-slate-200 pl-4">
            {order.statusHistory.map((event, index) => (
              <li key={index} className="relative text-sm">
                <span className="absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full border-2 border-white bg-brand-600 ring-1 ring-brand-200" />
                <p className="font-semibold capitalize text-slate-950">{event.to_status.replace(/_/g, " ")}</p>
                {event.from_status ? (
                  <p className="mt-0.5 text-xs text-slate-500">Moved from {event.from_status.replace(/_/g, " ")}</p>
                ) : null}
                <p className="mt-1 text-xs text-slate-500">
                  {new Date(event.created_at).toLocaleString("en-MW", { timeZone: "Africa/Blantyre" })}
                </p>
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-4 text-sm leading-6 text-slate-600">Your order has been received. Updates will appear here as our team processes the purchase.</p>
        )}
      </section>
    </div>
  );
}


function PaymentDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-lg bg-slate-50 p-3">
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 break-words font-bold text-slate-900">{value}</dd>
    </div>
  );
}
