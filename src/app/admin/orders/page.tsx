"use client";

import { useState } from "react";
import { AdminLayout } from "@/components/admin/admin-layout";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  ShoppingBag,
  Truck,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  DollarSign,
  AlertTriangle,
  FileText,
  Phone,
  Printer,
  X,
} from "lucide-react";
import { toast } from "sonner";

interface AdminOrder {
  id: string;
  customerName: string;
  phone: string;
  email: string;
  items: string;
  subtotal: number;
  deliveryFee: number;
  total: number;
  status:
    | "PENDING_CONFIRMATION"
    | "CONFIRMED"
    | "PROCESSING"
    | "PACKED"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED";
  codStatus: "UNCOLLECTED" | "COLLECTED" | "DISCREPANCY" | "REFUNDED";
  codCollectedAmount?: number;
  carrier: string;
  trackingNumber?: string;
  address: string;
}

const INITIAL_ORDERS: AdminOrder[] = [
  {
    id: "KB-100244",
    customerName: "Tanzim Ahmed",
    phone: "01819-123456",
    email: "tanzim@example.com",
    items: "Titan Rex Roaring Jurassic Dinosaur (1x)",
    subtotal: 2250,
    deliveryFee: 60,
    total: 2310,
    status: "PENDING_CONFIRMATION",
    codStatus: "UNCOLLECTED",
    carrier: "Steadfast Courier",
    address: "House 24, Road 4, Sector 3, Uttara, Dhaka",
  },
  {
    id: "KB-100243",
    customerName: "Farhana Islam",
    phone: "01711-223344",
    email: "farhana@example.com",
    items: "Medieval Fortress Siege Dragon Citadel (1x)",
    subtotal: 4800,
    deliveryFee: 0,
    total: 4800,
    status: "CONFIRMED",
    codStatus: "UNCOLLECTED",
    carrier: "Steadfast Courier",
    address: "Concord Tower, Gulshan 1, Dhaka",
  },
  {
    id: "KB-100242",
    customerName: "Nusrat Jahan",
    phone: "01912-334455",
    email: "nusrat@example.com",
    items: "Magnetic Castle Architect Tiles (102 Pcs) (1x)",
    subtotal: 2850,
    deliveryFee: 120,
    total: 2970,
    status: "SHIPPED",
    codStatus: "UNCOLLECTED",
    carrier: "Pathao Courier",
    trackingNumber: "PTH-992140",
    address: "Road 7, O.R. Nizam Road, Chittagong",
  },
  {
    id: "KB-100241",
    customerName: "Rashidul Karim",
    phone: "01611-998877",
    email: "karim@example.com",
    items: "Space Explorer Rocket Launch Facility (1x)",
    subtotal: 3450,
    deliveryFee: 60,
    total: 3510,
    status: "DELIVERED",
    codStatus: "COLLECTED",
    codCollectedAmount: 3510,
    carrier: "Steadfast Courier",
    trackingNumber: "ST-8829410",
    address: "House 12, Road 5, Dhanmondi, Dhaka",
  },
];

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>(INITIAL_ORDERS);
  const [filterStatus, setFilterStatus] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedOrder, setSelectedOrder] = useState<AdminOrder | null>(null);

  // Status Change Handler
  const handleUpdateFulfillment = (
    orderId: string,
    newStatus: AdminOrder["status"]
  ) => {
    setOrders((prev) =>
      prev.map((ord) => (ord.id === orderId ? { ...ord, status: newStatus } : ord))
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
    toast.success(`Order ${orderId} status updated to ${newStatus}`);
  };

  // COD Collection Recording
  const handleRecordCodCollection = (orderId: string, amount: number) => {
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? {
              ...ord,
              codStatus: "COLLECTED",
              codCollectedAmount: amount,
            }
          : ord
      )
    );
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({
        ...selectedOrder,
        codStatus: "COLLECTED",
        codCollectedAmount: amount,
      });
    }
    toast.success(`Recorded Cash Collection of ${formatPrice(amount)} for ${orderId}`);
  };

  const filteredOrders = orders.filter((o) => {
    if (filterStatus !== "ALL" && o.status !== filterStatus) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        o.id.toLowerCase().includes(q) ||
        o.customerName.toLowerCase().includes(q) ||
        o.phone.includes(q)
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
            <h1 className="font-heading text-2xl sm:text-3xl font-black text-[#14213D] dark:text-white">
              Order Fulfillment &amp; Cash on Delivery
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Confirm telephone orders, manage couriers, and reconcile COD cash collections.
            </p>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white dark:bg-[#161D33] p-4 rounded-2xl border border-[#E3E8F2] dark:border-[#263050]">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by order ID, name, phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-slate-200 text-xs focus:outline-none focus:border-[#1E5BFF]"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            {["ALL", "PENDING_CONFIRMATION", "CONFIRMED", "SHIPPED", "DELIVERED"].map(
              (st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold shrink-0 transition-colors cursor-pointer ${
                    filterStatus === st
                      ? "bg-[#1E5BFF] text-white"
                      : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                  }`}
                >
                  {st.replace("_", " ")}
                </button>
              )
            )}
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white dark:bg-[#161D33] rounded-3xl border border-[#E3E8F2] dark:border-[#263050] overflow-hidden shadow-xs">
          <table className="w-full text-xs text-left">
            <thead>
              <tr className="border-b border-[#E3E8F2] dark:border-[#263050] bg-slate-50 dark:bg-[#1E2742] text-slate-400 font-bold uppercase tracking-wider">
                <th className="p-4">Order ID</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Items</th>
                <th className="p-4">Due (৳)</th>
                <th className="p-4">Fulfillment</th>
                <th className="p-4">COD Cash Status</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {filteredOrders.map((ord) => (
                <tr key={ord.id} className="hover:bg-slate-50 dark:hover:bg-[#1E2742] transition-colors">
                  <td className="p-4 font-mono font-bold text-[#1E5BFF]">{ord.id}</td>
                  <td className="p-4">
                    <span className="font-bold text-[#14213D] dark:text-white block">
                      {ord.customerName}
                    </span>
                    <span className="text-[11px] text-slate-400">{ord.phone}</span>
                  </td>
                  <td className="p-4 max-w-[220px] truncate text-slate-700 dark:text-slate-300">
                    {ord.items}
                  </td>
                  <td className="p-4 font-black text-sm text-[#14213D] dark:text-white">
                    {formatPrice(ord.total)}
                  </td>
                  <td className="p-4">
                    <select
                      value={ord.status}
                      onChange={(e) =>
                        handleUpdateFulfillment(ord.id, e.target.value as AdminOrder["status"])
                      }
                      className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-bold bg-white dark:bg-[#161D33] focus:outline-none"
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
                  <td className="p-4">
                    <span
                      className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                        ord.codStatus === "COLLECTED"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {ord.codStatus}
                    </span>
                  </td>
                  <td className="p-4 text-right space-x-2">
                    <Button
                      onClick={() => setSelectedOrder(ord)}
                      variant="primary"
                      size="sm"
                      className="text-xs h-7"
                    >
                      Inspect / Collect
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Order Details & Cash Collection Drawer Modal */}
        {selectedOrder && (
          <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4">
            <div className="fixed inset-0 bg-black/50 backdrop-blur-xs" onClick={() => setSelectedOrder(null)} />

            <div className="relative w-full max-w-xl bg-white dark:bg-[#161D33] rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 z-10 max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-800">
                <div>
                  <span className="text-xs font-mono font-bold text-[#1E5BFF]">
                    {selectedOrder.id}
                  </span>
                  <h3 className="font-heading font-black text-lg text-[#14213D] dark:text-white">
                    Order Details &amp; COD Cash Audit
                  </h3>
                </div>
                <button
                  onClick={() => setSelectedOrder(null)}
                  className="p-1.5 text-slate-400 hover:text-slate-700"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Customer & Address Details */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-slate-400 block font-semibold">Customer</span>
                  <span className="font-bold text-[#14213D] dark:text-white">{selectedOrder.customerName}</span>
                  <span className="block text-slate-500">{selectedOrder.phone}</span>
                  <span className="block text-slate-500">{selectedOrder.email}</span>
                </div>
                <div>
                  <span className="text-slate-400 block font-semibold">Delivery Address</span>
                  <span className="text-slate-600 dark:text-slate-300 leading-relaxed block">
                    {selectedOrder.address}
                  </span>
                </div>
              </div>

              {/* Items & Financials */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 space-y-2 text-xs">
                <span className="font-bold text-slate-400 uppercase tracking-wider block">Items</span>
                <p className="font-semibold text-[#14213D] dark:text-white">{selectedOrder.items}</p>
                <div className="pt-2 border-t border-slate-200 dark:border-slate-700 flex justify-between font-bold text-sm">
                  <span>Total Due on Delivery:</span>
                  <span className="text-[#1E5BFF]">{formatPrice(selectedOrder.total)}</span>
                </div>
              </div>

              {/* COD Reconciliation Controls */}
              <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 space-y-3">
                <h4 className="font-bold text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 uppercase tracking-wide">
                  <DollarSign className="w-4 h-4" /> Cash on Delivery Reconciliation
                </h4>

                {selectedOrder.codStatus === "COLLECTED" ? (
                  <div className="flex items-center gap-2 text-xs text-emerald-700 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>
                      Full cash of {formatPrice(selectedOrder.total)} was collected and verified.
                    </span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-slate-600 dark:text-slate-300">
                      Did courier deliver and collect cash from customer? Record verification below:
                    </p>
                    <div className="flex gap-2">
                      <Button
                        onClick={() =>
                          handleRecordCodCollection(selectedOrder.id, selectedOrder.total)
                        }
                        variant="primary"
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-xs gap-1.5"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Record Full Cash Collected ({formatPrice(selectedOrder.total)})</span>
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-2 flex justify-end">
                <Button onClick={() => setSelectedOrder(null)} variant="outline" size="sm">
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
