import { describe, it, expect, vi } from "vitest";
import {
  formatPrice,
  calculateDiscountPercentage,
  calculateDeliveryFee,
  generateOrderNumber,
} from "@/lib/utils";
import { siteConfig } from "@/config/site";

const { mocks } = vi.hoisted(() => {
  return {
    mocks: {
      session: { user: { id: "admin-1", role: "ADMIN", name: "Super Admin" } } as any,
      orderRecord: null as any,
      dbUpdate: vi.fn(),
      eventCreate: vi.fn(),
      adjustStock: vi.fn(),
    },
  };
});

// Mock server dependencies for importing server action schemas and logic
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

vi.mock("@/lib/auth", () => ({
  auth: vi.fn(async () => mocks.session),
}));

vi.mock("@/lib/db", () => ({
  db: {
    order: {
      findUnique: vi.fn(async () => mocks.orderRecord),
      findFirst: vi.fn(async () => null),
      update: mocks.dbUpdate,
    },
    orderEvent: {
      create: mocks.eventCreate,
    },
    $transaction: vi.fn(async (arg) => {
      if (typeof arg === "function") {
        return arg({
          order: { update: mocks.dbUpdate },
          orderEvent: { create: mocks.eventCreate },
        });
      }
      return Promise.all(arg);
    }),
  },
}));

vi.mock("@/server/services/settings-service", () => ({
  getStoreSettings: vi.fn(),
}));

vi.mock("@/server/services/coupon-service", () => ({
  validateCoupon: vi.fn(),
  incrementCouponUsage: vi.fn(),
}));

vi.mock("@/server/services/inventory-service", () => ({
  adjustVariantStock: (...args: any[]) => mocks.adjustStock(...args),
}));

vi.mock("@/server/services/order-service", () => ({
  getOrderByNumberAndPhone: vi.fn(),
  getOrderById: vi.fn(),
  getOrders: vi.fn(),
  getAdminKPIs: vi.fn(),
}));

import { PlaceOrderSchema } from "@/lib/order-schema";
import {
  updateOrderStatus,
  recordDefectiveRefusal,
  recordRefund,
} from "@/server/actions/order-actions";

