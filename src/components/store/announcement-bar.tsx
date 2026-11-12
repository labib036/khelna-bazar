"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, X, ChevronRight } from "lucide-react";

const ANNOUNCEMENTS = [
  {
    text: "🚚 FREE Nationwide Delivery across Bangladesh on orders over ৳2,000! Cash on Delivery available.",
    link: "/deals",
    cta: "Shop Deals",
  },
  {
    text: "🎉 Use coupon code PLAY10 at checkout for an extra 10% discount on building block sets!",
    link: "/c/building-blocks",
    cta: "Apply Code",
  },
  {
    text: "🎁 Finding the ideal birthday gift? Try our 3-step interactive Gift Finder quiz!",
    link: "/gift-finder",
    cta: "Find Gifts",
  },
];

export function AnnouncementBar() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const isDismissed = localStorage.getItem("kb_announcement_dismissed");
    if (isDismissed) {
      setIsVisible(false);
    }
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible) return null;

  const current = ANNOUNCEMENTS[currentIndex];

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem("kb_announcement_dismissed", "true");
  };

  return (
    <aside aria-label="Store Announcement" className="relative bg-[#18191F] text-white text-xs py-2 px-4 select-none z-50 border-b border-white/10">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        <div className="flex-1 flex items-center justify-center gap-2 text-center overflow-hidden">
          <Sparkles className="w-3.5 h-3.5 text-[#F59E0B] shrink-0 animate-pulse" />
          <p className="truncate font-medium text-slate-100">{current.text}</p>
          {current.link && (
            <Link
              href={current.link}
              className="hidden sm:inline-flex items-center gap-1 font-bold text-[#F59E0B] hover:underline ml-1 shrink-0"
            >
              <span>{current.cta}</span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          )}
        </div>
        <button
          onClick={handleDismiss}
          className="text-slate-400 hover:text-white p-1 rounded-full transition-colors cursor-pointer shrink-0"
          aria-label="Dismiss announcement banner"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </aside>
  );
}
