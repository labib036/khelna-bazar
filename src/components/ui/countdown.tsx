"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface CountdownProps {
  targetDate?: Date | string;
  initialHours?: number;
  initialMinutes?: number;
  initialSeconds?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
  label?: string;
}

export function Countdown({
  targetDate,
  initialHours = 14,
  initialMinutes = 32,
  initialSeconds = 45,
  size = "md",
  className,
  label = "Ends in",
}: CountdownProps) {
  const [timeLeft, setTimeLeft] = React.useState({
    hours: initialHours,
    minutes: initialMinutes,
    seconds: initialSeconds,
  });

  React.useEffect(() => {
    if (targetDate) {
      const target = new Date(targetDate).getTime();
      const interval = setInterval(() => {
        const now = new Date().getTime();
        const difference = target - now;

        if (difference <= 0) {
          clearInterval(interval);
          setTimeLeft({ hours: 0, minutes: 0, seconds: 0 });
        } else {
          const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
          const minutes = Math.floor((difference / 1000 / 60) % 60);
          const seconds = Math.floor((difference / 1000) % 60);
          setTimeLeft({ hours, minutes, seconds });
        }
      }, 1000);
      return () => clearInterval(interval);
    } else {
      const interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev.seconds > 0) {
            return { ...prev, seconds: prev.seconds - 1 };
          } else if (prev.minutes > 0) {
            return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
          } else if (prev.hours > 0) {
            return { hours: prev.hours - 1, minutes: 59, seconds: 59 };
          }
          return prev;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [targetDate]);

  const pad = (n: number) => n.toString().padStart(2, "0");

  const sizeClasses = {
    sm: {
      box: "w-7 h-7 text-xs font-black rounded-lg",
      colon: "text-xs font-bold",
      label: "text-[10px]",
    },
    md: {
      box: "w-9 h-9 text-sm font-black rounded-xl",
      colon: "text-sm font-bold",
      label: "text-xs",
    },
    lg: {
      box: "w-12 h-12 text-lg font-black rounded-2xl",
      colon: "text-lg font-bold",
      label: "text-sm",
    },
  };

  const currentSize = sizeClasses[size];

  return (
    <div className={cn("inline-flex items-center gap-1.5 select-none", className)}>
      {label && (
        <span className={cn("font-bold text-[var(--text-muted)] mr-1", currentSize.label)}>
          {label}
        </span>
      )}
      <div
        className={cn(
          "flex items-center justify-center bg-[var(--surface-container-high)] text-[var(--primary)] border border-[var(--border)] shadow-xs tabular-nums",
          currentSize.box
        )}
      >
        {pad(timeLeft.hours)}
      </div>
      <span className={cn("text-[var(--primary)]", currentSize.colon)}>:</span>
      <div
        className={cn(
          "flex items-center justify-center bg-[var(--surface-container-high)] text-[var(--primary)] border border-[var(--border)] shadow-xs tabular-nums",
          currentSize.box
        )}
      >
        {pad(timeLeft.minutes)}
      </div>
      <span className={cn("text-[var(--primary)]", currentSize.colon)}>:</span>
      <div
        className={cn(
          "flex items-center justify-center bg-[var(--surface-container-high)] text-[var(--primary)] border border-[var(--border)] shadow-xs tabular-nums",
          currentSize.box
        )}
      >
        {pad(timeLeft.seconds)}
      </div>
    </div>
  );
}
