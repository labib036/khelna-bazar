"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { isStaffRole, isAdminRole } from "@/lib/authorization-guards";
import { assertPermission } from "@/lib/permissions";
import { checkRateLimit } from "@/lib/rate-limit";
import { getStoreSettings } from "@/server/services/settings-service";
import { calculateDeliveryQuote } from "@/server/services/delivery-service";
import { revalidatePath } from "next/cache";
import { generateOrderAccessToken, verifyOrderAccessToken } from "@/lib/order-token";
import { adjustVariantStock } from "@/server/services/inventory-service";
import { validateCoupon, incrementCouponUsage } from "@/server/services/coupon-service";
import { getOrders, getAdminKPIs, getOrderById, getOrderByNumberAndPhone } from "@/server/services/order-service";
import { PlaceOrderSchema, PlaceOrderInput } from "@/lib/order-schema";
import { OrderStatus, CodStatus } from "@/types/store";

export type { PlaceOrderInput };

/**
 * Bangladesh phone number validation:
 * Valid format: 013XXXXXXXX, 014XXXXXXXX, 015XXXXXXXX, 016XXXXXXXX, 017XXXXXXXX, 018XXXXXXXX, 019XXXXXXXX
 */
function isValidBDPhone(phone: string): boolean {
  const clean = phone.replace(/[\s-]/g, "");
  return /^(\+?88)?01[3-9]\d{8}$/.test(clean);
}

let orderSequenceCounter = 0;

/**
 * Generate human-friendly, collision-safe order number with date prefix, sequence, and DB uniqueness check
 * e.g. KB-261119-004273
 */
export async function generateServerOrderNumber(dbInstance: any = db): Promise<string> {
  const now = new Date();
  const year = String(now.getFullYear()).slice(-2);
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");

  const finder = (dbInstance?.order?.findUnique ? dbInstance : db)?.order?.findUnique;

  for (let attempt = 0; attempt < 10; attempt++) {
    orderSequenceCounter = (orderSequenceCounter + 1) % 10000;
    const seqStr = String(orderSequenceCounter).padStart(4, "0");
    const randSuffix = Math.floor(10 + Math.random() * 90);
    const candidate = `KB-${year}${month}${day}-${seqStr}${randSuffix}`;

    if (typeof finder === "function") {
      const existing = await finder({
        where: { orderNumber: candidate },
        select: { id: true },
      });

      if (!existing) {
        return candidate;
      }
    } else {
      return candidate;
    }
  }

  return `KB-${year}${month}${day}-${Date.now().toString().slice(-6)}`;
}

/**
 * Allowed status transitions state machine
 */
const ALLOWED_TRANSITIONS: Record<OrderStatus, OrderStatus[]> = {
  PENDING_CONFIRMATION: ["CONFIRMED", "PROCESSING", "CANCELLED"],
  CONFIRMED: ["PROCESSING", "PACKED", "SHIPPED", "CANCELLED"],
  PROCESSING: ["PACKED", "SHIPPED", "CANCELLED"],
  PACKED: ["SHIPPED", "OUT_FOR_DELIVERY", "CANCELLED"],
  SHIPPED: ["OUT_FOR_DELIVERY", "DELIVERED", "RETURNED"],
  OUT_FOR_DELIVERY: ["DELIVERED", "RETURNED"],
  DELIVERED: [], // Terminal
  CANCELLED: [], // Terminal
  RETURNED: [],  // Terminal
};

/**
 * Public Server Action: Calculates authoritative delivery quote
 */
