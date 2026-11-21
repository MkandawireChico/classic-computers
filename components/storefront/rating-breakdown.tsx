import type { ReviewRatingDistribution } from "@/lib/data/reviews";

export function RatingBreakdown({
  distribution,
  total,
}: {
  distribution: ReviewRatingDistribution;
  total: number;
}) {
  return (
    <div role="group" aria-label="Rating distribution" className="space-y-2">
      {([5, 4, 3, 2, 1] as const).map((rating) => {
        const count = distribution[rating];
        const width = total ? (count / total) * 100 : 0;
        return (
          <div key={rating} className="grid grid-cols-[3rem_minmax(0,1fr)_2.5rem] items-center gap-2 text-xs">
            <span className="whitespace-nowrap text-slate-600">{rating} star{rating !== 1 ? "s" : ""}</span>
            <div
              className="h-2 overflow-hidden rounded-full bg-slate-200"
              role="progressbar"
              aria-label={`${rating} star reviews`}
              aria-valuemin={0}
              aria-valuemax={total}
              aria-valuenow={count}
            >
              <div className="h-full rounded-full bg-amber-400" style={{ width: `${width}%` }} />
            </div>
            <span className="text-right tabular-nums text-slate-500">{count}</span>
          </div>
        );
      })}
    </div>
  );
}
