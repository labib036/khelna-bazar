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
      primary: "bg-[#DC012B] text-white hover:bg-[#B80023] focus-visible:ring-[#DC012B] shadow-sm",
      secondary: "bg-[#F4EFEB] text-[#18191F] hover:bg-[#EAE4E0] dark:bg-[#242531] dark:text-[#F9FAFB]",
      outline: "border-2 border-[#E8E2DE] text-[#18191F] hover:border-[#DC012B] hover:text-[#DC012B] dark:border-[#2E303E] dark:text-[#F9FAFB]",
      ghost: "text-[#18191F] hover:bg-[#F4EFEB] dark:text-[#F9FAFB] dark:hover:bg-[#242531]",
      danger: "bg-[#FF4757] text-white hover:bg-[#E03646] focus-visible:ring-[#FF4757]",
      sun: "bg-[#F59E0B] text-slate-900 font-bold hover:bg-[#D97706] focus-visible:ring-[#F59E0B] shadow-sm",
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
