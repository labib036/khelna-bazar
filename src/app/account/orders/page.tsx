"use client";

import Link from "next/link";
import { AccountNav } from "@/components/account/account-nav";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Package, Truck, Clock, CheckCircle2, ArrowRight } from "lucide-react";

export default function CustomerOrdersPage() {
  const sampleOrders = [
    {
      id: "KB-100242",
      date: "Nov 11, 2026",
      items: "Magnetic Castle Architect Tiles (102 Pcs)",
      total: 2970,
      status: "SHIPPED",
      codStatus: "UNCOLLECTED",
      carrier: "Pathao Courier",
      tracking: "PTH-992140",
    },
    {
      id: "KB-100241",
      date: "Nov 05, 2026",
      items: "Space Explorer Rocket Launch Facility (850 Pcs)",
      total: 3510,
      status: "DELIVERED",
      codStatus: "COLLECTED",
      carrier: "Steadfast Courier",
      tracking: "ST-8829410",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <AccountNav />

        <div className="flex-1 space-y-6 w-full">
          <div>
            <h1 className="font-heading text-2xl font-black text-[#18191F] dark:text-white">
              My Orders &amp; Delivery Tracking
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              View your Cash on Delivery orders, delivery status, and printable invoices.
            </p>
          </div>

          <div className="space-y-4">
            {sampleOrders.map((ord) => (
              <div
                key={ord.id}
                className="p-5 sm:p-6 rounded-3xl bg-white dark:bg-[#161D33] border border-[#E8E2DE] dark:border-[#263050] shadow-xs space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="font-mono font-black text-sm text-[#DC012B]">{ord.id}</span>
                    <span className="text-xs text-slate-400">&bull; Placed on {ord.date}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-bold px-2.5 py-0.5 rounded-full ${
                        ord.status === "DELIVERED"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-blue-100 text-blue-800"
                      }`}
                    >
                      {ord.status}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                        ord.codStatus === "COLLECTED"
                          ? "bg-emerald-50 text-emerald-600"
                          : "bg-amber-50 text-amber-700"
                      }`}
                    >
                      COD: {ord.codStatus}
                    </span>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-xs sm:text-sm font-bold text-[#18191F] dark:text-white">
                      {ord.items}
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Carrier: {ord.carrier} &bull; Tracking: <span className="font-mono">{ord.tracking}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Total Due</span>
                      <span className="text-sm sm:text-base font-black text-[#18191F] dark:text-white">
                        {formatPrice(ord.total)}
                      </span>
                    </div>

                    <Link href={`/order/${ord.id}`}>
                      <Button variant="primary" size="sm" className="text-xs gap-1">
                        <span>Track</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
