export default function ShopLoading() {
  return (
    <main aria-busy="true" aria-label="Loading shop" className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      <div className="h-4 w-24 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
      <header className="mt-4 border-b border-surface-border pb-6">
        <div className="h-3 w-40 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
        <div className="mt-3 h-9 w-36 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
        <div className="mt-3 h-4 max-w-md animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
        <div className="mt-5 h-11 max-w-2xl animate-pulse rounded-md bg-slate-100 motion-reduce:animate-none" />
      </header>
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[230px_minmax(0,1fr)] lg:gap-8">
        <aside className="space-y-5 border-b border-surface-border pb-5 lg:border-b-0 lg:border-r lg:pb-0 lg:pr-6">
          {["w-24", "w-32", "w-20", "w-28"].map((width, index) => (
            <div key={index} className="space-y-3 border-b border-surface-border pb-4">
              <div className={`h-4 ${width} animate-pulse rounded bg-slate-200 motion-reduce:animate-none`} />
              <div className="h-8 w-full animate-pulse rounded bg-slate-100 motion-reduce:animate-none" />
            </div>
          ))}
        </aside>
        <section aria-hidden="true">
          <div className="mb-4 flex justify-between border-b border-surface-border pb-4">
            <div className="h-5 w-28 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
            <div className="h-10 w-40 animate-pulse rounded-md bg-slate-100 motion-reduce:animate-none" />
          </div>
          <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }, (_, index) => (
              <div key={index} className="overflow-hidden rounded-md border border-surface-border bg-white">
                <div className="aspect-[4/3] animate-pulse bg-slate-100 motion-reduce:animate-none" />
                <div className="space-y-3 p-3 sm:p-4">
                  <div className="h-3 w-16 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
                  <div className="h-4 w-full animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
                  <div className="h-5 w-24 animate-pulse rounded bg-slate-200 motion-reduce:animate-none" />
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
