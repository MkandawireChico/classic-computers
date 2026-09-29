"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { decideStudentVerificationAction } from "@/app/admin/students/actions";

export function StudentDecisionControls({ verificationId, status }: { verificationId: string; status: string }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (status !== "pending") {
    return <p className="text-sm text-gray-500">This verification has already been {status}.</p>;
  }

  function decide(decision: "approved" | "rejected") {
    setError(null);
    startTransition(async () => {
      const result = await decideStudentVerificationAction({ verificationId, status: decision });
      if (!result.success) setError(result.error);
      else router.refresh();
    });
  }

  return (
    <div className="space-y-2">
      {error ? <Alert variant="danger">{error}</Alert> : null}
      <div className="flex gap-2">
        <Button size="sm" isLoading={isPending} onClick={() => decide("approved")}>
          Approve
        </Button>
        <Button size="sm" variant="outline" isLoading={isPending} onClick={() => decide("rejected")}>
          Reject
        </Button>
      </div>
    </div>
  );
}
