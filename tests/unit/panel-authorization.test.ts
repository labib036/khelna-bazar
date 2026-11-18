import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock next/navigation
const mockRedirect = vi.fn((url: string) => {
  const err = new Error(`NEXT_REDIRECT:${url}`);
  (err as any).digest = `NEXT_REDIRECT;replace;${url};307;`;
  throw err;
});

vi.mock("next/navigation", () => ({
  redirect: (url: string) => mockRedirect(url),
}));

// Mock next/cache
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
}));

// Mock session
let mockSessionUser: { id: string; role: string; name?: string; email?: string } | null = null;
vi.mock("@/lib/auth", () => ({
  auth: vi.fn(async () => (mockSessionUser ? { user: mockSessionUser } : null)),
}));

// Mock db
const mockAuditLogCreate = vi.fn().mockResolvedValue({ id: "log-1" });
const mockAuditLogFindMany = vi.fn().mockResolvedValue([]);
const mockUserFindMany = vi.fn().mockResolvedValue([]);
const mockUserFindFirst = vi.fn().mockResolvedValue(null);
const mockUserFindUnique = vi.fn().mockResolvedValue(null);
const mockUserCreate = vi.fn().mockResolvedValue({ id: "new-user-1", name: "New Staff", email: "new@khelnabazar.com.bd", role: "STAFF" });
const mockUserUpdate = vi.fn().mockResolvedValue({ id: "staff-1", role: "ADMIN" });

vi.mock("@/lib/db", () => ({
  db: {
    auditLog: {
      create: (...args: any[]) => mockAuditLogCreate(...args),
      findMany: (...args: any[]) => mockAuditLogFindMany(...args),
    },
    user: {
      findMany: (...args: any[]) => mockUserFindMany(...args),
      findFirst: (...args: any[]) => mockUserFindFirst(...args),
      findUnique: (...args: any[]) => mockUserFindUnique(...args),
      create: (...args: any[]) => mockUserCreate(...args),
      update: (...args: any[]) => mockUserUpdate(...args),
    },
  },
}));

import {
  getCurrentUser,
  requireAuthenticatedUser,
  requireCustomer,
  requireStaff,
  requireAdmin,
  requireSuperAdmin,
  isAuthorized,
} from "@/lib/authorization-guards";

import {
  getStaffUsersAction,
  createStaffUserAction,
  updateStaffRoleAction,
  getAuditLogsAction,
} from "@/server/actions/admin-staff-actions";

