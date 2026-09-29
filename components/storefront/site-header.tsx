import Link from "next/link";
import { MobileNav } from "./mobile-nav";
import { SearchBox } from "./search-box";
import { getCartItemCount } from "@/lib/data/cart";

const NAV_LINKS = [
  { href: "/shop", label: "Shop" },
  { href: "/shop/laptop-computers", label: "Laptops" },
  { href: "/shop?q=phone", label: "Phones" },
  { href: "/rentals", label: "Rentals" },
  { href: "/repairs", label: "Repairs" },
  { href: "/corporate", label: "Corporate" },
  { href: "/student-deals", label: "Student Deals" },
];

export async function SiteHeader() {
  const cartCount = await getCartItemCount();
  return (
    <header className="sticky top-0 z-30 border-b border-surface-border bg-white/95 backdrop-blur-sm">
      <div className="mx-auto flex h-20 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex shrink-0 items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-brand-600 text-sm font-bold text-white shadow-sm">
            CC
          </span>
          <span className="leading-none">
            <span className="block text-base font-semibold text-gray-900">Classic Computers</span>
            <span className="block text-[10px] font-medium uppercase tracking-[0.18em] text-gray-500">Blantyre</span>
          </span>
        </Link>

        <nav aria-label="Primary" className="hidden flex-1 items-center justify-center gap-6 lg:flex">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-gray-700 transition-colors hover:text-brand-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden flex-1 justify-end md:flex">
          <div className="w-full max-w-lg">
            <SearchBox />
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-3">
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

      <div className="border-t border-surface-border bg-white/95 px-4 py-2 md:hidden">
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
