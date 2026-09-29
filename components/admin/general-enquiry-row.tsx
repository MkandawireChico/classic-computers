"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { updateGeneralEnquiryStatusAction, updateGeneralEnquiryNotesAction } from "@/app/admin/enquiries/actions";
import type { AdminGeneralEnquiry } from "@/lib/data/admin/enquiries";

const STATUSES = ["new", "read", "responded", "closed"];

function renderEnquiryMessage(message: string) {
  const productUrl = /(https:\/\/classiccomputers\.mw\/product\/[a-z0-9-]+)/g;
  return message.split(productUrl).map((part, index) => {
    const match = part.match(/^https:\/\/classiccomputers\.mw\/product\/([a-z0-9-]+)$/);
    return match ? (
      <Link key={`${match[1]}-${index}`} href={`/product/${match[1]}`} target="_blank" rel="noopener noreferrer" className="font-medium text-brand-600 underline">
        View product
      </Link>
    ) : part;
  });
}

export function GeneralEnquiryRow({ enquiry }: { enquiry: AdminGeneralEnquiry }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState(enquiry.internal_notes ?? "");
  const [showNotes, setShowNotes] = useState(false);

  function updateStatus(status: string) {
    startTransition(async () => {
      await updateGeneralEnquiryStatusAction({ id: enquiry.id, status });
      router.refresh();
    });
  }

  function saveNotes() {
    startTransition(async () => {
      await updateGeneralEnquiryNotesAction({ id: enquiry.id, notes });
      router.refresh();
    });
  }

  return (
    <div className="border-b border-surface-border p-3 text-sm">
      <div className="flex items-center justify-between">
        <div>
          <span className="font-medium text-gray-900">{enquiry.name}</span>
          <span className="ml-2 text-xs capitalize text-gray-500">{enquiry.topic}</span>
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
      <p className="mt-1 whitespace-pre-line text-gray-600">{renderEnquiryMessage(enquiry.message)}</p>
      <p className="mt-1 text-xs text-gray-400">
        {enquiry.phone ?? ""} {enquiry.email ?? ""} ·{" "}
        {new Date(enquiry.created_at).toLocaleDateString("en-MW", { timeZone: "Africa/Blantyre" })}
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
