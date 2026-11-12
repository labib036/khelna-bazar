import * as React from "react";
import { cn } from "@/lib/utils";

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger" | "sun";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", isLoading, children, disabled, ...props }, ref) => {
    const baseStyles =
      "inline-flex items-center justify-center font-medium rounded-full transition-all duration-150 active:scale-97 disabled:opacity-50 disabled:pointer-events-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 cursor-pointer";

    const variants = {
      primary: "bg-[#1E5BFF] text-white hover:bg-[#1546CC] focus-visible:ring-[#1E5BFF] shadow-sm",
      secondary: "bg-[#F1F4F9] text-[#14213D] hover:bg-[#E3E8F2] dark:bg-[#1E2742] dark:text-[#F3F6FF]",
      outline: "border-2 border-[#E3E8F2] text-[#14213D] hover:border-[#1E5BFF] hover:text-[#1E5BFF] dark:border-[#263050] dark:text-[#F3F6FF]",
      ghost: "text-[#14213D] hover:bg-[#F1F4F9] dark:text-[#F3F6FF] dark:hover:bg-[#1E2742]",
      danger: "bg-[#FF6B6B] text-white hover:bg-[#E85050] focus-visible:ring-[#FF6B6B]",
      sun: "bg-[#FFC93C] text-[#14213D] font-bold hover:bg-[#EBB224] focus-visible:ring-[#FFC93C] shadow-sm",
    };

    const sizes = {
      sm: "text-xs px-3 py-1.5 gap-1.5 h-8",
      md: "text-sm px-4 py-2 gap-2 h-10",
      lg: "text-base px-6 py-3 gap-2.5 h-12 font-semibold",
      icon: "h-10 w-10 p-0 rounded-full",
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <span className="flex items-center gap-2">
            <svg
              className="animate-spin h-4 w-4 text-current"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
              />
            </svg>
            <span>{children}</span>
          </span>
        ) : (
          children
        )}
      </button>
    );
  }
);

Button.displayName = "Button";
