export default function AccountLoading() {
  return (
    <div className="section-shell flex-1 space-y-6 pb-12 pt-5 sm:pb-16 sm:pt-8" aria-label="Loading your account">
      <div className="flex items-center gap-3 border-b border-slate-200 pb-5 sm:pb-6">
        <div className="h-11 w-11 animate-pulse rounded-full bg-slate-200 sm:h-12 sm:w-12" />
        <div className="space-y-2">
          <div className="h-3 w-28 animate-pulse rounded bg-slate-200" />
          <div className="h-4 w-40 animate-pulse rounded bg-slate-200" />
        </div>
      </div>
      <div className="grid gap-6 lg:grid-cols-[232px_minmax(0,1fr)] lg:gap-9">
        <div className="h-12 animate-pulse rounded-lg bg-slate-200 lg:h-[34rem]" />
        <main className="min-w-0 space-y-6" aria-hidden="true">
          <div className="h-32 animate-pulse rounded-xl bg-slate-200" />
          <div className="grid gap-3 sm:grid-cols-3">
            {[0, 1, 2].map((item) => <div key={item} className="h-20 animate-pulse rounded-xl bg-slate-200" />)}
          </div>
          <div className="h-56 animate-pulse rounded-xl bg-slate-200" />
        </main>
      </div>
    </div>
  );
}
