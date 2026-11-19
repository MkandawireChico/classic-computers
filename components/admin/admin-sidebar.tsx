"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { ADMIN_NAV_GROUPS } from "@/lib/admin-nav";

export function AdminSidebar({ permissions }: { permissions: string[] }) {
  const pathname = usePathname();
  const permSet = new Set(permissions);
  const [mobileOpen, setMobileOpen] = useState(false);

  // Filtering happens per item, same as before grouping — a group
  // simply renders nothing (not even its header) if none of its items
  // are visible to this user's permissions. This is still purely a
  // rendering convenience: every route underneath still enforces its
  // own requirePermission()/RLS regardless of what's shown here.
  const groups = ADMIN_NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) =>
      item.permission === null ||
      permSet.has(item.permission) ||
      item.anyPermissions?.some((permission) => permSet.has(permission))
    ),
  })).filter((group) => group.items.length > 0);

  const navContent = (
    <nav aria-label="Admin" className="flex flex-col gap-6 p-4">
      {groups.map((group, index) => (
        <div key={group.label ?? `group-${index}`}>
          {group.label ? (
            <p className="mb-2 px-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
              {group.label}
            </p>
          ) : null}
          <div className="flex flex-col gap-1.5">
            {group.items.map((item) => {
              const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-11 items-center rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
                    active ? "bg-brand-50 text-brand-900 ring-1 ring-inset ring-brand-200" : "text-slate-600 hover:bg-slate-50 hover:text-slate-950"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );

  return (
    <>
      <div className="border-b border-slate-200 bg-white px-4 py-3 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          aria-controls="mobile-admin-navigation"
          className="inline-flex min-h-10 items-center rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          {mobileOpen ? "Close menu" : "Menu"}
        </button>
        {mobileOpen ? <div id="mobile-admin-navigation" className="mt-3 max-h-[70vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-lg">{navContent}</div> : null}
      </div>

      <aside className="hidden w-64 shrink-0 overflow-y-auto border-r border-slate-200 bg-white lg:block">
        {navContent}
      </aside>
    </>
  );
}
