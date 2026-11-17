"use client";

import { useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useMounted } from "@/lib/use-mounted";
import { AccountNav } from "@/components/account/account-nav";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Share2,
  Copy,
  Check,
  ArrowRight,
  Star,
  Award,
  Crown,
  ShoppingBag,
  PartyPopper,
} from "lucide-react";
import { toast } from "sonner";

export default function RewardsPage() {
  const mounted = useMounted();
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const user = session?.user;
  const [copied, setCopied] = useState(false);

  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center text-xs text-[var(--text-muted)] animate-pulse">
        Loading rewards...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <AccountNav />
          <div className="flex-1 bg-[var(--surface-container-low)] p-8 sm:p-12 rounded-3xl border border-[var(--border)] text-center space-y-5 shadow-xs w-full">
            <div className="w-16 h-16 rounded-3xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center mx-auto shadow-xs">
              <Sparkles className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h1 className="font-heading text-2xl font-black text-[var(--text-primary)]">
                Sign In to View Loyalty Points
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                Earn 100 points on registration and 1 point for every ৳10 spent on Cash on Delivery orders.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link href="/login?redirect=/account/rewards">
                <Button variant="primary" size="md" className="font-bold text-xs shadow-[0_4px_0_#93000E]">
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" size="md" className="text-xs font-bold border-[var(--primary)] text-[var(--primary)]">
                  <span>Create Account</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const referralCode = user?.name ? `${user.name.split(" ")[0].toUpperCase()}-JOY100` : "JOY-TOY100";
  const referralLink = typeof window !== "undefined"
    ? `${window.location.origin}/register?ref=${referralCode}`
    : `https://khelnabazar.com/register?ref=${referralCode}`;

  const copyReferral = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(referralLink);
      setCopied(true);
      toast.success("Referral link copied!");
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <AccountNav />

        <div className="flex-1 space-y-8 w-full min-w-0">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[var(--secondary-container)] bg-amber-500/10 px-3 py-1 rounded-full mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Khelna Bazar Club</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
              PlayPoints Rewards &amp; Wonder Club
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 max-w-xl leading-relaxed">
              Every Cash on Delivery purchase earns points toward instant discounts, birthday gifts, and exclusive toy releases.
            </p>
          </div>

          {/* Balance & Tier Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[var(--primary)] via-[var(--primary-container)] to-[#7c000c] text-white shadow-md flex flex-col sm:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute -right-10 -bottom-10 w-44 h-44 bg-[var(--secondary-container)]/20 rounded-full blur-2xl pointer-events-none" />

            <div className="space-y-1 text-center sm:text-left z-10">
              <span className="text-[11px] uppercase tracking-widest text-rose-200 font-extrabold">
                Current PlayPoints Balance
              </span>
              <div className="text-4xl sm:text-5xl font-heading font-black tracking-tight">
                {(user as any)?.loyaltyPoints ?? 0} Points
              </div>
              <p className="text-xs text-rose-100 font-bold">
                Worth <strong className="text-amber-300">৳{Math.floor(((user as any)?.loyaltyPoints ?? 0) / 10)} in checkout discounts</strong>.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-md text-center border border-white/20 shrink-0 z-10 w-full sm:w-auto">
              <span className="text-[10px] font-extrabold text-rose-200 uppercase tracking-wider block">
                Current Member Tier
              </span>
              <span className="font-heading text-xl font-black text-amber-300 mt-0.5 block">
                {(user as any)?.tier ? `${(user as any).tier} EXPLORER 🌟` : "BRONZE FRIEND 🌟"}
              </span>
              <span className="text-[11px] text-rose-100 font-bold">Earn points on every Cash on Delivery order</span>
            </div>
          </div>

          {/* Tier Milestones */}
          <div className="p-6 rounded-3xl bg-[var(--surface-container-low)] border border-[var(--border)] shadow-xs space-y-4">
            <h3 className="font-heading font-black text-base text-[var(--text-primary)]">
              Membership Tiers &amp; Benefits
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-full bg-[var(--surface-container-high)] text-[var(--text-muted)] flex items-center justify-center font-bold">
                    <Star className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-600">
                    Achieved
                  </span>
                </div>
                <h4 className="font-heading font-bold text-sm text-[var(--text-primary)]">Bronze Friend</h4>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Earn 1 pt for every ৳10 spent. Standard Cash on Delivery across Bangladesh.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--primary)]/10 border-2 border-[var(--primary)] space-y-2 relative shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-[var(--on-primary)] flex items-center justify-center font-bold">
                    <Award className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[var(--primary)] text-[var(--on-primary)]">
                    Current Tier
                  </span>
                </div>
                <h4 className="font-heading font-black text-sm text-[var(--primary)]">Silver Explorer</h4>
                <p className="text-xs text-[var(--text-primary)] leading-relaxed">
                  1.5x Points multiplier, complimentary Birthday Gift Wrap, and early access to toy flash drops.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] opacity-75 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="w-8 h-8 rounded-full bg-amber-500/15 text-amber-600 flex items-center justify-center font-bold">
                    <Crown className="w-4 h-4" />
                  </div>
                  <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[var(--surface-container-high)] text-[var(--text-muted)]">
                    2,300 pts
                  </span>
                </div>
                <h4 className="font-heading font-bold text-sm text-[var(--text-primary)]">Gold Champion</h4>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  2x Points, Free Express Shipping nationwide, and priority customer care hotline.
                </p>
              </div>
            </div>
          </div>

          {/* Ways to Earn Points */}
          <div className="space-y-4">
            <h2 className="font-heading font-black text-lg text-[var(--text-primary)]">
              Ways to Collect More PlayPoints
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-[var(--surface-container-low)] border border-[var(--border)] space-y-2 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <h4 className="font-heading font-bold text-sm text-[var(--text-primary)]">
                  Place Any COD Order
                </h4>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Earn points automatically on all toy purchases once delivered.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[var(--surface-container-low)] border border-[var(--border)] space-y-2 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center">
                  <Star className="w-5 h-5" />
                </div>
                <h4 className="font-heading font-bold text-sm text-[var(--text-primary)]">
                  Write Verified Reviews
                </h4>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Earn <strong>+50 Bonus Points</strong> for each photo review shared after delivery.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-[var(--surface-container-low)] border border-[var(--border)] space-y-2 shadow-xs">
                <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center">
                  <PartyPopper className="w-5 h-5" />
                </div>
                <h4 className="font-heading font-bold text-sm text-[var(--text-primary)]">
                  Child Birthday Bonus
                </h4>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Receive a special <strong>+200 Points</strong> surprise gift coupon during their birthday month.
                </p>
              </div>
            </div>
          </div>

          {/* Referral Card */}
          <div className="p-6 rounded-3xl bg-[var(--surface-container-low)] border border-[var(--border)] space-y-4 shadow-xs">
            <h3 className="font-heading font-black text-base text-[var(--text-primary)] flex items-center gap-2">
              <Share2 className="w-4 h-4 text-[var(--primary)]" />
              <span>Invite Friends &amp; Preschool Classmates</span>
            </h3>
            <p className="text-xs text-[var(--text-muted)] leading-relaxed max-w-xl">
              Share your referral link with family and friends. When they place their first Cash on Delivery order, they get ৳100 off and you earn ৳100 in PlayPoints credit!
            </p>

            <div className="flex flex-col sm:flex-row gap-2 max-w-md">
              <input
                type="text"
                readOnly
                value={referralLink}
                className="w-full text-xs h-10 px-3.5 rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] select-all font-mono"
              />
              <Button
                type="button"
                onClick={copyReferral}
                variant="primary"
                size="sm"
                className="gap-1 shrink-0 rounded-full shadow-[0_3px_0_#93000E]"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? "Copied" : "Copy Link"}</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}