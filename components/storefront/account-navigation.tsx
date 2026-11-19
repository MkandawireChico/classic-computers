"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const GROUPS = [
  { title: "My account", links: [
    ["/account", "Overview", "home"],
    ["/account/profile", "Personal profile", "user"],
    ["/account/addresses", "Addresses", "pin"],
    ["/account/settings", "Account settings", "settings"],
  ] },
  { title: "My activity", links: [
    ["/account/orders", "My orders", "bag"],
    ["/account/reviews", "My reviews", "star"],
    ["/account/repairs", "My repairs", "wrench"],
    ["/account/rentals", "My rentals", "calendar"],
    ["/account/enquiries", "My enquiries", "message"],
  ] },
  { title: "My benefits", links: [
    ["/account/student-verification", "Student deals", "cap"],
    ["/account/referrals", "Referrals", "users"],
    ["/account/wishlist", "Wishlist", "heart"],
    ["/compare", "Product comparison", "compare"],
  ] },
  { title: "Communication", links: [["/account/notifications", "Notifications", "bell"]] },
] as const;

function Icon({ name }: { name: string }) {
  const paths: Record<string, string> = {
    home: "M3 10 12 3l9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10Z",
    user: "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM4 21a8 8 0 0 1 16 0",
    pin: "M20 10c0 6-8 12-8 12S4 16 4 10a8 8 0 1 1 16 0ZM12 10h.01",
    settings: "M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8Zm0-6v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42",
    bag: "M5 8h14l1 13H4L5 8Zm4 0a3 3 0 0 1 6 0",
    wrench: "m14 6 4-4a5 5 0 0 1-6 7l-8 8a2 2 0 1 0 3 3l8-8a5 5 0 0 0 7-6l-4 4-4-4Z",
    calendar: "M4 5h16v16H4zM8 3v4m8-4v4M4 10h16",
    message: "M20 11.5a8 8 0 0 1-8 8 9 9 0 0 1-4-.9L3 20l1.4-4.1A8 8 0 1 1 20 11.5Z",
    cap: "m2 9 10-5 10 5-10 5L2 9Zm4 2v5c3.5 3 8.5 3 12 0v-5m4-2v6",
    users: "M9 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM2 21a7 7 0 0 1 14 0m1-16a4 4 0 0 1 0 8m1 2a6 6 0 0 1 4 6",
    heart: "M20.8 8.6c0 5.2-8.8 11-8.8 11S3.2 13.8 3.2 8.6A4.6 4.6 0 0 1 12 6.5a4.6 4.6 0 0 1 8.8 2.1Z",
    compare: "M8 4H4v16h4M16 4h4v16h-4M9 8h6m-6 4h6m-6 4h6",
    bell: "M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9Zm4 13h4",
    star: "m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2L12 17.3 6.4 20.2l1.1-6.2L3 9.6l6.2-.9L12 3Z",
  };

  return (
    <svg aria-hidden="true" className="h-[18px] w-[18px] shrink-0" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
      <path d={paths[name] ?? paths.home} />
    </svg>
  );
}

function isActivePath(pathname: string, href: string): boolean {
  return pathname === href || (href !== "/account" && pathname.startsWith(`${href}/`));
}

export function AccountNavigation() {
  const pathname = usePathname() ?? "/account";
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") setIsOpen(false);
    };
    window.addEventListener("keydown", closeOnEscape);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", closeOnEscape);
    };
  }, [isOpen]);

  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);
  let active: readonly [string, string, string] | undefined = undefined;
  for (const group of GROUPS) {
    for (const link of group.links) {
      if (isActivePath(pathname, link[0])) {
        active = link;
        break;
      }
    }
    if (active) break;
  }

  return (
    <>
      <nav aria-label="Account navigation" className="hidden lg:block">
        <div className="sticky top-24 max-h-[calc(100dvh-8rem)] overflow-y-auto border-r border-slate-200 pr-4">
          {GROUPS.map((group) => (
            <section key={group.title} className="mb-5 last:mb-0">
              <h2 className="mb-2 px-3 pt-2 text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">{group.title}</h2>
              <ul className="space-y-1">
                {group.links.map(([href, label, icon]) => {
                  const selected = isActivePath(pathname, href);
                  return (
                    <li key={href}>
                      <Link href={href} aria-current={selected ? "page" : undefined} className={`flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2 ${selected ? "bg-slate-950 text-white shadow-sm" : "text-slate-600 hover:bg-slate-100 hover:text-slate-950"}`}>
                        <Icon name={icon} /><span className="min-w-0 flex-1">{label}</span>
                        {selected ? <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-brand-700" /> : null}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </section>
          ))}
        </div>
      </nav>

      <div className="relative lg:hidden">
        <button type="button" aria-expanded={isOpen} aria-controls="mobile-account-navigation" onClick={() => setIsOpen((open) => !open)} className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl border border-slate-200 bg-slate-950 px-4 text-left text-sm font-bold text-white shadow-sm transition-colors hover:bg-slate-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 focus-visible:ring-offset-2">
          <span className="flex min-w-0 items-center gap-3"><Icon name={active?.[2] ?? "home"} /><span className="truncate">{active?.[1] ?? "Account menu"}</span></span>
          <svg aria-hidden="true" className={`h-4 w-4 shrink-0 transition-transform ${isOpen ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none"><path d="m6 9 6 6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
        </button>
        {isOpen ? (
          <div className="fixed inset-0 z-50 lg:hidden">
            <button type="button" aria-label="Close account menu" onClick={() => setIsOpen(false)} className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px]" />
            <nav id="mobile-account-navigation" aria-label="Account navigation" className="absolute inset-y-0 right-0 flex w-[min(88vw,380px)] flex-col overflow-y-auto border-l border-slate-200 bg-white p-5 shadow-2xl">
              <div className="mb-6 flex items-center justify-between border-b border-slate-200 pb-5">
                <div><p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-brand-700">Classic Computers</p><p className="mt-1 text-lg font-extrabold text-slate-950">Your account</p></div>
                <button type="button" onClick={() => setIsOpen(false)} aria-label="Close account menu" className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 text-xl text-slate-600 hover:bg-slate-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600">×</button>
              </div>
              {GROUPS.map((group) => (
                <section key={group.title} className="mb-5 last:mb-0">
                  <h2 className="mb-2 px-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">{group.title}</h2>
                  <ul className="space-y-1">
                    {group.links.map(([href, label, icon]) => {
                      const selected = isActivePath(pathname, href);
                      return <li key={href}><Link href={href} aria-current={selected ? "page" : undefined} onClick={() => setIsOpen(false)} className={"flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-bold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 " + (selected ? "bg-slate-950 text-white" : "text-slate-700 hover:bg-slate-100")}><Icon name={icon} />{label}{selected ? <span className="ml-auto h-1.5 w-1.5 rounded-full bg-cyan-400" /> : null}</Link></li>;
                    })}
                  </ul>
                </section>
              ))}
            </nav>
          </div>
        ) : null}
      </div>
    </>
  );
}