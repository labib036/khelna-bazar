"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import enTranslations from "@/locales/en.json";
import bnTranslations from "@/locales/bn.json";

export type Locale = "en" | "bn";

export const translations = {
  en: enTranslations,
  bn: bnTranslations,
} as const;

export type TranslationKey = keyof typeof enTranslations;

export function interpolate(template: string, vars?: Record<string, string | number>): string {
  if (!vars) return template;
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key) => {
    return vars[key] !== undefined ? String(vars[key]) : `{{${key}}}`;
  });
}

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  toggleLocale: () => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType>({
  locale: "en",
  setLocale: () => {},
  toggleLocale: () => {},
  t: (key, vars) => {
    const raw = (enTranslations as Record<string, string>)[key] || key;
    return interpolate(raw, vars);
  },
});

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>("en");

  useEffect(() => {
    try {
      const saved = localStorage.getItem("kb_lang") as Locale | null;
      if (saved === "en" || saved === "bn") {
        setLocaleState(saved);
        if (typeof document !== "undefined") {
          document.documentElement.lang = saved;
        }
      }
    } catch {
      // Storage unavailable
    }
  }, []);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
    try {
      localStorage.setItem("kb_lang", newLocale);
      if (typeof document !== "undefined") {
        document.documentElement.lang = newLocale;
        document.cookie = `kb_lang=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
      }
    } catch {
      // Storage unavailable
    }
  };

  const toggleLocale = () => {
    setLocale(locale === "en" ? "bn" : "en");
  };

  const t = (key: string, vars?: Record<string, string | number>): string => {
    const dict = (translations[locale] || translations.en) as Record<string, string>;
    const fallbackDict = translations.en as Record<string, string>;
    const raw = dict[key] || fallbackDict[key] || key;
    return interpolate(raw, vars);
  };

  return (
    <LanguageContext.Provider value={{ locale, setLocale, toggleLocale, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  return {
    ...ctx,
    language: ctx.locale,
  };
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
