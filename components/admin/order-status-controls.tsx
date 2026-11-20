"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { updateOrderStatusAction, updatePaymentStatusAction } from "@/app/admin/orders/actions";

const NEXT_STATUS: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["ready_for_pickup", "out_for_delivery", "cancelled"],
  ready_for_pickup: ["completed", "cancelled"],
  out_for_delivery: ["completed", "cancelled"],
  completed: ["refunded"],
  cancelled: [],
  refunded: [],
};

const NEXT_PAYMENT: Record<string, string[]> = {
  unpaid: ["paid", "partial"],
  partial: ["paid", "refunded"],
  paid: ["refunded"],
  refunded: [],
};

export function OrderStatusControls({
  orderId,
  currentStatus,
  currentPaymentStatus,
}: {
  orderId: string;
  currentStatus: string;
  currentPaymentStatus: string;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statusOptions = NEXT_STATUS[currentStatus] ?? [];
  const paymentOptions = NEXT_PAYMENT[currentPaymentStatus] ?? [];

  async function handleStatus(newStatus: string) {
    if (isPending) return;
    setError(null);
    setIsPending(true);
    try {
      const result = await updateOrderStatusAction({ orderId, newStatus });
      if (!result.success) setError(result.error);
      else router.refresh();
    } catch {
      setError("We could not update the order status. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  async function handlePayment(newPaymentStatus: string) {
    if (isPending) return;
    const confirmation = newPaymentStatus === "paid"
      ? "Confirm you have checked the bank or mobile-money transaction and matched the amount and order reference. Only continue after funds are received."
      : newPaymentStatus === "refunded"
        ? "Confirm the refund has been processed and verified."
        : "Record this order as partially paid? Confirm the received amount with your payment records first.";
    if (!window.confirm(confirmation)) return;
    setError(null);
    setIsPending(true);
    try {
      const result = await updatePaymentStatusAction({ orderId, newPaymentStatus });
      if (!result.success) setError(result.error);
      else router.refresh();
    } catch {
      setError("We could not update the payment status. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  return (
    <div className="space-y-3">
      {error ? <Alert variant="danger">{error}</Alert> : null}

      {statusOptions.length > 0 ? (
        <div>
          <p className="mb-1 text-xs font-medium uppercase text-gray-500">Move order to</p>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((s) => (
              <Button key={s} size="sm" variant="outline" isLoading={isPending} onClick={() => handleStatus(s)}>
                {s.replace(/_/g, " ")}
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-500">This order status is final.</p>
      )}

      {paymentOptions.length > 0 ? (
        <div>
          <p className="mb-1 text-xs font-bold uppercase tracking-[0.12em] text-slate-500">Payment verification</p>
          <p className="mb-3 text-xs leading-5 text-slate-500">Verify the transaction in your bank or mobile-money account before recording a payment outcome. This action updates the order record.</p>
          <div className="flex flex-wrap gap-2">
            {paymentOptions.map((s) => (
              <Button key={s} size="sm" variant="outline" isLoading={isPending} onClick={() => handlePayment(s)}>
                {s === "paid" ? "Confirm payment received" : s === "partial" ? "Record partial payment" : "Record refund"}
              </Button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
