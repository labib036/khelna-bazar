"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { getCustomerOrders } from "@/server/actions/order-actions";
import { StoreOrder } from "@/types/store";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Package,
  MapPin,
  Sparkles,
  ArrowRight,
  Truck,
  Loader2,
  Phone,
  MessageCircle,
  ShoppingBag,
  Clock,
  CheckCircle2,
  ShieldCheck,
} from "lucide-react";

export default function CustomerDashboardPage() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status === "authenticated") {
      getCustomerOrders()
        .then((data: StoreOrder[]) => setOrders(data))
        .catch(() => {})
        .finally(() => setLoading(false));
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="p-12 text-center text-xs text-[var(--text-muted)] flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-[var(--primary)]" />
        <span>Loading your customer dashboard...</span>
      </div>
    );
  }

  const activeOrders = orders.filter(
    (o) => o.status !== "DELIVERED" && o.status !== "CANCELLED" && o.status !== "RETURNED"
  );
  const latestOrder = orders[0];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl border border-[var(--border)] p-6 sm:p-8 bg-gradient-to-r from-[var(--primary)]/15 via-[var(--surface)] to-amber-500/10 shadow-xs">
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 bg-[var(--surface)] px-3 py-1 rounded-full border border-[var(--border)] shadow-2xs text-xs font-bold">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Verified Customer Account</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
              Welcome, {user?.name?.split(" ")[0] || "Customer"}! 👋
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-xl">
              Manage your toy orders, check Cash on Delivery delivery progress, update your delivery address, and view receipts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Link href="/dashboard/orders">
              <Button variant="primary" size="sm" className="font-bold text-xs gap-1.5 shadow-xs">
                <Package className="w-4 h-4" />
                <span>My Orders ({orders.length})</span>
              </Button>
            </Link>
            <Link href="/">
              <Button variant="outline" size="sm" className="font-bold text-xs gap-1.5">
                <ShoppingBag className="w-4 h-4 text-[var(--primary)]" />
                <span>Browse Toys</span>
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Link
          href="/dashboard/orders"
          className="p-5 rounded-3xl bg-[var(--surface)] border border-[var(--border)] hover:border-[var(--primary)] transition-all shadow-xs group"
        >
          <div className="w-10 h-10 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center mb-3">
            <Package className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-[var(--text-muted)] block">Total Orders</span>
          <span className="font-heading font-black text-2xl text-[var(--text-primary)] mt-0.5 block group-hover:text-[var(--primary)]">
            {orders.length}
          </span>
        </Link>

        <Link
          href="/dashboard/orders"
          className="p-5 rounded-3xl bg-[var(--surface)] border border-[var(--border)] hover:border-blue-500 transition-all shadow-xs group"
        >
          <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center mb-3">
            <Truck className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-[var(--text-muted)] block">Active Deliveries</span>
          <span className="font-heading font-black text-2xl text-[var(--text-primary)] mt-0.5 block group-hover:text-blue-600">
            {activeOrders.length}
          </span>
        </Link>

        <Link
          href="/dashboard/addresses"
          className="p-5 rounded-3xl bg-[var(--surface)] border border-[var(--border)] hover:border-emerald-500 transition-all shadow-xs group"
        >
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center mb-3">
            <MapPin className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-[var(--text-muted)] block">Saved Addresses</span>
          <span className="font-heading font-black text-2xl text-[var(--text-primary)] mt-0.5 block group-hover:text-emerald-600">
            Manage
          </span>
        </Link>

        <Link
          href="/dashboard/rewards"
          className="p-5 rounded-3xl bg-[var(--surface)] border border-[var(--border)] hover:border-amber-500 transition-all shadow-xs group"
        >
          <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 flex items-center justify-center mb-3">
            <Sparkles className="w-5 h-5" />
          </div>
          <span className="text-xs font-bold text-[var(--text-muted)] block">Rewards</span>
          <span className="font-heading font-black text-2xl text-[var(--text-primary)] mt-0.5 block group-hover:text-amber-600">
            Coming Soon
          </span>
        </Link>
      </div>

      {/* Latest Active Order Preview */}
      {latestOrder && (
        <div className="p-6 sm:p-8 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border)]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shrink-0">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-heading font-black text-base text-[var(--text-primary)]">
                  Latest Order: #{latestOrder.orderNumber}
                </h3>
                <span className="text-xs text-[var(--text-muted)]">
                  Placed on {new Date(latestOrder.placedAt).toLocaleDateString("en-GB")} &bull;{" "}
                  {formatPrice(latestOrder.total)}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span
                className={`text-xs font-bold px-3 py-1 rounded-full ${
                  latestOrder.status === "DELIVERED"
                    ? "bg-emerald-500/15 text-emerald-600"
                    : latestOrder.status === "SHIPPED"
                    ? "bg-blue-500/15 text-blue-600"
                    : latestOrder.status === "CANCELLED"
                    ? "bg-rose-500/15 text-rose-600"
                    : "bg-amber-500/15 text-amber-600"
                }`}
              >
                {latestOrder.status.replace(/_/g, " ")}
              </span>
              <Link href={`/dashboard/orders/${latestOrder.id}`}>
                <Button variant="outline" size="sm" className="text-xs font-bold">
                  View Order
                </Button>
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-[var(--text-muted)] font-semibold block">Delivery Destination</span>
              <p className="font-bold text-[var(--text-primary)]">
                {latestOrder.shippingAddress?.line1}, {latestOrder.shippingAddress?.city}
              </p>
              <p className="text-[var(--text-muted)]">
                Division: {latestOrder.shippingAddress?.division} &bull; Zone: {latestOrder.deliveryZone}
              </p>
            </div>
            <div className="space-y-1">
              <span className="text-[var(--text-muted)] font-semibold block">Payment &amp; Inspection</span>
              <p className="font-bold text-[var(--text-primary)]">
                {latestOrder.paymentMethod.replace(/_/g, " ")}
              </p>
              <p className="text-emerald-600 dark:text-emerald-400 font-medium">
                &bull; Inspect product in front of delivery person before payment/acceptance
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Support Banner */}
      <div className="p-6 rounded-3xl bg-[var(--surface-container-high)] border border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h4 className="font-heading font-black text-sm text-[var(--text-primary)]">
            Need Help with an Order or Delivery?
          </h4>
          <p className="text-xs text-[var(--text-muted)]">
            Our hotline and WhatsApp customer care team is available to assist you.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <a
            href="tel:01712039707"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] text-xs font-bold hover:text-[var(--primary)] shadow-2xs"
          >
            <Phone className="w-3.5 h-3.5 text-[var(--primary)]" />
            <span>01712-039707</span>
          </a>
          <a
            href="https://wa.me/8801712039707"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 shadow-xs"
          >
            <MessageCircle className="w-3.5 h-3.5" />
            <span>WhatsApp</span>
          </a>
        </div>
      </div>
    </div>
  );
}
