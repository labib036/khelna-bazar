"use client";

import * as React from "react";
import { Minus, Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  size?: "sm" | "md" | "lg";
  disabled?: boolean;
  className?: string;
  ariaLabel?: string;
}

export function QuantityStepper({
  value,
  onChange,
  min = 1,
  max = 99,
  size = "md",
  disabled = false,
  className,
  ariaLabel = "Quantity",
}: QuantityStepperProps) {
  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (value > min && !disabled) {
      onChange(value - 1);
    }
  };

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (value < max && !disabled) {
      onChange(value + 1);
    }
  };

  const sizeStyles = {
    sm: "h-9 text-xs px-1",
    md: "h-11 text-sm px-1.5",
    lg: "h-12 text-base px-2",
  };

  const btnSizes = {
    sm: "w-7 h-7 text-xs",
    md: "w-8 h-8 text-sm",
    lg: "w-9 h-9 text-base",
  };

  return (
    <div
      role="group"
      aria-label={ariaLabel}
      className={cn(
        "inline-flex items-center justify-between rounded-full border border-[var(--border)] bg-[var(--surface-container-low)] transition-colors select-none shadow-xs",
        sizeStyles[size],
        disabled && "opacity-50 pointer-events-none",
        className
      )}
    >
      <button
        type="button"
        onClick={handleDecrement}
        disabled={value <= min || disabled}
        className={cn(
          "flex items-center justify-center rounded-full text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--surface)] transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-2xs",
          btnSizes[size]
        )}
        aria-label="Decrease quantity"
      >
        <Minus className="w-3.5 h-3.5" />
      </button>

      <span className="px-2 font-black tabular-nums text-[var(--text-primary)] text-center min-w-[28px]">
        {value}
      </span>

      <button
        type="button"
        onClick={handleIncrement}
        disabled={value >= max || disabled}
        className={cn(
          "flex items-center justify-center rounded-full text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--surface)] transition-all active:scale-90 disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer shadow-2xs",
          btnSizes[size]
        )}
        aria-label="Increase quantity"
      >
        <Plus className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}
