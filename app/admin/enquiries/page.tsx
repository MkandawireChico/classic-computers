import Link from "next/link";
import { requirePermission } from "@/lib/auth/permissions";
import { listGeneralEnquiries, listCorporateEnquiries } from "@/lib/data/admin/enquiries";
import { GeneralEnquiryRow } from "@/components/admin/general-enquiry-row";
import { CorporateEnquiryRow } from "@/components/admin/corporate-enquiry-row";
import { Pagination } from "@/components/storefront/pagination";

export default async function AdminEnquiriesPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  await requirePermission("customers.read");

  const tab = typeof searchParams.tab === "string" ? searchParams.tab : "general";
  const status = typeof searchParams.status === "string" ? searchParams.status : undefined;
  const page = typeof searchParams.page === "string" ? Number(searchParams.page) : 1;

  const generalResult = tab === "general" ? await listGeneralEnquiries(status, page, 25) : null;
  const corporateResult = tab === "corporate" ? await listCorporateEnquiries(status, page, 25) : null;

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-gray-900">Enquiries</h1>

      <div className="mb-4 flex gap-2 border-b border-surface-border">
        <Link href="/admin/enquiries?tab=general" className={`px-3 py-2 text-sm ${tab === "general" ? "border-b-2 border-brand-500 font-medium text-gray-900" : "text-gray-500"}`}>
          General
        </Link>
        <Link href="/admin/enquiries?tab=corporate" className={`px-3 py-2 text-sm ${tab === "corporate" ? "border-b-2 border-brand-500 font-medium text-gray-900" : "text-gray-500"}`}>
          Corporate
        </Link>
      </div>

      {tab === "general" && generalResult ? (
        <>
          <div className="rounded-card border border-surface-border">
            {generalResult.items.length === 0 ? (
              <p className="p-6 text-center text-sm text-gray-500">No enquiries found.</p>
            ) : (
              generalResult.items.map((e) => <GeneralEnquiryRow key={e.id} enquiry={e} />)
            )}
          </div>
          <Pagination page={generalResult.page} pageSize={generalResult.pageSize} total={generalResult.total} basePath="/admin/enquiries" searchParams={searchParams} />
        </>
      ) : null}

      {tab === "corporate" && corporateResult ? (
        <>
          <div className="rounded-card border border-surface-border">
            {corporateResult.items.length === 0 ? (
              <p className="p-6 text-center text-sm text-gray-500">No corporate enquiries found.</p>
            ) : (
              corporateResult.items.map((e) => <CorporateEnquiryRow key={e.id} enquiry={e} />)
            )}
          </div>
          <Pagination page={corporateResult.page} pageSize={corporateResult.pageSize} total={corporateResult.total} basePath="/admin/enquiries" searchParams={searchParams} />
        </>
      ) : null}
    </div>
  );
}
