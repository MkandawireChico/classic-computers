import Link from "next/link";
import { signOut } from "@/app/(auth)/actions";
import { NotificationBell } from "./notification-bell";
import type { AdminNotification } from "@/lib/data/admin/notifications";

export function AdminHeader({ email, notifications }: { email: string | undefined; notifications: AdminNotification[] }) {
  return (
    <header className="sticky top-0 z-40 flex min-h-[68px] items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-4 py-3 shadow-[0_2px_12px_rgba(15,23,42,0.04)] backdrop-blur sm:px-6">
      <Link href="/admin" className="group flex min-w-0 items-center gap-3">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-xs font-black text-white transition-colors group-hover:bg-brand-800">CC</span>
        <span className="flex min-w-0 flex-col leading-tight">
          <span className="truncate text-sm font-black uppercase tracking-[0.1em] text-navy-950 sm:text-base">Classic Computers</span>
          <span className="mt-1 text-[9px] font-bold uppercase tracking-[0.17em] text-brand-700 sm:text-[10px]">Administration workspace</span>
        </span>
      </Link>
      <div className="flex shrink-0 items-center gap-2 sm:gap-3">
        <span className="hidden max-w-[220px] truncate rounded-full bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-600 xl:inline">{email}</span>
        <NotificationBell notifications={notifications} />
        <form action={signOut}>
          <button type="submit" className="inline-flex min-h-10 items-center rounded-xl border border-slate-200 bg-white px-3 text-xs font-bold text-slate-700 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 sm:px-4 sm:text-sm">Sign out</button>
        </form>
      </div>
    </header>
  );
}
