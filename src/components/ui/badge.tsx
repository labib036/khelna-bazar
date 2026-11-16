import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | "primary"
    | "brand"
    | "secondary"
    | "accent"
    | "sun"
    | "warning"
    | "coral"
    | "danger"
    | "mint"
    | "success"
    | "neutral"
    | "outline"
    | "amber"
    | "red"
    | "joy"
    | "safety"
    | "pill-trust";
  size?: "sm" | "md" | "lg";
  dot?: boolean;
  onRemove?: () => void;
}

export function Badge({
  className,
  variant = "primary",
  size = "sm",
  dot = false,
  onRemove,
  children,
  ...props
}: BadgeProps) {
  const variants = {
    primary:
      "bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 font-bold",
    brand:
      "bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 font-bold",
    red:
      "bg-[var(--primary)] text-[var(--on-primary)] font-extrabold shadow-xs",
    secondary:
      "bg-[var(--surface-elevated)] text-[var(--text-muted)] border border-[var(--border)] font-semibold",
    amber:
      "bg-[var(--secondary-container)] text-[var(--on-secondary-fixed)] font-extrabold shadow-xs",
    sun:
      "bg-[var(--secondary-container)] text-[var(--on-secondary-fixed)] font-extrabold shadow-xs",
    warning:
      "bg-[var(--warning-subtle)] text-[var(--warning)] border border-[var(--warning)]/30 font-extrabold",
    coral:
      "bg-[var(--primary)]/10 text-[var(--primary)] border border-[var(--primary)]/20 font-bold",
    danger:
      "bg-[var(--danger-subtle)] text-[var(--danger)] border border-[var(--danger)]/25 font-bold",
    accent:
      "bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/25 font-bold",
    joy:
      "bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/30 font-bold",
    mint:
      "bg-[var(--success-subtle)] text-[var(--success)] border border-[var(--success)]/25 font-bold",
    success:
      "bg-[var(--success-subtle)] text-[var(--success)] border border-[var(--success)]/25 font-bold",
    safety:
      "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold",
    neutral:
      "bg-[var(--surface-elevated)] text-[var(--text-primary)] font-bold border border-[var(--border)] shadow-xs",
    outline:
      "border border-[var(--border)] text-[var(--text-muted)] bg-transparent font-medium",
    "pill-trust":
      "bg-[var(--surface-container-high)] text-[var(--primary)] font-bold border border-[var(--primary)]/10 shadow-xs",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-[10px] leading-tight",
    md: "px-2.5 py-1 text-xs leading-tight",
    lg: "px-3 py-1.5 text-xs font-bold leading-tight",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full uppercase tracking-wider transition-colors select-none",
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {dot && (
        <span
          className="w-1.5 h-1.5 rounded-full bg-current shrink-0 animate-pulse"
          aria-hidden="true"
        />
      )}
      <span>{children}</span>
      {onRemove && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-0.5 -mr-0.5 p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Remove badge"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </span>
  );
}
