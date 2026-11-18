import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";

export type AppRole = "CUSTOMER" | "STAFF" | "ADMIN" | "SUPER_ADMIN";

export interface AuthenticatedUser {
  id: string;
  name?: string | null;
  email?: string | null;
  phone?: string | null;
  role: AppRole;
}

/**
 * Retrieves the currently authenticated session user safely on the server.
 */
export async function getCurrentUser(): Promise<AuthenticatedUser | null> {
  const session = await auth();
  if (!session?.user?.id) {
    return null;
  }
  return {
    id: session.user.id,
    name: session.user.name,
    email: session.user.email,
    phone: (session.user as any).phone || null,
    role: (session.user.role as AppRole) || "CUSTOMER",
  };
}

/**
 * Enforces that a user is authenticated.
 * Redirects to /login if unauthenticated and redirectToLogin is true.
 */
export async function requireAuthenticatedUser(
  callbackPath?: string
): Promise<AuthenticatedUser> {
  const user = await getCurrentUser();
  if (!user) {
    const loginUrl = callbackPath
      ? `/login?next=${encodeURIComponent(callbackPath)}`
      : "/login";
    redirect(loginUrl);
  }
  return user;
}

/**
 * Enforces that the user is a CUSTOMER.
 * Prevents staff/admin or unauthenticated access to personal customer dashboards.
 */
export async function requireCustomer(
  callbackPath?: string
): Promise<AuthenticatedUser> {
  const user = await requireAuthenticatedUser(callbackPath);
  if (user.role !== "CUSTOMER") {
    // If staff/admin attempts to visit customer dashboard, route to admin console
    redirect("/admin/dashboard");
  }
  return user;
}

/**
 * Enforces that the user has operational staff access (STAFF, ADMIN, or SUPER_ADMIN).
 */
export async function requireStaff(
  callbackPath = "/admin/dashboard"
): Promise<AuthenticatedUser> {
  const user = await requireAuthenticatedUser(callbackPath);
  if (user.role !== "STAFF" && user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    redirect("/dashboard");
  }
  return user;
}

/**
 * Enforces that the user has managerial admin access (ADMIN or SUPER_ADMIN).
 */
export async function requireAdmin(
  callbackPath = "/admin/dashboard"
): Promise<AuthenticatedUser> {
  const user = await requireAuthenticatedUser(callbackPath);
  if (user.role !== "ADMIN" && user.role !== "SUPER_ADMIN") {
    redirect("/admin/dashboard");
  }
  return user;
}

/**
 * Enforces that the user is strictly SUPER_ADMIN (for staff management & audit logs).
 */
export async function requireSuperAdmin(
  callbackPath = "/admin/dashboard"
): Promise<AuthenticatedUser> {
  const user = await requireAuthenticatedUser(callbackPath);
  if (user.role !== "SUPER_ADMIN") {
    redirect("/admin/dashboard");
  }
  return user;
}

/**
 * Helper to check role eligibility in Server Actions without throwing redirects.
 */
export function isAuthorized(
  userRole: string | undefined,
  allowedRoles: AppRole[]
): boolean {
  if (!userRole) return false;
  return allowedRoles.includes(userRole as AppRole);
}

export function isStaffRole(role: string | undefined): boolean {
  return role === "STAFF" || role === "ADMIN" || role === "SUPER_ADMIN";
}

export function isAdminRole(role: string | undefined): boolean {
  return role === "ADMIN" || role === "SUPER_ADMIN";
}

export function isSuperAdminRole(role: string | undefined): boolean {
  return role === "SUPER_ADMIN";
}
