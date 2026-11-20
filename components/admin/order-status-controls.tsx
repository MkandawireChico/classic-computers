"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { updateOrderStatusAction } from "@/app/admin/orders/actions";

const NEXT_STATUS: Record<string, string[]> = {
  pending: ["confirmed", "cancelled"],
  confirmed: ["processing", "cancelled"],
  processing: ["ready_for_pickup", "out_for_delivery", "cancelled"],
  ready_for_pickup: ["completed", "cancelled"],
  out_for_delivery: ["completed", "cancelled"],
  completed: [],
  cancelled: [],
  refunded: [],
};

export function OrderStatusControls({
  orderId,
  currentStatus,
  fulfillmentType,
}: {
  orderId: string;
  currentStatus: string;
  fulfillmentType: string;
}) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const statusOptions = (NEXT_STATUS[currentStatus] ?? []).filter((status) => {
    if (status === "ready_for_pickup") return fulfillmentType === "pickup";
    if (status === "out_for_delivery") return fulfillmentType === "delivery";
    return true;
  });

  async function handleStatus(newStatus: string) {
    if (isPending) return;
    if (newStatus === "cancelled") {
      const confirmed = window.confirm("Cancel this order? Check the payment and fulfilment records before continuing.");
      if (!confirmed) return;
    }
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

  return (
    <div className="space-y-3">
      {error ? <Alert variant="danger">{error}</Alert> : null}

      {statusOptions.length > 0 ? (
        <div>
          <p className="mb-1 text-xs font-medium uppercase text-gray-500">Move order to</p>
          <div className="flex flex-wrap gap-2">
            {statusOptions.map((s) => (
              <Button
                key={s}
                size="sm"
                variant={s === "cancelled" ? "danger" : "outline"}
                isLoading={isPending}
                disabled={isPending}
                onClick={() => handleStatus(s)}
              >
                {s.replace(/_/g, " ")}
              </Button>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-xs text-gray-500">This order status is final.</p>
      )}

    </div>
  );
}