describe("Panel Route Isolation & Role Authorization Suite", () => {
  beforeEach(() => {
    mockSessionUser = null;
    vi.clearAllMocks();
  });

  describe("Helper: isAuthorized", () => {
    it("correctly evaluates allowed roles", () => {
      expect(isAuthorized("CUSTOMER", ["CUSTOMER"])).toBe(true);
      expect(isAuthorized("CUSTOMER", ["STAFF", "ADMIN"])).toBe(false);
      expect(isAuthorized("CUSTOMER", ["SUPER_ADMIN"])).toBe(false);

      expect(isAuthorized("STAFF", ["STAFF", "ADMIN"])).toBe(true);
      expect(isAuthorized("STAFF", ["ADMIN", "SUPER_ADMIN"])).toBe(false);

      expect(isAuthorized("ADMIN", ["ADMIN", "SUPER_ADMIN"])).toBe(true);
      expect(isAuthorized("ADMIN", ["SUPER_ADMIN"])).toBe(false);

      expect(isAuthorized("SUPER_ADMIN", ["SUPER_ADMIN"])).toBe(true);
    });
  });

  describe("Panel B: requireCustomer Guard", () => {
    it("redirects unauthenticated users to /login?next=/dashboard", async () => {
      mockSessionUser = null;
      await expect(requireCustomer("/dashboard")).rejects.toThrow("NEXT_REDIRECT:/login?next=%2Fdashboard");
      expect(mockRedirect).toHaveBeenCalledWith("/login?next=%2Fdashboard");
    });

    it("allows authenticated CUSTOMER to proceed", async () => {
      mockSessionUser = { id: "cust-1", role: "CUSTOMER", email: "shopper@gmail.com" };
      const user = await requireCustomer("/dashboard");
      expect(user.id).toBe("cust-1");
      expect(user.role).toBe("CUSTOMER");
    });

    it("redirects STAFF or ADMIN accessing customer dashboard to /admin/dashboard", async () => {
      mockSessionUser = { id: "staff-1", role: "STAFF", email: "staff@khelnabazar.com.bd" };
      await expect(requireCustomer("/dashboard")).rejects.toThrow("NEXT_REDIRECT:/admin/dashboard");
      expect(mockRedirect).toHaveBeenCalledWith("/admin/dashboard");

      mockSessionUser = { id: "admin-1", role: "ADMIN", email: "admin@khelnabazar.com.bd" };
      await expect(requireCustomer("/dashboard")).rejects.toThrow("NEXT_REDIRECT:/admin/dashboard");
    });
  });

  describe("Panel C: requireStaff Guard", () => {
    it("redirects unauthenticated users to login", async () => {
      mockSessionUser = null;
      await expect(requireStaff("/admin/orders")).rejects.toThrow("NEXT_REDIRECT:/login?next=%2Fadmin%2Forders");
    });

    it("redirects CUSTOMER to customer dashboard", async () => {
      mockSessionUser = { id: "cust-1", role: "CUSTOMER" };
      await expect(requireStaff("/admin/orders")).rejects.toThrow("NEXT_REDIRECT:/dashboard");
      expect(mockRedirect).toHaveBeenCalledWith("/dashboard");
    });

    it("allows STAFF, ADMIN, and SUPER_ADMIN into staff routes", async () => {
      mockSessionUser = { id: "staff-1", role: "STAFF" };
      let user = await requireStaff("/admin/orders");
      expect(user.role).toBe("STAFF");

      mockSessionUser = { id: "admin-1", role: "ADMIN" };
      user = await requireStaff("/admin/orders");
      expect(user.role).toBe("ADMIN");

      mockSessionUser = { id: "super-1", role: "SUPER_ADMIN" };
      user = await requireStaff("/admin/orders");
      expect(user.role).toBe("SUPER_ADMIN");
    });
  });

  describe("Panel C: requireAdmin Guard", () => {
    it("redirects STAFF to /admin/dashboard (insufficient permissions)", async () => {
      mockSessionUser = { id: "staff-1", role: "STAFF" };
      await expect(requireAdmin("/admin/settings")).rejects.toThrow("NEXT_REDIRECT:/admin/dashboard");
      expect(mockRedirect).toHaveBeenCalledWith("/admin/dashboard");
    });

    it("allows ADMIN and SUPER_ADMIN", async () => {
      mockSessionUser = { id: "admin-1", role: "ADMIN" };
      let user = await requireAdmin("/admin/settings");
      expect(user.role).toBe("ADMIN");

      mockSessionUser = { id: "super-1", role: "SUPER_ADMIN" };
      user = await requireAdmin("/admin/settings");
      expect(user.role).toBe("SUPER_ADMIN");
    });
  });

  describe("Panel C: requireSuperAdmin Guard", () => {
    it("redirects STAFF and ADMIN away from Super Admin pages", async () => {
      mockSessionUser = { id: "staff-1", role: "STAFF" };
      await expect(requireSuperAdmin("/admin/staff")).rejects.toThrow("NEXT_REDIRECT:/admin/dashboard");

      mockSessionUser = { id: "admin-1", role: "ADMIN" };
      await expect(requireSuperAdmin("/admin/staff")).rejects.toThrow("NEXT_REDIRECT:/admin/dashboard");
    });

    it("allows strictly SUPER_ADMIN", async () => {
      mockSessionUser = { id: "super-1", role: "SUPER_ADMIN", email: "owner@khelnabazar.com.bd" };
      const user = await requireSuperAdmin("/admin/staff");
      expect(user.role).toBe("SUPER_ADMIN");
    });
  });

  describe("Super Admin Server Actions", () => {
    it("blocks non-super admin from fetching staff directory", async () => {
      mockSessionUser = { id: "admin-1", role: "ADMIN" };
      const res = await getStaffUsersAction();
      expect(res.success).toBe(false);
      expect(res.users).toEqual([]);
    });

    it("blocks non-super admin from fetching audit logs", async () => {
      mockSessionUser = { id: "staff-1", role: "STAFF" };
      const res = await getAuditLogsAction();
      expect(res.success).toBe(false);
      expect(res.logs).toEqual([]);
    });

    it("allows super admin to fetch staff and audit logs", async () => {
      mockSessionUser = { id: "super-1", role: "SUPER_ADMIN", email: "root@khelnabazar.com.bd" };
      mockUserFindMany.mockResolvedValueOnce([{ id: "u1", name: "Staff 1", role: "STAFF" }]);
      mockAuditLogFindMany.mockResolvedValueOnce([{ id: "log-1", action: "STAFF_PROVISIONED" }]);

      const staffRes = await getStaffUsersAction();
      expect(staffRes.success).toBe(true);
      expect(staffRes.users.length).toBe(1);

      const logsRes = await getAuditLogsAction();
      expect(logsRes.success).toBe(true);
      expect(logsRes.logs.length).toBe(1);
    });

    it("prevents super admin from demoting their own account", async () => {
      mockSessionUser = { id: "super-1", role: "SUPER_ADMIN", email: "root@khelnabazar.com.bd" };
      const res = await updateStaffRoleAction("super-1", "STAFF");
      expect(res.success).toBe(false);
      expect(res.error).toMatch(/cannot demote your own Super Admin account/i);
    });
  });
});
