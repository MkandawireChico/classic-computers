"use client";

import { useState, useTransition } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { retryAdminEmailNotificationAction } from "@/app/admin/email-notifications/actions";

export function RetryAdminEmailButton({ notificationId }: { notificationId: string }) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="space-y-2">
      <Button
        type="button"
        variant="outline"
        size="sm"
        isLoading={isPending}
        onClick={() => startTransition(async () => {
          setError(null);
          const result = await retryAdminEmailNotificationAction(notificationId);
          if (!result.success) setError(result.error);
        })}
      >
        Retry email
      </Button>
      {error ? <Alert variant="danger" className="max-w-xs text-xs">{error}</Alert> : null}
    </div>
  );
}