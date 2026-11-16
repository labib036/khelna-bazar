import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:
    | "primary"
    | "secondary"
    | "outline"
    | "ghost"
    | "danger"
    | "accent"
    | "soft"
    | "sun"
    | "mint"
    | "pill-primary"
    | "pill-amber"
    | "pill-outline"
    | "pill-joy";
  size?: "sm" | "md" | "lg" | "xl" | "icon" | "icon-sm";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-bold transition-all duration-150 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 cursor-pointer select-none";

    const variants = {
      primary:
        "rounded-full bg-[var(--primary)] text-[var(--on-primary)] hover:bg-[var(--primary-hover)] shadow-sm hover:shadow-md active:translate-y-[1px]",
      "pill-primary":
        "rounded-full bg-[var(--primary)] text-[var(--on-primary)] hover:bg-[var(--primary-hover)] shadow-[0_4px_0_#93000E] active:translate-y-[2px] active:shadow-[0_2px_0_#93000E]",
      secondary:
        "rounded-full bg-[var(--surface-elevated)] text-[var(--text-primary)] hover:bg-[var(--border)] border border-[var(--border)] active:translate-y-[1px]",
      "pill-amber":
        "rounded-full bg-[var(--secondary-container)] text-[var(--on-secondary-fixed)] hover:filter hover:brightness-105 shadow-[0_4px_0_#B45309] active:translate-y-[2px] active:shadow-[0_2px_0_#B45309]",
      outline:
        "rounded-full border-2 border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--primary)] hover:text-[var(--primary)] bg-transparent active:translate-y-[1px]",
      "pill-outline":
        "rounded-full border-2 border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--primary)] hover:bg-[var(--surface-elevated)] bg-[var(--surface)] shadow-xs active:translate-y-[1px]",
      "pill-joy":
        "rounded-full bg-[var(--accent)] text-[var(--on-accent)] hover:bg-[var(--accent-hover)] shadow-[0_4px_0_#0039B5] active:translate-y-[2px] active:shadow-[0_2px_0_#0039B5]",
      ghost:
        "rounded-full text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] active:translate-y-[1px]",
      accent:
        "rounded-full bg-[var(--accent)] text-[var(--on-accent)] hover:bg-[var(--accent-hover)] shadow-sm active:translate-y-[1px]",
      soft:
        "rounded-full bg-[var(--primary-subtle)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--on-primary)] active:translate-y-[1px]",
      danger:
        "rounded-full bg-[var(--danger)] text-white hover:opacity-90 shadow-xs active:translate-y-[1px]",
      sun:
        "rounded-full bg-[var(--secondary-container)] text-[var(--on-secondary-fixed)] font-black hover:opacity-95 shadow-sm active:translate-y-[1px]",
      mint:
        "rounded-full bg-[var(--success)] text-white font-bold hover:opacity-95 shadow-xs active:translate-y-[1px]",
    };

    const sizes = {
      sm: "text-xs px-3 py-1.5 gap-1.5 h-8 min-h-[36px]",
      md: "text-sm px-4 py-2 gap-2 h-10 min-h-[40px] sm:min-h-[44px]",
      lg: "text-base px-6 py-3 gap-2.5 h-12 min-h-[44px] sm:min-h-[48px]",
      xl: "text-base sm:text-lg px-8 py-3.5 gap-3 h-14 min-h-[52px]",
      icon: "h-10 w-10 min-w-[44px] min-h-[44px] p-0 rounded-full",
      "icon-sm": "h-8 w-8 min-w-[36px] min-h-[36px] p-0 rounded-full",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4 text-current shrink-0"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>{children}</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";

export interface IconButtonProps extends ButtonProps {
  "aria-label": string;
}

export const IconButton = React.forwardRef<HTMLButtonElement, IconButtonProps>(
  ({ size = "icon", variant = "ghost", ...props }, ref) => {
    return <Button ref={ref} size={size} variant={variant} {...props} />;
  }
);

IconButton.displayName = "IconButton";
