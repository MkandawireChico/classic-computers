import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/current-user";

const ACCOUNT_LINKS = [
  { href: "/account", label: "Overview" },
  { href: "/account/orders", label: "Orders" },
  { href: "/account/repairs", label: "Repairs" },
  { href: "/account/rentals", label: "Rentals" },
  { href: "/account/student-verification", label: "Student Verification" },
  { href: "/account/enquiries", label: "Enquiries" },
  { href: "/account/referrals", label: "Referrals" },
  { href: "/account/notifications", label: "Notifications" },
  { href: "/account/wishlist", label: "Wishlist" },
  { href: "/compare", label: "Compare" },
  { href: "/account/addresses", label: "Addresses" },
  { href: "/account/profile", label: "Profile" },
  { href: "/account/settings", label: "Settings" },
];

export default async function AccountLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();

  // Defense in depth alongside middleware (which already redirects
  // unauthenticated requests to /account/*) — this layout refuses to
  // render for anyone without a session even if middleware were bypassed.
  if (!user) redirect("/sign-in?redirectTo=/account");

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-[220px_minmax(0,1fr)]">
        <nav
          aria-label="Account"
          className="flex gap-1 overflow-x-auto rounded-card border border-surface-border bg-surface p-2 md:flex-col md:overflow-visible"
        >
          {ACCOUNT_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="whitespace-nowrap rounded-card px-3 py-2.5 text-sm font-medium text-gray-700 transition-colors hover:bg-surface-muted hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div>{children}</div>
      </div>
    </div>
  );
}
