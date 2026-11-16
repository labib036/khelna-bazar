import * as React from "react";
import { cn } from "@/lib/utils";
import { X } from "lucide-react";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
  clearable?: boolean;
  onClear?: () => void;
  variant?: "default" | "pill";
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      type = "text",
      label,
      error,
      helperText,
      leadingIcon,
      trailingIcon,
      clearable,
      onClear,
      id,
      value,
      variant = "pill",
      ...props
    },
    ref
  ) => {
    const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={inputId} className="block text-xs font-bold text-[var(--text-primary)]">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          {leadingIcon && (
            <div className="absolute left-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
              {leadingIcon}
            </div>
          )}
          <input
            id={inputId}
            type={type}
            value={value}
            className={cn(
              "flex h-11 w-full border border-[var(--border)] bg-[var(--surface-container-low)] px-4 py-2 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-muted)] transition-all duration-150 focus:border-[var(--primary)] focus:bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 disabled:cursor-not-allowed disabled:opacity-50 shadow-xs",
              variant === "pill" ? "rounded-full px-5" : "rounded-xl",
              leadingIcon && (variant === "pill" ? "pl-11" : "pl-10"),
              (trailingIcon || (clearable && value)) && (variant === "pill" ? "pr-11" : "pr-10"),
              error && "border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[var(--danger)]/20",
              className
            )}
            ref={ref}
            {...props}
          />
          {clearable && value && (
            <button
              type="button"
              onClick={onClear}
              className="absolute right-3.5 p-1 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors cursor-pointer"
              aria-label="Clear input"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          {trailingIcon && !clearable && (
            <div className="absolute right-3.5 flex items-center pointer-events-none text-[var(--text-muted)]">
              {trailingIcon}
            </div>
          )}
        </div>
        {error ? (
          <p className="text-xs text-[var(--danger)] font-medium flex items-center gap-1">
            <span>{error}</span>
          </p>
        ) : helperText ? (
          <p className="text-[11px] text-[var(--text-muted)]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Input.displayName = "Input";
