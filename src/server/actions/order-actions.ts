"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { getStoreSettings } from "@/server/services/settings-service";
import { validateCoupon, incrementCouponUsage } from "@/server/services/coupon-service";
import { adjustVariantStock } from "@/server/services/inventory-service";
import { getOrderByNumberAndPhone, getOrderById, getOrders } from "@/server/services/order-service";
import { OrderStatus, CodStatus, StoreOrder } from "@/types/store";
import { generateOrderAccessToken, verifyOrderAccessToken } from "@/lib/order-token";
import { normalizeIdentifier, isValidBDPhone } from "@/lib/auth-utils";
import { checkRateLimit } from "@/lib/rate-limit";
import { revalidatePath } from "next/cache";
import { z } from "zod";

export async function trackOrderAction(orderNumber: string, phone: string) {
  const rateCheck = checkRateLimit(`track:${orderNumber.trim()}`, { limit: 20, windowMs: 5 * 60 * 1000 });
  if (!rateCheck.success) {
    return null;
  }
  return await getOrderByNumberAndPhone(orderNumber, phone);
}

/**
 * Fetches order details with strict IDOR protections:
 * - Admin and Staff can view any order.
 * - Logged-in customers can only view their own orders.
 * - Guests must provide either a cryptographically signed orderAccessToken or matching phone.
 */
export async function fetchOrderDetails(orderId: string, tokenOrPhone?: string) {
  const order = await getOrderById(orderId);
  if (!order) return null;

  const session = await auth();

  // 1. Privileged users: Admin or Staff can inspect any order
  if (session?.user && (session.user.role === "ADMIN" || session.user.role === "STAFF")) {
    return order;
  }

  // 2. Authenticated customer who owns the order
  if (session?.user?.id && order.userId && session.user.id === order.userId) {
    return order;
  }

  // 3. Guest or direct lookup using cryptographically verified orderAccessToken
  if (tokenOrPhone && verifyOrderAccessToken(order.id, order.orderNumber, tokenOrPhone)) {
    return order;
  }

  // 4. Verification via matching customer phone
  if (tokenOrPhone) {
    const normalizedInput = normalizeIdentifier(tokenOrPhone);
    const normalizedOrderPhone = normalizeIdentifier(order.customerPhone);
    if (normalizedInput === normalizedOrderPhone) {
      return order;
    }
  }

  // Unauthorized access attempt (IDOR protection)
  return null;
}

export async function getCustomerOrders(): Promise<StoreOrder[]> {
  const session = await auth();
  if (!session?.user?.id) {
    return [];
  }
  const { orders } = await getOrders({ userId: session.user.id, limit: 50 });
  return orders;
}

const PlaceOrderSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z
    .string()
    .regex(/^(\+?88)?01[3-9]\d{8}$/, "Must be a valid Bangladeshi mobile number (01[3-9]XXXXXXXX)"),
  email: z.string().email().optional().or(z.literal("")),
  division: z.string().min(2, "Please select your district / division"),
  cityArea: z.string().min(2, "Please enter your area or thana"),
  fullAddress: z.string().min(5, "Please enter your complete street address"),
  deliveryNotes: z.string().optional(),
  deliveryZone: z.enum(["inside_dhaka", "outside_dhaka", "express_dhaka"]),
  paymentMethod: z.enum(["CASH_ON_DELIVERY", "BKASH", "NAGAD"]).default("CASH_ON_DELIVERY"),
  senderNumber: z.string().optional(),
  trxId: z.string().optional(),
  inspectionAcknowledged: z.boolean().default(true),
  items: z
    .array(
      z.object({
        variantId: z.string().min(1, "Variant ID required"),
        quantity: z.number().int().min(1, "Quantity must be at least 1"),
        giftWrap: z.boolean().default(false),
      })
    )
    .min(1, "Your cart cannot be empty"),
  couponCode: z.string().optional(),
  idempotencyKey: z.string().optional(),
  userId: z.string().optional(),
});

