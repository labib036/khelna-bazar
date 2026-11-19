"use server";

import { db } from "@/lib/db";
import { assertPermission } from "@/lib/permissions";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";

export type StaffRole = "STAFF" | "ADMIN" | "SUPER_ADMIN";

/**
 * Retrieves all staff, admin, and super-admin accounts.
 * Super Admin only.
 */
export async function getStaffUsersAction() {
  try {
    const perm = await assertPermission("staff.manage");
    if (!perm.success) {
      return { success: false, error: perm.error, users: [] };
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
    const perm = await assertPermission("staff.manage");
    if (!perm.success) {
      return { success: false, error: perm.error };
    }
    const actor = perm.user;

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
    const perm = await assertPermission("staff.manage");
    if (!perm.success) {
      return { success: false, error: perm.error };
    }
    const actor = perm.user;

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
      data: { role: newRole, tokenVersion: { increment: 1 } },
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
 * Toggles a user's blocked/active status, incrementing tokenVersion to immediately revoke sessions.
 * Super Admin only.
 */
export async function toggleUserStatusAction(targetUserId: string, blocked: boolean) {
  try {
    const perm = await assertPermission("staff.manage");
    if (!perm.success) {
      return { success: false, error: perm.error };
    }
    const actor = perm.user;

    if (actor.id === targetUserId) {
      return { success: false, error: "You cannot block your own Super Admin account." };
    }

    const updated = await db.user.update({
      where: { id: targetUserId },
      data: {
        blocked,
        tokenVersion: { increment: 1 },
      },
      select: { id: true, name: true, email: true, role: true, blocked: true },
    });

    await db.auditLog.create({
      data: {
        actorId: actor.id,
        actorEmail: actor.email,
        action: blocked ? "USER_BLOCKED" : "USER_UNBLOCKED",
        entityType: "User",
        entityId: targetUserId,
      },
    });

    revalidatePath("/admin/staff");
    return { success: true, user: updated };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to update user status" };
  }
}

/**
 * Revokes all active sessions for a user by incrementing tokenVersion.
 * Super Admin only.
 */
export async function revokeUserSessionsAction(targetUserId: string) {
  try {
    const perm = await assertPermission("staff.manage");
    if (!perm.success) {
      return { success: false, error: perm.error };
    }
    const actor = perm.user;

    const updated = await db.user.update({
      where: { id: targetUserId },
      data: { tokenVersion: { increment: 1 } },
      select: { id: true, name: true, email: true, tokenVersion: true },
    });

    await db.auditLog.create({
      data: {
        actorId: actor.id,
        actorEmail: actor.email,
        action: "REVOKE_ALL_SESSIONS",
        entityType: "User",
        entityId: targetUserId,
        after: { tokenVersion: updated.tokenVersion },
      },
    });

    revalidatePath("/admin/staff");
    return { success: true, message: `All active sessions revoked for ${updated.name || updated.email}.` };
  } catch (err: any) {
    return { success: false, error: err.message || "Failed to revoke sessions." };
  }
}

/**
 * Retrieves platform audit logs.
 * Super Admin only.
 */
export async function getAuditLogsAction(limit = 50) {
  try {
    const perm = await assertPermission("audit.view");
    if (!perm.success) {
      return { success: false, error: perm.error, logs: [] };
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
