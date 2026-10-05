import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost" | "danger";
type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-600 text-white shadow-[0_14px_26px_-18px_rgba(31,86,240,0.9)] hover:bg-brand-700 active:bg-brand-800 focus-visible:ring-brand-500 disabled:bg-brand-300",
  secondary:
    "bg-slate-900 text-white shadow-[0_14px_26px_-20px_rgba(15,23,42,0.8)] hover:bg-slate-800 active:bg-slate-950 focus-visible:ring-slate-700",
  outline:
    "border border-surface-border bg-white text-slate-800 shadow-sm hover:border-brand-300 hover:bg-brand-50 focus-visible:ring-brand-500",
  ghost: "bg-slate-100 text-slate-700 hover:bg-slate-200 active:bg-slate-300 focus-visible:ring-brand-500",
  danger: "bg-status-danger text-white shadow-[0_14px_26px_-18px_rgba(180,35,24,0.8)] hover:bg-red-800 active:bg-red-900 focus-visible:ring-status-danger",
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-9 px-3 text-xs md:text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-6 text-base",
};

/**
 * Base button for the whole app (storefront + admin). Every interactive
 * action should render through this component rather than a bare <button>,
 * so focus states, disabled states, and loading states stay consistent.
 */
export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, disabled, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-card font-semibold tracking-[0.01em] transition-all duration-150",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
          "disabled:cursor-not-allowed disabled:opacity-60 disabled:shadow-none",
          variantStyles[variant],
          sizeStyles[size],
          className,
        )}
        aria-busy={isLoading || undefined}
        {...props}
      >
        {isLoading ? (
          <span
            className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
            aria-hidden="true"
          />
        ) : null}
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
