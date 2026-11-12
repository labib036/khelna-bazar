import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = "text", error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(
            "flex h-11 w-full rounded-2xl border border-[#E8E2DE] bg-white px-4 py-2 text-sm text-[#18191F] placeholder:text-[#94A3B8] transition-colors focus:border-[#DC012B] focus:outline-none focus:ring-2 focus:ring-[#DC012B]/15 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#2E303E] dark:bg-[#1B1C24] dark:text-[#F9FAFB] dark:placeholder:text-[#64748B]",
            error && "border-[#DC012B] focus:border-[#DC012B] focus:ring-[#DC012B]/20",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1.5 text-xs text-[#FF6B6B] font-medium">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";
