import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "brand" | "sun" | "coral" | "mint" | "grape" | "outline";
}

export function Badge({ className, variant = "brand", children, ...props }: BadgeProps) {
  const variants = {
    brand: "bg-[#FFF0F2] text-[#DC012B] dark:bg-[#450A14] dark:text-[#FFAAB4]",
    sun: "bg-[#FFFBEB] text-[#B45309] dark:bg-[#451A03] dark:text-[#FCD34D]",
    coral: "bg-[#FFF0F2] text-[#FF4757] dark:bg-[#450A14] dark:text-[#FFA4B1]",
    mint: "bg-[#ECFDF5] text-[#059669] dark:bg-[#064E3B] dark:text-[#6EE7B7]",
    grape: "bg-[#F5F3FF] text-[#7C3AED] dark:bg-[#2E1065] dark:text-[#C4B5FD]",
    outline: "border border-[#E8E2DE] text-[#64748B] dark:border-[#2E303E] dark:text-[#94A3B8]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold tracking-tight uppercase",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
