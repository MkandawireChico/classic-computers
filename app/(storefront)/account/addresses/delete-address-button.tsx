"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { deleteAddressAction } from "./actions";

export function DeleteAddressButton({ addressId }: { addressId: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={isPending}
      onClick={() => startTransition(async () => {
        await deleteAddressAction(addressId);
        router.refresh();
      })}
      className="text-sm text-gray-500 hover:text-status-danger disabled:opacity-40"
    >
      Delete
    </button>
  );
}
