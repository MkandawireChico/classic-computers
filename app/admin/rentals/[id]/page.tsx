import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/permissions";
import { getAdminRentalById } from "@/lib/data/admin/rentals";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { RentalDetailControls } from "@/components/admin/rental-detail-controls";
import { AdminDetailHeader } from "@/components/admin/admin-detail-header";

export default async function AdminRentalDetailPage({ params }: { params: { id: string } }) {
  await requirePermission("rentals.read");
  const rental = await getAdminRentalById(params.id);
  if (!rental) notFound();

  return (
    <div className="space-y-6">
      <AdminDetailHeader
        eyebrow="Operations · Equipment hire"
        title={rental.product_name ?? "Rental booking"}
        description={`Rental period: ${rental.start_date} to ${rental.end_date} · Quantity: ${rental.quantity}. Manage approval, handover, return and exceptions.`}
        backHref="/admin/rentals"
        backLabel="Back to rentals"
      />

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
                  <li key={i} className="py-1">
                    <p className="font-medium text-slate-800">
                      {e.from_status ? `${e.from_status.replace(/_/g, " ")} → ` : ""}{e.to_status.replace(/_/g, " ")}
                    </p>
                    <p className="text-xs text-slate-500">
                      {new Date(e.created_at).toLocaleString("en-MW", { timeZone: "Africa/Blantyre" })}
                      {" · "}{e.changed_by_name ?? "System"}
                    </p>
                    {e.note ? <p className="mt-1 text-sm text-slate-600">{e.note}</p> : null}
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
          <p className="font-semibold text-slate-950">{rental.customer_name ?? rental.guest_name ?? "Customer details unavailable"}</p>
          {rental.guest_phone ? <a href={`tel:${rental.guest_phone}`} className="mt-2 inline-flex min-h-9 items-center rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-brand-700 hover:border-brand-300">{rental.guest_phone}</a> : <p className="mt-1 text-xs text-slate-500">No phone number recorded.</p>}
          {rental.guest_email ? <a href={`mailto:${rental.guest_email}`} className="mt-2 block break-all text-sm font-medium text-brand-700 hover:text-brand-900">{rental.guest_email}</a> : null}
          {!rental.customer_id ? <p className="mt-2 text-xs text-slate-500">Guest booking</p> : <p className="mt-2 text-xs text-slate-500">Registered customer</p>}
        </Card>
      </div>
    </div>
  );
}
