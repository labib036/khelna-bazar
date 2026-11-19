import { describe, it, expect, vi, beforeEach } from "vitest";

const { mockSettingRecord } = vi.hoisted(() => {
  return {
    mockSettingRecord: { value: null as any },
  };
});

vi.mock("@/lib/db", () => ({
  db: {
    setting: {
      findUnique: vi.fn(async () => {
        if (!mockSettingRecord.value) return null;
        return { key: "store_general_settings", value: mockSettingRecord.value };
      }),
    },
  },
}));

import { getDeliveryQuote } from "@/server/services/settings-service";

describe("KHELNA BAZAR - Authoritative Delivery Quote Engine", () => {
  beforeEach(() => {
    mockSettingRecord.value = null;
  });

  it("returns NEEDS_CONFIRMATION with fee=null when store rates are unconfigured (null)", async () => {
    mockSettingRecord.value = {
      insideDhakaRate: null,
      outsideDhakaRate: null,
      expressDhakaRate: null,
      freeShippingThreshold: null,
    };

    const quoteInside = await getDeliveryQuote("inside_dhaka", 1500);
    expect(quoteInside.status).toBe("NEEDS_CONFIRMATION");
    expect(quoteInside.fee).toBeNull();
    expect(quoteInside.reason).toContain("01712-039707");

    const quoteOutside = await getDeliveryQuote("outside_dhaka", 1500);
    expect(quoteOutside.status).toBe("NEEDS_CONFIRMATION");
    expect(quoteOutside.fee).toBeNull();
    expect(quoteOutside.reason).toContain("01712-039707");
  });

  it("returns CONFIRMED with correct numeric fee when rates are configured", async () => {
    mockSettingRecord.value = {
      insideDhakaRate: 70,
      outsideDhakaRate: 130,
      expressDhakaRate: 150,
      freeShippingThreshold: null,
    };

    const quoteInside = await getDeliveryQuote("inside_dhaka", 800);
    expect(quoteInside.status).toBe("CONFIRMED");
    expect(quoteInside.fee).toBe(70);

    const quoteOutside = await getDeliveryQuote("outside_dhaka", 800);
    expect(quoteOutside.status).toBe("CONFIRMED");
    expect(quoteOutside.fee).toBe(130);
  });

  it("applies free delivery when subtotal meets free shipping threshold", async () => {
    mockSettingRecord.value = {
      insideDhakaRate: 70,
      outsideDhakaRate: 130,
      expressDhakaRate: 150,
      freeShippingThreshold: 2000,
    };

    const quoteUnder = await getDeliveryQuote("inside_dhaka", 1999);
    expect(quoteUnder.status).toBe("CONFIRMED");
    expect(quoteUnder.fee).toBe(70);

    const quoteMet = await getDeliveryQuote("inside_dhaka", 2000);
    expect(quoteMet.status).toBe("CONFIRMED");
    expect(quoteMet.fee).toBe(0);
    expect(quoteMet.reason).toBe("Free shipping threshold met");
  });

  it("never grants free shipping if freeShippingThreshold is null", async () => {
    mockSettingRecord.value = {
      insideDhakaRate: 60,
      outsideDhakaRate: 120,
      freeShippingThreshold: null,
    };

    const quoteLarge = await getDeliveryQuote("inside_dhaka", 100000);
    expect(quoteLarge.fee).toBe(60);
  });
});
