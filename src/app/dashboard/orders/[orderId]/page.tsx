import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getOrderById } from "@/server/services/order-service";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Package,
  Truck,
  MapPin,
  Clock,
  ShieldCheck,
  Phone,
  MessageCircle,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
} from "lucide-react";

interface OrderDetailPageProps {
  params: Promise<{ orderId: string }>;
}

export default async function CustomerOrderDetailPage({ params }: OrderDetailPageProps) {
  const { orderId } = await params;
  const session = await auth();

  if (!session?.user?.id) {
    redirect(`/login?next=/dashboard/orders/${orderId}`);
  }

  const order = await getOrderById(orderId);

  // Strict ownership check (IDOR Protection):
  // Customer can only view orders owned by their account.
  if (!order || order.userId !== session.user.id) {
    notFound();
  }

  const steps = [
    { label: "Placed", key: "PENDING_CONFIRMATION" },
    { label: "Confirmed", key: "CONFIRMED" },
    { label: "Packed", key: "PACKED" },
    { label: "Shipped", key: "SHIPPED" },
    { label: "Delivered", key: "DELIVERED" },
  ];

  const statusOrder = [
    "PENDING_CONFIRMATION",
    "CONFIRMED",
    "PROCESSING",
    "PACKED",
    "SHIPPED",
    "OUT_FOR_DELIVERY",
    "DELIVERED",
  ];

  const currentIdx = statusOrder.indexOf(order.status);

  return (
    <div className="space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
        <Link
          href="/dashboard/orders"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to All Orders</span>
        </Link>
        <span className="font-mono text-xs font-bold text-[var(--primary)]">
          #{order.orderNumber}
        </span>
      </div>

      {/* Main Order Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading font-black text-2xl text-[var(--text-primary)]">
              Order #{order.orderNumber}
            </h1>
            <p className="text-xs text-[var(--text-muted)] mt-0.5">
              Placed on {new Date(order.placedAt).toLocaleString("en-GB")} &bull;{" "}
              Payment: {order.paymentMethod.replace(/_/g, " ")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-black px-3.5 py-1 rounded-full uppercase tracking-wider ${
                order.status === "DELIVERED"
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : order.status === "SHIPPED"
                  ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                  : order.status === "CANCELLED"
                  ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                  : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
              }`}
            >
              {order.status.replace(/_/g, " ")}
            </span>
          </div>
        </div>

        {/* Mandatory Inspection Advisory Card */}
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-start gap-3 text-xs">
          <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-bold text-emerald-800 dark:text-emerald-300">
              Mandatory Delivery Inspection Policy
            </p>
            <p className="text-[11px] text-[var(--text-muted)] leading-relaxed">
              Please inspect the parcel contents in front of the courier before accepting and paying. If a manufacturing defect or transit damage is detected upon delivery, you may refuse the package for a full refund. No change-of-mind refunds apply after acceptance.
            </p>
          </div>
        </div>

        {/* Fulfillment Stepper */}
        {order.status !== "CANCELLED" && order.status !== "RETURNED" && (
          <div className="py-4">
            <div className="grid grid-cols-5 gap-2 text-center">
              {steps.map((st, i) => {
                const isCompleted = currentIdx >= statusOrder.indexOf(st.key);
                return (
                  <div key={st.key} className="space-y-2">
                    <div
                      className={`h-2 rounded-full transition-colors ${
                        isCompleted ? "bg-[var(--primary)]" : "bg-[var(--surface-container-high)]"
                      }`}
                    />
                    <span
                      className={`text-[10px] font-bold block ${
                        isCompleted ? "text-[var(--text-primary)]" : "text-[var(--text-muted)]"
                      }`}
                    >
                      {st.label}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Items Snapshot */}
        <div className="space-y-3 pt-2">
          <h3 className="font-heading font-black text-sm text-[var(--text-primary)] uppercase tracking-wider">
            Parcel Items ({order.items.length})
          </h3>
          <div className="divide-y divide-[var(--border)] border border-[var(--border)] rounded-2xl overflow-hidden bg-[var(--surface-container-low)]">
            {order.items.map((it) => (
              <div key={it.id || it.variantId} className="p-4 flex items-center justify-between text-xs">
                <div className="space-y-0.5">
                  <p className="font-bold text-[var(--text-primary)]">{it.name}</p>
                  <p className="text-[11px] text-[var(--text-muted)]">
                    {it.title} &bull; Quantity: {it.quantity} &times; {formatPrice(it.price)}
                  </p>
                </div>
                <span className="font-black text-sm text-[var(--text-primary)]">
                  {formatPrice((it.price || 0) * it.quantity)}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Order Financials & Delivery Details Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-[var(--border)] text-xs">
          {/* Shipping Address */}
          <div className="p-4 rounded-2xl bg-[var(--surface-container-low)] border border-[var(--border)] space-y-2">
            <div className="flex items-center gap-2 font-bold text-[var(--text-primary)]">
              <MapPin className="w-4 h-4 text-[var(--primary)]" />
              <span>Delivery Address</span>
            </div>
            <p className="font-medium text-[var(--text-primary)]">{order.shippingAddress?.fullName}</p>
            <p className="text-[var(--text-muted)]">{order.shippingAddress?.phone}</p>
            <p className="text-[var(--text-primary)] leading-relaxed">
              {order.shippingAddress?.line1}, {order.shippingAddress?.city}
            </p>
            <p className="text-[11px] text-[var(--text-muted)]">
              Division: {order.shippingAddress?.division} &bull; Zone: {order.deliveryZone}
            </p>
          </div>

          {/* Pricing Breakdown */}
          <div className="p-4 rounded-2xl bg-[var(--surface-container-low)] border border-[var(--border)] space-y-2">
            <div className="flex items-center gap-2 font-bold text-[var(--text-primary)]">
              <Package className="w-4 h-4 text-[var(--primary)]" />
              <span>Payment Breakdown</span>
            </div>
            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between text-[var(--text-muted)]">
                <span>Subtotal:</span>
                <span>{formatPrice(order.subtotal)}</span>
              </div>
              <div className="flex justify-between text-[var(--text-muted)]">
                <span>Shipping Fee:</span>
                <span>{formatPrice(order.shippingFee)}</span>
              </div>
              {order.discount > 0 && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount:</span>
                  <span>-{formatPrice(order.discount)}</span>
                </div>
              )}
              {order.giftWrapFee > 0 && (
                <div className="flex justify-between text-purple-600 font-bold">
                  <span>Gift Wrapping:</span>
                  <span>+{formatPrice(order.giftWrapFee)}</span>
                </div>
              )}
              <div className="flex justify-between text-sm font-black pt-2 border-t border-[var(--border)] text-[var(--text-primary)]">
                <span>Grand Total:</span>
                <span className="text-[var(--primary)]">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Courier & Tracking Info (if dispatched) */}
        {order.trackingNumber && (
          <div className="p-4 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2.5">
              <Truck className="w-5 h-5 text-blue-600 shrink-0" />
              <div>
                <p className="font-bold text-blue-900 dark:text-blue-300">
                  Carrier: {order.carrier || "Courier Partner"}
                </p>
                <p className="text-[11px] font-mono text-[var(--text-muted)]">
                  Tracking ID: {order.trackingNumber}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Helpline */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-[var(--text-muted)] border-t border-[var(--border)]">
          <span>Questions about this order? Contact our helpline:</span>
          <div className="flex items-center gap-3">
            <a href="tel:01712039707" className="font-bold text-[var(--text-primary)] hover:underline flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>01712-039707</span>
            </a>
            <a
              href="https://wa.me/8801712039707"
              target="_blank"
              rel="noreferrer"
              className="font-bold text-emerald-600 hover:underline flex items-center gap-1"
            >
              <MessageCircle className="w-3.5 h-3.5" />
              <span>WhatsApp</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
