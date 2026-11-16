"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import { useSession } from "next-auth/react";
import { useMounted } from "@/lib/use-mounted";
import { formatPrice } from "@/lib/utils";
import { placeOrder } from "@/server/actions/order-actions";
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
  Sparkles,
  Gift,
  RotateCcw,
  Headphones,
  CheckCircle,
  Stars,
  Timer,
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

const GIFT_WRAP_STYLES = [
  {
    id: "confetti",
    name: "Confetti & Red Satin",
    tag: "Festive Ribbon",
    desc: "Vibrant handcrafted paper with confetti stars and lush red satin bow.",
  },
  {
    id: "kraft",
    name: "Eco Kraft & Twine",
    tag: "Eco Classic",
    desc: "Natural craft wrap with pastel safari animal artwork and organic twine.",
  },
  {
    id: "galaxy",
    name: "Galaxy Blue & Gold",
    tag: "Astronaut Theme",
    desc: "Cosmic royal blue paper with golden planets and metallic gold ribbon.",
  },
];

export default function CheckoutPage() {
  const router = useRouter();
  const mounted = useMounted();
  const { data: session } = useSession();
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
    getGiftWrapFee,
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Stitch Sensory Additions
  const [kidSurprise, setKidSurprise] = useState(false);
  const [childNameAge, setChildNameAge] = useState("");
  const [childBirthday, setChildBirthday] = useState("");
  const [selectedWrapStyle, setSelectedWrapStyle] = useState("confetti");
  const [cardMessage, setCardMessage] = useState("");
  const [playPointsRedeemed, setPlayPointsRedeemed] = useState(false);
  const [couponCodeInput, setCouponCodeInput] = useState("");
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);

  // Auto-fill from user profile
  useEffect(() => {
    if (user) {
      if (user.name) setFullName((prev) => prev || user.name || "");
      if (user.phone) setPhone((prev) => prev || user.phone || "");
      if (user.email) setEmail((prev) => prev || user.email || "");
      if (user.id) {
        try {
          const stored = localStorage.getItem(`kb_addr_${user.id}`);
          if (stored) {
            const addrs = JSON.parse(stored);
            const def = addrs.find((a: any) => a.isDefault) || addrs[0];
            if (def) {
              setDivision((prev) => prev || def.division || "Dhaka");
              setCityArea((prev) => prev || def.city || "");
              setFullAddress((prev) => prev || def.line1 || "");
            }
          }
        } catch {
          // ignore
        }
      }
    }
  }, [user]);

  if (!mounted) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center text-sm text-[var(--text-muted)] animate-pulse">
        Loading magical checkout...
      </div>
    );
  }

  const subtotal = getSubtotal();
  const couponDiscount = getDiscount();
  const playPointsDiscount = playPointsRedeemed ? 145 : 0;
  const discount = couponDiscount + playPointsDiscount;
  const shippingFee = getShippingFee();
  const giftWrapFee = getGiftWrapFee();
  const total = Math.max(0, getTotal() - playPointsDiscount);

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
      newErrors.fullName = "Please enter your full name.";
    }

    const cleanPhone = phone.replace(/[\s-]/g, "");
    const bdPhoneRegex = /^01[3-9]\d{8}$/;
    if (!bdPhoneRegex.test(cleanPhone)) {
      newErrors.phone = "Enter a valid 11-digit Bangladeshi mobile number (e.g. 01712345678).";
    }

    if (!email.trim() || !email.includes("@")) {
      newErrors.email = "Please enter a valid email address.";
    }
    if (!cityArea.trim()) {
      newErrors.cityArea = "Please enter your area or thana (e.g. Dhanmondi, Banani, Agrabad).";
    }
    if (!fullAddress.trim() || fullAddress.trim().length < 6) {
      newErrors.fullAddress = "Please provide detailed house, road, and apartment address.";
    }

    if (paymentMethod !== "CASH_ON_DELIVERY") {
      if (!mfsSenderNumber.trim()) {
        newErrors.mfsSender = `Please enter your ${paymentMethod === "BKASH" ? "bKash" : "Nagad"} wallet number.`;
      }
      if (!mfsTrxId.trim() || mfsTrxId.trim().length < 6) {
        newErrors.mfsTrxId = "Please enter the Transaction ID (TrxID) received via SMS.";
      }
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
    const cleanPhone = phone.replace(/[\s-]/g, "");

    const combinedNotes = [
      deliveryNotes.trim(),
      kidSurprise ? `[SURPRISE: For ${childNameAge || "Child"}, Birthday: ${childBirthday || "Soon"}]` : "",
      cardMessage.trim() ? `[CARD NOTE: "${cardMessage.trim()}"]` : "",
      selectedWrapStyle ? `[WRAP: ${selectedWrapStyle}]` : "",
    ]
      .filter(Boolean)
      .join(" | ");

    try {
      const res = await placeOrder({
        fullName: fullName.trim(),
        phone: cleanPhone,
        email: email.trim() || undefined,
        division,
        cityArea: cityArea.trim(),
        fullAddress: fullAddress.trim(),
        deliveryNotes: combinedNotes || undefined,
        deliveryZone,
        paymentMethod,
        senderNumber: paymentMethod !== "CASH_ON_DELIVERY" ? mfsSenderNumber.trim() : undefined,
        trxId: paymentMethod !== "CASH_ON_DELIVERY" ? mfsTrxId.trim() : undefined,
        items: items.map((i) => ({
          variantId: i.variantId,
          quantity: i.quantity,
          giftWrap: i.giftWrap,
        })),
        couponCode: coupon?.code,
        idempotencyKey: idempotencyKey.current,
        userId: user?.id,
      });

      if (res.success && res.orderId) {
        toast.success(`Order #${res.orderNumber} placed successfully!`);
        clearCart();
        const dest = `/order/${res.orderId}?success=1&token=${res.token || ""}`;
        router.push(dest);
      } else {
        toast.error(res.error || "Failed to place order. Please review your details.");
        setIsSubmitting(false);
      }
    } catch {
      toast.error("An unexpected error occurred. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full bg-[var(--surface)] min-h-screen py-6 space-y-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Sub-header Breadcrumb & Trust Ribbon */}
        <section aria-label="Breadcrumb" className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)] text-xs text-[var(--text-muted)]">
          <nav className="flex items-center gap-1.5">
            <Link href="/" className="hover:text-[var(--primary)] transition-colors">
              Home
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link href="/cart" className="hover:text-[var(--primary)] transition-colors">
              Cart ({items.length} item{items.length === 1 ? "" : "s"})
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="font-bold text-[var(--primary)]">One-Page Express Checkout</span>
          </nav>
          <div className="inline-flex items-center gap-3 bg-[var(--surface-container-low)] px-3.5 py-1 rounded-full border border-[var(--border)] text-[11px]">
            <span className="flex items-center gap-1 text-[var(--primary)] font-bold">
              <Lock className="w-3.5 h-3.5" /> 256-Bit SSL Encrypted
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1 text-[var(--secondary)] font-bold">
              <ShieldCheck className="w-3.5 h-3.5" /> ASTM Non-Toxic
            </span>
            <span>&bull;</span>
            <span className="flex items-center gap-1 text-emerald-700 dark:text-emerald-400 font-bold">
              <Truck className="w-3.5 h-3.5" /> Free Magic Delivery &gt; ৳1500
            </span>
          </div>
        </section>

        {/* 3-Step Progress Stepper */}
        <section aria-label="Checkout Steps" className="bg-[var(--surface-container-low)] p-4 sm:p-6 rounded-3xl border border-[var(--border)] shadow-xs">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Step 1 */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--primary)] text-[var(--on-primary)] font-black text-sm flex items-center justify-center shadow-md shrink-0">
                <Check className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--primary)] block">
                  Step 01 &bull; Active
                </span>
                <span className="font-heading font-black text-sm text-[var(--text-primary)]">
                  Recipient &amp; Address
                </span>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--secondary-container)] text-[var(--on-secondary-container)] font-black text-sm flex items-center justify-center shadow-md shrink-0">
                2
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--secondary)] block">
                  Step 02
                </span>
                <span className="font-heading font-black text-sm text-[var(--text-primary)]">
                  Magic Delivery &amp; Wrap
                </span>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[var(--surface-container-high)] text-[var(--text-muted)] font-black text-sm flex items-center justify-center shrink-0">
                3
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider text-[var(--text-muted)] block">
                  Step 03
                </span>
                <span className="font-heading font-black text-sm text-[var(--text-muted)]">
                  Instant Secure Payment
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Main 12-Column Checkout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: The 3 Express Checkout Steps (Cols 1-7) */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handlePlaceOrder} className="space-y-6">
              {/* STEP 1: Contact & Delivery Address */}
              <div className="p-6 sm:p-8 rounded-4xl bg-[var(--surface-container-low)] border border-[var(--border)] shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-black text-xs flex items-center justify-center">
                      1
                    </span>
                    <div>
                      <h2 className="font-heading font-black text-lg sm:text-xl text-[var(--text-primary)]">
                        Contact &amp; Delivery Address
                      </h2>
                      <p className="text-xs text-[var(--text-muted)]">Where should our toy elves send the excitement?</p>
                    </div>
                  </div>
                  <Truck className="w-6 h-6 text-[var(--primary)]" />
                </div>

                {/* Wonder Club Fast-Fill Banner */}
                {!user ? (
                  <div className="bg-[var(--surface)] p-3.5 rounded-2xl border border-[var(--border)] flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-[var(--secondary)] shrink-0" />
                      <p className="text-xs text-[var(--text-primary)]">
                        Already in <strong className="text-[var(--primary)]">Wonder Club</strong>? Sign in for instant 1-click address fill.
                      </p>
                    </div>
                    <Link
                      href="/login?callbackUrl=/checkout"
                      className="px-3.5 py-1.5 rounded-full bg-[var(--surface-container-high)] text-[var(--primary)] font-bold text-xs hover:bg-[var(--primary)] hover:text-[var(--on-primary)] transition-all shrink-0"
                    >
                      Sign In
                    </Link>
                  </div>
                ) : (
                  <div className="bg-emerald-50 dark:bg-emerald-950/30 p-3 rounded-2xl border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600" />
                    <span>Signed in as <strong>{user.name || user.email}</strong> &bull; Wonder Club Rewards Active</span>
                  </div>
                )}

                {/* Input Fields Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Full Name */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1">
                      Parent / Customer Full Name <span className="text-[var(--primary)]">*</span>
                    </label>
                    <div className="relative">
                      <User className="w-4 h-4 absolute left-3.5 top-3 text-[var(--text-muted)]" />
                      <input
                        type="text"
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="e.g. Mariam Khan"
                        required
                        className={`w-full h-11 pl-10 pr-4 rounded-full bg-[var(--surface)] text-xs font-medium text-[var(--text-primary)] border focus:outline-none focus:ring-2 focus:ring-[var(--primary)] ${
                          errors.fullName ? "border-[var(--danger)]" : "border-[var(--border)]"
                        }`}
                      />
                    </div>
                    {errors.fullName && <p className="text-[11px] text-[var(--danger)] font-bold">{errors.fullName}</p>}
                  </div>

                  {/* Phone Number */}
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-[var(--text-primary)]">
                      <span>Mobile Phone <span className="text-[var(--primary)]">*</span></span>
                      <span className="text-[10px] text-[var(--secondary)]">SMS parcel updates</span>
                    </div>
                    <div className="relative flex items-center">
                      <span className="absolute left-3.5 text-xs font-bold text-[var(--text-primary)] select-none">
                        🇧🇩 +880
                      </span>
                      <input
                        type="tel"
                        value={phone.startsWith("+880") ? phone.replace("+880", "").trim() : phone}
                        onChange={(e) => setPhone(e.target.value.replace(/[^\d]/g, ""))}
                        placeholder="1712345678"
                        required
                        className={`w-full h-11 pl-20 pr-4 rounded-full bg-[var(--surface)] text-xs font-medium text-[var(--text-primary)] border focus:outline-none focus:ring-2 focus:ring-[var(--primary)] ${
                          errors.phone ? "border-[var(--danger)]" : "border-[var(--border)]"
                        }`}
                      />
                    </div>
                    {errors.phone && <p className="text-[11px] text-[var(--danger)] font-bold">{errors.phone}</p>}
                  </div>

                  {/* Email */}
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-[var(--text-primary)] flex items-center gap-1">
                      Email Address (for Order PDF &amp; Courier Tracking) <span className="text-[var(--primary)]">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 absolute left-3.5 top-3 text-[var(--text-muted)]" />
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="you@example.com"
                        required
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
                      Division &amp; Region <span className="text-[var(--primary)]">*</span>
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
                          {d} Division {d === "Dhaka" ? "(Metro Inside)" : "(Nationwide)"}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Thana / Area */}
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-[var(--text-primary)]">
                      Specific Area / Thana <span className="text-[var(--primary)]">*</span>
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 absolute left-3.5 top-3 text-[var(--text-muted)]" />
                      <input
                        type="text"
                        value={cityArea}
                        onChange={(e) => setCityArea(e.target.value)}
                        placeholder="e.g. Dhanmondi, Uttara, Agrabad"
                        required
                        className={`w-full h-11 pl-10 pr-4 rounded-full bg-[var(--surface)] text-xs font-medium text-[var(--text-primary)] border focus:outline-none focus:ring-2 focus:ring-[var(--primary)] ${
                          errors.cityArea ? "border-[var(--danger)]" : "border-[var(--border)]"
                        }`}
                      />
                    </div>
                    {errors.cityArea && <p className="text-[11px] text-[var(--danger)] font-bold">{errors.cityArea}</p>}
                  </div>

                  {/* Detailed Street Address */}
                  <div className="md:col-span-2 space-y-1">
                    <label className="text-xs font-bold text-[var(--text-primary)]">
                      Street Address, House &amp; Flat Details <span className="text-[var(--primary)]">*</span>
                    </label>
                    <input
                      type="text"
                      value={fullAddress}
                      onChange={(e) => setFullAddress(e.target.value)}
                      placeholder="e.g. House 42, Road 7/A, Apt 4B, Dhanmondi R/A"
                      required
                      className={`w-full h-11 px-4 rounded-full bg-[var(--surface)] text-xs font-medium text-[var(--text-primary)] border focus:outline-none focus:ring-2 focus:ring-[var(--primary)] ${
                        errors.fullAddress ? "border-[var(--danger)]" : "border-[var(--border)]"
                      }`}
                    />
                    {errors.fullAddress && (
                      <p className="text-[11px] text-[var(--danger)] font-bold">{errors.fullAddress}</p>
                    )}
                  </div>

                  {/* Courier Instructions */}
                  <div className="md:col-span-2 space-y-1">
                    <div className="flex items-center justify-between text-xs font-bold text-[var(--text-primary)]">
                      <span>Delivery Landmark / Rider Notes (Optional)</span>
                      <span className="text-[10px] text-[var(--text-muted)]">Rider guidance</span>
                    </div>
                    <input
                      type="text"
                      value={deliveryNotes}
                      onChange={(e) => setDeliveryNotes(e.target.value)}
                      placeholder="Near Dhanmondi Lake Park bridge. If absent, ring bell 4B."
                      className="w-full h-11 px-4 rounded-full bg-[var(--surface)] text-xs font-medium text-[var(--text-primary)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                    />
                  </div>

                  {/* Child Birthday Recipient Surprise Toggle Box */}
                  <div className="md:col-span-2 bg-[var(--surface)] p-4 rounded-3xl border border-[var(--border)] space-y-3">
                    <label className="flex items-center gap-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={kidSurprise}
                        onChange={(e) => setKidSurprise(e.target.checked)}
                        className="w-5 h-5 rounded-md text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer"
                      />
                      <div className="flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-[var(--primary)]" />
                        <span className="font-bold text-xs sm:text-sm text-[var(--text-primary)]">
                          🎁 This magical parcel is a Birthday Surprise for a child!
                        </span>
                      </div>
                    </label>

                    {kidSurprise && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-[var(--border)] animate-in fade-in duration-200">
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-[var(--secondary)]">
                            Little Explorer&apos;s Name &amp; Age
                          </label>
                          <input
                            type="text"
                            value={childNameAge}
                            onChange={(e) => setChildNameAge(e.target.value)}
                            placeholder="e.g. Leo (Turning 4 years old)"
                            className="w-full h-9 px-3 rounded-full bg-[var(--surface-container-low)] text-xs font-medium text-[var(--text-primary)] border border-[var(--border)] focus:outline-none"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[11px] font-bold text-[var(--secondary)]">
                            Celebration Date
                          </label>
                          <input
                            type="date"
                            value={childBirthday}
                            onChange={(e) => setChildBirthday(e.target.value)}
                            className="w-full h-9 px-3 rounded-full bg-[var(--surface-container-low)] text-xs font-medium text-[var(--text-primary)] border border-[var(--border)] focus:outline-none"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* STEP 2: Delivery Method & Magical Gift Wrapping */}
              <div className="p-6 sm:p-8 rounded-4xl bg-[var(--surface-container-low)] border border-[var(--border)] shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-[var(--secondary-container)]/20 text-[var(--secondary)] font-black text-xs flex items-center justify-center">
                      2
                    </span>
                    <div>
                      <h2 className="font-heading font-black text-lg sm:text-xl text-[var(--text-primary)]">
                        Delivery Method &amp; Gift Magic
                      </h2>
                      <p className="text-xs text-[var(--text-muted)]">Select transport speed and unboxing delights.</p>
                    </div>
                  </div>
                  <Sparkles className="w-6 h-6 text-[var(--secondary)]" />
                </div>

                {/* Delivery Speed Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Express Inside Dhaka */}
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
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                          deliveryZone === "inside_dhaka" ? "bg-[var(--primary)] text-white" : "bg-[var(--border)]"
                        }`}>
                          {deliveryZone === "inside_dhaka" && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <span className="font-black text-xs text-[var(--text-primary)]">🚀 Magic Express</span>
                      </div>
                      <span className="text-xs font-black text-[var(--primary)]">
                        {subtotal >= 1500 ? "FREE" : "৳60"}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      Same-day / next-day delivery across Dhaka Metro with live rider dispatch.
                    </p>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-[var(--primary)] pt-1">
                      <Timer className="w-3.5 h-3.5" />
                      <span>Today by 6:30 PM (Dhaka Metro)</span>
                    </div>
                  </label>

                  {/* Standard Nationwide */}
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
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                          deliveryZone === "outside_dhaka" ? "bg-[var(--primary)] text-white" : "bg-[var(--border)]"
                        }`}>
                          {deliveryZone === "outside_dhaka" && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <span className="font-black text-xs text-[var(--text-primary)]">📦 Standard Joy Parcel</span>
                      </div>
                      <span className="text-xs font-black text-[var(--text-primary)]">
                        {subtotal >= 1500 ? "FREE" : "৳120"}
                      </span>
                    </div>
                    <p className="text-[11px] text-[var(--text-muted)]">
                      Reliable doorstep courier across all 64 districts in Bangladesh.
                    </p>
                    <div className="flex items-center gap-1 text-[11px] font-bold text-[var(--text-muted)] pt-1">
                      <Timer className="w-3.5 h-3.5" />
                      <span>2–3 Business Days (RedX / Steadfast)</span>
                    </div>
                  </label>
                </div>

                {/* Artisan Gift Wrapping Styles */}
                <div className="p-4 rounded-3xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Gift className="w-5 h-5 text-[var(--primary)]" />
                      <div>
                        <h3 className="font-heading font-black text-xs sm:text-sm text-[var(--text-primary)]">
                          Artisan Gift Wrapping Style
                        </h3>
                        <p className="text-[10px] text-[var(--text-muted)]">Packed with festive ribbon &amp; biodegradable confetti.</p>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-black text-[10px] uppercase">
                      Included (+৳50)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1">
                    {GIFT_WRAP_STYLES.map((wrap) => (
                      <button
                        key={wrap.id}
                        type="button"
                        onClick={() => setSelectedWrapStyle(wrap.id)}
                        className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                          selectedWrapStyle === wrap.id
                            ? "bg-[var(--surface-container-low)] border-[var(--primary)] shadow-xs"
                            : "bg-[var(--surface)] border-[var(--border)] opacity-75 hover:opacity-100"
                        }`}
                      >
                        <span className="font-black text-xs text-[var(--text-primary)] block leading-tight">
                          {wrap.name}
                        </span>
                        <span className="text-[10px] text-[var(--primary)] font-bold block mt-0.5">
                          {wrap.tag}
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Handwritten Note Area */}
                  <div className="space-y-1 pt-2 border-t border-[var(--border)]">
                    <div className="flex items-center justify-between text-xs font-bold text-[var(--text-primary)]">
                      <span>Handwritten Card Message (Elves Calligraphy)</span>
                      <span className="text-[10px] text-[var(--secondary)]">Max 150 chars</span>
                    </div>
                    <textarea
                      value={cardMessage}
                      onChange={(e) => setCardMessage(e.target.value)}
                      maxLength={150}
                      rows={2}
                      placeholder="e.g. Happy 4th Birthday to our little star! Keep shining bright! Love, Auntie Mariam 🚀✨"
                      className="w-full p-3 rounded-2xl bg-[var(--surface-container-low)] text-xs text-[var(--text-primary)] border border-[var(--border)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] resize-none"
                    />
                  </div>
                </div>
              </div>

              {/* STEP 3: Payment Selection */}
              <div className="p-6 sm:p-8 rounded-4xl bg-[var(--surface-container-low)] border border-[var(--border)] shadow-xs space-y-5">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] font-black text-xs flex items-center justify-center">
                      3
                    </span>
                    <div>
                      <h2 className="font-heading font-black text-lg sm:text-xl text-[var(--text-primary)]">
                        Secure Payment Method
                      </h2>
                      <p className="text-xs text-[var(--text-muted)]">Bank-grade SSLCommerz protected gateway &bull; Zero hidden fees.</p>
                    </div>
                  </div>
                  <ShieldCheck className="w-6 h-6 text-[var(--accent)]" />
                </div>

                <div className="space-y-3">
                  {/* COD Option */}
                  <label
                    onClick={() => setPaymentMethod("CASH_ON_DELIVERY")}
                    className={`p-4 rounded-3xl border-2 transition-all cursor-pointer flex items-center justify-between ${
                      paymentMethod === "CASH_ON_DELIVERY"
                        ? "bg-[var(--surface)] border-[var(--primary)] shadow-xs"
                        : "bg-[var(--surface)]/70 border-[var(--border)]"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                        paymentMethod === "CASH_ON_DELIVERY" ? "bg-[var(--primary)] text-white" : "bg-[var(--border)]"
                      }`}>
                        {paymentMethod === "CASH_ON_DELIVERY" && <Check className="w-3.5 h-3.5" />}
                      </div>
                      <div>
                        <span className="font-black text-xs sm:text-sm text-[var(--text-primary)] block">
                          Cash on Delivery (Doorstep COD)
                        </span>
                        <span className="text-[11px] text-[var(--text-muted)]">
                          Inspect your parcel at doorstep before handing cash to the delivery rider.
                        </span>
                      </div>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 font-bold text-[11px] shrink-0">
                      Zero Advance
                    </span>
                  </label>

                  {/* bKash MFS Option */}
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
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                          paymentMethod === "BKASH" ? "bg-[var(--primary)] text-white" : "bg-[var(--border)]"
                        }`}>
                          {paymentMethod === "BKASH" && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <span className="font-black text-xs sm:text-sm text-[var(--text-primary)] block">
                            bKash Online Payment
                          </span>
                          <span className="text-[11px] text-[var(--primary)] font-bold">
                            ⚡ Instant Verification &bull; 5% Cashback up to ৳100
                          </span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-md bg-[#e2136e] text-white font-black text-xs tracking-tight">
                        bKash
                      </span>
                    </div>

                    {paymentMethod === "BKASH" && (
                      <div className="p-3.5 rounded-2xl bg-[var(--surface-container-low)] border border-[var(--border)] space-y-3">
                        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                          Send payment to our merchant wallet: <strong>01700-000000</strong>. Enter your sender number and Transaction ID (TrxID) below:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="tel"
                            placeholder="Your bKash Number"
                            value={mfsSenderNumber}
                            onChange={(e) => setMfsSenderNumber(e.target.value)}
                            className="h-9 px-3 rounded-full bg-[var(--surface)] text-xs border border-[var(--border)] focus:outline-none"
                          />
                          <input
                            type="text"
                            placeholder="bKash TrxID (e.g. 9J4K2L1M)"
                            value={mfsTrxId}
                            onChange={(e) => setMfsTrxId(e.target.value)}
                            className="h-9 px-3 rounded-full bg-[var(--surface)] text-xs border border-[var(--border)] focus:outline-none uppercase"
                          />
                        </div>
                      </div>
                    )}
                  </label>

                  {/* Nagad MFS Option */}
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
                        <div className={`w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold ${
                          paymentMethod === "NAGAD" ? "bg-[var(--primary)] text-white" : "bg-[var(--border)]"
                        }`}>
                          {paymentMethod === "NAGAD" && <Check className="w-3.5 h-3.5" />}
                        </div>
                        <div>
                          <span className="font-black text-xs sm:text-sm text-[var(--text-primary)] block">
                            Nagad Digital Payment
                          </span>
                          <span className="text-[11px] text-[var(--secondary)] font-bold">
                            Post Office Guaranteed &bull; Fast SMS confirmation
                          </span>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 rounded-md bg-[#f7941d] text-white font-black text-xs tracking-tight">
                        Nagad
                      </span>
                    </div>

                    {paymentMethod === "NAGAD" && (
                      <div className="p-3.5 rounded-2xl bg-[var(--surface-container-low)] border border-[var(--border)] space-y-3">
                        <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
                          Send payment to our merchant wallet: <strong>01700-000000</strong>. Enter your sender number and Transaction ID (TrxID) below:
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <input
                            type="tel"
                            placeholder="Your Nagad Number"
                            value={mfsSenderNumber}
                            onChange={(e) => setMfsSenderNumber(e.target.value)}
                            className="h-9 px-3 rounded-full bg-[var(--surface)] text-xs border border-[var(--border)] focus:outline-none"
                          />
                          <input
                            type="text"
                            placeholder="Nagad TrxID (e.g. 7K8M9P0Q)"
                            value={mfsTrxId}
                            onChange={(e) => setMfsTrxId(e.target.value)}
                            className="h-9 px-3 rounded-full bg-[var(--surface)] text-xs border border-[var(--border)] focus:outline-none uppercase"
                          />
                        </div>
                      </div>
                    )}
                  </label>

                  {/* PlayPoints Loyalty Redemption Toggle Bar */}
                  <div className="p-4 rounded-3xl bg-[var(--secondary-container)]/15 border border-[var(--secondary-container)]/40 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-[var(--secondary-container)] text-[var(--on-secondary-container)] flex items-center justify-center font-black">
                        <Stars className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-[var(--text-primary)]">PlayPoints Loyalty Balance</span>
                          <span className="px-2 py-0.5 rounded-full bg-[var(--secondary-container)] text-[var(--on-secondary-container)] text-[10px] font-black">
                            1,450 Pts
                          </span>
                        </div>
                        <span className="text-[11px] text-[var(--text-muted)]">
                          Redeem points for instant ৳145 discount on this order.
                        </span>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer shrink-0">
                      <input
                        type="checkbox"
                        checked={playPointsRedeemed}
                        onChange={(e) => setPlayPointsRedeemed(e.target.checked)}
                        className="w-5 h-5 rounded text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer"
                      />
                    </label>
                  </div>
                </div>
              </div>

              {/* Submit CTA (Desktop & Mobile) */}
              <Button
                type="submit"
                disabled={isSubmitting || items.length === 0}
                variant="pill-primary"
                size="lg"
                className="w-full h-14 font-black text-base shadow-[0_4px_0_#93000E] active:translate-y-[2px] active:shadow-[0_2px_0_#93000E] flex items-center justify-center gap-2"
              >
                <span>{isSubmitting ? "Placing Order..." : "Complete Order & Spark Joy ✨"}</span>
                <ArrowRight className="w-4 h-4" />
              </Button>
            </form>
          </div>

          {/* RIGHT COLUMN: Sticky Order Summary (Cols 8-12) */}
          <aside className="lg:col-span-5 space-y-5 sticky top-24">
            <div className="p-6 sm:p-8 rounded-4xl bg-[var(--surface-container-low)] border border-[var(--border)] shadow-md space-y-5">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <h3 className="font-heading font-black text-lg text-[var(--text-primary)]">Order Summary</h3>
                  <span className="w-6 h-6 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] font-black text-xs flex items-center justify-center">
                    {items.length}
                  </span>
                </div>
                <Link href="/cart" className="text-xs font-bold text-[var(--primary)] hover:underline">
                  Edit Basket
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

              {/* Voucher Input */}
              <form onSubmit={handleCouponSubmit} className="pt-2 border-t border-[var(--border)] space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                  Coupon / Wonder Club Code
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={couponCodeInput}
                    onChange={(e) => setCouponCodeInput(e.target.value)}
                    placeholder="e.g. JOY10"
                    className="flex-1 h-10 px-4 rounded-full bg-[var(--surface)] text-xs font-bold text-[var(--text-primary)] border border-[var(--border)] focus:outline-none uppercase"
                  />
                  <Button
                    type="submit"
                    disabled={isApplyingCoupon || !couponCodeInput.trim()}
                    variant="pill-amber"
                    size="sm"
                    className="h-10 px-4 text-xs font-black shadow-xs"
                  >
                    Apply
                  </Button>
                </div>
                {coupon && (
                  <div className="flex items-center justify-between text-xs text-emerald-700 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950/30 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Code &quot;{coupon.code}&quot; applied (-{formatPrice(coupon.discountAmount)})
                    </span>
                    <button type="button" onClick={removeCoupon} className="text-[var(--danger)] hover:underline text-[10px]">
                      Remove
                    </button>
                  </div>
                )}
              </form>

              {/* Ledger */}
              <div className="space-y-2 pt-2 border-t border-[var(--border)] text-xs text-[var(--text-muted)]">
                <div className="flex justify-between">
                  <span>Subtotal ({items.length} items)</span>
                  <span className="font-bold text-[var(--text-primary)]">{formatPrice(subtotal)}</span>
                </div>

                {couponDiscount > 0 && (
                  <div className="flex justify-between text-[var(--primary)] font-bold">
                    <span>Coupon Discount</span>
                    <span>-{formatPrice(couponDiscount)}</span>
                  </div>
                )}

                {playPointsRedeemed && (
                  <div className="flex justify-between text-[var(--secondary)] font-bold">
                    <span>PlayPoints (1,450 Pts)</span>
                    <span>-৳145</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>Delivery ({deliveryZone === "inside_dhaka" ? "Dhaka Metro" : "Nationwide"})</span>
                  <span className="font-bold text-[var(--text-primary)]">
                    {shippingFee === 0 ? <strong className="text-emerald-600">FREE</strong> : formatPrice(shippingFee)}
                  </span>
                </div>

                {giftWrapFee > 0 && (
                  <div className="flex justify-between">
                    <span>Artisan Gift Wrapping</span>
                    <span className="font-bold text-[var(--text-primary)]">{formatPrice(giftWrapFee)}</span>
                  </div>
                )}

                <div className="pt-3 border-t border-[var(--border)] flex justify-between items-baseline">
                  <div>
                    <span className="font-heading font-black text-base text-[var(--text-primary)] block">Total Payable</span>
                    <span className="text-[10px] text-[var(--text-muted)]">Inclusive of all local VAT &amp; taxes</span>
                  </div>
                  <div className="text-right">
                    <span className="font-heading font-black text-3xl sm:text-4xl text-[var(--primary)] block leading-none">
                      {formatPrice(total)}
                    </span>
                    {discount > 0 && (
                      <span className="text-[11px] font-bold text-[var(--secondary)] mt-1 block">
                        You save {formatPrice(discount)} today! 🎉
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Guarantees */}
              <div className="p-4 rounded-3xl bg-[var(--surface)] border border-[var(--border)] space-y-2 text-xs">
                <div className="flex items-center gap-2 text-[var(--text-primary)] font-bold">
                  <ShieldCheck className="w-4 h-4 text-[var(--primary)]" />
                  <span>100% Non-Toxic &amp; Safety Certified</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--text-primary)] font-bold">
                  <RotateCcw className="w-4 h-4 text-[var(--secondary)]" />
                  <span>30-Day Zero-Tears Return Policy</span>
                </div>
                <div className="flex items-center gap-2 text-[var(--text-primary)] font-bold">
                  <Headphones className="w-4 h-4 text-[var(--accent)]" />
                  <span>Live Parent Care: +880 9612-KHELNA</span>
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
