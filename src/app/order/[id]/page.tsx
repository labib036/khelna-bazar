"use client";

import { useEffect, useState, Suspense } from "react";
import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import confetti from "canvas-confetti";
import { formatPrice } from "@/lib/utils";
import { siteConfig } from "@/config/site";
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
} from "lucide-react";

function OrderConfirmationContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const orderId = (params?.id as string) || "KB-100245";
  const isNew = searchParams.get("success") === "1";

  const [hasTriggeredConfetti, setHasTriggeredConfetti] = useState(false);

  useEffect(() => {
    if (isNew && !hasTriggeredConfetti) {
      try {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (e) {
        // Safe fallback if canvas is unavailable
      }
      setHasTriggeredConfetti(true);
    }
  }, [isNew, hasTriggeredConfetti]);

  const handlePrint = () => {
    window.print();
  };

  const steps = [
    { title: "Order Placed", time: "Just now", done: true, current: false },
    { title: "Pending Phone Confirmation", time: "Within 2 Hours", done: false, current: true },
    { title: "Packed at Warehouse", time: "Pending", done: false, current: false },
    { title: "Handed to Courier", time: "Pending", done: false, current: false },
    { title: "Out for Delivery & Cash Collection", time: "1-2 Days", done: false, current: false },
  ];

  return (
    <div className="space-y-8">
      {/* Success Celebration Card */}
      <div className="p-8 sm:p-10 rounded-3xl bg-white dark:bg-[#161D33] border border-[#E3E8F2] dark:border-[#263050] text-center space-y-4 shadow-sm">
        <div className="w-20 h-20 rounded-full bg-[#E6FAF8] text-[#2EC4B6] flex items-center justify-center mx-auto shadow-sm">
          <CheckCircle2 className="w-10 h-10" />
        </div>

        <div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#EBF1FF] text-[#1E5BFF] text-xs font-bold uppercase mb-2">
            <Sparkles className="w-3.5 h-3.5" /> Cash on Delivery Order Confirmed
          </span>
          <h1 className="font-heading text-2xl sm:text-4xl font-black text-[#14213D] dark:text-white">
            Thank You for Your Order!
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md mx-auto">
            Order Number: <strong className="text-[#14213D] dark:text-white font-mono">{orderId}</strong>. We've
            received your order and our team will contact you shortly to confirm delivery.
          </p>
        </div>

        {/* COD Reminder Box */}
        <div className="p-4 rounded-2xl bg-[#FFF8E6] dark:bg-[#2B230B] border border-[#FFC93C] max-w-lg mx-auto text-xs text-[#B88700] dark:text-[#FFD76A] flex items-start gap-3 text-left">
          <Truck className="w-5 h-5 shrink-0 mt-0.5" />
          <p>
            <strong>Payment Reminder:</strong> Please keep the exact cash amount ready for the courier. You will pay
            only when the parcel reaches your door.
          </p>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-4">
          <Button onClick={handlePrint} variant="outline" size="sm" className="gap-1.5">
            <Printer className="w-4 h-4" />
            <span>Print Invoice</span>
          </Button>
          <Link href="/c/all">
            <Button variant="primary" size="sm" className="gap-1.5">
              <ShoppingBag className="w-4 h-4" />
              <span>Continue Shopping</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Order Status & Tracking Timeline */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#161D33] border border-[#E3E8F2] dark:border-[#263050] space-y-6 shadow-xs">
        <h2 className="font-heading font-black text-lg text-[#14213D] dark:text-white flex items-center gap-2">
          <Clock className="w-5 h-5 text-[#1E5BFF]" />
          <span>Fulfillment &amp; Delivery Progress</span>
        </h2>

        <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-2.5 sm:before:left-3.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-[#E3E8F2] dark:before:bg-[#263050]">
          {steps.map((step, idx) => (
            <div key={idx} className="relative flex items-start gap-3">
              <div
                className={`absolute -left-6 sm:-left-8 w-5 h-5 sm:w-7 sm:h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  step.done
                    ? "bg-[#2EC4B6] text-white"
                    : step.current
                    ? "bg-[#1E5BFF] text-white ring-4 ring-[#1E5BFF]/20 animate-pulse"
                    : "bg-[#E3E8F2] dark:bg-[#263050] text-slate-400"
                }`}
              >
                {step.done ? "✓" : idx + 1}
              </div>

              <div>
                <h4
                  className={`text-xs sm:text-sm font-bold ${
                    step.current
                      ? "text-[#1E5BFF] dark:text-[#5B8CFF]"
                      : step.done
                      ? "text-[#14213D] dark:text-white"
                      : "text-slate-400"
                  }`}
                >
                  {step.title}
                </h4>
                <p className="text-[11px] text-slate-400 mt-0.5">{step.time}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Need Help Strip */}
      <div className="p-6 rounded-3xl bg-[#F7F9FC] dark:bg-[#1E2742] border border-[#E3E8F2] dark:border-[#263050] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
        <div className="flex items-center gap-3">
          <Phone className="w-5 h-5 text-[#1E5BFF]" />
          <div>
            <h4 className="font-bold text-[#14213D] dark:text-white">Need to update your delivery address or time?</h4>
            <p className="text-slate-500">Call our customer care hotline: {siteConfig.contact.phone}</p>
          </div>
        </div>
        <Link href="/pages/shipping-policy">
          <span className="font-bold text-[#1E5BFF] hover:underline flex items-center gap-1">
            Shipping FAQ <ChevronRight className="w-4 h-4" />
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