export async function getDeliveryQuoteAction(params: {
  deliveryZone: string;
  subtotal: number;
  giftWrapCount?: number;
}) {
  try {
    const quote = await calculateDeliveryQuote(params);
    return { success: true, quote };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Creates a verified Order record with atomic transaction, live price verification,
 * stock decrement, coupon redemption, and server-authoritative delivery fees.
 * Enforces authenticated session identity (ignoring untrusted client userId).
 */
export async function placeOrder(input: unknown) {
  try {
    const parsed = PlaceOrderSchema.safeParse(input);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0];
      return {
        success: false,
        error: firstIssue?.message || "Invalid order information. Please review all fields.",
      };
    }

    const validated = parsed.data;

    // Resolve authenticated identity server-side
    const session = await auth();
    const userRole = session?.user?.role;

    // Strict Panel Isolation Guard: Admins and staff cannot place customer orders
    if (userRole && userRole !== "CUSTOMER") {
      return {
        success: false,
        error: "ADMIN_CANNOT_ORDER: Store administrators and staff members cannot place retail customer orders. Please sign out and order as a guest or with a customer account.",
      };
    }

    const authenticatedUserId = session?.user?.id || null;

    let normalizedPhone = validated.phone.replace(/[\s-]/g, "");
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

      // Check for duplicate TrxID to prevent reuse
      const cleanTrx = validated.trxId.trim().toUpperCase();
      const existingTrx = await db.order.findFirst({
        where: { mfsTrxId: cleanTrx },
        select: { orderNumber: true },
      });
      if (existingTrx) {
        throw new Error(`Transaction ID "${cleanTrx}" has already been submitted for order #${existingTrx.orderNumber}. If you believe this is an error, please contact customer support on 01712-039707.`);
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
      let totalGiftWrapCount = 0;
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
          totalGiftWrapCount += item.quantity;
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

      // 2. Authoritative Delivery Quote Calculation
      const quote = await calculateDeliveryQuote({
        deliveryZone: validated.deliveryZone,
        subtotal,
        giftWrapCount: totalGiftWrapCount,
      });

      if (!quote.isConfigured || quote.deliveryFee === null) {
        throw new Error(
          quote.message ||
            "DELIVERY_UNCONFIGURED: Delivery rate for the selected zone has not been configured. Please contact support via Call/WhatsApp 01712-039707."
        );
      }

      if (
        validated.expectedShippingFee !== undefined &&
        quote.deliveryFee !== validated.expectedShippingFee
      ) {
        throw new Error(
          `DELIVERY_FEE_MISMATCH: Server calculated delivery fee (৳${quote.deliveryFee}) differs from displayed fee (৳${validated.expectedShippingFee}). Please refresh your cart.`
        );
      }

      const shippingFee = quote.deliveryFee;
      const giftWrapFee = quote.giftWrapFee;

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

      if (validated.expectedTotal !== undefined && total !== validated.expectedTotal) {
        throw new Error(
          `TOTAL_MISMATCH: Order total has changed (server: ৳${total}, expected: ৳${validated.expectedTotal}). Please refresh your cart.`
        );
      }

      const orderNumber = await generateServerOrderNumber(tx);

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

      // 5. Create Order record (Customer email is nullable, never synthetic)
      const customerEmail = validated.email && validated.email.trim() ? validated.email.trim() : null;

      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: authenticatedUserId, // Server session derived
          customerName: validated.fullName,
          customerPhone: normalizedPhone,
          customerEmail,
          status: "PENDING_CONFIRMATION",
          codStatus: "UNCOLLECTED",
          paymentMethod: validated.paymentMethod as any,
          inspectionAcknowledged: true,
          inspectionAcknowledgedAt: new Date(),
          mfsSenderNumber: validated.paymentMethod !== "CASH_ON_DELIVERY" ? validated.senderNumber : null,
          mfsTrxId: validated.paymentMethod !== "CASH_ON_DELIVERY" && validated.trxId ? validated.trxId.trim().toUpperCase() : null,
          paymentStatus: validated.paymentMethod === "CASH_ON_DELIVERY" ? "PENDING" : "AWAITING_VERIFICATION",
          refundStatus: "NONE",
          subtotal,
          discount,
          shippingFee,
          giftWrapFee,
          total,
          currency: "BDT",
          deliveryZone: quote.appliedZone,
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
 * Updates order fulfillment status with state machine transition checks and audit event logging.
 * Enforces ADMIN or STAFF authorization.
 */
export async function updateOrderStatus(
  orderId: string,
  newStatus: OrderStatus,
  actorName = "Staff"
) {
  try {
    const perm = await assertPermission("orders.updateStatus");
    if (!perm.success) {
      return { success: false, error: perm.error };
    }

    const resolvedActor = perm.user.name || perm.user.email || actorName;

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return { success: false, error: "Order not found." };
    }

    // Constraint: MFS orders (bKash/Nagad) cannot transition to SHIPPED or beyond unless payment is VERIFIED
    if (
      (newStatus === "SHIPPED" || newStatus === "OUT_FOR_DELIVERY" || newStatus === "DELIVERED") &&
      order.paymentMethod !== "CASH_ON_DELIVERY" &&
      (order as any).paymentStatus !== "VERIFIED"
    ) {
      return {
        success: false,
        error: `Cannot transition order to ${newStatus}: Manual ${order.paymentMethod} payment must be verified before shipping. Current payment status is "${(order as any).paymentStatus}".`,
      };
    }

    // State machine: Check allowed transitions
    const currentStatus = order.status as OrderStatus;
    const allowedNext = ALLOWED_TRANSITIONS[currentStatus] || [];
    if (!allowedNext.includes(newStatus)) {
      return {
        success: false,
        error: `Illegal status transition: Cannot change order status from "${currentStatus}" to "${newStatus}".`,
      };
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
            message: `Status updated from ${currentStatus} to ${newStatus.replace(/_/g, " ")} by ${resolvedActor}.`,
            actorName: resolvedActor,
          },
        }),
      ]);
    }

    revalidatePath("/admin/orders");
    revalidatePath("/dashboard/orders");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Customer Action: Cancels an order in PENDING_CONFIRMATION status.
 */
