import { notFound } from "next/navigation";
import { getMyRepairById } from "@/lib/data/account-repairs";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/format/money";

export default async function AccountRepairDetailPage({ params }: { params: { id: string } }) {
  const repair = await getMyRepairById(params.id);
  if (!repair) notFound();

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900">{repair.ticket_number}</h1>
      <Badge variant="info" className="mt-2">
        {repair.status.replace(/_/g, " ")}
      </Badge>

      <div className="mt-4 space-y-1 text-sm text-gray-700">
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
        {repair.quote_amount ? (
          <p>
            <span className="font-medium text-gray-900">Quote:</span> {formatMoney(repair.quote_amount)}
            {repair.quote_approved_at ? " (approved)" : " (awaiting your approval)"}
          </p>
        ) : null}
      </div>

      {repair.updates.length > 0 ? (
        <div className="mt-6">
          <h2 className="mb-2 text-sm font-semibold text-gray-900">Updates</h2>
          <ol className="space-y-2 border-l border-surface-border pl-4">
            {repair.updates.map((u, i) => (
              <li key={i} className="text-sm text-gray-600">
                {u.note}
                <span className="ml-2 text-xs text-gray-400">
                  {new Date(u.created_at).toLocaleDateString("en-MW", { timeZone: "Africa/Blantyre" })}
                </span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  );
}
