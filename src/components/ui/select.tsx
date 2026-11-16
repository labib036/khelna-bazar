import * as React from "react";
import { cn } from "@/lib/utils";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  label: string;
  value: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options?: SelectOption[];
  variant?: "default" | "pill";
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, helperText, options = [], children, id, variant = "pill", ...props }, ref) => {
    const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, "-") : undefined);

    return (
      <div className="w-full space-y-1.5">
        {label && (
          <label htmlFor={selectId} className="block text-xs font-bold text-[var(--text-primary)]">
            {label}
          </label>
        )}
        <div className="relative flex items-center">
          <select
            id={selectId}
            ref={ref}
            className={cn(
              "flex h-11 w-full appearance-none border border-[var(--border)] bg-[var(--surface-container-low)] px-4 py-2 pr-10 text-sm text-[var(--text-primary)] transition-all duration-150 focus:border-[var(--primary)] focus:bg-[var(--surface)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/20 disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer shadow-xs",
              variant === "pill" ? "rounded-full px-5 pr-11" : "rounded-xl",
              error && "border-[var(--danger)] focus:border-[var(--danger)] focus:ring-[var(--danger)]/20",
              className
            )}
            {...props}
          >
            {options.length > 0
              ? options.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <ChevronDown className="absolute right-4 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
        </div>
        {error ? (
          <p className="text-xs text-[var(--danger)] font-medium">{error}</p>
        ) : helperText ? (
          <p className="text-[11px] text-[var(--text-muted)]">{helperText}</p>
        ) : null}
      </div>
    );
  }
);

Select.displayName = "Select";
