"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { placeCodOrder } from "@/server/actions/order-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Truck,
  ShieldCheck,
  CheckCircle2,
  Lock,
  ArrowRight,
  Sparkles,
  ShoppingBag,
  Building,
  User,
  Phone,
  Mail,
  MapPin,
  FileText,
} from "lucide-react";
import { toast } from "sonner";

const BD_DIVISIONS = [
  "Dhaka",
  "Chittagong",
  "Sylhet",
  "Rajshahi",
  "Khulna",
  "Barisal",
  "Rangpur",
  "Mymensingh",
];

export default function CheckoutPage() {
  const router = useRouter();
  const {
    items,
    coupon,
    deliveryZone,
    setDeliveryZone,
    getSubtotal,
    getDiscount,
    getShippingFee,
    getGiftWrapFee,
    getTotal,
    clearCart,
  } = useCartStore();

  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [division, setDivision] = useState("Dhaka");
  const [cityArea, setCityArea] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const subtotal = getSubtotal();
  const discount = getDiscount();
  const shippingFee = getShippingFee();
  const giftWrapFee = getGiftWrapFee();
  const total = getTotal();

  const handleDeliveryZoneChange = (zone: "inside_dhaka" | "outside_dhaka") => {
    setDeliveryZone(zone);
    if (zone === "inside_dhaka") {
      setDivision("Dhaka");
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 2) {
      newErrors.fullName = "Please enter your full name.";
    }
    if (!phone.trim() || phone.trim().length < 11) {
      newErrors.phone = "Please enter a valid 11-digit phone number (e.g. 01712345678).";
    }
    if (!email.trim() || !email.includes("@")) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!cityArea.trim()) {
      newErrors.cityArea = "Please enter your area or thana (e.g. Banani, Dhanmondi, Agrabad).";
    }
    if (!fullAddress.trim() || fullAddress.trim().length < 6) {
      newErrors.fullAddress = "Please provide your detailed house, road, and apartment address.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error("Your basket is empty.");
      return;
    }

    if (!validateForm()) {
      toast.error("Please fill in all required delivery details.");
      return;
    }

    setIsSubmitting(true);

    try {
      const res = await placeCodOrder({
        fullName,
        phone,
        email,
        division,
        cityArea,
        fullAddress,
        deliveryNotes,
        deliveryZone,
        items: items.map((i) => ({
          productId: i.productId,
          variantId: i.variantId,
          name: i.name,
          title: i.title,
          price: i.price,
          quantity: i.quantity,
          giftWrap: i.giftWrap,
          image: i.image,
          sku: i.sku,
        })),
        couponCode: coupon?.code,
      });

      if (res.success && res.orderNumber) {
        clearCart();
        toast.success("Cash on Delivery order placed successfully!");
        router.push(`/order/${res.orderNumber}?success=1`);
      } else {
        toast.error(res.error || "Failed to place order. Please try again.");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto py-16 px-4 text-center space-y-4">
        <ShoppingBag className="w-12 h-12 text-slate-300 mx-auto" />
        <h2 className="text-xl font-bold font-heading">Your cart is empty</h2>
        <p className="text-xs text-slate-500">Please add items to your cart before proceeding to checkout.</p>
        <Link href="/c/all">
          <Button variant="primary" size="md">
            Browse Toys
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#0E1424] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Secure Checkout Header */}
        <div className="flex items-center justify-between pb-6 mb-8 border-b border-[#E3E8F2] dark:border-[#263050]">
          <Link href="/" className="flex items-center gap-2">
            <div className="relative w-9 h-9 rounded-full overflow-hidden bg-white shrink-0 shadow-xs">
              <Image src="/images/khelna-bazar-logo.png" alt="Logo" fill className="object-contain" />
            </div>
            <span className="font-heading font-black text-xl text-[#14213D] dark:text-white">
              KHELNA <span className="text-[#1E5BFF]">BAZAR</span>
            </span>
          </Link>
          <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1.5 rounded-full border border-emerald-200 dark:border-emerald-800">
            <Lock className="w-3.5 h-3.5" />
            <span>Secure Cash on Delivery Checkout</span>
          </div>
        </div>

        <form onSubmit={handlePlaceOrder} className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* Left: Shipping & COD Details (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step 1: Customer Contact Info */}
            <div className="bg-white dark:bg-[#161D33] p-6 rounded-3xl border border-[#E3E8F2] dark:border-[#263050] shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#E3E8F2] dark:border-[#263050]">
                <div className="w-7 h-7 rounded-full bg-[#1E5BFF] text-white flex items-center justify-center font-bold text-xs">
                  1
                </div>
                <h2 className="font-heading font-black text-base text-[#14213D] dark:text-white">
                  Customer &amp; Contact Details
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-[#1E5BFF]" />
                    <span>Full Name *</span>
                  </label>
                  <Input
                    placeholder="e.g. Tanzim Ahmed"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    error={errors.fullName}
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-[#2EC4B6]" />
                    <span>Mobile Phone Number *</span>
                  </label>
                  <Input
                    placeholder="e.g. 01712345678"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    error={errors.phone}
                  />
                  <p className="text-[11px] text-slate-400">Courier will call this number before arrival.</p>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-[#7B5CFA]" />
                    <span>Email Address *</span>
                  </label>
                  <Input
                    type="email"
                    placeholder="e.g. yourname@gmail.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    error={errors.email}
                  />
                  <p className="text-[11px] text-slate-400">Order updates will be sent here.</p>
                </div>
              </div>
            </div>

            {/* Step 2: Delivery Address & Zone */}
            <div className="bg-white dark:bg-[#161D33] p-6 rounded-3xl border border-[#E3E8F2] dark:border-[#263050] shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#E3E8F2] dark:border-[#263050]">
                <div className="w-7 h-7 rounded-full bg-[#1E5BFF] text-white flex items-center justify-center font-bold text-xs">
                  2
                </div>
                <h2 className="font-heading font-black text-base text-[#14213D] dark:text-white">
                  Delivery Destination
                </h2>
              </div>

              {/* Delivery Zone Toggle */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                  Select Delivery Zone
                </label>
                <div className="grid grid-cols-2 gap-3 text-xs font-bold">
                  <button
                    type="button"
                    onClick={() => handleDeliveryZoneChange("inside_dhaka")}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      deliveryZone === "inside_dhaka"
                        ? "bg-[#EBF1FF] dark:bg-[#1E2D5A] border-[#1E5BFF] text-[#1E5BFF]"
                        : "border-[#E3E8F2] dark:border-[#263050] text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>Inside Dhaka City</span>
                      <span className="text-[#1E5BFF] font-black">৳60</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-normal mt-0.5">Delivered in 24–48 Hours</p>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleDeliveryZoneChange("outside_dhaka")}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      deliveryZone === "outside_dhaka"
                        ? "bg-[#EBF1FF] dark:bg-[#1E2D5A] border-[#1E5BFF] text-[#1E5BFF]"
                        : "border-[#E3E8F2] dark:border-[#263050] text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>Outside Dhaka</span>
                      <span className="text-[#1E5BFF] font-black">৳120</span>
                    </div>
                    <p className="text-[11px] text-slate-500 font-normal mt-0.5">Nationwide: 2–4 Business Days</p>
                  </button>
                </div>
              </div>

              {/* Address Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    District / Division *
                  </label>
                  <select
                    value={division}
                    onChange={(e) => setDivision(e.target.value)}
                    className="w-full h-11 px-3.5 rounded-2xl border border-[#E3E8F2] dark:border-[#263050] bg-white dark:bg-[#161D33] text-sm text-[#14213D] dark:text-white focus:outline-none focus:border-[#1E5BFF]"
                  >
                    {BD_DIVISIONS.map((d) => (
                      <option key={d} value={d}>
                        {d} Division
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    Area / Thana / Sector *
                  </label>
                  <Input
                    placeholder="e.g. Banani / Sector 4 / Mirpur 10"
                    value={cityArea}
                    onChange={(e) => setCityArea(e.target.value)}
                    error={errors.cityArea}
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#FF6B6B]" />
                    <span>Street Address, House &amp; Road *</span>
                  </label>
                  <Input
                    placeholder="House number, Road number, Apartment/Floor details"
                    value={fullAddress}
                    onChange={(e) => setFullAddress(e.target.value)}
                    error={errors.fullAddress}
                  />
                </div>

                <div className="sm:col-span-2 space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-slate-400" />
                    <span>Special Instructions for Delivery Courier (Optional)</span>
                  </label>
                  <Input
                    placeholder="e.g. Call before ringing bell / Deliver after 4:00 PM"
                    value={deliveryNotes}
                    onChange={(e) => setDeliveryNotes(e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Step 3: Cash on Delivery Sole Payment Method */}
            <div className="bg-white dark:bg-[#161D33] p-6 rounded-3xl border-2 border-[#2EC4B6] shadow-xs space-y-4">
              <div className="flex items-center gap-2.5 pb-3 border-b border-[#E3E8F2] dark:border-[#263050]">
                <div className="w-7 h-7 rounded-full bg-[#2EC4B6] text-white flex items-center justify-center font-bold text-xs">
                  3
                </div>
                <h2 className="font-heading font-black text-base text-[#14213D] dark:text-white">
                  Payment Method: Cash on Delivery (COD)
                </h2>
              </div>

              <div className="p-4 rounded-2xl bg-[#E6FAF8] dark:bg-[#0E3834] border border-[#2EC4B6]/40 flex items-start gap-3">
                <Truck className="w-6 h-6 text-[#229D92] dark:text-[#4DD9CB] shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-sm text-[#0E3834] dark:text-[#4DD9CB] block">
                    Pay with Cash at Doorstep
                  </span>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    You do not need to pay anything right now. When the courier delivers your package, you can
                    inspect the exterior parcel and pay exactly <strong className="text-black dark:text-white">{formatPrice(total)}</strong> in
                    cash directly to the delivery person.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Sticky Order Summary (5 Cols) */}
          <div className="lg:col-span-5 sticky top-24 space-y-4">
            <div className="bg-white dark:bg-[#161D33] p-6 rounded-3xl border border-[#E3E8F2] dark:border-[#263050] shadow-xs space-y-5">
              <h2 className="font-heading font-black text-lg text-[#14213D] dark:text-white pb-3 border-b border-[#E3E8F2] dark:border-[#263050]">
                Order Items ({items.reduce((acc, i) => acc + i.quantity, 0)})
              </h2>

              {/* Items List */}
              <div className="max-h-60 overflow-y-auto space-y-3 pr-1 divide-y divide-slate-100 dark:divide-slate-800">
                {items.map((item) => (
                  <div key={item.id} className="pt-3 first:pt-0 flex items-center gap-3">
                    <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                      <Image src={item.image} alt={item.name} fill className="object-cover" sizes="48px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-[#14213D] dark:text-white truncate">
                        {item.name}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Qty: {item.quantity} &bull; {item.title}
                      </p>
                    </div>
                    <span className="text-xs font-bold text-[#14213D] dark:text-white shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Breakdown */}
              <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300 pt-3 border-t border-[#E3E8F2] dark:border-[#263050]">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="font-bold text-[#14213D] dark:text-white">{formatPrice(subtotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-[#2EC4B6]">
                    <span>Coupon Savings</span>
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
                  <span>Cash on Delivery Charge</span>
                  <span className="font-bold text-[#14213D] dark:text-white">
                    {shippingFee === 0 ? <strong className="text-[#2EC4B6]">FREE</strong> : formatPrice(shippingFee)}
                  </span>
                </div>

                <div className="flex justify-between text-base font-black text-[#14213D] dark:text-white pt-3 border-t border-[#E3E8F2] dark:border-[#263050]">
                  <span>Total Due on Delivery</span>
                  <span className="text-xl text-[#1E5BFF] dark:text-[#5B8CFF]">{formatPrice(total)}</span>
                </div>
              </div>

              {/* Submit COD Order Button */}
              <Button
                type="submit"
                variant="sun"
                size="lg"
                isLoading={isSubmitting}
                className="w-full text-sm font-black shadow-lg"
              >
                <span>Confirm Cash on Delivery Order</span>
                <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>

              <p className="text-[11px] text-slate-400 text-center">
                By confirming, you agree to receive this package and pay cash to the courier.
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
