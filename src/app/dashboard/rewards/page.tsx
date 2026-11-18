"use client";

import Link from "next/link";
import { Sparkles, Gift, ArrowRight, ShieldCheck, Heart, ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function CustomerRewardsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
          PlayPoints &amp; Rewards
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
          Toy club loyalty program status and future discount benefits.
        </p>
      </div>

      <div className="p-8 sm:p-12 rounded-3xl bg-[var(--surface)] border border-[var(--border)] text-center space-y-6 shadow-xs max-w-2xl mx-auto">
        <div className="w-16 h-16 rounded-3xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto shadow-xs">
          <Sparkles className="w-8 h-8" />
        </div>

        <div className="space-y-2">
          <h2 className="font-heading font-black text-xl text-[var(--text-primary)]">
            Rewards Program Coming Soon
          </h2>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed max-w-lg mx-auto">
            Our PlayPoints loyalty system is currently undergoing final configuration. Soon, you will earn toy tokens on every verified Cash on Delivery order that you can redeem for exclusive discounts.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-[var(--surface-container-low)] border border-[var(--border)] text-xs text-[var(--text-muted)] space-y-1.5 text-left max-w-md mx-auto">
          <div className="flex items-center gap-2 font-bold text-[var(--text-primary)]">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <span>What to Expect</span>
          </div>
          <p>&bull; Earn points on delivered orders</p>
          <p>&bull; Redeem points for instant discounts at checkout</p>
          <p>&bull; Special birthday gifts for verified family accounts</p>
        </div>

        <div className="pt-2 flex justify-center gap-3">
          <Link href="/">
            <Button variant="primary" size="sm" className="font-bold text-xs gap-1.5">
              <ShoppingBag className="w-4 h-4" />
              <span>Browse Catalog</span>
            </Button>
          </Link>
          <Link href="/dashboard/orders">
            <Button variant="outline" size="sm" className="font-bold text-xs">
              View My Orders
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
