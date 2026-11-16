"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { useWishlistStore } from "@/lib/wishlist-store";
import { getCustomerOrders } from "@/server/actions/order-actions";
import { StoreOrder } from "@/types/store";
import { formatPrice } from "@/lib/utils";
import { AccountNav } from "@/components/account/account-nav";
import { Button } from "@/components/ui/button";
import {
  Package,
  Heart,
  Sparkles,
  MapPin,
  ArrowRight,
  Truck,
  Loader2,
  Check,
  Box,
  Home,
  Navigation,
  Phone,
  Gift,
  Copy,
  Cake,
  RotateCcw,
  ShoppingBag,
} from "lucide-react";
import { toast } from "sonner";

export default function AccountOverviewPage() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [copiedReferral, setCopiedReferral] = useState(false);
  const wishlistCount = useWishlistStore((state) => state.getCount());

  useEffect(() => {
    if (status === "authenticated") {
      getCustomerOrders()
        .then((data) => setOrders(data))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  const copyReferralCode = () => {
    const code = user?.name ? `${user.name.split(" ")[0].toUpperCase()}-JOY100` : "JOY-TOY100";
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(code);
      setCopiedReferral(true);
      toast.success("Referral code copied to clipboard!");
      setTimeout(() => setCopiedReferral(false), 2000);
    }
  };

  if (status === "loading" || loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-24 text-center text-xs text-[var(--text-muted)] flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-[var(--primary)]" />
        <span>Loading account overview...</span>
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
                You Are Not Signed In
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                Sign in to check your Cash on Delivery orders, view saved delivery addresses, and track your purchase history.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link href="/login?redirect=/account">
                <Button variant="primary" size="md" className="font-bold text-xs shadow-[0_4px_0_#93000E]">
                  <span>Sign In to Account</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" size="md" className="text-xs font-bold border-[var(--primary)] text-[var(--primary)]">
                  <span>Create Free Account</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const activeOrder = orders.find((o) => o.status !== "DELIVERED" && o.status !== "CANCELLED") || orders[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Left Navigation Sidebar */}
        <AccountNav />

        {/* Right Dashboard Content */}
        <div className="flex-1 space-y-8 w-full min-w-0">
          {/* Welcome Grand Hero Banner */}
          <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] p-6 sm:p-8 bg-gradient-to-r from-[var(--primary)]/15 via-[var(--surface-container-low)] to-[var(--secondary-container)]/30 shadow-xs">
            <div className="absolute -right-12 -top-12 w-64 h-64 bg-[var(--secondary-container)]/25 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute right-1/3 -bottom-16 w-56 h-56 bg-[var(--primary)]/15 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 bg-[var(--surface)]/90 backdrop-blur-md px-3.5 py-1 rounded-full shadow-xs border border-[var(--border)]">
                  <Sparkles className="w-4 h-4 text-[var(--secondary-container)] fill-current" />
                  <span className="text-xs font-bold text-[var(--text-primary)]">Wonder Explorer Tier</span>
                  <span className="text-[var(--text-muted)]">•</span>
                  <span className="text-xs font-extrabold text-[var(--primary)]">1,450 PlayPoints 🌟</span>
                </div>
                <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--text-primary)] tracking-tight">
                  Welcome back, {user?.name?.split(" ")[0] || "Friend"}! 👋
                </h1>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-xl leading-relaxed">
                  Track your magical parcels, redeem toy tokens for checkout discounts, and discover age-curated delights for your family.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <a
                  href="#active-tracker"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[var(--primary)] text-[var(--on-primary)] font-bold text-xs shadow-[0_4px_0_#93000E] active:translate-y-0.5 transition-all"
                >
                  <Truck className="w-4 h-4" />
                  <span>Track Active Order</span>
                </a>
                <Link
                  href="/c/all"
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-[var(--surface)] text-[var(--text-primary)] hover:bg-[var(--surface-container-high)] font-bold text-xs border border-[var(--border)] transition-all shadow-xs"
                >
                  <ShoppingBag className="w-4 h-4 text-[var(--primary)]" />
                  <span>Browse Toys</span>
                </Link>
              </div>
            </div>
          </div>

          {/* 4 Stat Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Link
              href="/account/orders"
              className="p-5 rounded-2xl bg-[var(--surface-container-low)] border border-[var(--border)] hover:border-[var(--primary)] transition-all shadow-xs hover:shadow-sm group"
            >
              <div className="w-10 h-10 rounded-xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center mb-3">
                <Package className="w-5 h-5" />
              </div>
              <span className="text-xs text-[var(--text-muted)] font-bold block">Order History</span>
              <span className="font-heading font-black text-xl text-[var(--text-primary)] mt-0.5 block group-hover:text-[var(--primary)]">
                {orders.length} {orders.length === 1 ? "Parcel" : "Parcels"}
              </span>
            </Link>

            <Link
              href="/wishlist"
              className="p-5 rounded-2xl bg-[var(--surface-container-low)] border border-[var(--border)] hover:border-[var(--primary)] transition-all shadow-xs hover:shadow-sm group"
            >
              <div className="w-10 h-10 rounded-xl bg-rose-500/10 text-rose-500 flex items-center justify-center mb-3">
                <Heart className="w-5 h-5" />
              </div>
              <span className="text-xs text-[var(--text-muted)] font-bold block">Wishlist Shelves</span>
              <span className="font-heading font-black text-xl text-[var(--text-primary)] mt-0.5 block group-hover:text-rose-500">
                {wishlistCount} Toys
              </span>
            </Link>

            <Link
              href="/account/rewards"
              className="p-5 rounded-2xl bg-[var(--surface-container-low)] border border-[var(--border)] hover:border-[var(--secondary-container)] transition-all shadow-xs hover:shadow-sm group"
            >
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-600 flex items-center justify-center mb-3">
                <Sparkles className="w-5 h-5" />
              </div>
              <span className="text-xs text-[var(--text-muted)] font-bold block">PlayPoints Balance</span>
              <span className="font-heading font-black text-xl text-[var(--text-primary)] mt-0.5 block group-hover:text-amber-600">
                1,450 pts
              </span>
            </Link>

            <Link
              href="/account/addresses"
              className="p-5 rounded-2xl bg-[var(--surface-container-low)] border border-[var(--border)] hover:border-[var(--accent)] transition-all shadow-xs hover:shadow-sm group"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-500/10 text-[var(--accent)] flex items-center justify-center mb-3">
                <MapPin className="w-5 h-5" />
              </div>
              <span className="text-xs text-[var(--text-muted)] font-bold block">Delivery Address</span>
              <span className="font-heading font-black text-xl text-[var(--text-primary)] mt-0.5 block group-hover:text-[var(--accent)]">
                Dhaka &amp; BD
              </span>
            </Link>
          </div>

          {/* Active Order Live Tracker */}
          <section
            id="active-tracker"
            className="p-6 sm:p-7 rounded-3xl bg-[var(--surface-container-low)] border border-[var(--border)] shadow-xs space-y-6"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="px-3 py-0.5 rounded-full bg-[var(--primary)] text-[var(--on-primary)] font-extrabold text-[10px] uppercase tracking-wider shadow-xs">
                    Live Dispatch Status
                  </span>
                  <span className="text-xs font-bold text-[var(--text-muted)]">
                    Order #{activeOrder ? activeOrder.orderNumber : "KB-84920"}
                  </span>
                </div>
                <h2 className="font-heading font-black text-lg sm:text-xl text-[var(--text-primary)]">
                  {activeOrder?.items?.[0]?.name || "Montessori STEM Sensory Puzzle Set + Toy Cars"}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right sm:block">
                  <div className="font-heading font-bold text-xs text-[var(--text-primary)]">
                    Est. Delivery: Tomorrow by 5:00 PM
                  </div>
                  <div className="text-[11px] text-[var(--text-muted)]">
                    Courier: Steadfast Express • Dhaka Metro
                  </div>
                </div>
              </div>
            </div>

            {/* Stepper Timeline */}
            <div className="relative py-4">
              <div className="relative flex items-center justify-between w-full">
                {/* Background Line */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-2 bg-[var(--surface-container-high)] w-full rounded-full z-0" />
                {/* Active Progress Fill */}
                <div className="absolute left-0 top-1/2 -translate-y-1/2 h-2 bg-gradient-to-r from-[var(--primary)] via-[var(--primary)] to-[var(--secondary-container)] w-3/4 rounded-full z-0 transition-all duration-700" />

                {/* Step 1: Confirmed */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-[var(--primary)] text-[var(--on-primary)] flex items-center justify-center shadow-md">
                    <Check className="w-5 h-5" />
                  </div>
                  <span className="font-heading font-bold text-xs text-[var(--text-primary)] mt-2">Confirmed</span>
                  <span className="text-[10px] text-[var(--text-muted)]">9:15 AM</span>
                </div>

                {/* Step 2: Magic Packed */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-[var(--primary)] text-[var(--on-primary)] flex items-center justify-center shadow-md">
                    <Box className="w-5 h-5" />
                  </div>
                  <span className="font-heading font-bold text-xs text-[var(--text-primary)] mt-2">Magic Packed</span>
                  <span className="text-[10px] text-[var(--text-muted)]">11:30 AM</span>
                </div>

                {/* Step 3: On Van (Active Pulse) */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-12 h-12 rounded-full bg-[var(--secondary-container)] text-[var(--on-secondary-container)] flex items-center justify-center shadow-md ring-4 ring-amber-400/40 animate-pulse">
                    <Truck className="w-6 h-6" />
                  </div>
                  <span className="font-heading font-extrabold text-xs text-amber-700 dark:text-amber-400 mt-1">On Van 🚚</span>
                  <span className="text-[10px] font-bold text-amber-700 dark:text-amber-400">1:45 PM</span>
                </div>

                {/* Step 4: Delivered */}
                <div className="relative z-10 flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-[var(--surface-container-high)] text-[var(--text-muted)] flex items-center justify-center">
                    <Home className="w-5 h-5" />
                  </div>
                  <span className="font-heading font-bold text-xs text-[var(--text-muted)] mt-2">Delivered</span>
                  <span className="text-[10px] text-[var(--text-muted)]">Est. 5:00 PM</span>
                </div>
              </div>
            </div>

            {/* Courier & Note Banner */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center bg-[var(--surface)] rounded-2xl p-4 border border-[var(--border)]">
              <div className="md:col-span-8 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="w-full sm:w-36 h-20 rounded-xl bg-[var(--primary)]/10 relative overflow-hidden flex items-center justify-center shrink-0">
                  <div className="flex flex-col items-center gap-1 text-[var(--primary)]">
                    <Navigation className="w-5 h-5 animate-pulse" />
                    <span className="text-[10px] font-extrabold uppercase tracking-wider">Live GPS</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <div className="font-heading font-black text-sm text-[var(--text-primary)]">
                    Courier Rider: Kabir • +880 1712-345678
                  </div>
                  <p className="text-xs text-[var(--text-muted)]">
                    Destination: {activeOrder?.shippingAddress?.line1 || "Dhanmondi 27, Dhaka"}. Cash on Delivery:{" "}
                    <strong className="text-[var(--text-primary)]">{formatPrice(activeOrder?.total || 2450)}</strong>
                  </p>
                  <div className="flex items-center gap-3 pt-1 text-xs">
                    <a
                      href="tel:+8801712345678"
                      className="inline-flex items-center gap-1 font-bold text-[var(--primary)] hover:underline"
                    >
                      <Phone className="w-3.5 h-3.5" />
                      <span>Call Courier</span>
                    </a>
                  </div>
                </div>
              </div>

              <div className="md:col-span-4 flex items-center justify-end gap-2">
                {activeOrder ? (
                  <Link href={`/order/${activeOrder.id}`}>
                    <Button variant="outline" size="sm" className="font-bold text-xs gap-1">
                      <span>Full Timeline</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/account/orders">
                    <Button variant="outline" size="sm" className="font-bold text-xs gap-1">
                      <span>View Orders</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          </section>

          {/* Rewards Wallet & Referral Grid */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            {/* PlayPoints Rewards Wallet */}
            <div className="md:col-span-7 bg-[var(--surface-container-low)] rounded-3xl p-6 border border-[var(--border)] shadow-xs flex flex-col justify-between space-y-5">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-amber-500/15 text-amber-600 flex items-center justify-center">
                      <Sparkles className="w-4 h-4" />
                    </div>
                    <h3 className="font-heading font-black text-base text-[var(--text-primary)]">
                      PlayPoints Rewards Wallet
                    </h3>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-[var(--secondary-container)] text-[var(--on-secondary-container)] font-extrabold text-xs">
                    ৳145 Toy Credit
                  </span>
                </div>

                <div className="bg-[var(--surface)] rounded-2xl p-4 mb-4 flex items-center justify-between border border-[var(--border)]">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
                      Current Points Balance
                    </span>
                    <div className="font-heading font-black text-3xl sm:text-4xl text-[var(--primary)] leading-none mt-1">
                      1,450
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-1">
                      Earn 1 pt for every ৳10 spent. Redeem anytime at checkout!
                    </p>
                  </div>
                  <Link href="/account/rewards">
                    <button
                      type="button"
                      className="shrink-0 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--on-primary)] px-4 py-2 rounded-full font-bold text-xs shadow-[0_3px_0_#93000E] active:translate-y-0.5 transition-all"
                    >
                      Redeem
                    </button>
                  </Link>
                </div>

                {/* Tier Progress */}
                <div className="space-y-1.5">
                  <div className="flex justify-between text-xs font-bold">
                    <span className="text-[var(--text-muted)]">Tier Progress: Silver (850 pts to Gold)</span>
                    <span className="text-[var(--primary)]">63%</span>
                  </div>
                  <div className="w-full h-2.5 bg-[var(--surface-container-high)] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[var(--secondary-container)] to-amber-600 rounded-full"
                      style={{ width: "63%" }}
                    />
                  </div>
                </div>

                {/* 3 Tier Cards */}
                <div className="grid grid-cols-3 gap-2 mt-4 text-center">
                  <div className="p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
                    <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold">Bronze</span>
                    <div className="font-bold text-xs text-[var(--text-primary)] mt-0.5">1x Points</div>
                    <span className="text-[10px] text-emerald-600 font-bold block mt-0.5">✓ Achieved</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/30">
                    <span className="text-[10px] text-[var(--primary)] uppercase font-bold">Silver (Active)</span>
                    <div className="font-bold text-xs text-[var(--text-primary)] mt-0.5">1.5x + Bday Gift</div>
                    <span className="text-[10px] text-[var(--primary)] font-bold block mt-0.5">Current Tier</span>
                  </div>
                  <div className="p-2.5 rounded-xl bg-[var(--surface)] opacity-70 border border-[var(--border)]">
                    <span className="text-[10px] text-[var(--text-muted)] uppercase font-bold">Gold (2.3k)</span>
                    <div className="font-bold text-xs text-[var(--text-primary)] mt-0.5">Free Express BD</div>
                    <span className="text-[10px] text-[var(--text-muted)] font-bold block mt-0.5">Locked</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Parent Referral Card */}
            <div className="md:col-span-5 bg-gradient-to-br from-[var(--primary)] via-[var(--primary-container)] to-[#87000d] text-[var(--on-primary)] rounded-3xl p-6 shadow-sm flex flex-col justify-between relative overflow-hidden space-y-4">
              <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-[var(--secondary-container)]/20 rounded-full blur-xl pointer-events-none" />

              <div>
                <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider mb-2 text-amber-200">
                  <Gift className="w-3.5 h-3.5" />
                  <span>Parent Referral Club</span>
                </div>
                <h3 className="font-heading font-black text-xl text-white">
                  Give ৳100, Get ৳100 in Toy Credits
                </h3>
                <p className="text-xs text-white/80 mt-1 leading-relaxed">
                  Share the wonder with friends and preschool classmates. When they place their first Cash on Delivery order, you both get ৳100!
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex items-center bg-white/15 backdrop-blur-md p-1.5 rounded-full border border-white/25">
                  <span className="font-mono text-xs font-bold text-white px-3 truncate flex-1">
                    {user?.name ? `${user.name.split(" ")[0].toUpperCase()}-JOY100` : "JOY-TOY100"}
                  </span>
                  <button
                    onClick={copyReferralCode}
                    type="button"
                    className="px-3.5 py-1.5 rounded-full bg-[var(--secondary-container)] text-[var(--on-secondary-container)] text-xs font-extrabold hover:bg-amber-400 transition-all shadow-xs shrink-0 flex items-center gap-1"
                  >
                    <Copy className="w-3 h-3" />
                    <span>{copiedReferral ? "Copied!" : "Copy Code"}</span>
                  </button>
                </div>
                <div className="flex items-center justify-between text-white/80 text-[11px] px-2 font-bold">
                  <span>3 friends joined this month</span>
                  <span className="text-amber-300 font-extrabold">+৳300 earned</span>
                </div>
              </div>
            </div>
          </div>

          {/* Child Birthday Club */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
                  <Cake className="w-4 h-4" />
                </div>
                <h3 className="font-heading font-black text-lg text-[var(--text-primary)]">
                  Child Birthday Club
                </h3>
              </div>
              <Link href="/account/rewards" className="text-xs font-bold text-[var(--primary)] hover:underline">
                Manage Profiles
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Profile 1 */}
              <div className="bg-[var(--surface-container-low)] rounded-3xl p-5 border-l-4 border-l-[var(--secondary-container)] border border-[var(--border)] space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-[var(--secondary-container)] text-[var(--on-secondary-container)] flex items-center justify-center font-heading text-lg font-black shadow-xs">
                      L
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-heading font-bold text-sm text-[var(--text-primary)]">Labib Jr.</h4>
                        <span className="px-2 py-0.5 rounded-full bg-[var(--surface-container-high)] text-[var(--text-primary)] text-[10px] font-bold">
                          Age 4
                        </span>
                      </div>
                      <span className="text-xs text-[var(--primary)] font-bold flex items-center gap-1 mt-0.5">
                        <Cake className="w-3.5 h-3.5" />
                        Birthday in 14 days! 🎂
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[var(--secondary-container)] text-[var(--on-secondary-container)] text-[10px] font-black uppercase">
                    Gift Ready
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Interests: Wooden Train Tracks, Solar Robots &amp; Construction Sets. Qualifies for complimentary Birthday Gift Wrap!
                </p>
                <div className="flex items-center gap-2">
                  <Link href="/c/all?age=3-5y" className="flex-1">
                    <button
                      type="button"
                      className="w-full bg-[var(--secondary-container)] text-[var(--on-secondary-container)] hover:bg-amber-400 text-xs font-bold py-2 px-3 rounded-full shadow-[0_3px_0_#9a6b00] active:translate-y-0.5 transition-all text-center"
                    >
                      Curated Age 4 Wonders
                    </button>
                  </Link>
                </div>
              </div>

              {/* Profile 2 */}
              <div className="bg-[var(--surface-container-low)] rounded-3xl p-5 border-l-4 border-l-[var(--primary)] border border-[var(--border)] space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full bg-[var(--primary)] text-[var(--on-primary)] flex items-center justify-center font-heading text-lg font-black shadow-xs">
                      S
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="font-heading font-bold text-sm text-[var(--text-primary)]">Sara</h4>
                        <span className="px-2 py-0.5 rounded-full bg-[var(--surface-container-high)] text-[var(--text-primary)] text-[10px] font-bold">
                          Age 7
                        </span>
                      </div>
                      <span className="text-xs text-[var(--text-muted)] flex items-center gap-1 mt-0.5">
                        Birthday in July
                      </span>
                    </div>
                  </div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-[10px] font-black uppercase">
                    STEM Explorer
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Interests: Robotic kits, Montessori geometry puzzles &amp; Art crafts. 4 saved toys on her wishlist shelf.
                </p>
                <div className="flex items-center gap-2">
                  <Link href="/c/all?age=6-8y" className="flex-1">
                    <button
                      type="button"
                      className="w-full bg-[var(--surface-container-high)] text-[var(--text-primary)] hover:bg-[var(--surface-container)] text-xs font-bold py-2 px-3 rounded-full transition-all text-center"
                    >
                      Curated Age 7 Wonders
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Recent Orders History */}
          <section className="bg-[var(--surface-container-low)] rounded-3xl p-6 border border-[var(--border)] shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <div>
                <h3 className="font-heading font-black text-lg text-[var(--text-primary)]">
                  Recent Orders
                </h3>
                <p className="text-xs text-[var(--text-muted)]">
                  Track delivery progress, review toys, or order again.
                </p>
              </div>
              <Link
                href="/account/orders"
                className="inline-flex items-center gap-1 text-xs font-bold text-[var(--primary)] hover:underline"
              >
                <span>View All ({orders.length})</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {orders.length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <Package className="w-10 h-10 text-[var(--text-muted)] mx-auto opacity-40" />
                <p className="text-xs text-[var(--text-muted)]">
                  No orders placed yet. Start your family's toy adventure today!
                </p>
                <Link href="/c/all">
                  <Button variant="primary" size="sm" className="font-bold text-xs shadow-[0_3px_0_#93000E]">
                    Explore Catalog
                  </Button>
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.slice(0, 3).map((order) => (
                  <div
                    key={order.id}
                    className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-[var(--text-primary)]">
                          #{order.orderNumber}
                        </span>
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${
                            order.status === "DELIVERED"
                              ? "bg-emerald-500/15 text-emerald-600"
                              : "bg-blue-500/15 text-blue-600"
                          }`}
                        >
                          {order.status.replace(/_/g, " ")}
                        </span>
                      </div>
                      <div className="text-xs text-[var(--text-muted)]">
                        {order.items?.length || 1} items • Total:{" "}
                        <strong className="text-[var(--text-primary)]">{formatPrice(order.total)}</strong> (Cash on Delivery)
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Link href={`/order/${order.id}`}>
                        <Button variant="outline" size="sm" className="text-xs font-bold">
                          Details
                        </Button>
                      </Link>
                      <Link href="/c/all">
                        <Button
                          variant="primary"
                          size="sm"
                          className="text-xs font-bold shadow-[0_3px_0_#93000E] gap-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Buy Again</span>
                        </Button>
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </div>
    </div>
  );
}