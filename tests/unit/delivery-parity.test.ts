import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

let mockSession: { user?: { id: string; role: string; name?: string; email?: string } } | null = null;
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(async () => mockSession),
}));

let mockStoreSettings: any = {
  insideDhakaRate: null,
  outsideDhakaRate: null,
  expressDhakaRate: null,
  freeShippingThreshold: null,
  shippingConfigured: false,
};

vi.mock("@/server/services/settings-service", () => ({
  getStoreSettings: vi.fn(async () => mockStoreSettings),
  getPublicStoreSettings: vi.fn(async () => ({
    storeName: "Khelna Bazar",
    insideDhakaRate: mockStoreSettings.insideDhakaRate,
    outsideDhakaRate: mockStoreSettings.outsideDhakaRate,
    expressDhakaRate: mockStoreSettings.expressDhakaRate,
    freeShippingThreshold: mockStoreSettings.freeShippingThreshold,
    shippingConfigured: mockStoreSettings.shippingConfigured,
    hotline: "01712-039707",
    enableCod: true,
  })),
}));

vi.mock("@/server/services/inventory-service", () => ({
  adjustVariantStock: vi.fn(async () => ({})),
}));

vi.mock("@/server/services/coupon-service", () => ({
  validateCoupon: vi.fn(async () => ({ valid: true, discount: 0 })),
  incrementCouponUsage: vi.fn(async () => {}),
}));

const mockCreatedOrder: any = {
  id: "ord-test-parity",
  orderNumber: "KB-2611-999999",
  customerPhone: "01712345678",
};

vi.mock("@/lib/db", () => ({
  db: {
    productVariant: {
      findUnique: vi.fn(async () => ({
        id: "var-1",
        price: 1000,
        stock: 10,
        sku: "KB-TOY-STD",
        title: "Standard",
        product: { id: "prod-1", name: "Safe Wooden Toy", status: "ACTIVE", images: [] },
      })),
      findMany: vi.fn(async () => [
        {
          id: "var-1",
          price: 1000,
          stock: 10,
          sku: "KB-TOY-STD",
          title: "Standard",
          product: { id: "prod-1", name: "Safe Wooden Toy", status: "ACTIVE", images: [] },
        },
      ]),
    },
    order: {
      create: vi.fn(async (args) => {
        mockCreatedOrder.userId = args.data.userId;
        mockCreatedOrder.shippingFee = args.data.shippingFee;
        mockCreatedOrder.total = args.data.total;
        mockCreatedOrder.customerPhone = args.data.customerPhone;
        return mockCreatedOrder;
      }),
    },
    orderItem: {
      createMany: vi.fn(async () => ({ count: 1 })),
    },
    orderEvent: {
      create: vi.fn(async () => ({})),
    },
    $transaction: vi.fn(async (callback) => {
      if (typeof callback === "function") {
        return callback({
          productVariant: {
            findUnique: vi.fn(async () => ({
              id: "var-1",
              price: 1000,
              stock: 10,
              sku: "KB-TOY-STD",
              title: "Standard",
              product: { id: "prod-1", name: "Safe Wooden Toy", status: "ACTIVE", images: [] },
            })),
            findMany: vi.fn(async () => [
              {
                id: "var-1",
                price: 1000,
                stock: 10,
                sku: "KB-TOY-STD",
                title: "Standard",
                product: { id: "prod-1", name: "Safe Wooden Toy", status: "ACTIVE", images: [] },
              },
            ]),
          },
          order: {
            create: vi.fn(async (args) => {
              mockCreatedOrder.userId = args.data.userId;
              mockCreatedOrder.shippingFee = args.data.shippingFee;
              mockCreatedOrder.total = args.data.total;
              mockCreatedOrder.customerPhone = args.data.customerPhone;
              return mockCreatedOrder;
            }),
          },
          orderItem: {
            createMany: vi.fn(async () => ({ count: 1 })),
          },
          orderEvent: {
            create: vi.fn(async () => ({})),
          },
        });
      }
      return Promise.all(callback);
    }),
  },
}));

import { calculateDeliveryQuote } from "@/server/services/delivery-service";
import { placeOrder } from "@/server/actions/order-actions";
import { getPublicSettingsAction, getSettingsAction } from "@/server/actions/settings-actions";

