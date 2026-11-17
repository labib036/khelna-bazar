import { describe, it, expect } from "vitest";

describe("Coupon Discount Calculations", () => {
  function computeDiscount(
    type: "PERCENTAGE" | "FIXED" | "FREE_SHIPPING",
    value: number,
    subtotal: number,
    shippingFee = 60,
    maxDiscount?: number | null
  ): number {
    let discount = 0;
    if (type === "PERCENTAGE") {
      discount = Math.round((subtotal * value) / 100);
      if (maxDiscount && discount > maxDiscount) {
        discount = maxDiscount;
      }
    } else if (type === "FIXED") {
      discount = Math.min(value, subtotal);
    } else if (type === "FREE_SHIPPING") {
      discount = shippingFee;
    }
    return discount;
  }

  it("calculates percentage discount accurately", () => {
    // 10% on ৳2,000 subtotal = ৳200
    expect(computeDiscount("PERCENTAGE", 10, 2000)).toBe(200);

    // 15% on ৳1,450 subtotal = ৳218 (rounded)
    expect(computeDiscount("PERCENTAGE", 15, 1450)).toBe(218);
  });

  it("respects max discount cap for percentage coupons", () => {
    // 50% on ৳10,000 with max discount ৳500 -> ৳500 (capped)
    expect(computeDiscount("PERCENTAGE", 50, 10000, 60, 500)).toBe(500);
  });

  it("calculates fixed discount without exceeding subtotal", () => {
    // ৳300 fixed off ৳1,500 = ৳300
    expect(computeDiscount("FIXED", 300, 1500)).toBe(300);

    // ৳500 fixed off ৳400 subtotal = ৳400 (cannot exceed subtotal)
    expect(computeDiscount("FIXED", 500, 400)).toBe(400);
  });

  it("calculates free shipping discount matching current shipping fee", () => {
    expect(computeDiscount("FREE_SHIPPING", 0, 1000, 60)).toBe(60);
    expect(computeDiscount("FREE_SHIPPING", 0, 1000, 120)).toBe(120);
  });
});
