"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Package, Search, Truck, Phone, ArrowRight } from "lucide-react";
import { toast } from "sonner";

export default function TrackOrderPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) {
      toast.error("Please enter your Order Number (e.g. KB-100245)");
      return;
    }
    const cleanNum = orderNumber.trim().toUpperCase();
    router.push(`/order/${cleanNum}`);
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-8">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-full bg-[#FFF0F2] text-[#DC012B] flex items-center justify-center mx-auto">
          <Package className="w-8 h-8" />
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-black text-[#18191F] dark:text-white">
          Track Your Delivery
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Enter your Order Number and phone number to view live courier and fulfillment progress.
        </p>
      </div>

      <div className="bg-white dark:bg-[#1B1C24] p-6 sm:p-8 rounded-3xl border border-[#E8E2DE] dark:border-[#2E303E] shadow-sm">
        <form onSubmit={handleTrack} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Order Number *
            </label>
            <Input
              placeholder="e.g. KB-100245"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="uppercase font-mono font-bold"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Mobile Phone Number (Optional)
            </label>
            <Input
              placeholder="e.g. 01712345678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>

          <Button type="submit" variant="primary" size="lg" className="w-full text-xs font-bold shadow-md">
            <Search className="w-4 h-4 mr-1.5" />
            <span>Track Order Status</span>
          </Button>
        </form>

        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-400 text-center">
          Can't find your order number? Check your SMS confirmation or call our care desk at +880 1700-000000.
        </div>
      </div>
    </div>
  );
}
