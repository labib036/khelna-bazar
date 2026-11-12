"use client";

import Link from "next/link";
import { useAuthStore } from "@/lib/auth-store";
import { useWishlistStore } from "@/lib/wishlist-store";
import { AccountNav } from "@/components/account/account-nav";
import { Button } from "@/components/ui/button";
import {
  Package,
  Heart,
  Sparkles,
  MapPin,
  Clock,
  ArrowRight,
  Truck,
  CheckCircle2,
} from "lucide-react";

export default function AccountOverviewPage() {
  const { user } = useAuthStore();
  const wishlistCount = useWishlistStore((state) => state.getCount());

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
                You Are Not Signed In
              </h1>
              <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
                Sign in to check your Cash on Delivery orders, view saved delivery addresses, and track your PlayPoints rewards balance.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link href="/login?redirect=/account">
                <Button variant="primary" size="md" className="bg-[#DC012B] hover:bg-[#B80023] font-bold text-xs shadow-xs">
                  <span>Sign In to Account</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" size="md" className="text-xs font-bold border-[#DC012B] text-[#DC012B] hover:bg-[#DC012B] hover:text-white">
                  <span>Create Free Account (100 Pts)</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Navigation Sidebar */}
        <AccountNav />

        {/* Right Dashboard Content */}
        <div className="flex-1 space-y-8 w-full">
          {/* Welcome Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#DC012B] to-[#7B5CFA] text-white shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-xs uppercase tracking-wider font-extrabold text-blue-200">
                Customer Dashboard
              </span>
              <h1 className="font-heading text-2xl sm:text-3xl font-black">
                Welcome back, {user?.name || "Friend"}!
              </h1>
              <p className="text-xs text-blue-100">
                You have <strong className="text-[#FFC93C]">{user?.loyaltyPoints || 350} PlayPoints</strong> ready
                to redeem for discounts on your next order.
              </p>
            </div>
            <Link href="/c/all" className="shrink-0">
              <Button variant="sun" size="sm" className="shadow-md">
                <span>Browse New Toys</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          {/* 4 Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link
              href="/account/orders"
              className="p-5 rounded-2xl bg-white dark:bg-[#1B1C24] border border-[#E8E2DE] dark:border-[#2E303E] hover:border-[#DC012B] transition-all hover:shadow-sm group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FFF0F2] text-[#DC012B] flex items-center justify-center mb-3">
                <Package className="w-5 h-5" />
              </div>
              <span className="text-xs text-slate-400 font-bold block">Recent Orders</span>
              <span className="font-heading font-black text-xl text-[#18191F] dark:text-white mt-1 block group-hover:text-[#DC012B]">
                2 Orders
              </span>
            </Link>

            <Link
              href="/wishlist"
              className="p-5 rounded-2xl bg-white dark:bg-[#1B1C24] border border-[#E8E2DE] dark:border-[#2E303E] hover:border-[#FF6B6B] transition-all hover:shadow-sm group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#FFF0F0] text-[#FF6B6B] flex items-center justify-center mb-3">
                <Heart className="w-5 h-5" />
              </div>
              <span className="text-xs text-slate-400 font-bold block">Saved Wishlist</span>
              <span className="font-heading font-black text-xl text-[#18191F] dark:text-white mt-1 block group-hover:text-[#FF6B6B]">
                {wishlistCount} Toys
              </span>
            </Link>

            <Link
              href="/account/rewards"
              className="p-5 rounded-2xl bg-white dark:bg-[#1B1C24] border border-[#E8E2DE] dark:border-[#2E303E] hover:border-[#7B5CFA] transition-all hover:shadow-sm group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#F3EFFF] text-[#7B5CFA] flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xs text-slate-400 font-bold block">PlayPoints</span>
              <span className="font-heading font-black text-xl text-[#18191F] dark:text-white mt-1 block group-hover:text-[#7B5CFA]">
                {user?.loyaltyPoints || 350} Pts
              </span>
            </Link>

            <Link
              href="/account/addresses"
              className="p-5 rounded-2xl bg-white dark:bg-[#1B1C24] border border-[#E8E2DE] dark:border-[#2E303E] hover:border-[#2EC4B6] transition-all hover:shadow-sm group"
            >
              <div className="w-10 h-10 rounded-xl bg-[#E6FAF8] text-[#2EC4B6] flex items-center justify-center mb-3">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="text-xs text-slate-400 font-bold block">Saved Addresses</span>
              <span className="font-heading font-black text-xl text-[#18191F] dark:text-white mt-1 block group-hover:text-[#2EC4B6]">
                2 Locations
              </span>
            </Link>
          </div>

          {/* Active Order Tracker Widget */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#1B1C24] border border-[#E8E2DE] dark:border-[#2E303E] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[#E8E2DE] dark:border-[#2E303E]">
              <div className="flex items-center gap-2">
                <Truck className="w-5 h-5 text-[#2EC4B6]" />
                <h3 className="font-heading font-black text-sm text-[#18191F] dark:text-white">
                  Active Cash on Delivery Package: #KB-100242
                </h3>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#E6FAF8] text-[#229D92] text-xs font-bold">
                In Transit &bull; Pathao Courier
              </span>
            </div>

            <p className="text-xs text-slate-500">
              Package handed over to courier in Dhaka hub. Expected arrival at your doorstep tomorrow afternoon.
              Amount to pay: <strong>৳2,970</strong>.
            </p>

            <Link href="/order/KB-100242">
              <Button variant="outline" size="sm" className="text-xs gap-1">
                <span>View Full Timeline &amp; Invoice</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
