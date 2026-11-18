"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";

export function MobileNav({
  links,
  isAuthenticated,
  canAccessAdmin,
}: {
  links: { href: string; label: string }[];
  isAuthenticated: boolean;
  canAccessAdmin: boolean;
}) {
  const [open, setOpen] = useState(false);
  const [portalRoot, setPortalRoot] = useState<HTMLElement | null>(null);

  const shopLinks = links.filter((link) =>
    ["/", "/shop", "/shop/laptop-computers"].includes(link.href),
  );
  const serviceLinks = links.filter((link) =>
    ["/rentals", "/repairs", "/student-deals", "/corporate"].includes(link.href),
  );
  const infoLinks = links.filter((link) => ["/about", "/contact"].includes(link.href));

  useEffect(() => {
    setPortalRoot(document.body);
  }, []);

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

      {open && portalRoot
        ? createPortal(
            <>
              <button
                type="button"
                aria-label="Close navigation backdrop"
                className="fixed inset-0 z-20 bg-black/20 backdrop-blur-sm"
                onClick={() => setOpen(false)}
              />
              <div
                id="mobile-nav-panel"
                className="fixed inset-x-0 bottom-0 top-16 z-[60] flex flex-col overflow-hidden border-b border-slate-200 bg-white shadow-xl shadow-slate-900/10"
              >
                <div className="flex shrink-0 items-center justify-between border-b border-slate-200 px-4 py-3">
                  <p className="text-sm font-bold uppercase tracking-wider text-navy-800">Menu</p>
                  <button
                    type="button"
                    aria-label="Close navigation"
                    onClick={() => setOpen(false)}
                    className="inline-flex min-h-10 items-center gap-2 rounded-lg px-3 text-sm font-semibold text-slate-700 transition-colors hover:bg-emerald-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-600"
                  >
                    Close
                    <CloseIcon />
                  </button>
                </div>
                <nav
                  aria-label="Mobile"
                  className="min-h-0 flex-1 space-y-4 overflow-y-auto overscroll-contain px-4 py-4"
                >
                  <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
                    <p className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-navy-700">
                      Account
                    </p>
                    <div className="grid grid-cols-2 gap-1">
                      {isAuthenticated ? (
                        <Link
                          href="/account"
                          onClick={() => setOpen(false)}
                          className="flex min-h-11 min-w-0 items-center gap-2 rounded-xl px-2 py-2 text-sm font-semibold text-slate-800 transition-colors hover:bg-violet-50 hover:text-violet-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600"
                        >
                          <AccountIcon />
                          My Account
                        </Link>
                      ) : (
                        <>
                          <Link
                            href="/sign-in"
                            onClick={() => setOpen(false)}
                            className="flex min-h-11 items-center justify-center rounded-xl px-2 py-2 text-sm font-semibold text-slate-800 transition-colors hover:bg-violet-50 hover:text-violet-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600"
                          >
                            Sign In
                          </Link>
                          <Link
                            href="/sign-up"
                            onClick={() => setOpen(false)}
                            className="flex min-h-11 items-center justify-center rounded-xl bg-brand-600 px-2 py-2 text-sm font-semibold text-white transition-colors hover:bg-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600"
                          >
                            Create Account
                          </Link>
                        </>
                      )}
                      {isAuthenticated && canAccessAdmin ? (
                        <Link
                          href="/admin"
                          onClick={() => setOpen(false)}
                          className="flex min-h-11 min-w-0 items-center justify-center rounded-xl px-2 py-2 text-center text-sm font-semibold text-slate-800 transition-colors hover:bg-violet-50 hover:text-violet-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-600"
                        >
                          Staff Dashboard
                        </Link>
                      ) : null}
                    </div>
                  </div>

                  {shopLinks.length > 0 ? (
                    <div className="rounded-2xl border border-slate-200 bg-white p-3">
                      <p className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-brand-800">
                        Shop
                      </p>
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
                    <div className="rounded-2xl border border-slate-200 bg-white p-3">
                      <p className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-brand-700">
                        Services
                      </p>
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
                    <div className="rounded-2xl border border-slate-200 bg-white p-3">
                      <p className="mb-2 px-3 text-xs font-bold uppercase tracking-wider text-navy-700">
                        Information
                      </p>
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
                </nav>
              </div>
            </>,
            portalRoot,
          )
        : null}
    </div>
  );
}

function AccountIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function MenuIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M4 7h16M4 12h16M4 17h16"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M6 6l12 12M18 6L6 18"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
