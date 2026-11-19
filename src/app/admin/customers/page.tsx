"use client";

import { useState, useEffect } from "react";
import { getCustomersAction, toggleCustomerBlockAction } from "@/server/actions/customer-actions";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Users, Search, Ban, CheckCircle2, ShoppingBag, Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminCustomersPage() {
  const [customers, setCustomers] = useState<any[]>([]);
  const [total, setTotal] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const loadCustomers = async (q?: string) => {
    setLoading(true);
    const res = await getCustomersAction({ query: q });
    if (res.success) {
      setCustomers(res.customers);
      setTotal(res.total);
    } else {
      toast.error(res.error || "Failed to load customers");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadCustomers();
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    loadCustomers(searchQuery);
  };

  const handleToggleBlock = async (userId: string, currentBlocked: boolean, customerName: string) => {
    const action = currentBlocked ? "unblock" : "block";
    if (!confirm(`Are you sure you want to ${action} customer "${customerName}"?`)) return;

    const res = await toggleCustomerBlockAction(userId, !currentBlocked);
    if (res.success) {
      toast.success(`Customer "${customerName}" has been ${action}ed.`);
      loadCustomers(searchQuery);
    } else {
      toast.error(res.error || `Failed to ${action} customer.`);
    }
  };

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[var(--border)]">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-[var(--text-primary)] flex items-center gap-2.5">
            <Users className="w-6 h-6 text-[var(--primary)]" />
            <span>Customer Directory</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
            View registered customer profiles, order history, and account standing.
          </p>
        </div>

        {/* Search */}
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name or phone..."
            className="w-64 h-9 text-xs"
          />
          <Button type="submit" variant="secondary" size="sm" className="h-9">
            <Search className="w-3.5 h-3.5" />
          </Button>
        </form>
      </div>

      {/* Customer List */}
      {loading ? (
        <div className="p-12 text-center text-xs text-[var(--text-muted)] flex items-center justify-center gap-2">
          <Loader2 className="w-5 h-5 animate-spin text-[var(--primary)]" />
          <span>Loading customer records...</span>
        </div>
      ) : customers.length === 0 ? (
        <div className="p-8 text-center bg-[var(--surface)] border border-[var(--border)] rounded-3xl space-y-2">
          <Users className="w-8 h-8 text-[var(--text-muted)] mx-auto" />
          <p className="text-xs font-bold text-[var(--text-primary)]">No customers found.</p>
        </div>
      ) : (
        <div className="bg-[var(--surface-elevated)] rounded-3xl border border-[var(--border)] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[var(--surface-container-low)] text-[var(--text-muted)] uppercase tracking-wider font-extrabold border-b border-[var(--border)]">
                <tr>
                  <th className="py-3 px-4">Customer Name</th>
                  <th className="py-3 px-4">Mobile Phone</th>
                  <th className="py-3 px-4">Email</th>
                  <th className="py-3 px-4">Total Orders</th>
                  <th className="py-3 px-4">Delivered Spend</th>
                  <th className="py-3 px-4">Joined Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)] font-medium">
                {customers.map((c) => (
                  <tr key={c.id} className="hover:bg-[var(--surface-container-low)]/50 transition-colors">
                    <td className="py-3 px-4 font-bold text-[var(--text-primary)]">{c.name}</td>
                    <td className="py-3 px-4 font-mono text-[var(--text-primary)]">{c.phone || "—"}</td>
                    <td className="py-3 px-4 text-[var(--text-muted)]">{c.email || "—"}</td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1 font-bold text-[var(--text-primary)]">
                        <ShoppingBag className="w-3.5 h-3.5 text-[var(--secondary)]" />
                        {c.orderCount}
                      </span>
                    </td>
                    <td className="py-3 px-4 font-black text-[var(--primary)]">{formatPrice(c.totalSpend)}</td>
                    <td className="py-3 px-4 text-[var(--text-muted)]">
                      {new Date(c.createdAt).toLocaleDateString("en-GB")}
                    </td>
                    <td className="py-3 px-4">
                      {c.blocked ? (
                        <span className="px-2 py-0.5 rounded-full bg-rose-500/10 text-rose-600 font-bold text-[10px]">
                          Blocked
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 font-bold text-[10px]">
                          Active
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        onClick={() => handleToggleBlock(c.id, c.blocked, c.name)}
                        className={`px-3 py-1 rounded-full text-xs font-bold transition-colors cursor-pointer ${
                          c.blocked
                            ? "bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500 hover:text-white"
                            : "bg-rose-500/10 text-rose-600 hover:bg-rose-500 hover:text-white"
                        }`}
                      >
                        {c.blocked ? "Unblock" : "Block"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
