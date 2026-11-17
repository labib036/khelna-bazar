import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateOrderAccessToken } from "@/lib/order-token";

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock @/lib/auth
let mockSession: { user?: { id: string; role: string; name?: string; email?: string } } | null = null;
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(async () => mockSession),
}));

// Mock order database object
const testOrderA = {
  id: "ord-aaa-111",
  orderNumber: "KB-2611-100001",
  userId: "cust-a-id",
  customerName: "Abrar Fahim",
  customerPhone: "01712345678",
  customerEmail: "abrar@example.com",
  status: "PENDING_CONFIRMATION",
  codStatus: "UNCOLLECTED",
  paymentMethod: "CASH_ON_DELIVERY",
  subtotal: 2500,
  discount: 0,
  shippingFee: 0,
  giftWrapFee: 0,
  total: 2500,
  currency: "BDT",
  deliveryZone: "Inside Dhaka",
  shippingAddress: {
    fullName: "Abrar Fahim",
    phone: "01712345678",
    line1: "House 12, Road 4",
    city: "Banani",
    division: "Dhaka",
  },
  items: [],
  events: [],
};

// Mock order service
vi.mock("@/server/services/order-service", () => ({
  getOrderById: vi.fn(async (id: string) => {
    if (id === "ord-aaa-111" || id === "KB-2611-100001") {
      return testOrderA;
    }
    return null;
  }),
  getOrderByNumberAndPhone: vi.fn(async (orderNumber: string, phone: string) => {
    if (orderNumber === "KB-2611-100001" && phone === "01712345678") {
      return testOrderA;
    }
    return null;
  }),
  getOrders: vi.fn(async () => ({ orders: [], total: 0 })),
}));

// Mock db
vi.mock("@/lib/db", () => ({
  db: {
    order: {
      findUnique: vi.fn(),
    },
  },
}));

import { fetchOrderDetails } from "@/server/actions/order-actions";

describe("Order IDOR & Information Disclosure Prevention Audit", () => {
  beforeEach(() => {
    mockSession = null;
    vi.clearAllMocks();
  });

  describe("Insecure Direct Object Reference (IDOR) Protection", () => {
    it("blocks anonymous caller with only an orderId/orderNumber (returns null)", async () => {
      mockSession = null;
      const order = await fetchOrderDetails("ord-aaa-111");
      expect(order).toBeNull();

      const byNumber = await fetchOrderDetails("KB-2611-100001");
      expect(byNumber).toBeNull();
    });

    it("blocks Customer B from viewing Customer A's order", async () => {
      mockSession = { user: { id: "cust-b-id", role: "CUSTOMER", name: "Attacker / Customer B" } };
      const order = await fetchOrderDetails("ord-aaa-111");
      expect(order).toBeNull();
    });

    it("allows Customer A to view Customer A's own order without a token", async () => {
      mockSession = { user: { id: "cust-a-id", role: "CUSTOMER", name: "Abrar Fahim" } };
      const order = await fetchOrderDetails("ord-aaa-111");
      expect(order).not.toBeNull();
      expect(order?.customerName).toBe("Abrar Fahim");
      expect(order?.orderNumber).toBe("KB-2611-100001");
    });

    it("allows Guest to view order using valid HMAC orderAccessToken (from checkout redirect)", async () => {
      mockSession = null;
      const validToken = generateOrderAccessToken("ord-aaa-111", "KB-2611-100001");
      const order = await fetchOrderDetails("ord-aaa-111", validToken);
      expect(order).not.toBeNull();
      expect(order?.customerPhone).toBe("01712345678");
    });

    it("rejects Guest with tampered or incorrect orderAccessToken", async () => {
      mockSession = null;
      const invalidToken = "badf00d1234567890abcdef1234567890abcdef1234567890abcdef1234567890";
      const order = await fetchOrderDetails("ord-aaa-111", invalidToken);
      expect(order).toBeNull();
    });

    it("allows order lookup with matching customer phone number (from /track-order verification)", async () => {
      mockSession = null;
      // Phone format variation: +8801712345678
      const order = await fetchOrderDetails("KB-2611-100001", "+8801712345678");
      expect(order).not.toBeNull();
      expect(order?.orderNumber).toBe("KB-2611-100001");
    });

    it("rejects order lookup with non-matching phone number", async () => {
      mockSession = null;
      const order = await fetchOrderDetails("KB-2611-100001", "01999999999");
      expect(order).toBeNull();
    });

    it("allows Admin user to inspect any customer's order for customer service", async () => {
      mockSession = { user: { id: "admin-root", role: "ADMIN", name: "Store Admin" } };
      const order = await fetchOrderDetails("ord-aaa-111");
      expect(order).not.toBeNull();
      expect(order?.id).toBe("ord-aaa-111");
    });

    it("allows Staff user to inspect any order for dispatch fulfillment", async () => {
      mockSession = { user: { id: "staff-dispatch", role: "STAFF", name: "Courier Manager" } };
      const order = await fetchOrderDetails("ord-aaa-111");
      expect(order).not.toBeNull();
      expect(order?.id).toBe("ord-aaa-111");
    });
  });
});
