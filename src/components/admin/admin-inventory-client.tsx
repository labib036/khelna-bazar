"use client";

import { useState, useTransition } from "react";
import { formatPrice } from "@/lib/utils";
import { restockSku } from "@/server/actions/inventory-actions";
import { Plus, Minus, AlertTriangle, CheckCircle, Search } from "lucide-react";
import { toast } from "sonner";

export interface InventoryItem {
  variantId: string;
  productId: string;
  name: string;
  sku: string;
  title: string;
  price: number;
  stock: number;
}

interface AdminInventoryClientProps {
  initialItems: InventoryItem[];
}

export function AdminInventoryClient({ initialItems }: AdminInventoryClientProps) {
  const [items, setItems] = useState<InventoryItem[]>(initialItems);
  const [searchQuery, setSearchQuery] = useState("");
  const [isPending, startTransition] = useTransition();

  const handleAdjust = (variantId: string, sku: string, delta: number) => {
    startTransition(async () => {
      const res = await restockSku(variantId, delta, "Inventory Manager");
      if (res.success && res.newStock !== undefined) {
        setItems((prev) =>
          prev.map((it) => (it.variantId === variantId ? { ...it, stock: res.newStock! } : it))
        );
        toast.success(`SKU ${sku} stock updated (${delta > 0 ? `+${delta}` : delta} -> ${res.newStock} units)`);
      } else {
        toast.error(res.error || "Failed to update stock");
      }
    });
  };

  const filtered = items.filter(
    (i) =>
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
          Warehouse Inventory &amp; Stock Ledger
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
          Atomic database stock adjustments with immutable audit trail logging across all SKUs.
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-[var(--surface-elevated)] p-5 rounded-3xl border border-[var(--border)] shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by SKU or toy name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-[var(--border)] text-xs focus:outline-none focus:border-[var(--primary)] bg-[var(--surface)] text-[var(--text-primary)]"
          />
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-[var(--surface-elevated)] rounded-3xl border border-[var(--border)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] font-bold uppercase tracking-wider text-[11px]">
                <th className="p-5">SKU</th>
                <th className="p-5">Toy Title &amp; Edition</th>
                <th className="p-5">Unit Price (৳)</th>
                <th className="p-5">Current Stock</th>
                <th className="p-5">Health Status</th>
                <th className="p-5 text-right">Adjust Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-[var(--text-muted)]">
                    No matching SKU inventory found in the database.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.variantId} className="hover:bg-[var(--surface)] transition-colors">
                    <td className="p-5 font-mono font-bold text-[var(--primary)] text-xs">
                      {item.sku}
                    </td>
                    <td className="p-5">
                      <span className="font-bold text-[var(--text-primary)] block line-clamp-1">
                        {item.name}
                      </span>
                      <span className="text-[11px] text-[var(--text-muted)]">
                        {item.title}
                      </span>
                    </td>
                    <td className="p-5 font-bold text-[var(--text-primary)]">
                      {formatPrice(item.price)}
                    </td>
                    <td className="p-5 font-black text-sm text-[var(--text-primary)]">
                      {item.stock} units
                    </td>
                    <td className="p-5">
                      {item.stock > 10 ? (
                        <span className="text-[var(--success)] font-bold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Healthy
                        </span>
                      ) : item.stock > 0 ? (
                        <span className="text-[var(--warning)] font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Low Stock
                        </span>
                      ) : (
                        <span className="text-[var(--danger)] font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Out of Stock
                        </span>
                      )}
                    </td>
                    <td className="p-5 text-right space-x-1.5 whitespace-nowrap">
                      <button
                        type="button"
                        disabled={isPending || item.stock <= 0}
                        onClick={() => handleAdjust(item.variantId, item.sku, -1)}
                        className="w-8 h-8 rounded-lg border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--surface)] font-bold inline-flex items-center justify-center disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        title="Decrease by 1"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleAdjust(item.variantId, item.sku, 1)}
                        className="w-8 h-8 rounded-lg border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--surface)] font-bold inline-flex items-center justify-center cursor-pointer transition-colors disabled:opacity-50"
                        title="Increase by 1"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleAdjust(item.variantId, item.sku, 10)}
                        className="px-2.5 h-8 rounded-lg bg-[var(--primary)] text-white font-bold text-[11px] hover:bg-[var(--primary-hover)] inline-flex items-center justify-center cursor-pointer transition-colors shadow-xs disabled:opacity-50"
                        title="Restock +10"
                      >
                        +10 Restock
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
