"use server";

import { validateCoupon } from "@/server/services/coupon-service";

export async function validateCouponAction(code: string, subtotal: number, shippingFee = 0) {
  try {
    const res = await validateCoupon(code, subtotal, shippingFee);
    if (!res.valid) {
      return {
        success: false,
        message: res.error || "This coupon is invalid or unavailable.",
      };
    }
    return {
      success: true,
      message: "Coupon applied successfully!",
      coupon: {
        code: res.code!,
        type: res.type!,
        value: res.value!,
        discountAmount: res.discount,
      },
    };
  } catch (error: any) {
    return {
      success: false,
      message: error.message || "Failed to validate coupon.",
    };
  }
}
