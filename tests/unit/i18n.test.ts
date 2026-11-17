import { describe, it, expect } from "vitest";
import { translations, Locale, TranslationKey } from "@/lib/i18n";

describe("KHELNA BAZAR - Internationalization (EN / বাংলা)", () => {
  const enKeys = Object.keys(translations.en) as TranslationKey[];
  const bnKeys = Object.keys(translations.bn) as TranslationKey[];

  it("has exact 1-to-1 key parity between English and Bengali dictionaries", () => {
    expect(bnKeys.sort()).toEqual(enKeys.sort());
  });

  it("contains essential localized storefront phrases", () => {
    expect(translations.en.addToBag).toBe("Add to Bag");
    expect(translations.bn.addToBag).toBe("ব্যাগে যোগ করুন");

    expect(translations.en.outOfStock).toBe("Out of Stock");
    expect(translations.bn.outOfStock).toBe("স্টক শেষ");

    expect(translations.en.trackOrder).toBe("Track Order");
    expect(translations.bn.trackOrder).toBe("অর্ডার ট্র্যাক");
  });

  it("contains Bengali numbers/currency symbols for shipping notes", () => {
    expect(translations.bn.freeShippingBadge).toContain("১,৫০০৳");
    expect(translations.bn.insideDhaka).toContain("৬০৳");
    expect(translations.bn.outsideDhaka).toContain("১২০৳");
  });
});
