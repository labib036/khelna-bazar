import { describe, it, expect } from "vitest";
import { normalizeIdentifier, isValidBDPhone, isValidEmail } from "@/lib/auth-utils";

describe("auth-utils", () => {
  describe("normalizeIdentifier", () => {
    it("normalizes Bangladeshi phone formats to 11 digits (01XXXXXXXXX)", () => {
      expect(normalizeIdentifier("+8801712345678")).toBe("01712345678");
      expect(normalizeIdentifier("8801812345678")).toBe("01812345678");
      expect(normalizeIdentifier("01912345678")).toBe("01912345678");
      expect(normalizeIdentifier(" 01612-345 678 ")).toBe("01612345678");
    });

    it("trims and lowercases email addresses", () => {
      expect(normalizeIdentifier(" User@Example.COM ")).toBe("user@example.com");
    });
  });

  describe("isValidBDPhone", () => {
    it("accepts valid Bangladeshi mobile operators (013, 014, 015, 016, 017, 018, 019)", () => {
      expect(isValidBDPhone("01712345678")).toBe(true);
      expect(isValidBDPhone("+8801812345678")).toBe(true);
      expect(isValidBDPhone("01300000000")).toBe(true);
      expect(isValidBDPhone("01999999999")).toBe(true);
    });

    it("rejects invalid phone numbers", () => {
      expect(isValidBDPhone("01234567890")).toBe(false); // Invalid operator 012
      expect(isValidBDPhone("12345")).toBe(false);
      expect(isValidBDPhone("0171234567")).toBe(false); // 10 digits
      expect(isValidBDPhone("017123456789")).toBe(false); // 12 digits
      expect(isValidBDPhone("not-a-number")).toBe(false);
    });
  });

  describe("isValidEmail", () => {
    it("validates standard emails", () => {
      expect(isValidEmail("shopper@gmail.com")).toBe(true);
      expect(isValidEmail("admin@khelnabazar.com.bd")).toBe(true);
    });

    it("rejects invalid emails", () => {
      expect(isValidEmail("shopper")).toBe(false);
      expect(isValidEmail("shopper@")).toBe(false);
      expect(isValidEmail("@domain.com")).toBe(false);
    });
  });
});
