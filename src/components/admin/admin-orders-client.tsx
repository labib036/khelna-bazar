"use client";

import { useState, useTransition } from "react";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { StatusPill } from "@/components/ui/status-pill";
import { StoreOrder, OrderStatus } from "@/types/store";
import { updateOrderStatus, updateCodStatus } from "@/server/actions/order-actions";
import {
  Search,
  CheckCircle2,
  DollarSign,
  Truck,
  X,
  Clock,
  Ban,
  Printer,
  ShieldCheck,
  ShieldAlert,
  Kanban,
  Table as TableIcon,
  PhoneCall,
  Package,
} from "lucide-react";
import { toast } from "sonner";

interface AdminOrdersClientProps {
  initialOrders: StoreOrder[];
}

export function AdminOrdersClient({ initialOrders }: AdminOrdersClientProps) {
  const [orders, setOrders] = useState<StoreOrder[]>(initialOrders);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"table" | "kanban">("table");
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Modal editing states
  const [trackingInput, setTrackingInput] = useState("");
  const [carrierInput, setCarrierInput] = useState("Steadfast Courier");
  const [printMode, setPrintMode] = useState<"invoice" | "packing" | null>(null);

  const selectedOrder = orders.find((o) => o.id === selectedOrderId) || null;

  // Status Change Handler
  const handleUpdateFulfillment = (orderId: string, newStatus: OrderStatus) => {
    startTransition(async () => {
      const res = await updateOrderStatus(orderId, newStatus, "Operations Manager");
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
        );
        toast.success(`Order status updated to ${newStatus.replace(/_/g, " ")}`);
      } else {
        toast.error(res.error || "Failed to update status");
      }
    });
  };

  // COD Collection Recording
  const handleRecordCodCollection = (orderId: string, orderNumber: string) => {
    startTransition(async () => {
      const res = await updateCodStatus(orderId, "COLLECTED", undefined, "Courier Remittance");
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, codStatus: "COLLECTED" } : o))
        );
        toast.success(`Recorded Cash Collection for ${orderNumber}`);
      } else {
        toast.error(res.error || "Failed to record collection");
      }
    });
  };

  // Manual MFS Payment Verification
  const handleVerifyPayment = (orderId: string, orderNumber: string) => {
    startTransition(async () => {
      const res = await updateOrderStatus(orderId, "CONFIRMED", "Payment Verification Staff");
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: "CONFIRMED" } : o))
        );
        toast.success(`Payment verified and confirmed for ${orderNumber}!`);
      } else {
        toast.error(res.error || "Failed to verify payment");
      }
    });
  };

  // Add Tracking / Carrier
  const handleSaveTracking = (orderId: string, orderNumber: string) => {
    if (!trackingInput.trim()) {
      toast.error("Please enter a tracking number.");
      return;
    }
    startTransition(async () => {
      const res = await updateOrderStatus(orderId, "SHIPPED", "Fulfillment Hub");
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: "SHIPPED" } : o))
        );
        toast.success(`Dispatched ${orderNumber} via ${carrierInput} (Tracking: ${trackingInput})`);
      } else {
        toast.error(res.error || "Failed to update tracking");
      }
    });
  };

  // Cancel order (with automatic restock)
  const handleCancelOrder = (orderId: string, orderNumber: string) => {
    if (!confirm(`Cancel order ${orderNumber} and return items to warehouse stock?`)) return;

    startTransition(async () => {
      const res = await updateOrderStatus(orderId, "CANCELLED", "Operations Manager");
      if (res.success) {
        setOrders((prev) =>
          prev.map((o) => (o.id === orderId ? { ...o, status: "CANCELLED" } : o))
        );
        toast.success(`Order ${orderNumber} cancelled and items returned to stock.`);
      } else {
        toast.error(res.error || "Failed to cancel order");
      }
    });
  };

  const filteredOrders = orders.filter((o) => {
    if (filterStatus !== "ALL" && o.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.orderNumber.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.customerPhone.includes(q)
      );
    }
    return true;
  });

  const kanbanColumns: Array<{ title: string; status: OrderStatus; icon: any; color: string }> = [
    { title: "Phone Verification", status: "PENDING_CONFIRMATION", icon: PhoneCall, color: "border-amber-400" },
    { title: "Confirmed / Preparing", status: "CONFIRMED", icon: CheckCircle2, color: "border-purple-400" },
    { title: "Packed & Sealed", status: "PACKED", icon: Package, color: "border-sky-400" },
    { title: "With Courier", status: "SHIPPED", icon: Truck, color: "border-blue-400" },
    { title: "Delivered & Reconciled", status: "DELIVERED", icon: ShieldCheck, color: "border-emerald-400" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
            Order Fulfillment &amp; Cash on Delivery
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-0.5">
            PostgreSQL-backed order pipeline, telephone verification, courier dispatch, and COD collection.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] shadow-xs">
          <button
            type="button"
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              viewMode === "table"
                ? "bg-primary text-on-primary shadow-xs"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Table</span>
          </button>
          <button
            type="button"
            onClick={() => setViewMode("kanban")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              viewMode === "kanban"
                ? "bg-primary text-on-primary shadow-xs"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Kanban Board</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[var(--surface-elevated)] p-5 rounded-3xl border border-[var(--border)] shadow-xs">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[var(--text-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by order number, customer, phone..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-2xl border border-[var(--border)] text-xs focus:outline-none focus:border-primary bg-[var(--surface)] text-[var(--text-primary)]"
          />
        </div>

        {viewMode === "table" && (
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            {["ALL", "PENDING_CONFIRMATION", "CONFIRMED", "SHIPPED", "DELIVERED", "CANCELLED"].map(
              (st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setFilterStatus(st)}
                  className={`px-3.5 py-2 rounded-2xl text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                    filterStatus === st
                      ? "bg-primary text-on-primary shadow-xs"
                      : "bg-[var(--surface)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  {st.replace(/_/g, " ")}
                </button>
              )
            )}
          </div>
        )}
      </div>

      {/* VIEW 1: KANBAN BOARD VIEW */}
      {viewMode === "kanban" ? (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4 overflow-x-auto pb-4">
          {kanbanColumns.map((col) => {
            const colOrders = filteredOrders.filter((o) => {
              if (col.status === "CONFIRMED") {
                return o.status === "CONFIRMED" || o.status === "PROCESSING";
              }
              return o.status === col.status;
            });
            const Icon = col.icon;

            return (
              <div
                key={col.status}
                className={`bg-[var(--surface-elevated)] p-4 rounded-3xl border border-[var(--border)] border-t-4 ${col.color} space-y-3 min-w-[240px]`}
              >
                <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
                  <div className="flex items-center gap-1.5 font-heading font-black text-xs text-[var(--text-primary)]">
                    <Icon className="w-4 h-4 text-primary" />
                    <span>{col.title}</span>
                  </div>
                  <span className="w-5 h-5 rounded-full bg-[var(--surface)] text-[var(--text-muted)] font-mono text-[10px] font-bold flex items-center justify-center border border-[var(--border)]">
                    {colOrders.length}
                  </span>
                </div>

                <div className="space-y-3 max-h-[70vh] overflow-y-auto pr-1">
                  {colOrders.length === 0 ? (
                    <div className="py-8 text-center text-[11px] text-[var(--text-muted)] italic">
                      No orders in this stage
                    </div>
                  ) : (
                    colOrders.map((ord) => (
                      <div
                        key={ord.id}
                        className="p-3.5 rounded-2xl bg-[var(--surface)] border border-[var(--border)] hover:border-primary/40 transition-all space-y-2 shadow-xs"
                      >
                        <div className="flex items-center justify-between text-xs">
                          <span className="font-mono font-bold text-primary text-[11px]">
                            {ord.orderNumber}
                          </span>
                          <span className="font-black text-xs text-[var(--text-primary)]">
                            {formatPrice(ord.total)}
                          </span>
                        </div>

                        <div>
                          <span className="font-bold text-xs text-[var(--text-primary)] block">
                            {ord.customerName}
                          </span>
                          <span className="text-[10px] text-[var(--text-muted)] block">
                            {ord.customerPhone} &bull; {ord.shippingAddress?.city}
                          </span>
                        </div>

                        <div className="flex items-center justify-between text-[10px] pt-1 border-t border-[var(--border)]">
                          <span className="font-semibold text-[var(--text-muted)]">
                            {ord.paymentMethod.replace(/_/g, " ")}
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              setSelectedOrderId(ord.id);
                              setPrintMode(null);
                            }}
                            className="font-bold text-primary hover:underline cursor-pointer"
                          >
                            Inspect &rarr;
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* VIEW 2: TRADITIONAL DATA TABLE */
        <div className="bg-[var(--surface-elevated)] rounded-3xl border border-[var(--border)] overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[var(--border)] bg-[var(--surface)] text-[var(--text-muted)] font-bold uppercase tracking-wider text-[11px]">
                  <th className="p-5">Order Number</th>
                  <th className="p-5">Customer &amp; Contact</th>
                  <th className="p-5">Items</th>
                  <th className="p-5">Payment Method</th>
                  <th className="p-5">Due (৳)</th>
                  <th className="p-5">Fulfillment Status</th>
                  <th className="p-5">COD Cash</th>
                  <th className="p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {filteredOrders.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-[var(--text-muted)]">
                      No matching orders found in the database.
                    </td>
                  </tr>
                ) : (
                  filteredOrders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-[var(--surface)] transition-colors">
                      <td className="p-5 font-mono font-bold text-primary text-sm">
                        {ord.orderNumber}
                      </td>
                      <td className="p-5">
                        <span className="font-bold text-[var(--text-primary)] block">
                          {ord.customerName}
                        </span>
                        <span className="text-[11px] text-[var(--text-muted)]">
                          {ord.customerPhone}
                        </span>
                      </td>
                      <td className="p-5 max-w-[200px] truncate text-[var(--text-primary)] font-medium">
                        {ord.items?.map((it) => `${it.name} (x${it.quantity})`).join(", ") || "Toy Item"}
                      </td>
                      <td className="p-5">
                        <StatusPill type="payment" status={ord.paymentMethod} />
                      </td>
                      <td className="p-5 font-black text-sm text-[var(--text-primary)]">
                        {formatPrice(ord.total)}
                      </td>
                      <td className="p-5">
                        <select
                          disabled={isPending}
                          value={ord.status}
                          onChange={(e) =>
                            handleUpdateFulfillment(ord.id, e.target.value as OrderStatus)
                          }
                          className="px-3 py-1.5 rounded-xl border border-[var(--border)] text-xs font-bold bg-[var(--surface)] text-[var(--text-primary)] focus:outline-none focus:border-primary"
                        >
                          <option value="PENDING_CONFIRMATION">Pending Confirmation</option>
                          <option value="CONFIRMED">Confirmed</option>
                          <option value="PROCESSING">Processing</option>
                          <option value="PACKED">Packed</option>
                          <option value="SHIPPED">Shipped</option>
                          <option value="DELIVERED">Delivered</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </td>
                      <td className="p-5">
                        <StatusPill type="cod" status={ord.codStatus} />
                      </td>
                      <td className="p-5 text-right space-x-2 whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedOrderId(ord.id);
                            setPrintMode(null);
                          }}
                          className="px-3.5 py-1.5 rounded-xl bg-primary text-on-primary font-bold text-xs hover:brightness-95 transition-colors cursor-pointer shadow-xs"
                        >
                          Inspect / Audit
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Order Details & Audit Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            onClick={() => {
              setSelectedOrderId(null);
              setPrintMode(null);
            }}
          />

          <div className="relative w-full max-w-2xl bg-[var(--surface-elevated)] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 z-10 max-h-[90vh] overflow-y-auto border border-[var(--border)]">
            <div className="flex items-center justify-between pb-4 border-b border-[var(--border)]">
              <div>
                <span className="text-xs font-mono font-bold text-primary">
                  {selectedOrder.orderNumber}
                </span>
                <h3 className="font-heading font-black text-lg text-[var(--text-primary)]">
                  Order Inspection &amp; COD Audit
                </h3>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPrintMode(printMode === "invoice" ? null : "invoice")}
                  className="px-3 py-1.5 rounded-xl border border-[var(--border)] text-xs font-bold flex items-center gap-1.5 hover:bg-[var(--surface)] text-[var(--text-primary)] cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5 text-primary" />
                  <span>{printMode === "invoice" ? "Close Invoice" : "Print Invoice"}</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOrderId(null);
                    setPrintMode(null);
                  }}
                  className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Printable Invoice View (if active) */}
            {printMode === "invoice" ? (
              <div className="p-6 rounded-2xl bg-white text-slate-900 border border-slate-200 space-y-6 print:m-0 print:p-0">
                <div className="flex justify-between items-start border-b border-slate-200 pb-4">
                  <div>
                    <h2 className="text-xl font-black text-[#C83E00]">KHELNA BAZAR</h2>
                    <p className="text-xs text-slate-500">Official Bangladesh Toy Store &bull; Cash on Delivery</p>
                  </div>
                  <div className="text-right text-xs">
                    <p className="font-bold text-sm">INVOICE: #{selectedOrder.orderNumber}</p>
                    <p className="text-slate-500">Date: {new Date(selectedOrder.placedAt).toLocaleDateString("en-GB")}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="font-bold text-slate-500 block uppercase text-[10px]">Customer:</span>
                    <p className="font-bold">{selectedOrder.customerName}</p>
                    <p>{selectedOrder.customerPhone}</p>
                  </div>
                  <div>
                    <span className="font-bold text-slate-500 block uppercase text-[10px]">Deliver To:</span>
                    <p>{selectedOrder.shippingAddress?.line1}</p>
                    <p>{selectedOrder.shippingAddress?.city}, {selectedOrder.shippingAddress?.division}</p>
                  </div>
                </div>

                <table className="w-full text-xs text-left">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                      <th className="py-2">Item Description</th>
                      <th className="py-2 text-center">Qty</th>
                      <th className="py-2 text-right">Price</th>
                      <th className="py-2 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedOrder.items?.map((it) => (
                      <tr key={it.id}>
                        <td className="py-2 font-medium">{it.name} ({it.title})</td>
                        <td className="py-2 text-center">{it.quantity}</td>
                        <td className="py-2 text-right">{formatPrice(it.price)}</td>
                        <td className="py-2 text-right font-bold">{formatPrice(it.lineTotal || it.price * it.quantity)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr className="border-t border-slate-300 font-bold">
                      <td colSpan={3} className="pt-3 text-right">Grand Total Due:</td>
                      <td className="pt-3 text-right font-black text-sm text-[#C83E00]">
                        {formatPrice(selectedOrder.total)}
                      </td>
                    </tr>
                  </tfoot>
                </table>

                <div className="pt-4 border-t border-slate-200 flex justify-between items-center text-xs">
                  <span className="text-slate-500">Payment: {selectedOrder.paymentMethod.replace(/_/g, " ")}</span>
                  <Button
                    type="button"
                    onClick={() => window.print()}
                    variant="primary"
                    size="sm"
                    className="gap-1.5"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print Now</span>
                  </Button>
                </div>
              </div>
            ) : (
              <>
                {/* Manual MFS Payment Verification Banner */}
                {selectedOrder.paymentMethod !== "CASH_ON_DELIVERY" && (
                  <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 space-y-2">
                    <div className="flex items-center gap-2 text-purple-600 dark:text-purple-400 font-bold text-xs">
                      <ShieldAlert className="w-4 h-4" />
                      <span>{selectedOrder.paymentMethod} Payment Verification Required</span>
                    </div>
                    <p className="text-xs text-[var(--text-muted)]">
                      Customer sent manual payment. Check order transaction record or statement.
                    </p>
                    <div className="flex gap-2 pt-1">
                      <Button
                        type="button"
                        disabled={isPending}
                        onClick={() => handleVerifyPayment(selectedOrder.id, selectedOrder.orderNumber)}
                        variant="primary"
                        size="sm"
                        className="bg-purple-600 hover:bg-purple-700 text-xs font-bold gap-1"
                      >
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>Verify &amp; Confirm Order</span>
                      </Button>
                    </div>
                  </div>
                )}

                {/* Customer & Address Details */}
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-[var(--text-muted)] block font-semibold">Customer</span>
                    <span className="font-bold text-[var(--text-primary)]">
                      {selectedOrder.customerName}
                    </span>
                    <span className="block text-[var(--text-muted)]">{selectedOrder.customerPhone}</span>
                    <span className="block text-[var(--text-muted)]">{selectedOrder.customerEmail}</span>
                  </div>
                  <div>
                    <span className="text-[var(--text-muted)] block font-semibold">Delivery Address</span>
                    <span className="text-[var(--text-primary)] leading-relaxed block">
                      {selectedOrder.shippingAddress?.line1 || "Address on record"}, {selectedOrder.shippingAddress?.city}
                    </span>
                    <span className="text-[10px] text-[var(--text-muted)] block mt-1">
                      Division: {selectedOrder.shippingAddress?.division} &bull; Zone: {selectedOrder.deliveryZone}
                    </span>
                  </div>
                </div>

                {/* Items & Financials */}
                <div className="p-4 rounded-2xl bg-[var(--surface)] space-y-2 text-xs border border-[var(--border)]">
                  <span className="font-bold text-[var(--text-muted)] uppercase tracking-wider block">
                    Items Snapshot
                  </span>
                  <div className="space-y-1.5">
                    {selectedOrder.items?.map((it) => (
                      <div key={it.id} className="flex justify-between items-center text-xs">
                        <span className="font-semibold text-[var(--text-primary)]">
                          {it.name} ({it.title}) &times; {it.quantity}
                        </span>
                        <span className="font-bold text-[var(--text-primary)]">
                          {formatPrice(it.lineTotal || it.price * it.quantity)}
                        </span>
                      </div>
                    ))}
                  </div>
                  <div className="pt-2 border-t border-[var(--border)] space-y-1">
                    <div className="flex justify-between text-[11px] text-[var(--text-muted)]">
                      <span>Subtotal:</span>
                      <span>{formatPrice(selectedOrder.subtotal)}</span>
                    </div>
                    {selectedOrder.discount > 0 && (
                      <div className="flex justify-between text-[11px] text-[var(--success)]">
                        <span>Discount ({selectedOrder.discount} ৳):</span>
                        <span>-{formatPrice(selectedOrder.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-[11px] text-[var(--text-muted)]">
                      <span>Shipping Fee:</span>
                      <span>{formatPrice(selectedOrder.shippingFee)}</span>
                    </div>
                    {selectedOrder.giftWrapFee > 0 && (
                      <div className="flex justify-between text-[11px] text-purple-600">
                        <span>Gift Wrapping:</span>
                        <span>+{formatPrice(selectedOrder.giftWrapFee)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold text-sm pt-1 border-t border-[var(--border)]">
                      <span className="text-[var(--text-primary)]">Total Due:</span>
                      <span className="text-primary font-black">
                        {formatPrice(selectedOrder.total)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Courier Dispatch & Tracking Info */}
                <div className="p-4 rounded-2xl bg-[var(--surface)] border border-[var(--border)] space-y-3">
                  <h4 className="font-bold text-xs text-[var(--text-primary)] flex items-center gap-1.5 uppercase tracking-wide">
                    <Truck className="w-4 h-4 text-primary" /> Courier Dispatch &amp; Tracking
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <select
                      value={carrierInput}
                      onChange={(e) => setCarrierInput(e.target.value)}
                      className="h-10 px-3 rounded-2xl border border-[var(--border)] text-xs bg-[var(--surface-elevated)] text-[var(--text-primary)]"
                    >
                      <option value="Steadfast Courier">Steadfast Courier</option>
                      <option value="Pathao Logistics">Pathao Logistics</option>
                      <option value="RedX Delivery">RedX Delivery</option>
                      <option value="Paperfly">Paperfly</option>
                      <option value="SA Paribahan">SA Paribahan</option>
                    </select>
                    <Input
                      placeholder="Courier Tracking ID (e.g. ST-88294)"
                      value={trackingInput}
                      onChange={(e) => setTrackingInput(e.target.value)}
                      className="h-10 text-xs"
                    />
                  </div>
                  <Button
                    type="button"
                    disabled={isPending}
                    onClick={() => handleSaveTracking(selectedOrder.id, selectedOrder.orderNumber)}
                    variant="primary"
                    size="sm"
                    className="w-full text-xs"
                  >
                    Save Tracking &amp; Mark Shipped
                  </Button>
                </div>

                {/* COD Reconciliation Controls */}
                <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 space-y-3">
                  <h4 className="font-bold text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 uppercase tracking-wide">
                    <DollarSign className="w-4 h-4" /> Cash on Delivery Reconciliation
                  </h4>

                  {selectedOrder.codStatus === "COLLECTED" ? (
                    <div className="flex items-center gap-2 text-xs text-emerald-600 dark:text-emerald-400 font-bold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>
                        Full cash of {formatPrice(selectedOrder.total)} was collected and reconciled.
                      </span>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <p className="text-xs text-[var(--text-muted)]">
                        Did courier deliver parcel and remit cash to company account? Reconcile below:
                      </p>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          disabled={isPending}
                          onClick={() => handleRecordCodCollection(selectedOrder.id, selectedOrder.orderNumber)}
                          variant="primary"
                          size="sm"
                          className="bg-[var(--success)] hover:brightness-95 text-white text-xs gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Record Full Cash Collected ({formatPrice(selectedOrder.total)})</span>
                        </Button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Order Event Timeline */}
                {selectedOrder.events && selectedOrder.events.length > 0 && (
                  <div className="space-y-2">
                    <span className="font-bold text-xs text-[var(--text-muted)] uppercase tracking-wider block">
                      Audit Timeline
                    </span>
                    <div className="space-y-2 border-l-2 border-[var(--border)] pl-4">
                      {selectedOrder.events.map((ev) => (
                        <div key={ev.id} className="text-xs">
                          <div className="flex items-center gap-1.5 text-[var(--text-primary)] font-semibold">
                            <Clock className="w-3 h-3 text-[var(--text-muted)]" />
                            <span>{ev.message || ev.type}</span>
                          </div>
                          <span className="text-[10px] text-[var(--text-muted)]">
                            by {ev.actorName || "Staff"} &bull; {new Date(ev.createdAt).toLocaleString()}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions & Cancel */}
                <div className="pt-2 flex items-center justify-between border-t border-[var(--border)]">
                  {selectedOrder.status !== "CANCELLED" && selectedOrder.status !== "DELIVERED" ? (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => handleCancelOrder(selectedOrder.id, selectedOrder.orderNumber)}
                      className="text-xs text-[var(--danger)] hover:underline flex items-center gap-1 font-semibold cursor-pointer disabled:opacity-50"
                    >
                      <Ban className="w-3.5 h-3.5" />
                      <span>Cancel Order &amp; Restock</span>
                    </button>
                  ) : (
                    <div />
                  )}
                  <Button
                    type="button"
                    onClick={() => {
                      setSelectedOrderId(null);
                      setPrintMode(null);
                    }}
                    variant="outline"
                    size="sm"
                  >
                    Close Window
                  </Button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
