import * as React from "react";
import { Check, Truck } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TimelineStep {
  id: string;
  title: string;
  description?: string;
  time?: string;
  status: "completed" | "current" | "upcoming";
  icon?: React.ReactNode;
}

export interface TimelineProps {
  steps: TimelineStep[];
  className?: string;
}

export function Timeline({ steps, className }: TimelineProps) {
  return (
    <div className={cn("space-y-4 select-none", className)}>
      {steps.map((step, idx) => {
        const isLast = idx === steps.length - 1;
        const isCompleted = step.status === "completed";
        const isCurrent = step.status === "current";

        return (
          <div key={step.id} className="relative flex items-start gap-4">
            {/* Connecting Vertical Line */}
            {!isLast && (
              <div
                className={cn(
                  "absolute left-4.5 top-9 w-0.5 -bottom-4 transition-colors",
                  isCompleted ? "bg-[var(--primary)]" : "bg-[var(--border)]"
                )}
              />
            )}

            {/* Step Icon Badge */}
            <div
              className={cn(
                "relative z-10 w-9 h-9 rounded-full flex items-center justify-center shrink-0 transition-all shadow-xs",
                isCompleted
                  ? "bg-[var(--primary)] text-[var(--on-primary)]"
                  : isCurrent
                  ? "bg-[var(--secondary-container)] text-[var(--on-secondary-fixed)] ring-4 ring-[var(--secondary-container)]/25 animate-pulse"
                  : "bg-[var(--surface-container-high)] text-[var(--text-muted)] border border-[var(--border)]"
              )}
            >
              {isCompleted ? (
                <Check className="w-4 h-4 stroke-[3]" />
              ) : step.icon ? (
                step.icon
              ) : isCurrent ? (
                <Truck className="w-4 h-4" />
              ) : (
                <span className="text-xs font-bold">{idx + 1}</span>
              )}
            </div>

            {/* Step Content */}
            <div className="flex-1 min-w-0 pt-1 pb-2">
              <div className="flex items-center justify-between gap-2">
                <h4
                  className={cn(
                    "text-sm font-bold truncate",
                    isCurrent ? "text-[var(--primary)]" : isCompleted ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"
                  )}
                >
                  {step.title}
                </h4>
                {step.time && (
                  <span className="text-[11px] text-[var(--text-muted)] shrink-0 tabular-nums">
                    {step.time}
                  </span>
                )}
              </div>
              {step.description && (
                <p className="text-xs text-[var(--text-muted)] mt-0.5 leading-relaxed">
                  {step.description}
                </p>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
