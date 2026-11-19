"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { useLockBodyScroll } from "@/lib/use-lock-body-scroll";
import { useAccessibleModal } from "@/lib/modal-stack";
import { X } from "lucide-react";

export interface DialogProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl";
  initialFocusRef?: React.RefObject<HTMLElement | null>;
}

export function Dialog({
  isOpen,
  onClose,
  title,
  description,
  children,
  className,
  maxWidth = "md",
  initialFocusRef,
}: DialogProps) {
  useLockBodyScroll(isOpen);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { titleId, descriptionId, containerRef, zIndex } = useAccessibleModal({
    isOpen,
    onClose,
    initialFocusRef,
    baseZIndex: 50,
  });

  if (!isOpen || !mounted) return null;

  const maxWidthStyles = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  const content = (
    <div
      className="fixed inset-0 flex items-center justify-center p-4 sm:p-6"
      style={{ zIndex }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descriptionId : undefined}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[var(--overlay)] backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal Dialog Box */}
      <div
        ref={containerRef}
        tabIndex={-1}
        className={cn(
          "relative z-10 w-full rounded-3xl bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] shadow-2xl p-6 overflow-hidden animate-in zoom-in-95 fade-in-0 duration-200 outline-none",
          maxWidthStyles[maxWidth],
          className
        )}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-4 pb-4">
          <div className="space-y-1">
            {title && (
              <h3
                id={titleId}
                className="text-lg sm:text-xl font-bold font-heading text-[var(--text-primary)]"
              >
                {title}
              </h3>
            )}
            {description && (
              <p id={descriptionId} className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-colors cursor-pointer shrink-0"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="pt-2">{children}</div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(content, document.body) : null;
}
