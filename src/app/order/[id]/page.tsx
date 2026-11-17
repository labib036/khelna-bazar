"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import Image from "next/image";
import { useParams, useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";
import { formatPrice } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { fetchOrderDetails } from "@/server/actions/order-actions";
import { StoreOrder } from "@/types/store";
import { Button } from "@/components/ui/button";
import {
  CheckCircle2,
  Clock,
  Package,
  Truck,
  MapPin,
  Printer,
  ShoppingBag,
  Sparkles,
  Phone,
  ShieldCheck,
  ChevronRight,
  AlertTriangle,
  Loader2,
  Calendar,
  Lock,
} from "lucide-react";

function OrderConfirmationContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const rawOrderId = (params?.id as string) || "";
  const token = searchParams.get("token") || "";
  const phoneParam = searchParams.get("phone") || "";
  const isNew = searchParams.get("success") === "1";

  const [order, setOrder] = useState<StoreOrder | null>(null);
  const [loading, setLoading] = useState(true);
  const [verifyPhone, setVerifyPhone] = useState("");
  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);

  useEffect(() => {
    let mounted = true;
    async function loadOrder() {
      if (!rawOrderId) return;
      setLoading(true);
      const res = await fetchOrderDetails(rawOrderId, token || phoneParam || undefined);
      if (mounted) {
        setOrder(res);
        setLoading(false);
      }
    }
    loadOrder();
    return () => {
      mounted = false;
    };
  }, [rawOrderId, token, phoneParam]);

  useEffect(() => {
    if (isNew && !hasTriggeredConfetti) {
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#D71921", "#FCB812", "#1E5BFF", "#059669"],
        });
      } catch {
        // Fallback
      }
      setHasTriggeredConfetti(true);
    }
  }, [isNew, hasTriggeredConfetti]);

  const handlePhoneVerifySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!verifyPhone.trim()) return;
    setLoading(true);
    const res = await fetchOrderDetails(rawOrderId, verifyPhone.trim());
    setOrder(res);
    setLoading(false);
  };

  const handlePrint = () => {
    window.print();
  };

  if (loading) {
    return (
      <div className="py-24 text-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-[var(--primary)] mx-auto" />
        <p className="text-xs text-[var(--text-muted)]">Loading order details...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="max-w-md mx-auto p-8 rounded-3xl bg-[var(--surface-container-low)] border border-[var(--border)] text-center space-y-4 shadow-sm">
        <div className="w-12 h-12 rounded-full bg-amber-500/10 text-amber-500 flex items-center justify-center mx-auto">
          <Lock className="w-6 h-6" />
        </div>
        <h2 className="font-heading font-black text-lg text-[var(--text-primary)]">
          Order Verification Required
        </h2>
        <p className="text-xs text-[var(--text-muted)] leading-relaxed">
          To protect your privacy and delivery details, please enter the mobile phone number used during checkout for order{" "}
          <strong className="text-[var(--text-primary)] font-mono">{rawOrderId}</strong>.
        </p>
        <form onSubmit={handlePhoneVerifySubmit} className="space-y-3 pt-2">
          <input
            type="tel"
            placeholder="e.g. 01712039707"
            value={verifyPhone}
            onChange={(e) => setVerifyPhone(e.target.value)}
            className="w-full h-11 px-4 rounded-full border border-[var(--border)] bg-[var(--surface)] text-xs text-center font-bold focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
            required
          />
          <Button type="submit" variant="pill-primary" size="md" className="w-full">
            Unlock Order Details
          </Button>
        </form>
        <p className="text-[11px] text-[var(--text-muted)] pt-2">
          Need help? Call or WhatsApp our helpline at{" "}
          <a href="tel:01712039707" className="font-bold text-[var(--primary)] underline">
            01712-039707
          </a>
        </p>
      </div>
    );
  }

  const statusColors: Record<string, string> = {
    PENDING_CONFIRMATION: "bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-300",
    CONFIRMED: "bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-300",
    PROCESSING: "bg-purple-500/15 text-purple-700 dark:text-purple-400 border-purple-300",
    PACKED: "bg-indigo-500/15 text-indigo-700 dark:text-indigo-400 border-indigo-300",
    SHIPPED: "bg-cyan-500/15 text-cyan-700 dark:text-cyan-400 border-cyan-300",
    OUT_FOR_DELIVERY: "bg-orange-500/15 text-orange-700 dark:text-orange-400 border-orange-300",
    DELIVERED: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-300",
    CANCELLED: "bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-300",
    RETURNED: "bg-slate-500/15 text-slate-700 dark:text-slate-400 border-slate-300",
  };

  return (
    <div className="space-y-8">
      {/* Success Celebration Card */}
      <div className="p-8 sm:p-10 rounded-4xl bg-[var(--surface-container-low)] border border-[var(--border)] text-center space-y-4 shadow-sm">
        <div className="w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-bold uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Order Successfully Registered
          </span>
          <h1 className="font-heading text-2xl sm:text-4xl font-black text-[var(--text-primary)]">
            Thank You for Your Order!
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-2 max-w-md mx-auto">
            Order Number: <strong className="text-[var(--text-primary)] font-mono">{order.orderNumber}</strong>
          </p>
        </div>

        {/* Payment & Inspection Notice Box */}
        <div className="p-4 rounded-3xl bg-[var(--surface)] border border-[var(--border)] max-w-xl mx-auto text-xs text-left space-y-2">
          <div className="flex items-center gap-2 font-bold text-[var(--text-primary)]">
            <ShieldCheck className="w-4 h-4 text-[var(--primary)] shrink-0" />
            <span>ডেলিভারির সময় দেখে নিন / Inspect Before You Accept</span>
          </div>
          <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
            ডেলিভারি ম্যানের সামনে পণ্যটি দেখে নিয়ে তারপর গ্রহণ করুন। ডেলিভারির সময় কোনো ত্রুটি দেখা গেলে পণ্য ফেরত দিয়ে রিফান্ড নেওয়া যাবে। পণ্য দেখে গ্রহণ করার পর কোনো রিফান্ড প্রযোজ্য হবে না।
          </p>
          {order.paymentMethod === "CASH_ON_DELIVERY" ? (
            <div className="pt-2 border-t border-[var(--border)] flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold text-[11px]">
              <Truck className="w-3.5 h-3.5 shrink-0" />
              <span>Cash on Delivery: Please keep exact cash of {formatPrice(order.total)} ready upon arrival.</span>
            </div>
          ) : (
            <div className="pt-2 border-t border-[var(--border)] space-y-1 text-[11px]">
              <div className="flex items-center justify-between">
                <span className="font-bold text-[var(--text-primary)]">
                  {order.paymentMethod} Payment Verification:
                </span>
                <span className={`px-2 py-0.5 rounded-full font-bold uppercase text-[10px] ${
                  order.paymentStatus === "VERIFIED"
                    ? "bg-emerald-500/10 text-emerald-600"
                    : order.paymentStatus === "REJECTED"
                    ? "bg-rose-500/10 text-rose-600"
                    : "bg-amber-500/10 text-amber-600"
                }`}>
                  {order.paymentStatus || "AWAITING VERIFICATION"}
                </span>
              </div>
              <p className="text-[10px] text-[var(--text-muted)]">
                Sender: {order.mfsSenderNumber || "Provided"} • TrxID: {order.mfsTrxId || "Provided"}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Button onClick={handlePrint} variant="outline" size="sm" className="gap-1.5 cursor-pointer">
            <Printer className="w-4 h-4" />
            <span>Print Invoice</span>
          </Button>
          <Link href="/c/all">
            <Button variant="pill-primary" size="sm" className="gap-1.5 cursor-pointer">
              <ShoppingBag className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Order Details & Summary Card */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
        {/* Left Column: Line Items & Customer Details (7 Cols) */}
        <div className="md:col-span-7 space-y-6">
          {/* Purchased Items */}
          <div className="p-6 rounded-4xl bg-[var(--surface-container-low)] border border-[var(--border)] space-y-4 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h2 className="font-heading font-black text-base text-[var(--text-primary)]">
                Purchased Toys ({order.items.length})
              </h2>
              <span className={`px-2.5 py-1 rounded-full text-[11px] font-black border ${statusColors[order.status] || ""}`}>
                {order.status.replace(/_/g, " ")}
              </span>
            </div>

            <div className="space-y-3">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center gap-3.5 pb-3 border-b border-[var(--border)] last:border-0 last:pb-0">
                  <div className="relative w-14 h-14 rounded-2xl bg-[var(--surface)] border border-[var(--border)] overflow-hidden shrink-0">
                    <Image
                      src={item.image || "/images/logo-placeholder.svg"}
                      alt={item.name}
                      fill
                      className="object-contain p-1"
                      sizes="56px"
                    />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-xs sm:text-sm text-[var(--text-primary)] truncate">{item.name}</h4>
                    <p className="text-[11px] text-[var(--text-muted)]">Qty: {item.quantity} &times; {formatPrice(item.price)}</p>
                  </div>
                  <span className="font-black text-xs sm:text-sm text-[var(--text-primary)] shrink-0">
                    {formatPrice(item.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Delivery Address & Contact */}
          <div className="p-6 rounded-4xl bg-[var(--surface-container-low)] border border-[var(--border)] space-y-3 shadow-xs text-xs">
            <h3 className="font-heading font-black text-sm text-[var(--text-primary)] flex items-center gap-2">
              <MapPin className="w-4 h-4 text-[var(--primary)]" />
              <span>Delivery Address &amp; Customer Information</span>
            </h3>
            <div className="space-y-1 text-[var(--text-muted)]">
              <p className="font-bold text-[var(--text-primary)]">{order.customerName}</p>
              <p>Phone: {order.customerPhone}</p>
              {order.customerEmail && !order.customerEmail.includes("@khelnabazar.internal") && (
                <p>Email: {order.customerEmail}</p>
              )}
              <p className="pt-1 text-[var(--text-primary)] font-medium">
                {order.shippingAddress.line1}, {order.shippingAddress.city}, {order.shippingAddress.division}
              </p>
              {order.customerNotes && (
                <p className="pt-1 text-[11px] italic text-[var(--text-muted)]">
                  Notes: &quot;{order.customerNotes}&quot;
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Financial Breakdown & Audit Events (5 Cols) */}
        <div className="md:col-span-5 space-y-6">
          {/* Financial Breakdown */}
          <div className="p-6 rounded-4xl bg-[var(--surface-container-low)] border border-[var(--border)] space-y-3 shadow-xs text-xs">
            <h3 className="font-heading font-black text-sm text-[var(--text-primary)] pb-2 border-b border-[var(--border)]">
              Payment Summary
            </h3>
            <div className="space-y-2 text-[var(--text-muted)]">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-[var(--text-primary)]">{formatPrice(order.subtotal)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-[var(--primary)] font-bold">
                  <span>Discount</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Delivery Fee ({order.deliveryZone})</span>
                <span className="font-bold text-[var(--text-primary)]">{formatPrice(order.shippingFee)}</span>
              </div>
              <div className="pt-3 border-t border-[var(--border)] flex justify-between items-baseline">
                <span className="font-heading font-black text-base text-[var(--text-primary)]">Total Payable</span>
                <span className="font-heading font-black text-2xl text-[var(--primary)]">
                  {formatPrice(order.total)}
                </span>
              </div>
              <div className="pt-2 text-[11px] text-[var(--text-muted)] flex items-center justify-between">
                <span>Method:</span>
                <span className="font-bold text-[var(--text-primary)]">{order.paymentMethod.replace(/_/g, " ")}</span>
              </div>
            </div>
          </div>

          {/* Timeline Events Audit Trail */}
          <div className="p-6 rounded-4xl bg-[var(--surface-container-low)] border border-[var(--border)] space-y-4 shadow-xs text-xs">
            <h3 className="font-heading font-black text-sm text-[var(--text-primary)] flex items-center gap-2 pb-2 border-b border-[var(--border)]">
              <Clock className="w-4 h-4 text-[var(--primary)]" />
              <span>Order Tracking Timeline</span>
            </h3>

            <div className="space-y-3">
              {order.events && order.events.length > 0 ? (
                order.events.map((ev, i) => (
                  <div key={ev.id || i} className="flex items-start gap-2.5 pb-2 border-b border-[var(--border)] last:border-0 last:pb-0">
                    <div className="w-2 h-2 rounded-full bg-[var(--primary)] mt-1.5 shrink-0" />
                    <div>
                      <p className="font-bold text-[var(--text-primary)]">{ev.message}</p>
                      <p className="text-[10px] text-[var(--text-muted)]">
                        {new Date(ev.createdAt).toLocaleString("en-BD", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="flex items-start gap-2.5">
                  <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 shrink-0" />
                  <div>
                    <p className="font-bold text-[var(--text-primary)]">Order placed</p>
                    <p className="text-[10px] text-[var(--text-muted)]">
                      {new Date(order.placedAt).toLocaleString("en-BD")}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Support Strip */}
      <div className="p-6 rounded-3xl bg-[var(--surface-container-low)] border border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <Phone className="w-5 h-5 text-[var(--primary)]" />
          <div>
            <h4 className="font-bold text-[var(--text-primary)]">Questions about your delivery?</h4>
            <p className="text-[var(--text-muted)]">Phone &amp; WhatsApp: 01712-039707</p>
          </div>
        </div>
        <Link href="/pages/return-refund-policy">
          <span className="font-bold text-[var(--primary)] hover:underline flex items-center gap-1">
            Inspection &amp; Refund Policy <ChevronRight className="w-4 h-4" />
          </span>
        </Link>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-8">
      <Suspense fallback={<div className="text-center p-8 text-xs text-slate-400">Loading order status...</div>}>
        <OrderConfirmationContent />
      </Suspense>
    </div>
  );
}
