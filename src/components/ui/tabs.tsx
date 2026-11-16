"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

interface TabsContextType {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  variant?: "pill-red" | "pill-surface";
}

const TabsContext = React.createContext<TabsContextType>({
  activeTab: "",
  setActiveTab: () => {},
  variant: "pill-surface",
});

export interface TabsProps extends React.HTMLAttributes<HTMLDivElement> {
  defaultValue: string;
  value?: string;
  variant?: "pill-red" | "pill-surface";
  onValueChange?: (value: string) => void;
}

export function Tabs({ defaultValue, value, variant = "pill-surface", onValueChange, children, className, ...props }: TabsProps) {
  const [activeTab, setActiveTabState] = React.useState(value || defaultValue);

  React.useEffect(() => {
    if (value !== undefined) {
      setActiveTabState(value);
    }
  }, [value]);

  const setActiveTab = (newTab: string) => {
    if (value === undefined) {
      setActiveTabState(newTab);
    }
    onValueChange?.(newTab);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab, variant }}>
      <div className={cn("w-full space-y-4", className)} {...props}>
        {children}
      </div>
    </TabsContext.Provider>
  );
}

export function TabsList({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      role="tablist"
      className={cn(
        "inline-flex items-center gap-1.5 p-1.5 rounded-full bg-[var(--surface-container-low)] border border-[var(--border)] overflow-x-auto no-scrollbar shadow-2xs",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}

export interface TabsTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export function TabsTrigger({ value, className, children, ...props }: TabsTriggerProps) {
  const { activeTab, setActiveTab, variant } = React.useContext(TabsContext);
  const isActive = activeTab === value;

  const activeStyles =
    variant === "pill-red"
      ? "bg-[var(--primary)] text-[var(--on-primary)] shadow-sm font-extrabold"
      : "bg-[var(--surface)] text-[var(--primary)] shadow-sm font-extrabold";

  return (
    <button
      role="tab"
      type="button"
      aria-selected={isActive}
      onClick={() => setActiveTab(value)}
      className={cn(
        "px-4 py-2 rounded-full text-xs sm:text-sm font-bold transition-all duration-150 cursor-pointer whitespace-nowrap select-none",
        isActive
          ? activeStyles
          : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface)]/50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export interface TabsContentProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export function TabsContent({ value, className, children, ...props }: TabsContentProps) {
  const { activeTab } = React.useContext(TabsContext);
  if (activeTab !== value) return null;

  return (
    <div
      role="tabpanel"
      className={cn("animate-in fade-in-50 duration-200", className)}
      {...props}
    >
      {children}
    </div>
  );
}
