"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { getCustomerOrders, updateOrderStatus } from "@/server/actions/order-actions";
import { StoreOrder } from "@/types/store";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Package, ArrowRight, Ban, Eye, Loader2, RotateCcw, Truck, Search, ShieldCheck } from "lucide-react";
import { toast } from "sonner";

export default function CustomerOrdersHistoryPage() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [isPending, startTransition] = useTransition();

  const loadOrders = async () => {
    try {
      const data = await getCustomerOrders();
      setOrders(data);
    } catch {
      toast.error("Failed to load your orders.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      loadOrders();
    } else if (status === "unauthenticated") {
      setLoading(false);
    }
  }, [status]);

  if (status === "loading" || loading) {
    return (
      <div className="p-12 text-center text-xs text-[var(--text-muted)] flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-[var(--primary)]" />
        <span>Loading your order history...</span>
      </div>
    );
  }

  const handleCancelOrder = (orderId: string, orderNumber: string) => {
    if (!confirm(`Are you sure you want to cancel order ${orderNumber}?`)) return;

    startTransition(async () => {
      const res = await updateOrderStatus(orderId, "CANCELLED", user?.name || "Customer");
      if (res.success) {
        toast.success(`Order ${orderNumber} has been cancelled.`);
        await loadOrders();
      } else {
        toast.error(res.error || "Failed to cancel order");
      }
    });
  };

  const filteredOrders = orders.filter((o) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(q) ||
      o.items?.some((it) => it.name.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[var(--primary)] bg-[var(--primary)]/10 px-3 py-1 rounded-full mb-1.5">
            <Truck className="w-3.5 h-3.5" />
            <span>Fulfillment Tracking</span>
          </div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
            My Orders &amp; Delivery History
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
            Track your parcels, view digital receipts, and check Cash on Delivery and inspection status.
          </p>
        </div>

        <Link href="/">
          <Button variant="primary" size="sm" className="font-bold text-xs gap-1.5 shadow-xs">
            <Package className="w-4 h-4" />
            <span>Order New Toy</span>
          </Button>
        </Link>
      </div>

      {/* Search Input */}
      {orders.length > 0 && (
        <div className="p-4 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
          <div className="relative max-w-sm">
            <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by order number or toy name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-2xl border border-[var(--border)] text-xs focus:outline-none focus:border-[var(--primary)] bg-[var(--surface-container-low)] text-[var(--text-primary)]"
            />
          </div>
        </div>
      )}

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="p-12 rounded-3xl bg-[var(--surface)] border border-[var(--border)] text-center space-y-4 shadow-xs">
            <Package className="w-12 h-12 text-[var(--text-muted)] mx-auto opacity-40" />
            <div className="space-y-1">
              <p className="font-heading font-black text-base text-[var(--text-primary)]">
                {orders.length === 0 ? "No orders placed yet" : "No matching orders found"}
              </p>
              <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                {orders.length === 0
                  ? "Explore our curated toys and enjoy Cash on Delivery across Bangladesh."
                  : "Try a different search term or order number."}
              </p>
            </div>
            {orders.length === 0 && (
              <div className="pt-2">
                <Link href="/">
                  <Button variant="primary" size="sm" className="font-bold text-xs">
                    Start Toy Shopping
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          filteredOrders.map((ord) => (
            <div
              key={ord.id}
              className="p-5 sm:p-6 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-4 hover:border-[var(--primary)]/50 transition-colors"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
                <div className="flex items-center gap-3">
                  <span className="font-mono font-black text-sm text-[var(--primary)]">
                    #{ord.orderNumber}
                  </span>
                  <span className="text-xs text-[var(--text-muted)]">
                    &bull; {new Date(ord.placedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span
                    className={`text-xs font-bold px-3 py-0.5 rounded-full ${
                      ord.status === "DELIVERED"
                        ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                        : ord.status === "SHIPPED"
                        ? "bg-blue-500/15 text-blue-600 dark:text-blue-400"
                        : ord.status === "CONFIRMED"
                        ? "bg-purple-500/15 text-purple-600 dark:text-purple-400"
                        : ord.status === "CANCELLED"
                        ? "bg-rose-500/15 text-rose-600 dark:text-rose-400"
                        : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                    }`}
                  >
                    {ord.status.replace(/_/g, " ")}
                  </span>
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-[var(--surface-container-high)] text-[var(--text-muted)] border border-[var(--border)]">
                    {ord.paymentMethod.replace(/_/g, " ")}
                  </span>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-bold text-[var(--text-primary)] block">
                    {ord.items?.map((it) => `${it.name} (x${it.quantity})`).join(", ") || "Toy Parcel"}
                  </span>
                  <span className="text-[11px] text-[var(--text-muted)] block">
                    Address: {ord.shippingAddress?.line1}, {ord.shippingAddress?.city} ({ord.deliveryZone})
                  </span>
                </div>

                <div className="flex items-center gap-4 self-end sm:self-auto">
                  <div className="text-right">
                    <span className="text-[10px] text-[var(--text-muted)] block font-semibold">Total Due</span>
                    <span className="text-base font-black text-[var(--text-primary)]">
                      {formatPrice(ord.total)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    {ord.status === "PENDING_CONFIRMATION" && (
                      <button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleCancelOrder(ord.id, ord.orderNumber)}
                        className="px-3 py-1.5 rounded-xl border border-rose-300 dark:border-rose-900 text-rose-600 dark:text-rose-400 text-xs font-bold hover:bg-rose-500/10 cursor-pointer flex items-center gap-1 disabled:opacity-50"
                      >
                        <Ban className="w-3.5 h-3.5" /> Cancel
                      </button>
                    )}
                    <Link href={`/dashboard/orders/${ord.id}`}>
                      <Button variant="outline" size="sm" className="text-xs font-bold gap-1 rounded-xl">
                        <Eye className="w-3.5 h-3.5" />
                        <span>View Details</span>
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
