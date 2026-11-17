export const siteConfig = {
  name: "KHELNA BAZAR",
  description: "The most joyful, safe, and premium online toy store in Bangladesh. Fast Cash on Delivery nationwide.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ogImage: "/images/khelna-bazar-logo.png",
  
  // LOGO CONFIGURATION POINT:
  logo: {
    path: "/images/khelna-bazar-logo.png",
    favicon: "/favicon.png",
    width: 180,
    height: 48,
    alt: "Khelna Bazar Official Logo",
    useTextFallback: false,
    useAnimatedLogo: false,
  },

  contact: {
    phone: "01712-039707",
    hotline: process.env.NEXT_PUBLIC_STORE_HOTLINE || "01712-039707",
    whatsapp: "01712039707",
    whatsappDisplay: "01712-039707",
    email: process.env.NEXT_PUBLIC_STORE_EMAIL || "",
    address: process.env.NEXT_PUBLIC_STORE_ADDRESS || "",
    hours: "",
  },

  social: {
    facebook: "",
    instagram: "",
    youtube: "",
    tiktok: "",
  },

  // Localization and Currency
  localization: {
    country: "Bangladesh",
    countryCode: "BD",
    currency: "BDT",
    currencySymbol: "৳",
    locale: "en-BD",
  },

  // Default Shipping / Delivery Settings (Cash On Delivery)
  shippingDefaults: {
    insideDhakaRate: 60,       // ৳60 inside Dhaka
    outsideDhakaRate: 120,     // ৳120 outside Dhaka
    expressDhakaRate: 150,     // ৳150 same/next day express Dhaka
    freeShippingThreshold: 2000, // Free delivery on orders over ৳2000
    giftWrapFee: 50,           // ৳50 optional gift wrapping per item
    estimatedDeliveryDhaka: "24-48 Hours",
    estimatedDeliveryNationwide: "2-4 Business Days",
  },

  // Loyalty Program (PlayPoints)
  loyalty: {
    pointsPerTakaSpent: 1,
    takaPerHundredPoints: 10,
    reviewPoints: 50,
    signupPoints: 100,
    birthdayPoints: 200,
  },

  // Trust Badges (Owner Confirmed)
  trustBadges: [
    {
      title: "Inspect Before You Accept",
      description: "Check your toy in front of the delivery person",
      icon: "ShieldCheck",
    },
    {
      title: "Defective? We Refund",
      description: "Full refund for defective products reported at delivery",
      icon: "RotateCcw",
    },
    {
      title: "Cash on Delivery",
      description: "Pay when you receive your order",
      icon: "Truck",
    },
    {
      title: "Order Support",
      description: "Call or WhatsApp 01712-039707",
      icon: "Phone",
    },
  ],
};

export type SiteConfig = typeof siteConfig;
