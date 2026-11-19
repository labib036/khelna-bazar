import { describe, it, expect, vi } from "vitest";
import { can, assertPermission, ROLE_PERMISSIONS } from "@/lib/permissions";

// Mock @/lib/auth
let mockSessionUser: { id: string; role: string; name?: string; email?: string } | null = null;
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(async () => (mockSessionUser ? { user: mockSessionUser } : null)),
}));

describe("F-03: Single Unified Permission Map (src/lib/permissions.ts)", () => {
  it("enforces that CUSTOMER has zero admin permissions", () => {
    expect(ROLE_PERMISSIONS.CUSTOMER.size).toBe(0);
    expect(can("CUSTOMER", "orders.view")).toBe(false);
    expect(can("CUSTOMER", "products.edit")).toBe(false);
    expect(can("CUSTOMER", "settings.manage")).toBe(false);
  });

  it("enforces STAFF boundary: operational orders/inventory allowed, catalog/financial/staff denied", () => {
    expect(can("STAFF", "orders.view")).toBe(true);
    expect(can("STAFF", "orders.updateStatus")).toBe(true);
    expect(can("STAFF", "payments.verify")).toBe(true);
    expect(can("STAFF", "inventory.adjust")).toBe(true);
    expect(can("STAFF", "products.view")).toBe(true);

    // Denied to STAFF
    expect(can("STAFF", "products.edit")).toBe(false);
    expect(can("STAFF", "products.delete")).toBe(false);
    expect(can("STAFF", "coupons.manage")).toBe(false);
    expect(can("STAFF", "settings.manage")).toBe(false);
    expect(can("STAFF", "staff.manage")).toBe(false);
    expect(can("STAFF", "audit.view")).toBe(false);
  });

  it("enforces ADMIN boundary: catalog/orders/settings allowed, staff/audit denied", () => {
    expect(can("ADMIN", "products.edit")).toBe(true);
    expect(can("ADMIN", "products.delete")).toBe(true);
    expect(can("ADMIN", "coupons.manage")).toBe(true);
    expect(can("ADMIN", "settings.manage")).toBe(true);
    expect(can("ADMIN", "reports.view")).toBe(true);

    // Denied to ADMIN (Super Admin only)
    expect(can("ADMIN", "staff.manage")).toBe(false);
    expect(can("ADMIN", "audit.view")).toBe(false);
  });

  it("enforces SUPER_ADMIN authority: everything allowed", () => {
    expect(can("SUPER_ADMIN", "staff.manage")).toBe(true);
    expect(can("SUPER_ADMIN", "audit.view")).toBe(true);
    expect(can("SUPER_ADMIN", "products.edit")).toBe(true);
    expect(can("SUPER_ADMIN", "orders.view")).toBe(true);
  });

  it("assertPermission returns typed error if unauthenticated", async () => {
    mockSessionUser = null;
    const res = await assertPermission("products.edit");
    expect(res.error).toBeDefined();
    expect(res.error).toMatch(/Unauthorized/i);
    expect(res.user).toBeUndefined();
  });

  it("assertPermission returns typed error if permission denied", async () => {
    mockSessionUser = { id: "stf-1", role: "STAFF" };
    const res = await assertPermission("products.edit");
    expect(res.error).toBeDefined();
    expect(res.error).toMatch(/Admin privileges required/i);
    expect(res.user).toBeUndefined();
  });

  it("assertPermission returns authenticated user when authorized", async () => {
    mockSessionUser = { id: "adm-1", role: "ADMIN", name: "Admin Rashid", email: "admin@khelnabazar.com" };
    const res = await assertPermission("products.edit");
    expect(res.error).toBeUndefined();
    expect(res.user).toBeDefined();
    expect(res.user?.id).toBe("adm-1");
  });
});
