"use client";

import React, { createContext, useContext, useState, useEffect } from "react";

export type Locale = "en" | "bn";

export const translations = {
  en: {
    trackOrder: "Track Order",
    safetyGuarantee: "Toy Safety Guarantee",
    searchPlaceholder: "Search toys, categories, ages (e.g. Lego, STEM, 3-4y)...",
    allCategories: "All Categories",
    deals: "Deals & Offers",
    giftFinder: "Gift Finder",
    browseByAge: "Browse by Age",
    cart: "Cart",
    wishlist: "Wishlist",
    account: "Account",
    login: "Sign In",
    register: "Register",
    logout: "Sign Out",
    adminPanel: "Admin Panel",
    freeShippingBadge: "Free delivery nationwide over ৳1,500",
    codAvailable: "Cash on Delivery Available",
    insideDhaka: "Inside Dhaka: ৳60",
    outsideDhaka: "Outside Dhaka: ৳120",
    addToBag: "Add to Bag",
    addedToBag: "Added to Bag",
    outOfStock: "Out of Stock",
    buyNow: "Buy Now",
    viewDetails: "View Details",
    subtotal: "Subtotal",
    shipping: "Shipping",
    total: "Total",
    checkout: "Proceed to Checkout",
    hotline: "Hotline Support",
  },
  bn: {
    trackOrder: "অর্ডার ট্র্যাক",
    safetyGuarantee: "খেলনা নিরাপত্তা নিশ্চয়তা",
    searchPlaceholder: "খেলনা, ক্যাটাগরি বা বয়স দিয়ে খুঁজুন (যেমন লেগো, রোবটিক্স)...",
    allCategories: "সব ক্যাটাগরি",
    deals: "অফার ও ছাড়",
    giftFinder: "উপহার নির্দেশিকা",
    browseByAge: "বয়স অনুযায়ী",
    cart: "কার্ট",
    wishlist: "উইশলিস্ট",
    account: "অ্যাকাউন্ট",
    login: "লগইন",
    register: "রেজিস্ট্রেশন",
    logout: "লগআউট",
    adminPanel: "অ্যাডমিন প্যানেল",
    freeShippingBadge: "১,৫০০৳ এর বেশি অর্ডারে সারা দেশে ফ্রি ডেলিভারি",
    codAvailable: "ক্যাশ অন ডেলিভারি সুবিধা",
    insideDhaka: "ঢাকার ভিতরে: ৬০৳",
    outsideDhaka: "ঢাকার বাইরে: ১২০৳",
    addToBag: "ব্যাগে যোগ করুন",
    addedToBag: "ব্যাগে যোগ হয়েছে",
    outOfStock: "স্টক শেষ",
    buyNow: "এখনই কিনুন",
    viewDetails: "বিস্তারিত দেখুন",
    subtotal: "উপমোট",
    shipping: "ডেলিভারি চার্জ",
    total: "সর্বমোট",
    checkout: "চেকআউটে যান",
    hotline: "হটলাইন সাপোর্ট",
  },
} as const;

export type TranslationKey = keyof typeof translations.en;

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: TranslationKey) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: "en",
  setLocale: () => {},
  toggleLocale: () => {},
  t: (key) => translations.en[key] || key,
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("kb_lang") as Locale | null;
      if (saved === "en" || saved === "bn") {
        setLocaleState(saved);
      }
    } catch {
      // Storage unavailable
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem("kb_lang", newLocale);
      document.documentElement.lang = newLocale;
    } catch {
      // Storage unavailable
    }
  };

  const toggleLocale = () => {
    setLocale(locale === "en" ? "bn" : "en");
  };

  const t = (key: TranslationKey): string => {
    return translations[locale]?.[key] || translations.en[key] || key;
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, toggleLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  return useContext(LanguageContext);
}

export function LanguageToggle({ className = "" }: { className?: string }) {
  const { locale, setLocale } = useLanguage();

  return (
    <div
      role="group"
      aria-label="Language selection"
      className={`inline-flex items-center rounded-lg border border-[var(--border)] bg-[var(--surface)] p-0.5 text-xs font-semibold shadow-xs ${className}`}
    >
      <button
        type="button"
        onClick={() => setLocale("en")}
        aria-pressed={locale === "en"}
        className={`px-2.5 py-1 rounded-md transition-all cursor-pointer font-bold ${
          locale === "en"
            ? "bg-[var(--primary)] text-white shadow-xs"
            : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        }`}
      >
        EN
      </button>
      <button
        type="button"
        onClick={() => setLocale("bn")}
        aria-pressed={locale === "bn"}
        className={`px-2.5 py-1 rounded-md transition-all cursor-pointer font-bengali font-bold ${
          locale === "bn"
            ? "bg-[var(--primary)] text-white shadow-xs"
            : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
        }`}
      >
        বাংলা
      </button>
    </div>
  );
}
