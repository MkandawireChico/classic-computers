import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/permissions";
import { getAdminRepairById, listTechnicians, listRepairStockOptions } from "@/lib/data/admin/repairs";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { RepairDetailControls } from "@/components/admin/repair-detail-controls";
import { AdminDetailHeader } from "@/components/admin/admin-detail-header";
import { RepairQuotationBuilder } from "@/components/admin/repair-quotation-builder";

export default async function AdminRepairDetailPage({ params }: { params: { id: string } }) {
  await requirePermission("repairs.read");

  const [repair, technicians, stockOptions] = await Promise.all([
    getAdminRepairById(params.id),
    listTechnicians(),
    listRepairStockOptions(),
  ]);
  if (!repair) notFound();

  return (
    <div className="space-y-6">
      <AdminDetailHeader
        eyebrow="Operations · Service desk"
        title={repair.ticket_number}
        description={`${repair.device_type}${repair.brand ? " · " + repair.brand : ""}${repair.model ? " " + repair.model : ""}. Booked ${new Date(repair.created_at).toLocaleString("en-MW", { timeZone: "Africa/Blantyre" })}.`}
        backHref="/admin/repairs"
        backLabel="Back to repairs"
      />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Device &amp; problem</CardTitle>
          </CardHeader>
          <div className="space-y-1 text-sm text-gray-700">
            <p>
              <span className="font-medium text-gray-900">Device:</span> {repair.device_type}
              {repair.brand ? ` · ${repair.brand}` : ""} {repair.model ?? ""}
            </p>
            {repair.serial_number ? (
              <p>
                <span className="font-medium text-gray-900">Serial:</span> {repair.serial_number}
              </p>
            ) : null}
            <p>
              <span className="font-medium text-gray-900">Problem:</span> {repair.problem_description}
            </p>
            {repair.accessories_received ? (
              <p>
                <span className="font-medium text-gray-900">Accessories:</span> {repair.accessories_received}
              </p>
            ) : null}
          </div>

          <div className="mt-6">
            <RepairDetailControls repair={repair} technicians={technicians} stockOptions={stockOptions} />
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <p className="font-semibold text-slate-950">{repair.customer_name ?? repair.guest_name ?? "Customer details unavailable"}</p>
          {repair.guest_phone ? <a href={`tel:${repair.guest_phone}`} className="mt-2 inline-flex min-h-9 items-center rounded-lg border border-slate-200 px-3 py-2 text-sm font-semibold text-brand-700 hover:border-brand-300">{repair.guest_phone}</a> : <p className="mt-1 text-xs text-slate-500">No phone number recorded.</p>}
          {repair.guest_email ? <a href={`mailto:${repair.guest_email}`} className="mt-2 block break-all text-sm font-medium text-brand-700 hover:text-brand-900">{repair.guest_email}</a> : null}
          {!repair.customer_id ? <p className="mt-2 text-xs text-slate-500">Guest booking</p> : <p className="mt-2 text-xs text-slate-500">Registered customer</p>}
        </Card>
      </div>
      <RepairQuotationBuilder ticketId={repair.id} />
    </div>
  );
}
