"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/auth-store";
import { AccountNav } from "@/components/account/account-nav";
import { Button } from "@/components/ui/button";
import { Sparkles, Gift, Share2, Award, Copy, Check, ArrowRight } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export default function RewardsPage() {
  const { user } = useAuthStore();
  const [copied, setCopied] = useState(false);

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <AccountNav />
          <div className="flex-1 bg-white dark:bg-[#1B1C24] p-8 sm:p-12 rounded-3xl border border-[#E8E2DE] dark:border-[#2E303E] text-center space-y-5 shadow-sm w-full">
            <div className="w-16 h-16 rounded-3xl bg-[#FFF0F2] text-[#DC012B] flex items-center justify-center mx-auto shadow-xs">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h1 className="font-heading text-2xl font-black text-[#18191F] dark:text-white">
                Sign In to View PlayPoints
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Earn 100 PlayPoints on signup and 1 point for every ৳10 spent on Cash on Delivery orders.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link href="/login?redirect=/account/rewards">
                <Button variant="primary" size="md" className="bg-[#DC012B] hover:bg-[#B80023] font-bold text-xs shadow-xs">
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" size="md" className="text-xs font-bold border-[#DC012B] text-[#DC012B] hover:bg-[#DC012B] hover:text-white">
                  <span>Create Account</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }
  const referralLink = `https://khelnabazar.com/register?ref=${user?.id || "guest"}`;

  const copyReferral = () => {
    navigator.clipboard.writeText(referralLink);
    setCopied(true);
    toast.success("Referral link copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <AccountNav />

        <div className="flex-1 space-y-8 w-full">
          <div>
            <h1 className="font-heading text-2xl font-black text-[#18191F] dark:text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-[#7B5CFA]" />
              <span>PlayPoints Loyalty Club</span>
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Earn points on every Cash on Delivery order and redeem for instant discounts at checkout.
            </p>
          </div>

          {/* Balance & Tier Card */}
          <div className="p-8 rounded-3xl bg-gradient-to-r from-[#7B5CFA] via-[#6343E0] to-[#DC012B] text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center sm:text-left">
              <span className="text-xs uppercase tracking-widest text-purple-200 font-extrabold">
                Current Point Balance
              </span>
              <div className="text-4xl sm:text-5xl font-black">{user?.loyaltyPoints || 350} Points</div>
              <p className="text-xs text-purple-100">Worth ৳35 in checkout discount discounts.</p>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md text-center border border-white/20 shrink-0">
              <span className="text-xs font-bold text-purple-200 uppercase tracking-wider block">
                Your Member Tier
              </span>
              <span className="font-heading text-xl font-black text-[#FFC93C] mt-0.5 block">
                {user?.tier || "BRONZE"} TIER
              </span>
              <span className="text-[11px] text-purple-100">Next tier at 1,000 points</span>
            </div>
          </div>

          {/* Ways to Earn Points */}
          <div className="space-y-4">
            <h2 className="font-heading font-black text-lg text-[#18191F] dark:text-white">
              Ways to Collect More Points
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-[#1B1C24] border border-[#E8E2DE] dark:border-[#2E303E] space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#FFF0F2] text-[#DC012B] flex items-center justify-center font-black">
                  🛍️
                </div>
                <h4 className="font-heading font-bold text-sm text-[#18191F] dark:text-white">
                  Place Any COD Order
                </h4>
                <p className="text-xs text-slate-500">Earn 1 PlayPoint for every ৳10 spent on our toys.</p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-[#1B1C24] border border-[#E8E2DE] dark:border-[#2E303E] space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#FFF8E6] text-[#B88700] flex items-center justify-center font-black">
                  ⭐
                </div>
                <h4 className="font-heading font-bold text-sm text-[#18191F] dark:text-white">
                  Write Verified Reviews
                </h4>
                <p className="text-xs text-slate-500">
                  Earn <strong>+50 Bonus Points</strong> for each review shared after delivery.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white dark:bg-[#1B1C24] border border-[#E8E2DE] dark:border-[#2E303E] space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#F3EFFF] text-[#7B5CFA] flex items-center justify-center font-black">
                  🎂
                </div>
                <h4 className="font-heading font-bold text-sm text-[#18191F] dark:text-white">
                  Child's Birthday Bonus
                </h4>
                <p className="text-xs text-slate-500">
                  Receive a special <strong>+200 Points</strong> surprise gift during their birthday month.
                </p>
              </div>
            </div>
          </div>

          {/* Referral Card */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#1B1C24] border border-[#E8E2DE] dark:border-[#2E303E] space-y-4 shadow-xs">
            <h3 className="font-heading font-black text-base text-[#18191F] dark:text-white flex items-center gap-2">
              <Share2 className="w-4 h-4 text-[#DC012B]" />
              <span>Invite Friends &amp; Family</span>
            </h3>
            <p className="text-xs text-slate-500">
              Share your referral link. When they place their first Cash on Delivery order, they get 10% off and you
              earn 100 PlayPoints!
            </p>

            <div className="flex gap-2 max-w-md">
              <input
                type="text"
                readOnly
                value={referralLink}
                className="w-full text-xs h-10 px-3.5 rounded-xl border border-slate-200 bg-slate-50 dark:bg-slate-800 text-slate-600 dark:text-slate-300 select-all"
              />
              <Button onClick={copyReferral} variant="primary" size="sm" className="gap-1 shrink-0">
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Copied" : "Copy"}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
