"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { isStaffRole, isAdminRole } from "@/lib/authorization-guards";
import { revalidatePath } from "next/cache";

export async function getCustomersAction(params?: { query?: string; page?: number; limit?: number }) {
  try {
    const session = await auth();
    if (!session?.user || !isStaffRole(session.user.role)) {
      return { success: false, error: "Unauthorized", customers: [], total: 0 };
    }

    const take = params?.limit || 20;
    const page = params?.page || 1;
    const skip = (page - 1) * take;

    const where: any = {
      role: "CUSTOMER",
    };

    if (params?.query && params.query.trim()) {
      const q = params.query.trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { phone: { contains: q, mode: "insensitive" } },
        { email: { contains: q, mode: "insensitive" } },
      ];
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          blocked: true,
          createdAt: true,
          _count: {
            select: { orders: true },
          },
          orders: {
            select: {
              total: true,
              status: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
        take,
        skip,
      }),
      db.user.count({ where }),
    ]);

    const mapped = users.map((u) => {
      const deliveredOrders = u.orders.filter((o) => o.status === "DELIVERED");
      const totalSpend = deliveredOrders.reduce((acc, o) => acc + o.total, 0);

      return {
        id: u.id,
        name: u.name || "Customer",
        email: u.email?.includes("@khelnabazar.user") ? null : u.email,
        phone: u.phone,
        blocked: u.blocked,
        createdAt: u.createdAt,
        orderCount: u._count.orders,
        totalSpend,
      };
    });

    return { success: true, customers: mapped, total };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to load customers", customers: [], total: 0 };
  }
}

export async function toggleCustomerBlockAction(userId: string, blocked: boolean) {
  try {
    const session = await auth();
    if (!session?.user || !isAdminRole(session.user.role)) {
      return { success: false, error: "Unauthorized: Admin privileges required." };
    }

    await db.user.update({
      where: { id: userId },
      data: { blocked },
    });

    revalidatePath("/admin/customers");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to update customer status" };
  }
}
