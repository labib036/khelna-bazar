import * as React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export interface RatingProps {
  rating: number;
  maxRating?: number;
  reviewCount?: number;
  size?: "sm" | "md" | "lg";
  showCount?: boolean;
  className?: string;
}

export function Rating({
  rating,
  maxRating = 5,
  reviewCount,
  size = "sm",
  showCount = true,
  className,
}: RatingProps) {
  const iconSizes = {
    sm: "w-3.5 h-3.5",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  const textSizes = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  return (
    <div className={cn("inline-flex items-center gap-1.5 select-none", className)}>
      <div className="flex items-center gap-0.5 text-[var(--secondary-container)]" aria-label={`Rating: ${rating} out of ${maxRating} stars`}>
        {Array.from({ length: maxRating }).map((_, idx) => {
          const filled = idx < Math.floor(rating);
          const half = !filled && idx < rating;
          return (
            <Star
              key={idx}
              className={cn(
                iconSizes[size],
                filled ? "fill-current text-[var(--secondary-container)]" : half ? "fill-current/50 text-[var(--secondary-container)]" : "text-[var(--border)]"
              )}
            />
          );
        })}
      </div>

      <span className={cn("font-bold text-[var(--text-primary)] tabular-nums", textSizes[size])}>
        {rating.toFixed(1)}
      </span>

      {showCount && reviewCount !== undefined && reviewCount > 0 && (
        <span className="text-[11px] text-[var(--text-muted)] font-medium">
          ({reviewCount})
        </span>
      )}
    </div>
  );
}
