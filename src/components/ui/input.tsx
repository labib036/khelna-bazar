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
            "flex h-11 w-full rounded-2xl border border-[#E3E8F2] bg-white px-4 py-2 text-sm text-[#14213D] placeholder:text-[#5B6577] transition-colors focus:border-[#1E5BFF] focus:outline-none focus:ring-2 focus:ring-[#1E5BFF]/20 disabled:cursor-not-allowed disabled:opacity-50 dark:border-[#263050] dark:bg-[#161D33] dark:text-[#F3F6FF] dark:placeholder:text-[#A8B1C4]",
            error && "border-[#FF6B6B] focus:border-[#FF6B6B] focus:ring-[#FF6B6B]/20",
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
