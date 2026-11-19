import Link from "next/link";
import { signOut } from "@/app/(auth)/actions";
import { NotificationBell } from "./notification-bell";
import type { AdminNotification } from "@/lib/data/admin/notifications";

export function AdminHeader({ email, notifications }: { email: string | undefined; notifications: AdminNotification[] }) {
  return (
    <header className="sticky top-0 z-40 flex min-h-[68px] items-center justify-between gap-4 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-sm backdrop-blur sm:px-6">
      <Link href="/admin" className="group flex min-w-0 flex-col leading-tight">
        <span className="truncate text-sm font-black uppercase tracking-[0.12em] text-navy-950 sm:text-base">
          Classic Computers
        </span>
        <span className="mt-1 text-[10px] font-bold uppercase tracking-[0.18em] text-brand-700">
          Administration workspace
        </span>
      </Link>
      <div className="flex shrink-0 items-center gap-2 sm:gap-4">
        <NotificationBell notifications={notifications} />
        <span className="hidden max-w-[220px] truncate text-sm font-medium text-slate-600 md:inline">{email}</span>
        <form action={signOut}>
          <button type="submit" className="inline-flex min-h-10 items-center rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2">
            Sign out
          </button>
        </form>
      </div>
    </header>
  );
}
