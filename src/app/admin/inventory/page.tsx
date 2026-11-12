"use client";

import { useState } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { MOCK_PRODUCTS } from "@/server/mock-data";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Layers, Plus, Minus, AlertTriangle, CheckCircle, Search } from "lucide-react";
import { toast } from "sonner";

export default function AdminInventoryPage() {
  const [items, setItems] = useState(
    MOCK_PRODUCTS.flatMap((p) =>
      p.variants.map((v) => ({
        id: v.id,
        productId: p.id,
        name: p.name,
        sku: v.sku,
        title: v.title,
        price: v.price,
        stock: v.stock,
      }))
    )
  );

  const [searchQuery, setSearchQuery] = useState("");

  const handleAdjust = (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, stock: Math.max(0, i.stock + delta) } : i))
    );
    toast.success(`Inventory updated (${delta > 0 ? `+${delta}` : delta})`);
  };

  const filtered = items.filter(
    (i) =>
      i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      i.sku.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-[#14213D] dark:text-white">
            Warehouse Inventory &amp; Stock Levels
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time SKU stock tracking, quick restock adjustments, and low inventory alerts.
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white dark:bg-[#161D33] p-4 rounded-2xl border border-[#E3E8F2] dark:border-[#263050]">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by SKU or toy name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#1E5BFF]"
            />
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white dark:bg-[#161D33] rounded-3xl border border-[#E3E8F2] dark:border-[#263050] overflow-hidden shadow-xs">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#E3E8F2] dark:border-[#263050] bg-slate-50 dark:bg-[#1E2742] text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4">SKU</th>
                <th className="p-4">Toy Title &amp; Edition</th>
                <th className="p-4">Unit Price (৳)</th>
                <th className="p-4">Current Stock</th>
                <th className="p-4">Health Status</th>
                <th className="p-4 text-right">Adjust Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filtered.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50 dark:hover:bg-[#1E2742] transition-colors">
                  <td className="p-4 font-mono font-bold text-[#1E5BFF]">{item.sku}</td>
                  <td className="p-4">
                    <span className="font-bold text-[#14213D] dark:text-white block line-clamp-1">
                      {item.name}
                    </span>
                    <span className="text-[11px] text-slate-400">{item.title}</span>
                  </td>
                  <td className="p-4 font-bold text-slate-700 dark:text-slate-300">
                    {formatPrice(item.price)}
                  </td>
                  <td className="p-4 font-black text-sm text-[#14213D] dark:text-white">
                    {item.stock} units
                  </td>
                  <td className="p-4">
                    {item.stock > 10 ? (
                      <span className="text-emerald-600 font-bold flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Healthy
                      </span>
                    ) : item.stock > 0 ? (
                      <span className="text-amber-600 font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Low Stock
                      </span>
                    ) : (
                      <span className="text-red-600 font-bold">Out of Stock</span>
                    )}
                  </td>
                  <td className="p-4 text-right">
                    <div className="inline-flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                      <button
                        onClick={() => handleAdjust(item.id, -1)}
                        className="w-6 h-6 rounded-lg bg-white dark:bg-[#161D33] text-slate-600 flex items-center justify-center hover:bg-slate-200"
                        title="-1 Unit"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <button
                        onClick={() => handleAdjust(item.id, +5)}
                        className="px-2 py-0.5 rounded-lg bg-white dark:bg-[#161D33] text-slate-600 font-bold text-[10px] hover:bg-slate-200"
                        title="+5 Restock"
                      >
                        +5
                      </button>
                      <button
                        onClick={() => handleAdjust(item.id, +20)}
                        className="px-2 py-0.5 rounded-lg bg-[#1E5BFF] text-white font-bold text-[10px] hover:bg-[#1546CC]"
                        title="+20 Batch Restock"
                      >
                        +20
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
