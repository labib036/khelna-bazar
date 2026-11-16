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
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
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
        className={`w-9 h-9 rounded-full bg-[var(--surface-elevated)] border border-[var(--border)] ${className}`}
        aria-hidden="true"
      />
    );
  }

  // Quick 2-state toggle button when dropdown is not explicitly requested
  if (!showDropdown) {
    return (
      <button
        onClick={toggleTheme}
        className={`p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--surface-elevated)] border border-transparent hover:border-[var(--border)] transition-colors cursor-pointer flex items-center justify-center ${className}`}
        aria-label={`Current theme: ${resolvedTheme}. Click to switch to ${
          resolvedTheme === "dark" ? "light" : "dark"
        } mode.`}
        title={`Switch to ${resolvedTheme === "dark" ? "Light" : "Dark"} mode`}
      >
        {resolvedTheme === "dark" ? (
          <Sun className="w-4 h-4 text-[var(--warning)] transition-transform duration-200 hover:rotate-45" />
        ) : (
          <Moon className="w-4 h-4 text-[var(--text-primary)] transition-transform duration-200 hover:-rotate-12" />
        )}
      </button>
    );
  }

  const options: { value: ThemeMode; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { value: "light", label: "Light Theme", icon: Sun },
    { value: "dark", label: "Dark Theme", icon: Moon },
    { value: "system", label: "System (Auto)", icon: Laptop },
  ];

  return (
    <div className={`relative inline-block text-left ${className}`} ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--surface-elevated)] border border-[var(--border)] transition-colors cursor-pointer flex items-center justify-center"
        aria-label={`Theme appearance: ${theme} mode. Click to choose theme.`}
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {resolvedTheme === "dark" ? (
          <Moon className="w-4 h-4 text-[var(--warning)]" />
        ) : (
          <Sun className="w-4 h-4 text-[var(--warning)]" />
        )}
      </button>

      {isOpen && (
        <div
          role="menu"
          aria-label="Theme selection"
          className="absolute right-0 mt-2 w-44 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xl p-1.5 z-50 text-xs animate-in fade-in zoom-in-95"
        >
          <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
            Appearance
          </div>
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.value;
            return (
              <button
                key={opt.value}
                role="menuitem"
                onClick={() => {
                  setTheme(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-[var(--primary)] text-[var(--on-primary)] font-bold shadow-xs"
                    : "text-[var(--text-primary)] hover:bg-[var(--surface-elevated)]"
                }`}
              >
                <div className="flex items-center gap-2">
                  <Icon className="w-3.5 h-3.5" />
                  <span>{opt.label}</span>
                </div>
                {isSelected && <Check className="w-3.5 h-3.5" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
