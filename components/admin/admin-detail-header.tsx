import Link from "next/link";

export function AdminDetailHeader({
  eyebrow,
  title,
  description,
  backHref,
  backLabel,
}: {
  eyebrow: string;
  title: string;
  description: string;
  backHref: string;
  backLabel: string;
}) {
  return (
    <header className="mb-6 border-b border-slate-200 pb-5">
      <Link href={backHref} className="inline-flex min-h-9 items-center gap-2 rounded-lg text-xs font-bold text-slate-500 transition hover:text-brand-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
        <span aria-hidden="true">←</span>{backLabel}
      </Link>
      <div className="mt-4">
        <p className="text-[10px] font-extrabold uppercase tracking-[0.2em] text-brand-700">{eyebrow}</p>
        <h1 className="mt-1.5 break-words text-2xl font-extrabold tracking-[-0.045em] text-navy-950 sm:text-3xl">{title}</h1>
        <p className="mt-1.5 max-w-2xl text-sm leading-6 text-slate-500">{description}</p>
      </div>
    </header>
  );
}
