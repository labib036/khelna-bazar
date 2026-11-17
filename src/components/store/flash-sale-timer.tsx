"use client";

import { useState, useEffect } from "react";
import { Flame } from "lucide-react";

export function FlashSaleTimer() {
  const [timeLeft, setTimeLeft] = useState<{ hours: number; minutes: number; seconds: number }>({
    hours: 11,
    minutes: 42,
    seconds: 18,
  });

  useEffect(() => {
    // Calculate time until midnight local time
    const updateCountdown = () => {
      const now = new Date();
      const midnight = new Date();
      midnight.setHours(24, 0, 0, 0);
      const diff = Math.max(0, midnight.getTime() - now.getTime());

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);

      setTimeLeft({ hours, minutes, seconds });
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const pad = (n: number) => n.toString().padStart(2, "0");

  return (
    <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] shadow-xs shrink-0">
      <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--primary)]">
        <Flame className="w-4 h-4 fill-current animate-pulse text-[var(--primary)]" />
        <span className="hidden sm:inline">Deal ends in:</span>
      </div>

      <div className="flex items-center gap-1 font-mono text-xs font-bold tabular-nums">
        <div className="flex flex-col items-center">
          <span className="bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] px-2 py-1 rounded-lg text-xs shadow-inner">
            {pad(timeLeft.hours)}
          </span>
          <span className="text-[9px] text-[var(--text-muted)] font-sans mt-0.5 font-semibold">HRS</span>
        </div>

        <span className="text-[var(--text-muted)] font-black mb-3">:</span>

        <div className="flex flex-col items-center">
          <span className="bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] px-2 py-1 rounded-lg text-xs shadow-inner">
            {pad(timeLeft.minutes)}
          </span>
          <span className="text-[9px] text-[var(--text-muted)] font-sans mt-0.5 font-semibold">MIN</span>
        </div>

        <span className="text-[var(--text-muted)] font-black mb-3">:</span>

        <div className="flex flex-col items-center">
          <span className="bg-[var(--primary)] text-[var(--on-primary)] px-2 py-1 rounded-lg text-xs shadow-xs font-black">
            {pad(timeLeft.seconds)}
          </span>
          <span className="text-[9px] text-[var(--text-muted)] font-sans mt-0.5 font-semibold">SEC</span>
        </div>
      </div>
    </div>
  );
}
