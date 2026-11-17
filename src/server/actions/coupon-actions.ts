"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { validateCoupon } from "@/server/services/coupon-service";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function validateCouponAction(code: string, subtotal: number, shippingFee = 60) {
  return await validateCoupon(code, subtotal, shippingFee);
}

const CouponInputSchema = z.object({
  code: z.string().min(3, "Coupon code must be at least 3 characters").toUpperCase(),
  type: z.enum(["PERCENTAGE", "FIXED", "FREE_SHIPPING"]).default("PERCENTAGE"),
  value: z.number().int().min(1, "Discount value must be at least 1"),
  minSpend: z.number().int().min(0).default(500),
  maxDiscount: z.number().int().optional().nullable(),
  usageLimit: z.number().int().min(1).default(1000),
  expiresAt: z.string().or(z.date()),
});

export type CouponInput = z.infer<typeof CouponInputSchema>;

export async function createCoupon(input: CouponInput) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized: Admin privileges required to create promotional coupons." };
    }

    const data = CouponInputSchema.parse(input);
    const code = data.code.trim().toUpperCase();

    const existing = await db.coupon.findUnique({
      where: { code },
    });

    if (existing) {
      return { success: false, error: `Coupon code "${code}" already exists.` };
    }

    const created = await db.coupon.create({
      data: {
        code,
        type: data.type,
        value: data.value,
        minSpend: data.minSpend,
        maxDiscount: data.maxDiscount || null,
        usageLimit: data.usageLimit,
        endsAt: new Date(data.expiresAt),
        active: true,
      },
    });

    revalidatePath("/admin/coupons");
    return { success: true, coupon: created };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function toggleCouponActive(couponId: string) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized: Admin privileges required to toggle coupon status." };
    }

    const coupon = await db.coupon.findUnique({
      where: { id: couponId },
      select: { active: true },
    });

    if (!coupon) return { success: false, error: "Coupon not found." };

    const updated = await db.coupon.update({
      where: { id: couponId },
      data: { active: !coupon.active },
    });

    revalidatePath("/admin/coupons");
    return { success: true, active: updated.active };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteCoupon(couponId: string) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized: Admin privileges required to delete coupons." };
    }

    await db.coupon.delete({
      where: { id: couponId },
    });

    revalidatePath("/admin/coupons");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
