import { redirect } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/auth/current-user";
import { getCustomerReviewableTransactions } from "@/lib/services/reviews";
import { getMyReviewStatuses } from "@/lib/data/customer-reviews";
import { ReviewSubmissionForm, type ReviewableTransaction } from "@/components/storefront/review-submission-form";
import type { ReviewType } from "@/types/catalog";

type SearchParams = Record<string, string | string[] | undefined>;

interface ReviewCandidate extends ReviewableTransaction {
  productId?: string;
  transactionKey: string;
}

function firstValue(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function reviewHref(transaction: ReviewCandidate): string {
  const query = new URLSearchParams({
    type: transaction.type,
    transactionId: transaction.id,
  });
  if (transaction.productId) query.set("productId", transaction.productId);
  return `/account/reviews/write?${query.toString()}`;
}

function getCandidates(transactions: Awaited<ReturnType<typeof getCustomerReviewableTransactions>>): ReviewCandidate[] {
  return [
    ...transactions.orders.flatMap((order: any) =>
      order.order_items.map((item: any) => ({
        id: order.id,
        type: "product" as ReviewType,
        reference: `Order #${order.order_number}`,
        description: item.product_name_snapshot,
        date: order.created_at,
        productId: item.product_id,
        imageUrl: item.image_url,
        transactionKey: `${order.id}:${item.product_id}`,
      })),
    ),
    ...transactions.rentals.map((rental: any) => ({
      id: rental.id,
      type: "rental" as ReviewType,
      reference: `Rental #${rental.id.slice(0, 8)}`,
      description: rental.rental_products?.products?.name || "Rental equipment",
      date: rental.created_at,
      imageUrl: rental.image_url,
      transactionKey: rental.id,
    })),
    ...transactions.repairs.map((repair: any) => ({
      id: repair.id,
      type: "repair" as ReviewType,
      reference: repair.ticket_number,
      description: `${repair.device_type}${repair.brand ? ` - ${repair.brand}` : ""}${repair.model ? ` ${repair.model}` : ""}`,
      date: repair.created_at,
      transactionKey: repair.id,
    })),
  ];
}

export default async function WriteReviewPage({ searchParams }: { searchParams: SearchParams }) {
  const user = await getCurrentUser();
  if (!user) redirect("/sign-in?redirectTo=%2Faccount%2Freviews%2Fwrite");

  const eligibleTransactions = await getCustomerReviewableTransactions(user.id);
  const candidates = getCandidates(eligibleTransactions);
  const requestedType = firstValue(searchParams.type);
  const requestedId = firstValue(searchParams.transactionId);
  const requestedProductId = firstValue(searchParams.productId);
  const supportedType = ["product", "rental", "repair"].includes(requestedType ?? "")
    ? requestedType as ReviewType
    : undefined;
  const selected = supportedType && requestedId
    ? candidates.find((candidate) =>
        candidate.type === supportedType
        && candidate.id === requestedId
        && (supportedType !== "product" || candidate.productId === requestedProductId))
    : undefined;

  const reviewStatuses = await getMyReviewStatuses({
    orderIds: supportedType === "product" && requestedId ? [requestedId] : candidates.filter((item) => item.type === "product").map((item) => item.id),
    rentalIds: supportedType === "rental" && requestedId ? [requestedId] : candidates.filter((item) => item.type === "rental").map((item) => item.id),
    repairIds: supportedType === "repair" && requestedId ? [requestedId] : candidates.filter((item) => item.type === "repair").map((item) => item.id),
  });

  let existingReview;
  if (supportedType === "product" && requestedId && requestedProductId) {
    existingReview = reviewStatuses.products[`${requestedId}:${requestedProductId}`];
  } else if (supportedType === "rental" && requestedId) {
    existingReview = reviewStatuses.rentals[requestedId];
  } else if (supportedType === "repair" && requestedId) {
    existingReview = reviewStatuses.repairs[requestedId];
  }

  const returnHref = selected?.type === "product"
    ? `/account/orders/${selected.id}`
    : selected?.type === "rental"
      ? `/account/rentals/${selected.id}`
      : selected?.type === "repair"
        ? `/account/repairs/${selected.id}`
        : "/account/reviews";

  return (
    <div className="space-y-6">
      <header className="border-b border-slate-200 pb-5">
        <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-800">Customer feedback</p>
        <h1 className="mt-1 text-2xl font-extrabold text-slate-950 sm:text-3xl">Write a Review</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
          Share honest feedback about a completed purchase, returned rental or completed repair. Reviews are checked before they appear publicly.
        </p>
      </header>

      {selected && (existingReview?.status === "pending" || existingReview?.status === "approved" || existingReview?.status === "hidden") ? (
        <section className="rounded-xl border border-slate-200 bg-white p-5 sm:p-7">
          <div className="flex items-center gap-4">
            {selected.imageUrl ? <Image src={selected.imageUrl} alt="" width={72} height={72} className="h-[72px] w-[72px] rounded-lg border border-slate-200 object-contain" /> : null}
            <div>
              <p className="font-bold text-slate-950">{selected.description}</p>
              <p className="mt-1 text-sm text-slate-600">{selected.reference}</p>
            </div>
          </div>
          <p className="mt-5 font-semibold text-slate-900">
            {existingReview.status === "pending" ? "Your review is pending moderation."
              : existingReview.status === "approved" ? "Your review has been approved."
                : "This review is currently hidden."}
          </p>
          {existingReview.admin_response ? <p className="mt-2 text-sm text-slate-600">Response from Classic Computers: {existingReview.admin_response}</p> : null}
          <Link href={returnHref} className="mt-4 inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700 hover:bg-slate-50">Return to transaction</Link>
        </section>
      ) : selected ? (
        <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7">
          {existingReview?.status === "rejected" && existingReview.admin_response ? (
            <p className="mb-5 rounded-lg bg-rose-50 p-3 text-sm text-rose-900">
              Your previous review was rejected. Moderator feedback: {existingReview.admin_response}
            </p>
          ) : null}
          <ReviewSubmissionForm transaction={selected} returnHref={returnHref} />
        </section>
      ) : candidates.length > 0 ? (
        <section className="space-y-3">
          <h2 className="font-bold text-slate-950">Choose a completed transaction</h2>
          <p className="text-sm text-slate-600">Select the transaction entry you want to review. Each product in an order can be reviewed separately.</p>
          {candidates.map((candidate) => (
            <article key={`${candidate.type}:${candidate.transactionKey}`} className="flex flex-col gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm sm:flex-row sm:items-center">
              {candidate.imageUrl ? <Image src={candidate.imageUrl} alt="" width={64} height={64} className="h-16 w-16 rounded-lg border border-slate-200 object-contain" /> : null}
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-slate-950">{candidate.description}</p>
                <p className="mt-1 text-sm text-slate-600">{candidate.reference} · {candidate.type}</p>
              </div>
              <Link href={reviewHref(candidate)} className="inline-flex min-h-11 shrink-0 items-center justify-center rounded-lg bg-brand-700 px-4 text-sm font-semibold text-white hover:bg-brand-800">
                Write review
              </Link>
            </article>
          ))}
        </section>
      ) : (
        <section className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center sm:p-8">
          <h2 className="font-bold text-slate-950">
            {requestedType && requestedId ? "This transaction is not ready for review" : "No completed transactions are ready for review"}
          </h2>
          <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Product reviews require a completed order, rental reviews require a returned booking, and repair reviews require a completed ticket. The transaction must belong to your signed-in account. If it has just been completed, refresh this page.
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-3">
            <Link href="/account/orders" className="inline-flex min-h-11 items-center rounded-lg bg-brand-700 px-4 text-sm font-semibold text-white">Check orders</Link>
            <Link href="/account/rentals" className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700">Check rentals</Link>
            <Link href="/account/repairs" className="inline-flex min-h-11 items-center rounded-lg border border-slate-300 px-4 text-sm font-semibold text-slate-700">Check repairs</Link>
          </div>
        </section>
      )}
    </div>
  );
}
