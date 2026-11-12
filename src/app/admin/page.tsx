"use client";

import { useState } from "react";
import Link from "next/link";
import { AdminLayout } from "@/components/admin/admin-layout";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  ShoppingBag,
  Truck,
  AlertCircle,
  Users,
  CheckCircle2,
  Clock,
  ArrowRight,
  Sparkles,
  DollarSign,
  PackageCheck,
  Plus,
  RefreshCw,
  PhoneCall,
  Search,
  ExternalLink,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminDashboardPage() {
  const [period, setPeriod] = useState<"7d" | "30d" | "all">("30d");

  const [orders, setOrders] = useState([
    {
      id: "KB-100244",
      customer: "Tanzim Ahmed",
      phone: "01819-123456",
      area: "Banani, Dhaka",
      items: "Titan Rex Roaring Jurassic Dinosaur",
      total: 2310,
      status: "PENDING_CONFIRMATION",
      codStatus: "UNCOLLECTED",
      courier: "Steadfast Courier",
      date: "10 mins ago",
    },
    {
      id: "KB-100243",
      customer: "Dr. Farhana Islam",
      phone: "01711-223344",
      area: "Dhanmondi, Dhaka",
      items: "Medieval Fortress Siege Dragon Citadel",
      total: 4800,
      status: "CONFIRMED",
      codStatus: "UNCOLLECTED",
      courier: "Pathao Logistics",
      date: "2 hours ago",
    },
    {
      id: "KB-100242",
      customer: "Nusrat Jahan",
      phone: "01912-334455",
      area: "Agrabad, Chittagong",
      items: "Magnetic Castle Architect Tiles (102 Pcs)",
      total: 2970,
      status: "SHIPPED",
      codStatus: "UNCOLLECTED",
      courier: "Steadfast Courier",
      date: "Yesterday",
    },
    {
      id: "KB-100241",
      customer: "Rashidul Karim",
      phone: "01611-998877",
      area: "Uttara, Dhaka",
      items: "Space Explorer Rocket Launch Facility",
      total: 3510,
      status: "DELIVERED",
      codStatus: "COLLECTED",
      courier: "RedX Delivery",
      date: "3 days ago",
    },
  ]);

  const handleQuickConfirm = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: "CONFIRMED" } : o))
    );
    toast.success(`Order ${orderId} confirmed! Sent to warehouse packing queue.`);
  };

  const handleQuickReconcile = (orderId: string) => {
    setOrders((prev) =>
      prev.map((o) =>
        o.id === orderId ? { ...o, status: "DELIVERED", codStatus: "COLLECTED" } : o
      )
    );
    toast.success(`Cash reconciled for ${orderId}! Revenue recorded.`);
  };

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
              Store & COD Revenue Dashboard
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Monitor customer orders, courier dispatch, and Cash on Delivery cash reconciliation.
            </p>
          </div>

          <div className="flex items-center gap-3">
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
          {/* Gross COD Sales */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#1B1C24] border border-[#E8E2DE] dark:border-[#2E303E] shadow-sm space-y-3 transition-all hover:shadow-md">
            <div className="flex items-center justify-between text-xs font-bold text-slate-500">
              <span>Gross COD Sales</span>
              <div className="p-2.5 rounded-2xl bg-[#FFF0F2] dark:bg-[#3D000B] text-[#DC012B]">
                <TrendingUp className="w-5 h-5" />
              </div>
            </div>
            <div className="text-3xl font-black text-[#18191F] dark:text-white tracking-tight">
              {formatPrice(13590)}
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px]">
              <span className="font-bold text-[#10B981] bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                +18.4%
              </span>
              <span className="text-slate-400">vs last month</span>
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
              {formatPrice(3510)}
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px]">
              <span className="font-semibold text-slate-500">Collected from couriers</span>
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
              {formatPrice(10080)}
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px]">
              <span className="font-medium text-amber-600 dark:text-amber-400">
                3 orders currently with couriers
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
              4 Orders
            </div>
            <div className="flex items-center gap-2 pt-1 border-t border-slate-100 dark:border-slate-800 text-[11px]">
              <span className="font-bold text-[#DC012B]">100% Cash on Delivery</span>
            </div>
          </div>
        </div>

        {/* Action-Required Phone Confirmation Banner */}
        <div className="p-5 rounded-3xl bg-[#FFF7ED] dark:bg-[#2A1805] border border-[#FED7AA] dark:border-[#7C2D12] flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3.5">
            <div className="p-3 rounded-2xl bg-[#F97316] text-white shrink-0 shadow-xs">
              <PhoneCall className="w-5 h-5 animate-bounce" />
            </div>
            <div>
              <h4 className="font-heading font-black text-sm text-[#9A3412] dark:text-[#FFEDD5]">
                1 New Order Awaiting Phone Call Confirmation
              </h4>
              <p className="text-xs text-[#C2410C] dark:text-[#FED7AA] mt-0.5">
                Order <strong>#KB-100244</strong> by Tanzim Ahmed (01819-123456) was placed recently. Confirm address before dispatching courier.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => handleQuickConfirm("KB-100244")}
              className="px-4 py-2 rounded-full bg-[#EA580C] hover:bg-[#C2410C] text-white text-xs font-bold shadow-xs cursor-pointer transition-colors"
            >
              Confirm via Phone
            </button>
            <Link href="/admin/orders">
              <Button variant="outline" size="sm" className="text-xs font-bold">
                View Order Details
              </Button>
            </Link>
          </div>
        </div>

        {/* Spacious 2-Column Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column (8 of 12 cols = ~67%): Expanded Live Orders Table */}
          <div className="lg:col-span-8 bg-white dark:bg-[#1B1C24] rounded-3xl border border-[#E8E2DE] dark:border-[#2E303E] p-6 sm:p-7 shadow-sm space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#E8E2DE] dark:border-[#2E303E]">
              <div>
                <h2 className="font-heading font-black text-lg text-[#18191F] dark:text-white">
                  Recent Cash on Delivery Orders
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Fulfillment workflow and courier cash collection tracking.
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

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-[#E8E2DE] dark:border-[#2E303E] text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                    <th className="pb-3.5">Order ID & Date</th>
                    <th className="pb-3.5">Customer & Destination</th>
                    <th className="pb-3.5">Toy Ordered</th>
                    <th className="pb-3.5">Amount</th>
                    <th className="pb-3.5">Fulfillment</th>
                    <th className="pb-3.5">COD Cash</th>
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
                          {ord.id}
                        </span>
                        <span className="text-[11px] text-slate-400">{ord.date}</span>
                      </td>

                      <td className="py-4">
                        <span className="font-bold text-[#18191F] dark:text-white block">
                          {ord.customer}
                        </span>
                        <span className="text-[11px] text-slate-500 block">{ord.phone}</span>
                        <span className="text-[10px] text-slate-400 block">{ord.area}</span>
                      </td>

                      <td className="py-4 max-w-[180px] truncate text-slate-700 dark:text-slate-300 font-medium">
                        {ord.items}
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
                              : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                          }`}
                        >
                          {ord.status.replace("_", " ")}
                        </span>
                      </td>

                      <td className="py-4">
                        <span
                          className={`inline-block px-2.5 py-1 rounded-full font-extrabold text-[10px] ${
                            ord.codStatus === "COLLECTED"
                              ? "bg-emerald-50 text-emerald-700 border border-emerald-300"
                              : "bg-amber-50 text-amber-700 border border-amber-300"
                          }`}
                        >
                          {ord.codStatus}
                        </span>
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
                        {ord.status === "SHIPPED" && ord.codStatus === "UNCOLLECTED" && (
                          <button
                            onClick={() => handleQuickReconcile(ord.id)}
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
          </div>

          {/* Right Column (4 of 12 cols = ~33%): Courier Cash & Stock Alerts */}
          <div className="lg:col-span-4 space-y-6">
            {/* Courier COD Cash Breakdown */}
            <div className="bg-white dark:bg-[#1B1C24] rounded-3xl border border-[#E8E2DE] dark:border-[#2E303E] p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-[#E8E2DE] dark:border-[#2E303E]">
                <h3 className="font-heading font-black text-sm text-[#18191F] dark:text-white flex items-center gap-2">
                  <Truck className="w-4 h-4 text-[#DC012B]" />
                  <span>Courier Cash Breakdown</span>
                </h3>
                <span className="text-[10px] font-bold text-slate-400 uppercase">Live Sync</span>
              </div>

              <div className="space-y-3.5">
                {/* Steadfast */}
                <div className="p-3.5 rounded-2xl bg-[#FAF8F6] dark:bg-[#242531] border border-[#E8E2DE] dark:border-[#2E303E] flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-[#18191F] dark:text-white block">
                      Steadfast Courier
                    </span>
                    <span className="text-[11px] text-slate-400">2 Orders In Transit</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-xs text-[#F59E0B] block">
                      {formatPrice(5280)}
                    </span>
                    <span className="text-[10px] font-bold text-amber-600 uppercase">Pending</span>
                  </div>
                </div>

                {/* Pathao */}
                <div className="p-3.5 rounded-2xl bg-[#FAF8F6] dark:bg-[#242531] border border-[#E8E2DE] dark:border-[#2E303E] flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-[#18191F] dark:text-white block">
                      Pathao Logistics
                    </span>
                    <span className="text-[11px] text-slate-400">1 Order In Transit</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-xs text-[#F59E0B] block">
                      {formatPrice(4800)}
                    </span>
                    <span className="text-[10px] font-bold text-amber-600 uppercase">Pending</span>
                  </div>
                </div>

                {/* RedX */}
                <div className="p-3.5 rounded-2xl bg-[#FAF8F6] dark:bg-[#242531] border border-[#E8E2DE] dark:border-[#2E303E] flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-[#18191F] dark:text-white block">
                      RedX Delivery
                    </span>
                    <span className="text-[11px] text-slate-400">1 Order Delivered</span>
                  </div>
                  <div className="text-right">
                    <span className="font-black text-xs text-[#10B981] block">
                      {formatPrice(3510)}
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
                  Reconcile Courier Remittance
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
                <span className="text-[10px] font-bold text-rose-500 uppercase">Action Needed</span>
              </div>

              <div className="space-y-3">
                <div className="p-3 rounded-2xl bg-rose-50/60 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-rose-900 dark:text-rose-200 block">
                      Solar System Explorer
                    </span>
                    <span className="text-[10px] text-rose-600 dark:text-rose-400 font-semibold">
                      Only 2 units remaining
                    </span>
                  </div>
                  <Link href="/admin/inventory">
                    <button className="px-2.5 py-1 rounded-lg bg-rose-600 text-white text-[10px] font-bold hover:bg-rose-700 transition-colors cursor-pointer">
                      Restock
                    </button>
                  </Link>
                </div>

                <div className="p-3 rounded-2xl bg-amber-50/60 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900 flex items-center justify-between">
                  <div>
                    <span className="font-bold text-xs text-amber-900 dark:text-amber-200 block">
                      RC High-Speed Rock Crawler
                    </span>
                    <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold">
                      Only 4 units remaining
                    </span>
                  </div>
                  <Link href="/admin/inventory">
                    <button className="px-2.5 py-1 rounded-lg bg-amber-600 text-white text-[10px] font-bold hover:bg-amber-700 transition-colors cursor-pointer">
                      Restock
                    </button>
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
