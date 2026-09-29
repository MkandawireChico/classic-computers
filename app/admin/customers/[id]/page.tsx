import { notFound } from "next/navigation";
import Link from "next/link";
import { requirePermission } from "@/lib/auth/permissions";
import { getAdminCustomerById } from "@/lib/data/admin/customers";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/format/money";

export default async function AdminCustomerDetailPage({ params }: { params: { id: string } }) {
  await requirePermission("customers.read");
  const customer = await getAdminCustomerById(params.id);
  if (!customer) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{customer.full_name ?? "Unnamed customer"}</h1>
        <p className="text-sm text-gray-500">
          Customer since {new Date(customer.created_at).toLocaleDateString("en-MW", { timeZone: "Africa/Blantyre" })}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          {customer.phone ? <p className="text-sm text-gray-700">{customer.phone}</p> : null}
          {customer.email ? <p className="text-sm text-gray-700">{customer.email}</p> : null}
          <p className="mt-2 text-xs text-gray-500">Referral code: {customer.referral_code}</p>
          <Badge variant={customer.student_status === "approved" ? "success" : "neutral"} className="mt-2">
            Student: {customer.student_status}
          </Badge>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Addresses</CardTitle>
          </CardHeader>
          {customer.addresses.length === 0 ? (
            <p className="text-sm text-gray-500">No saved addresses.</p>
          ) : (
            <div className="space-y-2">
              {customer.addresses.map((a) => (
                <div key={a.id} className="text-sm text-gray-700">
                  {a.label ? <span className="font-medium">{a.label}: </span> : null}
                  {a.line1}, {a.city}
                  {a.is_default ? <Badge variant="info" className="ml-1">Default</Badge> : null}
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Wishlist</CardTitle>
          </CardHeader>
          <p className="text-sm text-gray-700">{customer.wishlistCount} item(s) saved</p>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Orders</CardTitle>
        </CardHeader>
        {customer.orders.length === 0 ? (
          <p className="text-sm text-gray-500">No orders yet.</p>
        ) : (
          <div className="divide-y divide-surface-border">
            {customer.orders.map((o) => (
              <Link
                key={o.id}
                href={`/admin/orders/${o.id}`}
                className="flex items-center justify-between py-2 text-sm hover:bg-surface-muted"
              >
                <span className="font-medium text-gray-900">{o.order_number}</span>
                <span className="text-gray-500">
                  {new Date(o.created_at).toLocaleDateString("en-MW", { timeZone: "Africa/Blantyre" })}
                </span>
                <span className="text-gray-900">{formatMoney(o.total)}</span>
                <Badge variant="neutral">{o.order_status.replace(/_/g, " ")}</Badge>
              </Link>
            ))}
          </div>
        )}
      </Card>

      <p className="text-xs text-gray-400">
        Repair and rental history will appear here once those admin modules exist. No
        impersonation or password/token access is available for customer accounts, by design.
      </p>
    </div>
  );
}
