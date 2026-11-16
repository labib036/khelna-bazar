"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { AccountNav } from "@/components/account/account-nav";
import { getCustomerOrders, updateOrderStatus } from "@/server/actions/order-actions";
import { StoreOrder } from "@/types/store";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Package, ArrowRight, Ban, Eye, Loader2, RotateCcw, Truck } from "lucide-react";
import { toast } from "sonner";

export default function CustomerOrdersPage() {
  const { data: session, status } = useSession();
  const user = session?.user;
  const [orders, setOrders] = useState<StoreOrder[]>([]);
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
      <div className="max-w-7xl mx-auto px-4 py-24 text-center text-xs text-[var(--text-muted)] flex items-center justify-center gap-2">
        <Loader2 className="w-5 h-5 animate-spin text-[var(--primary)]" />
        <span>Loading orders...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          <AccountNav />
          <div className="flex-1 bg-[var(--surface-container-low)] p-8 sm:p-12 rounded-3xl border border-[var(--border)] text-center space-y-5 shadow-xs w-full">
            <div className="w-16 h-16 rounded-3xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center mx-auto shadow-xs">
              <Package className="w-8 h-8" />
            </div>
            <div className="max-w-md mx-auto space-y-2">
              <h1 className="font-heading text-2xl font-black text-[var(--text-primary)]">
                Sign In to View Orders
              </h1>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                Please sign in to track your current Cash on Delivery parcels and view your past purchase history.
              </p>
            </div>
            <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
              <Link href="/login?redirect=/account/orders">
                <Button variant="primary" size="md" className="font-bold text-xs shadow-[0_4px_0_#93000E]">
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </Link>
              <Link href="/register">
                <Button variant="outline" size="md" className="text-xs font-bold border-[var(--primary)] text-[var(--primary)]">
                  <span>Create Account</span>
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  const handleCancel = (orderId: string, orderNumber: string) => {
    if (!confirm(`Are you sure you want to cancel order ${orderNumber}?`)) return;

    startTransition(async () => {
      const res = await updateOrderStatus(orderId, "CANCELLED", user.name || "Customer");
      if (res.success) {
        toast.success(`Order ${orderNumber} has been cancelled.`);
        await loadOrders();
      } else {
        toast.error(res.error || "Failed to cancel order");
      }
    });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="flex flex-col lg:flex-row gap-8 items-start">
        <AccountNav />

        <div className="flex-1 space-y-6 w-full min-w-0">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-extrabold uppercase tracking-wider text-[var(--primary)] bg-[var(--primary)]/10 px-3 py-1 rounded-full mb-2">
              <Truck className="w-3.5 h-3.5" />
              <span>Nationwide Tracking</span>
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
              My Orders &amp; Delivery Tracking
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
              View your Cash on Delivery orders, delivery status, courier tracking, and receipts.
            </p>
          </div>

          <div className="space-y-4">
            {orders.length === 0 ? (
              <div className="p-12 rounded-3xl bg-[var(--surface-container-low)] border border-[var(--border)] text-center space-y-4 shadow-xs">
                <Package className="w-12 h-12 text-[var(--text-muted)] mx-auto opacity-50" />
                <div className="space-y-1">
                  <p className="font-heading font-black text-base text-[var(--text-primary)]">
                    No orders placed yet
                  </p>
                  <p className="text-xs text-[var(--text-muted)] max-w-sm mx-auto">
                    Explore our certified child-safe toys and enjoy nationwide Cash on Delivery with free shipping over ৳1,500.
                  </p>
                </div>
                <div className="pt-2">
                  <Link href="/c/all">
                    <Button variant="primary" size="sm" className="font-bold text-xs shadow-[0_4px_0_#93000E]">
                      Start Toy Shopping
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              orders.map((ord) => (
                <div
                  key={ord.id}
                  className="p-5 sm:p-6 rounded-3xl bg-[var(--surface-container-low)] border border-[var(--border)] shadow-xs space-y-4"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[var(--border)]">
                    <div className="flex items-center gap-3">
                      <span className="font-mono font-black text-sm text-[var(--primary)]">
                        #{ord.orderNumber}
                      </span>
                      <span className="text-xs text-[var(--text-muted)]">
                        &bull; Placed on {new Date(ord.placedAt).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-xs font-bold px-3 py-0.5 rounded-full ${
                          ord.status === "DELIVERED"
                            ? "bg-emerald-500/15 text-emerald-600"
                            : ord.status === "SHIPPED"
                            ? "bg-blue-500/15 text-blue-600"
                            : ord.status === "CONFIRMED"
                            ? "bg-purple-500/15 text-purple-600"
                            : ord.status === "CANCELLED"
                            ? "bg-rose-500/15 text-rose-600"
                            : "bg-amber-500/15 text-amber-600"
                        }`}
                      >
                        {ord.status.replace(/_/g, " ")}
                      </span>
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                          ord.codStatus === "COLLECTED"
                            ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/30"
                            : "bg-amber-500/10 text-amber-600 border-amber-500/30"
                        }`}
                      >
                        COD: {ord.codStatus}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <span className="text-xs font-bold text-[var(--text-primary)] block">
                        {ord.items?.map((it) => `${it.name} (x${it.quantity})`).join(", ") || "Toy Item"}
                      </span>
                      <span className="text-[11px] text-[var(--text-muted)] block">
                        Payment: {ord.paymentMethod.replace(/_/g, " ")} &bull; Destination: {ord.shippingAddress?.city || ord.deliveryZone}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 self-end sm:self-auto">
                      <div className="text-right">
                        <span className="text-[11px] text-[var(--text-muted)] block">Total Due</span>
                        <span className="text-base font-black text-[var(--text-primary)]">
                          {formatPrice(ord.total)}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {ord.status === "PENDING_CONFIRMATION" && (
                          <button
                            type="button"
                            disabled={isPending}
                            onClick={() => handleCancel(ord.id, ord.orderNumber)}
                            className="px-3 py-1.5 rounded-full border border-rose-300 dark:border-rose-800 text-[var(--danger)] text-xs font-bold hover:bg-rose-500/10 cursor-pointer flex items-center gap-1 disabled:opacity-50"
                          >
                            <Ban className="w-3.5 h-3.5" /> Cancel
                          </button>
                        )}
                        <Link href={`/order/${ord.id}`}>
                          <Button variant="outline" size="sm" className="text-xs font-bold gap-1 rounded-full">
                            <Eye className="w-3.5 h-3.5" />
                            <span>Details</span>
                          </Button>
                        </Link>
                        <Link href="/c/all">
                          <Button
                            variant="primary"
                            size="sm"
                            className="text-xs font-bold rounded-full shadow-[0_3px_0_#93000E] gap-1"
                          >
                            <RotateCcw className="w-3 h-3" />
                            <span>Buy Again</span>
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
      </div>
    </div>
  );
}