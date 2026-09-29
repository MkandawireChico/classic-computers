import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type BadgeVariant = "neutral" | "success" | "warning" | "danger" | "info";

const variantStyles: Record<BadgeVariant, string> = {
  neutral: "bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-200",
  success: "bg-status-success-surface text-status-success ring-1 ring-inset ring-status-success-border",
  warning: "bg-status-warning-surface text-status-warning ring-1 ring-inset ring-status-warning-border",
  danger: "bg-status-danger-surface text-status-danger ring-1 ring-inset ring-status-danger-border",
  info: "bg-status-info-surface text-status-info ring-1 ring-inset ring-status-info-border",
};

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
}

export function Badge({ className, variant = "neutral", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-md px-2 py-0.5 text-xs font-semibold leading-5",
        variantStyles[variant],
        className,
      )}
      {...props}
    />
  );
}
