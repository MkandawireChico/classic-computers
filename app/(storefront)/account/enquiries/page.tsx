import Link from "next/link";
import { getMyEnquiries } from "@/lib/data/account-enquiries";
import { Badge } from "@/components/ui/badge";

export default async function AccountEnquiriesPage() {
  const enquiries = await getMyEnquiries();

  return (
    <div className="space-y-6">
      <div className="border-b border-slate-200 pb-5">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-emerald-800">My activity</p>
        <h1 className="mt-1 text-2xl font-extrabold text-slate-950 sm:text-3xl">My enquiries</h1>
        <p className="mt-2 text-sm leading-6 text-slate-600">Follow up on the questions and quote requests you have sent us.</p>
      </div>

      {enquiries.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center sm:p-8">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="mb-4 text-slate-300">
            <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
          </svg>
          <h3 className="text-lg font-bold text-slate-950">No enquiries yet</h3>
          <p className="mt-2 text-sm leading-6 text-slate-600">Your quote requests and questions will be listed here.</p>
          <Link
            href="/contact"
            className="mt-6 inline-flex items-center gap-2 rounded-xl bg-amber-500 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-amber-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
            </svg>
            Contact Us
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {enquiries.map((e) => (
            <div key={e.id} className="rounded-xl border border-slate-200 bg-white p-4 sm:p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-base font-bold capitalize text-slate-950">{e.topic}</p>
                    <Badge variant="neutral" className="text-xs">
                      {e.status}
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-600 line-clamp-2">{e.message}</p>
                  <p className="mt-3 text-xs text-slate-500">
                    Reference {e.id.slice(0, 8)} · {new Date(e.created_at).toLocaleDateString("en-MW", { timeZone: "Africa/Blantyre", year: "numeric", month: "long", day: "numeric" })}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
