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

  const displayName = (customer.full_name ?? "").trim() || customer.email || "Unnamed customer";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{displayName}</h1>
        <p className="text-sm text-gray-500">
          Customer since {new Date(customer.created_at).toLocaleDateString("en-MW", { timeZone: "Africa/Blantyre" })}
        </p>
        <Badge variant={customer.account_status === "active" ? "success" : "warning"} className="mt-2">
          Account: {customer.account_status}
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Contact</CardTitle>
          </CardHeader>
          {customer.phone ? <p className="text-sm text-gray-700">{customer.phone}</p> : null}
          {customer.email ? <p className="text-sm text-gray-700">{customer.email}</p> : null}
          {customer.referral_code ? <p className="mt-2 text-xs text-gray-500">Referral code: {customer.referral_code}</p> : null}
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

      <div className="grid gap-6 xl:grid-cols-2">
        <Card>
          <CardHeader><CardTitle>Rental activity</CardTitle></CardHeader>
          {customer.rentals.length === 0 ? <p className="text-sm text-gray-500">No rental activity.</p> : (
            <div className="divide-y divide-surface-border">
              {customer.rentals.map((rental) => (
                <Link key={rental.id} href={`/admin/rentals/${rental.id}`} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm hover:bg-surface-muted">
                  <span className="font-medium text-gray-900">{rental.product_name ?? "Rental booking"}</span>
                  <span className="text-gray-500">{new Date(rental.created_at).toLocaleDateString("en-MW", { timeZone: "Africa/Blantyre" })}</span>
                  <Badge variant="neutral">{rental.status.replace(/_/g, " ")}</Badge>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader><CardTitle>Repair activity</CardTitle></CardHeader>
          {customer.repairs.length === 0 ? <p className="text-sm text-gray-500">No repair activity.</p> : (
            <div className="divide-y divide-surface-border">
              {customer.repairs.map((repair) => (
                <Link key={repair.id} href={`/admin/repairs/${repair.id}`} className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm hover:bg-surface-muted">
                  <span className="font-medium text-gray-900">{repair.ticket_number} · {repair.device_type}{repair.brand ? ` ${repair.brand}` : ""}{repair.model ? ` ${repair.model}` : ""}</span>
                  <span className="text-gray-500">{new Date(repair.created_at).toLocaleDateString("en-MW", { timeZone: "Africa/Blantyre" })}</span>
                  <Badge variant="neutral">{repair.status.replace(/_/g, " ")}</Badge>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <CardHeader><CardTitle>Enquiry history</CardTitle></CardHeader>
          {customer.enquiries.length === 0 ? <p className="text-sm text-gray-500">No linked enquiries.</p> : (
            <div className="divide-y divide-surface-border">
              {customer.enquiries.map((enquiry) => (
                <Link key={enquiry.id} href="/admin/enquiries" className="flex flex-wrap items-center justify-between gap-2 py-3 text-sm hover:bg-surface-muted">
                  <span className="font-medium capitalize text-gray-900">{enquiry.topic.replace(/_/g, " ")}</span>
                  <span className="text-gray-500">{new Date(enquiry.created_at).toLocaleDateString("en-MW", { timeZone: "Africa/Blantyre" })}</span>
                  <Badge variant="neutral">{enquiry.status.replace(/_/g, " ")}</Badge>
                </Link>
              ))}
            </div>
          )}
        </Card>
      </div>

      <p className="text-xs text-gray-400">
        Customer account credentials, password hashes, tokens and private authentication metadata are not displayed.
      </p>
    </div>
  );
}
