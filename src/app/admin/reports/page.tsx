"use client";

import { useState, useEffect } from "react";
import { getSalesReportAction } from "@/server/actions/report-actions";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { BarChart3, TrendingUp, DollarSign, RotateCcw, AlertTriangle, Package, Loader2, Calendar } from "lucide-react";
import { toast } from "sonner";

export default function AdminReportsPage() {
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const loadReport = async (start?: string, end?: string) => {
    setLoading(true);
    const res = await getSalesReportAction(start, end);
    if (res.success) {
      setReport(res.report);
    } else {
      toast.error(res.error || "Failed to load report data");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadReport();
  }, []);

  const handleFilter = (e: React.FormEvent) => {
    e.preventDefault();
    loadReport(startDate || undefined, endDate || undefined);
  };

  const handleQuickFilter = (days: number) => {
    const end = new Date().toISOString().split("T")[0];
    const start = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    setStartDate(start);
    setEndDate(end);
    loadReport(start, end);
  };

  return (
    <div className="space-y-6 max-w-6xl pb-16">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-[var(--text-primary)] flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-[var(--primary)]" />
            <span>Sales &amp; Financial Reports</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
            Gross sales revenue, Cash on Delivery collections, returns, and bestseller analytics.
          </p>
        </div>

        {/* Quick Filter Buttons */}
        <div className="flex items-center gap-2">
          <Button type="button" variant="outline" size="sm" onClick={() => handleQuickFilter(7)} className="text-xs">
            Last 7 Days
          </Button>
          <Button type="button" variant="outline" size="sm" onClick={() => handleQuickFilter(30)} className="text-xs">
            Last 30 Days
          </Button>
        </div>
      </div>

      {/* Date Range Picker Form */}
      <form onSubmit={handleFilter} className="p-4 rounded-3xl bg-[var(--surface-elevated)] border border-[var(--border)] flex flex-wrap items-center gap-3 shadow-xs">
        <Calendar className="w-4 h-4 text-[var(--primary)]" />
        <span className="text-xs font-bold text-[var(--text-primary)]">Custom Date Range:</span>
        <Input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          className="w-40 h-9 text-xs"
        />
        <span className="text-xs text-[var(--text-muted)]">to</span>
        <Input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
          className="w-40 h-9 text-xs"
        />
        <Button type="submit" variant="primary" size="sm" className="h-9 font-bold text-xs">
          Filter
        </Button>
      </form>

      {/* Report Content */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[var(--text-muted)] flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-[var(--primary)]" />
          <span>Generating financial report...</span>
        </div>
      ) : report ? (
        <div className="space-y-6">
          {/* KPI Summary Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-[var(--surface-elevated)] border border-[var(--border)] shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <DollarSign className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-[var(--text-muted)] block">Delivered Gross Sales</span>
              <span className="font-heading font-black text-2xl text-[var(--text-primary)] block">
                {formatPrice(report.grossSales)}
              </span>
              <span className="text-[11px] text-emerald-600 font-bold block">
                {report.deliveredCount} orders fulfilled
              </span>
            </div>

            <div className="p-5 rounded-3xl bg-[var(--surface-elevated)] border border-[var(--border)] shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center">
                <TrendingUp className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-[var(--text-muted)] block">Reconciled Cash</span>
              <span className="font-heading font-black text-2xl text-[var(--text-primary)] block">
                {formatPrice(report.reconciledCash)}
              </span>
              <span className="text-[11px] text-[var(--text-muted)] block">Accounts verified</span>
            </div>

            <div className="p-5 rounded-3xl bg-[var(--surface-elevated)] border border-[var(--border)] shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-[var(--text-muted)] block">Cash in Transit (Uncollected)</span>
              <span className="font-heading font-black text-2xl text-[var(--text-primary)] block">
                {formatPrice(report.pendingCash)}
              </span>
              <span className="text-[11px] text-amber-600 font-bold block">Pending courier delivery</span>
            </div>

            <div className="p-5 rounded-3xl bg-[var(--surface-elevated)] border border-[var(--border)] shadow-xs space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-[var(--text-muted)] block">Defective Returns &amp; Refunds</span>
              <span className="font-heading font-black text-2xl text-rose-600 block">
                {formatPrice(report.totalRefunds)}
              </span>
              <span className="text-[11px] text-rose-600 font-bold block">
                {report.returnedCount} returned at delivery
              </span>
            </div>
          </div>

          {/* Top Products Table */}
          <div className="bg-[var(--surface-elevated)] p-6 rounded-3xl border border-[var(--border)] shadow-xs space-y-4">
            <h2 className="font-heading font-black text-lg text-[var(--text-primary)] flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-[var(--primary)]" />
              <span>Top Best-Selling Toys (Delivered)</span>
            </h2>

            {report.topProducts.length === 0 ? (
              <p className="text-xs text-[var(--text-muted)]">No product sales recorded in selected timeframe.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-[var(--surface-container-low)] text-[var(--text-muted)] uppercase tracking-wider font-extrabold border-b border-[var(--border)]">
                    <tr>
                      <th className="py-3 px-4">Toy Name</th>
                      <th className="py-3 px-4">Units Sold</th>
                      <th className="py-3 px-4 text-right">Revenue Generated</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--border)] font-medium">
                    {report.topProducts.map((p: any, idx: number) => (
                      <tr key={idx} className="hover:bg-[var(--surface-container-low)]/50 transition-colors">
                        <td className="py-3 px-4 font-bold text-[var(--text-primary)]">{p.name}</td>
                        <td className="py-3 px-4">{p.quantity} units</td>
                        <td className="py-3 px-4 text-right font-black text-[var(--primary)]">
                          {formatPrice(p.revenue)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
