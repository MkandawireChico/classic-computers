"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
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
  const [isPending, startTransition] = useTransition();
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  function markRead(id: string) {
    startTransition(async () => {
      await markMyNotificationReadAction(id);
      router.refresh();
    });
  }

  function markAllRead() {
    startTransition(async () => {
      await markAllMyNotificationsReadAction();
      router.refresh();
    });
  }

  if (notifications.length === 0) {
    return <p className="text-sm text-gray-500">No notifications yet.</p>;
  }

  return (
    <div>
      {unreadCount > 0 ? (
        <button type="button" disabled={isPending} onClick={markAllRead} className="mb-3 text-xs text-brand-600 hover:underline">
          Mark all as read
        </button>
      ) : null}
      <div className="divide-y divide-surface-border rounded-card border border-surface-border">
        {notifications.map((n) => {
          const href = notificationLink(n);
          const content = (
            <div className={`p-3 ${n.is_read ? "" : "bg-brand-50"}`}>
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-gray-900">{n.title}</p>
                {!n.is_read ? <Badge variant="info">New</Badge> : null}
              </div>
              {n.body ? <p className="mt-0.5 text-sm text-gray-600">{n.body}</p> : null}
              <p className="mt-1 text-xs text-gray-400">
                {new Date(n.created_at).toLocaleString("en-MW", { timeZone: "Africa/Blantyre" })}
              </p>
            </div>
          );

          return (
            <div key={n.id} className="flex items-stretch">
              {href ? (
                <Link href={href} className="flex-1 hover:bg-surface-muted" onClick={() => !n.is_read && markRead(n.id)}>
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
                  className="px-3 text-xs text-gray-400 hover:text-brand-600"
                >
                  ✓
                </button>
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}
