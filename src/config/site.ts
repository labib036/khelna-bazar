export const siteConfig = {
  name: "Khelna Bazar",
  nameBn: "খেলনা বাজার",
  description: "Explore toys for play, learning and thoughtful gifting in Bangladesh. Cash on Delivery and verified mobile payments.",
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
    hotline: "01712-039707",
    whatsapp: "01712039707",
    whatsappDisplay: "01712-039707",
    email: "",
    address: "",
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
    insideDhakaRate: 0,
    outsideDhakaRate: 0,
    expressDhakaRate: 0,
    freeShippingThreshold: 0,
    giftWrapFee: 0,
    estimatedDeliveryDhaka: "",
    estimatedDeliveryNationwide: "",
  },

  // Trust Badges (Owner Confirmed Facts)
  trustBadges: [
    {
      title: "Inspect Before You Accept",
      titleBn: "গ্রহণের আগে পণ্য পরীক্ষা করুন",
      description: "Check the product in front of the delivery person before accepting it",
      descriptionBn: "পণ্য গ্রহণের আগে ডেলিভারি প্রতিনিধির সামনে পরীক্ষা করুন",
      icon: "ShieldCheck",
    },
    {
      title: "Defective Products",
      titleBn: "ত্রুটিপূর্ণ পণ্য",
      description: "Defective products can be returned or refunded when reported at delivery",
      descriptionBn: "ডেলিভারির সময় ত্রুটি জানালে ত্রুটিপূর্ণ পণ্য ফেরত বা রিফান্ডের আওতায় আসতে পারে",
      icon: "RotateCcw",
    },
    {
      title: "Cash on Delivery Available",
      titleBn: "ক্যাশ অন ডেলিভারি সুবিধা রয়েছে",
      description: "Pay the delivery person when your order arrives",
      descriptionBn: "অর্ডার পৌঁছালে ডেলিভারি প্রতিনিধিকে পেমেন্ট করুন",
      icon: "Truck",
    },
    {
      title: "Call or WhatsApp",
      titleBn: "কল বা WhatsApp করুন",
      description: "Support available at 01712-039707",
      descriptionBn: "সহায়তার জন্য 01712-039707 নম্বরে যোগাযোগ করুন",
      icon: "Phone",
    },
  ],
};

export type SiteConfig = typeof siteConfig;
