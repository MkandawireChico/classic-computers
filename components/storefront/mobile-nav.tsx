"use client";

import { useState } from "react";
import Link from "next/link";

export function MobileNav({ links }: { links: { href: string; label: string }[] }) {
  const [open, setOpen] = useState(false);

  const shopLinks = links.filter((l) => l.href === "/shop" || l.href.startsWith("/shop/"));
  const serviceLinks = links.filter((l) => ["/rentals", "/repairs", "/corporate"].includes(l.href));
  const infoLinks = links.filter((l) => ["/student-deals"].includes(l.href));

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="mobile-nav-panel"
        aria-label={open ? "Close menu" : "Open menu"}
        onClick={() => setOpen((v) => !v)}
        className="rounded-full border border-surface-border bg-surface p-2.5 text-gray-700 shadow-sm hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

      {open ? (
        <>
          <div
            className="fixed inset-0 z-20 bg-black/20 backdrop-blur-sm"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />
          <div
            id="mobile-nav-panel"
            className="absolute inset-x-0 top-[calc(100%+1px)] z-30 border-b border-surface-border bg-surface px-4 py-5 shadow-soft"
          >
            <nav aria-label="Mobile" className="flex flex-col gap-6">
              {shopLinks.length > 0 ? (
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Shop</p>
                  <div className="flex flex-col gap-1">
                    {shopLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="rounded-lg px-3 py-3 text-base font-medium text-gray-900 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}

              {serviceLinks.length > 0 ? (
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Services</p>
                  <div className="flex flex-col gap-1">
                    {serviceLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="rounded-lg px-3 py-3 text-base font-medium text-gray-900 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}

              {infoLinks.length > 0 ? (
                <div>
                  <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-gray-500">Information</p>
                  <div className="flex flex-col gap-1">
                    {infoLinks.map((link) => (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={() => setOpen(false)}
                        className="rounded-lg px-3 py-3 text-base font-medium text-gray-900 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                      >
                        {link.label}
                      </Link>
                    ))}
                  </div>
                </div>
              ) : null}

              <div className="border-t border-surface-border pt-4">
                <Link
                  href="/account"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-3 py-3 text-base font-medium text-gray-900 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
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
