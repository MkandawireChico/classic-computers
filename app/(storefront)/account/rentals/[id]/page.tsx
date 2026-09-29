import { notFound } from "next/navigation";
import { getMyRentalById } from "@/lib/data/account-rentals";
import { Badge } from "@/components/ui/badge";
import { formatMoney } from "@/lib/format/money";

export default async function AccountRentalDetailPage({ params }: { params: { id: string } }) {
  const rental = await getMyRentalById(params.id);
  if (!rental) notFound();

  return (
    <div>
      <h1 className="text-xl font-semibold text-gray-900">{rental.product_name ?? "Rental"}</h1>
      <Badge variant="info" className="mt-2">
        {rental.status}
      </Badge>

      <div className="mt-4 space-y-1 text-sm text-gray-700">
        <p>
          <span className="font-medium text-slate-900">Dates:</span>{" "}
          <a className="text-brand-600 hover:underline">{rental.start_date} – {rental.end_date}</a>
        </p>
        <p>
          <span className="font-medium text-gray-900">Quantity:</span> {rental.quantity}
        </p>
        {rental.daily_rate ? (
          <p>
            <span className="font-medium text-gray-900">Daily rate:</span> {formatMoney(rental.daily_rate)}
          </p>
        ) : null}
        {rental.deposit_amount ? (
          <p>
            <span className="font-medium text-gray-900">Deposit:</span> {formatMoney(rental.deposit_amount)}
          </p>
        ) : null}
        {rental.total_charge ? (
          <p>
            <span className="font-medium text-gray-900">Total charge:</span> {formatMoney(rental.total_charge)}
          </p>
        ) : null}
        {rental.notes ? (
          <p>
            <span className="font-medium text-gray-900">Notes:</span> {rental.notes}
          </p>
        ) : null}
      </div>

      {rental.statusHistory.length > 0 ? (
        <div className="mt-6">
          <h2 className="mb-2 text-sm font-semibold text-gray-900">Status history</h2>
          <ol className="space-y-2 border-l border-surface-border pl-4">
            {rental.statusHistory.map((event, i) => (
              <li key={i} className="text-sm text-gray-600">
                <span className="font-medium capitalize text-gray-900">{event.to_status}</span>{" "}
                <span className="text-xs text-gray-400">
                  {new Date(event.created_at).toLocaleDateString("en-MW", { timeZone: "Africa/Blantyre" })}
                </span>
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  );
}
