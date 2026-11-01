"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function StudentDealsRetryButton() {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="outline"
      isLoading={isPending}
      className="min-h-11 shrink-0 rounded-lg px-4"
      onClick={() => startTransition(() => router.refresh())}
    >
      Try again
    </Button>
  );
}