"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trackOrderAction } from "@/server/actions/order-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PhoneInput } from "@/components/ui/phone-input";
import { Package, Search, Phone, ShieldCheck, ArrowRight } from "lucide-react";
import { toast } from "sonner";
import { isValidBDPhone } from "@/lib/auth-utils";

export default function TrackOrderPage() {
  const router = useRouter();
  const [orderNumber, setOrderNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();

    const cleanNum = orderNumber.trim().toUpperCase();
    const cleanPhone = phone.trim().replace(/[\s-]/g, "");

    if (!cleanNum) {
      toast.error("Please enter your Order Number (e.g. KB-2611-100244).");
      return;
    }

    if (!cleanPhone || !isValidBDPhone(cleanPhone)) {
      toast.error("Please enter the 11-digit mobile phone number used during checkout.");
      return;
    }

    setIsSearching(true);
    try {
      const order = await trackOrderAction(cleanNum, cleanPhone);

      if (!order) {
        toast.error("No matching order found for this Order Number and Phone. Please verify your details.");
        setIsSearching(false);
        return;
      }

      toast.success("Order located!");
      router.push(`/order/${order.orderNumber}`);
    } catch {
      toast.error("Failed to search for order. Please try again.");
      setIsSearching(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 sm:px-6 py-12 sm:py-20 space-y-8">
      <div className="text-center space-y-2">
        <div className="w-16 h-16 rounded-3xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center mx-auto shadow-xs">
          <Package className="w-8 h-8" />
        </div>
        <h1 className="font-heading text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
          Track Your Delivery
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)]">
          Enter both your Order Number and Mobile Number to view live courier status.
        </p>
      </div>

      <div className="bg-[var(--surface-container-low)] p-6 sm:p-8 rounded-4xl border border-[var(--border)] shadow-xs">
        <form onSubmit={handleTrack} className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
              <Package className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>Order Number <span className="text-[var(--danger)]">*</span></span>
            </label>
            <Input
              type="text"
              placeholder="KB-2611-100244"
              value={orderNumber}
              onChange={(e) => setOrderNumber(e.target.value)}
              className="text-sm font-mono h-11 uppercase rounded-full"
              required
            />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>Customer Mobile Phone <span className="text-[var(--danger)]">*</span></span>
            </label>
            <PhoneInput
              value={phone}
              onChange={(val) => setPhone(val)}
              className="w-full"
            />
            <p className="text-[11px] text-[var(--text-muted)] pt-1">
              Required for security verification so your parcel details remain private.
            </p>
          </div>

          <Button
            type="submit"
            disabled={isSearching}
            variant="pill-primary"
            size="lg"
            isLoading={isSearching}
            className="w-full text-xs font-black shadow-[0_4px_0_#93000E] active:translate-y-[2px] active:shadow-[0_2px_0_#93000E] transition-all mt-2 h-12"
          >
            <Search className="w-4 h-4 mr-1.5" />
            <span>Track Order</span>
            <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </form>

        <div className="mt-6 pt-5 border-t border-[var(--border)] flex items-center justify-center gap-2 text-xs text-[var(--text-muted)]">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>Encrypted real-time courier integration with Steadfast &amp; Pathao</span>
        </div>
      </div>
    </div>
  );
}