export type PlaceOrderInput = z.infer<typeof PlaceOrderSchema>;

/**
 * Generates collision-resistant server-side order sequence: KB-YYMM-XXXXXX
 */
function generateServerOrderNumber(): string {
  const now = new Date();
  const year = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const randomSeq = Math.floor(100000 + Math.random() * 900000);
  return `KB-${year}${month}-${randomSeq}`;
}

/**
 * Single transactional order placement action.
 * Atomically validates stock, re-calculates pricing from database records,
 * applies coupon, decrements inventory, and creates order records.
 */
export async function placeOrder(input: PlaceOrderInput) {
  try {
    const validated = PlaceOrderSchema.parse(input);

    // Normalize phone format to 01XXXXXXXXX
    let normalizedPhone = validated.phone.replace(/[\s\-()]/g, "");
    if (normalizedPhone.startsWith("+8801")) normalizedPhone = normalizedPhone.slice(3);
    else if (normalizedPhone.startsWith("8801")) normalizedPhone = normalizedPhone.slice(2);

    // Validate inspection acknowledgement
    if (validated.inspectionAcknowledged === false) {
      throw new Error("You must acknowledge that products must be inspected in front of the delivery person upon delivery.");
    }

    // Rate limit order placement: max 10 orders per 10 minutes per phone
    const rateCheck = checkRateLimit(`order:${normalizedPhone}`, { limit: 10, windowMs: 10 * 60 * 1000 });
    if (!rateCheck.success) {
      throw new Error(`Order placement rate limit reached. Please wait ${rateCheck.retryAfterSec} seconds before placing another order.`);
    }

    // Validate manual MFS payment details if not COD
    if (validated.paymentMethod !== "CASH_ON_DELIVERY") {
      if (!validated.senderNumber || !isValidBDPhone(validated.senderNumber)) {
        throw new Error(`Please provide a valid Bangladeshi mobile number used to send the ${validated.paymentMethod} payment.`);
      }
      if (!validated.trxId || validated.trxId.trim().length < 6) {
        throw new Error(`Please enter the ${validated.paymentMethod} Transaction ID (TrxID).`);
      }
    }

    // Check for duplicate submission via idempotencyKey
    if (validated.idempotencyKey) {
      const existing = await db.order.findUnique({
        where: { idempotencyKey: validated.idempotencyKey },
        select: { id: true, orderNumber: true, total: true },
      });
      if (existing) {
        return {
          success: true,
          orderId: existing.id,
          orderNumber: existing.orderNumber,
          total: existing.total,
          token: generateOrderAccessToken(existing.id, existing.orderNumber),
          isDuplicate: true,
        };
      }
    }

    const settings = await getStoreSettings();

    // Execute atomic order transaction
    const orderResult = await db.$transaction(async (tx) => {
      // 1. Fetch live DB variants and verify stock & unit prices
      const variantIds = validated.items.map((i) => i.variantId);
      const dbVariants = await tx.productVariant.findMany({
        where: { id: { in: variantIds } },
        include: {
          product: {
            select: {
              id: true,
              name: true,
              status: true,
              images: { take: 1, orderBy: { sortOrder: "asc" } },
            },
          },
        },
      });

      const variantMap = new Map(dbVariants.map((v) => [v.id, v]));

      let subtotal = 0;
      let giftWrapFee = 0;
      const orderItemsData: Array<{
        productId: string;
        variantId: string;
        nameSnapshot: string;
        skuSnapshot: string;
        imageSnapshot?: string;
        unitPrice: number;
        quantity: number;
        giftWrap: boolean;
        lineTotal: number;
      }> = [];

      for (const item of validated.items) {
        const dbVar = variantMap.get(item.variantId);
        if (!dbVar) {
          throw new Error(`Product variant "${item.variantId}" no longer exists in our catalog.`);
        }

        if (dbVar.product.status !== "ACTIVE") {
          throw new Error(`Product "${dbVar.product.name}" is currently unavailable.`);
        }

        if (dbVar.stock < item.quantity) {
          throw new Error(
            `Insufficient stock for "${dbVar.product.name} - ${dbVar.title}". Available: ${dbVar.stock}, requested: ${item.quantity}.`
          );
        }

        const lineTotal = dbVar.price * item.quantity;
        subtotal += lineTotal;

        if (item.giftWrap) {
          giftWrapFee += settings.giftWrapFee * item.quantity;
        }

        orderItemsData.push({
          productId: dbVar.product.id,
          variantId: dbVar.id,
          nameSnapshot: `${dbVar.product.name} (${dbVar.title})`,
          skuSnapshot: dbVar.sku,
          imageSnapshot: dbVar.imageUrl || dbVar.product.images[0]?.url || undefined,
          unitPrice: dbVar.price,
          quantity: item.quantity,
          giftWrap: item.giftWrap,
          lineTotal,
        });
      }

      // 2. Shipping calculation from Settings
      let shippingFee = 0;
      if (subtotal < settings.freeShippingThreshold) {
        if (validated.deliveryZone === "outside_dhaka") {
          shippingFee = settings.outsideDhakaRate;
        } else if (validated.deliveryZone === "express_dhaka") {
          shippingFee = settings.expressDhakaRate;
        } else {
          shippingFee = settings.insideDhakaRate;
        }
      }

      // 3. Coupon validation against database
      let discount = 0;
      let appliedCouponCode: string | undefined;

      if (validated.couponCode && validated.couponCode.trim().length > 0) {
        const couponRes = await validateCoupon(validated.couponCode, subtotal, shippingFee);
        if (couponRes.valid) {
          discount = couponRes.discount;
          appliedCouponCode = couponRes.code;
          await incrementCouponUsage(couponRes.code!, tx);
        } else {
          throw new Error(couponRes.error || "Invalid coupon applied.");
        }
      }

      const total = Math.max(0, subtotal - discount + shippingFee + giftWrapFee);
      const orderNumber = generateServerOrderNumber();

      // 4. Atomically decrement stock for each item & write StockMovement
      for (const item of validated.items) {
        await adjustVariantStock(
          {
            variantId: item.variantId,
            delta: -item.quantity,
            reason: "ORDER_FULFILLMENT",
            actorName: "Customer Checkout",
          },
          tx
        );
      }

      // 5. Create Order record
      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: validated.userId || null,
          customerName: validated.fullName,
          customerPhone: normalizedPhone,
          customerEmail: validated.email || `${normalizedPhone}@khelnabazar.internal`,
          status: "PENDING_CONFIRMATION",
          codStatus: "UNCOLLECTED",
          paymentMethod: validated.paymentMethod as any,
          subtotal,
          discount,
          shippingFee,
          giftWrapFee,
          total,
          currency: "BDT",
          deliveryZone: validated.deliveryZone === "outside_dhaka" ? "Outside Dhaka" : "Inside Dhaka",
          shippingAddress: {
            fullName: validated.fullName,
            phone: normalizedPhone,
            line1: validated.fullAddress,
            cityArea: validated.cityArea,
            division: validated.division,
            deliveryNotes: validated.deliveryNotes || "",
          },
          customerNotes: validated.deliveryNotes || null,
          idempotencyKey: validated.idempotencyKey || null,
          adminNotes: [
            appliedCouponCode ? `Coupon: ${appliedCouponCode} (-৳${discount})` : null,
            validated.paymentMethod !== "CASH_ON_DELIVERY"
              ? `Manual Payment: Sender=${validated.senderNumber || "N/A"}, TrxID=${validated.trxId || "N/A"} (Awaiting Admin Verification)`
              : null,
          ].filter(Boolean).join(" | ") || null,
          items: {
            create: orderItemsData,
          },
          events: {
            create: {
              type: "ORDER_PLACED",
              message: `Order placed via ${validated.paymentMethod.replace(/_/g, " ")}. Total: ৳${total.toLocaleString("en-BD")}.`,
              actorName: validated.fullName,
            },
          },
        },
      });

      return order;
    });

    revalidatePath("/admin/orders");
    revalidatePath("/admin");

    const accessToken = generateOrderAccessToken(orderResult.id, orderResult.orderNumber);

    return {
      success: true,
      orderId: orderResult.id,
      orderNumber: orderResult.orderNumber,
      total: orderResult.total,
      token: accessToken,
    };
  } catch (error: any) {
    console.error("placeOrder execution failure:", error);
    return {
      success: false,
      error: error.message || "Failed to place order. Please review your details and try again.",
    };
  }
}

