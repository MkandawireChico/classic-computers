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
    items: group.items.filter((item) => item.permission === null || permSet.has(item.permission)),
  })).filter((group) => group.items.length > 0);

  const navContent = (
    <nav aria-label="Admin" className="flex flex-col gap-4 p-3">
      {groups.map((group, index) => (
        <div key={group.label ?? `group-${index}`}>
          {group.label ? (
            <p className="mb-1 px-3 text-[11px] font-semibold uppercase tracking-wide text-gray-400">
              {group.label}
            </p>
          ) : null}
          <div className="flex flex-col gap-1">
            {group.items.map((item) => {
              const active = item.href === "/admin" ? pathname === "/admin" : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-card px-3 py-2 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2 ${
                    active ? "bg-brand-50 text-brand-800" : "text-gray-700 hover:bg-surface-muted"
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
      <div className="border-b border-surface-border bg-surface px-3 py-2 lg:hidden">
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          aria-expanded={mobileOpen}
          className="rounded-card px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
        >
          {mobileOpen ? "Close menu" : "Menu"}
        </button>
        {mobileOpen ? <div className="mt-1 max-h-[70vh] overflow-y-auto rounded-card border border-surface-border">{navContent}</div> : null}
      </div>

      <aside className="hidden w-60 shrink-0 overflow-y-auto border-r border-surface-border bg-surface lg:block">
        {navContent}
      </aside>
    </>
  );
}
