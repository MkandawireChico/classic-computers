"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { recordPaymentTransactionAction } from "@/app/admin/orders/actions";

export function PaymentTransactionForm({
  orderId,
  currency,
  paymentMethod,
  outstanding,
  refundable,
}: {
  orderId: string;
  currency: string;
  paymentMethod: string;
  outstanding: number;
  refundable: number;
}) {
  const router = useRouter();
  const [transactionType, setTransactionType] = useState<"payment" | "refund">("payment");
  const [provider, setProvider] = useState(paymentMethod.replace(/_/g, " "));
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const limit = transactionType === "payment" ? outstanding : refundable;

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (pending) return;

    const numericAmount = Number(amount);
    if (!Number.isFinite(numericAmount) || numericAmount <= 0 || numericAmount > limit) {
      setError(transactionType === "payment"
        ? "Enter an amount within the outstanding balance."
        : "Enter an amount within the verified refundable balance.");
      return;
    }

    const actionLabel = transactionType === "payment" ? "payment received" : "refund processed";
    const confirmed = window.confirm(
      `Confirm this ${actionLabel}: ${numericAmount.toLocaleString()} ${currency} through ${provider}? Only continue after checking the provider account.`,
    );
    if (!confirmed) return;

    setPending(true);
    setError(null);
    try {
      const result = await recordPaymentTransactionAction({
        orderId,
        transactionType,
        provider,
        amount: numericAmount,
        currency,
        providerReference: reference,
      });
      if (!result.success) {
        setError(result.error);
        return;
      }
      setAmount("");
      setReference("");
      router.refresh();
    } catch {
      setError("We could not record this transaction. Please try again.");
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <div>
        <h3 className="text-sm font-bold text-slate-950">Record verified transaction</h3>
        <p className="mt-1 text-xs leading-5 text-slate-600">
          Record funds only after confirming the transaction in the bank or mobile-money account.
        </p>
      </div>

      {error ? <Alert variant="danger">{error}</Alert> : null}

      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block text-xs font-semibold text-slate-700">
          Transaction type
          <select
            value={transactionType}
            onChange={(event) => setTransactionType(event.target.value as "payment" | "refund")}
            className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium"
          >
            <option value="payment">Payment received</option>
            <option value="refund">Refund processed</option>
          </select>
        </label>
        <label className="block text-xs font-semibold text-slate-700">
          Provider
          <input
            required
            maxLength={80}
            value={provider}
            onChange={(event) => setProvider(event.target.value)}
            placeholder="e.g. Standard Bank, TNM Mpamba"
            className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium"
          />
        </label>
        <label className="block text-xs font-semibold text-slate-700">
          Amount ({currency})
          <input
            required
            type="number"
            min="0.01"
            max={limit}
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium"
          />
          <span className="mt-1 block font-normal text-slate-500">
            Maximum: {limit.toLocaleString()} {currency}
          </span>
        </label>
        <label className="block text-xs font-semibold text-slate-700">
          Provider transaction reference
          <input
            maxLength={120}
            value={reference}
            onChange={(event) => setReference(event.target.value)}
            placeholder="Optional"
            className="mt-1 h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm font-medium"
          />
        </label>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-slate-500">
          {transactionType === "payment"
            ? "The order balance updates after the payment is recorded."
            : "Refunds reduce the verified amount received."}
        </p>
        <Button type="submit" size="sm" isLoading={pending} disabled={limit <= 0 || !provider.trim()}>
          {transactionType === "payment" ? "Record payment" : "Record refund"}
        </Button>
      </div>
    </form>
  );
}