export async function cancelCustomerOrderAction(orderId: string, reason?: string) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "Sign-in required to cancel orders." };
    }

    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });

    if (!order) {
      return { success: false, error: "Order not found." };
    }

    if (order.userId !== session.user.id) {
      return { success: false, error: "Unauthorized: You may only cancel your own orders." };
    }

    if (order.status !== "PENDING_CONFIRMATION") {
      return {
        success: false,
        error: "This order has already been confirmed and processed. To request cancellation, please contact support via Call/WhatsApp 01712-039707.",
      };
    }

    const actor = session.user.name || order.customerName || "Customer";

    await db.$transaction(async (tx) => {
      for (const item of order.items) {
        if (item.variantId) {
          await adjustVariantStock(
            {
              variantId: item.variantId,
              delta: item.quantity,
              reason: "RETURN_RESTOCK",
              actorName: actor,
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
          type: "ORDER_CANCELLED_BY_CUSTOMER",
          message: `Order cancelled by customer. Reason: ${reason || "Customer requested cancellation prior to confirmation."}`,
          actorName: actor,
        },
      });
    });

    revalidatePath("/dashboard/orders");
    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to cancel order." };
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
    const perm = await assertPermission("settings.manage");
    if (!perm.success) {
      return { success: false, error: "Unauthorized: Admin privileges required for COD financial reconciliation." };
    }

    const resolvedActor = perm.user.name || perm.user.email || actorName;

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

export async function getAdminOrdersAction(filters?: any) {
  try {
    const perm = await assertPermission("orders.view");
    if (!perm.success) {
      return { success: false, error: perm.error, orders: [], total: 0 };
    }
    const res = await getOrders(filters);
    return { success: true, orders: res.orders, total: res.total };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to fetch orders.", orders: [], total: 0 };
  }
}

export async function getAdminKPIsAction() {
  try {
    const perm = await assertPermission("reports.view");
    if (!perm.success) {
      return {
        success: false,
        error: perm.error,
        kpis: {
          totalOrders: 0,
          grossSales: 0,
          reconciledCash: 0,
          pendingCashInTransit: 0,
          pendingOrdersCount: 0,
        },
      };
    }
    const kpis = await getAdminKPIs();
    return { success: true, kpis };
  } catch (err: any) {
    return {
      success: false,
      error: err.message,
      kpis: {
        totalOrders: 0,
        grossSales: 0,
        reconciledCash: 0,
        pendingCashInTransit: 0,
        pendingOrdersCount: 0,
      },
    };
  }
}

/**
 * Fetches order details with strict IDOR prevention.
 * Only allows access if:
 * 1. Actor is Admin or Staff
 * 2. Actor is the authenticated owner of the order
 * 3. A valid order HMAC access token or matching customer phone number is supplied
 */
export async function fetchOrderDetails(
  orderIdOrNumber: string,
  tokenOrPhone?: string
) {
  try {
    const session = await auth();
    const order = await getOrderById(orderIdOrNumber);
    if (!order) return null;

    // Staff and Admins can view any order
    if (session?.user && isStaffRole(session.user.role)) {
      return order;
    }

    // Owner authenticated session can view their own order
    if (session?.user?.id && order.userId && session.user.id === order.userId) {
      return order;
    }

    // If tokenOrPhone is provided
    if (tokenOrPhone) {
      if (verifyOrderAccessToken(order.id, order.orderNumber, tokenOrPhone)) {
        return order;
      }
      const cleanInput = tokenOrPhone.replace(/[\s-]/g, "").replace(/^(\+?88)/, "");
      const cleanOrderPhone = (order.customerPhone || "").replace(/[\s-]/g, "").replace(/^(\+?88)/, "");
      if (cleanInput.length >= 10 && cleanInput === cleanOrderPhone) {
        return order;
      }
    }

    return null;
  } catch {
    return null;
  }
}

/**
 * Customer order tracking by order number and checkout phone verification.
 */
export async function trackOrderAction(orderNumber: string, phone: string) {
  try {
    const cleanNum = (orderNumber || "").trim().toUpperCase();
    const cleanPhone = (phone || "").replace(/[\s-]/g, "");
    if (!cleanNum || !cleanPhone) return null;

    const rateCheck = checkRateLimit(`track:${cleanPhone}`, { limit: 10, windowMs: 60 * 1000 });
    if (!rateCheck.success) {
      return null;
    }

    const order = await getOrderByNumberAndPhone(cleanNum, cleanPhone);
    return order;
  } catch {
    return null;
  }
}

/**
 * Retrieves orders for the authenticated customer account.
 */
export async function getCustomerOrders() {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return [];
    }

    const res = await getOrders({ userId: session.user.id, limit: 100 });
    return res.orders;
  } catch {
    return [];
  }
}

