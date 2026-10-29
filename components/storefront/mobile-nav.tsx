"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export function MobileNav({ links }: { links: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);

  const shopLinks = links.filter((link) => ["/", "/shop", "/shop/laptop-computers"].includes(link.href));
  const serviceLinks = links.filter((link) => ["/rentals", "/repairs", "/student-deals", "/corporate"].includes(link.href));
  const infoLinks = links.filter((link) => ["/about", "/contact"].includes(link.href));

  useEffect(() => {
    if (!open) return;
    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    window.addEventListener("keydown", closeOnEscape);
    return () => window.removeEventListener("keydown", closeOnEscape);
  }, [open]);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        className="rounded-md border border-surface-border bg-white p-2.5 text-gray-700 shadow-sm hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

      {open ? (
        <>
          <button
            type="button"
            aria-label="Close navigation"
            className="fixed inset-0 z-20 bg-black/20 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div
            id="mobile-nav-panel"
            className="absolute inset-x-0 top-[calc(100%+1px)] z-30 border-b border-emerald-100 bg-gradient-to-br from-amber-50 via-white to-emerald-50 px-4 py-5 shadow-xl shadow-slate-900/10"
          >
            <nav aria-label="Mobile" className="flex flex-col gap-5">
              {shopLinks.length > 0 ? (
                <div className="rounded-2xl border border-brand-100 bg-white/80 p-3">
                  <p className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-brand-800">Shop</p>
                  <div className="flex flex-col gap-1">
                    {shopLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="rounded-xl px-3 py-3 text-base font-semibold text-slate-800 transition-colors hover:bg-brand-50 hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}

              {serviceLinks.length > 0 ? (
                <div className="rounded-2xl border border-emerald-100 bg-white/80 p-3">
                  <p className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-emerald-800">Services</p>
                  <div className="flex flex-col gap-1">
                    {serviceLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="rounded-xl px-3 py-3 text-base font-semibold text-slate-800 transition-colors hover:bg-emerald-50 hover:text-emerald-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}

              {infoLinks.length > 0 ? (
                <div className="rounded-2xl border border-amber-100 bg-white/80 p-3">
                  <p className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-amber-900">Information</p>
                  <div className="flex flex-col gap-1">
                    {infoLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="rounded-xl px-3 py-3 text-base font-semibold text-slate-800 transition-colors hover:bg-amber-50 hover:text-amber-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-600"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="border-t border-emerald-200 pt-4">
                <Link
                  href="/account"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-xl px-3 py-3 text-base font-semibold text-slate-800 transition-colors hover:bg-violet-50 hover:text-violet-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Account
                </Link>
              </div>
            </nav>
          </div>
        </>
      ) : null}
    </div>
  );
}

function MenuIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" />
    </svg>
  );
}
