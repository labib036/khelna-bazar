"use client";

import { useState, useTransition } from "react";
import Image from "next/image";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ToyProduct, StoreCategory } from "@/types/store";
import { saveProduct, deleteProduct } from "@/server/actions/product-actions";
import { ImageUploader, UploadedImageItem } from "@/components/admin/image-uploader";
import {
  Plus,
  Search,
  Trash2,
  Edit,
  X,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

interface AdminProductsClientProps {
  initialProducts: ToyProduct[];
  categories: StoreCategory[];
}

export function AdminProductsClient({
  initialProducts,
  categories,
}: AdminProductsClientProps) {
  const [products, setProducts] = useState<ToyProduct[]>(initialProducts);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ToyProduct | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // New product form states
  const [newName, setNewName] = useState("");
  const [newCategorySlug, setNewCategorySlug] = useState(categories[0]?.slug || "building-blocks");
  const [newPrice, setNewPrice] = useState("1850");
  const [newStock, setNewStock] = useState("25");
  const [newMinAge, setNewMinAge] = useState("36");
  const [newChoking, setNewChoking] = useState(false);
  const [newImages, setNewImages] = useState<UploadedImageItem[]>([]);

  // Edit product form states
  const [editName, setEditName] = useState("");
  const [editCategorySlug, setEditCategorySlug] = useState("");
  const [editPrice, setEditPrice] = useState("");
  const [editStock, setEditStock] = useState("");
  const [editChoking, setEditChoking] = useState(false);
  const [editImages, setEditImages] = useState<UploadedImageItem[]>([]);

  const openEditModal = (prod: ToyProduct) => {
    setEditingProduct(prod);
    setEditName(prod.name);
    setEditCategorySlug(prod.categorySlug || categories[0]?.slug || "building-blocks");
    setEditPrice(prod.basePrice.toString());
    setEditStock(prod.stock.toString());
    setEditChoking(prod.chokingHazard ?? false);
    setEditImages(
      prod.images.map((url, i) => ({
        url,
        isPrimary: i === 0,
        alt: `${prod.name} - Photo ${i + 1}`,
      }))
    );
  };

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName.trim()) {
      toast.error("Please enter product name.");
      return;
    }

    if (newImages.length === 0) {
      toast.error("Please upload at least one photo for this toy.");
      return;
    }

    const priceNum = Math.max(1, parseInt(newPrice) || 1000);
    const stockNum = Math.max(0, parseInt(newStock) || 10);
    const imageUrls = newImages.map((img) => img.url);

    startTransition(async () => {
      const res = await saveProduct({
        name: newName.trim(),
        categorySlug: newCategorySlug,
        basePrice: priceNum,
        comparePrice: Math.round(priceNum * 1.2),
        stock: stockNum,
        minAgeMonths: parseInt(newMinAge) || 36,
        maxAgeMonths: 144,
        chokingHazard: newChoking,
        status: "ACTIVE",
        images: imageUrls,
      });

      if (res.success) {
        toast.success(`Published "${newName}" to catalog!`);
        setShowAddModal(false);
        setNewName("");
        setNewImages([]);
        window.location.reload();
      } else {
        toast.error(res.error || "Failed to save product");
      }
    });
  };

  const handleUpdateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;

    if (editImages.length === 0) {
      toast.error("Active products must have at least one photo.");
      return;
    }

    const priceNum = Math.max(1, parseInt(editPrice) || editingProduct.basePrice);
    const stockNum = Math.max(0, parseInt(editStock) || editingProduct.stock);
    const imageUrls = editImages.map((img) => img.url);

    startTransition(async () => {
      const res = await saveProduct({
        id: editingProduct.id,
        name: editName.trim(),
        categorySlug: editCategorySlug || editingProduct.categorySlug,
        basePrice: priceNum,
        comparePrice: editingProduct.comparePrice,
        stock: stockNum,
        chokingHazard: editChoking,
        status: "ACTIVE",
        images: imageUrls,
      });

      if (res.success) {
        toast.success(`Updated "${editName}"!`);
        setEditingProduct(null);
        window.location.reload();
      } else {
        toast.error(res.error || "Failed to update product");
      }
    });
  };

  const handleDeleteProduct = (id: string, name: string) => {
    startTransition(async () => {
      const res = await deleteProduct(id);
      if (res.success) {
        setProducts((prev) => prev.filter((p) => p.id !== id));
        setConfirmDeleteId(null);
        toast.info(`Deleted ${name} from catalog.`);
      } else {
        toast.error(res.error || "Failed to delete product");
      }
    });
  };

  const filtered = products.filter(
    (p) =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.brand.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
            Toy Product Catalog ({products.length})
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
            PostgreSQL-persisted inventory, age appropriateness indicators, and multi-image catalog management.
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
      <div className="bg-[var(--surface-elevated)] p-5 rounded-3xl border border-[var(--border)] shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search products by title or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl border border-[var(--border)] text-xs focus:outline-none focus:border-[var(--primary)] bg-[var(--surface)] text-[var(--text-primary)]"
          />
        </div>
      </div>

      {/* Products Table */}
      <div className="bg-[var(--surface-elevated)] rounded-3xl border border-[var(--border)] overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] font-bold uppercase tracking-wider text-[11px]">
                <th className="p-5">Toy Image &amp; Title</th>
                <th className="p-5">Category</th>
                <th className="p-5">Age Range</th>
                <th className="p-5">Price (৳)</th>
                <th className="p-5">Stock</th>
                <th className="p-5">Safety Warning</th>
                <th className="p-5 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[var(--border)]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-[var(--text-muted)]">
                    No matching toys found in the database.
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => (
                  <tr key={prod.id} className="hover:bg-[var(--surface)] transition-colors">
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="relative w-12 h-12 rounded-xl overflow-hidden bg-white shrink-0 border border-[var(--border)]">
                          <Image
                            src={prod.images[0] || "/images/khelna-bazar-logo.png"}
                            alt={prod.name}
                            fill
                            className="object-cover"
                            sizes="48px"
                          />
                        </div>
                        <div className="min-w-0">
                          <span className="font-bold text-sm text-[var(--text-primary)] block truncate">
                            {prod.name}
                          </span>
                          <span className="text-[11px] text-[var(--text-muted)] block">
                            SKU: {prod.variants[0]?.sku || "N/A"}
                          </span>
                        </div>
                      </div>
                    </td>

                    <td className="p-5 font-semibold text-[var(--text-muted)]">
                      {prod.category}
                    </td>

                    <td className="p-5 text-[var(--text-muted)]">
                      {Math.floor(prod.minAgeMonths / 12)}+ Years
                    </td>

                    <td className="p-5 font-black text-sm text-[var(--text-primary)]">
                      {formatPrice(prod.basePrice)}
                    </td>

                    <td className="p-5">
                      <span
                        className={`inline-block px-2.5 py-1 rounded-full font-bold text-[11px] ${
                          prod.stock <= 5
                            ? "bg-rose-500/15 text-[var(--danger)]"
                            : "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        }`}
                      >
                        {prod.stock} units
                      </span>
                    </td>

                    <td className="p-5">
                      {prod.chokingHazard ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 dark:text-amber-400">
                          <AlertTriangle className="w-3.5 h-3.5" /> Small Parts
                        </span>
                      ) : (
                        <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-bold">
                          Safe All Ages
                        </span>
                      )}
                    </td>

                    <td className="p-5 text-right space-x-2 whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => openEditModal(prod)}
                        className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--surface)] transition-colors cursor-pointer"
                        title="Edit Toy"
                      >
                        <Edit className="w-4 h-4" />
                      </button>

                      {confirmDeleteId === prod.id ? (
                        <div className="inline-flex items-center gap-1.5">
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleDeleteProduct(prod.id, prod.name)}
                            className="px-2.5 py-1 rounded-lg bg-[var(--danger)] text-white font-bold text-[10px] cursor-pointer"
                          >
                            Confirm Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteId(null)}
                            className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteId(prod.id)}
                          className="p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--danger)] hover:bg-rose-500/10 transition-colors cursor-pointer"
                          title="Delete Toy"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add New Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setShowAddModal(false)} />
          <form
            onSubmit={handleCreateProduct}
            className="relative w-full max-w-2xl sm:max-w-3xl bg-[var(--surface-elevated)] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[var(--border)] z-10 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h3 className="font-heading font-black text-lg text-[var(--text-primary)]">
                Add New Toy Product
              </h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text-primary)]">Product Name *</label>
              <Input
                placeholder="e.g. 500-Piece Magnetic STEM Building Blocks"
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-primary)]">Category *</label>
                <select
                  value={newCategorySlug}
                  onChange={(e) => setNewCategorySlug(e.target.value)}
                  className="w-full h-11 px-3 rounded-2xl border border-[var(--border)] text-xs bg-[var(--surface)] text-[var(--text-primary)]"
                >
                  {categories.map((c) => (
                    <option key={c.id} value={c.slug}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-primary)]">Price (৳ BDT) *</label>
                <Input
                  type="number"
                  value={newPrice}
                  onChange={(e) => setNewPrice(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-primary)]">Initial Stock *</label>
                <Input
                  type="number"
                  value={newStock}
                  onChange={(e) => setNewStock(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-primary)]">Min Age (Months) *</label>
                <Input
                  type="number"
                  value={newMinAge}
                  onChange={(e) => setNewMinAge(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text-primary)]">
                Product Photos &amp; Angles *
              </label>
              <ImageUploader
                images={newImages}
                onChange={setNewImages}
                disabled={isPending}
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={newChoking}
                onChange={(e) => setNewChoking(e.target.checked)}
                className="w-4 h-4 rounded text-[var(--primary)]"
              />
              <span className="text-xs font-medium text-[var(--text-primary)]">
                Warning: Contains small parts (Choking hazard for children under 3 years)
              </span>
            </label>

            <div className="pt-4 border-t border-[var(--border)] flex justify-end gap-2">
              <Button type="button" onClick={() => setShowAddModal(false)} variant="outline" size="sm">
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} variant="primary" size="sm" className="gap-1.5 font-bold">
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Publish to Database</span>
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Edit Product Modal */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="fixed inset-0 bg-black/60 backdrop-blur-xs" onClick={() => setEditingProduct(null)} />
          <form
            onSubmit={handleUpdateProduct}
            className="relative w-full max-w-2xl sm:max-w-3xl bg-[var(--surface-elevated)] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[var(--border)] z-10 space-y-4 max-h-[90vh] overflow-y-auto"
          >
            <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
              <h3 className="font-heading font-black text-lg text-[var(--text-primary)]">
                Edit Product
              </h3>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text-primary)]">Product Name</label>
              <Input
                value={editName}
                onChange={(e) => setEditName(e.target.value)}
                required
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text-primary)]">Category</label>
              <select
                value={editCategorySlug}
                onChange={(e) => setEditCategorySlug(e.target.value)}
                className="w-full h-11 px-3 rounded-2xl border border-[var(--border)] text-xs bg-[var(--surface)] text-[var(--text-primary)]"
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.slug}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-primary)]">Price (৳ BDT)</label>
                <Input
                  type="number"
                  value={editPrice}
                  onChange={(e) => setEditPrice(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-[var(--text-primary)]">Stock Level</label>
                <Input
                  type="number"
                  value={editStock}
                  onChange={(e) => setEditStock(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text-primary)]">
                Product Photos &amp; Angles *
              </label>
              <ImageUploader
                images={editImages}
                onChange={setEditImages}
                productId={editingProduct.id}
                disabled={isPending}
              />
            </div>

            <label className="flex items-center gap-2 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={editChoking}
                onChange={(e) => setEditChoking(e.target.checked)}
                className="w-4 h-4 rounded text-[var(--primary)]"
              />
              <span className="text-xs font-medium text-[var(--text-primary)]">
                Warning: Contains small parts
              </span>
            </label>

            <div className="pt-4 border-t border-[var(--border)] flex justify-end gap-2">
              <Button type="button" onClick={() => setEditingProduct(null)} variant="outline" size="sm">
                Cancel
              </Button>
              <Button type="submit" disabled={isPending} variant="primary" size="sm" className="gap-1.5 font-bold">
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                <span>Save Changes</span>
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
