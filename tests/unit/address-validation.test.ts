import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock @/lib/auth
let mockSession: { user?: { id: string; role: string; name?: string; email?: string } } | null = null;
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(async () => mockSession),
}));

// In-memory mock address store
interface DbAddress {
  id: string;
  userId: string;
  label: string;
  fullName: string;
  phone: string;
  state: string;
  city: string;
  line1: string;
  isDefaultShipping: boolean;
  createdAt: Date;
}

let addressStore: DbAddress[] = [];

vi.mock("@/lib/db", () => ({
  db: {
    address: {
      findMany: vi.fn(async ({ where }: any) => {
        return addressStore.filter((a) => a.userId === where.userId);
      }),
      findUnique: vi.fn(async ({ where }: any) => {
        return addressStore.find((a) => a.id === where.id) || null;
      }),
      findFirst: vi.fn(async ({ where }: any) => {
        return addressStore.find((a) => a.userId === where.userId) || null;
      }),
      count: vi.fn(async ({ where }: any) => {
        return addressStore.filter((a) => a.userId === where.userId).length;
      }),
      create: vi.fn(async ({ data }: any) => {
        const item: DbAddress = {
          id: "addr-" + (addressStore.length + 1),
          userId: data.userId,
          label: data.label,
          fullName: data.fullName,
          phone: data.phone,
          state: data.state,
          city: data.city,
          line1: data.line1,
          isDefaultShipping: data.isDefaultShipping,
          createdAt: new Date(),
        };
        addressStore.push(item);
        return item;
      }),
      update: vi.fn(async ({ where, data }: any) => {
        const item = addressStore.find((a) => a.id === where.id);
        if (!item) throw new Error("Not found");
        Object.assign(item, data);
        return item;
      }),
      updateMany: vi.fn(async ({ where, data }: any) => {
        const items = addressStore.filter((a) => {
          let match = true;
          if (where.userId) match = match && a.userId === where.userId;
          if (where.isDefaultShipping !== undefined) match = match && a.isDefaultShipping === where.isDefaultShipping;
          return match;
        });
        items.forEach((it) => Object.assign(it, data));
        return { count: items.length };
      }),
      delete: vi.fn(async ({ where }: any) => {
        const idx = addressStore.findIndex((a) => a.id === where.id);
        if (idx !== -1) addressStore.splice(idx, 1);
        return {};
      }),
    },
    $transaction: vi.fn(async (arg: any) => {
      if (typeof arg === "function") {
        return await arg((vi.mocked as any));
      }
      return arg;
    }),
  },
}));

import {
  getUserAddresses,
  saveAddress,
  deleteAddress,
  setDefaultAddress,
} from "@/server/actions/address-actions";

describe("Address Persistence & Ownership Validation Audit", () => {
  beforeEach(() => {
    mockSession = null;
    addressStore = [];
    vi.clearAllMocks();
  });

  describe("Authentication & Input Validation", () => {
    it("rejects unauthenticated user from saving address", async () => {
      mockSession = null;
      const res = await saveAddress({
        fullName: "Shopper",
        phone: "01712345678",
        division: "Dhaka",
        city: "Uttara",
        line1: "Sector 4, Road 7",
        isDefault: false,
      });
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Unauthorized/i);
    });

    it("rejects invalid Bangladeshi phone numbers", async () => {
      mockSession = { user: { id: "user-1", role: "CUSTOMER" } };
      const res = await saveAddress({
        fullName: "Shopper",
        phone: "12345", // invalid format
        division: "Dhaka",
        city: "Uttara",
        line1: "Sector 4, Road 7",
        isDefault: false,
      });
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Bangladeshi mobile number/i);
    });

    it("rejects street address that is too short (< 5 chars)", async () => {
      mockSession = { user: { id: "user-1", role: "CUSTOMER" } };
      const res = await saveAddress({
        fullName: "Shopper",
        phone: "01712345678",
        division: "Dhaka",
        city: "Uttara",
        line1: "H 1", // too short
        isDefault: false,
      });
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/street address is required/i);
    });
  });

  describe("Ownership & IDOR Protection (Customer A vs Customer B)", () => {
    beforeEach(() => {
      // Seed an address for Customer A
      addressStore = [
        {
          id: "addr-cust-a-1",
          userId: "cust-a-id",
          label: "Home",
          fullName: "Customer A",
          phone: "01711111111",
          state: "Dhaka",
          city: "Gulshan",
          line1: "Road 10, House 5",
          isDefaultShipping: true,
          createdAt: new Date(),
        },
      ];
    });

    it("prevents Customer B from updating Customer A's address", async () => {
      mockSession = { user: { id: "cust-b-id", role: "CUSTOMER" } };
      const res = await saveAddress({
        id: "addr-cust-a-1",
        fullName: "Attacker",
        phone: "01822222222",
        division: "Chittagong",
        city: "Agrabad",
        line1: "Street 99",
        isDefault: false,
      });
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Unauthorized/i);
      expect(addressStore[0].fullName).toBe("Customer A"); // unchanged
    });

    it("prevents Customer B from deleting Customer A's address", async () => {
      mockSession = { user: { id: "cust-b-id", role: "CUSTOMER" } };
      const res = await deleteAddress("addr-cust-a-1");
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Unauthorized/i);
      expect(addressStore.length).toBe(1); // not deleted
    });

    it("prevents Customer B from modifying default status of Customer A's address", async () => {
      mockSession = { user: { id: "cust-b-id", role: "CUSTOMER" } };
      const res = await setDefaultAddress("addr-cust-a-1");
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/Unauthorized/i);
    });

    it("allows Customer A to retrieve only their own addresses", async () => {
      addressStore.push({
        id: "addr-cust-b-1",
        userId: "cust-b-id",
        label: "Office",
        fullName: "Customer B",
        phone: "01822222222",
        state: "Sylhet",
        city: "Zindabazar",
        line1: "Plaza 3",
        isDefaultShipping: true,
        createdAt: new Date(),
      });

      mockSession = { user: { id: "cust-a-id", role: "CUSTOMER" } };
      const addrs = await getUserAddresses();
      expect(addrs.length).toBe(1);
      expect(addrs[0].id).toBe("addr-cust-a-1");
      expect(addrs[0].fullName).toBe("Customer A");
    });
  });
});
