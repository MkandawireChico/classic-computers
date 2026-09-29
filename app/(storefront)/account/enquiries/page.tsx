import Link from "next/link";
import { getMyEnquiries } from "@/lib/data/account-enquiries";
import { Badge } from "@/components/ui/badge";

export default async function AccountEnquiriesPage() {
  const enquiries = await getMyEnquiries();

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-gray-900">Enquiries</h1>
      {enquiries.length === 0 ? (
        <p className="empty-state">
          No enquiries yet.{" "}
          <Link href="/contact" className="text-brand-600 hover:underline">
            Contact us
          </Link>
          .
        </p>
      ) : (
        <div className="divide-y divide-surface-border rounded-card border border-surface-border">
          {enquiries.map((e) => (
            <div key={e.id} className="p-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="font-medium capitalize text-gray-900">{e.topic}</span>
                <Badge variant="neutral">{e.status}</Badge>
              </div>
              <p className="mt-1 text-gray-600">{e.message}</p>
              <p className="mt-1 text-xs text-gray-400">
                {new Date(e.created_at).toLocaleDateString("en-MW", { timeZone: "Africa/Blantyre" })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
