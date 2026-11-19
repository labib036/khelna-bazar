"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import { useSession } from "next-auth/react";
import { useMounted } from "@/lib/use-mounted";
import { formatPrice } from "@/lib/utils";
import { useLanguage } from "@/lib/i18n";
import { siteConfig } from "@/config/site";
import { placeOrder, getDeliveryQuoteAction } from "@/server/actions/order-actions";
import { getPublicSettingsAction } from "@/server/actions/settings-actions";
import type { PublicStoreSettings } from "@/types/store";
import { Button } from "@/components/ui/button";
import {
  Truck,
  Check,
  Lock,
  ArrowRight,
  User,
  Mail,
  MapPin,
  ChevronRight,
  ShieldCheck,
  RotateCcw,
  Headphones,
  CheckCircle,
  Copy,
  AlertTriangle,
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
  const mounted = useMounted();
  const { t, locale } = useLanguage();
  const isBn = locale === "bn";
  const sessionResult = useSession();
  const session = sessionResult?.data;
  const user = session?.user;
  const idempotencyKey = useRef<string>(
    typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `idemp-${Date.now()}`
  );

  const {
    items,
    coupon,
    applyCoupon,
    removeCoupon,
    deliveryZone,
    setDeliveryZone,
    getSubtotal,
    getDiscount,
    getShippingFee,
    getTotal,
    clearCart,
  } = useCartStore();

  // Form State
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [division, setDivision] = useState("Dhaka");
  const [cityArea, setCityArea] = useState("");
  const [fullAddress, setFullAddress] = useState("");
  const [deliveryNotes, setDeliveryNotes] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"CASH_ON_DELIVERY" | "BKASH" | "NAGAD">(
    "CASH_ON_DELIVERY"
  );
  const [mfsSenderNumber, setMfsSenderNumber] = useState("");
  const [mfsTrxId, setMfsTrxId] = useState("");
  const [inspectAcknowledged, setInspectAcknowledged] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [publicSettings, setPublicSettings] = useState<PublicStoreSettings | null>(null);
  const [serverDeliveryFee, setServerDeliveryFee] = useState<number | null>(null);
  const [isDeliveryConfigured, setIsDeliveryConfigured] = useState<boolean>(true);
  const [deliveryQuoteLoading, setDeliveryQuoteLoading] = useState<boolean>(true);

  // Strict Panel Isolation Guard: Redirect privileged users away from customer checkout
  useEffect(() => {
    if (user?.role && user.role !== "CUSTOMER") {
      router.replace("/");
    }
  }, [user, router]);

  // Auto-fill from user profile (ONLY for retail customer accounts)
  useEffect(() => {
    if (user && user.role === "CUSTOMER") {
      if (user.name) setFullName((prev) => prev || user.name || "");
      if (user.phone) setPhone((prev) => prev || user.phone || "");
      if (user.email) setEmail((prev) => prev || user.email || "");
    }
  }, [user]);

  // Load public store settings (delivery rates, public hotline)
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

  // Authoritative server quote calculation based on zone and subtotal
  useEffect(() => {
    let active = true;
    setDeliveryQuoteLoading(true);
    getDeliveryQuoteAction({
      deliveryZone,
      subtotal,
    }).then((res) => {
      if (!active) return;
      setDeliveryQuoteLoading(false);
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

  if (!mounted) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center text-sm text-[var(--text-muted)] animate-pulse">
        {isBn ? "চেকআউট পেজ লোড হচ্ছে..." : "Loading checkout..."}
      </div>
    );
  }

  const effectiveShippingFee = serverDeliveryFee;
  const effectiveTotal = effectiveShippingFee !== null
    ? Math.max(0, subtotal - discount + effectiveShippingFee)
    : Math.max(0, subtotal - discount);

  const handleDeliveryZoneChange = (zone: "inside_dhaka" | "outside_dhaka") => {
    setDeliveryZone(zone);
    if (zone === "inside_dhaka") {
      setDivision("Dhaka");
    }
  };

  const handleCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponCodeInput.trim()) return;
    setIsApplyingCoupon(true);
    const res = await applyCoupon(couponCodeInput.trim());
    setIsApplyingCoupon(false);
    if (res.success) {
      toast.success(res.message);
      setCouponCodeInput("");
    } else {
      toast.error(res.message);
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    if (!fullName.trim() || fullName.trim().length < 2) {
      newErrors.fullName = isBn ? "অনুগ্রহ করে আপনার পুরো নাম লিখুন।" : "Please enter your full name.";
    }

    const cleanPhone = phone.replace(/[\s-]/g, "");
    const bdPhoneRegex = /^01[3-9]\d{8}$/;
    if (!bdPhoneRegex.test(cleanPhone)) {
      newErrors.phone = isBn
        ? "সঠিক ১১ ডিজিটের বাংলাদেশী মোবাইল নম্বর দিন (যেমন: 01712039707)।"
        : "Enter a valid 11-digit Bangladeshi mobile number (e.g. 01712039707).";
    }

    if (email.trim() && !email.includes("@")) {
      newErrors.email = isBn ? "অনুগ্রহ করে সঠিক ইমেইল ঠিকানা দিন।" : "Please enter a valid email address.";
    }

    if (!cityArea.trim()) {
      newErrors.cityArea = isBn ? "অনুগ্রহ করে আপনার এলাকা বা থানা লিখুন।" : "Please enter your area or thana.";
    }

    if (!fullAddress.trim() || fullAddress.trim().length < 5) {
      newErrors.fullAddress = isBn ? "সম্পূর্ণ ডেলিভারি ঠিকানা লিখুন।" : "Please provide complete street address.";
    }

    if (paymentMethod !== "CASH_ON_DELIVERY") {
      const cleanMfsPhone = mfsSenderNumber.replace(/[\s-]/g, "");
      if (!cleanMfsPhone || !bdPhoneRegex.test(cleanMfsPhone)) {
        newErrors.mfsSender = isBn
          ? `পেমেন্ট পাঠানোর সঠিক ১১ ডিজিটের ${paymentMethod === "BKASH" ? "বিকাশ" : "নগদ"} নম্বর দিন।`
          : `Please enter the valid mobile number used to send ${paymentMethod === "BKASH" ? "bKash" : "Nagad"}.`;
      }
      if (!mfsTrxId.trim() || mfsTrxId.trim().length < 6) {
        newErrors.mfsTrxId = isBn
          ? "সঠিক ট্রানজেকশন আইডি (TrxID) লিখুন।"
          : "Please enter the valid Transaction ID (TrxID).";
      }
    }

    if (!inspectAcknowledged) {
      newErrors.inspectAcknowledged = isBn
        ? "ডেলিভারি গ্রহণের পূর্বে পণ্য দেখে নেওয়ার বিষয়টি স্বীকার করুন।"
        : "You must acknowledge inspection before accepting delivery.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (items.length === 0) {
      toast.error(isBn ? "আপনার কার্ট খালি।" : "Your cart is empty.");
      return;
    }

    if (!isDeliveryConfigured || effectiveShippingFee === null) {
      toast.error(
        isBn
          ? "নির্বাচিত এলাকার ডেলিভারি চার্জ নির্ধারিত না থাকায় সরাসরি অর্ডার নেওয়া যাচ্ছে না। অনুগ্রহ করে 01712-039707 নম্বরে যোগাযোগ করুন।"
          : "Delivery fee is not yet configured for this zone. Please contact support via Call or WhatsApp at 01712-039707."
      );
      return;
    }

    if (!validateForm()) {
      toast.error(isBn ? "অনুগ্রহ করে প্রয়োজনীয় তথ্য সঠিকভাবে দিন।" : "Please fill in all required delivery details.");
      return;
    }

    setIsSubmitting(true);
    const cleanPhone = phone.replace(/[\s-]/g, "");

    try {
      const res = await placeOrder({
        fullName: fullName.trim(),
        phone: cleanPhone,
        email: email.trim() || undefined,
        division,
        cityArea: cityArea.trim(),
        fullAddress: fullAddress.trim(),
        deliveryNotes: deliveryNotes.trim() || undefined,
        deliveryZone,
        paymentMethod,
        senderNumber: paymentMethod !== "CASH_ON_DELIVERY" ? mfsSenderNumber.trim() : undefined,
        trxId: paymentMethod !== "CASH_ON_DELIVERY" ? mfsTrxId.trim().toUpperCase() : undefined,
        inspectionAcknowledged: inspectAcknowledged,
        expectedShippingFee: effectiveShippingFee,
        expectedTotal: effectiveTotal,
        items: items.map((i) => ({
          variantId: i.variantId,
          quantity: i.quantity,
          giftWrap: false,
        })),
        couponCode: coupon?.code,
        idempotencyKey: idempotencyKey.current,
        userId: user?.id,
      });

      if (res.success && res.orderId) {
        toast.success(
          isBn
            ? `অর্ডার #${res.orderNumber} সফলভাবে গ্রহণ করা হয়েছে!`
            : `Order #${res.orderNumber} placed successfully!`
        );
        clearCart();
        const dest = `/order/${res.orderId}?success=1&token=${res.token || ""}`;
        router.push(dest);
      } else {
        toast.error(res.error || (isBn ? "অর্ডার সম্পন্ন করা যায়নি।" : "Failed to place order."));
        setIsSubmitting(false);
      }
    } catch {
      toast.error(isBn ? "একটি সমস্যা হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।" : "An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  if (mounted && user?.role && user.role !== "CUSTOMER") {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-6 bg-[var(--surface)]">
        <div className="max-w-md w-full bg-[var(--surface-container-low)] p-8 rounded-4xl border border-[var(--border)] shadow-xl text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-heading font-black text-[var(--text-primary)]">
            Management Account Detected
          </h2>
          <p className="text-xs text-[var(--text-muted)] leading-relaxed">
            You are signed in as <strong>{user.name || user.email}</strong> with an administrative role (<strong>{user.role}</strong>). Administrators and staff members cannot place retail customer orders.
          </p>
          <div className="flex flex-col gap-2.5 pt-2">
            <Button
              onClick={() => router.push("/")}
              variant="pill-primary"
              className="w-full font-bold"
            >
              Return to Storefront
            </Button>
            <Button
              variant="outline"
              onClick={() => router.push("/login")}
              className="w-full rounded-full text-xs font-bold"
            >
              Switch Account
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full bg-[var(--surface)] min-h-screen py-6 space-y-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Breadcrumb & Trust Strip */}
        <section
          aria-label="Breadcrumb"
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)] text-xs text-[var(--text-muted)]"
        >
          <nav className="flex items-center gap-1.5">
            <Link href="/" className="hover:text-[var(--primary)] transition-colors">
              {isBn ? "হোম" : "Home"}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/cart" className="hover:text-[var(--primary)] transition-colors">
              {isBn ? "কার্ট" : "Cart"} ({items.length})
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-bold text-[var(--primary)]">
              {isBn ? "চেকআউট" : "Express Checkout"}
            </span>
          </nav>
          <div className="inline-flex items-center gap-3 bg-[var(--surface-container-low)] px-3.5 py-1 rounded-full border border-[var(--border)] text-[11px]">
            <span className="flex items-center gap-1 text-[var(--primary)] font-bold">
              <Lock className="w-3.5 h-3.5" /> {isBn ? "নিরাপদ চেকআউট" : "Secure Checkout"}
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1 text-[var(--secondary)] font-bold">
              <ShieldCheck className="w-3.5 h-3.5" /> {isBn ? "পণ্য দেখে নিন" : "Inspect At Delivery"}
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold">
              <Truck className="w-3.5 h-3.5" /> {isBn ? "ক্যাশ অন ডেলিভারি" : "Cash on Delivery Available"}
            </span>
          </div>
        </section>

        {/* 3-Step Stepper */}
        <section
          aria-label="Checkout Steps"
          className="bg-[var(--surface-container-low)] p-4 sm:p-6 rounded-3xl border border-[var(--border)] shadow-xs"
        >
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--primary)] text-[var(--on-primary)] font-black text-sm flex items-center justify-center shadow-md shrink-0">
                1
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--primary)] block">
                  {isBn ? "ধাপ ১ • সক্রিয়" : "Step 01 • Active"}
                </span>
                <span className="font-heading font-black text-sm text-[var(--text-primary)]">
                  {isBn ? "ঠিকানা ও যোগাযোগের তথ্য" : "Recipient & Address"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--secondary-container)] text-[var(--on-secondary-container)] font-black text-sm flex items-center justify-center shadow-md shrink-0">
                2
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--secondary)] block">
                  {isBn ? "ধাপ ২" : "Step 02"}
                </span>
                <span className="font-heading font-black text-sm text-[var(--text-primary)]">
                  {isBn ? "ডেলিভারি জোন" : "Delivery Zone"}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--surface-container-high)] text-[var(--text-muted)] font-black text-sm flex items-center justify-center shrink-0">
                3
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] block">
                  {isBn ? "ধাপ ৩" : "Step 03"}
                </span>
                <span className="font-heading font-black text-sm text-[var(--text-primary)]">
                  {isBn ? "পেমেন্ট পদ্ধতি" : "Payment Method"}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Main Form & Summary Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Checkout Form */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handlePlaceOrder} className="space-y-6">
              {/* STEP 1: Address Details */}
              <div className="p-6 sm:p-8 rounded-4xl bg-[var(--surface-container-low)] border border-[var(--border)] shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-black text-xs flex items-center justify-center">
                      1
                    </span>
                    <div>
                      <h2 className="font-heading font-black text-lg sm:text-xl text-[var(--text-primary)]">
                        {isBn ? "ডেলিভারি ঠিকানা ও যোগাযোগের তথ্য" : "Contact & Delivery Address"}
                      </h2>
                      <p className="text-xs text-[var(--text-muted)]">
                        {isBn ? "যে ঠিকানায় খেলনা পৌঁছানো হবে" : "Where should we deliver your parcel?"}
                      </p>
                    </div>
                  </div>
                  <Truck className="w-6 h-6 text-[var(--primary)]" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1">
                      {isBn ? "আপনার পুরো নাম" : "Customer Full Name"} <span className="text-[var(--primary)]">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-3 text-[var(--text-muted)]" />
                      <input
                        type="text"
                        name="fullName"
                        id="fullName"
                        data-testid="checkout-fullname"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder={isBn ? "যেমন: মারিয়াম খান" : "e.g. Mariam Khan"}
                        required
                        className={`w-full h-11 pl-10 pr-4 rounded-full bg-[var(--surface)] text-xs font-medium text-[var(--text-primary)] border focus:outline-none focus:ring-2 focus:ring-[var(--primary)] ${
                          errors.fullName ? "border-[var(--danger)]" : "border-[var(--border)]"
                        }`}
                      />
                    </div>
                    {errors.fullName && <p className="text-[11px] text-[var(--danger)] font-bold">{errors.fullName}</p>}
                  </div>

                  {/* Phone */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-[var(--text-primary)]">
                      <span>{isBn ? "মোবাইল নম্বর" : "Mobile Phone"} <span className="text-[var(--primary)]">*</span></span>
                      <span className="text-[10px] text-[var(--secondary)]">{isBn ? "কল ও এসএমএস" : "Calls & SMS"}</span>
                    </div>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-xs font-bold text-[var(--text-primary)] select-none">
                        🇧🇩 +880
                      </span>
                      <input
                        type="tel"
                        name="phone"
                        id="phone"
                        data-testid="checkout-phone"
                        value={phone.startsWith("+880") ? phone.replace("+880", "").trim() : phone}
                        onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, ""))}
                        placeholder="1712039707"
                        required
                        className={`w-full h-11 pl-20 pr-4 rounded-full bg-[var(--surface)] text-xs font-medium text-[var(--text-primary)] border focus:outline-none focus:ring-2 focus:ring-[var(--primary)] ${
                          errors.phone ? "border-[var(--danger)]" : "border-[var(--border)]"
                        }`}
                      />
                    </div>
                    {errors.phone && <p className="text-[11px] text-[var(--danger)] font-bold">{errors.phone}</p>}
                  </div>

                  {/* Email (Optional) */}
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-[var(--text-primary)] flex items-center justify-between">
                      <span>{isBn ? "ইমেইল ঠিকানা" : "Email Address"}</span>
                      <span className="text-[10px] text-[var(--text-muted)] font-normal">{isBn ? "(ঐচ্ছিক)" : "(Optional)"}</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[var(--text-muted)]" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="name@example.com"
                        className={`w-full h-11 pl-10 pr-4 rounded-full bg-[var(--surface)] text-xs font-medium text-[var(--text-primary)] border focus:outline-none focus:ring-2 focus:ring-[var(--primary)] ${
                          errors.email ? "border-[var(--danger)]" : "border-[var(--border)]"
                        }`}
                      />
                    </div>
                    {errors.email && <p className="text-[11px] text-[var(--danger)] font-bold">{errors.email}</p>}
                  </div>

                  {/* Division */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--text-primary)]">
                      {isBn ? "বিভাগ" : "Division"} <span className="text-[var(--primary)]">*</span>
                    </label>
                    <select
                      value={division}
                      onChange={(e) => {
                        const val = e.target.value;
                        setDivision(val);
                        handleDeliveryZoneChange(val === "Dhaka" ? "inside_dhaka" : "outside_dhaka");
                      }}
                      className="w-full h-11 px-4 rounded-full bg-[var(--surface)] text-xs font-bold text-[var(--text-primary)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] cursor-pointer"
                    >
                      {BD_DIVISIONS.map((d) => (
                        <option key={d} value={d}>
                          {d} {isBn ? "বিভাগ" : "Division"} {d === "Dhaka" ? (isBn ? "(ঢাকা মেট্রো)" : "(Inside Dhaka)") : (isBn ? "(ঢাকার বাইরে)" : "(Outside Dhaka)")}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Area / Thana */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--text-primary)]">
                      {isBn ? "এলাকা / থানা" : "Specific Area / Thana"} <span className="text-[var(--primary)]">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-[var(--text-muted)]" />
                      <input
                        type="text"
                        value={cityArea}
                        onChange={(e) => setCityArea(e.target.value)}
                        placeholder={isBn ? "যেমন: ধানমন্ডি, উত্তরা, চকবাজার" : "e.g. Dhanmondi, Uttara, Agrabad"}
                        required
                        className={`w-full h-11 pl-10 pr-4 rounded-full bg-[var(--surface)] text-xs font-medium text-[var(--text-primary)] border focus:outline-none focus:ring-2 focus:ring-[var(--primary)] ${
                          errors.cityArea ? "border-[var(--danger)]" : "border-[var(--border)]"
                        }`}
                      />
                    </div>
                    {errors.cityArea && <p className="text-[11px] text-[var(--danger)] font-bold">{errors.cityArea}</p>}
                  </div>

                  {/* Full Address */}
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-[var(--text-primary)]">
                      {isBn ? "বিস্তারিত ঠিকানা (বাড়ি, রোড, ফ্ল্যাট নম্বর)" : "Full Street Address"} <span className="text-[var(--primary)]">*</span>
                    </label>
                    <input
                      type="text"
                      value={fullAddress}
                      onChange={(e) => setFullAddress(e.target.value)}
                      placeholder={isBn ? "যেমন: বাড়ি ৪২, রোড ৭/এ, ফ্ল্যাট ৪বি" : "e.g. House 42, Road 7/A, Apt 4B"}
                      required
                      className={`w-full h-11 px-4 rounded-full bg-[var(--surface)] text-xs font-medium text-[var(--text-primary)] border focus:outline-none focus:ring-2 focus:ring-[var(--primary)] ${
                        errors.fullAddress ? "border-[var(--danger)]" : "border-[var(--border)]"
                      }`}
                    />
                    {errors.fullAddress && (
                      <p className="text-[11px] text-[var(--danger)] font-bold">{errors.fullAddress}</p>
                    )}
                  </div>

                  {/* Notes */}
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-[var(--text-primary)]">
                      {isBn ? "ডেলিভারি নির্দেশিকা (ঐচ্ছিক)" : "Rider Instructions (Optional)"}
                    </label>
                    <input
                      type="text"
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      placeholder={isBn ? "যেমন: মসজিদের পাশে, ৩য় তলায় বেল দিন" : "e.g. Near park gate, ring bell 4B"}
                      className="w-full h-11 px-4 rounded-full bg-[var(--surface)] text-xs font-medium text-[var(--text-primary)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                  </div>
                </div>
              </div>

              {/* STEP 2: Delivery Zone Selection */}
              <div className="p-6 sm:p-8 rounded-4xl bg-[var(--surface-container-low)] border border-[var(--border)] shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-[var(--secondary-container)]/20 text-[var(--secondary)] font-black text-xs flex items-center justify-center">
                      2
                    </span>
                    <div>
                      <h2 className="font-heading font-black text-lg sm:text-xl text-[var(--text-primary)]">
                        {isBn ? "ডেলিভারি জোন ও চার্জ" : "Delivery Zone"}
                      </h2>
                      <p className="text-xs text-[var(--text-muted)]">
                        {isBn ? "আপনার ঠিকানা অনুযায়ী ডেলিভারি চার্জ" : "Select your delivery location"}
                      </p>
                    </div>
                  </div>
                  <Truck className="w-6 h-6 text-[var(--secondary)]" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Inside Dhaka */}
                  <label
                    onClick={() => handleDeliveryZoneChange("inside_dhaka")}
                    className={`p-4 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                      deliveryZone === "inside_dhaka"
                        ? "bg-[var(--surface)] border-[var(--primary)] shadow-xs"
                        : "bg-[var(--surface)]/60 border-[var(--border)] opacity-80 hover:opacity-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                            deliveryZone === "inside_dhaka" ? "bg-[var(--primary)] text-white" : "bg-[var(--border)]"
                          }`}
                        >
                          {deliveryZone === "inside_dhaka" && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <span className="font-black text-xs text-[var(--text-primary)]">
                          {isBn ? "ঢাকা মেট্রো" : "Inside Dhaka"}
                        </span>
                      </div>
                      <span className="text-xs font-black text-[var(--primary)]">
                        {publicSettings?.insideDhakaRate !== null && publicSettings?.insideDhakaRate !== undefined
                          ? formatPrice(publicSettings.insideDhakaRate)
                          : isBn ? "অসংজ্ঞায়িত" : "To be confirmed"}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      {isBn ? "ঢাকা সিটির ভেতরে ডেলিভারি" : "Doorstep delivery within Dhaka Metro"}
                    </p>
                  </label>

                  {/* Outside Dhaka */}
                  <label
                    onClick={() => handleDeliveryZoneChange("outside_dhaka")}
                    className={`p-4 rounded-3xl border-2 transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                      deliveryZone === "outside_dhaka"
                        ? "bg-[var(--surface)] border-[var(--primary)] shadow-xs"
                        : "bg-[var(--surface)]/60 border-[var(--border)] opacity-80 hover:opacity-100"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                            deliveryZone === "outside_dhaka" ? "bg-[var(--primary)] text-white" : "bg-[var(--border)]"
                          }`}
                        >
                          {deliveryZone === "outside_dhaka" && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <span className="font-black text-xs text-[var(--text-primary)]">
                          {isBn ? "ঢাকার বাইরে" : "Outside Dhaka"}
                        </span>
                      </div>
                      <span className="text-xs font-black text-[var(--text-primary)]">
                        {publicSettings?.outsideDhakaRate !== null && publicSettings?.outsideDhakaRate !== undefined
                          ? formatPrice(publicSettings.outsideDhakaRate)
                          : isBn ? "অসংজ্ঞায়িত" : "To be confirmed"}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      {isBn ? "কুরিয়ার সার্ভিসের মাধ্যমে ডেলিভারি" : "Doorstep courier delivery outside Dhaka"}
                    </p>
                  </label>
                </div>

                {(!isDeliveryConfigured || effectiveShippingFee === null) && (
                  <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-900 dark:text-amber-200 text-xs flex items-start gap-3 mt-3">
                    <AlertTriangle className="w-5 h-5 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
                    <div className="space-y-1">
                      <p className="font-bold">
                        {isBn ? "ডেলিভারি চার্জ নির্ধারণের অপেক্ষায়" : "Delivery Rate To Be Confirmed"}
                      </p>
                      <p className="leading-relaxed">
                        {isBn
                          ? "নির্বাচিত এলাকার জন্য সরাসরি ডেলিভারি চার্জ সক্রিয় নেই। অর্ডার সম্পন্ন করতে এবং ডেলিভারি ফি জানতে অনুগ্রহ করে কল বা WhatsApp করুন: 01712-039707"
                          : "Delivery fee is not yet configured for this zone. Please contact support via Call or WhatsApp at 01712-039707 to confirm delivery rate and order."}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* STEP 3: Payment Method */}
              <div className="p-6 sm:p-8 rounded-4xl bg-[var(--surface-container-low)] border border-[var(--border)] shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] font-black text-xs flex items-center justify-center">
                      3
                    </span>
                    <div>
                      <h2 className="font-heading font-black text-lg sm:text-xl text-[var(--text-primary)]">
                        {isBn ? "পেমেন্ট পদ্ধতি" : "Payment Method"}
                      </h2>
                      <p className="text-xs text-[var(--text-muted)]">
                        {isBn ? "ক্যাশ অন ডেলিভারি, বিকাশ অথবা নগদ" : "Cash on Delivery, bKash, or Nagad"}
                      </p>
                    </div>
                  </div>
                  <ShieldCheck className="w-6 h-6 text-[var(--accent)]" />
                </div>

                <div className="space-y-3">
                  {/* COD */}
                  <label
                    onClick={() => setPaymentMethod("CASH_ON_DELIVERY")}
                    className={`p-4 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                      paymentMethod === "CASH_ON_DELIVERY"
                        ? "bg-[var(--surface)] border-[var(--primary)] shadow-xs"
                        : "bg-[var(--surface)]/70 border-[var(--border)]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                          paymentMethod === "CASH_ON_DELIVERY" ? "bg-[var(--primary)] text-white" : "bg-[var(--border)]"
                        }`}
                      >
                        {paymentMethod === "CASH_ON_DELIVERY" && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <span className="font-black text-xs sm:text-sm text-[var(--text-primary)] block">
                          {isBn ? "ক্যাশ অন ডেলিভারি (COD)" : "Cash on Delivery"}
                        </span>
                        <span className="text-[11px] text-[var(--text-muted)]">
                          {isBn
                            ? "পণ্য হাতে পেয়ে দেখে নিয়ে নগদ টাকা পরিশোধ করুন।"
                            : "Pay cash to the delivery person after inspecting the product."}
                        </span>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold text-[11px] shrink-0">
                      {isBn ? "অগ্রিম পেমেন্ট নেই" : "No Advance"}
                    </span>
                  </label>

                  {/* bKash */}
                  <label
                    onClick={() => setPaymentMethod("BKASH")}
                    className={`p-4 rounded-3xl border-2 transition-all cursor-pointer flex flex-col gap-3 ${
                      paymentMethod === "BKASH"
                        ? "bg-[var(--surface)] border-[var(--primary)] shadow-xs"
                        : "bg-[var(--surface)]/70 border-[var(--border)]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                            paymentMethod === "BKASH" ? "bg-[var(--primary)] text-white" : "bg-[var(--border)]"
                          }`}
                        >
                          {paymentMethod === "BKASH" && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <span className="font-black text-xs sm:text-sm text-[var(--text-primary)] block">
                            {isBn ? "বিকাশ পেমেন্ট (bKash)" : "bKash Mobile Payment"}
                          </span>
                          <span className="text-[11px] text-[var(--text-muted)] font-medium">
                            {isBn
                              ? "বিকাশে পেমেন্ট পাঠান 01712-039707 নম্বরে"
                              : "Send payment to 01712-039707 • Verified by staff"}
                          </span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-md bg-[#e2136e] text-white font-black text-xs">
                        bKash
                      </span>
                    </div>

                    {paymentMethod === "BKASH" && (
                      <div className="p-3.5 rounded-2xl bg-[var(--surface-container-low)] border border-[var(--border)] space-y-3">
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
                          <div>
                            <span className="text-[10px] text-[var(--text-muted)] block uppercase font-bold">
                              {isBn ? "বিকাশ নম্বর" : "bKash Number"}
                            </span>
                            <span className="font-mono font-black text-sm text-[var(--text-primary)] tracking-wider">
                              01712-039707
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText("01712039707");
                              toast.success(isBn ? "বিকাশ নম্বর কপি করা হয়েছে!" : "bKash number 01712039707 copied!");
                            }}
                            className="px-2.5 py-1 rounded-full bg-[var(--surface-container-high)] text-[var(--primary)] text-xs font-bold hover:bg-[var(--primary)] hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{isBn ? "কপি" : "Copy"}</span>
                          </button>
                        </div>
                        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                          {isBn
                            ? `মোট ${effectiveShippingFee !== null ? formatPrice(effectiveTotal) : formatPrice(subtotal - discount) + " (+ ডেলিভারি ফি)"} টাকা বিকাশ 01712-039707 নম্বরে পাঠিয়ে নিচের বক্সে আপনার বিকাশ নম্বর ও TrxID লিখুন:`
                            : `Send ${effectiveShippingFee !== null ? formatPrice(effectiveTotal) : formatPrice(subtotal - discount) + " (+ delivery fee)"} to 01712-039707, then enter your sender number and Transaction ID (TrxID) below:`}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="tel"
                            placeholder={isBn ? "আপনার বিকাশ নম্বর (01XXXXXXXXX)" : "Your bKash Number"}
                            value={mfsSenderNumber}
                            onChange={(e) => setMfsSenderNumber(e.target.value)}
                            className="h-10 px-3.5 rounded-full bg-[var(--surface)] text-xs border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                          />
                          <input
                            type="text"
                            placeholder={isBn ? "বিকাশ TrxID (যেমন: 9J4K2L1M)" : "bKash TrxID (e.g. 9J4K2L1M)"}
                            value={mfsTrxId}
                            onChange={(e) => setMfsTrxId(e.target.value.toUpperCase())}
                            className="h-10 px-3.5 rounded-full bg-[var(--surface)] text-xs border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] uppercase font-mono"
                          />
                        </div>
                        {errors.mfsSender && <p className="text-[11px] text-[var(--danger)] font-bold">{errors.mfsSender}</p>}
                        {errors.mfsTrxId && <p className="text-[11px] text-[var(--danger)] font-bold">{errors.mfsTrxId}</p>}
                      </div>
                    )}
                  </label>

                  {/* Nagad */}
                  <label
                    onClick={() => setPaymentMethod("NAGAD")}
                    className={`p-4 rounded-3xl border-2 transition-all cursor-pointer flex flex-col gap-3 ${
                      paymentMethod === "NAGAD"
                        ? "bg-[var(--surface)] border-[var(--primary)] shadow-xs"
                        : "bg-[var(--surface)]/70 border-[var(--border)]"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                            paymentMethod === "NAGAD" ? "bg-[var(--primary)] text-white" : "bg-[var(--border)]"
                          }`}
                        >
                          {paymentMethod === "NAGAD" && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <span className="font-black text-xs sm:text-sm text-[var(--text-primary)] block">
                            {isBn ? "নগদ পেমেন্ট (Nagad)" : "Nagad Digital Payment"}
                          </span>
                          <span className="text-[11px] text-[var(--text-muted)] font-medium">
                            {isBn
                              ? "নগদে পেমেন্ট পাঠান 01712-039707 নম্বরে"
                              : "Send payment to 01712-039707 • Verified by staff"}
                          </span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-md bg-[#f7941d] text-white font-black text-xs">
                        Nagad
                      </span>
                    </div>

                    {paymentMethod === "NAGAD" && (
                      <div className="p-3.5 rounded-2xl bg-[var(--surface-container-low)] border border-[var(--border)] space-y-3">
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)]">
                          <div>
                            <span className="text-[10px] text-[var(--text-muted)] block uppercase font-bold">
                              {isBn ? "নগদ নম্বর" : "Nagad Number"}
                            </span>
                            <span className="font-mono font-black text-sm text-[var(--text-primary)] tracking-wider">
                              01712-039707
                            </span>
                          </div>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigator.clipboard.writeText("01712039707");
                              toast.success(isBn ? "নগদ নম্বর কপি করা হয়েছে!" : "Nagad number 01712039707 copied!");
                            }}
                            className="px-2.5 py-1 rounded-full bg-[var(--surface-container-high)] text-[var(--primary)] text-xs font-bold hover:bg-[var(--primary)] hover:text-white transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            <span>{isBn ? "কপি" : "Copy"}</span>
                          </button>
                        </div>
                        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                          {isBn
                            ? `মোট ${effectiveShippingFee !== null ? formatPrice(effectiveTotal) : formatPrice(subtotal - discount) + " (+ ডেলিভারি ফি)"} টাকা নগদ 01712-039707 নম্বরে পাঠিয়ে নিচের বক্সে আপনার নগদ নম্বর ও TrxID লিখুন:`
                            : `Send ${effectiveShippingFee !== null ? formatPrice(effectiveTotal) : formatPrice(subtotal - discount) + " (+ delivery fee)"} to 01712-039707, then enter your sender number and Transaction ID (TrxID) below:`}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="tel"
                            placeholder={isBn ? "আপনার নগদ নম্বর (01XXXXXXXXX)" : "Your Nagad Number"}
                            value={mfsSenderNumber}
                            onChange={(e) => setMfsSenderNumber(e.target.value)}
                            className="h-10 px-3.5 rounded-full bg-[var(--surface)] text-xs border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                          />
                          <input
                            type="text"
                            placeholder={isBn ? "নগদ TrxID (যেমন: 7K8M9P0Q)" : "Nagad TrxID (e.g. 7K8M9P0Q)"}
                            value={mfsTrxId}
                            onChange={(e) => setMfsTrxId(e.target.value.toUpperCase())}
                            className="h-10 px-3.5 rounded-full bg-[var(--surface)] text-xs border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] uppercase font-mono"
                          />
                        </div>
                        {errors.mfsSender && <p className="text-[11px] text-[var(--danger)] font-bold">{errors.mfsSender}</p>}
                        {errors.mfsTrxId && <p className="text-[11px] text-[var(--danger)] font-bold">{errors.mfsTrxId}</p>}
                      </div>
                    )}
                  </label>
                </div>
              </div>

              {/* Delivery Inspection Policy & Mandatory Checkbox */}
              <div className="p-5 rounded-3xl bg-[var(--surface-container-low)] border border-[var(--border)] space-y-3.5">
                <div className="flex items-start gap-3">
                  <div className="w-9 h-9 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shrink-0 mt-0.5">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="text-xs sm:text-sm font-black text-[var(--text-primary)]">
                      {isBn
                        ? "গ্রহণের আগে পণ্য পরীক্ষা করুন"
                        : "Inspect Before You Accept"}
                    </h4>
                    <p className="text-[11px] sm:text-xs text-[var(--text-muted)] leading-relaxed">
                      {isBn
                        ? "ডেলিভারি গ্রহণ করার আগে ডেলিভারি কর্মীর সামনে পণ্যটি ভালোভাবে দেখে নিন। ডেলিভারির সময় কোনো ত্রুটি দেখা গেলে পণ্য ফেরত দিয়ে রিফান্ড নেওয়া যাবে। পণ্য দেখে গ্রহণ করার পর কোনো রিফান্ড প্রযোজ্য হবে না।"
                        : "Please inspect the product in front of the delivery person before accepting delivery. If any defect is found at the time of delivery, you can return it and receive a refund. Once the product is inspected and accepted, it is non-refundable."}
                    </p>
                  </div>
                </div>

                <label className="flex items-start gap-3 pt-3 border-t border-[var(--border)] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    id="inspectionConsent"
                    name="inspectionConsent"
                    data-testid="checkout-inspection-consent"
                    checked={inspectAcknowledged}
                    onChange={(e) => setInspectAcknowledged(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer shrink-0"
                  />
                  <span className="text-xs font-bold text-[var(--text-primary)] leading-snug">
                    {isBn
                      ? "আমি বুঝেছি যে পণ্য গ্রহণের পূর্বে ডেলিভারি কর্মীর সামনে দেখে নিতে হবে। পণ্য গ্রহণের পর কোনো রিফান্ড বা ফেরত প্রযোজ্য নয়।"
                      : "I understand that I must inspect the product before accepting delivery. Returns and refunds are only accepted if defects are reported to the delivery person at delivery."}
                  </span>
                </label>
                {errors.inspectAcknowledged && (
                  <p className="text-[11px] text-[var(--danger)] font-bold">{errors.inspectAcknowledged}</p>
                )}
              </div>

              {/* Submit CTA */}
              <Button
                type="submit"
                disabled={isSubmitting || items.length === 0 || !inspectAcknowledged || !isDeliveryConfigured || effectiveShippingFee === null}
                variant="pill-primary"
                size="lg"
                className="w-full h-14 font-black text-base shadow-[0_4px_0_#93000E] active:translate-y-[2px] active:shadow-[0_2px_0_#93000E] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span>
                  {isSubmitting
                    ? isBn
                      ? "অর্ডার প্রক্রিয়া হচ্ছে..."
                      : "Placing Order..."
                    : isBn
                    ? "অর্ডার নিশ্চিত করুন"
                    : "Confirm Order"}
                </span>
                <ArrowRight className="w-4 h-4" />
              </Button>
              {(!isDeliveryConfigured || effectiveShippingFee === null) && (
                <p className="text-center text-xs text-amber-700 dark:text-amber-400 font-bold pt-2">
                  {isBn
                    ? "অর্ডার সম্পন্ন করতে কল বা WhatsApp করুন 01712-039707 নম্বরে"
                    : "Please call or WhatsApp 01712-039707 to complete this order."}
                </p>
              )}
            </form>
          </div>

          {/* RIGHT COLUMN: Sticky Order Summary */}
          <aside className="lg:col-span-5 space-y-5 sticky top-24">
            <div className="p-6 sm:p-8 rounded-4xl bg-[var(--surface-container-low)] border border-[var(--border)] shadow-md space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-black text-lg text-[var(--text-primary)]">
                    {isBn ? "অর্ডার সারাংশ" : "Order Summary"}
                  </h3>
                  <span className="w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-black text-xs flex items-center justify-center">
                    {items.length}
                  </span>
                </div>
                <Link href="/cart" className="text-xs font-bold text-[var(--primary)] hover:underline">
                  {isBn ? "কার্ট পরিবর্তন" : "Edit Cart"}
                </Link>
              </div>

              {/* Items List */}
              <div className="space-y-3 max-h-64 overflow-y-auto pr-1">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative w-14 h-14 rounded-2xl bg-[var(--surface)] border border-[var(--border)] overflow-hidden shrink-0">
                      <Image
                        src={item.image || "/images/logo-placeholder.svg"}
                        alt={item.name}
                        fill
                        className="object-contain p-1"
                        sizes="56px"
                      />
                      <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[var(--primary)] text-[var(--on-primary)] font-black text-[9px] flex items-center justify-center">
                        {item.quantity}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-bold text-xs text-[var(--text-primary)] truncate">{item.name}</h4>
                      <p className="text-[10px] text-[var(--text-muted)] truncate">{item.title}</p>
                    </div>
                    <span className="font-black text-xs text-[var(--text-primary)] shrink-0">
                      {formatPrice(item.price * item.quantity)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Coupon Form */}
              <form onSubmit={handleCouponSubmit} className="pt-2 border-t border-[var(--border)] space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                  {isBn ? "ডিসকাউন্ট কুপন কোড" : "Promo Coupon Code"}
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value)}
                    placeholder="COUPON"
                    className="flex-1 h-10 px-4 rounded-full bg-[var(--surface)] text-xs font-bold text-[var(--text-primary)] border border-[var(--border)] focus:outline-none uppercase"
                  />
                  <Button
                    type="submit"
                    disabled={isApplyingCoupon || !couponCodeInput.trim()}
                    variant="pill-amber"
                    size="sm"
                    className="h-10 px-4 text-xs font-black shadow-xs cursor-pointer"
                  >
                    {isBn ? "প্রয়োগ" : "Apply"}
                  </Button>
                </div>
                {coupon && (
                  <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> &quot;{coupon.code}&quot; (-{formatPrice(coupon.discountAmount)})
                    </span>
                    <button
                      type="button"
                      onClick={removeCoupon}
                      className="text-[var(--danger)] hover:underline text-[10px] cursor-pointer"
                    >
                      {isBn ? "মুছুন" : "Remove"}
                    </button>
                  </div>
                )}
              </form>

              {/* Price Breakdown */}
              <div className="space-y-2 pt-2 border-t border-[var(--border)] text-xs text-[var(--text-muted)]">
                <div className="flex justify-between">
                  <span>{isBn ? "সাবটোটাল" : "Subtotal"}</span>
                  <span className="font-bold text-[var(--text-primary)]">{formatPrice(subtotal)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-[var(--primary)] font-bold">
                    <span>{isBn ? "কুপন ছাড়" : "Coupon Discount"}</span>
                    <span>-{formatPrice(discount)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>
                    {isBn
                      ? `ডেলিভারি (${deliveryZone === "inside_dhaka" ? "ঢাকা মেট্রো" : "ঢাকার বাইরে"})`
                      : `Delivery (${deliveryZone === "inside_dhaka" ? "Inside Dhaka" : "Outside Dhaka"})`}
                  </span>
                  <span className="font-bold text-[var(--text-primary)]">
                    {effectiveShippingFee !== null
                      ? formatPrice(effectiveShippingFee)
                      : isBn ? "নিশ্চিত করা হবে" : "To be confirmed"}
                  </span>
                </div>

                <div className="pt-3 border-t border-[var(--border)] flex justify-between items-baseline">
                  <div>
                    <span className="font-heading font-black text-base text-[var(--text-primary)] block">
                      {isBn ? "সর্বমোট প্রদেয়" : "Total Payable"}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)]">
                      {effectiveShippingFee === null
                        ? isBn ? "ডেলিভারি চার্জ নিশ্চিত করা হবে" : "Delivery fee to be confirmed"
                        : isBn ? "প্রদেয় সর্বমোট মূল্য" : "Final Payable Amount"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-heading font-black text-3xl sm:text-4xl text-[var(--primary)] block leading-none">
                      {formatPrice(effectiveTotal)}
                    </span>
                    {effectiveShippingFee === null && (
                      <span className="text-[10px] text-amber-700 dark:text-amber-400 font-bold block mt-1">
                        {isBn ? "+ ডেলিভারি চার্জ" : "+ Delivery fee TBD"}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Support & Inspection Reminder */}
              <div className="p-4 rounded-3xl bg-[var(--surface)] border border-[var(--border)] space-y-2 text-xs">
                <div className="flex items-center gap-2 text-[var(--text-primary)] font-bold">
                  <ShieldCheck className="w-4 h-4 text-[var(--primary)]" />
                  <span>{isBn ? "গ্রহণের পূর্বে পণ্য দেখে নিন" : "Inspect Before You Accept"}</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--text-primary)] font-bold">
                  <RotateCcw className="w-4 h-4 text-[var(--secondary)]" />
                  <span>{isBn ? "ডেলিভারির সময় ত্রুটিতে ফেরত" : "Defective Reported at Delivery Refundable"}</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--text-primary)] font-bold">
                  <Headphones className="w-4 h-4 text-blue-600" />
                  <span>{isBn ? "হেল্পলাইন: 01712-039707" : "Support Helpline: 01712-039707"}</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
