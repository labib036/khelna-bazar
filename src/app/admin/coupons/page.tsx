"use client";

import { useState, useEffect } from "react";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  getAdminCoupons,
  createCoupon,
  toggleCouponActive,
  deleteCoupon,
} from "@/server/actions/coupon-actions";
import { Tag, Plus, Check, Trash2, X, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";

interface CouponRecord {
  id: string;
  code: string;
  type: string;
  value: number;
  minSpend: number;
  active: boolean;
  endsAt: Date | string;
  usageCount: number;
  usageLimit: number;
}

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newType, setNewType] = useState<"PERCENTAGE" | "FIXED_AMOUNT" | "FREE_SHIPPING">("PERCENTAGE");
  const [newValue, setNewValue] = useState("10");
  const [newMinSpend, setNewMinSpend] = useState("1000");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const loadCoupons = async () => {
    setLoading(true);
    const res = await getAdminCoupons();
    if (res.success && res.coupons) {
      setCoupons(res.coupons as any);
    } else {
      toast.error(res.error || "Failed to fetch coupons.");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCoupons();
  }, []);

  const handleCreateCoupon = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) {
      toast.error("Please enter a coupon code.");
      return;
    }

    setIsSubmitting(true);
    const res = await createCoupon({
      code: newCode.trim().toUpperCase(),
      type: newType,
      value: parseInt(newValue) || 10,
      minSpend: parseInt(newMinSpend) || 500,
    });
    setIsSubmitting(false);

    if (res.success) {
      toast.success(`Coupon "${newCode.toUpperCase()}" created successfully!`);
      setShowAddModal(false);
      setNewCode("");
      await loadCoupons();
    } else {
      toast.error(res.error || "Failed to create coupon.");
    }
  };

  const handleToggle = async (id: string) => {
    const res = await toggleCouponActive(id);
    if (res.success) {
      toast.success("Coupon status toggled.");
      await loadCoupons();
    } else {
      toast.error(res.error || "Failed to toggle coupon.");
    }
  };

  const handleDelete = async (id: string, code: string) => {
    const res = await deleteCoupon(id);
    if (res.success) {
      toast.info(`Deleted coupon ${code}`);
      await loadCoupons();
    } else {
      toast.error(res.error || "Failed to delete coupon.");
    }
  };

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-black text-[#18191F] dark:text-white flex items-center gap-2.5">
              <Tag className="w-6 h-6 text-[#DC012B]" />
              <span>Promotional Coupons &amp; Discounts</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Create discount promo codes for flash campaigns and customer savings.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              onClick={loadCoupons}
              variant="outline"
              size="sm"
              className="gap-1.5 cursor-pointer"
              disabled={loading}
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              <span>Refresh</span>
            </Button>
            <Button
              onClick={() => setShowAddModal(true)}
              variant="primary"
              size="sm"
              className="gap-1.5 shadow-sm bg-[#DC012B] hover:bg-[#B80023] text-white cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Create Coupon</span>
            </Button>
          </div>
        </div>

        {/* Coupons Table */}
        <div className="bg-white dark:bg-[#1B1C24] rounded-3xl border border-[#E8E2DE] dark:border-[#2E303E] overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-[#DC012B]" />
              <span>Loading coupons from database...</span>
            </div>
          ) : coupons.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No promotional coupons created yet. Click &quot;Create Coupon&quot; to add one.
            </div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#E8E2DE] dark:border-[#2E303E] bg-[#FAF8F6] dark:bg-[#242531] text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="p-5">Coupon Code</th>
                  <th className="p-5">Discount Type</th>
                  <th className="p-5">Benefit</th>
                  <th className="p-5">Min. Spend</th>
                  <th className="p-5">Usage</th>
                  <th className="p-5">Active Status</th>
                  <th className="p-5 text-right">Delete</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-[#FAF8F6] dark:hover:bg-[#242531] transition-colors">
                    <td className="p-5">
                      <span className="font-mono font-black text-sm text-[#DC012B] bg-[#FFF0F2] px-2.5 py-1 rounded-lg">
                        {c.code}
                      </span>
                    </td>
                    <td className="p-5 font-bold text-slate-600 dark:text-slate-300">
                      {c.type.replace(/_/g, " ")}
                    </td>
                    <td className="p-5 font-black text-sm text-[#18191F] dark:text-white">
                      {c.type === "PERCENTAGE"
                        ? `${c.value}% OFF`
                        : c.type === "FREE_SHIPPING"
                        ? "FREE DELIVERY"
                        : formatPrice(c.value) + " OFF"}
                    </td>
                    <td className="p-5 font-bold text-slate-700 dark:text-slate-300">
                      {formatPrice(c.minSpend)}
                    </td>
                    <td className="p-5 text-slate-500 font-mono text-[11px]">
                      {c.usageCount} / {c.usageLimit}
                    </td>
                    <td className="p-5">
                      <button
                        onClick={() => handleToggle(c.id)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                          c.active
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : "bg-slate-100 text-slate-500 dark:bg-slate-800"
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${c.active ? "bg-emerald-500" : "bg-slate-400"}`} />
                        <span>{c.active ? "Active" : "Disabled"}</span>
                      </button>
                    </td>
                    <td className="p-5 text-right">
                      <button
                        onClick={() => handleDelete(c.id, c.code)}
                        className="p-1.5 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"
                        title="Delete coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Add Coupon Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setShowAddModal(false)} />

            <div className="relative w-full max-w-md bg-white dark:bg-[#1B1C24] rounded-4xl p-6 sm:p-8 shadow-2xl space-y-6 z-10">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-heading font-black text-lg text-[#18191F] dark:text-white">
                  Create Promotional Coupon
                </h3>
                <button
                  onClick={() => setShowAddModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateCoupon} className="space-y-4 text-xs">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Coupon Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. SUMMER15"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-mono font-bold uppercase focus:outline-none focus:border-[#DC012B]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700 dark:text-slate-300">Discount Type</label>
                  <select
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                    className="w-full h-11 px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold focus:outline-none focus:border-[#DC012B]"
                  >
                    <option value="PERCENTAGE">Percentage (% Off)</option>
                    <option value="FIXED_AMOUNT">Fixed Amount (৳ Off)</option>
                    <option value="FREE_SHIPPING">Free Shipping</option>
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">
                      Value ({newType === "PERCENTAGE" ? "%" : "৳"})
                    </label>
                    <input
                      type="number"
                      required
                      min={1}
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold focus:outline-none focus:border-[#DC012B]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="font-bold text-slate-700 dark:text-slate-300">Min. Order Spend (৳)</label>
                    <input
                      type="number"
                      required
                      min={0}
                      value={newMinSpend}
                      onChange={(e) => setNewMinSpend(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl border border-slate-300 dark:border-slate-700 text-xs font-bold focus:outline-none focus:border-[#DC012B]"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end gap-2">
                  <Button
                    type="button"
                    onClick={() => setShowAddModal(false)}
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    variant="primary"
                    size="sm"
                    className="bg-[#DC012B] hover:bg-[#B80023] text-white cursor-pointer"
                  >
                    {isSubmitting ? "Creating..." : "Save Coupon"}
                  </Button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
  );
}
