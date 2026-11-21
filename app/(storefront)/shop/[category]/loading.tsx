export default function CategoryLoading() {
  return (
    <main aria-busy="true" aria-label="Loading product category" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="h-4 w-36 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
      <header className="mt-5 border-b border-surface-border pb-6">
        <div className="h-3 w-28 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
        <div className="mt-3 h-9 w-64 max-w-full animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
        <div className="mt-3 h-4 max-w-xl animate-pulse rounded bg-slate-100 motion-reduce:animate-none" />
        <div className="mt-5 h-11 max-w-2xl animate-pulse rounded-md bg-slate-100 motion-reduce:animate-none" />
      </header>
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-8">
        <aside className="space-y-5 rounded-xl border border-surface-border bg-white p-4">
          {[0, 1, 2, 3].map((item) => (
            <div key={item} className="space-y-3 border-b border-surface-border pb-4">
              <div className="h-4 w-28 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
              <div className="h-9 w-full animate-pulse rounded bg-slate-100 motion-reduce:animate-none" />
            </div>
          ))}
        </aside>
        <section aria-hidden="true">
          <div className="mb-4 flex items-center justify-between border-b border-surface-border pb-4">
            <div className="h-5 w-32 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
            <div className="h-10 w-36 animate-pulse rounded-md bg-slate-100 motion-reduce:animate-none" />
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 xl:gap-6">
            {Array.from({ length: 6 }, (_, index) => (
              <div key={index} className="overflow-hidden rounded-xl border border-surface-border bg-white">
                <div className="aspect-[16/10] animate-pulse bg-slate-100 motion-reduce:animate-none sm:aspect-square" />
                <div className="space-y-3 p-4">
                  <div className="h-3 w-20 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
                  <div className="h-4 w-full animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
                  <div className="h-5 w-28 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
                  <div className="h-10 w-full animate-pulse rounded-lg bg-slate-100 motion-reduce:animate-none" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
