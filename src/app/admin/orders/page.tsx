"use client";

import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  getAdminOrdersAction,
  updateOrderStatus,
  updateCodStatus,
  verifyMfsPayment,
  rejectMfsPayment,
  recordDefectiveRefusal,
  recordRefund,
} from "@/server/actions/order-actions";
import { StoreOrder, OrderStatus, CodStatus } from "@/types/store";
import {
  ShoppingBag,
  Truck,
  CheckCircle2,
  Clock,
  Search,
  DollarSign,
  AlertTriangle,
  FileText,
  Phone,
  Printer,
  X,
  ShieldCheck,
  RotateCcw,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<StoreOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<StoreOrder | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectInput, setShowRejectInput] = useState(false);
  const [defectNotes, setDefectNotes] = useState("");
  const [showDefectInput, setShowDefectInput] = useState(false);
  const [refundAmount, setRefundAmount] = useState("");
  const [refundMethod, setRefundMethod] = useState("bKash");
  const [refundRef, setRefundRef] = useState("");
  const [showRefundInput, setShowRefundInput] = useState(false);

  const loadOrders = async () => {
    setLoading(true);
    const res = await getAdminOrdersAction();
    if (res.success) {
      setOrders(res.orders);
    } else {
      toast.error(res.error || "Failed to load orders");
    }
    setLoading(false);
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const handleUpdateFulfillment = async (orderId: string, newStatus: OrderStatus) => {
    setActionLoading(true);
    const res = await updateOrderStatus(orderId, newStatus);
    setActionLoading(false);
    if (res.success) {
      toast.success(`Order status updated to ${newStatus.replace(/_/g, " ")}`);
      await loadOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: newStatus } : null));
      }
    } else {
      toast.error(res.error || "Failed to update order status");
    }
  };

  const handleRecordCodCollection = async (orderId: string, amount: number) => {
    setActionLoading(true);
    const res = await updateCodStatus(orderId, "COLLECTED", amount);
    setActionLoading(false);
    if (res.success) {
      toast.success(`Recorded Cash Collection of ${formatPrice(amount)}`);
      await loadOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, codStatus: "COLLECTED" } : null));
      }
    } else {
      toast.error(res.error || "Failed to record COD collection");
    }
  };

  const handleVerifyMfs = async (orderId: string) => {
    setActionLoading(true);
    const res = await verifyMfsPayment(orderId);
    setActionLoading(false);
    if (res.success) {
      toast.success("MFS Payment verified successfully! Cleared for shipping.");
      await loadOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, paymentStatus: "VERIFIED" } : null));
      }
    } else {
      toast.error(res.error || "Failed to verify MFS payment");
    }
  };

  const handleRejectMfs = async (orderId: string) => {
    if (!rejectReason.trim()) {
      toast.error("Please enter a reason for rejecting the payment.");
      return;
    }
    setActionLoading(true);
    const res = await rejectMfsPayment(orderId, rejectReason.trim());
    setActionLoading(false);
    if (res.success) {
      toast.success("Payment rejected. Customer notified.");
      setShowRejectInput(false);
      setRejectReason("");
      await loadOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, paymentStatus: "REJECTED" } : null));
      }
    } else {
      toast.error(res.error || "Failed to reject payment");
    }
  };

  const handleDefectiveRefusal = async (orderId: string) => {
    if (!defectNotes.trim()) {
      toast.error("Please enter defect notes reported at delivery.");
      return;
    }
    setActionLoading(true);
    const res = await recordDefectiveRefusal(orderId, defectNotes.trim());
    setActionLoading(false);
    if (res.success) {
      toast.success("Recorded delivery refusal for defective item. Order set to RETURNED.");
      setShowDefectInput(false);
      setDefectNotes("");
      await loadOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, status: "RETURNED" } : null));
      }
    } else {
      toast.error(res.error || "Failed to record defective refusal");
    }
  };

  const handleIssueRefund = async (orderId: string) => {
    const amt = parseInt(refundAmount);
    if (!amt || amt <= 0) {
      toast.error("Please enter a valid refund amount.");
      return;
    }
    setActionLoading(true);
    const res = await recordRefund(orderId, amt, refundMethod, refundRef.trim() || undefined);
    setActionLoading(false);
    if (res.success) {
      toast.success(`Refund of ${formatPrice(amt)} recorded.`);
      setShowRefundInput(false);
      setRefundAmount("");
      setRefundRef("");
      await loadOrders();
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder((prev) => (prev ? { ...prev, refundStatus: "REFUNDED", refundAmount: amt } : null));
      }
    } else {
      toast.error(res.error || "Failed to issue refund");
    }
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

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-black text-[#18191F] dark:text-white">
              Order Fulfillment &amp; Cash on Delivery
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Confirm orders, verify bKash/Nagad transactions, and reconcile COD cash collections.
            </p>
          </div>
          <Button
            onClick={loadOrders}
            variant="outline"
            size="sm"
            className="gap-2 cursor-pointer"
            disabled={loading}
          >
            <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            <span>Refresh Orders</span>
          </Button>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#1B1C24] p-5 rounded-3xl border border-[#E8E2DE] dark:border-[#2E303E] shadow-sm">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by order #, name, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-slate-200 dark:border-slate-700 text-xs focus:outline-none focus:border-[#DC012B] bg-[#FAF8F6] dark:bg-[#242531]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            {["ALL", "PENDING_CONFIRMATION", "CONFIRMED", "SHIPPED", "DELIVERED", "RETURNED", "CANCELLED"].map(
              (st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                    filterStatus === st
                      ? "bg-[#DC012B] text-white shadow-xs"
                      : "bg-[#FAF8F6] dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:text-[#DC012B]"
                  }`}
                >
                  {st.replace(/_/g, " ")}
                </button>
              )
            )}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white dark:bg-[#1B1C24] rounded-3xl border border-[#E8E2DE] dark:border-[#2E303E] overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-12 text-center text-xs text-slate-400 flex items-center justify-center gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-[#DC012B]" />
              <span>Loading orders from database...</span>
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-xs text-slate-400">
              No orders found matching the filter.
            </div>
          ) : (
            <table className="w-full text-xs text-left">
              <thead>
                <tr className="border-b border-[#E8E2DE] dark:border-[#2E303E] bg-[#FAF8F6] dark:bg-[#242531] text-slate-400 font-bold uppercase tracking-wider text-[11px]">
                  <th className="p-5">Order #</th>
                  <th className="p-5">Customer &amp; Contact</th>
                  <th className="p-5">Items</th>
                  <th className="p-5">Payment &amp; Total</th>
                  <th className="p-5">Fulfillment Status</th>
                  <th className="p-5">COD Status</th>
                  <th className="p-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredOrders.map((ord) => (
                  <tr key={ord.id} className="hover:bg-[#FAF8F6] dark:hover:bg-[#242531] transition-colors">
                    <td className="p-5 font-mono font-bold text-[#DC012B] text-sm">
                      {ord.orderNumber}
                    </td>
                    <td className="p-5">
                      <span className="font-bold text-[#18191F] dark:text-white block">
                        {ord.customerName}
                      </span>
                      <span className="text-[11px] text-slate-400">{ord.customerPhone}</span>
                    </td>
                    <td className="p-5 max-w-[200px] truncate text-slate-700 dark:text-slate-300 font-medium">
                      {ord.items.map((i) => `${i.name} (${i.quantity}x)`).join(", ")}
                    </td>
                    <td className="p-5">
                      <span className="font-black text-sm text-[#18191F] dark:text-white block">
                        {formatPrice(ord.total)}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase font-bold">
                        {ord.paymentMethod.replace(/_/g, " ")}
                      </span>
                      {ord.paymentMethod !== "CASH_ON_DELIVERY" && (
                        <span className={`inline-block ml-1 px-1.5 py-0.2 rounded text-[9px] font-bold ${
                          ord.paymentStatus === "VERIFIED"
                            ? "bg-emerald-100 text-emerald-800"
                            : ord.paymentStatus === "REJECTED"
                            ? "bg-rose-100 text-rose-800"
                            : "bg-amber-100 text-amber-800"
                        }`}>
                          {ord.paymentStatus || "Awaiting Verification"}
                        </span>
                      )}
                    </td>
                    <td className="p-5">
                      <select
                        value={ord.status}
                        onChange={(e) =>
                          handleUpdateFulfillment(ord.id, e.target.value as OrderStatus)
                        }
                        disabled={actionLoading}
                        className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold bg-white dark:bg-[#1B1C24] focus:outline-none focus:border-[#DC012B] cursor-pointer"
                      >
                        <option value="PENDING_CONFIRMATION">Pending Confirmation</option>
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="PROCESSING">Processing</option>
                        <option value="PACKED">Packed</option>
                        <option value="SHIPPED">Shipped</option>
                        <option value="DELIVERED">Delivered</option>
                        <option value="RETURNED">Returned (Defective)</option>
                        <option value="CANCELLED">Cancelled</option>
                      </select>
                    </td>
                    <td className="p-5">
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-[11px] font-extrabold ${
                          ord.codStatus === "COLLECTED"
                            ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/60 dark:text-emerald-300"
                            : "bg-amber-100 text-amber-800 dark:bg-amber-950/60 dark:text-amber-300"
                        }`}
                      >
                        {ord.codStatus}
                      </span>
                    </td>
                    <td className="p-5 text-right space-x-2">
                      <button
                        onClick={() => setSelectedOrder(ord)}
                        className="px-3.5 py-1.5 rounded-xl bg-[#DC012B] text-white font-bold text-xs hover:bg-[#B80023] transition-colors cursor-pointer shadow-xs"
                      >
                        Manage
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Order Details & Audit Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setSelectedOrder(null)} />

            <div className="relative w-full max-w-2xl bg-white dark:bg-[#1B1C24] rounded-4xl p-6 sm:p-8 shadow-2xl space-y-6 z-10 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-xs font-mono font-bold text-[#DC012B]">
                    #{selectedOrder.orderNumber}
                  </span>
                  <h3 className="font-heading font-black text-lg text-[#18191F] dark:text-white">
                    Order Inspection &amp; Reconciliation
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Customer & Address Details */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-semibold">Customer</span>
                  <span className="font-bold text-[#18191F] dark:text-white">{selectedOrder.customerName}</span>
                  <span className="block text-slate-500">{selectedOrder.customerPhone}</span>
                  <span className="block text-slate-500">{selectedOrder.customerEmail}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Delivery Address</span>
                  <span className="text-slate-600 dark:text-slate-300 leading-relaxed block">
                    {selectedOrder.shippingAddress.line1}, {selectedOrder.shippingAddress.city}, {selectedOrder.shippingAddress.division}
                  </span>
                </div>
              </div>

              {/* Items Snapshot */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-2 text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-wider block">Items ({selectedOrder.items.length})</span>
                <div className="space-y-1">
                  {selectedOrder.items.map((it, idx) => (
                    <div key={idx} className="flex justify-between">
                      <span className="font-medium">{it.name} &times; {it.quantity}</span>
                      <span className="font-bold">{formatPrice(it.price * it.quantity)}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-bold text-sm">
                  <span>Total Payable:</span>
                  <span className="text-[#DC012B] font-black">{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>

              {/* MFS Verification Controls (bKash & Nagad) */}
              {selectedOrder.paymentMethod !== "CASH_ON_DELIVERY" && (
                <div className="p-4 rounded-2xl bg-purple-50 dark:bg-purple-950/30 border border-purple-200 dark:border-purple-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-xs text-purple-900 dark:text-purple-300 flex items-center gap-1.5 uppercase tracking-wide">
                      <ShieldCheck className="w-4 h-4" /> {selectedOrder.paymentMethod} Verification
                    </h4>
                    <span className="font-bold text-xs uppercase px-2 py-0.5 rounded-full bg-purple-200 dark:bg-purple-900 text-purple-900 dark:text-purple-200">
                      {selectedOrder.paymentStatus || "Awaiting Verification"}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-slate-500 block">Sender Phone:</span>
                      <strong className="font-mono">{selectedOrder.mfsSenderNumber || "N/A"}</strong>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Transaction ID (TrxID):</span>
                      <strong className="font-mono">{selectedOrder.mfsTrxId || "N/A"}</strong>
                    </div>
                  </div>

                  {selectedOrder.paymentStatus !== "VERIFIED" && (
                    <div className="pt-2 flex flex-wrap gap-2">
                      <Button
                        onClick={() => handleVerifyMfs(selectedOrder.id)}
                        disabled={actionLoading}
                        variant="primary"
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-xs gap-1 cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirm &amp; Verify Payment</span>
                      </Button>
                      <Button
                        onClick={() => setShowRejectInput(!showRejectInput)}
                        variant="outline"
                        size="sm"
                        className="text-rose-600 border-rose-300 text-xs cursor-pointer"
                      >
                        Reject Payment
                      </Button>
                    </div>
                  )}

                  {showRejectInput && (
                    <div className="pt-2 space-y-2 border-t border-purple-200">
                      <input
                        type="text"
                        placeholder="Reason for rejection (e.g. TrxID not found on 01712-039707 statement)"
                        value={rejectReason}
                        onChange={(e) => setRejectReason(e.target.value)}
                        className="w-full text-xs h-9 px-3 rounded-lg border border-slate-300 bg-white dark:bg-slate-900"
                      />
                      <Button
                        onClick={() => handleRejectMfs(selectedOrder.id)}
                        disabled={actionLoading}
                        variant="primary"
                        size="sm"
                        className="bg-rose-600 hover:bg-rose-700 text-xs"
                      >
                        Submit Rejection
                      </Button>
                    </div>
                  )}
                </div>
              )}

              {/* COD Reconciliation Controls */}
              {selectedOrder.paymentMethod === "CASH_ON_DELIVERY" && (
                <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-3">
                  <h4 className="font-bold text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 uppercase tracking-wide">
                    <DollarSign className="w-4 h-4" /> COD Reconciliation
                  </h4>

                  {selectedOrder.codStatus === "COLLECTED" ? (
                    <div className="flex items-center gap-2 text-xs text-emerald-700 font-bold">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Full cash of {formatPrice(selectedOrder.total)} collected and verified.</span>
                    </div>
                  ) : (
                    <Button
                      onClick={() => handleRecordCodCollection(selectedOrder.id, selectedOrder.total)}
                      disabled={actionLoading}
                      variant="primary"
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-xs gap-1.5 cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Record Cash Collected ({formatPrice(selectedOrder.total)})</span>
                    </Button>
                  )}
                </div>
              )}

              {/* Defective at Delivery Refusal & Refunds */}
              <div className="p-4 rounded-2xl bg-slate-100 dark:bg-slate-800 space-y-3 text-xs">
                <h4 className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wide">
                  Delivery Return &amp; Refund Controls
                </h4>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => setShowDefectInput(!showDefectInput)}
                    variant="outline"
                    size="sm"
                    className="text-xs cursor-pointer"
                  >
                    <RotateCcw className="w-3.5 h-3.5 mr-1" />
                    <span>Record Defective Refusal</span>
                  </Button>
                  <Button
                    onClick={() => setShowRefundInput(!showRefundInput)}
                    variant="outline"
                    size="sm"
                    className="text-xs cursor-pointer"
                  >
                    <DollarSign className="w-3.5 h-3.5 mr-1" />
                    <span>Record Refund</span>
                  </Button>
                </div>

                {showDefectInput && (
                  <div className="pt-2 space-y-2 border-t border-slate-300 dark:border-slate-700">
                    <input
                      type="text"
                      placeholder="Enter defect description reported in front of delivery person..."
                      value={defectNotes}
                      onChange={(e) => setDefectNotes(e.target.value)}
                      className="w-full text-xs h-9 px-3 rounded-lg border border-slate-300 bg-white dark:bg-slate-900"
                    />
                    <Button
                      onClick={() => handleDefectiveRefusal(selectedOrder.id)}
                      disabled={actionLoading}
                      variant="primary"
                      size="sm"
                      className="bg-slate-800 text-white text-xs"
                    >
                      Confirm Defective Return
                    </Button>
                  </div>
                )}

                {showRefundInput && (
                  <div className="pt-2 space-y-2 border-t border-slate-300 dark:border-slate-700">
                    <div className="grid grid-cols-3 gap-2">
                      <input
                        type="number"
                        placeholder="Amount (৳)"
                        value={refundAmount}
                        onChange={(e) => setRefundAmount(e.target.value)}
                        className="text-xs h-9 px-3 rounded-lg border border-slate-300 bg-white dark:bg-slate-900"
                      />
                      <select
                        value={refundMethod}
                        onChange={(e) => setRefundMethod(e.target.value)}
                        className="text-xs h-9 px-2 rounded-lg border border-slate-300 bg-white dark:bg-slate-900"
                      >
                        <option value="bKash">bKash</option>
                        <option value="Nagad">Nagad</option>
                        <option value="Cash">Cash</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Trx / Voucher Ref"
                        value={refundRef}
                        onChange={(e) => setRefundRef(e.target.value)}
                        className="text-xs h-9 px-3 rounded-lg border border-slate-300 bg-white dark:bg-slate-900"
                      />
                    </div>
                    <Button
                      onClick={() => handleIssueRefund(selectedOrder.id)}
                      disabled={actionLoading}
                      variant="primary"
                      size="sm"
                      className="bg-emerald-600 hover:bg-emerald-700 text-xs"
                    >
                      Record Refund Issued
                    </Button>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <Button onClick={() => setSelectedOrder(null)} variant="outline" size="sm" className="cursor-pointer">
                  Close Window
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}
