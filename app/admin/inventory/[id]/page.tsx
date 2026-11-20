import { notFound } from "next/navigation";
import { requirePermission } from "@/lib/auth/permissions";
import { getInventoryDetail, getInventoryMovements } from "@/lib/data/admin/inventory";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { StockAdjustForm } from "@/components/admin/stock-adjust-form";
import { AdminDetailHeader } from "@/components/admin/admin-detail-header";

export default async function InventoryDetailPage({ params }: { params: { id: string } }) {
  await requirePermission("inventory.read");

  const [inventory, movements] = await Promise.all([
    getInventoryDetail(params.id),
    getInventoryMovements(params.id),
  ]);
  if (!inventory) notFound();

  return (
    <div className="space-y-6">
      <AdminDetailHeader
        eyebrow="Commerce · Stock control"
        title={inventory.products?.name ?? "Inventory item"}
        description={`${inventory.product_variants?.name ? inventory.product_variants.name + " · " : ""}${inventory.quantity_on_hand} units on hand · ${inventory.status.replace(/_/g, " ")}. Review stock adjustments and movement history.`}
        backHref="/admin/inventory"
        backLabel="Back to inventory"
      />

      <Card>
        <CardHeader>
          <CardTitle>Adjust stock</CardTitle>
        </CardHeader>
        <StockAdjustForm inventoryId={inventory.id} />
        <p className="mt-2 text-xs text-gray-500">
          Every adjustment is recorded in the movement history below — there is no way to silently
          overwrite a quantity.
        </p>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Movement history</CardTitle>
        </CardHeader>
        {movements.length === 0 ? (
          <p className="text-sm text-gray-500">No movements recorded yet.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead className="text-left text-xs uppercase text-gray-500">
                <tr>
                  <th className="p-2">Date</th>
                  <th className="p-2">Type</th>
                  <th className="p-2">Change</th>
                  <th className="p-2">Reference</th>
                  <th className="p-2">Recorded by</th>
                  <th className="p-2">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {movements.map((m) => (
                  <tr key={m.id}>
                    <td className="p-2 text-gray-500">
                      {new Date(m.created_at).toLocaleString("en-MW", { timeZone: "Africa/Blantyre" })}
                    </td>
                    <td className="p-2">
                      <Badge variant="neutral">{m.movement_type.replace(/_/g, " ")}</Badge>
                    </td>
                    <td className={`p-2 font-medium ${m.quantity_delta < 0 ? "text-status-danger" : "text-status-success"}`}>
                      {m.quantity_delta > 0 ? "+" : ""}
                      {m.quantity_delta}
                    </td>
                    <td className="p-2 text-gray-500">
                      <span className="block">{m.reference_type ?? "Manual"}</span>
                      {m.reference_id ? <span className="block max-w-[150px] truncate font-mono text-[10px]" title={m.reference_id}>{m.reference_id}</span> : null}
                    </td>
                    <td className="p-2 text-gray-600">{m.actor_name ?? "Staff member"}</td>
                    <td className="p-2 text-gray-600">{m.note ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>
    </div>
  );
}
