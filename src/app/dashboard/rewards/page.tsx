"use client";

import Link from "next/link";
import { Sparkles, ShoppingBag, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLanguage } from "@/lib/i18n";

export default function CustomerRewardsPage() {
  const { t, locale } = useLanguage();
  const isBn = locale === "bn";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
          {isBn ? "লয়্যালটি রিওয়ার্ডস" : "Customer Rewards"}
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
          {isBn ? "গ্রাহক সুবিধা ও রিওয়ার্ড প্রোগ্রামের তথ্য।" : "Loyalty program status and account benefits."}
        </p>
      </div>

      <div className="p-8 sm:p-12 rounded-3xl bg-[var(--surface)] border border-[var(--border)] text-center space-y-6 shadow-xs max-w-2xl mx-auto">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-xs">
          <Sparkles className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="font-heading font-black text-xl text-[var(--text-primary)]">
            {isBn ? "রিওয়ার্ড প্রোগ্রাম শীঘ্রই আসছে" : "Rewards Program Coming Soon"}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed max-w-lg mx-auto">
            {isBn
              ? "আমাদের লয়্যালটি রিওয়ার্ড প্রোগ্রাম বর্তমানে চূড়ান্ত প্রস্তুতকরণে রয়েছে। চালু হলে প্রতিটি সফল অর্ডারে বিশেষ ডিসকাউন্ট পাওয়ার সুযোগ থাকবে।"
              : "Our loyalty rewards program is currently under preparation. Once launched, customers will enjoy special promotional perks on verified orders."}
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--surface-container-low)] border border-[var(--border)] text-xs text-[var(--text-muted)] space-y-1.5 text-left max-w-md mx-auto">
          <div className="flex items-center gap-2 font-bold text-[var(--text-primary)]">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>{isBn ? "বর্তমান সুবিধাসমূহ" : "Current Benefits"}</span>
          </div>
          <p>&bull; {isBn ? "ক্যাশ অন ডেলিভারি সুবিধা" : "Cash on Delivery available on all orders"}</p>
          <p>&bull; {isBn ? "গ্রহণের পূর্বে পণ্য পরীক্ষার সুযোগ" : "Inspect before you accept at doorstep"}</p>
          <p>&bull; {isBn ? "ডেলিভারির সময় ত্রুটিতে সম্পূর্ণ ফেরত ও রিফান্ড" : "Defective reported at delivery eligible for refund"}</p>
        </div>

        <div className="pt-2 flex justify-center gap-3">
          <Link href="/">
            <Button variant="primary" size="sm" className="font-bold text-xs gap-1.5">
              <ShoppingBag className="w-4 h-4" />
              <span>{isBn ? "খেলনা ব্রাউজ করুন" : "Browse Catalog"}</span>
            </Button>
          </Link>
          <Link href="/dashboard/orders">
            <Button variant="outline" size="sm" className="font-bold text-xs">
              {isBn ? "আমার অর্ডারসমূহ" : "View My Orders"}
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
