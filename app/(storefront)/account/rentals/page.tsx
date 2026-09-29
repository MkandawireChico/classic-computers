import Link from "next/link";
import { getMyRentals } from "@/lib/data/account-rentals";
import { Badge } from "@/components/ui/badge";

export default async function AccountRentalsPage() {
  const rentals = await getMyRentals();

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-gray-900">Rentals</h1>
      {rentals.length === 0 ? (
        <p className="empty-state">
          No rentals yet.{" "}
          <Link href="/rentals" className="text-brand-600 hover:underline">
            Request a rental
          </Link>
          .
        </p>
      ) : (
        <div className="divide-y divide-surface-border rounded-card border border-surface-border">
          {rentals.map((r) => (
            <Link key={r.id} href={`/account/rentals/${r.id}`} className="flex items-center justify-between p-3 text-sm hover:bg-surface-muted">
              <div>
                <p className="font-medium text-gray-900">{r.product_name ?? "Rental"}</p>
                <p className="text-xs text-gray-500">
                  <a className="text-brand-600 hover:underline">{r.start_date} – {r.end_date}</a> · Qty {r.quantity}
                </p>
              </div>
              <Badge variant="info">{r.status}</Badge>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
