"use client";

import { useMemo } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import { formatPrice } from "@/lib/utils";
import { StoreOrder } from "@/types/store";

interface AdminChartsProps {
  orders: StoreOrder[];
}

const COLORS = ["#C83E00", "#3B82F6", "#10B981", "#8B5CF6", "#F59E0B", "#EF4444"];

export function AdminCharts({ orders }: AdminChartsProps) {
  // 1. Revenue & Order count by day (last 14 days)
  const revenueTrendData = useMemo(() => {
    const map = new Map<string, { date: string; revenue: number; count: number }>();
    const now = new Date();

    for (let i = 13; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
      const key = d.toISOString().split("T")[0];
      const label = d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
      map.set(key, { date: label, revenue: 0, count: 0 });
    }

    orders.forEach((o) => {
      if (o.status === "CANCELLED") return;
      const key = typeof o.placedAt === "string" ? o.placedAt.split("T")[0] : new Date(o.placedAt).toISOString().split("T")[0];
      if (map.has(key)) {
        const item = map.get(key)!;
        item.revenue += o.total;
        item.count += 1;
      }
    });

    return Array.from(map.values());
  }, [orders]);

  // 2. Order Status Funnel
  const statusFunnelData = useMemo(() => {
    const statuses = [
      { key: "PENDING_CONFIRMATION", label: "Pending" },
      { key: "CONFIRMED", label: "Confirmed" },
      { key: "SHIPPED", label: "Shipped" },
      { key: "DELIVERED", label: "Delivered" },
      { key: "CANCELLED", label: "Cancelled" },
    ];

    return statuses.map((s) => {
      const count = orders.filter((o) => o.status === s.key).length;
      return { status: s.label, count };
    });
  }, [orders]);

  // 3. Payment Method Distribution
  const paymentMethodData = useMemo(() => {
    const map: Record<string, number> = {
      "Cash on Delivery": 0,
      bKash: 0,
      Nagad: 0,
    };

    orders.forEach((o) => {
      if (o.paymentMethod === "BKASH") map.bKash += 1;
      else if (o.paymentMethod === "NAGAD") map.Nagad += 1;
      else map["Cash on Delivery"] += 1;
    });

    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [orders]);

  // 4. Delivery Zone Distribution
  const deliveryZoneData = useMemo(() => {
    let insideDhaka = 0;
    let outsideDhaka = 0;

    orders.forEach((o) => {
      if (o.deliveryZone === "outside_dhaka" || o.deliveryZone?.toLowerCase().includes("outside")) {
        outsideDhaka += 1;
      } else {
        insideDhaka += 1;
      }
    });

    return [
      { name: "Inside Dhaka", value: insideDhaka },
      { name: "Outside Dhaka", value: outsideDhaka },
    ];
  }, [orders]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* 1. Revenue Timeline Chart (8 cols) */}
      <div className="lg:col-span-8 p-6 rounded-3xl bg-[var(--surface-elevated)] border border-[var(--border)] shadow-sm space-y-4">
        <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
          <div>
            <h3 className="font-heading font-black text-sm text-[var(--text-primary)]">
              Daily Revenue Trend (Last 14 Days)
            </h3>
            <p className="text-[11px] text-[var(--text-muted)]">Gross store revenue from confirmed &amp; delivered orders</p>
          </div>
          <span className="text-xs font-bold text-[var(--primary)]">৳ BDT</span>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={revenueTrendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#C83E00" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#C83E00" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.15} />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickLine={false} />
              <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="rounded-xl bg-[var(--surface)] border border-[var(--border)] p-2.5 shadow-lg text-xs space-y-1">
                        <span className="font-bold text-[var(--text-primary)] block">{data.date}</span>
                        <span className="text-[var(--primary)] font-black block">{formatPrice(data.revenue)}</span>
                        <span className="text-[10px] text-[var(--text-muted)] block">{data.count} orders</span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Area type="monotone" dataKey="revenue" stroke="#C83E00" strokeWidth={2.5} fillOpacity={1} fill="url(#revenueGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 2. Status Funnel (4 cols) */}
      <div className="lg:col-span-4 p-6 rounded-3xl bg-[var(--surface-elevated)] border border-[var(--border)] shadow-sm space-y-4">
        <div className="pb-2 border-b border-[var(--border)]">
          <h3 className="font-heading font-black text-sm text-[var(--text-primary)]">
            Order Fulfillment Pipeline
          </h3>
          <p className="text-[11px] text-[var(--text-muted)]">Status of all placed customer parcels</p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={statusFunnelData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" horizontal={false} opacity={0.15} />
              <XAxis type="number" tick={{ fontSize: 10 }} />
              <YAxis dataKey="status" type="category" tick={{ fontSize: 10 }} width={70} tickLine={false} />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-xl bg-[var(--surface)] border border-[var(--border)] p-2 shadow-lg text-xs">
                        <span className="font-bold text-[var(--text-primary)]">
                          {payload[0].payload.status}: {payload[0].value} orders
                        </span>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="count" fill="#C83E00" radius={[0, 8, 8, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 3. Payment Method Split (6 cols) */}
      <div className="lg:col-span-6 p-6 rounded-3xl bg-[var(--surface-elevated)] border border-[var(--border)] shadow-sm space-y-4">
        <div className="pb-2 border-b border-[var(--border)]">
          <h3 className="font-heading font-black text-sm text-[var(--text-primary)]">
            Payment Method Split
          </h3>
          <p className="text-[11px] text-[var(--text-muted)]">Cash on Delivery vs Mobile Financial Services</p>
        </div>

        <div className="h-56 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={paymentMethodData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {paymentMethodData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* 4. Delivery Zone Split (6 cols) */}
      <div className="lg:col-span-6 p-6 rounded-3xl bg-[var(--surface-elevated)] border border-[var(--border)] shadow-sm space-y-4">
        <div className="pb-2 border-b border-[var(--border)]">
          <h3 className="font-heading font-black text-sm text-[var(--text-primary)]">
            Delivery Zone Breakdown
          </h3>
          <p className="text-[11px] text-[var(--text-muted)]">Dhaka Metro vs Nationwide 64 Districts</p>
        </div>

        <div className="h-56 w-full flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={deliveryZoneData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={80}
                paddingAngle={4}
                dataKey="value"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              >
                {deliveryZoneData.map((entry, index) => (
                  <Cell key={`zone-cell-${index}`} fill={index === 0 ? "#10B981" : "#3B82F6"} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
