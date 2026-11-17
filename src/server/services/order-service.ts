import { db } from "@/lib/db";
import { StoreOrder, OrderStatus, CodStatus, PaymentMethod } from "@/types/store";

export interface OrderFilters {
  userId?: string;
  status?: OrderStatus;
  codStatus?: CodStatus;
  paymentMethod?: PaymentMethod;
  search?: string;
  limit?: number;
  page?: number;
}

export async function getOrders(filters?: OrderFilters): Promise<{ orders: StoreOrder[]; total: number }> {
  try {
    const where: any = {};

    if (filters?.userId) {
      where.userId = filters.userId;
    }

    if (filters?.status) {
      where.status = filters.status;
    }

    if (filters?.codStatus) {
      where.codStatus = filters.codStatus;
    }

    if (filters?.paymentMethod) {
      where.paymentMethod = filters.paymentMethod;
    }

    if (filters?.search && filters.search.trim().length > 0) {
      const q = filters.search.trim();
      where.OR = [
        { orderNumber: { contains: q, mode: "insensitive" } },
        { customerPhone: { contains: q } },
        { customerName: { contains: q, mode: "insensitive" } },
      ];
    }

    const take = filters?.limit || 50;
    const skip = ((filters?.page || 1) - 1) * take;

    const [dbOrders, total] = await Promise.all([
      db.order.findMany({
        where,
        include: {
          items: true,
          events: {
            orderBy: { createdAt: "desc" },
          },
        },
        orderBy: {
          placedAt: "desc",
        },
        take,
        skip,
      }),
      db.order.count({ where }),
    ]);

    const mapped: StoreOrder[] = dbOrders.map((o) => {
      const addr = typeof o.shippingAddress === "object" && o.shippingAddress !== null
        ? (o.shippingAddress as Record<string, unknown>)
        : {};

      return {
        id: o.id,
        orderNumber: o.orderNumber,
        userId: o.userId,
        customerName: o.customerName,
        customerEmail: o.customerEmail,
        customerPhone: o.customerPhone,
        status: o.status as OrderStatus,
        codStatus: o.codStatus as CodStatus,
        paymentMethod: o.paymentMethod as PaymentMethod,
        subtotal: o.subtotal,
        discount: o.discount,
        shippingFee: o.shippingFee,
        giftWrapFee: o.giftWrapFee,
        tax: o.tax,
        total: o.total,
        currency: o.currency,
        deliveryZone: o.deliveryZone,
        shippingAddress: {
          fullName: String(addr.fullName || o.customerName),
          phone: String(addr.phone || o.customerPhone),
          line1: String(addr.line1 || addr.address || ""),
          city: String(addr.city || addr.cityArea || ""),
          division: String(addr.division || ""),
          district: String(addr.district || addr.division || ""),
          postalCode: String(addr.postalCode || ""),
          instructions: String(addr.instructions || ""),
        },
        trackingNumber: o.trackingNumber,
        carrier: o.carrier,
        customerNotes: o.customerNotes,
        adminNotes: o.adminNotes,
        inspectionAcknowledged: (o as any).inspectionAcknowledged ?? false,
        inspectionAcknowledgedAt: (o as any).inspectionAcknowledgedAt ?? null,
        mfsSenderNumber: (o as any).mfsSenderNumber ?? null,
        mfsTrxId: (o as any).mfsTrxId ?? null,
        paymentStatus: (o as any).paymentStatus ?? "PENDING",
        paymentVerifiedAt: (o as any).paymentVerifiedAt ?? null,
        paymentVerifiedBy: (o as any).paymentVerifiedBy ?? null,
        paymentRejectReason: (o as any).paymentRejectReason ?? null,
        refundStatus: (o as any).refundStatus ?? "NONE",
        refundAmount: (o as any).refundAmount ?? null,
        refundMethod: (o as any).refundMethod ?? null,
        refundReference: (o as any).refundReference ?? null,
        refundDate: (o as any).refundDate ?? null,
        placedAt: o.placedAt,
        updatedAt: o.updatedAt,
        items: o.items.map((it) => ({
          id: it.id,
          productId: it.productId || "",
          variantId: it.variantId || "",
          name: it.nameSnapshot,
          title: it.nameSnapshot,
          price: it.unitPrice,
          quantity: it.quantity,
          image: it.imageSnapshot || undefined,
          sku: it.skuSnapshot,
          giftWrap: it.giftWrap,
          lineTotal: it.lineTotal,
        })),
        events: o.events.map((ev) => ({
          id: ev.id,
          orderId: ev.orderId,
          type: ev.type,
          message: ev.message,
          actorName: ev.actorName,
          createdAt: ev.createdAt,
        })),
      };
    });

    return { orders: mapped, total };
  } catch (error) {
    console.error("Database query error in getOrders:", (error as Error).message);
    return { orders: [], total: 0 };
  }
}

