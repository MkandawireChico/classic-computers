import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { getMyStudentVerification } from "@/lib/data/account-student";
import { getAccountDashboardSummary } from "@/lib/data/account-dashboard";
import { formatMoney } from "@/lib/format/money";

const STATUS_VARIANT: Record<string, "neutral" | "success" | "warning" | "danger" | "info"> = {
  pending: "warning",
  confirmed: "info",
  processing: "info",
  ready_for_pickup: "info",
  out_for_delivery: "info",
  completed: "success",
  cancelled: "danger",
  refunded: "neutral",
};

export default async function AccountOverviewPage() {
  const [summary, studentVerification] = await Promise.all([
    getAccountDashboardSummary(),
    getMyStudentVerification(),
  ]);

  const metrics = [
    { label: "Orders", value: summary.totalOrderCount, href: "/account/orders", detail: "All purchases" },
    { label: "Active repairs", value: summary.activeRepairCount, href: "/account/repairs", detail: "Being serviced" },
    { label: "Active rentals", value: summary.activeRentalCount, href: "/account/rentals", detail: "Current bookings" },
  ].filter((metric) => metric.value !== null);
  const studentStatus = studentVerification?.status ?? summary.studentStatus ?? "none";

  return (
    <div className="space-y-8">
      <header className="relative overflow-hidden rounded-[1.75rem] border border-slate-800 bg-slate-950 p-6 text-white shadow-[0_18px_45px_rgba(15,23,42,0.12)] sm:p-8">\n        <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border-[36px] border-cyan-300/10" />\n        <div aria-hidden="true" className="pointer-events-none absolute -bottom-28 right-24 h-56 w-56 rounded-full bg-blue-500/10 blur-3xl" />\n        <div className="relative">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.22em] text-cyan-300">Customer dashboard</p>
        <h1 className="mt-2 text-2xl font-extrabold leading-tight tracking-[-0.04em] text-white sm:text-4xl">
          {summary.displayName ? `Welcome back, ${summary.displayName}` : "Your account overview"}
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-300 sm:text-base">
          Your Classic Computers account, all in one place. Manage purchases and services, explore student benefits and stay updated.
        </p>
        <Link href="/account/profile" className="mt-5 inline-flex min-h-11 items-center rounded-xl border border-white/20 bg-white/10 px-4 text-sm font-bold text-white transition-colors hover:bg-white/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
          Manage your profile
        </Link>
      </header>

      {metrics.length > 0 ? (
        <section aria-label="Account summary" className="grid gap-3 sm:grid-cols-3">
          {metrics.map((metric) => (
            <Link key={metric.label} href={metric.href} className="group flex min-h-[112px] items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white px-4 py-4 shadow-[0_3px_14px_rgba(15,23,42,0.04)] transition-all hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 sm:p-5">
              <span>
                <span className="block text-sm font-semibold text-slate-700">{metric.label}</span>
                <span className="mt-1 block text-xs text-slate-500">{metric.detail}</span>
              </span>
              <span className="text-3xl font-extrabold tracking-tight tabular-nums text-slate-950 group-hover:text-brand-900">{metric.value}</span>
            </Link>
          ))}
        </section>
      ) : null}

      <section aria-labelledby="account-shortcuts-heading">
        <div className="mb-3">
          <h2 id="account-shortcuts-heading" className="text-lg font-extrabold text-slate-950">Useful shortcuts</h2>
          <p className="mt-1 text-sm text-slate-600">Pick up where you need to.</p>
        </div>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-5">
          {[
            ["/shop", "Browse products"],
            ["/repairs/book", "Book a repair"],
            ["/rentals", "Explore rentals"],
            ["/account/student-verification", "Student benefits"],
            ["/corporate/enquire", "Request a quote"],
          ].map(([href, label]) => (
            <Link key={href as string} href={href as string} className="flex min-h-[76px] items-center rounded-xl border border-slate-200 bg-white px-3 py-3 text-sm font-bold text-slate-800 shadow-[0_2px_10px_rgba(15,23,42,0.03)] transition-all hover:-translate-y-0.5 hover:border-cyan-300 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600 sm:px-4">
              <span>{label}</span>
            </Link>
          ))}
        </div>
      </section>

      {(summary.unreadNotificationCount ?? 0) > 0 || studentVerification?.status === "pending" ? (
        <section aria-label="Account notices" className="space-y-2">
          {studentVerification?.status === "pending" ? (
            <Link href="/account/student-verification" className="flex min-h-12 items-center rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950 transition-colors hover:border-amber-300 hover:bg-amber-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-700">
              <span><strong>Student verification pending.</strong> Your application is awaiting staff review.</span>
            </Link>
          ) : null}
          {summary.unreadNotificationCount !== null && summary.unreadNotificationCount > 0 ? (
            <Link href="/account/notifications" className="flex min-h-12 items-center rounded-lg border border-sky-200 bg-sky-50 px-4 py-3 text-sm text-sky-950 transition-colors hover:border-sky-300 hover:bg-sky-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sky-700">
              <span><strong>{summary.unreadNotificationCount} unread notification{summary.unreadNotificationCount === 1 ? "" : "s"}.</strong> Review your latest account updates.</span>
            </Link>
          ) : null}
        </section>
      ) : null}

      {/* Dashboard Cards */}
      <div>
        <h2 className="text-lg font-extrabold text-slate-950">Recent activity</h2>
        <p className="mt-1 text-sm text-slate-600">A quick look at your orders, services and account benefits.</p>
      </div>
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Recent Orders */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Recent Orders</h3>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
              <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
              <path d="M3 6h18" />
              <path d="M16 10a4 4 0 0 1-8 0" />
            </svg>
          </div>
          {summary.recentOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3 text-slate-300">
                <circle cx="9" cy="21" r="1" />
                <circle cx="20" cy="21" r="1" />
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
              </svg>
              <p className="text-sm font-medium text-slate-600">No orders yet</p>
              <p className="mt-1 text-xs text-slate-400">Your order history will appear here</p>
              <Link
                href="/shop"
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-100"
              >
                Browse Shop
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {summary.recentOrders.map((o) => (
                <Link
                  key={o.id}
                  href={`/account/orders/${o.id}`}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm transition-colors hover:bg-slate-100 hover:border-slate-200"
                >
                  <div>
                    <p className="font-semibold text-slate-900">{o.order_number}</p>
                    <p className="mt-1 text-xs text-slate-600">{formatMoney(o.total)} · {new Date(o.created_at).toLocaleDateString("en-MW", { timeZone: "Africa/Blantyre", day: "numeric", month: "short", year: "numeric" })}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <Badge variant={STATUS_VARIANT[o.order_status] ?? "neutral"} className="text-xs">{o.order_status.replace(/_/g, " ")}</Badge>
                    <span className="text-xs capitalize text-slate-500">Payment: {o.payment_status.replace(/_/g, " ")}</span>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <Link href="/account/orders" className="mt-4 inline-flex min-h-9 items-center rounded-md px-2 text-xs font-semibold text-brand-700 underline decoration-brand-300 underline-offset-4 transition-colors hover:text-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600">
            View all orders
          </Link>
        </div>

        {/* Active Repairs */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Active Repairs</h3>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          </div>
          {summary.activeRepairs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3 text-slate-300">
                <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
              </svg>
              <p className="text-sm font-medium text-slate-600">No active repairs</p>
              <p className="mt-1 text-xs text-slate-400">Track your repair requests here</p>
              <Link
                href="/repairs/book"
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700 transition-colors hover:bg-brand-100"
              >
                Book a Repair
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {summary.activeRepairs.map((r) => (
                <Link
                  key={r.id}
                  href={`/account/repairs/${r.id}`}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm transition-colors hover:bg-slate-100 hover:border-slate-200"
                >
                  <div className="min-w-0">
                    <p className="break-all font-semibold text-slate-950">{r.ticket_number}</p>
                    <p className="mt-1 text-xs text-slate-600">{r.device_type} · {new Date(r.created_at).toLocaleDateString("en-MW", { timeZone: "Africa/Blantyre", day: "numeric", month: "short" })}</p>
                  </div>
                  <Badge variant="info" className="shrink-0 text-xs">{r.status.replace(/_/g, " ")}</Badge>
                </Link>
              ))}
            </div>
          )}
          <Link href="/account/repairs" className="mt-4 inline-flex min-h-9 items-center rounded-md px-2 text-xs font-semibold text-brand-700 underline decoration-brand-300 underline-offset-4 transition-colors hover:text-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600">
            View all repairs
          </Link>
        </div>

        {/* Active Rentals */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Active Rentals</h3>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
            </svg>
          </div>
          {summary.activeRentals.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3 text-slate-300">
                <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
                <line x1="16" x2="16" y1="2" y2="6" />
                <line x1="8" x2="8" y1="2" y2="6" />
                <line x1="3" x2="21" y1="10" y2="10" />
              </svg>
              <p className="text-sm font-medium text-slate-600">No active rentals</p>
              <p className="mt-1 text-xs text-slate-400">Rent equipment for your needs</p>
              <Link
                href="/rentals"
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-brand-50 px-3 py-2 text-xs font-semibold text-brand-700 transition-colors hover:bg-violet-100"
              >
                Browse Rentals
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {summary.activeRentals.map((r) => (
                <Link
                  key={r.id}
                  href={`/account/rentals/${r.id}`}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm transition-colors hover:bg-slate-100 hover:border-slate-200"
                >
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-slate-900">{r.product_name ?? "Rental"}</p>
                    <p className="mt-1 text-xs text-slate-600">{r.start_date} to {r.end_date} · Qty {r.quantity}</p>
                  </div>
                  <Badge variant="info" className="shrink-0 text-xs">{r.status.replace(/_/g, " ")}</Badge>
                </Link>
              ))}
            </div>
          )}
          <Link href="/account/rentals" className="mt-4 inline-flex min-h-9 items-center rounded-md px-2 text-xs font-semibold text-brand-700 underline decoration-brand-300 underline-offset-4 transition-colors hover:text-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600">
            View all rentals
          </Link>
        </div>

        {/* Student & Referrals */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Student & Referrals</h3>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between rounded-xl bg-slate-50 p-3">
              <span className="text-sm font-medium text-slate-600">Student status</span>
              <Badge variant={studentStatus === "approved" ? "success" : studentStatus === "pending" ? "warning" : studentStatus === "rejected" ? "danger" : "neutral"} className="text-xs">
                {studentStatus.replace(/_/g, " ")}
              </Badge>
            </div>
            {summary.referralCode ? (
              <div className="rounded-xl bg-brand-50 p-3">
                <p className="text-xs font-semibold uppercase text-brand-600">Your referral code</p>
                <p className="mt-1 font-mono text-lg font-bold text-brand-900">{summary.referralCode}</p>
                <p className="mt-1 text-xs text-brand-600">Share with friends to earn rewards</p>
              </div>
            ) : null}
          </div>
          <div className="mt-4 flex gap-2">
            <Link
              href="/account/student-verification"
              className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200"
            >
              Verify Student
            </Link>
            <Link
              href="/account/referrals"
              className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-3 py-2 text-xs font-semibold text-slate-700 transition-colors hover:bg-slate-200"
            >
              Referrals
            </Link>
          </div>
        </div>

        {/* Recent Enquiries */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Recent Enquiries</h3>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
              <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
            </svg>
          </div>
          {summary.recentEnquiries.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3 text-slate-300">
                <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
              </svg>
              <p className="text-sm font-medium text-slate-600">No enquiries yet</p>
              <p className="mt-1 text-xs text-slate-400">Request quotes and ask questions</p>
              <Link
                href="/contact"
                className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-amber-50 px-3 py-2 text-xs font-semibold text-amber-700 transition-colors hover:bg-amber-100"
              >
                Contact Us
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {summary.recentEnquiries.map((e) => (
                <div key={e.id} className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 p-3 text-sm">
                  <span className="min-w-0"><span className="block font-semibold capitalize text-slate-900">{e.topic}</span><span className="mt-1 block text-xs text-slate-500">{new Date(e.created_at).toLocaleDateString("en-MW", { timeZone: "Africa/Blantyre", day: "numeric", month: "short", year: "numeric" })}</span></span>
                  <Badge variant="neutral" className="text-xs">
                    {e.status}
                  </Badge>
                </div>
              ))}
            </div>
          )}
          <Link href="/account/enquiries" className="mt-4 inline-flex min-h-9 items-center rounded-md px-2 text-xs font-semibold text-brand-700 underline decoration-brand-300 underline-offset-4 transition-colors hover:text-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600">
            View all enquiries
          </Link>
        </div>

        {/* Notifications */}
        <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">Notifications</h3>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400">
              <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
              <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
            </svg>
          </div>
          {summary.unreadNotificationCount !== null && summary.unreadNotificationCount > 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                  <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                </svg>
              </div>
              <p className="text-sm font-bold text-slate-900">{summary.unreadNotificationCount} unread</p>
              <p className="mt-1 text-xs text-slate-500">notification{summary.unreadNotificationCount === 1 ? "" : "s"}</p>
            </div>
          ) : summary.unreadNotificationCount === null ? (
            <div className="py-6 text-center">
              <p className="text-sm font-medium text-slate-700">Notification count unavailable</p>
              <p className="mt-1 text-xs text-slate-500">Open notifications to check for recent updates.</p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-3 text-slate-300">
                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
              </svg>
              <p className="text-sm font-medium text-slate-600">All caught up</p>
              <p className="mt-1 text-xs text-slate-400">No new notifications</p>
            </div>
          )}
          <Link href="/account/notifications" className="mt-4 inline-flex min-h-9 items-center rounded-md px-2 text-xs font-semibold text-brand-700 underline decoration-brand-300 underline-offset-4 transition-colors hover:text-brand-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600">
            View notifications
          </Link>
        </div>
      </div>
    </div>
  );
}
