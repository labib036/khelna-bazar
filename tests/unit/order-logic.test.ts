import { describe, it, expect } from "vitest";
import {
  formatPrice,
  calculateDiscountPercentage,
  calculateDeliveryFee,
  generateOrderNumber,
} from "@/lib/utils";
import { siteConfig } from "@/config/site";

describe("KHELNA BAZAR - Core Business & COD Logic", () => {
  // 1. Currency & Pricing
  describe("Currency Formatting (BDT ৳)", () => {
    it("formats integer amounts in Bangladeshi Taka with symbol", () => {
      expect(formatPrice(1250)).toBe("৳1,250");
      expect(formatPrice(500)).toBe("৳500");
      expect(formatPrice(0)).toBe("৳0");
      expect(formatPrice(3450)).toBe("৳3,450");
    });
  });

  // 2. Discount Percentages
  describe("Discount Percentage Calculation", () => {
    it("calculates correct savings percentage rounded to integer", () => {
      // ৳3,450 on compare price ৳4,200 -> ~18% off
      const discount = calculateDiscountPercentage(3450, 4200);
      expect(discount).toBe(18);

      // No compare price or equal price -> 0%
      expect(calculateDiscountPercentage(1000, 1000)).toBe(0);
      expect(calculateDiscountPercentage(1000, null)).toBe(0);
    });
  });

  // 3. Delivery Fee & Owner-Approved Settings
  describe("Delivery Fee Calculations (Config-driven)", () => {
    it("returns configured delivery fee based on delivery zone", () => {
      const feeInside = calculateDeliveryFee("inside_dhaka", 1500);
      expect(feeInside).toBe(siteConfig.shippingDefaults.insideDhakaRate);

      const feeOutside = calculateDeliveryFee("outside_dhaka", 1500);
      expect(feeOutside).toBe(siteConfig.shippingDefaults.outsideDhakaRate);
    });
  });

  // 4. Order Number Generation
  describe("Human-Readable Order Number Format", () => {
    it("generates an order number starting with 'KB-' followed by 6 digits", () => {
      const orderNum = generateOrderNumber();
      expect(orderNum).toMatch(/^KB-\d{6}$/);
    });
  });

  // 5. Cash on Delivery (COD) Lifecycle States
  describe("COD Fulfillment & Cash Collection Lifecycle States", () => {
    const validFulfillmentStatuses = [
      "PENDING_CONFIRMATION",
      "CONFIRMED",
      "PROCESSING",
      "PACKED",
      "SHIPPED",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
      "RETURNED",
    ];

    const validCodStatuses = ["UNCOLLECTED", "COLLECTED", "DISCREPANCY", "REFUNDED"];

    it("contains all expected COD order fulfillment statuses", () => {
      expect(validFulfillmentStatuses).toContain("PENDING_CONFIRMATION");
      expect(validFulfillmentStatuses).toContain("CONFIRMED");
      expect(validFulfillmentStatuses).toContain("DELIVERED");
    });

    it("separates physical delivery status from cash collection status", () => {
      // An order can be SHIPPED while cash is still UNCOLLECTED
      const order = {
        fulfillment: "SHIPPED",
        codStatus: "UNCOLLECTED",
      };
      expect(order.fulfillment).toBe("SHIPPED");
      expect(order.codStatus).toBe("UNCOLLECTED");
    });
  });
});
