import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/permissions";
import { getAdminRentalById } from "@/lib/data/admin/rentals";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { RentalDetailControls } from "@/components/admin/rental-detail-controls";

export default async function AdminRentalDetailPage({ params }: { params: { id: string } }) {
  await requirePermission("rentals.read");
  const rental = await getAdminRentalById(params.id);
  if (!rental) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{rental.product_name ?? "Rental"}</h1>
        <p className="text-sm text-gray-500">
            <span className="font-medium text-slate-900">Dates:</span>{" "}
            <a className="text-brand-600 hover:underline">{rental.start_date} – {rental.end_date}</a> · Qty {rental.quantity}
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Manage rental</CardTitle>
          </CardHeader>
          <RentalDetailControls rental={rental} />

          {rental.statusHistory.length > 0 ? (
            <div className="mt-6">
              <p className="mb-2 text-xs font-medium uppercase text-gray-500">History</p>
              <ol className="space-y-1 border-l border-surface-border pl-4 text-sm text-gray-600">
                {rental.statusHistory.map((e, i) => (
                  <li key={i}>
                    {e.to_status} — {new Date(e.created_at).toLocaleString("en-MW", { timeZone: "Africa/Blantyre" })}
                  </li>
                ))}
              </ol>
            </div>
          ) : null}
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <p className="text-sm text-gray-900">{rental.customer_name ?? rental.guest_name ?? "—"}</p>
          {rental.guest_phone ? <p className="text-sm text-gray-600">{rental.guest_phone}</p> : null}
          {rental.guest_email ? <p className="text-sm text-gray-600">{rental.guest_email}</p> : null}
          {!rental.customer_id ? <p className="mt-1 text-xs text-gray-400">Guest booking</p> : null}
        </Card>
      </div>
    </div>
  );
}
