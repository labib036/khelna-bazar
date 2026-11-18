"use server";

import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/authorization-guards";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export type StaffRole = "STAFF" | "ADMIN" | "SUPER_ADMIN";

/**
 * Retrieves all staff, admin, and super-admin accounts.
 * Super Admin only.
 */
export async function getStaffUsersAction() {
  try {
    const actor = await getCurrentUser();
    if (!actor || actor.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized: Super Admin privileges required.", users: [] };
    }

    const users = await db.user.findMany({
      where: {
        role: {
          in: ["STAFF", "ADMIN", "SUPER_ADMIN"],
        },
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        role: true,
        createdAt: true,
        blocked: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return { success: true, users };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to fetch staff directory", users: [] };
  }
}

/**
 * Creates or provisions a new internal staff or admin user.
 * Super Admin only.
 */
export async function createStaffUserAction(input: {
  name: string;
  email: string;
  phone?: string;
  role: StaffRole;
  password?: string;
}) {
  try {
    const actor = await getCurrentUser();
    if (!actor || actor.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized: Super Admin privileges required." };
    }

    const cleanEmail = input.email.trim().toLowerCase();
    const existing = await db.user.findFirst({
      where: { email: cleanEmail },
      select: { id: true, role: true },
    });

    if (existing) {
      return { success: false, error: `User with email "${cleanEmail}" already exists with role ${existing.role}.` };
    }

    const defaultPassword = input.password || "KhelnaStaff2026!";
    const passwordHash = await bcrypt.hash(defaultPassword, 12);

    const newUser = await db.user.create({
      data: {
        name: input.name.trim(),
        email: cleanEmail,
        phone: input.phone?.trim() || null,
        role: input.role,
        passwordHash,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    // Record in Audit Log
    await db.auditLog.create({
      data: {
        actorId: actor.id,
        actorEmail: actor.email,
        action: "STAFF_PROVISIONED",
        entityType: "User",
        entityId: newUser.id,
        after: { name: newUser.name, email: newUser.email, role: newUser.role },
      },
    });

    revalidatePath("/admin/staff");
    return { success: true, user: newUser };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to create staff account" };
  }
}

/**
 * Updates a staff member's role or status.
 * Super Admin only.
 */
export async function updateStaffRoleAction(
  targetUserId: string,
  newRole: StaffRole
) {
  try {
    const actor = await getCurrentUser();
    if (!actor || actor.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized: Super Admin privileges required." };
    }

    // Prevent self-demotion to avoid locking out the last super admin
    if (actor.id === targetUserId && newRole !== "SUPER_ADMIN") {
      return { success: false, error: "You cannot demote your own Super Admin account." };
    }

    const existing = await db.user.findUnique({
      where: { id: targetUserId },
      select: { id: true, role: true, email: true },
    });

    if (!existing) {
      return { success: false, error: "Target user not found." };
    }

    const updated = await db.user.update({
      where: { id: targetUserId },
      data: { role: newRole },
      select: { id: true, name: true, email: true, role: true },
    });

    // Record in Audit Log
    await db.auditLog.create({
      data: {
        actorId: actor.id,
        actorEmail: actor.email,
        action: "STAFF_ROLE_CHANGE",
        entityType: "User",
        entityId: targetUserId,
        before: { role: existing.role },
        after: { role: newRole },
      },
    });

    revalidatePath("/admin/staff");
    return { success: true, user: updated };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update staff role" };
  }
}

/**
 * Retrieves platform audit logs.
 * Super Admin only.
 */
export async function getAuditLogsAction(limit = 50) {
  try {
    const actor = await getCurrentUser();
    if (!actor || actor.role !== "SUPER_ADMIN") {
      return { success: false, error: "Unauthorized: Super Admin privileges required.", logs: [] };
    }

    const logs = await db.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: Math.min(limit, 100),
      include: {
        actor: {
          select: {
            name: true,
            email: true,
            role: true,
          },
        },
      },
    });

    return { success: true, logs };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to fetch audit logs", logs: [] };
  }
}
