import type { ReactNode } from "react";
import { Badge } from "@/components/ui/badge";

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
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
      <header className="border-b border-surface-border pb-6">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">{eyebrow}</p>
        <h1 className="mt-2 text-3xl font-bold text-gray-900">{title}</h1>
        {description ? <p className="mt-3 max-w-2xl text-base leading-7 text-gray-600">{description}</p> : null}
      </header>
      <div className="mt-7 space-y-5">{children}</div>
    </div>
  );
}

export function ContentPending({
  title = "Content pending",
  detail,
  legalReview = false,
}: {
  title?: string;
  detail: string;
  legalReview?: boolean;
}) {
  return (
    <section className="rounded-card border border-amber-200 bg-amber-50/70 p-5 sm:p-6" aria-label={title}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-gray-900">{title}</h2>
        <Badge variant="warning">{legalReview ? "Pending legal review" : "Awaiting business input"}</Badge>
      </div>
      <p className="mt-3 text-sm leading-6 text-gray-700">{detail}</p>
    </section>
  );
}