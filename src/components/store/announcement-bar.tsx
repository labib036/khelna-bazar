"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useLanguage } from "@/lib/i18n";
import { Sparkles, X, ChevronRight } from "lucide-react";

export function AnnouncementBar() {
  const [isVisible, setIsVisible] = useState(true);
  const { locale } = useLanguage();
  const isBn = locale === "bn";

  useEffect(() => {
    try {
      const isDismissed = sessionStorage.getItem("kb_announcement_dismissed");
      if (isDismissed) {
        setIsVisible(false);
      }
    } catch {
      // Storage unavailable
    }
  }, []);

  if (!isVisible) return null;

  const handleDismiss = () => {
    setIsVisible(false);
    try {
      sessionStorage.setItem("kb_announcement_dismissed", "true");
    } catch {
      // Storage unavailable
    }
  };

  return (
    <aside
      aria-label="Store Announcement"
      className="relative w-full bg-[var(--primary)] text-[var(--on-primary)] py-1.5 px-4 text-center text-xs font-bold flex items-center justify-between select-none z-50 shadow-[inset_0_-1px_0_rgba(255,255,255,0.2)] transition-colors"
    >
      <div className="max-w-7xl mx-auto flex-1 flex items-center justify-center gap-2 text-center overflow-hidden">
        <Sparkles className="w-3.5 h-3.5 text-[var(--secondary-container)] shrink-0 animate-pulse" />
        <p className="truncate text-[11px] sm:text-xs font-bold tracking-tight">
          {isBn ? (
            <>
              ডেলিভারি ম্যানের সামনে পণ্যটি দেখে নিয়ে গ্রহণ করুন • ত্রুটি ধরা পড়লে সাথে সাথে ফেরত ও রিফান্ড • কল/হোয়াটসঅ্যাপ:{" "}
              <span className="font-extrabold text-[var(--secondary-container)]">
                01712-039707
              </span>
            </>
          ) : (
            <>
              Please inspect your toy at delivery before accepting • Refund for defectives reported at delivery • Helpline:{" "}
              <span className="font-extrabold text-[var(--secondary-container)]">
                01712-039707
              </span>
            </>
          )}
        </p>

        <Link
          href="/pages/return-refund"
          className="hidden sm:inline-flex items-center gap-0.5 font-extrabold text-[var(--secondary-container)] hover:underline ml-1 shrink-0 text-xs"
        >
          <span>{isBn ? "নীতিমালা দেখুন" : "Policy"}</span>
          <ChevronRight className="w-3 h-3" />
        </Link>
      </div>

      <button
        onClick={handleDismiss}
        className="text-[var(--on-primary)]/80 hover:text-[var(--on-primary)] p-1 rounded-full transition-colors cursor-pointer shrink-0 min-w-[28px] min-h-[28px] flex items-center justify-center"
        aria-label="Dismiss announcement banner"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </aside>
  );
}
