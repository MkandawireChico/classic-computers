import { type HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

type AlertVariant = "info" | "success" | "warning" | "danger";

const variantStyles: Record<AlertVariant, string> = {
  info: "border-status-info-border bg-status-info-surface text-status-info",
  success: "border-status-success-border bg-status-success-surface text-status-success",
  warning: "border-status-warning-border bg-status-warning-surface text-status-warning",
  danger: "border-status-danger-border bg-status-danger-surface text-status-danger",
};

export interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: AlertVariant;
}

export function Alert({ className, variant = "info", role, ...props }: AlertProps) {
  return (
    <div
      role={role ?? (variant === "danger" ? "alert" : "status")}
      className={cn("rounded-card border px-4 py-3 text-sm", variantStyles[variant], className)}
      {...props}
    />
  );
}
