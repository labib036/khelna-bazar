import * as React from "react";
import { cn } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";

export interface StatCardProps {
  title: string;
  value: string | number;
  prefix?: string;
  change?: number;
  changeLabel?: string;
  icon?: React.ReactNode;
  variant?: "default" | "peach" | "sun" | "mint" | "sky";
  sparklineData?: number[];
  className?: string;
}

export function StatCard({
  title,
  value,
  prefix,
  change,
  changeLabel = "vs last period",
  icon,
  variant = "default",
  sparklineData,
  className,
}: StatCardProps) {
  const isPositive = change !== undefined ? change >= 0 : null;

  const variantStyles = {
    default: "bg-[var(--surface)] border-[var(--border)] shadow-xs",
    peach: "bg-[var(--surface-container-low)] border-[var(--primary)]/20 shadow-xs",
    sun: "bg-[var(--surface-sun)] border-[var(--secondary-container)]/30 shadow-xs",
    mint: "bg-[var(--surface-mint)] border-[var(--success)]/20 shadow-xs",
    sky: "bg-[var(--surface-sky)] border-[var(--accent)]/20 shadow-xs",
  };

  // Generate SVG path for mini sparkline
  const generateSparkline = (data: number[]) => {
    if (!data || data.length < 2) return null;
    const min = Math.min(...data);
    const max = Math.max(...data);
    const range = max - min || 1;
    const width = 80;
    const height = 28;

    const points = data
      .map((val, idx) => {
        const x = (idx / (data.length - 1)) * width;
        const y = height - ((val - min) / range) * (height - 4) - 2;
        return `${x},${y}`;
      })
      .join(" ");

    return points;
  };

  const sparklinePoints = sparklineData ? generateSparkline(sparklineData) : null;

  return (
    <div
      className={cn(
        "p-5 rounded-3xl border transition-all duration-200 space-y-3.5 card-sensory-lift",
        variantStyles[variant],
        className
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="text-xs font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
          {title}
        </span>
        {icon && (
          <div className="p-2.5 rounded-full bg-[var(--surface-container-high)] text-[var(--primary)] shadow-xs">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-baseline justify-between gap-4">
        <div className="space-y-1">
          <div className="text-2xl sm:text-3xl font-black font-heading tracking-tight text-[var(--text-primary)] tabular-nums">
            {prefix && <span className="text-xl font-bold mr-0.5">{prefix}</span>}
            {value}
          </div>

          {change !== undefined && (
            <div className="flex items-center gap-1.5 text-xs">
              <span
                className={cn(
                  "inline-flex items-center gap-0.5 px-2 py-0.5 rounded-full font-bold tabular-nums text-[11px]",
                  isPositive
                    ? "bg-[var(--success-subtle)] text-[var(--success)]"
                    : "bg-[var(--danger-subtle)] text-[var(--danger)]"
                )}
              >
                {isPositive ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                {isPositive ? `+${change}%` : `${change}%`}
              </span>
              <span className="text-[var(--text-muted)] text-[11px] truncate">{changeLabel}</span>
            </div>
          )}
        </div>

        {sparklinePoints && (
          <div className="shrink-0 pt-2 opacity-80">
            <svg width="80" height="28" viewBox="0 0 80 28" fill="none" className="overflow-visible">
              <polyline
                fill="none"
                stroke="var(--primary)"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                points={sparklinePoints}
              />
            </svg>
          </div>
        )}
      </div>
    </div>
  );
}
