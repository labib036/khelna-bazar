"use client";

import { useState, useEffect } from "react";
import { getCategoriesAction, saveCategoryAction, deleteCategoryAction, CategoryInput } from "@/server/actions/category-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog } from "@/components/ui/dialog";
import { FolderTree, Plus, Edit2, Trash2, Loader2, Sparkles, Package } from "lucide-react";
import { toast } from "sonner";

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form State
  const [editId, setEditId] = useState<string | undefined>();
  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [description, setDescription] = useState("");
  const [sortOrder, setSortOrder] = useState("0");
  const [isFeatured, setIsFeatured] = useState(false);

  const loadCategories = async () => {
    setLoading(true);
    const res = await getCategoriesAction();
    if (res.success) {
      setCategories(res.categories);
    } else {
      toast.error(res.error || "Failed to load categories");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openAddModal = () => {
    setEditId(undefined);
    setName("");
    setSlug("");
    setDescription("");
    setSortOrder("0");
    setIsFeatured(false);
    setModalOpen(true);
  };

  const openEditModal = (cat: any) => {
    setEditId(cat.id);
    setName(cat.name);
    setSlug(cat.slug);
    setDescription(cat.description || "");
    setSortOrder(cat.sortOrder.toString());
    setIsFeatured(cat.isFeatured);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !slug.trim()) {
      toast.error("Please enter a category name and slug.");
      return;
    }

    setSaving(true);
    const res = await saveCategoryAction({
      id: editId,
      name: name.trim(),
      slug: slug.trim(),
      description: description.trim() || null,
      sortOrder: parseInt(sortOrder) || 0,
      isFeatured,
    });
    setSaving(false);

    if (res.success) {
      toast.success(editId ? "Category updated successfully!" : "Category created successfully!");
      setModalOpen(false);
      loadCategories();
    } else {
      toast.error(res.error || "Failed to save category");
    }
  };

  const handleDelete = async (id: string, catName: string) => {
    if (!confirm(`Are you sure you want to delete category "${catName}"?`)) return;

    const res = await deleteCategoryAction(id);
    if (res.success) {
      toast.success(`Category "${catName}" deleted.`);
      loadCategories();
    } else {
      toast.error(res.error || "Failed to delete category");
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-[var(--text-primary)] flex items-center gap-2.5">
            <FolderTree className="w-6 h-6 text-[var(--primary)]" />
            <span>Category Taxonomy</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
            Manage storefront toy categories, English &amp; Bangla titles, and sorting order.
          </p>
        </div>

        <Button onClick={openAddModal} variant="primary" size="sm" className="gap-1.5 font-bold shadow-xs">
          <Plus className="w-4 h-4" />
          <span>Add New Category</span>
        </Button>
      </div>

      {/* Categories Table */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[var(--text-muted)] flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-[var(--primary)]" />
          <span>Loading categories...</span>
        </div>
      ) : categories.length === 0 ? (
        <div className="p-8 text-center bg-[var(--surface)] border border-[var(--border)] rounded-3xl space-y-2">
          <FolderTree className="w-8 h-8 text-[var(--text-muted)] mx-auto" />
          <p className="text-xs font-bold text-[var(--text-primary)]">No categories found.</p>
        </div>
      ) : (
        <div className="bg-[var(--surface-elevated)] rounded-3xl border border-[var(--border)] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--surface-container-low)] text-[var(--text-muted)] uppercase tracking-wider font-extrabold border-b border-[var(--border)]">
                <tr>
                  <th className="py-3 px-4">Order</th>
                  <th className="py-3 px-4">Name</th>
                  <th className="py-3 px-4">Slug</th>
                  <th className="py-3 px-4">Products</th>
                  <th className="py-3 px-4">Featured</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] font-medium">
                {categories.map((cat) => (
                  <tr key={cat.id} className="hover:bg-[var(--surface-container-low)]/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-[var(--text-muted)]">{cat.sortOrder}</td>
                    <td className="py-3 px-4 font-bold text-[var(--text-primary)]">{cat.name}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-[var(--text-muted)]">{cat.slug}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 font-bold text-[var(--text-primary)]">
                        <Package className="w-3.5 h-3.5 text-[var(--primary)]" />
                        {cat.productCount}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {cat.isFeatured ? (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-[10px]">
                          Featured
                        </span>
                      ) : (
                        <span className="text-[10px] text-[var(--text-muted)]">Standard</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(cat)}
                          className="p-1.5 text-[var(--text-muted)] hover:text-[var(--primary)] rounded-lg transition-colors cursor-pointer"
                          title="Edit Category"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(cat.id, cat.name)}
                          className="p-1.5 text-[var(--text-muted)] hover:text-[var(--danger)] rounded-lg transition-colors cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Category Dialog */}
      <Dialog
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editId ? "Edit Category" : "Add New Category"}
      >
        <form onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text-primary)]">Name *</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. STEM & Robotics" required />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text-primary)]">URL Slug *</label>
              <Input value={slug} onChange={(e) => setSlug(e.target.value)} placeholder="stem-robotics" required />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text-primary)]">Description</label>
              <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Brief description of category" />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-[var(--text-primary)]">Sort Order</label>
              <Input type="number" value={sortOrder} onChange={(e) => setSortOrder(e.target.value)} />
            </div>
          </div>

          <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[var(--text-primary)] pt-1">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              className="rounded text-[var(--primary)]"
            />
            <span>Show as Featured Category on Homepage</span>
          </label>

          <div className="flex justify-end gap-2 pt-4 border-t border-[var(--border)]">
            <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm" disabled={saving}>
              {saving ? "Saving..." : editId ? "Update Category" : "Create Category"}
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}
