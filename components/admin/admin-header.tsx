import Link from "next/link";
import { signOut } from "@/app/(auth)/actions";
import { NotificationBell } from "./notification-bell";
import type { AdminNotification } from "@/lib/data/admin/notifications";

export function AdminHeader({ email, notifications }: { email: string | undefined; notifications: AdminNotification[] }) {
  return (
    <header className="flex h-14 items-center justify-between border-b border-surface-border bg-surface px-4">
      <Link href="/admin" className="font-semibold text-gray-900">
        Classic Computers — Admin
      </Link>
      <div className="flex items-center gap-3">
        <NotificationBell notifications={notifications} />
        <span className="hidden text-sm text-gray-600 sm:inline">{email}</span>
        <form action={signOut}>
          <button type="submit" className="text-sm font-medium text-gray-600 hover:text-brand-600">
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
