import * as React from "react";
import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "elevated" | "interactive" | "tinted-peach" | "tinted-sun" | "tinted-mint" | "tinted-sky";
}

export function Card({ className, variant = "default", ...props }: CardProps) {
  const variants = {
    default:
      "bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] shadow-xs rounded-2xl",
    elevated:
      "bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] shadow-md rounded-2xl",
    interactive:
      "bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] shadow-xs hover:shadow-md card-hover-lift rounded-2xl cursor-pointer",
    "tinted-peach":
      "bg-[var(--surface-peach)] text-[var(--text-primary)] border border-[var(--primary)]/15 rounded-2xl",
    "tinted-sun":
      "bg-[var(--surface-sun)] text-[var(--text-primary)] border border-[var(--warning)]/20 rounded-2xl",
    "tinted-mint":
      "bg-[var(--surface-mint)] text-[var(--text-primary)] border border-[var(--success)]/20 rounded-2xl",
    "tinted-sky":
      "bg-[var(--surface-sky)] text-[var(--text-primary)] border border-[var(--accent)]/20 rounded-2xl",
  };

  return <div className={cn("transition-colors", variants[variant], className)} {...props} />;
}

export function CardHeader({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex flex-col space-y-1.5 p-5 sm:p-6", className)} {...props} />;
}

export function CardTitle({ className, ...props }: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h3
      className={cn("text-lg sm:text-xl font-bold font-heading leading-tight tracking-tight text-[var(--text-primary)]", className)}
      {...props}
    />
  );
}

export function CardDescription({ className, ...props }: React.HTMLAttributes<HTMLParagraphElement>) {
  return <p className={cn("text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed", className)} {...props} />;
}

export function CardContent({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("p-5 sm:p-6 pt-0", className)} {...props} />;
}

export function CardFooter({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("flex items-center p-5 sm:p-6 pt-0 border-t border-[var(--border)]/60 mt-4", className)} {...props} />;
}
