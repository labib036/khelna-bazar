import * as React from "react";
import { formatPrice, calculateDiscountPercentage } from "@/lib/utils";
import { cn } from "@/lib/utils";

export interface PriceProps {
  amount: number;
  compareAmount?: number | null;
  size?: "sm" | "md" | "lg" | "xl";
  showDiscountBadge?: boolean;
  className?: string;
}

export function Price({
  amount,
  compareAmount,
  size = "md",
  showDiscountBadge = true,
  className,
}: PriceProps) {
  const hasDiscount = compareAmount && compareAmount > amount;
  const discountPercent = hasDiscount ? calculateDiscountPercentage(amount, compareAmount) : 0;

  const sizeClasses = {
    sm: {
      current: "text-sm font-black",
      compare: "text-xs",
      badge: "text-[9px] px-1.5 py-0.2",
    },
    md: {
      current: "text-base sm:text-lg font-black",
      compare: "text-xs sm:text-sm",
      badge: "text-[10px] px-2 py-0.5",
    },
    lg: {
      current: "text-xl sm:text-2xl font-black",
      compare: "text-sm sm:text-base",
      badge: "text-xs px-2.5 py-0.5",
    },
    xl: {
      current: "text-2xl sm:text-3xl font-black",
      compare: "text-base sm:text-lg",
      badge: "text-xs px-3 py-1",
    },
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={cn("inline-flex items-baseline gap-2 tabular-nums select-none", className)}>
      <span className={cn("text-[var(--text-primary)] leading-none", currentSize.current)}>
        {formatPrice(amount)}
      </span>

      {hasDiscount && (
        <span className={cn("text-[var(--text-muted)] line-through leading-none", currentSize.compare)}>
          {formatPrice(compareAmount)}
        </span>
      )}

      {hasDiscount && showDiscountBadge && discountPercent > 0 && (
        <span
          className={cn(
            "rounded-full bg-[var(--primary)] text-[var(--on-primary)] font-extrabold shadow-xs inline-flex items-center",
            currentSize.badge
          )}
        >
          -{discountPercent}% OFF
        </span>
      )}
    </div>
  );
}
