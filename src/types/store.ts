/**
 * Khelna Bazar - Core Domain & Store Types
 *
 * Single source of type definitions across Storefront and Admin dashboards.
 * Independent of mock data.
 */

export type OrderStatus =
  | "PENDING_CONFIRMATION"
  | "CONFIRMED"
  | "PROCESSING"
  | "PACKED"
  | "SHIPPED"
  | "OUT_FOR_DELIVERY"
  | "DELIVERED"
  | "CANCELLED"
  | "RETURNED";

export type CodStatus = "UNCOLLECTED" | "COLLECTED" | "DISCREPANCY" | "REFUNDED";

export type PaymentMethod = "CASH_ON_DELIVERY" | "BKASH" | "NAGAD";

export interface ToyVariant {
  id: string;
  sku: string;
  title: string;
  price: number;
  comparePrice?: number | null;
  stock: number;
  lowStockThreshold?: number;
  barcode?: string | null;
  imageUrl?: string | null;
}

export interface ToyAttribute {
  name: string;
  value: string;
}

export interface ToyProduct {
  id: string;
  name: string;
  slug: string;
  brand: string;
  brandId?: string | null;
  category: string;
  categorySlug: string;
  shortDesc: string;
  descriptionHtml: string;
  basePrice: number;
  comparePrice?: number | null;
  ratingAvg: number;
  ratingCount: number;
  soldCount: number;
  isFeatured: boolean;
  isDeal: boolean;
  stock: number;
  images: string[];
  minAgeMonths: number;
  maxAgeMonths: number;
  material?: string | null;
  batteryInfo?: string | null;
  chokingHazard: boolean;
  chokingWarning?: string | null;
  certifications?: string[];
  variants: ToyVariant[];
  attributes: ToyAttribute[];
  createdAt?: string | Date;
}

export interface StoreCategory {
  id: string;
  name: string;
  slug: string;
  description?: string | null;
  image?: string | null;
  banner?: string | null;
  itemCount: number;
  isFeatured?: boolean;
  parentId?: string | null;
  children?: { name: string; slug: string }[];
}

export interface StoreBrand {
  id: string;
  name: string;
  slug: string;
  logo?: string | null;
  description?: string | null;
  productCount?: number;
}

export interface OrderItemSnapshot {
  id?: string;
  productId: string;
  variantId: string;
  name: string;
  title: string;
  price: number;
  quantity: number;
  image?: string;
  sku?: string;
  giftWrap?: boolean;
  lineTotal?: number;
}

export interface OrderEventEntry {
  id: string;
  orderId: string;
  type: string;
  message: string;
  actorName?: string | null;
  createdAt: string | Date;
}

export interface StoreOrder {
  id: string;
  orderNumber: string;
  userId?: string | null;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  status: OrderStatus;
  codStatus: CodStatus;
  paymentMethod: PaymentMethod;
  subtotal: number;
  discount: number;
  shippingFee: number;
  giftWrapFee: number;
  tax: number;
  total: number;
  currency: string;
  deliveryZone: string;
  shippingAddress: {
    fullName: string;
    phone: string;
    line1: string;
    city: string;
    division: string;
    district?: string;
    postalCode?: string;
    instructions?: string;
  };
  trackingNumber?: string | null;
  carrier?: string | null;
  customerNotes?: string | null;
  adminNotes?: string | null;
  placedAt: string | Date;
  updatedAt: string | Date;
  items: OrderItemSnapshot[];
  events: OrderEventEntry[];
  // Mandatory Inspection Compliance & MFS Verification
  inspectionAcknowledged?: boolean;
  inspectionAcknowledgedAt?: string | Date | null;
  mfsSenderNumber?: string | null;
  mfsTrxId?: string | null;
  paymentStatus?: string;
  paymentVerifiedAt?: string | Date | null;
  paymentVerifiedBy?: string | null;
  paymentRejectReason?: string | null;
  refundStatus?: string;
  refundAmount?: number | null;
  refundMethod?: string | null;
  refundReference?: string | null;
  refundDate?: string | Date | null;
  // Legacy / helper payment details
  paymentDetails?: {
    senderPhone?: string;
    trxId?: string;
    verifiedAt?: string | null;
    verifiedBy?: string | null;
    verificationStatus?: "PENDING" | "VERIFIED" | "REJECTED";
  } | null;
}

export interface StoreCoupon {
  id: string;
  code: string;
  discountType: "PERCENTAGE" | "FIXED" | "FREE_SHIPPING";
  discountValue: number;
  minSpend: number;
  maxDiscount?: number | null;
  usageLimit: number;
  usageCount: number;
  perUserLimit?: number;
  active: boolean;
  expiresAt: string | Date;
  startsAt?: string | Date;
}

export interface StoreBanner {
  id: string;
  placement: "HERO" | "PROMO_RIGHT_TOP" | "PROMO_RIGHT_BOTTOM" | "STRIP";
  heading: string;
  text?: string | null;
  ctaLabel?: string | null;
  ctaUrl: string;
  desktopImage: string;
  mobileImage?: string | null;
  active: boolean;
  sortOrder: number;
}

export interface StoreSettings {
  storeName: string;
  legalName: string;
  hotline: string;
  supportEmail: string;
  address: string;
  tradeLicense?: string;
  binNumber?: string;
  tinNumber?: string;
  insideDhakaRate: number;
  outsideDhakaRate: number;
  expressDhakaRate: number;
  freeShippingThreshold: number;
  giftWrapFee: number;
  announcementText: string;
  announcementActive: boolean;
  enableCod: boolean;
  enableBkash: boolean;
  enableNagad: boolean;
  bkashMerchantNumber?: string;
  nagadMerchantNumber?: string;
  maintenanceMode: boolean;
  facebookUrl?: string;
  instagramUrl?: string;
  youtubeUrl?: string;
  tiktokUrl?: string;
}

export interface StockMovementEntry {
  id: string;
  variantId: string;
  delta: number;
  reason: "RESTOCK" | "ORDER_FULFILLMENT" | "DAMAGE" | "RETURN_RESTOCK" | "AUDIT";
  actorName: string;
  orderId?: string | null;
  createdAt: string | Date;
}

export interface AuditLogEntry {
  id: string;
  actorId?: string | null;
  actorEmail?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  ip?: string | null;
  createdAt: string | Date;
}
