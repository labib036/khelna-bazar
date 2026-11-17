import { describe, it, expect } from "vitest";
import { translations, interpolate, TranslationKey } from "@/lib/i18n";

describe("KHELNA BAZAR - Internationalization (EN / বাংলা)", () => {
  const enKeys = Object.keys(translations.en) as TranslationKey[];
  const bnKeys = Object.keys(translations.bn) as TranslationKey[];

  it("has exact 1-to-1 key parity between English and Bengali dictionaries", () => {
    expect(bnKeys.sort()).toEqual(enKeys.sort());
  });

  it("has non-empty values for all keys in both locales", () => {
    for (const key of enKeys) {
      expect(translations.en[key].trim().length).toBeGreaterThan(0);
      expect(translations.bn[key].trim().length).toBeGreaterThan(0);
    }
  });

  it("has matching interpolation variables in both locales", () => {
    const varRegex = /\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g;
    for (const key of enKeys) {
      const enVars = [...translations.en[key].matchAll(varRegex)].map((m) => m[1]).sort();
      const bnVars = [...translations.bn[key].matchAll(varRegex)].map((m) => m[1]).sort();
      expect(bnVars, `Variable mismatch in key: ${key}`).toEqual(enVars);
    }
  });

  it("contains canonical localized storefront phrases", () => {
    expect(translations.en["product.addToCart"]).toBe("Add to Cart");
    expect(translations.bn["product.addToCart"]).toBe("কার্টে যোগ করুন");

    expect(translations.en["product.outOfStock"]).toBe("Out of Stock");
    expect(translations.bn["product.outOfStock"]).toBe("স্টক শেষ");

    expect(translations.en["nav.trackOrder"]).toBe("Track Order");
    expect(translations.bn["nav.trackOrder"]).toBe("অর্ডার ট্র্যাক করুন");

    expect(translations.en["checkout.inspection.title"]).toBe("Inspect Before You Accept");
    expect(translations.bn["checkout.inspection.title"]).toBe("গ্রহণের আগে পণ্য পরীক্ষা করুন");
  });

  it("correctly interpolates dynamic template variables", () => {
    const template = translations.en["toast.order.placed"];
    const result = interpolate(template, { orderNumber: "KB-2611-100244" });
    expect(result).toBe("Order KB-2611-100244 has been placed");

    const bnTemplate = translations.bn["toast.order.placed"];
    const bnResult = interpolate(bnTemplate, { orderNumber: "KB-2611-100244" });
    expect(bnResult).toBe("KB-2611-100244 নম্বরের অর্ডার জমা হয়েছে");
  });
});
