"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { ADMIN_NAV_GROUPS } from "@/lib/admin-nav";

export function AdminSidebar({ permissions }: { permissions: string[] }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const permSet = new Set(permissions);
  const groups = ADMIN_NAV_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) =>
      item.permission === null || permSet.has(item.permission) ||
      item.anyPermissions?.some((permission) => permSet.has(permission))
    ),
  })).filter((group) => group.items.length > 0);

  useEffect(() => {
    if (!mobileOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

  useEffect(() => setMobileOpen(false), [pathname]);

  const navContent = (mobile = false) => (
    <nav aria-label="Admin navigation" className="flex flex-col gap-7 px-3 py-5">
      {groups.map((group, index) => (
        <section key={group.label ?? "group-" + index} aria-label={group.label ?? "Overview"}>
          {group.label ? <h2 className="mb-2 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400/75">{group.label}</h2> : null}
          <div className="space-y-1">
            {group.items.map((item) => {
              const active = item.href === "/admin" ? pathname === "/admin" : pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link key={item.href} href={item.href} onClick={() => mobile && setMobileOpen(false)} aria-current={active ? "page" : undefined}
                  className={"group relative flex min-h-11 items-center gap-3 rounded-xl px-3.5 py-2.5 text-[13px] font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300 focus-visible:ring-offset-2 focus-visible:ring-offset-slate-950 " + (active ? "bg-white text-slate-950 shadow-lg" : "text-slate-300 hover:bg-white/[0.08] hover:text-white")}>
                  <span aria-hidden="true" className={"flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-[10px] font-black tracking-wide " + (active ? "bg-cyan-100 text-cyan-800" : "bg-white/[0.08] text-slate-300 group-hover:bg-white/[0.13] group-hover:text-white")}>
                    {item.label.split(/\\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase()}
                  </span>
                  <span className="min-w-0 flex-1">{item.label}</span>
                  {active ? <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-cyan-600" /> : null}
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </nav>
  );

  return (
    <>
      <div className="sticky top-[68px] z-30 border-b border-slate-200/80 bg-white/95 px-4 py-2.5 backdrop-blur lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">Navigation</p>
            <p className="truncate text-sm font-bold text-slate-900">{getCurrentSection(pathname)}</p>
          </div>
          <button type="button" onClick={() => setMobileOpen(true)} aria-expanded={mobileOpen} aria-controls="mobile-admin-navigation"
            className="inline-flex min-h-11 shrink-0 items-center gap-2.5 rounded-xl bg-slate-950 px-4 text-sm font-bold text-white shadow-sm transition hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-500 focus-visible:ring-offset-2">
            <span aria-hidden="true" className="flex w-4 flex-col gap-1"><span className="h-0.5 w-4 rounded bg-current" /><span className="h-0.5 w-3 rounded bg-current" /><span className="h-0.5 w-4 rounded bg-current" /></span>
            Menu
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div className="fixed inset-0 z-[60] lg:hidden">
          <button type="button" aria-label="Close navigation menu" onClick={() => setMobileOpen(false)} className="absolute inset-0 h-full w-full bg-slate-950/60 backdrop-blur-[2px]" />
          <aside id="mobile-admin-navigation" aria-label="Admin menu" className="absolute inset-y-0 left-0 flex w-[min(21rem,88vw)] flex-col border-r border-white/10 bg-slate-950 text-white shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-5">
              <div className="flex min-w-0 items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-cyan-400 text-sm font-black text-slate-950">CC</span>
                <div className="min-w-0"><p className="truncate text-sm font-extrabold text-white">Classic Computers</p><p className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.17em] text-cyan-300">Admin workspace</p></div>
              </div>
              <button type="button" onClick={() => setMobileOpen(false)} aria-label="Close menu" className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-white/10 text-xl text-slate-300 transition hover:bg-white/10 hover:text-white">×</button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-1">{navContent(true)}</div>
            <div className="border-t border-white/10 px-5 py-4"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Classic Computers LLC</p><p className="mt-1 text-xs text-slate-400">Blantyre, Malawi</p></div>
          </aside>
        </div>
      ) : null}

      <aside className="sticky top-[68px] hidden h-[calc(100vh-68px)] w-[17rem] shrink-0 flex-col overflow-y-auto border-r border-slate-800 bg-slate-950 text-white lg:flex xl:w-[18rem]">
        <div className="border-b border-white/10 px-5 py-5"><div className="flex items-center gap-3"><span className="flex h-10 w-10 items-center justify-center rounded-xl bg-cyan-400 text-sm font-black text-slate-950">CC</span><div><p className="text-sm font-extrabold text-white">Control centre</p><p className="mt-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-400">Store operations</p></div></div></div>
        <div className="min-h-0 flex-1 overflow-y-auto">{navContent()}</div>
        <div className="border-t border-white/10 px-5 py-4"><p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Classic Computers LLC</p><p className="mt-1 text-xs text-slate-400">Blantyre, Malawi</p></div>
      </aside>
    </>
  );
}

function getCurrentSection(pathname: string) {
  for (const group of ADMIN_NAV_GROUPS) {
    const item = group.items.find((entry) => entry.href === "/admin" ? pathname === "/admin" : pathname === entry.href || pathname.startsWith(entry.href + "/"));
    if (item) return item.label;
  }
  return "Admin workspace";
}
