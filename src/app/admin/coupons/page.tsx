"use client";

import { useState } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tag, Plus, Check, Trash2, X, Sparkles } from "lucide-react";
import { toast } from "sonner";

interface CouponItem {
  id: string;
  code: string;
  type: "PERCENTAGE" | "FIXED" | "FREE_SHIPPING";
  value: number;
  minSpend: number;
  active: boolean;
  expiresIn: string;
}

const INITIAL_COUPONS: CouponItem[] = [
  {
    id: "c-1",
    code: "PLAY10",
    type: "PERCENTAGE",
    value: 10,
    minSpend: 1000,
    active: true,
    expiresIn: "90 Days",
  },
  {
    id: "c-2",
    code: "FREESHIP",
    type: "FREE_SHIPPING",
    value: 120,
    minSpend: 1500,
    active: true,
    expiresIn: "60 Days",
  },
  {
    id: "c-3",
    code: "WELCOME10",
    type: "PERCENTAGE",
    value: 10,
    minSpend: 800,
    active: true,
    expiresIn: "365 Days",
  },
  {
    id: "c-4",
    code: "EIDKID200",
    type: "FIXED",
    value: 200,
    minSpend: 2500,
    active: true,
    expiresIn: "30 Days",
  },
];

export default function AdminCouponsPage() {
  const [coupons, setCoupons] = useState<CouponItem[]>(INITIAL_COUPONS);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newType, setNewType] = useState<"PERCENTAGE" | "FIXED" | "FREE_SHIPPING">("PERCENTAGE");
  const [newValue, setNewValue] = useState("10");
  const [newMinSpend, setNewMinSpend] = useState("1000");

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) {
      toast.error("Please enter a coupon code.");
      return;
    }

    const created: CouponItem = {
      id: `c-${Date.now()}`,
      code: newCode.trim().toUpperCase(),
      type: newType,
      value: parseInt(newValue) || 10,
      minSpend: parseInt(newMinSpend) || 500,
      active: true,
      expiresIn: "60 Days",
    };

    setCoupons([created, ...coupons]);
    setShowAddModal(false);
    setNewCode("");
    toast.success(`Coupon ${created.code} created!`);
  };

  const handleToggle = (id: string) => {
    setCoupons((prev) =>
      prev.map((c) => (c.id === id ? { ...c, active: !c.active } : c))
    );
    toast.success("Coupon status toggled.");
  };

  const handleDelete = (id: string, code: string) => {
    setCoupons(coupons.filter((c) => c.id !== id));
    toast.info(`Deleted coupon ${code}`);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-black text-[#14213D] dark:text-white flex items-center gap-2">
              <Tag className="w-6 h-6 text-[#1E5BFF]" />
              <span>Promotional Coupons &amp; Discounts</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Create discount promo codes for flash campaigns and newsletter welcome gifts.
            </p>
          </div>

          <Button onClick={() => setShowAddModal(true)} variant="primary" size="sm" className="gap-1.5 shadow-xs">
            <Plus className="w-4 h-4" />
            <span>Create Coupon</span>
          </Button>
        </div>

        {/* Coupons Table */}
        <div className="bg-white dark:bg-[#161D33] rounded-3xl border border-[#E3E8F2] dark:border-[#263050] overflow-hidden shadow-xs">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#E3E8F2] dark:border-[#263050] bg-slate-50 dark:bg-[#1E2742] text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4">Coupon Code</th>
                <th className="p-4">Discount Type</th>
                <th className="p-4">Benefit</th>
                <th className="p-4">Min. Spend</th>
                <th className="p-4">Validity</th>
                <th className="p-4">Active</th>
                <th className="p-4 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {coupons.map((c) => (
                <tr key={c.id} className="hover:bg-slate-50 dark:hover:bg-[#1E2742] transition-colors">
                  <td className="p-4 font-mono font-black text-sm text-[#1E5BFF]">{c.code}</td>
                  <td className="p-4 text-slate-600 dark:text-slate-300 font-semibold">{c.type}</td>
                  <td className="p-4 font-bold text-[#14213D] dark:text-white">
                    {c.type === "PERCENTAGE"
                      ? `${c.value}% OFF`
                      : c.type === "FIXED"
                      ? `${formatPrice(c.value)} OFF`
                      : "FREE Delivery"}
                  </td>
                  <td className="p-4 font-semibold text-slate-600 dark:text-slate-300">
                    {formatPrice(c.minSpend)}
                  </td>
                  <td className="p-4 text-slate-500">{c.expiresIn}</td>
                  <td className="p-4">
                    <button
                      onClick={() => handleToggle(c.id)}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold cursor-pointer transition-colors ${
                        c.active ? "bg-emerald-100 text-emerald-800" : "bg-slate-200 text-slate-500"
                      }`}
                    >
                      {c.active ? "Active" : "Disabled"}
                    </button>
                  </td>
                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDelete(c.id, c.code)}
                      className="p-1.5 text-slate-400 hover:text-[#FF6B6B] transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50" onClick={() => setShowAddModal(false)} />
            <form
              onSubmit={handleCreateCoupon}
              className="relative w-full max-w-md bg-white dark:bg-[#161D33] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 z-10"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <h3 className="font-heading font-black text-base text-[#14213D] dark:text-white">
                  Create Promotional Code
                </h3>
                <button onClick={() => setShowAddModal(false)} className="p-1 text-slate-400">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Code (Uppercase)</label>
                  <Input
                    placeholder="e.g. FLASH15"
                    value={newCode}
                    onChange={(e) => setNewCode(e.target.value)}
                    required
                    className="uppercase font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Type</label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as any)}
                      className="w-full h-11 px-3 rounded-2xl border border-slate-200 text-xs"
                    >
                      <option value="PERCENTAGE">Percentage (%)</option>
                      <option value="FIXED">Fixed Taka (৳)</option>
                      <option value="FREE_SHIPPING">Free Delivery</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Value</label>
                    <Input
                      type="number"
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Minimum Order Spend (৳)</label>
                  <Input
                    type="number"
                    value={newMinSpend}
                    onChange={(e) => setNewMinSpend(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-3">
                <Button type="submit" variant="primary" size="sm" className="flex-1">
                  Save Coupon
                </Button>
                <Button type="button" onClick={() => setShowAddModal(false)} variant="ghost" size="sm">
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
