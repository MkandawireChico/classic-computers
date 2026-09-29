import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/permissions";
import { getAdminRepairById, listTechnicians } from "@/lib/data/admin/repairs";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { RepairDetailControls } from "@/components/admin/repair-detail-controls";

export default async function AdminRepairDetailPage({ params }: { params: { id: string } }) {
  await requirePermission("repairs.read");

  const [repair, technicians] = await Promise.all([getAdminRepairById(params.id), listTechnicians()]);
  if (!repair) notFound();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-gray-900">{repair.ticket_number}</h1>
        <p className="text-sm text-gray-500">
          {new Date(repair.created_at).toLocaleString("en-MW", { timeZone: "Africa/Blantyre" })}
        </p>
      </div>

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
            <RepairDetailControls repair={repair} technicians={technicians} />
          </div>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Customer</CardTitle>
          </CardHeader>
          <p className="text-sm text-gray-900">{repair.customer_name ?? repair.guest_name ?? "—"}</p>
          {repair.guest_phone ? <p className="text-sm text-gray-600">{repair.guest_phone}</p> : null}
          {repair.guest_email ? <p className="text-sm text-gray-600">{repair.guest_email}</p> : null}
          {!repair.customer_id ? <p className="mt-1 text-xs text-gray-400">Guest booking</p> : null}
        </Card>
      </div>
    </div>
  );
}
