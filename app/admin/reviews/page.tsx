import { requirePermission } from "@/lib/auth/permissions";
import { listAdminReviews } from "@/lib/data/admin/reviews";
import { ReviewRow } from "@/components/admin/review-row";
import { Pagination } from "@/components/storefront/pagination";

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Record<string, string | string[] | undefined>;
}) {
  await requirePermission("reviews.read");
  const status = typeof searchParams.status === "string" ? searchParams.status : undefined;
  const page = typeof searchParams.page === "string" ? Number(searchParams.page) : 1;

  const result = await listAdminReviews(status, page, 25);

  return (
    <div>
      <h1 className="mb-4 text-xl font-semibold text-gray-900">Reviews</h1>

      <form className="mb-4 flex gap-2" method="get">
        <select name="status" defaultValue={status ?? ""} className="rounded-card border border-surface-border px-3 py-1.5 text-sm">
          <option value="">All statuses</option>
          <option value="pending">Pending</option>
          <option value="approved">Approved</option>
          <option value="rejected">Rejected</option>
          <option value="hidden">Hidden</option>
        </select>
        <button type="submit" className="rounded-card border border-surface-border px-3 py-1.5 text-sm hover:bg-surface-muted">
          Filter
        </button>
      </form>

      <div className="rounded-card border border-surface-border">
        {result.items.length === 0 ? (
          <p className="p-6 text-center text-sm text-gray-500">No reviews found.</p>
        ) : (
          result.items.map((review) => <ReviewRow key={review.id} review={review} />)
        )}
      </div>

      <Pagination page={result.page} pageSize={result.pageSize} total={result.total} basePath="/admin/reviews" searchParams={searchParams} />
    </div>
  );
}
