import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "neutral" | "success" | "warning" | "danger" | "info";

const variantStyles: Record<BadgeVariant, string> = {
  neutral: "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200",
  success: "bg-emerald-100 text-emerald-800 ring-1 ring-inset ring-emerald-200",
  warning: "bg-amber-100 text-amber-800 ring-1 ring-inset ring-amber-200",
  danger: "bg-rose-100 text-rose-800 ring-1 ring-inset ring-rose-200",
  info: "bg-brand-50 text-brand-800 ring-1 ring-inset ring-brand-200",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] leading-4",
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  );
}
