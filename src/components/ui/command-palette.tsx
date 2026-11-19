"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { useLockBodyScroll } from "@/lib/use-lock-body-scroll";
import { useAccessibleModal } from "@/lib/modal-stack";
import {
  Search,
  Package,
  Layers,
  Gift,
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  ArrowRight,
  Truck,
} from "lucide-react";

export interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  category: "Storefront" | "Admin" | "Actions";
  onSelect: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [mounted, setMounted] = React.useState(false);
  const [query, setQuery] = React.useState("");
  const [selectedIndex, setSelectedIndex] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);

  useLockBodyScroll(isOpen);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  const { containerRef, zIndex } = useAccessibleModal({
    isOpen,
    onClose,
    initialFocusRef: inputRef,
    baseZIndex: 60,
  });

  React.useEffect(() => {
    if (!isOpen) {
      setQuery("");
      setSelectedIndex(0);
    }
  }, [isOpen]);

  const items: CommandItem[] = [
    {
      id: "all-toys",
      title: "All Categories & Toys",
      subtitle: "Browse the complete toy catalog",
      icon: <Layers className="w-4 h-4 text-[var(--primary)]" />,
      category: "Storefront",
      onSelect: () => {
        router.push("/c/all");
        onClose();
      },
    },
    {
      id: "track-order",
      title: "Track Delivery Order",
      subtitle: "Lookup live order status by ID & phone",
      icon: <Package className="w-4 h-4 text-[var(--accent)]" />,
      category: "Storefront",
      onSelect: () => {
        router.push("/track-order");
        onClose();
      },
    },
    {
      id: "gift-finder",
      title: "Age Gift Finder Quiz",
      subtitle: "Find the ideal toy recommendation in 4 questions",
      icon: <Gift className="w-4 h-4 text-purple-500" />,
      category: "Storefront",
      onSelect: () => {
        router.push("/gift-finder");
        onClose();
      },
    },
    {
      id: "flash-deals",
      title: "Flash Deals & Offers",
      subtitle: "Limited-time discounts and special sales",
      icon: <Sparkles className="w-4 h-4 text-[var(--warning)]" />,
      category: "Storefront",
      onSelect: () => {
        router.push("/deals");
        onClose();
      },
    },
    {
      id: "cart",
      title: "View Shopping Cart",
      subtitle: "Review items in your basket",
      icon: <ShoppingBag className="w-4 h-4 text-[var(--success)]" />,
      category: "Storefront",
      onSelect: () => {
        router.push("/cart");
        onClose();
      },
    },
    {
      id: "track-order",
      title: "Track Your Order",
      subtitle: "Check live delivery status for your package",
      icon: <Truck className="w-4 h-4 text-[var(--accent)]" />,
      category: "Storefront",
      onSelect: () => {
        router.push("/track-order");
        onClose();
      },
    },
    {
      id: "help-center",
      title: "Help & Customer Support",
      subtitle: "FAQ, delivery timelines, and contact details",
      icon: <Sparkles className="w-4 h-4 text-[var(--primary)]" />,
      category: "Storefront",
      onSelect: () => {
        router.push("/help");
        onClose();
      },
    },
  ];

  const filteredItems = items.filter(
    (item) =>
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      (item.subtitle && item.subtitle.toLowerCase().includes(query.toLowerCase()))
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      onClose();
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === "Enter" && filteredItems[selectedIndex]) {
      e.preventDefault();
      filteredItems[selectedIndex].onSelect();
    }
  };

  if (!isOpen || !mounted) return null;

  const content = (
    <div
      className="fixed inset-0 flex items-start justify-center pt-20 px-4 sm:px-6"
      style={{ zIndex }}
      role="dialog"
      aria-modal="true"
      aria-label="Quick Navigation and Search Commands"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-[var(--overlay)] backdrop-blur-xs transition-opacity animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Palette Container */}
      <div
        ref={containerRef}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className="relative z-10 w-full max-w-xl rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 outline-none"
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 border-b border-[var(--border)]">
          <Search className="w-5 h-5 text-[var(--text-muted)] shrink-0 mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command, page, or search query..."
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            className="w-full py-4 bg-transparent outline-none text-sm font-medium text-[var(--text-primary)] placeholder:text-[var(--text-muted)]"
          />
          <kbd className="hidden sm:inline-flex px-2 py-0.5 rounded-lg border border-[var(--border)] bg-[var(--surface-elevated)] text-[10px] font-bold text-[var(--text-muted)]">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-8 text-center text-xs text-[var(--text-muted)]">
              No matching commands or navigation links found.
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={item.onSelect}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    "w-full flex items-center justify-between p-3 rounded-2xl text-left transition-colors cursor-pointer",
                    isSelected
                      ? "bg-[var(--primary)] text-[var(--on-primary)]"
                      : "hover:bg-[var(--surface-elevated)] text-[var(--text-primary)]"
                  )}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={cn(
                        "p-2 rounded-xl shrink-0",
                        isSelected
                          ? "bg-white/20 text-white"
                          : "bg-[var(--surface-elevated)]"
                      )}
                    >
                      {item.icon}
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs sm:text-sm font-bold truncate">{item.title}</p>
                      {item.subtitle && (
                        <p
                          className={cn(
                            "text-[11px] truncate",
                            isSelected ? "text-white/80" : "text-[var(--text-muted)]"
                          )}
                        >
                          {item.subtitle}
                        </p>
                      )}
                    </div>
                  </div>
                  <ArrowRight
                    className={cn(
                      "w-4 h-4 shrink-0 transition-transform",
                      isSelected ? "translate-x-0.5 text-white" : "opacity-0"
                    )}
                  />
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(content, document.body) : null;
}
