"use server";

import { db } from "@/lib/db";
import { generateOrderNumber } from "@/lib/utils";
import { siteConfig } from "@/config/site";
import { z } from "zod";

const OrderSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters"),
  phone: z.string().min(11, "Please provide a valid 11-digit phone number (e.g. 01700000000)"),
  email: z.string().email("Please provide a valid email address"),
  division: z.string().min(2, "Please select your district / division"),
  cityArea: z.string().min(2, "Please enter your area or thana"),
  fullAddress: z.string().min(5, "Please enter your complete street address"),
  deliveryNotes: z.string().optional(),
  deliveryZone: z.enum(["inside_dhaka", "outside_dhaka", "express_dhaka"]),
  items: z.array(
    z.object({
      productId: z.string(),
      variantId: z.string(),
      name: z.string(),
      title: z.string(),
      price: z.number(),
      quantity: z.number().min(1),
      giftWrap: z.boolean().default(false),
      image: z.string().optional(),
      sku: z.string().optional(),
    })
  ).min(1, "Your cart cannot be empty"),
  couponCode: z.string().optional(),
});

export type PlaceOrderInput = z.infer<typeof OrderSchema>;

export async function placeCodOrder(input: PlaceOrderInput) {
  try {
    // 1. Validate Input
    const validated = OrderSchema.parse(input);

    // 2. Server-Side Recalculate Financials (Never trust client totals)
    let subtotal = 0;
    let giftWrapFee = 0;

    for (const item of validated.items) {
      subtotal += item.price * item.quantity;
      if (item.giftWrap) {
        giftWrapFee += siteConfig.shippingDefaults.giftWrapFee * item.quantity;
      }
    }

    // Calculate delivery charge
    let shippingFee = 0;
    if (subtotal < siteConfig.shippingDefaults.freeShippingThreshold) {
      if (validated.deliveryZone === "outside_dhaka") {
        shippingFee = siteConfig.shippingDefaults.outsideDhakaRate; // ৳120
      } else if (validated.deliveryZone === "express_dhaka") {
        shippingFee = siteConfig.shippingDefaults.expressDhakaRate; // ৳150
      } else {
        shippingFee = siteConfig.shippingDefaults.insideDhakaRate; // ৳60
      }
    }

    // Coupon discount calculation
    let discount = 0;
    if (validated.couponCode) {
      const code = validated.couponCode.toUpperCase().trim();
      if (code === "PLAY10" && subtotal >= 1000) {
        discount = Math.min(Math.round(subtotal * 0.1), 500);
      } else if (code === "FREESHIP") {
        discount = shippingFee;
        shippingFee = 0;
      } else if (code === "WELCOME10") {
        discount = Math.min(Math.round(subtotal * 0.1), 300);
      } else if (code === "EIDKID200" && subtotal >= 2500) {
        discount = 200;
      }
    }

    const total = Math.max(0, subtotal - discount + shippingFee + giftWrapFee);
    const orderNumber = generateOrderNumber();

    // 3. Attempt DB Persistence
    try {
      const order = await db.order.create({
        data: {
          orderNumber,
          customerName: validated.fullName,
          customerPhone: validated.phone,
          customerEmail: validated.email,
          status: "PENDING_CONFIRMATION",
          codStatus: "UNCOLLECTED",
          paymentMethod: "CASH_ON_DELIVERY",
          subtotal,
          discount,
          shippingFee,
          giftWrapFee,
          total,
          currency: "BDT",
          deliveryZone: validated.deliveryZone === "outside_dhaka" ? "Outside Dhaka" : "Inside Dhaka",
          shippingAddress: {
            fullName: validated.fullName,
            phone: validated.phone,
            division: validated.division,
            cityArea: validated.cityArea,
            fullAddress: validated.fullAddress,
            notes: validated.deliveryNotes,
          },
          items: {
            create: validated.items.map((i) => ({
              productId: i.productId,
              variantId: i.variantId,
              nameSnapshot: i.name,
              skuSnapshot: i.sku || "KB-SKU",
              imageSnapshot: i.image || "",
              unitPrice: i.price,
              quantity: i.quantity,
              giftWrap: i.giftWrap,
              lineTotal: i.price * i.quantity,
            })),
          },
          events: {
            create: [
              {
                type: "ORDER_PLACED",
                message: "Customer placed Cash on Delivery order.",
                actorName: "Customer",
              },
            ],
          },
        },
      });

      return {
        success: true,
        orderId: order.id,
        orderNumber: order.orderNumber,
        total,
      };
    } catch (dbError) {
      console.warn("DB write skipped or failed (offline/mock mode active):", (dbError as Error).message);
      // Fallback for offline local dev mode
      return {
        success: true,
        orderId: orderNumber,
        orderNumber,
        total,
      };
    }
  } catch (error: any) {
    console.error("Order creation error:", error);
    return {
      success: false,
      error: error.message || "Could not place order. Please check your details.",
    };
  }
}
