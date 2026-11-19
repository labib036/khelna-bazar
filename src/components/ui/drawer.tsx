"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/utils";
import { useLockBodyScroll } from "@/lib/use-lock-body-scroll";
import { useAccessibleModal } from "@/lib/modal-stack";
import { X } from "lucide-react";

export interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  children: React.ReactNode;
  position?: "right" | "bottom" | "left";
  className?: string;
  initialFocusRef?: React.RefObject<HTMLElement | null>;
}

export function Drawer({
  isOpen,
  onClose,
  title,
  description,
  children,
  position = "right",
  className,
  initialFocusRef,
}: DrawerProps) {
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

  const positionStyles = {
    right:
      "fixed right-0 top-0 bottom-0 w-full max-w-md h-full rounded-l-3xl animate-in slide-in-from-right duration-300",
    left:
      "fixed left-0 top-0 bottom-0 w-full max-w-md h-full rounded-r-3xl animate-in slide-in-from-left duration-300",
    bottom:
      "fixed left-0 right-0 bottom-0 w-full max-h-[85vh] rounded-t-3xl animate-in slide-in-from-bottom duration-300",
  };

  const content = (
    <div
      className="fixed inset-0 flex"
      style={{ zIndex }}
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? titleId : undefined}
      aria-describedby={description ? descriptionId : undefined}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[var(--overlay)] backdrop-blur-xs transition-opacity animate-in fade-in duration-200 cursor-pointer"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer Container */}
      <div
        ref={containerRef}
        tabIndex={-1}
        className={cn(
          "relative z-10 flex flex-col bg-[var(--surface)] text-[var(--text-primary)] border border-[var(--border)] shadow-2xl overflow-hidden outline-none",
          positionStyles[position],
          className
        )}
      >
        {/* Mobile bottom drag handle */}
        {position === "bottom" && (
          <div className="w-12 h-1.5 rounded-full bg-[var(--border)] mx-auto my-3 shrink-0" />
        )}

        {/* Header */}
        {(title || description) && (
          <div className="flex items-center justify-between p-5 border-b border-[var(--border)] shrink-0">
            <div className="space-y-0.5">
              {title && (
                <h3
                  id={titleId}
                  className="text-lg font-bold font-heading text-[var(--text-primary)]"
                >
                  {title}
                </h3>
              )}
              {description && (
                <p id={descriptionId} className="text-xs text-[var(--text-muted)]">
                  {description}
                </p>
              )}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-elevated)] transition-colors cursor-pointer"
              aria-label="Close drawer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(content, document.body) : null;
}
