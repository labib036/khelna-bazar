import * as React from "react";
import { cn } from "@/lib/utils";

export function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("skeleton-shimmer rounded-xl bg-[var(--border)]/40", className)}
      aria-hidden="true"
      {...props}
    />
  );
}

/**
 * Product Card Skeleton matching exact ProductCard dimensions to prevent layout shifts (CLS <= 0.05)
 */
export function ProductCardSkeleton() {
  return (
    <div className="flex flex-col rounded-2xl bg-[var(--surface)] border border-[var(--border)] overflow-hidden p-3.5 space-y-3 shadow-xs">
      {/* 1:1 Image box */}
      <div className="relative aspect-square w-full rounded-xl overflow-hidden skeleton-shimmer bg-[var(--border)]/40" />

      {/* Title & Category lines */}
      <div className="space-y-1.5 pt-1">
        <Skeleton className="h-3 w-1/3 rounded-full" />
        <Skeleton className="h-4 w-5/6 rounded-full" />
        <Skeleton className="h-4 w-3/5 rounded-full" />
      </div>

      {/* Price & Add to cart button */}
      <div className="pt-2 flex items-center justify-between gap-3">
        <div className="space-y-1">
          <Skeleton className="h-5 w-16 rounded-full" />
          <Skeleton className="h-3 w-10 rounded-full" />
        </div>
        <Skeleton className="h-9 w-24 rounded-full" />
      </div>
    </div>
  );
}

/**
 * Table Row Skeleton for Admin Orders, Products, and Inventory
 */
export function TableRowSkeleton({ columns = 5 }: { columns?: number }) {
  return (
    <tr className="border-b border-[var(--border)]/60">
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-4">
          <Skeleton className="h-4 w-full max-w-[120px] rounded-full" />
        </td>
      ))}
    </tr>
  );
}

/**
 * Stat / KPI Card Skeleton for Admin Dashboard
 */
export function StatCardSkeleton() {
  return (
    <div className="p-5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-3 shadow-xs">
      <div className="flex items-center justify-between">
        <Skeleton className="h-3.5 w-24 rounded-full" />
        <Skeleton className="h-8 w-8 rounded-lg" />
      </div>
      <Skeleton className="h-8 w-32 rounded-lg" />
      <Skeleton className="h-3 w-20 rounded-full" />
    </div>
  );
}