export async function placeCodOrder(input: Parameters<typeof placeOrder>[0]) {
  return placeOrder(input);
}

/**
 * Verifies customer manual MFS payment (bKash / Nagad).
 * Enforces ADMIN or STAFF authorization and guards against illegal verification.
 */
export async function verifyMfsPayment(orderId: string, actorName = "Staff") {
  try {
    const perm = await assertPermission("payments.verify");
    if (!perm.success) {
      return { success: false, error: perm.error };
    }

    const resolvedActor = perm.user.name || perm.user.email || actorName;
    const order = await db.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return { success: false, error: "Order not found." };
    }

    if (order.paymentMethod === "CASH_ON_DELIVERY") {
      return { success: false, error: "Cannot verify MFS payment for a Cash on Delivery order." };
    }

    if ((order as any).paymentStatus === "VERIFIED") {
      return { success: false, error: "Payment has already been verified." };
    }

    if ((order as any).paymentStatus === "REJECTED") {
      return { success: false, error: "Cannot verify an already rejected payment." };
    }

    if (order.status === "CANCELLED") {
      return { success: false, error: "Cannot verify payment for a cancelled order." };
    }

    await db.$transaction([
      db.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: "VERIFIED",
          paymentVerifiedAt: new Date(),
          paymentVerifiedBy: resolvedActor,
        },
      }),
      db.orderEvent.create({
        data: {
          orderId,
          type: "PAYMENT_VERIFIED",
          message: `${order.paymentMethod} payment (TrxID: ${order.mfsTrxId || "N/A"}) verified by ${resolvedActor}. Order cleared for processing.`,
          actorName: resolvedActor,
        },
      }),
    ]);

    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to verify MFS payment." };
  }
}

/**
 * Rejects customer manual MFS payment with explanation.
 * Enforces non-empty reason and releases reserved stock.
 */
export async function rejectMfsPayment(orderId: string, reason: string, actorName = "Staff") {
  try {
    const perm = await assertPermission("payments.verify");
    if (!perm.success) {
      return { success: false, error: perm.error };
    }

    if (!reason || reason.trim().length === 0) {
      return { success: false, error: "A valid non-empty reason is required to reject an MFS payment." };
    }

    const resolvedActor = perm.user.name || perm.user.email || actorName;
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) {
      return { success: false, error: "Order not found." };
    }

    if (order.paymentMethod === "CASH_ON_DELIVERY") {
      return { success: false, error: "Cannot reject MFS payment on a Cash on Delivery order." };
    }

    if ((order as any).paymentStatus === "VERIFIED") {
      return { success: false, error: "Cannot reject an already verified payment." };
    }

    if ((order as any).paymentStatus === "REJECTED") {
      return { success: false, error: "Payment has already been rejected." };
    }

    await db.$transaction(async (tx) => {
      // If order was in PENDING_CONFIRMATION, release reserved stock
      if (order.status === "PENDING_CONFIRMATION") {
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
      }

      await tx.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: "REJECTED",
          paymentRejectReason: reason.trim(),
          status: order.status === "PENDING_CONFIRMATION" ? "CANCELLED" : order.status,
        },
      });

      await tx.orderEvent.create({
        data: {
          orderId,
          type: "PAYMENT_REJECTED",
          message: `Payment rejected by ${resolvedActor}. Reason: ${reason.trim()}. Reserved stock released.`,
          actorName: resolvedActor,
        },
      });
    });

    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to reject MFS payment." };
  }
}

