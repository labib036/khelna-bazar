"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { StatCard } from "@/components/ui/stat-card";
import { StatusPill } from "@/components/ui/status-pill";
import { AdminCharts } from "@/components/admin/admin-charts";
import { updateOrderStatus, updateCodStatus } from "@/server/actions/order-actions";
import { StoreOrder } from "@/types/store";
import {
  TrendingUp,
  ShoppingBag,
  Truck,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Plus,
  PhoneCall,
  ShieldAlert,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";

interface AdminDashboardClientProps {
  initialOrders: StoreOrder[];
  lowStockItems: Array<{ id: string; name: string; sku: string; stock: number }>;
}

export function AdminDashboardClient({
  initialOrders,
  lowStockItems,
}: AdminDashboardClientProps) {
  const [orders, setOrders] = useState<StoreOrder[]>(initialOrders);
  const [period, setPeriod] = useState<"7d" | "30d" | "all">("30d");
  const [isPending, startTransition] = useTransition();

  // Filter orders by period
  const periodFilteredOrders = orders.filter((o) => {
    if (period === "all") return true;
    const placed = new Date(o.placedAt).getTime();
    const days = period === "7d" ? 7 : 30;
    return Date.now() - placed <= days * 86400000;
  });

  const grossCodSales = periodFilteredOrders
    .filter((o) => o.status !== "CANCELLED")
    .reduce((sum, o) => sum + o.total, 0);

  const cashReconciled = periodFilteredOrders
    .filter((o) => o.codStatus === "COLLECTED")
    .reduce((sum, o) => sum + o.total, 0);

  const pendingCashInTransit = periodFilteredOrders
    .filter((o) => o.codStatus === "UNCOLLECTED" && o.status !== "CANCELLED")
    .reduce((sum, o) => sum + o.total, 0);

  const pendingOrders = orders.filter((o) => o.status === "PENDING_CONFIRMATION");
  const firstPending = pendingOrders[0];

  // Unverified MFS payments (bKash/Nagad manual orders)
  const unverifiedPayments = orders.filter(
    (o) =>
      o.paymentMethod !== "CASH_ON_DELIVERY" &&
      (o.status === "PENDING_CONFIRMATION" || o.status === "CONFIRMED")
  );

  const handleQuickConfirm = (orderId: string, orderNumber: string) => {
    startTransition(async () => {
      const res = await updateOrderStatus(orderId, "CONFIRMED", "Operations Manager");
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: "CONFIRMED" } : o))
        );
        toast.success(`Order ${orderNumber} confirmed! Sent to fulfillment.`);
      } else {
        toast.error(res.error || "Failed to confirm order");
      }
    });
  };

  const handleQuickReconcile = (orderId: string, orderNumber: string) => {
    startTransition(async () => {
      const res = await updateCodStatus(orderId, "COLLECTED", undefined, "Courier Remittance");
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, codStatus: "COLLECTED" } : o))
        );
        toast.success(`COD cash collected and recorded for ${orderNumber}!`);
      } else {
        toast.error(res.error || "Failed to reconcile cash");
      }
    });
  };

  const todayDateString = new Intl.DateTimeFormat("en-GB", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date());

  return (
    <div className="space-y-8">
      {/* Top Header & Fast Filter */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[var(--border)]">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[var(--success)] animate-pulse" />
            <span className="text-xs font-bold text-primary uppercase tracking-wider">
              Real-Time Operations Console
            </span>
            <span className="text-xs text-[var(--text-muted)] flex items-center gap-1 ml-2">
              <Calendar className="w-3.5 h-3.5" />
              <span>{todayDateString}</span>
            </span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-[var(--text-primary)] mt-1">
            Store &amp; COD Revenue Overview
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
            PostgreSQL-backed fulfillment workflow, courier cash tracking, and business metrics.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link href="/admin/products">
            <Button
              variant="primary"
              size="sm"
              className="text-xs font-bold shadow-xs flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Toy</span>
            </Button>
          </Link>

          <div className="flex rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] p-1 text-xs font-bold shadow-xs">
            {(["7d", "30d", "all"] as const).map((p) => (
              <button
                key={p}
                type="button"
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-xl transition-colors cursor-pointer ${
                  period === p
                    ? "bg-primary text-on-primary shadow-xs"
                    : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                }`}
              >
                {p === "7d" ? "7 Days" : p === "30d" ? "30 Days" : "All Time"}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 4 Spacious KPI Cards with StatCard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <StatCard
          title="Gross Sales"
          value={formatPrice(grossCodSales)}
          change={18.4}
          changeLabel={`across ${periodFilteredOrders.length} orders`}
          sparklineData={[15, 22, 28, 24, 38, 42, 55, 60]}
          icon={<TrendingUp className="w-5 h-5 text-primary" />}
        />

        <StatCard
          title="Cash Reconciled (In Hand)"
          value={formatPrice(cashReconciled)}
          changeLabel="Collected from couriers"
          variant="mint"
          sparklineData={[10, 15, 20, 25, 30, 45, 50]}
          icon={<CheckCircle2 className="w-5 h-5 text-emerald-500" />}
        />

        <StatCard
          title="Pending Cash in Transit"
          value={formatPrice(pendingCashInTransit)}
          changeLabel="Awaiting courier settlement"
          variant="sun"
          sparklineData={[20, 25, 22, 28, 30, 26, 24]}
          icon={<Truck className="w-5 h-5 text-amber-500" />}
        />

        <StatCard
          title="Total Orders Placed"
          value={periodFilteredOrders.length}
          change={12.1}
          changeLabel="Bangladesh Nationwide"
          sparklineData={[5, 8, 12, 10, 16, 22, 25]}
          icon={<ShoppingBag className="w-5 h-5 text-purple-500" />}
        />
      </div>

      {/* Needs Attention Panel */}
      {(firstPending || unverifiedPayments.length > 0) && (
        <div className="space-y-3">
          {firstPending && (
            <div className="p-5 rounded-3xl bg-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-2xl bg-amber-500 text-white shrink-0 shadow-xs">
                  <PhoneCall className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="font-heading font-black text-sm text-[var(--text-primary)]">
                    {pendingOrders.length} Order{pendingOrders.length > 1 ? "s" : ""} Awaiting Phone Confirmation
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Order <strong>{firstPending.orderNumber}</strong> by {firstPending.customerName} ({firstPending.customerPhone}) was placed recently. Confirm address before dispatching courier.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  disabled={isPending}
                  onClick={() => handleQuickConfirm(firstPending.id, firstPending.orderNumber)}
                  className="px-4 py-2 rounded-xl bg-amber-500 hover:brightness-95 text-white text-xs font-bold shadow-xs cursor-pointer transition-colors disabled:opacity-50"
                >
                  Confirm via Phone
                </button>
                <Link href="/admin/orders">
                  <Button variant="outline" size="sm" className="text-xs font-bold">
                    View Orders
                  </Button>
                </Link>
              </div>
            </div>
          )}

          {unverifiedPayments.length > 0 && (
            <div className="p-5 rounded-3xl bg-purple-500/10 border border-purple-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
              <div className="flex items-center gap-3.5">
                <div className="p-3 rounded-2xl bg-purple-600 text-white shrink-0 shadow-xs">
                  <ShieldAlert className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-heading font-black text-sm text-[var(--text-primary)]">
                    {unverifiedPayments.length} Manual bKash / Nagad Payment{unverifiedPayments.length > 1 ? "s" : ""} Awaiting Verification
                  </h4>
                  <p className="text-xs text-[var(--text-muted)] mt-0.5">
                    Customer provided TrxID in order notes. Verify sender number &amp; transaction ID in Admin Orders.
                  </p>
                </div>
              </div>
              <Link href="/admin/orders">
                <Button variant="primary" size="sm" className="bg-purple-600 hover:bg-purple-700 text-xs font-bold">
                  Verify Payments
                </Button>
              </Link>
            </div>
          )}
        </div>
      )}

      {/* Visual Analytics with Recharts */}
      <AdminCharts orders={periodFilteredOrders} />

      {/* 2-Column Section: Orders & Low Stock */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column (8 cols): Recent Orders */}
        <div className="lg:col-span-8 bg-[var(--surface-elevated)] rounded-3xl border border-[var(--border)] p-6 sm:p-7 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[var(--border)]">
            <div>
              <h2 className="font-heading font-black text-lg text-[var(--text-primary)]">
                Recent Orders
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Fulfillment workflow and courier cash collection tracking.
              </p>
            </div>
            <Link href="/admin/orders">
              <Button
                variant="outline"
                size="sm"
                className="text-xs font-bold hover:border-primary hover:text-primary"
              >
                <span>Full Orders Console</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--text-muted)] font-bold uppercase tracking-wider text-[11px]">
                  <th className="pb-3.5">Order Number</th>
                  <th className="pb-3.5">Customer</th>
                  <th className="pb-3.5">Items</th>
                  <th className="pb-3.5">Total</th>
                  <th className="pb-3.5">Status</th>
                  <th className="pb-3.5">COD</th>
                  <th className="pb-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-[var(--text-muted)]">
                      No orders placed in the database yet.
                    </td>
                  </tr>
                ) : (
                  orders.slice(0, 8).map((ord) => (
                    <tr key={ord.id} className="hover:bg-[var(--surface)] transition-colors">
                      <td className="py-4">
                        <span className="font-mono font-bold text-primary block text-xs">
                          {ord.orderNumber}
                        </span>
                        <span className="text-[11px] text-[var(--text-muted)]">
                          {new Date(ord.placedAt).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </td>

                      <td className="py-4">
                        <span className="font-bold text-[var(--text-primary)] block">
                          {ord.customerName}
                        </span>
                        <span className="text-[11px] text-[var(--text-muted)] block">{ord.customerPhone}</span>
                      </td>

                      <td className="py-4 max-w-[180px] truncate text-[var(--text-primary)] font-medium">
                        {ord.items?.map((it) => `${it.name} (x${it.quantity})`).join(", ") || "Toy"}
                      </td>

                      <td className="py-4 font-black text-[var(--text-primary)] text-sm">
                        {formatPrice(ord.total)}
                      </td>

                      <td className="py-4">
                        <StatusPill type="order" status={ord.status} />
                      </td>

                      <td className="py-4">
                        <StatusPill type="cod" status={ord.codStatus} />
                      </td>

                      <td className="py-4 text-right space-x-1.5 whitespace-nowrap">
                        {ord.status === "PENDING_CONFIRMATION" && (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleQuickConfirm(ord.id, ord.orderNumber)}
                            className="px-2.5 py-1 rounded-xl bg-primary text-on-primary font-bold text-[11px] hover:brightness-95 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                          >
                            Confirm
                          </button>
                        )}
                        {ord.status === "SHIPPED" && ord.codStatus === "UNCOLLECTED" && (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleQuickReconcile(ord.id, ord.orderNumber)}
                            className="px-2.5 py-1 rounded-xl bg-emerald-600 text-white font-bold text-[11px] hover:brightness-95 transition-colors cursor-pointer disabled:opacity-50 shadow-xs"
                          >
                            Cash Received
                          </button>
                        )}
                        <Link href="/admin/orders">
                          <button
                            type="button"
                            className="px-2.5 py-1 rounded-xl border border-[var(--border)] text-[var(--text-muted)] hover:text-[var(--text-primary)] font-semibold text-[11px] hover:bg-[var(--surface)] cursor-pointer"
                          >
                            View
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Right Column (4 cols): Low Stock Warnings */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[var(--surface-elevated)] rounded-3xl border border-[var(--border)] p-6 shadow-xs space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h3 className="font-heading font-black text-sm text-[var(--text-primary)] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-500" />
                <span>Low Stock Warnings</span>
              </h3>
              <span className="text-[10px] font-bold text-[var(--danger)] uppercase">Inventory</span>
            </div>

            <div className="space-y-3">
              {lowStockItems.length === 0 ? (
                <p className="text-xs text-[var(--text-muted)] py-4 text-center">
                  All inventory stock levels are healthy!
                </p>
              ) : (
                lowStockItems.slice(0, 6).map((item) => (
                  <div
                    key={item.id}
                    className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-between"
                  >
                    <div>
                      <span className="font-bold text-xs text-[var(--text-primary)] block">
                        {item.name}
                      </span>
                      <span className="text-[10px] text-[var(--danger)] font-bold">
                        Only {item.stock} unit{item.stock === 1 ? "" : "s"} left (SKU: {item.sku})
                      </span>
                    </div>
                    <Link href="/admin/inventory">
                      <button
                        type="button"
                        className="px-3 py-1.5 rounded-xl bg-rose-600 text-white text-[11px] font-bold hover:brightness-95 transition-colors cursor-pointer shadow-xs"
                      >
                        Restock
                      </button>
                    </Link>
                  </div>
                ))
              )}
            </div>

            <Link href="/admin/inventory" className="block pt-2">
              <Button variant="outline" size="sm" className="w-full text-xs font-bold">
                Open Full Inventory Ledger
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
