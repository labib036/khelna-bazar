"use server";

import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { isStaffRole } from "@/lib/authorization-guards";

export async function getSalesReportAction(startDate?: string, endDate?: string) {
  try {
    const session = await auth();
    if (!session?.user || !isStaffRole(session.user.role)) {
      return { success: false, error: "Unauthorized", report: null };
    }

    const where: any = {};
    if (startDate || endDate) {
      where.placedAt = {};
      if (startDate) where.placedAt.gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        where.placedAt.lte = end;
      }
    }

    const orders = await db.order.findMany({
      where,
      select: {
        id: true,
        total: true,
        subtotal: true,
        discount: true,
        shippingFee: true,
        status: true,
        codStatus: true,
        paymentMethod: true,
        refundStatus: true,
        refundAmount: true,
        placedAt: true,
        items: {
          select: {
            nameSnapshot: true,
            quantity: true,
            lineTotal: true,
          },
        },
      },
      orderBy: { placedAt: "desc" },
    });

    const totalOrders = orders.length;
    const deliveredOrders = orders.filter((o) => o.status === "DELIVERED");
    const cancelledOrders = orders.filter((o) => o.status === "CANCELLED");
    const returnedOrders = orders.filter((o) => o.status === "RETURNED");

    const grossSales = deliveredOrders.reduce((sum, o) => sum + o.total, 0);
    const reconciledCash = orders
      .filter((o) => o.codStatus === "COLLECTED" || o.paymentMethod !== "CASH_ON_DELIVERY")
      .reduce((sum, o) => sum + o.total, 0);
    const pendingCash = orders
      .filter((o) => o.codStatus === "UNCOLLECTED" && o.status !== "CANCELLED" && o.status !== "RETURNED")
      .reduce((sum, o) => sum + o.total, 0);
    const totalRefunds = orders.reduce((sum, o) => sum + (o.refundAmount || 0), 0);

    // Aggregate best selling items
    const itemMap = new Map<string, { name: string; quantity: number; revenue: number }>();
    for (const order of deliveredOrders) {
      for (const item of order.items) {
        const existing = itemMap.get(item.nameSnapshot) || { name: item.nameSnapshot, quantity: 0, revenue: 0 };
        existing.quantity += item.quantity;
        existing.revenue += item.lineTotal;
        itemMap.set(item.nameSnapshot, existing);
      }
    }

    const topProducts = Array.from(itemMap.values())
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 10);

    return {
      success: true,
      report: {
        totalOrders,
        deliveredCount: deliveredOrders.length,
        cancelledCount: cancelledOrders.length,
        returnedCount: returnedOrders.length,
        grossSales,
        reconciledCash,
        pendingCash,
        totalRefunds,
        topProducts,
      },
    };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed to generate report", report: null };
  }
}
