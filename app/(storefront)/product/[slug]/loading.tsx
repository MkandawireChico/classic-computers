export default function ProductLoading() {
  return (
    <main aria-busy="true" aria-label="Loading product details" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="h-4 w-48 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2 lg:gap-12">
        <section aria-hidden="true" className="min-w-0">
          <div className="aspect-[4/3] animate-pulse rounded-2xl border border-surface-border bg-slate-100 motion-reduce:animate-none" />
          <div className="mt-4 flex gap-3">
            {[0, 1, 2, 3].map((item) => (
              <div key={item} className="h-[4.5rem] w-[4.5rem] shrink-0 animate-pulse rounded-xl bg-slate-100 motion-reduce:animate-none" />
            ))}
          </div>
        </section>
        <section aria-hidden="true" className="space-y-5">
          <div className="h-4 w-28 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
          <div className="h-9 w-full max-w-lg animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
          <div className="h-5 w-40 animate-pulse rounded bg-slate-100 motion-reduce:animate-none" />
          <div className="rounded-2xl border border-surface-border p-5">
            <div className="h-3 w-32 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
            <div className="mt-4 h-9 w-48 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
            <div className="mt-3 h-3 w-56 max-w-full animate-pulse rounded bg-slate-100 motion-reduce:animate-none" />
          </div>
          <div className="h-12 w-full animate-pulse rounded-xl bg-slate-100 motion-reduce:animate-none" />
          <div className="h-12 w-full animate-pulse rounded-xl bg-slate-100 motion-reduce:animate-none" />
        </section>
      </div>
      <section aria-hidden="true" className="mt-10 space-y-4">
        <div className="h-7 w-40 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
        <div className="h-24 w-full animate-pulse rounded-2xl bg-slate-100 motion-reduce:animate-none" />
      </section>
    </main>
  );
}