describe("Delivery Pricing Parity & Server Authority Audit", () => {
  beforeEach(() => {
    mockSession = null;
    mockStoreSettings = {
      insideDhakaRate: null,
      outsideDhakaRate: null,
      expressDhakaRate: null,
      freeShippingThreshold: null,
      shippingConfigured: false,
    };
  });

  describe("calculateDeliveryQuote()", () => {
    it("returns isConfigured: false and deliveryFee: null when rates are not set (never defaults to 0)", async () => {
      const quoteInside = await calculateDeliveryQuote({ deliveryZone: "inside_dhaka", subtotal: 1000 });
      expect(quoteInside.isConfigured).toBe(false);
      expect(quoteInside.deliveryFee).toBeNull();
      expect(quoteInside.error).toBe("INSIDE_DHAKA_UNCONFIGURED");

      const quoteOutside = await calculateDeliveryQuote({ deliveryZone: "outside_dhaka", subtotal: 1000 });
      expect(quoteOutside.isConfigured).toBe(false);
      expect(quoteOutside.deliveryFee).toBeNull();
      expect(quoteOutside.error).toBe("OUTSIDE_DHAKA_UNCONFIGURED");
    });

    it("returns configured delivery fee when rates are set by store owner", async () => {
      mockStoreSettings = {
        insideDhakaRate: 60,
        outsideDhakaRate: 120,
        expressDhakaRate: 150,
        freeShippingThreshold: 2000,
        shippingConfigured: true,
      };

      const quoteInside = await calculateDeliveryQuote({ deliveryZone: "inside_dhaka", subtotal: 1000 });
      expect(quoteInside.isConfigured).toBe(true);
      expect(quoteInside.deliveryFee).toBe(60);

      const quoteOutside = await calculateDeliveryQuote({ deliveryZone: "outside_dhaka", subtotal: 1000 });
      expect(quoteOutside.isConfigured).toBe(true);
      expect(quoteOutside.deliveryFee).toBe(120);
    });

    it("applies free shipping ONLY when explicitly configured threshold (> 0) is met", async () => {
      mockStoreSettings = {
        insideDhakaRate: 60,
        outsideDhakaRate: 120,
        expressDhakaRate: null,
        freeShippingThreshold: 2000,
        shippingConfigured: true,
      };

      const belowThreshold = await calculateDeliveryQuote({ deliveryZone: "inside_dhaka", subtotal: 1999 });
      expect(belowThreshold.deliveryFee).toBe(60);
      expect(belowThreshold.isFreeShipping).toBe(false);

      const aboveThreshold = await calculateDeliveryQuote({ deliveryZone: "inside_dhaka", subtotal: 2000 });
      expect(aboveThreshold.deliveryFee).toBe(0);
      expect(aboveThreshold.isFreeShipping).toBe(true);
    });
  });

  describe("placeOrder() Enforcement", () => {
    const baseValidOrderInput = {
      fullName: "Nafis Imtiaz",
      phone: "01712345678",
      division: "Dhaka",
      cityArea: "Mirpur",
      fullAddress: "House 10, Road 4, Section 11",
      deliveryZone: "inside_dhaka",
      paymentMethod: "CASH_ON_DELIVERY",
      inspectionAcknowledged: true,
      items: [{ variantId: "var-1", quantity: 1 }],
    };

    it("rejects order placement if delivery rates are unconfigured", async () => {
      mockStoreSettings = {
        insideDhakaRate: null,
        outsideDhakaRate: null,
        expressDhakaRate: null,
        freeShippingThreshold: null,
        shippingConfigured: false,
      };

      const res = await placeOrder(baseValidOrderInput);
      expect(res.success).toBe(false);
      expect(res.error).toContain("not yet configured");
    });

    it("rejects order placement if expectedShippingFee does not match server authoritative calculation", async () => {
      mockStoreSettings = {
        insideDhakaRate: 60,
        outsideDhakaRate: 120,
        expressDhakaRate: null,
        freeShippingThreshold: null,
        shippingConfigured: true,
      };

      // Attacker claims shipping fee is 0 when server calculates 60
      const res = await placeOrder({
        ...baseValidOrderInput,
        expectedShippingFee: 0,
      });
      expect(res.success).toBe(false);
      expect(res.error).toContain("DELIVERY_FEE_MISMATCH");
    });

    it("rejects order placement if expectedTotal does not match server authoritative calculation", async () => {
      mockStoreSettings = {
        insideDhakaRate: 60,
        outsideDhakaRate: 120,
        expressDhakaRate: null,
        freeShippingThreshold: null,
        shippingConfigured: true,
      };

      // Attacker claims total is 500 when items (1000) + shipping (60) = 1060
      const res = await placeOrder({
        ...baseValidOrderInput,
        expectedShippingFee: 60,
        expectedTotal: 500,
      });
      expect(res.success).toBe(false);
      expect(res.error).toContain("TOTAL_MISMATCH");
    });

    it("ignores untrusted client-supplied userId and derives identity strictly from authenticated session", async () => {
      mockStoreSettings = {
        insideDhakaRate: 60,
        outsideDhakaRate: 120,
        expressDhakaRate: null,
        freeShippingThreshold: null,
        shippingConfigured: true,
      };

      mockSession = { user: { id: "real-session-user-123", role: "CUSTOMER" } };

      const res = await placeOrder({
        ...baseValidOrderInput,
        userId: "spoofed-attacker-user-id", // Client spoof attempt
        expectedShippingFee: 60,
        expectedTotal: 1060,
      });

      expect(res.success).toBe(true);
      expect(mockCreatedOrder.userId).toBe("real-session-user-123");
      expect(mockCreatedOrder.userId).not.toBe("spoofed-attacker-user-id");
    });

    it("blocks ADMIN and STAFF accounts from placing retail customer orders", async () => {
      mockStoreSettings = {
        insideDhakaRate: 60,
        outsideDhakaRate: 120,
        expressDhakaRate: null,
        freeShippingThreshold: null,
        shippingConfigured: true,
      };

      // Admin user attempts to order
      mockSession = { user: { id: "admin-user-1", role: "ADMIN" } };
      const adminRes = await placeOrder({
        ...baseValidOrderInput,
        expectedShippingFee: 60,
        expectedTotal: 1060,
      });
      expect(adminRes.success).toBe(false);
      expect(adminRes.error).toContain("ADMIN_CANNOT_ORDER");

      // Staff user attempts to order
      mockSession = { user: { id: "staff-user-1", role: "STAFF" } };
      const staffRes = await placeOrder({
        ...baseValidOrderInput,
        expectedShippingFee: 60,
        expectedTotal: 1060,
      });
      expect(staffRes.success).toBe(false);
      expect(staffRes.error).toContain("ADMIN_CANNOT_ORDER");

      // Super Admin user attempts to order
      mockSession = { user: { id: "super-user-1", role: "SUPER_ADMIN" } };
      const superRes = await placeOrder({
        ...baseValidOrderInput,
        expectedShippingFee: 60,
        expectedTotal: 1060,
      });
      expect(superRes.success).toBe(false);
      expect(superRes.error).toContain("ADMIN_CANNOT_ORDER");
    });
  });

  describe("Settings Access Control", () => {
    it("allows public access to getPublicSettingsAction() without credentials", async () => {
      mockSession = null;
      const res = await getPublicSettingsAction();
      expect(res.success).toBe(true);
      expect(res.settings).toBeDefined();
      expect(res.settings?.hotline).toBe("01712-039707");
    });

    it("blocks anonymous and customer users from calling getSettingsAction()", async () => {
      mockSession = null;
      const unauthRes = await getSettingsAction();
      expect(unauthRes.success).toBe(false);
      expect(unauthRes.error).toContain("Unauthorized");

      mockSession = { user: { id: "cust-1", role: "CUSTOMER" } };
      const custRes = await getSettingsAction();
      expect(custRes.success).toBe(false);
      expect(custRes.error).toContain("Unauthorized");
    });

    it("allows ADMIN and SUPER_ADMIN users to call getSettingsAction()", async () => {
      mockSession = { user: { id: "admin-1", role: "ADMIN" } };
      const adminRes = await getSettingsAction();
      expect(adminRes.success).toBe(true);
    });
  });
});
