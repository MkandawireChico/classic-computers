"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { markMyNotificationReadAction, markAllMyNotificationsReadAction } from "./actions";

export type MyNotification = {
  id: string;
  type: string;
  title: string;
  body: string | null;
  is_read: boolean;
  related_entity_type: string | null;
  related_entity_id: string | null;
  created_at: string;
};

function notificationLink(notification: MyNotification): string | null {
  switch (notification.related_entity_type) {
    case "order":
      return `/account/orders/${notification.related_entity_id}`;
    case "repair_ticket":
      return `/account/repairs/${notification.related_entity_id}`;
    case "rental_booking":
      return `/account/rentals/${notification.related_entity_id}`;
    case "student_verification":
      return "/account/student-verification";
    case "referral":
      return "/account/referrals";
    default:
      return null;
  }
}

export function NotificationList({ notifications }: { notifications: MyNotification[] }) {
  const router = useRouter();
  const [isPending, setIsPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  async function markRead(id: string) {
    if (isPending) return;
    setIsPending(true);
    setActionError(null);
    try {
      const result = await markMyNotificationReadAction(id);
      if (!result.success) {
        setActionError(result.error);
        return;
      }
      router.refresh();
    } catch {
      setActionError("We couldn't update this notification. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  async function markAllRead() {
    if (isPending) return;
    setIsPending(true);
    setActionError(null);
    try {
      const result = await markAllMyNotificationsReadAction();
      if (!result.success) {
        setActionError(result.error);
        return;
      }
      router.refresh();
    } catch {
      setActionError("We couldn't update your notifications. Please try again.");
    } finally {
      setIsPending(false);
    }
  }

  if (notifications.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center sm:p-8">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-slate-300">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        <h3 className="text-lg font-bold text-slate-950">No notifications yet</h3>
        <p className="mt-2 text-sm leading-6 text-slate-600">Important order, service and account updates will appear here.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {actionError ? <Alert variant="danger">{actionError}</Alert> : null}
      {unreadCount > 0 ? (
        <Button
          type="button"
          disabled={isPending}
          onClick={markAllRead}
          variant="outline"
          size="sm"
          className="min-h-10 rounded-lg"
        >
          Mark all as read ({unreadCount})
        </Button>
      ) : null}
      <div className="space-y-3">
        {notifications.map((n) => {
          const href = notificationLink(n);
          const content = (
            <div className={`rounded-xl border p-4 transition-colors sm:p-5 ${n.is_read ? "border-slate-200 bg-white" : "border-brand-200 bg-brand-50/70"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <p className="text-base font-bold text-slate-950">{n.title}</p>
                    {!n.is_read ? <Badge variant="info" className="text-xs">Unread</Badge> : null}
                  </div>
                  {n.body ? <p className="mt-2 text-sm text-slate-600">{n.body}</p> : null}
                  <time dateTime={n.created_at} className="mt-3 block text-xs text-slate-500">
                    {new Date(n.created_at).toLocaleString("en-MW", { timeZone: "Africa/Blantyre", year: "numeric", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit" })}
                  </time>
                </div>
              </div>
            </div>
          );

          return (
            <div key={n.id} className="flex items-stretch gap-2">
              {href ? (
                <Link href={href} className="flex-1" onClick={() => !n.is_read && markRead(n.id)}>
                  {content}
                </Link>
              ) : (
                <div className="flex-1">{content}</div>
              )}
              {!n.is_read ? (
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => markRead(n.id)}
                  aria-label="Mark as read"
                  className="min-h-11 min-w-11 shrink-0 self-start rounded-lg border border-slate-200 bg-white p-3 text-slate-600 transition-colors hover:bg-slate-50 hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-700 disabled:opacity-50"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
