import { getCurrentUser, type AppRole, type AuthenticatedUser } from "./authorization-guards";
import { redirect } from "next/navigation";

export type Permission =
  | "orders.view"
  | "orders.updateStatus"
  | "payments.verify"
  | "refunds.record"
  | "products.view"
  | "products.edit"
  | "products.delete"
  | "inventory.adjust"
  | "categories.manage"
  | "coupons.manage"
  | "banners.manage"
  | "customers.view"
  | "reviews.moderate"
  | "settings.manage"
  | "staff.manage"
  | "audit.view"
  | "reports.view";

export const ROLE_PERMISSIONS: Record<AppRole, ReadonlySet<Permission>> = {
  CUSTOMER: new Set([]),
  STAFF: new Set<Permission>([
    "orders.view",
    "orders.updateStatus",
    "payments.verify",
    "refunds.record",
    "products.view",
    "inventory.adjust",
  ]),
  ADMIN: new Set<Permission>([
    "orders.view",
    "orders.updateStatus",
    "payments.verify",
    "refunds.record",
    "products.view",
    "products.edit",
    "products.delete",
    "inventory.adjust",
    "categories.manage",
    "coupons.manage",
    "banners.manage",
    "customers.view",
    "reviews.moderate",
    "settings.manage",
    "reports.view",
  ]),
  SUPER_ADMIN: new Set<Permission>([
    "orders.view",
    "orders.updateStatus",
    "payments.verify",
    "refunds.record",
    "products.view",
    "products.edit",
    "products.delete",
    "inventory.adjust",
    "categories.manage",
    "coupons.manage",
    "banners.manage",
    "customers.view",
    "reviews.moderate",
    "settings.manage",
    "reports.view",
    "staff.manage",
    "audit.view",
  ]),
};

/**
 * Pure authorization check for a role and permission.
 */
export function can(role: AppRole | string | undefined | null, permission: Permission): boolean {
  if (!role) return false;
  const permissions = ROLE_PERMISSIONS[role as AppRole];
  return permissions ? permissions.has(permission) : false;
}

export class PermissionDeniedError extends Error {
  name = "PermissionDeniedError";
  constructor(permission: Permission) {
    super(`Permission denied: required permission '${permission}'`);
  }
}

/**
 * Enforces permission at page/layout level. Redirects if unauthorized.
 */
export async function requirePermission(
  permission: Permission,
  callbackPath = "/admin/dashboard"
): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(`/login?next=${encodeURIComponent(callbackPath)}`);
  }
  if (!can(user.role, permission)) {
    redirect("/admin/dashboard");
  }
  return user;
}

export type AuthResult =
  | { success: true; user: AuthenticatedUser; error?: undefined }
  | { success: false; error: string; user?: undefined };

/**
 * Enforces permission for Server Actions and route handlers.
 * Returns a typed error result or the authenticated user.
 */
export async function assertPermission(permission: Permission): Promise<AuthResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Unauthorized: Authentication required." };
  }
  if (!can(user.role, permission)) {
    return {
      success: false,
      error: `Unauthorized: Admin privileges required. Permission '${permission}' denied for role '${user.role}'.`,
    };
  }
  return { success: true, user };
}