export async function getOrderById(orderId: string): Promise<StoreOrder | null> {
  try {
    const o = await db.order.findFirst({
      where: {
        OR: [{ id: orderId }, { orderNumber: orderId }],
      },
      include: {
        items: true,
        events: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!o) return null;

    const addr = typeof o.shippingAddress === "object" && o.shippingAddress !== null
      ? (o.shippingAddress as Record<string, unknown>)
      : {};

    return {
      id: o.id,
      orderNumber: o.orderNumber,
      userId: o.userId,
      customerName: o.customerName,
      customerEmail: o.customerEmail,
      customerPhone: o.customerPhone,
      status: o.status as OrderStatus,
      codStatus: o.codStatus as CodStatus,
      paymentMethod: o.paymentMethod as PaymentMethod,
      subtotal: o.subtotal,
      discount: o.discount,
      shippingFee: o.shippingFee,
      giftWrapFee: o.giftWrapFee,
      tax: o.tax,
      total: o.total,
      currency: o.currency,
      deliveryZone: o.deliveryZone,
      shippingAddress: {
        fullName: String(addr.fullName || o.customerName),
        phone: String(addr.phone || o.customerPhone),
        line1: String(addr.line1 || addr.address || ""),
        city: String(addr.city || addr.cityArea || ""),
        division: String(addr.division || ""),
        district: String(addr.district || addr.division || ""),
        postalCode: String(addr.postalCode || ""),
        instructions: String(addr.instructions || ""),
      },
      trackingNumber: o.trackingNumber,
      carrier: o.carrier,
      customerNotes: o.customerNotes,
      adminNotes: o.adminNotes,
      inspectionAcknowledged: (o as any).inspectionAcknowledged ?? false,
      inspectionAcknowledgedAt: (o as any).inspectionAcknowledgedAt ?? null,
      mfsSenderNumber: (o as any).mfsSenderNumber ?? null,
      mfsTrxId: (o as any).mfsTrxId ?? null,
      paymentStatus: (o as any).paymentStatus ?? "PENDING",
      paymentVerifiedAt: (o as any).paymentVerifiedAt ?? null,
      paymentVerifiedBy: (o as any).paymentVerifiedBy ?? null,
      paymentRejectReason: (o as any).paymentRejectReason ?? null,
      refundStatus: (o as any).refundStatus ?? "NONE",
      refundAmount: (o as any).refundAmount ?? null,
      refundMethod: (o as any).refundMethod ?? null,
      refundReference: (o as any).refundReference ?? null,
      refundDate: (o as any).refundDate ?? null,
      placedAt: o.placedAt,
      updatedAt: o.updatedAt,
      items: o.items.map((it) => ({
        id: it.id,
        productId: it.productId || "",
        variantId: it.variantId || "",
        name: it.nameSnapshot,
        title: it.nameSnapshot,
        price: it.unitPrice,
        quantity: it.quantity,
        image: it.imageSnapshot || undefined,
        sku: it.skuSnapshot,
        giftWrap: it.giftWrap,
        lineTotal: it.lineTotal,
      })),
      events: o.events.map((ev) => ({
        id: ev.id,
        orderId: ev.orderId,
        type: ev.type,
        message: ev.message,
        actorName: ev.actorName,
        createdAt: ev.createdAt,
      })),
    };
  } catch (error) {
    console.error("Database query error in getOrderById:", (error as Error).message);
    return null;
  }
}

/**
 * Public order tracking requires BOTH order number AND phone number
 * to prevent IDOR / exposing orders to unauthorized visitors.
 */
export async function getOrderByNumberAndPhone(orderNumber: string, phone: string): Promise<StoreOrder | null> {
  const cleanNumber = (orderNumber || "").trim().toUpperCase();
  const cleanPhone = (phone || "").replace(/[\s\-()]/g, "");

  if (!cleanNumber || !cleanPhone) return null;

  try {
    const o = await db.order.findFirst({
      where: {
        orderNumber: cleanNumber,
        customerPhone: {
          contains: cleanPhone.slice(-10), // match 10-digit suffix to handle +8801 vs 01
        },
      },
      include: {
        items: true,
        events: {
          orderBy: { createdAt: "asc" },
        },
      },
    });

    if (!o) return null;

    return getOrderById(o.id);
  } catch (error) {
    console.error("Tracking lookup error:", (error as Error).message);
    return null;
  }
}

/**
 * Calculates live Admin KPIs directly from PostgreSQL.
 */
export async function getAdminKPIs() {
  try {
    const [totalOrders, grossAgg, reconciledAgg, pendingOrdersCount] = await Promise.all([
      db.order.count(),
      db.order.aggregate({
        _sum: { total: true },
      }),
      db.order.aggregate({
        where: { codStatus: "COLLECTED" },
        _sum: { total: true },
      }),
      db.order.count({
        where: { status: "PENDING_CONFIRMATION" },
      }),
    ]);

    const grossSales = grossAgg._sum.total || 0;
    const reconciledCash = reconciledAgg._sum.total || 0;
    const pendingCashInTransit = grossSales - reconciledCash;

    return {
      totalOrders,
      grossSales,
      reconciledCash,
      pendingCashInTransit: Math.max(0, pendingCashInTransit),
      pendingOrdersCount,
    };
  } catch (error) {
    console.error("Failed to calculate Admin KPIs:", (error as Error).message);
    return {
      totalOrders: 0,
      grossSales: 0,
      reconciledCash: 0,
      pendingCashInTransit: 0,
      pendingOrdersCount: 0,
    };
  }
}
