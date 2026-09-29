"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

/**
 * Root error boundary. Never renders the raw error message to the user
 * (section 57 — don't expose raw database/server errors); logs it
 * server-side-visible via console.error for now, structured logging can be
 * swapped in later without touching call sites.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Unhandled application error:", error);
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="w-full max-w-md space-y-4">
        <Alert variant="danger">
          Something went wrong on our end. Please try again, or contact us if the problem
          continues.
        </Alert>
        <Button onClick={reset} className="w-full">
          Try again
        </Button>
      </div>
    </div>
  );
}
