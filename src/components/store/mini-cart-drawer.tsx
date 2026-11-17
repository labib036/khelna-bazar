"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore, SHIPPING_CONFIG } from "@/lib/cart-store";
import { useLockBodyScroll } from "@/lib/use-lock-body-scroll";
import { formatPrice } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { EmptyCartIllustration } from "@/components/ui/illustrations";
import { toast } from "sonner";
import confetti from "canvas-confetti";
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
  const { t, locale } = useLanguage();
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
    undoRemove,
  } = useCartStore();

  const [couponInput, setCouponInput] = useState("");
  const [couponMessage, setCouponMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [hasCelebratedFreeShipping, setHasCelebratedFreeShipping] = useState(false);

  // Reference counted safe scroll lock
  useLockBodyScroll(isOpen);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCart();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeCart]);

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const shippingFee = getShippingFee();
  const giftWrapFee = getGiftWrapFee();
  const total = getTotal();
  const freeShippingRemaining = getFreeShippingRemaining();
  const threshold = SHIPPING_CONFIG.freeShippingThreshold;
  const progressPercent = Math.min(100, Math.max(0, Math.round(((threshold - freeShippingRemaining) / threshold) * 100)));

  // Free shipping celebration trigger
  useEffect(() => {
    if (freeShippingRemaining === 0 && !hasCelebratedFreeShipping && items.length > 0) {
      setHasCelebratedFreeShipping(true);
      try {
        const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
        if (!prefersReducedMotion) {
          confetti({
            particleCount: 40,
            spread: 60,
            origin: { y: 0.25, x: 0.8 },
            colors: ["#D71921", "#FCB812", "#1E5BFF", "#059669"],
          });
        }
      } catch {
        // Confetti unsupported
      }
    } else if (freeShippingRemaining > 0 && hasCelebratedFreeShipping) {
      setHasCelebratedFreeShipping(false);
    }
  }, [freeShippingRemaining, hasCelebratedFreeShipping, items.length]);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = await applyCoupon(couponInput);
    setCouponMessage({ text: res.message, isError: !res.success });
    if (res.success) setCouponInput("");
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={locale === "bn" ? "আপনার খেলনার কার্ট" : "Your Toy Cart"}
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300"
        onClick={closeCart}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[var(--surface)] rounded-l-3xl border-l border-[var(--border)] shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-[var(--border)] bg-[var(--surface-container-low)] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <ShoppingBag className="w-5 h-5 text-[var(--primary)]" />
              <h2 className="text-lg font-bold font-heading text-[var(--text-primary)]">
                {locale === "bn" ? "আপনার কার্ট" : "Your Toy Cart"} ({items.reduce((acc, i) => acc + i.quantity, 0)})
              </h2>
            </div>
            <button
              type="button"
              onClick={closeCart}
              className="p-2 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-full transition-colors cursor-pointer"
              aria-label="Close cart drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Trust Banner / Shipping Notice */}
          <div className="bg-[var(--surface-container-low)] px-5 py-2.5 border-b border-[var(--border)] text-xs flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 font-bold">
              <Truck className="w-3.5 h-3.5" />
              <span>{locale === "bn" ? "ক্যাশ অন ডেলিভারি সুবিধা" : "Cash on Delivery Available"}</span>
            </span>
            <span className="text-[11px] text-[var(--text-muted)] font-medium">
              {locale === "bn" ? "পণ্য দেখে নিন" : "Inspect at delivery"}
            </span>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {items.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
                <EmptyCartIllustration className="w-36 h-36" />
                <div className="space-y-1">
                  <h3 className="font-heading text-lg font-bold text-[var(--text-primary)]">
                    {locale === "bn" ? "আপনার ঝুড়িটি এখনো খালি!" : "Your basket is feeling lonely!"}
                  </h3>
                  <p className="text-xs text-[var(--text-muted)] mt-1 max-w-xs">
                    {locale === "bn"
                      ? "আমাদের নিরাপদ খেলনা, রোবটিক্স কিট এবং কাঠের খেলনাগুলো দেখুন।"
                      : "Explore our certified safe toys, STEM robotics, and wooden blocks to fill it with joy."}
                  </p>
                </div>
                <Button onClick={closeCart} variant="primary" size="md" className="rounded-xl">
                  {locale === "bn" ? "খেলনা কেনাকাটা শুরু করুন" : "Start Toy Shopping"}
                </Button>
              </div>
            ) : (
              <>
                {items.map((item) => {
                  const isAtMaxStock = item.maxStock !== undefined && item.quantity >= item.maxStock;

                  return (
                    <div
                      key={item.id}
                      className="flex gap-3 pb-4 border-b border-[var(--border)] last:border-0"
                    >
                      {/* Thumbnail */}
                      <div className="relative w-20 h-20 rounded-xl overflow-hidden bg-[var(--surface)] shrink-0 border border-[var(--border)]">
                        <Image
                          src={item.image || "/images/placeholder.png"}
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
                              className="text-sm font-semibold text-[var(--text-primary)] hover:text-[var(--primary)] line-clamp-1"
                            >
                              {item.name}
                            </Link>
                            <button
                              type="button"
                              onClick={() => {
                                removeItem(item.id);
                                toast.info(
                                  locale === "bn" ? `${item.name} ঝুড়ি থেকে সরানো হয়েছে` : `Removed ${item.name} from basket`,
                                  {
                                    action: {
                                      label: locale === "bn" ? "পূর্বাবস্থায় আনুন" : "Undo",
                                      onClick: () => undoRemove(),
                                    },
                                  }
                                );
                              }}
                              className="text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors p-1 cursor-pointer"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <p className="text-xs text-[var(--text-muted)]">{item.title}</p>
                        </div>

                        {/* Price and Stepper */}
                        <div className="flex items-center justify-between mt-1">
                          <span className="font-bold text-sm text-[var(--primary)]">
                            {formatPrice(item.price * item.quantity)}
                          </span>

                          {/* Quantity Stepper */}
                          <div className="flex items-center border border-[var(--border)] rounded-full bg-[var(--surface)] overflow-hidden">
                            <button
                              type="button"
                              onClick={() => updateQuantity(item.id, -1)}
                              className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-colors cursor-pointer"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2 text-xs font-bold text-[var(--text-primary)] select-none">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                if (!isAtMaxStock) updateQuantity(item.id, 1);
                              }}
                              disabled={isAtMaxStock}
                              className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-colors disabled:opacity-30 cursor-pointer"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {isAtMaxStock && (
                          <span className="text-[10px] text-[var(--danger)] font-semibold mt-0.5">
                            Max available stock reached
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>

          {/* Footer & Order Summary */}
          {items.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-[var(--border)] bg-[var(--surface)] space-y-3">
              {/* Coupon Form */}
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Enter coupon (e.g. PLAY10)"
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="w-full text-xs h-9 pl-9 pr-3 rounded-xl border border-[var(--border)] bg-[var(--surface-elevated)] text-[var(--text-primary)] uppercase placeholder:normal-case focus:outline-none focus:border-[var(--primary)]"
                  />
                </div>
                <Button type="submit" variant="secondary" size="sm" className="rounded-xl h-9">
                  Apply
                </Button>
              </form>

              {couponMessage && (
                <p className={`text-xs ${couponMessage.isError ? "text-[var(--danger)]" : "text-[var(--success)]"} font-medium`}>
                  {couponMessage.text}
                </p>
              )}

              {coupon && (
                <div className="flex items-center justify-between text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-2 rounded-lg border border-emerald-500/20">
                  <span className="font-semibold flex items-center gap-1">
                    <Sparkles className="w-3.5 h-3.5" /> Coupon ({coupon.code}) Applied
                  </span>
                  <div className="flex items-center gap-2">
                    <span>-{formatPrice(coupon.discountAmount)}</span>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-[var(--text-muted)] hover:text-[var(--danger)] cursor-pointer"
                      title="Remove coupon"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}

              {/* Price Breakdown */}
              <div className="space-y-1.5 text-xs text-[var(--text-muted)]">
                <div className="flex justify-between">
                  <span>{t("subtotal")}</span>
                  <span className="font-semibold text-[var(--text-primary)]">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-[var(--success)]">
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
                  <span>{shippingFee === 0 ? <strong className="text-[var(--success)]">FREE</strong> : formatPrice(shippingFee)}</span>
                </div>
                <div className="flex justify-between text-sm font-bold text-[var(--text-primary)] pt-2 border-t border-[var(--border)]">
                  <span>{t("total")}</span>
                  <span className="text-base text-[var(--primary)] font-black">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2">
                <Link href="/checkout" onClick={closeCart} className="block w-full">
                  <Button variant="pill-primary" size="lg" className="w-full text-sm font-bold shadow-[0_4px_0_#93000E]">
                    <span>{locale === "bn" ? "অর্ডার সম্পন্ন করতে এগিয়ে যান" : "Proceed to Cash on Delivery"}</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
                <Link href="/cart" onClick={closeCart} className="block w-full text-center">
                  <Button variant="ghost" size="sm" className="w-full text-xs text-[var(--text-muted)] hover:text-[var(--text-primary)]">
                    View &amp; Edit Full Cart
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
