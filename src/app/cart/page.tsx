"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import {
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Gift,
  Truck,
  ArrowRight,
  Sparkles,
  Tag,
  ShieldCheck,
  RotateCcw,
  X,
} from "lucide-react";
import { toast } from "sonner";

export default function CartPage() {
  const {
    items,
    removeItem,
    restoreLastRemovedItem,
    lastRemovedItem,
    updateQuantity,
    toggleGiftWrap,
    coupon,
    applyCoupon,
    removeCoupon,
    deliveryZone,
    setDeliveryZone,
    getSubtotal,
    getDiscount,
    getShippingFee,
    getGiftWrapFee,
    getTotal,
    getFreeShippingRemaining,
  } = useCartStore();

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const shippingFee = getShippingFee();
  const giftWrapFee = getGiftWrapFee();
  const total = getTotal();
  const freeShippingRemaining = getFreeShippingRemaining();
  const threshold = siteConfig.shippingDefaults.freeShippingThreshold;
  const progressPercent = Math.min(100, Math.round(((threshold - freeShippingRemaining) / threshold) * 100));

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = applyCoupon(couponInput);
    if (res.success) {
      toast.success(res.message);
      setCouponInput("");
      setCouponError(null);
    } else {
      setCouponError(res.message);
    }
  };

  const handleRemove = (id: string, name: string) => {
    removeItem(id);
    toast("Item removed from basket", {
      action: {
        label: "Undo",
        onClick: () => restoreLastRemovedItem(),
      },
    });
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="max-w-md mx-auto text-center space-y-4 p-8 rounded-3xl bg-white dark:bg-[#161D33] border border-[#E8E2DE] dark:border-[#263050] shadow-sm">
          <div className="w-20 h-20 rounded-full bg-[#FFF0F2] dark:bg-[#3D000B] text-[#DC012B] flex items-center justify-center mx-auto">
            <ShoppingBag className="w-10 h-10" />
          </div>
          <h1 className="font-heading text-2xl font-black text-[#18191F] dark:text-white">
            Your Toy Basket is Empty
          </h1>
          <p className="text-xs sm:text-sm text-slate-500">
            Looks like you haven't added any joy to your cart yet. Discover our certified safe toys and building sets!
          </p>
          <Link href="/c/all" className="inline-block pt-2">
            <Button variant="primary" size="lg">
              <span>Start Exploring Toys</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="font-heading text-2xl sm:text-4xl font-black text-[#18191F] dark:text-white">
          Review Your Toy Basket
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1">
          {items.reduce((acc, i) => acc + i.quantity, 0)} item{items.length === 1 ? "" : "s"} &bull; Cash on Delivery across Bangladesh
        </p>
      </div>

      {/* Free Shipping Progress Box */}
      <div className="p-4 rounded-2xl bg-white dark:bg-[#161D33] border border-[#E8E2DE] dark:border-[#263050] shadow-xs">
        <div className="flex items-center justify-between text-xs font-semibold mb-2">
          <div className="flex items-center gap-2">
            <Truck className="w-4 h-4 text-[#2EC4B6]" />
            {freeShippingRemaining > 0 ? (
              <span>
                Add <strong className="text-[#DC012B]">{formatPrice(freeShippingRemaining)}</strong> more for{" "}
                <strong className="text-[#2EC4B6]">FREE Nationwide Delivery</strong>!
              </span>
            ) : (
              <span className="text-[#2EC4B6] font-bold flex items-center gap-1">
                <Sparkles className="w-4 h-4" /> You've unlocked FREE Delivery across Bangladesh!
              </span>
            )}
          </div>
          <span className="text-slate-400 font-bold">{progressPercent}%</span>
        </div>
        <div className="w-full bg-slate-100 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
          <div
            className="bg-[#2EC4B6] h-full rounded-full transition-all duration-300"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left: Line Items (8 Cols) */}
        <div className="lg:col-span-8 bg-white dark:bg-[#161D33] rounded-3xl border border-[#E8E2DE] dark:border-[#263050] divide-y divide-[#E8E2DE] dark:divide-[#263050] shadow-xs">
          {items.map((item) => (
            <div key={item.id} className="p-5 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6">
              {/* Product Thumbnail */}
              <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-[#E8E2DE] dark:border-[#263050]">
                <Image src={item.image} alt={item.name} fill className="object-cover" sizes="120px" />
              </div>

              {/* Details & Controls */}
              <div className="flex-1 flex flex-col justify-between space-y-3">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link
                      href={`/p/${item.productId}`}
                      className="font-heading text-sm sm:text-base font-bold text-[#18191F] dark:text-white hover:text-[#DC012B] transition-colors line-clamp-1"
                    >
                      {item.name}
                    </Link>
                    <p className="text-xs text-slate-500 mt-0.5 font-medium">{item.title}</p>
                    <span className="text-[10px] text-slate-400 font-mono">SKU: {item.sku}</span>
                  </div>

                  <button
                    onClick={() => handleRemove(item.id, item.name)}
                    className="p-1.5 text-slate-400 hover:text-[#FF6B6B] transition-colors rounded-lg cursor-pointer"
                    title="Remove item"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Gift Wrap Button */}
                <div>
                  <button
                    onClick={() => toggleGiftWrap(item.id)}
                    className={`text-xs inline-flex items-center gap-1.5 px-3 py-1 rounded-xl transition-colors cursor-pointer ${
                      item.giftWrap
                        ? "bg-[#FFF8E6] text-[#B88700] font-bold border border-[#FFC93C]"
                        : "text-slate-500 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200"
                    }`}
                  >
                    <Gift className="w-3.5 h-3.5" />
                    <span>{item.giftWrap ? `Gift Wrapped (+${formatPrice(50)})` : "Add Gift Wrap (+৳50)"}</span>
                  </button>
                </div>

                {/* Price and Stepper Row */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center border border-[#E8E2DE] dark:border-[#263050] rounded-full bg-slate-50 dark:bg-[#1E2742] overflow-hidden">
                    <button
                      onClick={() => updateQuantity(item.id, -1)}
                      className="p-2 text-slate-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                      aria-label="Decrease quantity"
                    >
                      <Minus className="w-3.5 h-3.5" />
                    </button>
                    <span className="px-3 text-xs font-bold text-[#18191F] dark:text-white select-none">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, 1)}
                      className="p-2 text-slate-500 hover:text-black dark:hover:text-white transition-colors cursor-pointer"
                      aria-label="Increase quantity"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="text-right">
                    <span className="text-base sm:text-lg font-black text-[#18191F] dark:text-white">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                    {item.quantity > 1 && (
                      <span className="text-[10px] text-slate-400 block">
                        ({formatPrice(item.price)} each)
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Right: Sticky Summary Box (4 Cols) */}
        <div className="lg:col-span-4 sticky top-24 space-y-4">
          <div className="bg-white dark:bg-[#161D33] rounded-3xl border border-[#E8E2DE] dark:border-[#263050] p-6 shadow-xs space-y-5">
            <h2 className="font-heading text-lg font-black text-[#18191F] dark:text-white pb-3 border-b border-[#E8E2DE] dark:border-[#263050]">
              Order Summary
            </h2>

            {/* Delivery Destination Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Delivery Location
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                <button
                  onClick={() => setDeliveryZone("inside_dhaka")}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    deliveryZone === "inside_dhaka"
                      ? "bg-[#DC012B] text-white border-[#DC012B]"
                      : "border-[#E8E2DE] dark:border-[#263050] text-[#18191F] dark:text-white hover:border-[#DC012B]"
                  }`}
                >
                  Inside Dhaka (৳60)
                </button>
                <button
                  onClick={() => setDeliveryZone("outside_dhaka")}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    deliveryZone === "outside_dhaka"
                      ? "bg-[#DC012B] text-white border-[#DC012B]"
                      : "border-[#E8E2DE] dark:border-[#263050] text-[#18191F] dark:text-white hover:border-[#DC012B]"
                  }`}
                >
                  Outside Dhaka (৳120)
                </button>
              </div>
            </div>

            {/* Coupon Code Input */}
            <div className="space-y-2">
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Coupon code (e.g. PLAY10)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="w-full text-xs h-10 pl-9 pr-3 rounded-xl border border-[#E8E2DE] dark:border-[#263050] bg-slate-50 dark:bg-[#1E2742] text-[#18191F] dark:text-white uppercase placeholder:normal-case focus:outline-none focus:border-[#DC012B]"
                  />
                </div>
                <Button type="submit" variant="secondary" size="sm" className="rounded-xl h-10">
                  Apply
                </Button>
              </form>

              {couponError && <p className="text-xs text-[#FF6B6B] font-medium">{couponError}</p>}

              {coupon && (
                <div className="flex items-center justify-between text-xs bg-[#E6FAF8] dark:bg-[#0E3834] text-[#229D92] dark:text-[#4DD9CB] p-2.5 rounded-xl">
                  <span className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> Coupon {coupon.code} Applied
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">-{formatPrice(coupon.discountAmount)}</span>
                    <button onClick={removeCoupon} className="text-slate-400 hover:text-[#FF6B6B]">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Breakdown */}
            <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-2 border-t border-[#E8E2DE] dark:border-[#263050]">
              <div className="flex justify-between">
                <span>Items Subtotal</span>
                <span className="font-bold text-[#18191F] dark:text-white">{formatPrice(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-[#2EC4B6]">
                  <span>Coupon Discount</span>
                  <span className="font-bold">-{formatPrice(discount)}</span>
                </div>
              )}

              {giftWrapFee > 0 && (
                <div className="flex justify-between">
                  <span>Gift Wrapping</span>
                  <span className="font-bold">+{formatPrice(giftWrapFee)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>Cash on Delivery Fee</span>
                <span className="font-bold text-[#18191F] dark:text-white">
                  {shippingFee === 0 ? <strong className="text-[#2EC4B6]">FREE</strong> : formatPrice(shippingFee)}
                </span>
              </div>

              <div className="flex justify-between text-base font-black text-[#18191F] dark:text-white pt-3 border-t border-[#E8E2DE] dark:border-[#263050]">
                <span>Total Amount Due</span>
                <span className="text-xl text-[#DC012B] dark:text-[#5B8CFF]">{formatPrice(total)}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <Link href="/checkout" className="block w-full">
              <Button variant="sun" size="lg" className="w-full text-sm font-extrabold shadow-md">
                <span>Proceed to Cash on Delivery</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>

            {/* Trust Assurances */}
            <div className="space-y-2 pt-2 text-[11px] text-slate-500">
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-[#2EC4B6]" />
                <span>Pay cash directly to courier at your door</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[#DC012B]" />
                <span>100% Genuine, tested, and child-safe toys</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
