"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTheme, ThemeMode } from "@/components/theme-provider";
import { useMounted } from "@/lib/use-mounted";
import { Sun, Moon, Laptop, Check } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
  showDropdown?: boolean;
}

export function ThemeToggle({ className = "", showDropdown = false }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const mounted = useMounted();
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  if (!mounted) {
    return (
      <div
        className={`w-14 h-7 rounded-full bg-[var(--surface-container-high)] border border-[var(--border)] opacity-60 ${className}`}
        aria-hidden="true"
      />
    );
  }

  // When dropdown is explicitly requested (e.g. settings / admin drawer)
  if (showDropdown) {
    const options: { value: ThemeMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
      { value: "light", label: "Light Theme", icon: Sun },
      { value: "dark", label: "Dark Theme", icon: Moon },
      { value: "system", label: "System (Auto)", icon: Laptop },
    ];

    return (
      <div className={`relative inline-block text-left ${className}`} ref={menuRef}>
        <div
          role="radiogroup"
          aria-label="Theme mode"
          className="inline-flex items-center p-0.5 rounded-full bg-[var(--surface-container-high)] border border-[var(--border)] shadow-2xs"
        >
          <button
            type="button"
            role="radio"
            aria-checked={resolvedTheme === "light"}
            onClick={() => setTheme("light")}
            className={`p-1.5 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center ${
              resolvedTheme === "light"
                ? "bg-white text-amber-500 shadow-xs scale-105"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)] opacity-60 hover:opacity-100"
            }`}
            title="Light Theme"
            aria-label="Select Light Theme"
          >
            <Sun className="w-3.5 h-3.5 fill-amber-500/30" />
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={resolvedTheme === "dark"}
            onClick={() => setTheme("dark")}
            className={`p-1.5 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center ${
              resolvedTheme === "dark"
                ? "bg-[#2A1E1C] text-amber-300 shadow-xs scale-105 border border-white/10"
                : "text-[var(--text-muted)] hover:text-[var(--text-primary)] opacity-60 hover:opacity-100"
            }`}
            title="Dark Theme"
            aria-label="Select Dark Theme"
          >
            <Moon className="w-3.5 h-3.5 fill-amber-300/30" />
          </button>
        </div>
      </div>
    );
  }

  // Default: Crystal-Clear Dual-Pill Switcher (☀️ / 🌙)
  // Shows BOTH options side by side so users are never confused about current vs target mode!
  return (
    <div
      role="radiogroup"
      aria-label="Theme switcher"
      className={`inline-flex items-center p-0.5 rounded-full bg-[var(--surface-container-high)] border border-[var(--border)] shadow-2xs transition-all ${className}`}
    >
      <button
        type="button"
        role="radio"
        aria-checked={resolvedTheme === "light"}
        onClick={() => setTheme("light")}
        className={`p-1.5 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center ${
          resolvedTheme === "light"
            ? "bg-white text-amber-500 shadow-xs scale-105"
            : "text-[var(--text-muted)] hover:text-[var(--text-primary)] opacity-60 hover:opacity-100"
        }`}
        title="Light Theme active"
        aria-label="Select Light Theme"
      >
        <Sun className="w-3.5 h-3.5 fill-amber-500/30" />
      </button>

      <button
        type="button"
        role="radio"
        aria-checked={resolvedTheme === "dark"}
        onClick={() => setTheme("dark")}
        className={`p-1.5 rounded-full transition-all duration-200 cursor-pointer flex items-center justify-center ${
          resolvedTheme === "dark"
            ? "bg-[#2A1E1C] text-amber-300 shadow-xs scale-105 border border-white/10"
            : "text-[var(--text-muted)] hover:text-[var(--text-primary)] opacity-60 hover:opacity-100"
        }`}
        title="Dark Theme active"
        aria-label="Select Dark Theme"
      >
        <Moon className="w-3.5 h-3.5 fill-amber-300/30" />
      </button>
    </div>
  );
}
