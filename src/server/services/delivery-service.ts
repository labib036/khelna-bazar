import { getStoreSettings } from "./settings-service";

export interface DeliveryQuoteParams {
  deliveryZone: "inside_dhaka" | "outside_dhaka" | "express_dhaka" | string;
  subtotal: number;
  giftWrapCount?: number;
}

export interface DeliveryQuoteResult {
  isConfigured: boolean;
  deliveryFee: number | null;
  giftWrapFee: number;
  totalDeliveryCharge: number | null;
  appliedZone: string;
  isFreeShipping: boolean;
  error?: string;
  message?: string;
}

/**
 * Single Authoritative Delivery Calculation Service
 * Shared across cart estimates, checkout pricing, and order creation validation.
 *
 * Rules:
 * 1. Rates are NEVER guessed or defaulted to numeric 0.
 * 2. If a rate is null/unconfigured, isConfigured is false and totalDeliveryCharge is null.
 * 3. Free shipping threshold applies ONLY if explicitly configured by the store owner (> 0).
 * 4. Express delivery is blocked if expressDhakaRate is null.
 */
export async function calculateDeliveryQuote(
  params: DeliveryQuoteParams
): Promise<DeliveryQuoteResult> {
  const settings = await getStoreSettings();
  const zoneNormalized = (params.deliveryZone || "").toLowerCase();

  const isExpress = zoneNormalized.includes("express");
  const isInside =
    !isExpress &&
    (zoneNormalized === "inside_dhaka" ||
      zoneNormalized.includes("inside") ||
      zoneNormalized.includes("dhaka city") ||
      zoneNormalized === "dhaka");
  const isOutside =
    zoneNormalized === "outside_dhaka" ||
    zoneNormalized.includes("outside") ||
    (!isExpress && !isInside && zoneNormalized.length > 0);

  let deliveryFee: number | null = null;
  let appliedZone = "Inside Dhaka";

  if (isExpress) {
    appliedZone = "Express Dhaka";
    if (settings.expressDhakaRate === null || settings.expressDhakaRate === undefined) {
      return {
        isConfigured: false,
        deliveryFee: null,
        giftWrapFee: 0,
        totalDeliveryCharge: null,
        appliedZone,
        isFreeShipping: false,
        error: "EXPRESS_DELIVERY_UNCONFIGURED",
        message: "Express delivery is currently unavailable. Please select standard delivery.",
      };
    }
    deliveryFee = settings.expressDhakaRate;
  } else if (isOutside) {
    appliedZone = "Outside Dhaka";
    if (settings.outsideDhakaRate === null || settings.outsideDhakaRate === undefined) {
      return {
        isConfigured: false,
        deliveryFee: null,
        giftWrapFee: 0,
        totalDeliveryCharge: null,
        appliedZone,
        isFreeShipping: false,
        error: "OUTSIDE_DHAKA_UNCONFIGURED",
        message: "Delivery rate for Outside Dhaka is not yet configured. Please contact support via Call/WhatsApp 01712-039707.",
      };
    }
    deliveryFee = settings.outsideDhakaRate;
  } else {
    // Inside Dhaka standard
    appliedZone = "Inside Dhaka";
    if (settings.insideDhakaRate === null || settings.insideDhakaRate === undefined) {
      return {
        isConfigured: false,
        deliveryFee: null,
        giftWrapFee: 0,
        totalDeliveryCharge: null,
        appliedZone,
        isFreeShipping: false,
        error: "INSIDE_DHAKA_UNCONFIGURED",
        message: "Delivery rate for Inside Dhaka is not yet configured. Please contact support via Call/WhatsApp 01712-039707.",
      };
    }
    deliveryFee = settings.insideDhakaRate;
  }

  // Check free shipping threshold
  let isFreeShipping = false;
  if (
    !isExpress &&
    settings.freeShippingThreshold !== null &&
    settings.freeShippingThreshold !== undefined &&
    settings.freeShippingThreshold > 0 &&
    params.subtotal >= settings.freeShippingThreshold
  ) {
    isFreeShipping = true;
    deliveryFee = 0;
  }

  // Calculate gift wrap fee if items requested gift wrap
  let totalGiftWrapFee = 0;
  if (params.giftWrapCount && params.giftWrapCount > 0) {
    if (settings.giftWrapFee !== null && settings.giftWrapFee !== undefined) {
      totalGiftWrapFee = settings.giftWrapFee * params.giftWrapCount;
    }
  }

  return {
    isConfigured: true,
    deliveryFee,
    giftWrapFee: totalGiftWrapFee,
    totalDeliveryCharge: (deliveryFee ?? 0) + totalGiftWrapFee,
    appliedZone,
    isFreeShipping,
  };
}
