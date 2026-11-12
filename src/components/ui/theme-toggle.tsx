"use client";

import React, { useState, useRef, useEffect } from "react";
import { useTheme, Theme } from "@/components/theme-provider";
import { Sun, Moon, Laptop, Check } from "lucide-react";

interface ThemeToggleProps {
  className?: string;
  showDropdown?: boolean;
}

export function ThemeToggle({ className = "", showDropdown = false }: ThemeToggleProps) {
  const { theme, resolvedTheme, setTheme, toggleTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) {
    // Render placeholder with same dimensions to prevent layout shift
    return (
      <div className={`w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 ${className}`} />
    );
  }

  if (!showDropdown) {
    return (
      <button
        onClick={toggleTheme}
        className={`p-2 rounded-full text-slate-600 dark:text-slate-300 hover:text-[#DC012B] dark:hover:text-[#FF3B56] hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer flex items-center justify-center ${className}`}
        aria-label={`Current theme: ${resolvedTheme}. Click to switch to ${resolvedTheme === "dark" ? "light" : "dark"} mode.`}
        title={`Switch to ${resolvedTheme === "dark" ? "Light" : "Dark"} mode`}
      >
        {resolvedTheme === "dark" ? (
          <Sun className="w-4 h-4 text-[#F59E0B] transition-transform duration-200 hover:rotate-45" />
        ) : (
          <Moon className="w-4 h-4 text-slate-700 transition-transform duration-200 hover:-rotate-12" />
        )}
      </button>
    );
  }

  const options: { value: Theme; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { value: "light", label: "Light", icon: Sun },
    { value: "dark", label: "Dark", icon: Moon },
    { value: "system", label: "System (Auto)", icon: Laptop },
  ];

  return (
    <div className={`relative inline-block text-left ${className}`} ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 rounded-full text-slate-600 dark:text-slate-300 hover:text-[#DC012B] dark:hover:text-[#FF3B56] hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors cursor-pointer flex items-center justify-center"
        aria-label="Toggle theme mode"
      >
        {resolvedTheme === "dark" ? (
          <Moon className="w-4 h-4 text-[#F59E0B]" />
        ) : (
          <Sun className="w-4 h-4 text-amber-500" />
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-white dark:bg-[#1B1C24] border border-[#E8E2DE] dark:border-[#2E303E] shadow-xl p-1.5 z-50 text-xs animate-in fade-in zoom-in-95">
          <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
            Appearance
          </div>
          {options.map((opt) => {
            const Icon = opt.icon;
            const isSelected = theme === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => {
                  setTheme(opt.value);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-xl transition-colors cursor-pointer ${
                  isSelected
                    ? "bg-[#FFF0F2] dark:bg-[#3D000B] text-[#DC012B] dark:text-[#FF3B56] font-bold"
                    : "text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800"
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
