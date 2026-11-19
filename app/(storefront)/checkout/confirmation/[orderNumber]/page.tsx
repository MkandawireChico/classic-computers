import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getOrderConfirmation } from "@/lib/data/order-confirmation";
import { formatMoney } from "@/lib/format/money";
import { getManualPaymentProviderFromNotes } from "@/lib/payments/manual-payment";
import { CopyPaymentValue } from "@/components/storefront/copy-payment-value";

export const metadata: Metadata = { title: "Order Confirmed", robots: { index: false } };

export default async function OrderConfirmationPage({ params }: { params: { orderNumber: string } }) {
  const order = await getOrderConfirmation(params.orderNumber);
  if (!order) notFound();

  const paymentProvider = getManualPaymentProviderFromNotes(order.payment_method, order.notes);
  const isBankProvider = paymentProvider && "accountNumber" in paymentProvider;
  const accountNumber = isBankProvider ? paymentProvider.accountNumber : null;
  const walletNumber = paymentProvider && "walletNumber" in paymentProvider ? paymentProvider.walletNumber : null;
  const copyDetails = paymentProvider
    ? [
        paymentProvider.name,
        `Account holder: ${paymentProvider.accountHolder}`,
        isBankProvider ? `Account number: ${paymentProvider.accountNumber}` : `Wallet number: ${walletNumber}`,
        ...(isBankProvider ? [`Branch: ${paymentProvider.branch}`] : []),
        `Order: ${order.order_number}`,
        `Total: ${formatMoney(order.total)}`,
      ].join("\n")
    : null;

  return (
    <main className="min-h-screen bg-[#f5f7fa]">
      <div className="section-shell max-w-5xl py-8 sm:py-12">
        <header className="rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm sm:p-8">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-700">Order received</p>
          <div className="mt-3 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-3xl font-semibold tracking-tight text-[#102033] sm:text-4xl">Thank you for your order.</h1>
              <p className="mt-2 text-sm leading-6 text-slate-600">
                Your order has been recorded. Keep the order number below for reference.
              </p>
            </div>
            <div className="shrink-0 rounded-2xl bg-emerald-50 px-5 py-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-emerald-800">Order number</p>
              <p className="mt-1 text-lg font-extrabold tracking-wide text-emerald-950">{order.order_number}</p>
            </div>
          </div>
          <div className="mt-6 grid gap-3 border-t border-slate-100 pt-5 sm:grid-cols-3">
            <ConfirmationMeta label="Placed" value={new Date(order.created_at).toLocaleString("en-MW", { timeZone: "Africa/Blantyre" })} />
            <ConfirmationMeta label="Order status" value={order.order_status.replace(/_/g, " ")} />
            <ConfirmationMeta label="Fulfilment" value={order.fulfillment_type === "pickup" ? "Pickup in-store" : "Delivery"} />
          </div>
        </header>

        {paymentProvider && copyDetails ? (
          <section className="mt-6 rounded-2xl border border-cyan-200 bg-white p-5 shadow-sm sm:p-6" aria-labelledby="payment-instructions-heading">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.16em] text-cyan-800">Action required</p>
                <h2 id="payment-instructions-heading" className="mt-1 text-xl font-bold text-[#102033]">
                  Complete payment with {paymentProvider.name}
                </h2>
              </div>
              <span className="w-fit rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800">Awaiting verification</span>
            </div>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600">
              Transfer the exact order total using your bank&apos;s or mobile provider&apos;s normal process. Include the order number as the payment reference where possible. Your order remains unpaid until Classic Computers verifies the transfer.
            </p>
            <dl className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <ConfirmationPaymentDetail label="Account holder" value={paymentProvider.accountHolder} />
              {isBankProvider ? (
                <>
                  <ConfirmationPaymentDetail label="Account number" value={paymentProvider.accountNumber} />
                  <ConfirmationPaymentDetail label="Branch" value={paymentProvider.branch} />
                </>
              ) : null}
              {walletNumber ? <ConfirmationPaymentDetail label="Wallet number" value={walletNumber} /> : null}
              <ConfirmationPaymentDetail label="Order number" value={order.order_number} />
              <ConfirmationPaymentDetail label="Amount to send" value={formatMoney(order.total)} />
            </dl>
            <div className="mt-4 flex flex-wrap gap-2">
              {accountNumber ? <CopyPaymentValue value={accountNumber} label="account number" /> : null}
              {walletNumber ? <CopyPaymentValue value={walletNumber} label="wallet number" /> : null}
              <CopyPaymentValue value={copyDetails} label="payment details" />
            </div>
          </section>
        ) : null}

        {order.fulfillment_type === "delivery" && order.delivery_snapshot ? (
          <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm" aria-labelledby="delivery-heading">
            <h2 id="delivery-heading" className="text-base font-bold text-[#102033]">Delivery address</h2>
            <div className="mt-3 text-sm leading-6 text-slate-600">
              {order.delivery_snapshot.full_name ? <p>{order.delivery_snapshot.full_name}</p> : null}
              {order.delivery_snapshot.line1 ? <p>{order.delivery_snapshot.line1}</p> : null}
              {order.delivery_snapshot.line2 ? <p>{order.delivery_snapshot.line2}</p> : null}
              <p>{[order.delivery_snapshot.city, order.delivery_snapshot.district].filter(Boolean).join(", ")}</p>
              {order.delivery_snapshot.phone ? <p>{order.delivery_snapshot.phone}</p> : null}
            </div>
          </section>
        ) : null}

        <section className="mt-6 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" aria-labelledby="items-heading">
          <div className="border-b border-slate-100 px-5 py-4 sm:px-6">
            <h2 id="items-heading" className="text-lg font-bold text-[#102033]">Items in your order</h2>
            <p className="mt-1 text-xs text-slate-500">{order.items.length} product line{order.items.length === 1 ? "" : "s"}</p>
          </div>
          <div className="divide-y divide-slate-100">
            {order.items.map((item) => (
              <div key={item.id} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 text-sm sm:px-6">
                <div>
                  <p className="font-semibold text-slate-900">{item.product_name_snapshot}</p>
                  <p className="mt-1 text-xs text-slate-500">{item.quantity} × {formatMoney(item.unit_price)}</p>
                </div>
                <p className="font-bold tabular-nums text-[#102033]">{formatMoney(item.line_total)}</p>
              </div>
            ))}
          </div>
          <div className="space-y-3 border-t border-slate-100 bg-slate-50/70 px-5 py-5 text-sm sm:px-6">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span><span className="tabular-nums">{formatMoney(order.subtotal)}</span>
            </div>
            {order.discount_total > 0 ? (
              <div className="flex justify-between text-emerald-700">
                <span>Discount</span><span className="tabular-nums">−{formatMoney(order.discount_total)}</span>
              </div>
            ) : null}
            <div className="flex justify-between border-t border-slate-200 pt-3 text-base font-extrabold text-[#102033]">
              <span>Order total</span><span className="tabular-nums">{formatMoney(order.total)}</span>
            </div>
          </div>
        </section>

        <section className="mt-6 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <h2 className="text-base font-bold text-[#102033]">What happens next?</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            Our team will contact you using the details supplied at checkout to coordinate your order.
            {paymentProvider ? " For bank or mobile-money transfers, we will update payment status after verifying the transaction." : ""}
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row">
            {!order.guest_name ? (
              <Link href="/account/orders" className="inline-flex min-h-11 items-center justify-center rounded-xl bg-[#123653] px-5 text-sm font-bold text-white transition hover:bg-cyan-800">
                View your orders
              </Link>
            ) : (
              <p className="text-xs leading-5 text-slate-500">Keep this page and your order number for your records.</p>
            )}
            <Link href="/shop" className="inline-flex min-h-11 items-center justify-center rounded-xl border border-slate-300 px-5 text-sm font-semibold text-slate-700 transition hover:border-cyan-700 hover:text-cyan-800">
              Continue shopping
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}

function ConfirmationMeta({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 text-sm font-semibold capitalize text-slate-900">{value}</dd>
    </div>
  );
}

function ConfirmationPaymentDetail({ label, value }: { label: string; value: string }) {
  return (
    <div className="min-w-0 rounded-xl border border-slate-200 bg-slate-50 p-3">
      <dt className="text-xs font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 break-words text-sm font-bold text-slate-900">{value}</dd>
    </div>
  );
}
