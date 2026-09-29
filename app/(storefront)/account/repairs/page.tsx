import Link from "next/link";
import { getMyRepairs } from "@/lib/data/account-repairs";
import { Badge } from "@/components/ui/badge";

export default async function AccountRepairsPage() {
  const repairs = await getMyRepairs();

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-gray-900">Repairs</h1>
      {repairs.length === 0 ? (
        <p className="empty-state">
          No repairs yet.{" "}
          <Link href="/repairs/book" className="text-brand-600 hover:underline">
            Book a repair
          </Link>
          .
        </p>
      ) : (
        <div className="divide-y divide-surface-border rounded-card border border-surface-border">
          {repairs.map((r) => (
            <Link
              key={r.id}
              href={`/account/repairs/${r.id}`}
              className="flex items-center justify-between p-3 text-sm hover:bg-surface-muted"
            >
              <div>
                <p className="font-medium text-gray-900">{r.ticket_number}</p>
                <p className="text-xs text-gray-500">{r.device_type}</p>
              </div>
              <Badge variant="info">{r.status.replace(/_/g, " ")}</Badge>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
