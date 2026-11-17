"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { AdminLayout } from "@/components/admin/admin-layout";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  ShoppingBag,
  Truck,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  Plus,
  RefreshCw,
  PhoneCall,
  Loader2,
  Package,
} from "lucide-react";
import { toast } from "sonner";
import {
  getAdminKPIsAction,
  getAdminOrdersAction,
  updateOrderStatus,
  updateCodStatus,
} from "@/server/actions/order-actions";
import { getAdminProducts } from "@/server/actions/product-actions";
import { StoreOrder, ToyProduct } from "@/types/store";

export default function AdminDashboardPage() {
  const [period, setPeriod] = useState<"7d" | "30d" | "all">("30d");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [kpis, setKpis] = useState({
    totalOrders: 0,
    grossSales: 0,
    reconciledCash: 0,
    pendingCashInTransit: 0,
    pendingOrdersCount: 0,
  });
  const [lowStockProducts, setLowStockProducts] = useState<ToyProduct[]>([]);

  const loadDashboardData = async () => {
    try {
      const [kpiRes, ordersRes, productsRes] = await Promise.all([
        getAdminKPIsAction(),
        getAdminOrdersAction({ limit: 10 }),
        getAdminProducts(),
      ]);

      if (kpiRes.success && kpiRes.kpis) {
        setKpis(kpiRes.kpis);
      }
      if (ordersRes.success && ordersRes.orders) {
        setOrders(ordersRes.orders);
      }
      if (productsRes.products) {
        const lowStock = productsRes.products.filter((p) => p.stock <= 5);
        setLowStockProducts(lowStock);
      }
    } catch (err: any) {
      console.error("Failed to load dashboard data:", err);
      toast.error("Could not load dashboard data.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadDashboardData();
    toast.success("Dashboard data refreshed.");
  };

  const handleQuickConfirm = async (orderId: string) => {
    try {
      const res = await updateOrderStatus(orderId, "CONFIRMED");
      if (!res.success) {
        toast.error(res.error || "Failed to confirm order.");
        return;
      }
      toast.success(`Order confirmed! Moved to packing queue.`);
      loadDashboardData();
    } catch (err: any) {
      toast.error(err.message || "Failed to confirm order.");
    }
  };

  const handleQuickReconcile = async (orderId: string, amount: number) => {
    try {
      const res = await updateCodStatus(orderId, "COLLECTED", amount);
      if (!res.success) {
        toast.error(res.error || "Failed to reconcile cash.");
        return;
      }
      toast.success(`Cash of ৳${amount} reconciled! Revenue recorded.`);
      loadDashboardData();
    } catch (err: any) {
      toast.error(err.message || "Failed to reconcile cash.");
    }
  };

  const pendingOrders = orders.filter((o) => o.status === "PENDING_CONFIRMATION");
  const firstPending = pendingOrders[0];

  const inTransitOrders = orders.filter(
    (o) => o.status === "SHIPPED" || o.status === "OUT_FOR_DELIVERY"
  );
  const inTransitTotal = inTransitOrders.reduce((sum, o) => sum + o.total, 0);

  const collectedOrders = orders.filter(
    (o) => o.status === "DELIVERED" && o.codStatus === "COLLECTED"
  );
  const collectedTotal = collectedOrders.reduce((sum, o) => sum + o.total, 0);

  const readyForDispatchOrders = orders.filter(
    (o) => o.status === "CONFIRMED" || o.status === "PROCESSING"
  );
  const readyTotal = readyForDispatchOrders.reduce((sum, o) => sum + o.total, 0);

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Top Header & Fast Filter */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-[#E8E2DE] dark:border-[#2E303E]">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] animate-pulse"></span>
              <span className="text-xs font-bold text-[#DC012B] uppercase tracking-wider">
                Real-Time Operations
              </span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-black text-[#18191F] dark:text-white mt-1">
              Store &amp; COD Revenue Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Live orders, courier dispatch, and Cash on Delivery cash reconciliation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={refreshing}
              className="text-xs font-bold flex items-center gap-1.5"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>

            <Link href="/admin/products">
              <Button
                variant="primary"
                size="sm"
                className="bg-[#DC012B] hover:bg-[#B80023] text-white text-xs font-bold shadow-sm flex items-center gap-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Add New Toy</span>
              </Button>
            </Link>

            <div className="flex rounded-xl bg-white dark:bg-[#1B1C24] border border-[#E8E2DE] dark:border-[#2E303E] p-1 text-xs font-bold shadow-xs">
              <button
                onClick={() => setPeriod("7d")}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  period === "7d"
                    ? "bg-[#DC012B] text-white"
                    : "text-slate-600 dark:text-slate-300 hover:text-[#DC012B]"
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setPeriod("30d")}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  period === "30d"
                    ? "bg-[#DC012B] text-white"
                    : "text-slate-600 dark:text-slate-300 hover:text-[#DC012B]"
                }`}
              >
                30 Days
              </button>
              <button
                onClick={() => setPeriod("all")}
                className={`px-3 py-1.5 rounded-lg transition-colors cursor-pointer ${
                  period === "all"
                    ? "bg-[#DC012B] text-white"
                    : "text-slate-600 dark:text-slate-300 hover:text-[#DC012B]"
                }`}
              >
                All Time
              </button>
            </div>
          </div>
        </div>

        {/* 4 Spacious KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {/* Gross Sales */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#1B1C24] border border-[#E8E2DE] dark:border-[#2E303E] shadow-sm space-y-3 transition-all hover:shadow-md">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Gross Sales (COD &amp; MFS)</span>
              <div className="p-2.5 rounded-2xl bg-[#FFF0F2] dark:bg-[#3D000B] text-[#DC012B]">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-[#18191F] dark:text-white tracking-tight">
              {formatPrice(kpis.grossSales)}
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px]">
              <span className="font-bold text-[#10B981] bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                Live Data
              </span>
              <span className="text-slate-400">from database</span>
            </div>
          </div>

          {/* Cash Reconciled */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#1B1C24] border border-[#E8E2DE] dark:border-[#2E303E] shadow-sm space-y-3 transition-all hover:shadow-md">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Cash Reconciled (In Hand)</span>
              <div className="p-2.5 rounded-2xl bg-[#ECFDF5] dark:bg-[#064E3B] text-[#10B981]">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-[#10B981] tracking-tight">
              {formatPrice(kpis.reconciledCash)}
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px]">
              <span className="font-semibold text-slate-500">Collected &amp; Verified</span>
            </div>
          </div>

          {/* Pending COD Cash in Transit */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#1B1C24] border border-[#E8E2DE] dark:border-[#2E303E] shadow-sm space-y-3 transition-all hover:shadow-md">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Pending Cash in Transit</span>
              <div className="p-2.5 rounded-2xl bg-[#FFFBEB] dark:bg-[#451A03] text-[#F59E0B]">
                <Truck className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-[#F59E0B] tracking-tight">
              {formatPrice(kpis.pendingCashInTransit)}
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px]">
              <span className="font-medium text-amber-600 dark:text-amber-400">
                Awaiting delivery or collection
              </span>
            </div>
          </div>

          {/* Total Orders Placed */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#1B1C24] border border-[#E8E2DE] dark:border-[#2E303E] shadow-sm space-y-3 transition-all hover:shadow-md">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Total Orders Placed</span>
              <div className="p-2.5 rounded-2xl bg-[#F5F3FF] dark:bg-[#2E1065] text-[#8B5CF6]">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-[#18191F] dark:text-white tracking-tight">
              {kpis.totalOrders} {kpis.totalOrders === 1 ? "Order" : "Orders"}
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px]">
              <span className="font-bold text-[#DC012B]">
                {kpis.pendingOrdersCount} awaiting phone confirmation
              </span>
            </div>
          </div>
        </div>

        {/* Action-Required Phone Confirmation Banner */}
        {firstPending ? (
          <div className="p-5 rounded-3xl bg-[#FFF7ED] dark:bg-[#2A1805] border border-[#FED7AA] dark:border-[#7C2D12] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
            <div className="flex items-center gap-3.5">
              <div className="p-3 rounded-2xl bg-[#F97316] text-white shrink-0 shadow-xs">
                <PhoneCall className="w-5 h-5 animate-bounce" />
              </div>
              <div>
                <h4 className="font-heading font-black text-sm text-[#9A3412] dark:text-[#FFEDD5]">
                  {pendingOrders.length} New Order{pendingOrders.length > 1 ? "s" : ""} Awaiting Phone Confirmation
                </h4>
                <p className="text-xs text-[#C2410C] dark:text-[#FED7AA] mt-0.5">
                  Order <strong>#{firstPending.orderNumber || firstPending.id}</strong> by {firstPending.customerName} ({firstPending.customerPhone}) was placed recently. Confirm address before dispatching courier.
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2.5 shrink-0">
              <button
                onClick={() => handleQuickConfirm(firstPending.id)}
                className="px-4 py-2 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
              >
                Confirm via Phone
              </button>
              <Link href="/admin/orders">
                <Button variant="outline" size="sm" className="text-xs font-bold">
                  View All Orders
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-3xl bg-emerald-50/60 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-emerald-500 text-white shrink-0">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-heading font-bold text-xs text-emerald-900 dark:text-emerald-200">
                  All Orders Confirmed
                </h4>
                <p className="text-[11px] text-emerald-700 dark:text-emerald-300">
                  No orders currently awaiting customer phone verification.
                </p>
              </div>
            </div>
            <Link href="/admin/orders">
              <Button variant="outline" size="sm" className="text-xs font-bold">
                Order Manager
              </Button>
            </Link>
          </div>
        )}

        {/* Spacious 2-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (8 of 12 cols = ~67%): Expanded Live Orders Table */}
          <div className="lg:col-span-8 bg-white dark:bg-[#1B1C24] rounded-3xl border border-[#E8E2DE] dark:border-[#2E303E] p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E8E2DE] dark:border-[#2E303E]">
              <div>
                <h2 className="font-heading font-black text-lg text-[#18191F] dark:text-white">
                  Recent Orders
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Fulfillment workflow, MFS verification, and Cash on Delivery tracking.
                </p>
              </div>
              <Link href="/admin/orders">
                <Button
                  variant="outline"
                  size="sm"
                  className="text-xs font-bold hover:border-[#DC012B] hover:text-[#DC012B]"
                >
                  <span>Open Full Order Manager</span>
                  <ArrowRight className="w-3.5 h-3.5 ml-1" />
                </Button>
              </Link>
            </div>

            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-slate-400 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-[#DC012B]" />
                <span className="text-xs font-medium">Loading live orders...</span>
              </div>
            ) : orders.length === 0 ? (
              <div className="py-12 text-center text-slate-400">
                <ShoppingBag className="w-8 h-8 mx-auto mb-2 opacity-40" />
                <p className="text-xs font-medium">No customer orders placed yet.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-[#E8E2DE] dark:border-[#2E303E] text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                      <th className="pb-3.5">Order ID &amp; Date</th>
                      <th className="pb-3.5">Customer &amp; Destination</th>
                      <th className="pb-3.5">Toys Ordered</th>
                      <th className="pb-3.5">Amount</th>
                      <th className="pb-3.5">Status</th>
                      <th className="pb-3.5">Payment</th>
                      <th className="pb-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                    {orders.map((ord) => (
                      <tr
                        key={ord.id}
                        className="hover:bg-[#FAF8F6] dark:hover:bg-[#242531] transition-colors"
                      >
                        <td className="py-4">
                          <span className="font-mono font-bold text-[#DC012B] block text-xs">
                            {ord.orderNumber || ord.id.slice(0, 8)}
                          </span>
                          <span className="text-[11px] text-slate-400">
                            {new Date(ord.placedAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                            })}
                          </span>
                        </td>

                        <td className="py-4">
                          <span className="font-bold text-[#18191F] dark:text-white block">
                            {ord.customerName}
                          </span>
                          <span className="text-[11px] text-slate-500 block">{ord.customerPhone}</span>
                          <span className="text-[10px] text-slate-400 block truncate max-w-[140px]">
                            {ord.shippingAddress?.city || ord.deliveryZone}
                          </span>
                        </td>

                        <td className="py-4 max-w-[180px] truncate text-slate-700 dark:text-slate-300 font-medium">
                          {ord.items?.map((i) => i.name).join(", ") || "Toy"}
                        </td>

                        <td className="py-4 font-black text-[#18191F] dark:text-white text-sm">
                          {formatPrice(ord.total)}
                        </td>

                        <td className="py-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full font-bold text-[10px] ${
                              ord.status === "DELIVERED"
                                ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                                : ord.status === "SHIPPED"
                                ? "bg-blue-100 text-blue-800 dark:bg-blue-950/60 dark:text-blue-300"
                                : ord.status === "CONFIRMED"
                                ? "bg-purple-100 text-purple-800 dark:bg-purple-950/60 dark:text-purple-300"
                                : ord.status === "CANCELLED"
                                ? "bg-rose-100 text-rose-800 dark:bg-rose-950/60 dark:text-rose-300"
                                : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                            }`}
                          >
                            {ord.status.replace(/_/g, " ")}
                          </span>
                        </td>

                        <td className="py-4">
                          {ord.paymentMethod === "CASH_ON_DELIVERY" ? (
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full font-extrabold text-[10px] ${
                                ord.codStatus === "COLLECTED"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                                  : "bg-amber-50 text-amber-700 border border-amber-300"
                              }`}
                            >
                              COD: {ord.codStatus}
                            </span>
                          ) : (
                            <span
                              className={`inline-block px-2.5 py-1 rounded-full font-extrabold text-[10px] ${
                                ord.paymentStatus === "VERIFIED"
                                  ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                                  : "bg-purple-50 text-purple-700 border border-purple-300"
                              }`}
                            >
                              {ord.paymentMethod}: {ord.paymentStatus || "PENDING"}
                            </span>
                          )}
                        </td>

                        <td className="py-4 text-right space-x-1.5 whitespace-nowrap">
                          {ord.status === "PENDING_CONFIRMATION" && (
                            <button
                              onClick={() => handleQuickConfirm(ord.id)}
                              className="px-2.5 py-1 rounded-lg bg-[#DC012B] text-white font-bold text-[11px] hover:bg-[#B80023] transition-colors cursor-pointer"
                            >
                              Confirm
                            </button>
                          )}
                          {ord.status === "SHIPPED" &&
                            ord.paymentMethod === "CASH_ON_DELIVERY" &&
                            ord.codStatus === "UNCOLLECTED" && (
                              <button
                                onClick={() => handleQuickReconcile(ord.id, ord.total)}
                                className="px-2.5 py-1 rounded-lg bg-[#10B981] text-white font-bold text-[11px] hover:bg-[#059669] transition-colors cursor-pointer"
                              >
                                Cash Received
                              </button>
                            )}
                          <Link href="/admin/orders">
                            <button className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-semibold text-[11px] hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer">
                              View
                            </button>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Right Column (4 of 12 cols = ~33%): Delivery Cash & Stock Alerts */}
          <div className="lg:col-span-4 space-y-6">
            {/* Delivery & Dispatch Summary */}
            <div className="bg-white dark:bg-[#1B1C24] rounded-3xl border border-[#E8E2DE] dark:border-[#2E303E] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8E2DE] dark:border-[#2E303E]">
                <h3 className="font-heading font-black text-sm text-[#18191F] dark:text-white flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#DC012B]" />
                  <span>Dispatch &amp; Cash Summary</span>
                </h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Live Metrics</span>
              </div>

              <div className="space-y-3.5">
                {/* In Transit */}
                <div className="p-3.5 rounded-2xl bg-[#FAF8F6] dark:bg-[#242531] border border-[#E8E2DE] dark:border-[#2E303E] flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-[#18191F] dark:text-white block">
                      In Transit / Out for Delivery
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {inTransitOrders.length} {inTransitOrders.length === 1 ? "Order" : "Orders"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-xs text-[#F59E0B] block">
                      {formatPrice(inTransitTotal)}
                    </span>
                    <span className="text-[10px] font-bold text-amber-600 uppercase">Pending</span>
                  </div>
                </div>

                {/* Ready for Dispatch */}
                <div className="p-3.5 rounded-2xl bg-[#FAF8F6] dark:bg-[#242531] border border-[#E8E2DE] dark:border-[#2E303E] flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-[#18191F] dark:text-white block">
                      Confirmed &amp; Packing
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {readyForDispatchOrders.length} {readyForDispatchOrders.length === 1 ? "Order" : "Orders"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-xs text-[#8B5CF6] block">
                      {formatPrice(readyTotal)}
                    </span>
                    <span className="text-[10px] font-bold text-purple-600 uppercase">To Ship</span>
                  </div>
                </div>

                {/* Delivered & Reconciled */}
                <div className="p-3.5 rounded-2xl bg-[#FAF8F6] dark:bg-[#242531] border border-[#E8E2DE] dark:border-[#2E303E] flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-[#18191F] dark:text-white block">
                      Delivered &amp; Reconciled
                    </span>
                    <span className="text-[11px] text-slate-400">
                      {collectedOrders.length} {collectedOrders.length === 1 ? "Order" : "Orders"}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-xs text-[#10B981] block">
                      {formatPrice(collectedTotal)}
                    </span>
                    <span className="text-[10px] font-bold text-emerald-600 uppercase">
                      Reconciled
                    </span>
                  </div>
                </div>
              </div>

              <Link href="/admin/orders">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full text-xs font-bold mt-2 hover:border-[#DC012B] hover:text-[#DC012B]"
                >
                  Manage All Orders &amp; Dispatches
                </Button>
              </Link>
            </div>

            {/* Warehouse Stock Alerts */}
            <div className="bg-white dark:bg-[#1B1C24] rounded-3xl border border-[#E8E2DE] dark:border-[#2E303E] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8E2DE] dark:border-[#2E303E]">
                <h3 className="font-heading font-black text-sm text-[#18191F] dark:text-white flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-[#F59E0B]" />
                  <span>Low Stock Warning</span>
                </h3>
                {lowStockProducts.length > 0 && (
                  <span className="text-[10px] font-bold text-rose-500 uppercase">
                    {lowStockProducts.length} Items Low
                  </span>
                )}
              </div>

              {lowStockProducts.length === 0 ? (
                <div className="p-4 rounded-2xl bg-emerald-50/50 dark:bg-emerald-950/20 text-center">
                  <p className="text-xs font-medium text-emerald-700 dark:text-emerald-300">
                    All catalog toys have healthy warehouse stock levels.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {lowStockProducts.slice(0, 4).map((p) => (
                    <div
                      key={p.id}
                      className="p-3 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 flex items-center justify-between"
                    >
                      <div className="max-w-[180px]">
                        <span className="font-bold text-xs text-rose-900 dark:text-rose-200 block truncate">
                          {p.name}
                        </span>
                        <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold">
                          Only {p.stock} units remaining
                        </span>
                      </div>
                      <Link href="/admin/inventory">
                        <button className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-bold hover:bg-rose-700 transition-colors cursor-pointer">
                          Restock
                        </button>
                      </Link>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
