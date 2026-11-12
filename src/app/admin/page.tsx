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
} from "lucide-react";

export default function AdminDashboardPage() {
  const [period, setPeriod] = useState<"7d" | "30d" | "all">("30d");

  const recentOrders = [
    {
      id: "KB-100244",
      customer: "Tanzim Ahmed",
      phone: "01819-123456",
      items: "Titan Rex Roaring Jurassic Dinosaur",
      total: 2310,
      status: "PENDING_CONFIRMATION",
      codStatus: "UNCOLLECTED",
      date: "10 mins ago",
    },
    {
      id: "KB-100243",
      customer: "Farhana Islam",
      phone: "01711-223344",
      items: "Medieval Fortress Siege Dragon Citadel",
      total: 4800,
      status: "CONFIRMED",
      codStatus: "UNCOLLECTED",
      date: "2 hours ago",
    },
    {
      id: "KB-100242",
      customer: "Nusrat Jahan",
      phone: "01912-334455",
      items: "Magnetic Castle Architect Tiles (102 Pcs)",
      total: 2970,
      status: "SHIPPED",
      codStatus: "UNCOLLECTED",
      date: "Yesterday",
    },
    {
      id: "KB-100241",
      customer: "Rashidul Karim",
      phone: "01611-998877",
      items: "Space Explorer Rocket Launch Facility",
      total: 3510,
      status: "DELIVERED",
      codStatus: "COLLECTED",
      date: "3 days ago",
    },
  ];

  return (
    <AdminLayout>
      <div className="space-y-8">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-black text-[#14213D] dark:text-white">
              Operations &amp; COD Revenue Overview
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Live tracking of toy orders, warehouse packing, and Cash on Delivery cash reconciliation.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-400">Period:</span>
            <div className="flex rounded-xl bg-white dark:bg-[#161D33] border border-slate-200 p-1 text-xs font-bold">
              <button
                onClick={() => setPeriod("7d")}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  period === "7d" ? "bg-[#1E5BFF] text-white" : "text-slate-600"
                }`}
              >
                7 Days
              </button>
              <button
                onClick={() => setPeriod("30d")}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  period === "30d" ? "bg-[#1E5BFF] text-white" : "text-slate-600"
                }`}
              >
                30 Days
              </button>
              <button
                onClick={() => setPeriod("all")}
                className={`px-3 py-1 rounded-lg transition-colors cursor-pointer ${
                  period === "all" ? "bg-[#1E5BFF] text-white" : "text-slate-600"
                }`}
              >
                All Time
              </button>
            </div>
          </div>
        </div>

        {/* 4 Core KPI Tiles */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Sales */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#161D33] border border-[#E3E8F2] dark:border-[#263050] shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>Gross Sales (COD)</span>
              <div className="p-2 rounded-xl bg-[#EBF1FF] text-[#1E5BFF]">
                <TrendingUp className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#14213D] dark:text-white">
              {formatPrice(13590)}
            </div>
            <p className="text-[11px] text-emerald-600 font-semibold flex items-center gap-1">
              <span>+18.4%</span> vs previous period
            </p>
          </div>

          {/* Cash Collected */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#161D33] border border-[#E3E8F2] dark:border-[#263050] shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>Cash Reconciled</span>
              <div className="p-2 rounded-xl bg-[#E6FAF8] text-[#2EC4B6]">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#2EC4B6]">
              {formatPrice(3510)}
            </div>
            <p className="text-[11px] text-slate-500">Collected from courier</p>
          </div>

          {/* Pending COD Collection */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#161D33] border border-[#E3E8F2] dark:border-[#263050] shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>Pending Cash in Transit</span>
              <div className="p-2 rounded-xl bg-[#FFF8E6] text-[#B88700]">
                <Truck className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#FFC93C]">
              {formatPrice(10080)}
            </div>
            <p className="text-[11px] text-amber-600 font-medium">3 orders with couriers</p>
          </div>

          {/* Total Orders */}
          <div className="p-6 rounded-3xl bg-white dark:bg-[#161D33] border border-[#E3E8F2] dark:border-[#263050] shadow-xs space-y-2">
            <div className="flex items-center justify-between text-xs font-bold text-slate-400">
              <span>Total Orders Placed</span>
              <div className="p-2 rounded-xl bg-[#F3EFFF] text-[#7B5CFA]">
                <ShoppingBag className="w-4 h-4" />
              </div>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-[#14213D] dark:text-white">
              4 Orders
            </div>
            <p className="text-[11px] text-purple-600 font-semibold">100% Cash on Delivery</p>
          </div>
        </div>

        {/* Needs Attention Alert Bar */}
        <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-200 text-amber-800 shrink-0">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-heading font-bold text-sm text-amber-900 dark:text-amber-200">
                1 New Order Pending Phone Confirmation
              </h4>
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Order #KB-100244 by Tanzim Ahmed placed 10 mins ago. Call to verify delivery address.
              </p>
            </div>
          </div>
          <Link href="/admin/orders">
            <Button variant="sun" size="sm" className="shrink-0 text-xs font-bold">
              Review Order
            </Button>
          </Link>
        </div>

        {/* Recent Orders Table */}
        <div className="bg-white dark:bg-[#161D33] rounded-3xl border border-[#E3E8F2] dark:border-[#263050] p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-[#E3E8F2] dark:border-[#263050]">
            <div>
              <h2 className="font-heading font-black text-base text-[#14213D] dark:text-white">
                Recent Cash on Delivery Orders
              </h2>
              <p className="text-xs text-slate-500">Monitor fulfillment stages and cash collection status.</p>
            </div>
            <Link href="/admin/orders">
              <Button variant="outline" size="sm" className="text-xs">
                View All Orders
              </Button>
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#E3E8F2] dark:border-[#263050] text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Toy Ordered</th>
                  <th className="pb-3">Total (৳)</th>
                  <th className="pb-3">Fulfillment</th>
                  <th className="pb-3">COD Status</th>
                  <th className="pb-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-slate-50 dark:hover:bg-[#1E2742] transition-colors">
                    <td className="py-3 font-mono font-bold text-[#1E5BFF]">{ord.id}</td>
                    <td className="py-3">
                      <span className="font-bold text-[#14213D] dark:text-white block">{ord.customer}</span>
                      <span className="text-[11px] text-slate-400">{ord.phone}</span>
                    </td>
                    <td className="py-3 max-w-[200px] truncate text-slate-700 dark:text-slate-300">
                      {ord.items}
                    </td>
                    <td className="py-3 font-black text-[#14213D] dark:text-white">
                      {formatPrice(ord.total)}
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full font-bold text-[10px] ${
                          ord.status === "DELIVERED"
                            ? "bg-emerald-100 text-emerald-800"
                            : ord.status === "SHIPPED"
                            ? "bg-blue-100 text-blue-800"
                            : ord.status === "CONFIRMED"
                            ? "bg-purple-100 text-purple-800"
                            : "bg-amber-100 text-amber-800"
                        }`}
                      >
                        {ord.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="py-3">
                      <span
                        className={`px-2 py-0.5 rounded-full font-semibold text-[10px] ${
                          ord.codStatus === "COLLECTED"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-amber-50 text-amber-700"
                        }`}
                      >
                        {ord.codStatus}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      <Link href="/admin/orders">
                        <Button variant="ghost" size="sm" className="text-xs h-7">
                          Manage
                        </Button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
