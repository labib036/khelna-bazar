import * as React from "react";
import { cn } from "@/lib/utils";

export interface EmptyStateProps {
  illustration: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  className?: string;
}

export function EmptyState({
  illustration,
  title,
  description,
  action,
  secondaryAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center text-center p-8 sm:p-12 max-w-md mx-auto space-y-5 animate-in fade-in-50 duration-300",
        className
      )}
    >
      <div className="shrink-0 transition-transform duration-300 hover:scale-105">
        {illustration}
      </div>

      <div className="space-y-2">
        <h3 className="text-xl sm:text-2xl font-bold font-heading text-[var(--text-primary)] tracking-tight">
          {title}
        </h3>
        {description && (
          <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed max-w-sm mx-auto">
            {description}
          </p>
        )}
      </div>

      {(action || secondaryAction) && (
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {action}
          {secondaryAction}
        </div>
      )}
    </div>
  );
}
