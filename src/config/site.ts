export const siteConfig = {
  name: "KHELNA BAZAR",
  description: "The most joyful, safe, and premium online toy store in Bangladesh. Fast Cash on Delivery nationwide.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  ogImage: "/images/khelna-bazar-logo.png",
  
  // LOGO CONFIGURATION POINT:
  logo: {
    path: "/images/khelna-bazar-logo.png",
    animatedGif: "/images/khelna-bazar-logo.gif",
    videoPath: "/images/khelna-bazar-logo.mp4",
    badgePath: "/images/khelna-bazar-logo.png",
    favicon: "/favicon.png",
    width: 180,
    height: 48,
    alt: "Khelna Bazar Official Logo",
    useTextFallback: false, // Set to false to show the real official logo
    useAnimatedLogo: true,  // Displays the moving/animated logo in the storefront
  },

  contact: {
    phone: "+880 1700-000000",
    email: "support@khelnabazar.com",
    address: "House 42, Road 11, Banani, Dhaka-1213, Bangladesh",
    hours: "Sat - Thu: 9:00 AM - 9:00 PM (BST)",
  },

  social: {
    facebook: "https://facebook.com/khelnabazar",
    instagram: "https://instagram.com/khelnabazar",
    youtube: "https://youtube.com/@khelnabazar",
    tiktok: "https://tiktok.com/@khelnabazar",
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

  // Trust Badges
  trustBadges: [
    {
      title: "Cash on Delivery",
      description: "Pay with cash at your doorstep across Bangladesh",
      icon: "Truck",
    },
    {
      title: "100% Non-Toxic & Safe",
      description: "Tested and certified safe toys for children",
      icon: "ShieldCheck",
    },
    {
      title: "7-Day Easy Returns",
      description: "Hassle-free replacement for defective products",
      icon: "RotateCcw",
    },
    {
      title: "Authentic & Verified",
      description: "Directly imported genuine brands and toys",
      icon: "Sparkles",
    },
  ],
};

export type SiteConfig = typeof siteConfig;
