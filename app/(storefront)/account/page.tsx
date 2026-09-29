import Link from "next/link";
import { signOut } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { getAccountDashboardSummary } from "@/lib/data/account-dashboard";
import { formatMoney } from "@/lib/format/money";

export default async function AccountOverviewPage() {
  const summary = await getAccountDashboardSummary();

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Account</CardTitle>
        </CardHeader>
        <form action={signOut}>
          <Button type="submit" variant="outline" size="sm">
            Sign out
          </Button>
        </form>
      </Card>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Recent orders</CardTitle>
          </CardHeader>
          {summary.recentOrders.length === 0 ? (
            <p className="empty-state">No orders yet.</p>
          ) : (
            <div className="space-y-1">
              {summary.recentOrders.map((o) => (
                <Link key={o.id} href={`/account/orders/${o.id}`} className="flex items-center justify-between rounded-card p-1.5 text-sm hover:bg-surface-muted">
                  <span className="text-gray-900">{o.order_number}</span>
                  <span className="text-gray-500">{formatMoney(o.total)}</span>
                  <Badge variant="neutral">{o.order_status.replace(/_/g, " ")}</Badge>
                </Link>
              ))}
            </div>
          )}
          <Link href="/account/orders" className="mt-2 inline-block text-xs text-brand-600 hover:underline">
            View all orders
          </Link>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active repairs</CardTitle>
          </CardHeader>
          {summary.activeRepairs.length === 0 ? (
            <p className="empty-state">No active repairs.</p>
          ) : (
            <div className="space-y-1">
              {summary.activeRepairs.map((r) => (
                <Link key={r.id} href={`/account/repairs/${r.id}`} className="flex items-center justify-between rounded-card p-1.5 text-sm hover:bg-surface-muted">
                  <span className="text-gray-900">{r.ticket_number}</span>
                  <Badge variant="info">{r.status.replace(/_/g, " ")}</Badge>
                </Link>
              ))}
            </div>
          )}
          <Link href="/account/repairs" className="mt-2 inline-block text-xs text-brand-600 hover:underline">
            View all repairs
          </Link>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Active rentals</CardTitle>
          </CardHeader>
          {summary.activeRentals.length === 0 ? (
            <p className="empty-state">No active rentals.</p>
          ) : (
            <div className="space-y-1">
              {summary.activeRentals.map((r) => (
                <Link key={r.id} href={`/account/rentals/${r.id}`} className="flex items-center justify-between rounded-card p-1.5 text-sm hover:bg-surface-muted">
                  <span className="text-gray-900">{r.product_name ?? "Rental"}</span>
                  <Badge variant="info">{r.status}</Badge>
                </Link>
              ))}
            </div>
          )}
          <Link href="/account/rentals" className="mt-2 inline-block text-xs text-brand-600 hover:underline">
            View all rentals
          </Link>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Student &amp; referrals</CardTitle>
          </CardHeader>
          <p className="text-sm text-gray-700">
            Student status:{" "}
            <Badge variant={summary.studentStatus === "approved" ? "success" : "neutral"}>
              {summary.studentStatus ?? "none"}
            </Badge>
          </p>
          {summary.referralCode ? (
            <p className="mt-2 text-sm text-gray-700">
              Referral code: <span className="font-mono">{summary.referralCode}</span>
            </p>
          ) : null}
          <div className="mt-2 flex gap-3 text-xs">
            <Link href="/account/student-verification" className="text-brand-600 hover:underline">
              Student verification
            </Link>
            <Link href="/account/referrals" className="text-brand-600 hover:underline">
              Referrals
            </Link>
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent enquiries</CardTitle>
          </CardHeader>
          {summary.recentEnquiries.length === 0 ? (
            <p className="empty-state">No enquiries yet.</p>
          ) : (
            <div className="space-y-1">
              {summary.recentEnquiries.map((e) => (
                <div key={e.id} className="flex items-center justify-between rounded-card p-1.5 text-sm">
                  <span className="capitalize text-gray-900">{e.topic}</span>
                  <Badge variant="neutral">{e.status}</Badge>
                </div>
              ))}
            </div>
          )}
          <Link href="/account/enquiries" className="mt-2 inline-block text-xs text-brand-600 hover:underline">
            View all enquiries
          </Link>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
          </CardHeader>
          <p className="text-sm text-gray-700">
            {summary.unreadNotificationCount > 0
              ? `${summary.unreadNotificationCount} unread notification${summary.unreadNotificationCount === 1 ? "" : "s"}`
              : "You're all caught up."}
          </p>
          <Link href="/account/notifications" className="mt-2 inline-block text-xs text-brand-600 hover:underline">
            View notifications
          </Link>
        </Card>
      </div>
    </div>
  );
}
