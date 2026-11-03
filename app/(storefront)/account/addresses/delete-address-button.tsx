"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Alert } from "@/components/ui/alert";
import { deleteAddressAction } from "./actions";

export function DeleteAddressButton({ addressId }: { addressId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="flex flex-col items-start gap-2">
      <button
        type="button"
        disabled={isPending}
        onClick={() => {
          if (!window.confirm("Delete this saved address? This cannot be undone.")) return;
          setError(null);
          startTransition(async () => {
            const result = await deleteAddressAction(addressId);
            if (!result.success) {
              setError(result.error);
              return;
            }
            router.refresh();
          });
        }}
        className="inline-flex min-h-10 items-center rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition-colors hover:border-rose-300 hover:bg-rose-50 hover:text-rose-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-700 disabled:opacity-50"
      >
        {isPending ? "Deleting..." : "Delete"}
      </button>
      {error ? <Alert variant="danger" className="text-xs">{error}</Alert> : null}
    </div>
  );
}
