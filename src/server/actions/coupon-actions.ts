"use server";

import { db } from "@/lib/db";
import { assertPermission } from "@/lib/permissions";
import { checkRateLimit } from "@/lib/rate-limit";
import { revalidatePath } from "next/cache";
import { validateCoupon } from "@/server/services/coupon-service";
import { CouponType } from "@prisma/client";

export async function validateCouponAction(code: string, subtotal: number, shippingFee = 0) {
  try {
    const rateCheck = checkRateLimit(`coupon:${code.trim().toUpperCase()}`, { limit: 15, windowMs: 60 * 1000 });
    if (!rateCheck.success) {
      return {
        success: false,
        message: `Too many attempts. Please wait ${rateCheck.retryAfterSec} seconds before testing another coupon code.`,
      };
    }
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

export async function createCoupon(input: {
  code: string;
  type?: string;
  value: number;
  minSpend?: number;
  maxDiscount?: number;
  usageLimit?: number;
  expiresAt?: Date | string;
  endsAt?: Date | string;
}) {
  try {
    const perm = await assertPermission("coupons.manage");
    if (perm.error) {
      return { success: false, error: perm.error };
    }

    if (!input.code || input.code.trim().length === 0) {
      return { success: false, error: "Coupon code is required." };
    }

    const cleanCode = input.code.toUpperCase().trim();
    const existing = await db.coupon.findUnique({ where: { code: cleanCode } });
    if (existing) {
      return { success: false, error: `Coupon ${cleanCode} already exists.` };
    }

    let couponType: CouponType = CouponType.PERCENTAGE;
    if (input.type === "FIXED" || (input.type as string) === "FIXED_AMOUNT") {
      couponType = CouponType.FIXED;
    } else if (input.type === "FREE_SHIPPING") {
      couponType = CouponType.FREE_SHIPPING;
    }

    const expiry = input.expiresAt || input.endsAt || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    const coupon = await db.coupon.create({
      data: {
        code: cleanCode,
        type: couponType,
        value: Math.max(0, Math.floor(input.value)),
        minSpend: input.minSpend !== undefined ? Math.max(0, Math.floor(input.minSpend)) : 500,
        maxDiscount: input.maxDiscount ? Math.floor(input.maxDiscount) : null,
        usageLimit: input.usageLimit !== undefined ? Math.max(1, Math.floor(input.usageLimit)) : 1000,
        endsAt: new Date(expiry),
        active: true,
      },
    });

    revalidatePath("/admin/coupons");
    return { success: true, coupon };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to create coupon." };
  }
}

export async function toggleCouponActive(id: string) {
  try {
    const perm = await assertPermission("coupons.manage");
    if (perm.error) {
      return { success: false, error: perm.error };
    }

    const coupon = await db.coupon.findUnique({ where: { id } });
    if (!coupon) {
      return { success: false, error: "Coupon not found." };
    }

    const updated = await db.coupon.update({
      where: { id },
      data: { active: !coupon.active },
    });

    revalidatePath("/admin/coupons");
    return { success: true, coupon: updated, active: updated.active };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to toggle coupon." };
  }
}

export async function deleteCoupon(id: string) {
  try {
    const perm = await assertPermission("coupons.manage");
    if (perm.error) {
      return { success: false, error: perm.error };
    }

    await db.coupon.delete({ where: { id } });

    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to delete coupon." };
  }
}

export async function getAdminCoupons() {
  try {
    const perm = await assertPermission("coupons.manage");
    if (perm.error) {
      return { success: false, error: perm.error };
    }

    const coupons = await db.coupon.findMany({
      orderBy: { createdAt: "desc" },
    });
    return { success: true, coupons };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to fetch coupons." };
  }
}
