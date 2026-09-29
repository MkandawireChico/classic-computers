"use client";

import { useState, useTransition } from "react";
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
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const statusOptions = NEXT_STATUS[currentStatus] ?? [];
  const paymentOptions = NEXT_PAYMENT[currentPaymentStatus] ?? [];

  function handleStatus(newStatus: string) {
    setError(null);
    startTransition(async () => {
      const result = await updateOrderStatusAction({ orderId, newStatus });
      if (!result.success) setError(result.error);
      else router.refresh();
    });
  }

  function handlePayment(newPaymentStatus: string) {
    setError(null);
    startTransition(async () => {
      const result = await updatePaymentStatusAction({ orderId, newPaymentStatus });
      if (!result.success) setError(result.error);
      else router.refresh();
    });
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
          <p className="mb-1 text-xs font-medium uppercase text-gray-500">Mark payment as</p>
          <div className="flex flex-wrap gap-2">
            {paymentOptions.map((s) => (
              <Button key={s} size="sm" variant="outline" isLoading={isPending} onClick={() => handlePayment(s)}>
                {s}
              </Button>
            ))}
          </div>
        </div>
      ) : null}
    </div>
  );
}
