import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";

export interface CouponValidationResult {
  valid: boolean;
  code?: string;
  type?: "PERCENTAGE" | "FIXED" | "FREE_SHIPPING";
  value?: number;
  discount: number;
  error?: string;
}

/**
 * Validates a coupon code against the database.
 */
export async function validateCoupon(
  rawCode: string,
  subtotal: number,
  shippingFee = 60
): Promise<CouponValidationResult> {
  const code = (rawCode || "").trim().toUpperCase();
  if (!code) {
    return { valid: false, discount: 0, error: "Please enter a promo coupon code." };
  }

  try {
    const coupon = await db.coupon.findUnique({
      where: { code },
    });

    if (!coupon) {
      return { valid: false, discount: 0, error: `Coupon code "${code}" is not recognized.` };
    }

    if (!coupon.active) {
      return { valid: false, discount: 0, error: `Coupon code "${code}" is no longer active.` };
    }

    const now = new Date();
    if (coupon.startsAt && coupon.startsAt > now) {
      return { valid: false, discount: 0, error: `Coupon code "${code}" is not active yet.` };
    }

    if (coupon.endsAt && coupon.endsAt < now) {
      return { valid: false, discount: 0, error: `Coupon code "${code}" has expired.` };
    }

    if (coupon.usageLimit > 0 && coupon.usageCount >= coupon.usageLimit) {
      return { valid: false, discount: 0, error: `Coupon code "${code}" usage limit has been reached.` };
    }

    if (subtotal < coupon.minSpend) {
      return {
        valid: false,
        discount: 0,
        error: `Minimum order spend of ৳${coupon.minSpend} required to use "${code}".`,
      };
    }

    let discount = 0;
    if (coupon.type === "PERCENTAGE") {
      discount = Math.round((subtotal * coupon.value) / 100);
      if (coupon.maxDiscount && discount > coupon.maxDiscount) {
        discount = coupon.maxDiscount;
      }
    } else if (coupon.type === "FIXED" || (coupon.type as any) === "FIXED_AMOUNT") {
      discount = Math.min(coupon.value, subtotal);
    } else if (coupon.type === "FREE_SHIPPING") {
      discount = shippingFee;
    }

    return {
      valid: true,
      code: coupon.code,
      type: coupon.type as "PERCENTAGE" | "FIXED" | "FREE_SHIPPING",
      value: coupon.value,
      discount,
    };
  } catch (error) {
    console.error("Database coupon validation error:", (error as Error).message);
    return { valid: false, discount: 0, error: "Could not validate coupon. Please try again." };
  }
}

/**
 * Increments coupon usage count atomically within a transaction or directly.
 */
export async function incrementCouponUsage(
  code: string,
  tx?: Prisma.TransactionClient
): Promise<void> {
  const client = tx || db;
  await client.coupon.update({
    where: { code: code.toUpperCase().trim() },
    data: {
      usageCount: { increment: 1 },
    },
  });
}
