"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { markNotificationRead } from "@/app/admin/notifications-actions";
import type { AdminNotification } from "@/lib/data/admin/notifications";

function entityHref(notification: AdminNotification): string | null {
  if (notification.related_entity_type === "order" && notification.related_entity_id) {
    return `/admin/orders/${notification.related_entity_id}`;
  }
  return null;
}

export function NotificationBell({ notifications }: { notifications: AdminNotification[] }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  function handleMarkRead(id: string) {
    startTransition(async () => {
      await markNotificationRead(id);
      router.refresh();
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        onClick={() => setOpen((v) => !v)}
        className="relative rounded-card p-2 text-gray-700 hover:bg-surface-muted"
      >
        🔔
        {unreadCount > 0 ? (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-status-danger px-1 text-[10px] font-semibold text-white">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-30 mt-2 w-80 rounded-card border border-surface-border bg-surface shadow-md">
          <div className="max-h-96 divide-y divide-surface-border overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="p-4 text-sm text-gray-500">No notifications yet.</p>
            ) : (
              notifications.map((n) => {
                const href = entityHref(n);
                const content = (
                  <div className={`p-3 text-sm ${n.is_read ? "" : "bg-brand-50"}`}>
                    <p className="font-medium text-gray-900">{n.title}</p>
                    {n.body ? <p className="mt-0.5 text-xs text-gray-600">{n.body}</p> : null}
                    <p className="mt-1 text-[11px] text-gray-400">
                      {new Date(n.created_at).toLocaleString("en-MW", { timeZone: "Africa/Blantyre" })}
                    </p>
                  </div>
                );
                return (
                  <div key={n.id} className="flex items-stretch">
                    {href ? (
                      <Link href={href} className="flex-1 hover:bg-surface-muted" onClick={() => setOpen(false)}>
                        {content}
                      </Link>
                    ) : (
                      <div className="flex-1">{content}</div>
                    )}
                    {!n.is_read ? (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleMarkRead(n.id)}
                        className="px-2 text-xs text-gray-400 hover:text-brand-600"
                        aria-label="Mark as read"
                      >
                        ✓
                      </button>
                    ) : null}
                  </div>
                );
              })
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
