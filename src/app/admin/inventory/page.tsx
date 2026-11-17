"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { getAdminProducts, updateVariantStock } from "@/server/actions/product-actions";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Layers, Plus, Minus, AlertTriangle, CheckCircle, Search, Loader2 } from "lucide-react";
import { toast } from "sonner";

interface InventoryItem {
  id: string;
  productId: string;
  name: string;
  sku: string;
  title: string;
  price: number;
  stock: number;
}

export default function AdminInventoryPage() {
  const [items, setItems] = useState<InventoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let mounted = true;
    getAdminProducts().then((res) => {
      if (mounted) {
        const flattened = res.products.flatMap((p) =>
          p.variants.map((v) => ({
            id: v.id,
            productId: p.id,
            name: p.name,
            sku: v.sku,
            title: v.title,
            price: v.price,
            stock: v.stock,
          }))
        );
        setItems(flattened);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  const handleAdjust = async (id: string, delta: number) => {
    setItems((prev) =>
      prev.map((i) => (i.id === id ? { ...i, stock: Math.max(0, i.stock + delta) } : i))
    );
    try {
      await updateVariantStock(id, delta);
      toast.success(`Inventory updated (${delta > 0 ? `+${delta}` : delta})`);
    } catch {
      toast.error("Failed to update stock in database");
    }
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
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-[#18191F] dark:text-white">
            Warehouse Inventory &amp; Stock Levels
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time SKU stock tracking, quick restock adjustments, and low inventory alerts.
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white dark:bg-[#1B1C24] p-5 rounded-3xl border border-[#E8E2DE] dark:border-[#2E303E] shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by SKU or toy name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-[#DC012B] bg-[#FAF8F6] dark:bg-[#242531]"
            />
          </div>
        </div>

        {/* Inventory Table */}
        <div className="bg-white dark:bg-[#1B1C24] rounded-3xl border border-[#E8E2DE] dark:border-[#2E303E] overflow-hidden shadow-sm">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#E8E2DE] dark:border-[#2E303E] bg-[#FAF8F6] dark:bg-[#242531] text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="p-5">SKU</th>
                <th className="p-5">Toy Title &amp; Edition</th>
                <th className="p-5">Unit Price (৳)</th>
                <th className="p-5">Current Stock</th>
                <th className="p-5">Health Status</th>
                <th className="p-5 text-right">Adjust Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#DC012B]" />
                    <span>Loading inventory stock...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-slate-400">
                    No inventory SKUs found.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="hover:bg-[#FAF8F6] dark:hover:bg-[#242531] transition-colors">
                    <td className="p-5 font-mono font-bold text-[#DC012B] text-xs">{item.sku}</td>
                    <td className="p-5">
                      <span className="font-bold text-[#18191F] dark:text-white block line-clamp-1">
                        {item.name}
                      </span>
                      <span className="text-[11px] text-slate-400">{item.title}</span>
                    </td>
                    <td className="p-5 font-bold text-slate-700 dark:text-slate-300">
                      {formatPrice(item.price)}
                    </td>
                    <td className="p-5 font-black text-sm text-[#18191F] dark:text-white">
                      {item.stock} units
                    </td>
                    <td className="p-5">
                      {item.stock > 10 ? (
                        <span className="text-emerald-600 font-bold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Healthy
                        </span>
                      ) : item.stock > 0 ? (
                        <span className="text-amber-600 font-bold flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5" /> Low Stock
                        </span>
                      ) : (
                        <span className="text-rose-600 font-bold">Out of Stock</span>
                      )}
                    </td>
                    <td className="p-5 text-right">
                      <div className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-xl">
                        <button
                          onClick={() => handleAdjust(item.id, -1)}
                          className="w-7 h-7 rounded-lg bg-white dark:bg-[#1B1C24] text-slate-600 dark:text-slate-200 flex items-center justify-center hover:bg-slate-200 cursor-pointer shadow-xs"
                          title="-1 Unit"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleAdjust(item.id, +5)}
                          className="px-2.5 py-1 rounded-lg bg-white dark:bg-[#1B1C24] text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-200 cursor-pointer shadow-xs"
                          title="+5 Restock"
                        >
                          +5
                        </button>
                        <button
                          onClick={() => handleAdjust(item.id, +20)}
                          className="px-2.5 py-1 rounded-lg bg-[#DC012B] text-white font-bold text-xs hover:bg-[#B80023] cursor-pointer shadow-xs"
                          title="+20 Batch Restock"
                        >
                          +20
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  );
}
