"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { formatMoney } from "@/lib/format/money";
import { updateCorporateEnquiryStatusAction, updateCorporateEnquiryNotesAction } from "@/app/admin/enquiries/actions";
import type { AdminCorporateEnquiry } from "@/lib/data/admin/enquiries";

const STATUSES = ["new", "contacted", "quoted", "negotiating", "approved", "completed", "cancelled"];

export function CorporateEnquiryRow({ enquiry }: { enquiry: AdminCorporateEnquiry }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState(enquiry.internal_notes ?? "");
  const [showNotes, setShowNotes] = useState(false);

  function updateStatus(status: string) {
    startTransition(async () => {
      await updateCorporateEnquiryStatusAction({ id: enquiry.id, status });
      router.refresh();
    });
  }

  function saveNotes() {
    startTransition(async () => {
      await updateCorporateEnquiryNotesAction({ id: enquiry.id, notes });
      router.refresh();
    });
  }

  return (
    <div className="border-b border-surface-border p-3 text-sm">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-medium text-gray-900">{enquiry.organisation_name}</span>
          <span className="ml-2 text-xs text-gray-500">{enquiry.contact_person}</span>
        </div>
        <select
          value={enquiry.status}
          onChange={(e) => updateStatus(e.target.value)}
          disabled={isPending}
          className="rounded-card border border-surface-border px-2 py-1 text-xs"
        >
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>
      {enquiry.products_required ? <p className="mt-1 text-gray-600">{enquiry.products_required}</p> : null}
      <p className="mt-1 text-xs text-gray-400">
        {enquiry.phone} · {enquiry.email}
        {enquiry.quantity ? ` · Qty ${enquiry.quantity}` : ""}
        {enquiry.budget ? ` · Budget ${formatMoney(enquiry.budget)}` : ""}
        {enquiry.delivery_location ? ` · ${enquiry.delivery_location}` : ""}
      </p>
      <button type="button" onClick={() => setShowNotes((v) => !v)} className="mt-1 text-xs text-brand-600 hover:underline">
        {showNotes ? "Hide" : "Internal notes"}
      </button>
      {showNotes ? (
        <div className="mt-1 flex gap-2">
          <textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={2} className="flex-1 rounded-card border border-surface-border px-2 py-1 text-xs" />
          <button type="button" disabled={isPending} onClick={saveNotes} className="self-start rounded-card border border-surface-border px-2 py-1 text-xs hover:bg-surface-muted">
            Save
          </button>
        </div>
      ) : null}
    </div>
  );
}
