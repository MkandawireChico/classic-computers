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
  const [actionError, setActionError] = useState<string | null>(null);
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  function handleMarkRead(id: string) {
    setActionError(null);
    startTransition(async () => {
      const result = await markNotificationRead(id);
      if (!result.success) {
        setActionError(result.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="relative">
      <button
        type="button"
        aria-label={`Notifications${unreadCount > 0 ? `, ${unreadCount} unread` : ""}`}
        aria-expanded={open}
        aria-controls="admin-notification-panel"
        onClick={() => {
          setActionError(null);
          setOpen((v) => !v);
        }}
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
        <div id="admin-notification-panel" role="region" aria-label="Recent notifications" className="absolute right-0 z-30 mt-2 w-[min(22rem,calc(100vw-2rem))] rounded-card border border-surface-border bg-surface shadow-md">
          <div className="flex items-center justify-between border-b border-surface-border px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-gray-900">Notifications</p>
              <p className="text-xs text-gray-500">{unreadCount} unread · latest {notifications.length}</p>
            </div>
            <button type="button" onClick={() => setOpen(false)} className="rounded px-2 py-1 text-xs font-medium text-gray-500 hover:bg-surface-muted hover:text-gray-900">Close</button>
          </div>
          {actionError ? <p role="alert" className="border-b border-red-200 bg-red-50 px-4 py-2 text-xs text-red-700">{actionError}</p> : null}
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
                        aria-label={`Mark notification as read: ${n.title}`}
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
