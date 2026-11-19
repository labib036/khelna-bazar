"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ToyProduct } from "@/types/store";
import { getAdminProducts, saveProduct, deleteProduct } from "@/server/actions/product-actions";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Package,
  Plus,
  Search,
  Trash2,
  Edit,
  Check,
  X,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ToyProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  useEffect(() => {
    let mounted = true;
    getAdminProducts().then((res) => {
      if (mounted) {
        setProducts(res.products);
        setLoading(false);
      }
    });
    return () => {
      mounted = false;
    };
  }, []);

  // New product form states
  const [newName, setNewName] = useState("");
  const [newCategory, setNewCategory] = useState("Building Blocks & Construction");
  const [newPrice, setNewPrice] = useState("1850");
  const [newStock, setNewStock] = useState("25");
  const [newMinAge, setNewMinAge] = useState("36");
  const [newChoking, setNewChoking] = useState(false);

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error("Please enter toy name.");
      return;
    }

    const priceNum = parseInt(newPrice) || 1000;
    const stockNum = parseInt(newStock) || 10;
    const minAge = parseInt(newMinAge) || 36;
    const slug = newName.toLowerCase().replace(/[^a-z0-9]+/g, "-");

    try {
      const res = await saveProduct({
        name: newName,
        slug,
        basePrice: priceNum,
        comparePrice: Math.round(priceNum * 1.2),
        stock: stockNum,
        categorySlug: newCategory.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        minAgeMonths: minAge,
        maxAgeMonths: undefined,
        chokingHazard: newChoking,
        descriptionHtml: `<p>${newName}</p>`,
      });

      if (!res.success) {
        toast.error(res.error || "Failed to publish product");
        return;
      }

      toast.success(`Published "${newName}" to store catalog!`);
      setShowAddModal(false);
      setNewName("");
      const updated = await getAdminProducts();
      setProducts(updated.products);
    } catch (err: any) {
      toast.error(err.message || "Failed to create product");
    }
  };

  const handleDeleteProduct = async (id: string, name: string) => {
    if (!confirm(`Are you sure you want to delete ${name}?`)) return;
    try {
      const res = await deleteProduct(id);
      if (!res.success) {
        toast.error(res.error || "Failed to delete product");
        return;
      }
      setProducts(products.filter((p) => p.id !== id));
      toast.info(`Deleted ${name} from catalog.`);
    } catch (err: any) {
      toast.error(err.message || "Failed to delete product");
    }
  };

  const handleStockUpdate = (id: string, newQty: number) => {
    setProducts(
      products.map((p) => (p.id === id ? { ...p, stock: Math.max(0, newQty) } : p))
    );
    toast.success("Stock quantity updated.");
  };

  const filtered = products.filter((p) =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-black text-[#18191F] dark:text-white">
              Toy Product Catalog ({products.length})
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Add new toy models, manage prices, and check safety specifications.
            </p>
          </div>

          <Button
            onClick={() => setShowAddModal(true)}
            variant="primary"
            size="sm"
            className="gap-1.5 shadow-xs"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Toy</span>
          </Button>
        </div>

        {/* Search */}
        <div className="bg-white dark:bg-[#1B1C24] p-5 rounded-3xl border border-[#E8E2DE] dark:border-[#2E303E] shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search products by title or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-[#DC012B] bg-[#FAF8F6] dark:bg-[#242531]"
            />
          </div>
        </div>

        {/* Products Table */}
        <div className="bg-white dark:bg-[#1B1C24] rounded-3xl border border-[#E8E2DE] dark:border-[#2E303E] overflow-hidden shadow-sm">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#E8E2DE] dark:border-[#2E303E] bg-[#FAF8F6] dark:bg-[#242531] text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                <th className="p-5">Toy Image &amp; Title</th>
                <th className="p-5">Category</th>
                <th className="p-5">Age Range</th>
                <th className="p-5">Price (৳)</th>
                <th className="p-5">Stock</th>
                <th className="p-5">Choking Warning</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-[#DC012B]" />
                    <span>Loading catalog products...</span>
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-slate-400">
                    No products found in the catalog.
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => (
                  <tr key={prod.id} className="hover:bg-[#FAF8F6] dark:hover:bg-[#242531] transition-colors">
                  <td className="p-5">
                    <div className="flex items-center gap-3.5">
                      <div className="relative w-12 h-12 rounded-2xl overflow-hidden bg-slate-100 shrink-0 border border-slate-200">
                        <Image src={prod.images[0]} alt={prod.name} fill className="object-cover" sizes="48px" />
                      </div>
                      <div className="min-w-0 max-w-xs">
                        <span className="font-bold text-[#18191F] dark:text-white line-clamp-1 block text-xs">
                          {prod.name}
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {prod.variants[0]?.sku || "SKU-DEF"}
                        </span>
                      </div>
                    </div>
                  </td>

                  <td className="p-5 text-slate-600 dark:text-slate-300 font-medium">
                    {prod.category}
                  </td>

                  <td className="p-4 font-semibold text-[#18191F] dark:text-white">
                    {Math.floor(prod.minAgeMonths / 12)}+ Yrs
                  </td>

                  <td className="p-4 font-black text-sm text-[#DC012B]">
                    {formatPrice(prod.basePrice)}
                  </td>

                  <td className="p-4">
                    <span
                      className={`font-bold px-2 py-0.5 rounded-full ${
                        prod.stock > 10
                          ? "bg-emerald-100 text-emerald-800"
                          : prod.stock > 0
                          ? "bg-amber-100 text-amber-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {prod.stock} units
                    </span>
                  </td>

                  <td className="p-4">
                    {prod.chokingHazard ? (
                      <span className="text-[#FF6B6B] font-bold flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" /> Warning
                      </span>
                    ) : (
                      <span className="text-[#2EC4B6] font-bold">Safe (0+)</span>
                    )}
                  </td>

                  <td className="p-4 text-right">
                    <button
                      onClick={() => handleDeleteProduct(prod.id, prod.name)}
                      className="p-1.5 text-slate-400 hover:text-[#FF6B6B] transition-colors cursor-pointer"
                      title="Delete Product"
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

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setShowAddModal(false)} />

            <form
              onSubmit={handleCreateProduct}
              className="relative w-full max-w-lg bg-white dark:bg-[#1B1C24] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4 z-10 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
                <h3 className="font-heading font-black text-lg text-[#18191F] dark:text-white">
                  Add New Toy Product
                </h3>
                <button onClick={() => setShowAddModal(false)} className="p-1.5 text-slate-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Toy Name *</label>
                  <Input
                    placeholder="e.g. Deluxe Magnetic Architecture Bricks"
                    value={newName}
                    onChange={(e) => setNewName(e.target.value)}
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Price (BDT ৳) *</label>
                    <Input
                      type="number"
                      placeholder="1850"
                      value={newPrice}
                      onChange={(e) => setNewPrice(e.target.value)}
                      required
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Initial Stock *</label>
                    <Input
                      type="number"
                      placeholder="25"
                      value={newStock}
                      onChange={(e) => setNewStock(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Category</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value)}
                      className="w-full h-11 px-3 rounded-2xl border border-slate-200 text-xs"
                    >
                      <option value="Building Blocks & Construction">Building Blocks</option>
                      <option value="STEM & Science Kits">STEM &amp; Science</option>
                      <option value="RC & Remote Control Vehicles">RC Vehicles</option>
                      <option value="Baby & Toddler Toys">Baby &amp; Toddler</option>
                      <option value="Plush & Stuffed Animals">Plush &amp; Dolls</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300">Min Age (Months)</label>
                    <Input
                      type="number"
                      placeholder="36"
                      value={newMinAge}
                      onChange={(e) => setNewMinAge(e.target.value)}
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 dark:text-slate-300">
                    <input
                      type="checkbox"
                      checked={newChoking}
                      onChange={(e) => setNewChoking(e.target.checked)}
                      className="w-4 h-4 rounded text-[#FF6B6B]"
                    />
                    <span>Flag Choking Hazard Warning (Contains small parts)</span>
                  </label>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
                <Button type="submit" variant="primary" size="sm" className="flex-1">
                  Publish to Store
                </Button>
                <Button type="button" onClick={() => setShowAddModal(false)} variant="ghost" size="sm">
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}
      </div>
  );
}