/**
 * Updates order fulfillment status with state machine rules and audit event logging.
 * Enforces ADMIN or STAFF authorization.
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  actorName = "Staff"
) {
  try {
    const session = await auth();
    if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "STAFF")) {
      return { success: false, error: "Unauthorized: Admin or Staff privileges required to update order status." };
    }

    const resolvedActor = session.user.name || session.user.email || actorName;

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return { success: false, error: "Order not found." };
    }

    // Cancellation: automatically restock inventory
    if (newStatus === "CANCELLED" && order.status !== "CANCELLED") {
      await db.$transaction(async (tx) => {
        for (const item of order.items) {
          if (item.variantId) {
            await adjustVariantStock(
              {
                variantId: item.variantId,
                delta: item.quantity,
                reason: "RETURN_RESTOCK",
                actorName: resolvedActor,
                orderId: order.id,
              },
              tx
            );
          }
        }

        await tx.order.update({
          where: { id: orderId },
          data: { status: "CANCELLED" },
        });

        await tx.orderEvent.create({
          data: {
            orderId,
            type: "ORDER_CANCELLED",
            message: `Order cancelled by ${resolvedActor}. Warehouse inventory restocked.`,
            actorName: resolvedActor,
          },
        });
      });
    } else {
      await db.$transaction([
        db.order.update({
          where: { id: orderId },
          data: { status: newStatus as any },
        }),
        db.orderEvent.create({
          data: {
            orderId,
            type: "STATUS_CHANGE",
            message: `Status updated to ${newStatus.replace(/_/g, " ")} by ${resolvedActor}.`,
            actorName: resolvedActor,
          },
        }),
      ]);
    }

    revalidatePath("/admin/orders");
    revalidatePath("/account/orders");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Updates Cash on Delivery (COD) collection reconciliation status.
 * Enforces ADMIN-only authorization for financial audit trail.
 */
export async function updateCodStatus(
  orderId: string,
  newCodStatus: CodStatus,
  collectedAmount?: number,
  actorName = "Accounts"
) {
  try {
    const session = await auth();
    if (!session?.user || session.user.role !== "ADMIN") {
      return { success: false, error: "Unauthorized: Admin privileges required for COD financial reconciliation." };
    }

    const resolvedActor = session.user.name || session.user.email || actorName;

    await db.$transaction([
      db.order.update({
        where: { id: orderId },
        data: {
          codStatus: newCodStatus as any,
          codCollectedAmount: collectedAmount !== undefined ? collectedAmount : undefined,
          codCollectionDate: newCodStatus === "COLLECTED" ? new Date() : undefined,
        },
      }),
      db.orderEvent.create({
        data: {
          orderId,
          type: "COD_COLLECTED",
          message: `COD status updated to ${newCodStatus} by ${resolvedActor}${
            collectedAmount ? ` (Collected: ৳${collectedAmount})` : ""
          }.`,
          actorName: resolvedActor,
        },
      }),
    ]);

    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export const placeCodOrder = placeOrder;

