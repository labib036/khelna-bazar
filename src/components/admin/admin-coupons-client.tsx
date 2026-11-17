"use client";

import { useState, useTransition } from "react";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createCoupon, toggleCouponActive, deleteCoupon } from "@/server/actions/coupon-actions";
import { Tag, Plus, Trash2, X, Loader2 } from "lucide-react";
import { toast } from "sonner";

export interface CouponItem {
  id: string;
  code: string;
  type: string;
  value: number;
  minSpend: number;
  maxDiscount?: number | null;
  usageCount: number;
  active: boolean;
  endsAt?: string | null;
}

interface AdminCouponsClientProps {
  initialCoupons: CouponItem[];
}

export function AdminCouponsClient({ initialCoupons }: AdminCouponsClientProps) {
  const [coupons, setCoupons] = useState<CouponItem[]>(initialCoupons);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newCode, setNewCode] = useState("");
  const [newType, setNewType] = useState<"PERCENTAGE" | "FIXED" | "FREE_SHIPPING">("PERCENTAGE");
  const [newValue, setNewValue] = useState("10");
  const [newMinSpend, setNewMinSpend] = useState("1000");
  const [isPending, startTransition] = useTransition();

  const handleCreateCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCode.trim()) {
      toast.error("Please enter a coupon code.");
      return;
    }

    const cleanCode = newCode.trim().toUpperCase().replace(/[^A-Z0-9]/g, "");
    const valNum = parseInt(newValue) || 10;
    const minSpendNum = parseInt(newMinSpend) || 500;
    const expires = new Date(Date.now() + 60 * 86400000).toISOString();

    startTransition(async () => {
      const res = await createCoupon({
        code: cleanCode,
        type: newType,
        value: valNum,
        minSpend: minSpendNum,
        usageLimit: 1000,
        expiresAt: expires,
      });

      if (res.success && res.coupon) {
        toast.success(`Coupon ${res.coupon.code} created!`);
        setCoupons((prev) => [
          {
            id: res.coupon.id,
            code: res.coupon.code,
            type: res.coupon.type,
            value: res.coupon.value,
            minSpend: res.coupon.minSpend,
            maxDiscount: res.coupon.maxDiscount,
            usageCount: 0,
            active: true,
            endsAt: expires,
          },
          ...prev,
        ]);
        setShowAddModal(false);
        setNewCode("");
      } else {
        toast.error(res.error || "Failed to create coupon");
      }
    });
  };

  const handleToggle = (id: string) => {
    startTransition(async () => {
      const res = await toggleCouponActive(id);
      if (res.success && res.coupon) {
        setCoupons((prev) =>
          prev.map((c) => (c.id === id ? { ...c, active: res.coupon.active } : c))
        );
        toast.success("Coupon status toggled.");
      } else {
        toast.error(res.error || "Failed to toggle status");
      }
    });
  };

  const handleDelete = (id: string, code: string) => {
    if (!confirm(`Are you sure you want to delete coupon "${code}"?`)) return;

    startTransition(async () => {
      const res = await deleteCoupon(id);
      if (res.success) {
        setCoupons((prev) => prev.filter((c) => c.id !== id));
        toast.info(`Deleted coupon ${code}`);
      } else {
        toast.error(res.error || "Failed to delete coupon");
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-[var(--text-primary)] flex items-center gap-2.5">
            <Tag className="w-6 h-6 text-[var(--primary)]" />
            <span>Promotional Coupons &amp; Discounts</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
            Database-backed promo codes, usage counter, and minimum spend rules.
          </p>
        </div>

        <Button
          onClick={() => setShowAddModal(true)}
          variant="primary"
          size="sm"
          className="gap-1.5 shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Create Coupon</span>
        </Button>
      </div>

      {/* Coupons Table */}
      <div className="bg-[var(--surface-elevated)] rounded-3xl border border-[var(--border)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] font-bold uppercase tracking-wider text-[11px]">
                <th className="p-5">Coupon Code</th>
                <th className="p-5">Discount Type</th>
                <th className="p-5">Benefit</th>
                <th className="p-5">Min. Spend</th>
                <th className="p-5">Times Used</th>
                <th className="p-5">Validity</th>
                <th className="p-5">Status</th>
                <th className="p-5 text-right">Delete</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {coupons.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-[var(--text-muted)]">
                    No active coupons found in database. Create one above!
                  </td>
                </tr>
              ) : (
                coupons.map((c) => (
                  <tr key={c.id} className="hover:bg-[var(--surface)] transition-colors">
                    <td className="p-5 font-mono font-black text-sm text-[var(--primary)]">
                      {c.code}
                    </td>
                    <td className="p-5 text-[var(--text-muted)] font-semibold">{c.type}</td>
                    <td className="p-5 font-bold text-[var(--text-primary)]">
                      {c.type === "PERCENTAGE"
                        ? `${c.value}% OFF`
                        : c.type === "FIXED"
                        ? `${formatPrice(c.value)} OFF`
                        : "FREE Delivery"}
                    </td>
                    <td className="p-5 font-semibold text-[var(--text-muted)]">
                      {formatPrice(c.minSpend)}
                    </td>
                    <td className="p-5 font-semibold text-[var(--text-muted)]">
                      {c.usageCount || 0} times
                    </td>
                    <td className="p-5 text-[var(--text-muted)]">
                      {c.endsAt ? new Date(c.endsAt).toLocaleDateString("en-GB") : "Ongoing"}
                    </td>
                    <td className="p-5">
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleToggle(c.id)}
                        className={`px-3 py-1 rounded-full text-[11px] font-bold cursor-pointer transition-colors ${
                          c.active
                            ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                            : "bg-[var(--surface)] text-[var(--text-muted)] border border-[var(--border)]"
                        }`}
                      >
                        {c.active ? "Active" : "Disabled"}
                      </button>
                    </td>
                    <td className="p-5 text-right">
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleDelete(c.id, c.code)}
                        className="p-1.5 text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors cursor-pointer disabled:opacity-50"
                        title="Delete Coupon"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Coupon Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setShowAddModal(false)} />
          <form
            onSubmit={handleCreateCoupon}
            className="relative w-full max-w-md bg-[var(--surface-elevated)] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 z-10 border border-[var(--border)]"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h3 className="font-heading font-black text-lg text-[var(--text-primary)]">
                Create New Coupon Code
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-primary)]">Coupon Code *</label>
                <Input
                  placeholder="e.g. SUMMER20"
                  value={newCode}
                  onChange={(e) => setNewCode(e.target.value.toUpperCase())}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-primary)]">Discount Type</label>
                <select
                  value={newType}
                  onChange={(e) =>
                    setNewType(e.target.value as "PERCENTAGE" | "FIXED" | "FREE_SHIPPING")
                  }
                  className="w-full h-11 px-3 rounded-2xl border border-[var(--border)] text-xs bg-[var(--surface)] text-[var(--text-primary)]"
                >
                  <option value="PERCENTAGE">Percentage Discount (%)</option>
                  <option value="FIXED">Fixed Amount Discount (৳)</option>
                  <option value="FREE_SHIPPING">Free Delivery Waiver</option>
                </select>
              </div>

              {newType !== "FREE_SHIPPING" && (
                <div className="space-y-1">
                  <label className="text-xs font-bold text-[var(--text-primary)]">
                    {newType === "PERCENTAGE" ? "Discount Percentage (%)" : "Discount Amount (BDT ৳)"}
                  </label>
                  <Input
                    type="number"
                    placeholder={newType === "PERCENTAGE" ? "15" : "200"}
                    value={newValue}
                    onChange={(e) => setNewValue(e.target.value)}
                    required
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-primary)]">Minimum Spend Required (৳)</label>
                <Input
                  type="number"
                  placeholder="1000"
                  value={newMinSpend}
                  onChange={(e) => setNewMinSpend(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="flex gap-2 pt-3 border-t border-[var(--border)]">
              <Button type="submit" disabled={isPending} variant="primary" size="sm" className="flex-1 font-bold">
                {isPending && <Loader2 className="w-4 h-4 animate-spin mr-1.5" />}
                <span>Publish Coupon</span>
              </Button>
              <Button type="button" onClick={() => setShowAddModal(false)} variant="outline" size="sm">
                Cancel
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
