import * as React from "react";
import { cn } from "@/lib/utils";
import { OrderStatus, CodStatus, PaymentMethod } from "@/types/store";

export interface StatusPillProps {
  status: OrderStatus | CodStatus | PaymentMethod | string;
  type?: "order" | "cod" | "payment";
  className?: string;
  size?: "sm" | "md";
}

export function StatusPill({ status, type = "order", className, size = "sm" }: StatusPillProps) {
  let label = status.replace(/_/g, " ");
  let colorStyles = "bg-[var(--surface-elevated)] text-[var(--text-muted)] border-[var(--border)]";
  let dotColor = "bg-[var(--text-muted)]";

  if (type === "order") {
    switch (status) {
      case "PENDING_CONFIRMATION":
        label = "Pending Confirmation";
        colorStyles = "bg-[var(--warning-subtle)] text-[var(--warning)] border-[var(--warning)]/30";
        dotColor = "bg-[var(--warning)]";
        break;
      case "CONFIRMED":
        label = "Confirmed";
        colorStyles = "bg-[var(--surface-sky)] text-blue-600 dark:text-blue-400 border-blue-500/30";
        dotColor = "bg-blue-500";
        break;
      case "PACKED":
        label = "Packed & Ready";
        colorStyles = "bg-[var(--surface-lilac)] text-purple-600 dark:text-purple-400 border-purple-500/30";
        dotColor = "bg-purple-500";
        break;
      case "SHIPPED":
        label = "Shipped";
        colorStyles = "bg-[var(--accent)]/10 text-[var(--accent)] border-[var(--accent)]/30";
        dotColor = "bg-[var(--accent)]";
        break;
      case "OUT_FOR_DELIVERY":
        label = "Out for Delivery";
        colorStyles = "bg-[var(--primary-subtle)] text-[var(--primary)] border-[var(--primary)]/30";
        dotColor = "bg-[var(--primary)]";
        break;
      case "DELIVERED":
        label = "Delivered";
        colorStyles = "bg-[var(--success-subtle)] text-[var(--success)] border-[var(--success)]/30";
        dotColor = "bg-[var(--success)]";
        break;
      case "CANCELLED":
        label = "Cancelled";
        colorStyles = "bg-[var(--danger-subtle)] text-[var(--danger)] border-[var(--danger)]/30";
        dotColor = "bg-[var(--danger)]";
        break;
      case "RETURNED":
        label = "Returned";
        colorStyles = "bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30";
        dotColor = "bg-slate-500";
        break;
    }
  } else if (type === "cod") {
    switch (status) {
      case "UNCOLLECTED":
        label = "Uncollected Cash";
        colorStyles = "bg-[var(--warning-subtle)] text-[var(--warning)] border-[var(--warning)]/30";
        dotColor = "bg-[var(--warning)]";
        break;
      case "COLLECTED":
        label = "Cash Collected";
        colorStyles = "bg-[var(--success-subtle)] text-[var(--success)] border-[var(--success)]/30";
        dotColor = "bg-[var(--success)]";
        break;
      case "DISCREPANCY":
        label = "Discrepancy";
        colorStyles = "bg-[var(--danger-subtle)] text-[var(--danger)] border-[var(--danger)]/30";
        dotColor = "bg-[var(--danger)]";
        break;
      case "REFUNDED":
        label = "Refunded";
        colorStyles = "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30";
        dotColor = "bg-purple-500";
        break;
    }
  } else if (type === "payment") {
    switch (status) {
      case "CASH_ON_DELIVERY":
        label = "Cash on Delivery";
        colorStyles = "bg-[var(--surface-peach)] text-[var(--primary)] border-[var(--primary)]/20";
        dotColor = "bg-[var(--primary)]";
        break;
      case "BKASH":
        label = "bKash Manual";
        colorStyles = "bg-pink-500/10 text-pink-600 dark:text-pink-400 border-pink-500/30";
        dotColor = "bg-pink-500";
        break;
      case "NAGAD":
        label = "Nagad Manual";
        colorStyles = "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30";
        dotColor = "bg-orange-500";
        break;
    }
  }

  const sizes = {
    sm: "px-2.5 py-0.5 text-[11px]",
    md: "px-3 py-1 text-xs",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full border font-bold uppercase tracking-wider select-none shrink-0",
        colorStyles,
        sizes[size],
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full shrink-0", dotColor)} aria-hidden="true" />
      <span>{label}</span>
    </span>
  );
}