/**
 * Records refusal at delivery due to defect reported in front of delivery person.
 * Updates order to RETURNED and quarantines defective stock as DAMAGE (never sellable).
 * Enforces one-time execution and valid delivery status.
 */
export async function recordDefectiveRefusal(orderId: string, notes: string, actorName = "Staff") {
  try {
    const perm = await assertPermission("orders.updateStatus");
    if (!perm.success) {
      return { success: false, error: perm.error };
    }

    const resolvedActor = perm.user.name || perm.user.email || actorName;
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: { items: true },
    });
    if (!order) {
      return { success: false, error: "Order not found." };
    }

    if (order.status === "RETURNED") {
      return { success: false, error: "Order has already been recorded as returned." };
    }

    if (order.status && order.status !== "SHIPPED" && order.status !== "OUT_FOR_DELIVERY") {
      return {
        success: false,
        error: `Defective refusal can only be recorded at delivery state (current status: ${order.status}).`,
      };
    }

    await db.$transaction(async (tx) => {
      // Quarantine returned defective inventory under DAMAGE (non-sellable)
      for (const item of order.items) {
        if (item.variantId) {
          await adjustVariantStock(
            {
              variantId: item.variantId,
              delta: item.quantity,
              reason: "DAMAGE",
              actorName: resolvedActor,
              orderId: order.id,
            },
            tx
          );
        }
      }

      await tx.order.update({
        where: { id: orderId },
        data: {
          status: "RETURNED",
          adminNotes: [order.adminNotes, `Defect reported at delivery: ${notes}`].filter(Boolean).join(" | "),
        },
      });

      await tx.orderEvent.create({
        data: {
          orderId,
          type: "RETURN_DEFECTIVE",
          message: `Package refused at delivery due to reported defect: ${notes}. Quarantined by ${resolvedActor}.`,
          actorName: resolvedActor,
        },
      });
    });

    revalidatePath("/admin/orders");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to record defective refusal." };
  }
}

/**
 * Records financial refund to customer (e.g. for MFS prepaid order returned at delivery).
 * Enforces ADMIN-only authorization, bounds refund by remaining balance, and tracks refund lifecycle.
 */
export async function recordRefund(
  orderId: string,
  amount: number,
  method: string,
  reference?: string,
  actorName = "Accounts"
) {
  try {
    const perm = await assertPermission("refunds.record");
    if (!perm.success) {
      return { success: false, error: "Unauthorized: Admin privileges required to record refunds." };
    }

    if (!amount || amount <= 0) {
      return { success: false, error: "Refund amount must be a positive number." };
    }

    const resolvedActor = perm.user.name || perm.user.email || actorName;
    const order = await db.order.findUnique({ where: { id: orderId } });
    if (!order) {
      return { success: false, error: "Order not found." };
    }

    const currentRefunded = order.refundAmount || 0;
    const remainingRefundable = order.total !== undefined ? order.total - currentRefunded : amount;

    if (amount > remainingRefundable) {
      return {
        success: false,
        error: `Refund amount (৳${amount}) exceeds remaining refundable balance (৳${remainingRefundable}).`,
      };
    }

    const newTotalRefunded = currentRefunded + amount;
    const isFullRefund = order.total !== undefined && order.total > 0 ? newTotalRefunded >= order.total : true;

    await db.$transaction([
      db.order.update({
        where: { id: orderId },
        data: {
          refundStatus: isFullRefund ? "REFUNDED" : "REFUND_PENDING",
          refundAmount: newTotalRefunded,
          refundMethod: method,
          refundReference: reference || null,
          refundDate: new Date(),
        },
      }),
      db.orderEvent.create({
        data: {
          orderId,
          type: isFullRefund ? "REFUND_COMPLETED" : "REFUND_PARTIAL",
          message: `Refund of ৳${amount} recorded via ${method}${reference ? ` (Ref: ${reference})` : ""} by ${resolvedActor}. Total refunded: ৳${newTotalRefunded}/${order.total}.`,
          actorName: resolvedActor,
        },
      }),
    ]);

    revalidatePath("/admin/orders");
    revalidatePath("/admin");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to record refund." };
  }
}
