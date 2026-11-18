import type { ReactNode } from "react";
import Link from "next/link";

export function ContentPage({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#f4f6f7]">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8 lg:py-16">
        <nav aria-label="Breadcrumb" className="mb-5 text-sm text-slate-500">
          <Link
            href="/"
            className="rounded-sm font-medium hover:text-brand-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-600"
          >
            Home
          </Link>
          <span aria-hidden="true" className="mx-2 text-slate-400">
            /
          </span>
          <span aria-current="page" className="font-semibold text-slate-700">
            {title}
          </span>
        </nav>
        <header className="relative isolate overflow-hidden rounded-[1.75rem] bg-[#081827] p-6 text-white shadow-xl shadow-slate-900/10 sm:p-9 lg:p-12">
          <div
            aria-hidden="true"
            className="absolute -right-20 -top-24 h-72 w-72 rounded-full border-[32px] border-cyan-300/10"
          />
          <div className="relative max-w-3xl">
            <p className="inline-flex rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.16em] text-cyan-200">
              {eyebrow}
            </p>
            <h1 className="mt-4 text-3xl font-semibold leading-[1.05] tracking-[-0.045em] text-white sm:text-4xl lg:text-5xl">
              {title}
            </h1>
            {description ? (
              <p className="mt-4 max-w-2xl text-base leading-7 text-slate-300 sm:text-lg">
                {description}
              </p>
            ) : null}
          </div>
        </header>
        <div className="mt-7 space-y-6 sm:mt-9 sm:space-y-8">{children}</div>
      </div>
    </div>
  );
}

export function ContentSection({
  id,
  title,
  children,
  className = "",
}: {
  id?: string;
  title: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section
      id={id}
      aria-labelledby={id ? `${id}-heading` : undefined}
      className={`scroll-mt-28 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-7 ${className}`}
    >
      <h2
        id={id ? `${id}-heading` : undefined}
        className="text-xl font-extrabold text-slate-900 sm:text-2xl"
      >
        {title}
      </h2>
      <div className="mt-4 space-y-4 text-sm leading-7 text-slate-600 sm:text-base">{children}</div>
    </section>
  );
}

export function ContentCallout({
  title,
  children,
  tone = "brand",
}: {
  title: string;
  children: ReactNode;
  tone?: "brand" | "amber";
}) {
  const styles =
    tone === "amber"
      ? "border-amber-200 bg-amber-50 text-amber-950"
      : "border-brand-200 bg-brand-50 text-brand-950";

  return (
    <aside className={`rounded-2xl border p-5 sm:p-6 ${styles}`}>
      <h2 className="font-extrabold">{title}</h2>
      <div className="mt-2 text-sm leading-6">{children}</div>
    </aside>
  );
}
