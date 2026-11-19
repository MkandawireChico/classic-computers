import Link from "next/link";
import Image from "next/image";
import { getSiteMedia } from "@/lib/data/site-media";
import { getPublicStorageUrl } from "@/lib/storage";
import { MobileNav } from "./mobile-nav";
import { SearchBox } from "./search-box";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getMyPermissions } from "@/lib/auth/permissions";
import { getCartItemCount } from "@/lib/data/cart";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/shop/laptop-computers", label: "Laptops" },
  { href: "/rentals", label: "Rentals" },
  { href: "/repairs", label: "Repairs" },
  { href: "/student-deals", label: "Student deals" },
  { href: "/corporate", label: "Corporate" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

export async function SiteHeader() {
  const [cartCount, logoMedia, user] = await Promise.all([
    getCartItemCount(),
    getSiteMedia("logo", 1),
    getCurrentUser(),
  ]);
  const logo = logoMedia[0] ?? null;
  const logoUrl = logo ? getPublicStorageUrl("site-media", logo.storage_path) : null;
  const permissions = user ? await getMyPermissions() : new Set<string>();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200/80 bg-white/95 shadow-[0_4px_20px_-18px_rgba(16,29,53,0.35)] backdrop-blur-xl">
      <div className="section-shell flex h-[4.5rem] items-center justify-between gap-3 lg:h-[5rem]">
        <Link href="/" className="group flex min-w-0 shrink items-center gap-2.5 sm:shrink-0 sm:gap-3">
          {logoUrl ? (
            <span className="relative block h-12 w-20 shrink-0 overflow-hidden sm:h-14 sm:w-24">
              <Image src={logoUrl} alt={logo?.alt_text ?? "Classic Computers logo"} fill sizes="(max-width: 640px) 80px, 96px" className="object-contain" />
            </span>
          ) : (
            <span aria-hidden="true" className="flex h-12 w-20 shrink-0 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-[10px] font-extrabold tracking-tight text-navy-900 sm:h-14 sm:w-24">CLASSIC</span>
          )}
          <span className="min-w-0 leading-none">
            <span className="block truncate text-base font-extrabold tracking-[-0.045em] text-navy-900 sm:text-lg lg:text-xl">
              Classic <span className="text-brand-600">Computers</span>
            </span>
            <span className="mt-1.5 block text-[9px] font-semibold uppercase tracking-[0.2em] text-slate-500 sm:text-[10px]">
              Blantyre · Malawi
            </span>
          </span>
        </Link>

        <div className="hidden min-w-0 flex-1 justify-end px-5 lg:flex">
          <div className="w-full max-w-md"><SearchBox /></div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          <Link
            href="/cart"
            aria-label={`Cart${cartCount > 0 ? `, ${cartCount} item${cartCount === 1 ? "" : "s"}` : ""}`}
            className="relative inline-flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-navy-800 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <CartIcon />
            {cartCount > 0 ? <span className="absolute -right-1.5 -top-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-bold text-white">{cartCount > 99 ? "99+" : cartCount}</span> : null}
          </Link>
          <Link
            href="/account"
            aria-label="Account"
            className="hidden h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-navy-800 transition-colors hover:border-brand-200 hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 sm:inline-flex"
          >
            <AccountIcon />
          </Link>
          <MobileNav links={NAV_LINKS} isAuthenticated={Boolean(user)} canAccessAdmin={permissions.size > 0} />
        </div>
      </div>

      <div className="hidden border-t border-slate-100 lg:block">
        <nav aria-label="Primary" className="section-shell flex items-center justify-center gap-1 py-2">
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href} className="inline-flex min-h-9 items-center rounded-lg px-3 text-[13px] font-semibold text-slate-600 transition-colors hover:bg-brand-50 hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
              {link.label}
            </Link>
          ))}
        </nav>
      </div>

      <div className="border-t border-slate-100 bg-white px-4 py-2 md:px-6 lg:hidden"><SearchBox /></div>
    </header>
  );
}

function CartIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M3 3h2l.4 2M7 13h10l3-7H6M7 13L5.4 5M7 13l-1.5 6h11M9 21a1 1 0 100-2 1 1 0 000 2zM18 21a1 1 0 100-2 1 1 0 000 2z" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}

function AccountIcon() {
  return <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true"><path d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 21a8 8 0 0116 0" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" /></svg>;
}
