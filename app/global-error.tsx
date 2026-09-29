"use client";

import { useEffect } from "react";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

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
    <html lang="en">
      <body className="min-h-screen bg-slate-50 px-4 py-10 antialiased">
        <div className="mx-auto flex min-h-[60vh] max-w-md items-center justify-center">
          <div className="w-full space-y-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <Alert variant="danger">
              Something went wrong on our end. Please refresh the page or try again.
            </Alert>
            <Button onClick={() => reset()} className="w-full">
              Try again
            </Button>
          </div>
        </div>
      </body>
    </html>
  );
}
