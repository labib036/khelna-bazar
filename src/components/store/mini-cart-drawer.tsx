"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/button";
import {
  X,
  ShoppingBag,
  Plus,
  Minus,
  Trash2,
  Gift,
  Truck,
  ArrowRight,
  Sparkles,
  Tag,
} from "lucide-react";

export function MiniCartDrawer() {
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    updateQuantity,
    toggleGiftWrap,
    coupon,
    applyCoupon,
    removeCoupon,
    getSubtotal,
    getDiscount,
    getShippingFee,
    getGiftWrapFee,
    getTotal,
    getFreeShippingRemaining,
  } = useCartStore();

  const [couponInput, setCouponInput] = useState("");
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);

  if (!isOpen) return null;

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
    setCouponMessage({ text: res.message, isError: !res.success });
    if (res.success) setCouponInput("");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-xs transition-opacity duration-300"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white dark:bg-[#161D33] shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[#E3E8F2] dark:border-[#263050] flex items-center justify-between">
            <div className="flex items-center gap-2">
              <ShoppingBag className="w-5 h-5 text-[#1E5BFF]" />
              <h2 className="text-lg font-bold font-heading text-[#14213D] dark:text-white">
                Your Toy Basket ({items.reduce((acc, i) => acc + i.quantity, 0)})
              </h2>
            </div>
            <button
              onClick={closeCart}
              className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-full transition-colors cursor-pointer"
              aria-label="Close cart"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Free Shipping Progress Bar */}
          <div className="bg-[#F7F9FC] dark:bg-[#1E2742] px-5 py-3 border-b border-[#E3E8F2] dark:border-[#263050]">
            <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
              <div className="flex items-center gap-1.5 text-[#14213D] dark:text-slate-200">
                <Truck className="w-4 h-4 text-[#2EC4B6]" />
                {freeShippingRemaining > 0 ? (
                  <span>
                    Add <strong className="text-[#1E5BFF]">{formatPrice(freeShippingRemaining)}</strong> more for{" "}
                    <strong className="text-[#2EC4B6]">FREE Delivery</strong>!
                  </span>
                ) : (
                  <span className="text-[#2EC4B6] font-bold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Congratulations! You unlocked FREE Delivery.
                  </span>
                )}
              </div>
              <span className="font-bold text-slate-500">{progressPercent}%</span>
            </div>
            <div className="w-full bg-[#E3E8F2] dark:bg-[#263050] h-2 rounded-full overflow-hidden">
              <div
                className="bg-[#2EC4B6] h-full rounded-full transition-all duration-300"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <div className="w-20 h-20 rounded-full bg-[#EBF1FF] dark:bg-[#1E2D5A] flex items-center justify-center text-[#1E5BFF]">
                  <ShoppingBag className="w-10 h-10 stroke-[1.5]" />
                </div>
                <div>
                  <h3 className="font-heading text-lg font-bold text-[#14213D] dark:text-white">
                    Your basket is feeling lonely!
                  </h3>
                  <p className="text-sm text-slate-500 mt-1 max-w-xs">
                    Explore our certified safe toys, STEM robotics, and wooden blocks to fill it with joy.
                  </p>
                </div>
                <Button onClick={closeCart} variant="primary" size="md">
                  Start Toy Shopping
                </Button>
              </div>
            ) : (
              items.map((item) => (
                <div
                  key={item.id}
                  className="flex gap-3 pb-4 border-b border-[#E3E8F2] dark:border-[#263050] last:border-0"
                >
                  {/* Thumbnail */}
                  <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-[#E3E8F2] dark:border-[#263050]">
                    <Image
                      src={item.image}
                      alt={item.name}
                      fill
                      className="object-cover"
                      sizes="80px"
                    />
                  </div>

                  {/* Details */}
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start justify-between gap-2">
                        <Link
                          href={`/p/${item.productId}`}
                          onClick={closeCart}
                          className="text-sm font-semibold text-[#14213D] dark:text-white hover:text-[#1E5BFF] line-clamp-1"
                        >
                          {item.name}
                        </Link>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="text-slate-400 hover:text-[#FF6B6B] transition-colors p-1"
                          title="Remove item"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                      <p className="text-xs text-slate-500">{item.title}</p>
                    </div>

                    {/* Gift Wrap Toggle */}
                    <div className="flex items-center gap-1.5 my-1">
                      <button
                        onClick={() => toggleGiftWrap(item.id)}
                        className={`text-xs inline-flex items-center gap-1 px-2 py-0.5 rounded-md transition-colors cursor-pointer ${
                          item.giftWrap
                            ? "bg-[#FFF8E6] text-[#B88700] font-semibold border border-[#FFC93C]"
                            : "text-slate-400 hover:text-slate-600"
                        }`}
                      >
                        <Gift className="w-3 h-3" />
                        {item.giftWrap ? `Gift Wrapped (+${formatPrice(50)})` : "Add Gift Wrap (+৳50)"}
                      </button>
                    </div>

                    {/* Price and Stepper */}
                    <div className="flex items-center justify-between mt-1">
                      <span className="font-bold text-sm text-[#1E5BFF] dark:text-[#5B8CFF]">
                        {formatPrice(item.price * item.quantity)}
                      </span>

                      {/* Quantity Stepper */}
                      <div className="flex items-center border border-[#E3E8F2] dark:border-[#263050] rounded-full bg-white dark:bg-[#161D33] overflow-hidden">
                        <button
                          onClick={() => updateQuantity(item.id, -1)}
                          className="p-1.5 text-slate-500 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E2742] transition-colors cursor-pointer"
                          aria-label="Decrease quantity"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="px-2 text-xs font-bold text-[#14213D] dark:text-white select-none">
                          {item.quantity}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.id, 1)}
                          className="p-1.5 text-slate-500 hover:text-black dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#1E2742] transition-colors cursor-pointer"
                          aria-label="Increase quantity"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer & Order Summary */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-[#E3E8F2] dark:border-[#263050] bg-[#F7F9FC] dark:bg-[#1E2742] space-y-3">
              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Enter coupon (e.g. PLAY10)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="w-full text-xs h-9 pl-9 pr-3 rounded-xl border border-[#E3E8F2] dark:border-[#263050] bg-white dark:bg-[#161D33] text-[#14213D] dark:text-white uppercase placeholder:normal-case focus:outline-none focus:border-[#1E5BFF]"
                  />
                </div>
                <Button type="submit" variant="secondary" size="sm" className="rounded-xl h-9">
                  Apply
                </Button>
              </form>

              {couponMessage && (
                <p className={`text-xs ${couponMessage.isError ? "text-[#FF6B6B]" : "text-[#2EC4B6]"} font-medium`}>
                  {couponMessage.text}
                </p>
              )}

              {coupon && (
                <div className="flex items-center justify-between text-xs bg-[#E6FAF8] dark:bg-[#0E3834] text-[#229D92] dark:text-[#4DD9CB] p-2 rounded-lg">
                  <span className="font-semibold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Coupon ({coupon.code}) Applied
                  </span>
                  <div className="flex items-center gap-2">
                    <span>-{formatPrice(coupon.discountAmount)}</span>
                    <button
                      onClick={removeCoupon}
                      className="text-slate-400 hover:text-[#FF6B6B]"
                      title="Remove coupon"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-semibold text-[#14213D] dark:text-white">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[#2EC4B6]">
                    <span>Coupon Savings</span>
                    <span className="font-semibold">-{formatPrice(discount)}</span>
                  </div>
                )}
                {giftWrapFee > 0 && (
                  <div className="flex justify-between">
                    <span>Gift Wrapping</span>
                    <span>+{formatPrice(giftWrapFee)}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span>Cash on Delivery (Estimated)</span>
                  <span>{shippingFee === 0 ? <strong className="text-[#2EC4B6]">FREE</strong> : formatPrice(shippingFee)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[#14213D] dark:text-white pt-2 border-t border-[#E3E8F2] dark:border-[#263050]">
                  <span>Total Amount</span>
                  <span className="text-base text-[#1E5BFF] dark:text-[#5B8CFF]">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <Link href="/checkout" onClick={closeCart} className="block w-full">
                  <Button variant="sun" size="lg" className="w-full text-sm font-bold shadow-md">
                    <span>Proceed to Cash on Delivery</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
                <Link href="/cart" onClick={closeCart} className="block w-full text-center">
                  <Button variant="ghost" size="sm" className="w-full text-xs text-slate-500">
                    View & Edit Full Cart
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
