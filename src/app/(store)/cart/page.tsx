"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import confetti from "canvas-confetti";
import { useSession } from "next-auth/react";
import { useCartStore } from "@/lib/cart-store";
import { useMounted } from "@/lib/use-mounted";
import { useLanguage } from "@/lib/i18n";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { EmptyState } from "@/components/ui/empty-state";
import { EmptyCartIllustration } from "@/components/ui/illustrations";
import { getPublicSettingsAction } from "@/server/actions/settings-actions";
import { getDeliveryQuoteAction } from "@/server/actions/order-actions";
import type { PublicStoreSettings } from "@/types/store";
import {
  Trash2,
  Truck,
  ArrowRight,
  Sparkles,
  Tag,
  ShieldCheck,
  X,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";

export default function CartPage() {
  const mounted = useMounted();
  const { t, locale } = useLanguage();
  const isBn = locale === "bn";
  const sessionResult = useSession();
  const userRole = sessionResult?.data?.user?.role;
  const isPrivileged = mounted && userRole && userRole !== "CUSTOMER";

  const {
    items,
    removeItem,
    undoRemove,
    updateQuantity,
    coupon,
    applyCoupon,
    removeCoupon,
    deliveryZone,
    setDeliveryZone,
    getSubtotal,
    getDiscount,
    getGiftWrapFee,
  } = useCartStore();

  const [couponInput, setCouponInput] = useState("");
  const [couponError, setCouponError] = useState<string | null>(null);
  const [publicSettings, setPublicSettings] = useState<PublicStoreSettings | null>(null);
  const [serverDeliveryFee, setServerDeliveryFee] = useState<number | null>(null);
  const [isDeliveryConfigured, setIsDeliveryConfigured] = useState<boolean>(true);

  // Load public store settings
  useEffect(() => {
    let active = true;
    getPublicSettingsAction().then((res) => {
      if (active && res.success && res.settings) {
        setPublicSettings(res.settings);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const giftWrapFee = getGiftWrapFee();

  // Authoritative delivery calculation
  useEffect(() => {
    let active = true;
    getDeliveryQuoteAction({
      deliveryZone,
      subtotal,
    }).then((res) => {
      if (!active) return;
      if (res.success && res.quote) {
        setIsDeliveryConfigured(res.quote.isConfigured);
        setServerDeliveryFee(res.quote.deliveryFee);
      } else {
        setIsDeliveryConfigured(false);
        setServerDeliveryFee(null);
      }
    });
    return () => {
      active = false;
    };
  }, [deliveryZone, subtotal]);

  const threshold = publicSettings?.freeShippingThreshold || 0;
  const hasFreeShippingConfigured = threshold > 0;
  const freeShippingRemaining = hasFreeShippingConfigured ? Math.max(0, threshold - subtotal) : 0;

  useEffect(() => {
    if (!mounted) return;
    if (hasFreeShippingConfigured && freeShippingRemaining <= 0 && items.length > 0) {
      if (typeof window !== "undefined" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
        try {
          confetti({
            particleCount: 50,
            spread: 60,
            origin: { y: 0.7 },
          });
        } catch {
          // ignore
        }
      }
    }
  }, [mounted, hasFreeShippingConfigured, freeShippingRemaining, items.length]);

  const handleApplyCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;
    const res = await applyCoupon(couponInput);
    if (res.success) {
      toast.success(res.message);
      setCouponInput("");
      setCouponError(null);
    } else {
      setCouponError(res.message);
    }
  };

  if (!mounted) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-20 text-center text-sm text-[var(--text-muted)] animate-pulse">
        {isBn ? "কার্ট লোড হচ্ছে..." : "Loading cart..."}
      </div>
    );
  }

  const handleRemove = (id: string, name: string) => {
    removeItem(id);
    toast(
      isBn ? `"${name}" কার্ট থেকে সরানো হয়েছে` : `Removed "${name}" from cart`,
      {
        action: {
          label: isBn ? "বাতিল" : "Undo",
          onClick: () => undoRemove(),
        },
      }
    );
  };

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <EmptyState
          illustration={<EmptyCartIllustration className="w-40 h-40" />}
          title={isBn ? "আপনার কার্ট খালি" : "Your Toy Cart is Empty"}
          description={
            isBn
              ? "আপনার কার্টে কোনো খেলনা যোগ করা হয়নি। নিরাপদ খেলনার সংগ্রহ দেখুন!"
              : "Looks like you haven't added any toys to your cart yet. Discover our curated collection of safe toys!"
          }
          action={
            <Link href="/c/all">
              <Button variant="primary" size="lg">
                <span>{isBn ? "খেলনা ব্রাউজ করুন" : "Start Exploring Toys"}</span>
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          }
        />
      </div>
    );
  }

  const effectiveTotal = serverDeliveryFee !== null
    ? Math.max(0, subtotal - discount + serverDeliveryFee + giftWrapFee)
    : Math.max(0, subtotal - discount + giftWrapFee);

  const insideRate = publicSettings?.insideDhakaRate;
  const outsideRate = publicSettings?.outsideDhakaRate;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      {/* Page Title */}
      <div>
        <h1 className="font-heading text-2xl sm:text-4xl font-black text-[var(--text-primary)]">
          {isBn ? "আপনার খেলনার কার্ট" : "Review Your Toy Cart"}
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
          {items.reduce((acc, i) => acc + i.quantity, 0)} {isBn ? "টি পণ্য • ক্যাশ অন ডেলিভারি ও মোবাইল পেমেন্ট" : "items • Cash on Delivery & MFS Available"}
        </p>
      </div>

      {/* Trust & Delivery Strip */}
      <div className="p-4 sm:p-5 rounded-3xl bg-[var(--surface-elevated)] border border-[var(--border)] shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
        <span className="flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-400">
          <Truck className="w-4 h-4" />
          <span>{isBn ? "ক্যাশ অন ডেলিভারি ও ভেরিফায়েড মোবাইল পেমেন্ট" : "Cash on Delivery & Verified Mobile Payment"}</span>
        </span>
        <span className="text-[11px] text-[var(--text-muted)] font-medium flex items-center gap-1">
          <ShieldCheck className="w-3.5 h-3.5 text-[var(--primary)]" />
          <span>{isBn ? "গ্রহণের পূর্বে পণ্য দেখে নিন" : "Inspect Before You Accept at Doorstep"}</span>
        </span>
      </div>

      {/* Main Two-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* Left: Line Items (8 Cols) */}
        <div className="lg:col-span-8 bg-[var(--surface-elevated)] rounded-3xl border border-[var(--border)] divide-y divide-[var(--border)] shadow-xs">
          {items.map((item) => {
            const isAtMaxStock = item.maxStock !== undefined && item.quantity >= item.maxStock;

            return (
              <div key={item.id} className="p-5 sm:p-6 flex flex-col sm:flex-row gap-4 sm:gap-6">
                {/* Product Thumbnail */}
                <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-[var(--surface)] shrink-0 border border-[var(--border)]">
                  <Image
                    src={item.image || "/images/placeholder.png"}
                    alt={item.name}
                    fill
                    className="object-cover"
                    sizes="120px"
                  />
                </div>

                {/* Details & Controls */}
                <div className="flex-1 flex flex-col justify-between space-y-3">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <Link
                        href={`/p/${item.productId}`}
                        className="font-heading text-sm sm:text-base font-bold text-[var(--text-primary)] hover:text-[var(--primary)] transition-colors line-clamp-1"
                      >
                        {item.name}
                      </Link>
                      <p className="text-xs text-[var(--text-muted)] mt-0.5 font-medium">{item.title}</p>
                      <span className="text-[10px] text-[var(--text-muted)] font-mono">SKU: {item.sku}</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleRemove(item.id, item.name)}
                      className="p-1.5 text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors rounded-lg cursor-pointer"
                      title={isBn ? "পণ্য সরান" : "Remove item"}
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex flex-col">
                      <QuantityStepper
                        value={item.quantity}
                        min={1}
                        max={item.maxStock || 99}
                        onChange={(newQty) => {
                          const diff = newQty - item.quantity;
                          if (newQty <= 0) {
                            removeItem(item.id);
                          } else {
                            updateQuantity(item.id, diff);
                          }
                        }}
                        size="sm"
                      />
                      {isAtMaxStock && (
                        <span className="text-[10px] text-[var(--danger)] font-semibold mt-1 block">
                          {isBn ? "সর্বোচ্চ স্টক সীমা" : "Stock limit reached"}
                        </span>
                      )}
                    </div>

                    <div className="text-right">
                      <span className="text-base sm:text-lg font-black text-[var(--text-primary)]">
                        {formatPrice(item.price * item.quantity)}
                      </span>
                      {item.quantity > 1 && (
                        <span className="text-[10px] text-[var(--text-muted)] block">
                          ({formatPrice(item.price)} {isBn ? "প্রতিটি" : "each"})
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right: Sticky Summary Box (4 Cols) */}
        <div className="lg:col-span-4 sticky top-24 space-y-4">
          <div className="bg-[var(--surface-elevated)] rounded-3xl border border-[var(--border)] p-6 shadow-xs space-y-5">
            <h2 className="font-heading text-lg font-black text-[var(--text-primary)] pb-3 border-b border-[var(--border)]">
              {isBn ? "অর্ডার সারাংশ" : "Order Summary"}
            </h2>

            {/* Delivery Destination Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                {isBn ? "ডেলিভারি লোকেশন" : "Delivery Location"}
              </label>
              <div className="grid grid-cols-2 gap-2 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => setDeliveryZone("inside_dhaka")}
                  className={`p-2.5 rounded-full border text-center transition-all cursor-pointer font-bold ${
                    deliveryZone === "inside_dhaka"
                      ? "bg-[var(--primary)] text-[var(--on-primary)] border-[var(--primary)] shadow-xs"
                      : "border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--primary)]"
                  }`}
                >
                  {isBn ? "ঢাকা মেট্রো" : "Inside Dhaka"}{" "}
                  {insideRate !== null && insideRate !== undefined
                    ? `(${formatPrice(insideRate)})`
                    : isBn ? "(অসংজ্ঞায়িত)" : "(TBD)"}
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryZone("outside_dhaka")}
                  className={`p-2.5 rounded-full border text-center transition-all cursor-pointer font-bold ${
                    deliveryZone === "outside_dhaka"
                      ? "bg-[var(--primary)] text-[var(--on-primary)] border-[var(--primary)] shadow-xs"
                      : "border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--primary)]"
                  }`}
                >
                  {isBn ? "ঢাকার বাইরে" : "Outside Dhaka"}{" "}
                  {outsideRate !== null && outsideRate !== undefined
                    ? `(${formatPrice(outsideRate)})`
                    : isBn ? "(অসংজ্ঞায়িত)" : "(TBD)"}
                </button>
              </div>
            </div>

            {/* Coupon Code Input */}
            <div className="space-y-2">
              <form onSubmit={handleApplyCoupon} className="flex gap-2">
                <div className="relative flex-1">
                  <Tag className="w-4 h-4 text-[var(--text-muted)] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder={isBn ? "কুপন কোড (যেমন: PLAY10)" : "Coupon code (e.g. PLAY10)"}
                    value={couponInput}
                    onChange={(e) => setCouponInput(e.target.value)}
                    className="w-full text-xs h-10 pl-9 pr-3 rounded-2xl border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] uppercase placeholder:normal-case focus:outline-none focus:border-primary"
                  />
                </div>
                <Button type="submit" variant="secondary" size="sm" className="rounded-2xl h-10">
                  {isBn ? "প্রয়োগ" : "Apply"}
                </Button>
              </form>

              {couponError && <p className="text-xs text-[var(--danger)] font-medium">{couponError}</p>}

              {coupon && (
                <div className="flex items-center justify-between text-xs bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 p-2.5 rounded-xl border border-emerald-500/20">
                  <span className="font-bold flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4" /> {isBn ? "কুপন" : "Coupon"} {coupon.code} {isBn ? "প্রযুক্ত" : "Applied"}
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="font-bold">-{formatPrice(coupon.discountAmount)}</span>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-[var(--text-muted)] hover:text-[var(--danger)] cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Breakdown */}
            <div className="space-y-2 text-xs text-[var(--text-muted)] pt-2 border-t border-[var(--border)]">
              <div className="flex justify-between">
                <span>{isBn ? "আইটেম সাবটোটাল" : "Items Subtotal"}</span>
                <span className="font-bold text-[var(--text-primary)]">{formatPrice(subtotal)}</span>
              </div>

              {discount > 0 && (
                <div className="flex justify-between text-[var(--success)]">
                  <span>{isBn ? "কুপন ছাড়" : "Coupon Discount"}</span>
                  <span className="font-bold">-{formatPrice(discount)}</span>
                </div>
              )}

              {giftWrapFee > 0 && (
                <div className="flex justify-between">
                  <span>{isBn ? "গিফট র‍্যাপিং" : "Gift Wrapping"}</span>
                  <span className="font-bold">+{formatPrice(giftWrapFee)}</span>
                </div>
              )}

              <div className="flex justify-between">
                <span>{isBn ? "ডেলিভারি চার্জ" : "Cash on Delivery Fee"}</span>
                <span className="font-bold text-[var(--text-primary)]">
                  {serverDeliveryFee !== null
                    ? serverDeliveryFee === 0
                      ? <strong className="text-[var(--success)]">{isBn ? "বিনামূল্যে" : "FREE"}</strong>
                      : formatPrice(serverDeliveryFee)
                    : isBn ? "নিশ্চিত করা হবে" : "To be confirmed"}
                </span>
              </div>

              <div className="flex justify-between text-base font-black text-[var(--text-primary)] pt-3 border-t border-[var(--border)]">
                <div>
                  <span className="block">{isBn ? "সর্বমোট প্রদেয়" : "Total Amount Due"}</span>
                  {serverDeliveryFee === null && (
                    <span className="text-[10px] text-amber-700 dark:text-amber-400 font-normal">
                      {isBn ? "+ ডেলিভারি চার্জ নিশ্চিত করা হবে" : "+ Delivery fee to be confirmed"}
                    </span>
                  )}
                </div>
                <span className="text-xl text-[var(--primary)]">{formatPrice(effectiveTotal)}</span>
              </div>
            </div>

            {/* Checkout Action Button */}
            {isPrivileged ? (
              <div className="p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl text-center space-y-2">
                <p className="text-xs font-bold text-amber-700 dark:text-amber-400">
                  {isBn ? `ম্যানেজমেন্ট অ্যাকাউন্ট (${userRole})` : `Management Account (${userRole})`}
                </p>
                <p className="text-[11px] text-[var(--text-muted)]">
                  {isBn ? "প্রশাসনিক অ্যাকাউন্ট দিয়ে কাস্টমার অর্ডার করা সম্ভব নয়।" : "Administrators and staff cannot place retail customer orders."}
                </p>
                <Link href="/" className="block w-full">
                  <Button variant="pill-primary" size="sm" className="w-full text-xs font-bold">
                    {isBn ? "দোকানে ফিরে যান" : "Return to Store"}
                  </Button>
                </Link>
              </div>
            ) : (
              <Link href="/checkout" className="block w-full">
                <Button
                  variant="pill-primary"
                  size="lg"
                  className="w-full text-sm font-black shadow-[0_4px_0_#93000E] active:translate-y-[2px] active:shadow-[0_2px_0_#93000E] h-12"
                >
                  <span>{isBn ? "চেকআউটে এগিয়ে যান" : "Proceed to Express Checkout"}</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
            )}

            {/* Trust Assurances */}
            <div className="space-y-2 pt-2 text-[11px] text-[var(--text-muted)]">
              <div className="flex items-center gap-2">
                <Truck className="w-3.5 h-3.5 text-[var(--accent)]" />
                <span>{isBn ? "ডেলিভারি প্রতিনিধির কাছে নগদ টাকা পরিশোধ করুন" : "Pay cash directly to courier at your door"}</span>
              </div>
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-3.5 h-3.5 text-[var(--primary)]" />
                <span>{isBn ? "গ্রহণের পূর্বে পণ্য দেখে নিন • সহায়তা: 01712-039707" : "Inspect before you accept • Support: 01712-039707"}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
