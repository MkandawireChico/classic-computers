import Link from "next/link";
import Image from "next/image";
import { MobileNav } from "./mobile-nav";
import { SearchBox } from "./search-box";
import { getCartItemCount } from "@/lib/data/cart";
import { getSiteMedia } from "@/lib/data/site-media";
import { getPublicStorageUrl } from "@/lib/storage";

const NAV_LINKS = [
  { href: "/", label: "Home" },
  { href: "/shop", label: "Shop" },
  { href: "/shop/laptop-computers", label: "Laptops" },
  { href: "/rentals", label: "Rentals" },
  { href: "/repairs", label: "Repairs" },
  { href: "/student-deals", label: "Student Deals" },
  { href: "/corporate", label: "Corporate supply" },
  { href: "/about", label: "About" },
  { href: "/contact", label: "Contact" },
];

const NAV_LINK_STYLES = [
  "hover:bg-brand-50 hover:text-brand-800 focus-visible:ring-brand-600",
  "hover:bg-emerald-50 hover:text-emerald-800 focus-visible:ring-emerald-600",
  "hover:bg-amber-50 hover:text-amber-900 focus-visible:ring-amber-600",
  "hover:bg-violet-50 hover:text-violet-800 focus-visible:ring-violet-600",
  "hover:bg-rose-50 hover:text-rose-800 focus-visible:ring-rose-600",
];

export async function SiteHeader() {
  const [cartCount, logoMedia] = await Promise.all([getCartItemCount(), getSiteMedia("logo" as any, 1)]);
  const logo = logoMedia[0] ?? null;
  const logoUrl = logo ? getPublicStorageUrl("site-media", logo.storage_path) : null;

  return (
    <header className="sticky top-0 z-30 border-b border-emerald-100 bg-gradient-to-r from-amber-50/80 via-white to-emerald-50/80 backdrop-blur-sm">
      <div className="section-shell flex h-16 items-center justify-between gap-2 sm:gap-3 lg:h-[4.5rem]">
        <Link href="/" className="group flex min-w-0 shrink-0 items-center gap-2.5 sm:gap-3">
          {logoUrl ? (
            <div className="relative h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-emerald-100 bg-white p-0.5 shadow-sm transition-shadow group-hover:shadow-md sm:h-12 sm:w-12">
              <Image src={logoUrl} alt={logo?.alt_text ?? "Classic Computers logo"} fill className="object-contain" />
            </div>
          ) : (
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-600 text-base font-bold text-white shadow-sm sm:h-12 sm:w-12 sm:text-lg">
              CC
            </span>
          )}
          <span className="min-w-0 leading-none">
            <span className="block truncate text-lg font-black uppercase tracking-[-0.04em] text-slate-900 transition-colors group-hover:text-emerald-900 sm:text-xl lg:text-2xl">
              Classic <span className="text-emerald-700">Computers</span>
            </span>
            <span className="mt-1 inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-[0.16em] text-amber-800 sm:text-[10px]">
              <span aria-hidden="true" className="h-1.5 w-1.5 rounded-full bg-amber-500" />
              Blantyre
            </span>
          </span>
        </Link>

        <div className="hidden min-w-0 flex-1 justify-end lg:flex">
          <div className="w-full max-w-md">
            <SearchBox />
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-2 sm:gap-3">
          <Link
            href="/cart"
            aria-label={`Cart${cartCount > 0 ? `, ${cartCount} item${cartCount === 1 ? "" : "s"}` : ""}`}
            className="relative rounded-md border border-surface-border bg-white p-2.5 text-gray-700 shadow-sm transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
          >
            <CartIcon />
            {cartCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-brand-600 px-1 text-[10px] font-semibold text-white">
                {cartCount > 99 ? "99+" : cartCount}
              </span>
            ) : null}
          </Link>
          <Link
            href="/account"
            aria-label="Account"
            className="hidden rounded-md border border-surface-border bg-white p-2.5 text-gray-700 shadow-sm transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 sm:block"
          >
            <AccountIcon />
          </Link>
          <MobileNav links={NAV_LINKS} />
        </div>
      </div>

      <nav aria-label="Primary" className="hidden border-t border-emerald-100 bg-gradient-to-r from-amber-50/70 via-white to-emerald-50/70 lg:block">
        <div className="section-shell flex flex-wrap items-center justify-center gap-1 py-2">
          {NAV_LINKS.map((link, index) => (
            <Link
              key={link.href}
              href={link.href}
              className={`inline-flex min-h-9 items-center rounded-full px-3 py-1.5 text-sm font-semibold text-slate-700 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 ${NAV_LINK_STYLES[index % NAV_LINK_STYLES.length]}`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </nav>

      <div className="border-t border-surface-border bg-white/95 px-4 py-2 md:px-6 lg:hidden">
        <SearchBox />
      </div>
    </header>
  );
}

function CartIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M3 3h2l.4 2M7 13h10l3-7H6M7 13L5.4 5M7 13l-1.5 6h11M9 21a1 1 0 100-2 1 1 0 000 2zM18 21a1 1 0 100-2 1 1 0 000 2z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
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
