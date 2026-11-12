import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "brand" | "sun" | "coral" | "mint" | "grape" | "outline";
}

export function Badge({ className, variant = "brand", children, ...props }: BadgeProps) {
  const variants = {
    brand: "bg-[#EBF1FF] text-[#1E5BFF] dark:bg-[#1E2D5A] dark:text-[#BFD1FF]",
    sun: "bg-[#FFF8E6] text-[#B88700] dark:bg-[#3D3008] dark:text-[#FFD76A]",
    coral: "bg-[#FFF0F0] text-[#FF6B6B] dark:bg-[#471515] dark:text-[#FFA3A3]",
    mint: "bg-[#E6FAF8] text-[#229D92] dark:bg-[#0E3834] dark:text-[#4DD9CB]",
    grape: "bg-[#F3EFFF] text-[#7B5CFA] dark:bg-[#2A1D57] dark:text-[#9C84FF]",
    outline: "border border-[#E3E8F2] text-[#5B6577] dark:border-[#263050] dark:text-[#A8B1C4]",
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
