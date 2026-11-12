"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/lib/auth-store";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Gift,
  ShieldCheck,
  Truck,
  Star,
  Users,
  ArrowRight,
  UserCheck,
  CheckCircle2,
  Clock,
  HeartHandshake,
} from "lucide-react";

export function MarketingDashboard() {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-white via-[#FFF7F8] to-[#FFF0F2] dark:from-[#1B1C24] dark:via-[#20181F] dark:to-[#2B141C] border-2 border-[#DC012B]/20 shadow-md p-6 sm:p-8 lg:p-10">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#DC012B]/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Left Column: Greeting, Value Proposition & Action Buttons */}
          <div className="max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#DC012B]/10 dark:bg-[#DC012B]/20 text-[#DC012B] text-xs font-bold tracking-wide uppercase">
              <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
              <span>Official Khelna Bazar Member Gateway</span>
            </div>

            {mounted && user ? (
              <div className="space-y-2">
                <h2 className="font-heading text-2xl sm:text-3xl font-black text-[#18191F] dark:text-white">
                  Welcome back, <span className="text-[#DC012B]">{user.name}</span>!
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  You currently hold{" "}
                  <strong className="text-[#F59E0B] font-extrabold">{user.loyaltyPoints} PlayPoints</strong> (
                  {user.tier} Tier). Enjoy free nationwide Cash on Delivery on orders over ৳2,000!
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <Link href={user.role === "ADMIN" ? "/admin" : "/account"}>
                    <Button
                      variant="primary"
                      size="md"
                      className="bg-[#DC012B] hover:bg-[#B80023] text-white font-bold text-xs shadow-sm"
                    >
                      <span>{user.role === "ADMIN" ? "Open Admin Console" : "Go to My Dashboard"}</span>
                      <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                  <Link href="/deals">
                    <Button variant="outline" size="md" className="text-xs font-bold">
                      View Flash Deals
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <h2 className="font-heading text-2xl sm:text-3xl font-black text-[#18191F] dark:text-white tracking-tight">
                  New to Khelna Bazar? Explore &amp; Claim <span className="text-[#DC012B]">৳100 Welcome Points</span>!
                </h2>
                <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  Browse thousands of certified non-toxic toys with <strong>100% Cash on Delivery</strong> across all
                  64 districts of Bangladesh. You can inspect your parcel at your doorstep before handing cash to the courier.
                </p>
                <div className="pt-2 flex flex-wrap items-center gap-3">
                  <Link href="/register">
                    <Button
                      variant="primary"
                      size="lg"
                      className="bg-[#DC012B] hover:bg-[#B80023] text-white font-black text-xs sm:text-sm shadow-md flex items-center gap-2"
                    >
                      <Gift className="w-4 h-4 text-[#F59E0B]" />
                      <span>Create Account &bull; Claim ৳100</span>
                      <ArrowRight className="w-4 h-4 ml-0.5" />
                    </Button>
                  </Link>

                  <Link href="/login">
                    <Button
                      variant="outline"
                      size="lg"
                      className="text-xs sm:text-sm font-bold border-2 border-[#DC012B] text-[#DC012B] hover:bg-[#DC012B] hover:text-white transition-all shadow-xs"
                    >
                      <span>Already a Member? Sign In</span>
                    </Button>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* Right Column: Live Marketing Activity & Trust Cards */}
          <div className="grid grid-cols-2 gap-3.5 sm:gap-4 lg:w-[420px] shrink-0">
            {/* Metric 1: Cash on Delivery */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#1B1C24] border border-[#E8E2DE] dark:border-[#2E303E] shadow-xs space-y-1">
              <div className="w-8 h-8 rounded-xl bg-emerald-100 dark:bg-emerald-950/50 text-[#10B981] flex items-center justify-center mb-2">
                <Truck className="w-4 h-4" />
              </div>
              <span className="font-heading font-black text-sm text-[#18191F] dark:text-white block">
                100% Cash on Del.
              </span>
              <p className="text-[11px] text-slate-500 leading-tight">Pay only at your doorstep nationwide.</p>
            </div>

            {/* Metric 2: Safety Certified */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#1B1C24] border border-[#E8E2DE] dark:border-[#2E303E] shadow-xs space-y-1">
              <div className="w-8 h-8 rounded-xl bg-rose-100 dark:bg-rose-950/50 text-[#DC012B] flex items-center justify-center mb-2">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="font-heading font-black text-sm text-[#18191F] dark:text-white block">
                Safety Certified
              </span>
              <p className="text-[11px] text-slate-500 leading-tight">EN-71 non-toxic, child-safe plastics.</p>
            </div>

            {/* Metric 3: Parent Reviews */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#1B1C24] border border-[#E8E2DE] dark:border-[#2E303E] shadow-xs space-y-1">
              <div className="w-8 h-8 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-[#F59E0B] flex items-center justify-center mb-2">
                <Star className="w-4 h-4 fill-current" />
              </div>
              <span className="font-heading font-black text-sm text-[#18191F] dark:text-white block">
                4.9/5 Rating
              </span>
              <p className="text-[11px] text-slate-500 leading-tight">12,000+ satisfied Bangladeshi parents.</p>
            </div>

            {/* Metric 4: Fast Dispatch */}
            <div className="p-4 rounded-2xl bg-white dark:bg-[#1B1C24] border border-[#E8E2DE] dark:border-[#2E303E] shadow-xs space-y-1">
              <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-950/50 text-[#8B5CF6] flex items-center justify-center mb-2">
                <Clock className="w-4 h-4" />
              </div>
              <span className="font-heading font-black text-sm text-[#18191F] dark:text-white block">
                24h Dispatch
              </span>
              <p className="text-[11px] text-slate-500 leading-tight">Dhaka delivery in 24h &bull; BD in 48-72h.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
