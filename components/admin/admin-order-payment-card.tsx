import { Badge } from "@/components/ui/badge";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { formatMoney } from "@/lib/format/money";
import { getManualPaymentProviderFromNotes } from "@/lib/payments/manual-payment";

const PAYMENT_VARIANT: Record<string, "neutral" | "success" | "warning" | "danger" | "info"> = {
  unpaid: "warning",
  partial: "info",
  paid: "success",
  refunded: "neutral",
};

export function AdminOrderPaymentCard({
  paymentMethod,
  paymentStatus,
  total,
  notes,
}: {
  paymentMethod: string;
  paymentStatus: string;
  total: number;
  notes: string | null;
}) {
  const provider = getManualPaymentProviderFromNotes(paymentMethod, notes);
  const reference = notes?.match(/^Payment transaction reference supplied by customer:\s*(.+)$/im)?.[1]?.trim();

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <CardTitle>Payment</CardTitle>
          <Badge variant={PAYMENT_VARIANT[paymentStatus] ?? "neutral"}>{paymentStatus.replace(/_/g, " ")}</Badge>
        </div>
        <p className="text-xs leading-5 text-slate-500">Payment details recorded at checkout. Verify funds with the provider before changing the payment status.</p>
      </CardHeader>
      <dl className="grid gap-3 text-sm sm:grid-cols-2 lg:grid-cols-1">
        <div className="rounded-xl bg-slate-50 p-3">
          <dt className="text-xs font-medium text-slate-500">Payment method</dt>
          <dd className="mt-1 font-semibold capitalize text-slate-900">{paymentMethod.replace(/_/g, " ")}</dd>
        </div>
        {provider ? (
          <div className="rounded-xl bg-slate-50 p-3">
            <dt className="text-xs font-medium text-slate-500">Selected provider</dt>
            <dd className="mt-1 font-semibold text-slate-900">{provider.name}</dd>
            <dd className="mt-1 text-xs text-slate-500">Account holder: {provider.accountHolder}</dd>
          </div>
        ) : null}
        <div className="rounded-xl bg-slate-50 p-3">
          <dt className="text-xs font-medium text-slate-500">Order total</dt>
          <dd className="mt-1 text-lg font-extrabold tabular-nums text-slate-950">{formatMoney(total)}</dd>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <dt className="text-xs font-medium text-slate-500">Customer transaction reference</dt>
          <dd className="mt-1 break-all font-semibold text-slate-900">{reference || "No reference supplied"}</dd>
        </div>
      </dl>
      {paymentStatus === "paid" ? (
        <p className="mt-3 rounded-lg border border-emerald-200 bg-emerald-50 px-3 py-2 text-xs leading-5 text-emerald-800">Payment is recorded as received. Retain the bank or mobile-money transaction record for reconciliation.</p>
      ) : paymentStatus === "refunded" ? (
        <p className="mt-3 rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-xs leading-5 text-slate-600">Payment is recorded as refunded.</p>
      ) : (
        <p className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs leading-5 text-amber-900">Do not mark as paid from a customer-supplied reference alone. Confirm the funds have reached the business account.</p>
      )}
    </Card>
  );
}
