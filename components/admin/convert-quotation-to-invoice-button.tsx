"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { convertQuotationToInvoiceAction } from "@/app/admin/documents/actions";

export function ConvertQuotationToInvoiceButton({ quotationId }: { quotationId: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function convert() {
    if (!window.confirm("Create an invoice from this accepted quotation?")) return;
    setError(null);
    startTransition(async () => {
      try {
        const result = await convertQuotationToInvoiceAction(quotationId);
        if (!result.success) {
          setError(result.error);
          return;
        }
        if (result.invoiceId) router.push(`/admin/documents/${result.invoiceId}`);
      } catch {
        setError("The invoice could not be created. Refresh and try again.");
      }
    });
  }

  return (
    <div className="space-y-2">
      <Button type="button" disabled={pending} isLoading={pending} onClick={convert}>Create invoice</Button>
      {error ? <p role="alert" className="text-sm text-rose-700">{error}</p> : null}
    </div>
  );
}