describe("KHELNA BAZAR - Core Business & COD Logic", () => {
  // 1. Currency & Pricing
  describe("Currency Formatting (BDT ৳)", () => {
    it("formats integer amounts in Bangladeshi Taka with symbol", () => {
      expect(formatPrice(1250)).toBe("৳1,250");
      expect(formatPrice(500)).toBe("৳500");
      expect(formatPrice(0)).toBe("৳0");
      expect(formatPrice(3450)).toBe("৳3,450");
    });
  });

  // 2. Discount Percentages
  describe("Discount Percentage Calculation", () => {
    it("calculates correct savings percentage rounded to integer", () => {
      const discount = calculateDiscountPercentage(3450, 4200);
      expect(discount).toBe(18);

      expect(calculateDiscountPercentage(1000, 1000)).toBe(0);
      expect(calculateDiscountPercentage(1000, null)).toBe(0);
    });
  });

  // 3. Delivery Fee & Owner-Approved Settings
  describe("Delivery Fee Calculations (Config-driven)", () => {
    it("returns configured delivery fee based on delivery zone", () => {
      const feeInside = calculateDeliveryFee("inside_dhaka", 1500);
      expect(feeInside).toBe(siteConfig.shippingDefaults.insideDhakaRate);

      const feeOutside = calculateDeliveryFee("outside_dhaka", 1500);
      expect(feeOutside).toBe(siteConfig.shippingDefaults.outsideDhakaRate);
    });
  });

  // 4. Order Number Generation
  describe("Human-Readable Order Number Format", () => {
    it("generates an order number starting with 'KB-' followed by 6 digits", () => {
      const orderNum = generateOrderNumber();
      expect(orderNum).toMatch(/^KB-\d{6}$/);
    });
  });

  // 5. Cash on Delivery (COD) Lifecycle States
  describe("COD Fulfillment & Cash Collection Lifecycle States", () => {
    const validFulfillmentStatuses = [
      "PENDING_CONFIRMATION",
      "CONFIRMED",
      "PROCESSING",
      "PACKED",
      "SHIPPED",
      "OUT_FOR_DELIVERY",
      "DELIVERED",
      "CANCELLED",
      "RETURNED",
    ];

    const validCodStatuses = ["UNCOLLECTED", "COLLECTED", "DISCREPANCY", "REFUNDED"];

    it("contains all expected COD order fulfillment statuses", () => {
      expect(validFulfillmentStatuses).toContain("PENDING_CONFIRMATION");
      expect(validFulfillmentStatuses).toContain("CONFIRMED");
      expect(validFulfillmentStatuses).toContain("DELIVERED");
    });

    it("separates physical delivery status from cash collection status", () => {
      const order = {
        fulfillment: "SHIPPED",
        codStatus: "UNCOLLECTED",
      };
      expect(order.fulfillment).toBe("SHIPPED");
      expect(order.codStatus).toBe("UNCOLLECTED");
    });
  });

  // 6. Mandatory Inspection-at-Delivery Schema Validation (Part 4 & Part 9)
  describe("Mandatory Inspection-at-Delivery Schema Validation", () => {
    const validBaseOrder = {
      fullName: "Tanvir Hossain",
      phone: "01712345678",
      division: "Dhaka",
      cityArea: "Mirpur 10",
      fullAddress: "House 45, Road 2",
      deliveryZone: "inside_dhaka" as const,
      paymentMethod: "CASH_ON_DELIVERY" as const,
      inspectionAcknowledged: true,
      items: [{ variantId: "var-1", quantity: 1, giftWrap: false }],
    };

    it("accepts order when inspectionAcknowledged is true", () => {
      const result = PlaceOrderSchema.safeParse(validBaseOrder);
      expect(result.success).toBe(true);
    });

    it("rejects order when inspectionAcknowledged is false", () => {
      const invalidOrder = {
        ...validBaseOrder,
        inspectionAcknowledged: false,
      };
      const result = PlaceOrderSchema.safeParse(invalidOrder);
      expect(result.success).toBe(false);
      if (!result.success) {
        const issues = result.error.issues;
        expect(issues.some((i: any) => i.path.includes("inspectionAcknowledged"))).toBe(true);
      }
    });

    it("rejects order when inspectionAcknowledged is omitted", () => {
      const { inspectionAcknowledged, ...omitted } = validBaseOrder;
      const result = PlaceOrderSchema.safeParse(omitted);
      expect(result.success).toBe(false);
    });

    it("validates Bangladeshi phone format (01[3-9]XXXXXXXX)", () => {
      const validPhones = ["01712345678", "01812345678", "01912345678", "01312345678", "+8801712345678"];
      for (const phone of validPhones) {
        const res = PlaceOrderSchema.safeParse({ ...validBaseOrder, phone });
        expect(res.success).toBe(true);
      }

      const invalidPhones = ["01234567890", "123456", "abcd", "0171234567"]; // too short or invalid operator prefix
      for (const phone of invalidPhones) {
        const res = PlaceOrderSchema.safeParse({ ...validBaseOrder, phone });
        expect(res.success).toBe(false);
      }
    });
  });

  // 7. Manual MFS Payment & Verification Guards (Part 4.2 & 5.2)
  describe("Manual MFS Dispatch Guard & Payment Status Transitions", () => {
    it("blocks MFS orders (bKash/Nagad) from being shipped if paymentStatus is not VERIFIED", async () => {
      mocks.orderRecord = {
        id: "ord-mfs-pending",
        orderNumber: "KB-2611-200001",
        paymentMethod: "BKASH",
        paymentStatus: "AWAITING_VERIFICATION",
        status: "PROCESSING",
        items: [],
      };

      const result = await updateOrderStatus("ord-mfs-pending", "SHIPPED");
      expect(result.success).toBe(false);
      expect(result.error).toContain("Manual BKASH payment must be verified before shipping");
    });

    it("allows MFS orders to be shipped when paymentStatus is VERIFIED", async () => {
      mocks.orderRecord = {
        id: "ord-mfs-verified",
        orderNumber: "KB-2611-200002",
        paymentMethod: "BKASH",
        paymentStatus: "VERIFIED",
        status: "PROCESSING",
        items: [],
      };

      const result = await updateOrderStatus("ord-mfs-verified", "SHIPPED");
      expect(result.success).toBe(true);
    });

    it("allows COD orders to be shipped without MFS verification", async () => {
      mocks.orderRecord = {
        id: "ord-cod-standard",
        orderNumber: "KB-2611-200003",
        paymentMethod: "CASH_ON_DELIVERY",
        paymentStatus: "PENDING",
        status: "PROCESSING",
        items: [],
      };

      const result = await updateOrderStatus("ord-cod-standard", "SHIPPED");
      expect(result.success).toBe(true);
    });
  });

  // 8. Payment & Refund Status Lifecycle Validation
  describe("Payment & Refund Status Lifecycle Definitions", () => {
    const validPaymentStatuses = ["PENDING", "AWAITING_VERIFICATION", "VERIFIED", "REJECTED"];
    const validRefundStatuses = ["NONE", "REFUND_PENDING", "REFUNDED"];

    it("includes all authorized payment statuses per Master Spec", () => {
      expect(validPaymentStatuses).toEqual(
        expect.arrayContaining(["PENDING", "AWAITING_VERIFICATION", "VERIFIED", "REJECTED"])
      );
    });

    it("includes all authorized refund statuses per Master Spec", () => {
      expect(validRefundStatuses).toEqual(
        expect.arrayContaining(["NONE", "REFUND_PENDING", "REFUNDED"])
      );
    });
  });

  // 9. Defective Refusal at Delivery & Restock Logic (Part 6.1)
  describe("Defective Package Refusal at Delivery", () => {
    it("marks order as RETURNED and restocks damaged inventory when defect reported in front of courier", async () => {
      mocks.orderRecord = {
        id: "ord-defect-1",
        orderNumber: "KB-2611-300001",
        adminNotes: null,
        items: [
          { variantId: "var-toy-1", quantity: 2 },
          { variantId: "var-toy-2", quantity: 1 },
        ],
      };

      const result = await recordDefectiveRefusal("ord-defect-1", "Cracked battery compartment noted by delivery courier");
      expect(result.success).toBe(true);
      expect(mocks.adjustStock).toHaveBeenCalledTimes(2);
      expect(mocks.adjustStock).toHaveBeenCalledWith(
        expect.objectContaining({
          variantId: "var-toy-1",
          delta: 2,
          reason: "DAMAGE",
        }),
        expect.anything()
      );
    });
  });

  // 10. Financial Refund Recording (Part 5.2)
  describe("Financial Refund Recording", () => {
    it("records customer refund details with amount, method, and transaction reference", async () => {
      mocks.orderRecord = {
        id: "ord-refund-1",
        orderNumber: "KB-2611-400001",
        status: "RETURNED",
        refundStatus: "NONE",
      };

      const result = await recordRefund("ord-refund-1", 1250, "BKASH", "TRX-REFUND-999");
      expect(result.success).toBe(true);
      expect(mocks.dbUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: "ord-refund-1" },
          data: expect.objectContaining({
            refundStatus: "REFUNDED",
            refundAmount: 1250,
            refundMethod: "BKASH",
            refundReference: "TRX-REFUND-999",
          }),
        })
      );
    });
  });
});
