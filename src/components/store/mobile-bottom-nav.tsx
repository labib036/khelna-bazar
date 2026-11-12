"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCartStore } from "@/lib/cart-store";
import { Home, Layers, Search, ShoppingBag, User } from "lucide-react";

export function MobileBottomNav() {
  const pathname = usePathname();
  const { toggleCart, getItemCount } = useCartStore();
  const count = getItemCount();

  // Hide on checkout page to avoid conversion distraction
  if (pathname === "/checkout" || pathname.startsWith("/admin")) {
    return null;
  }

  const navItems = [
    { label: "Home", href: "/", icon: Home },
    { label: "Categories", href: "/c/all", icon: Layers },
    { label: "Search", href: "/search", icon: Search },
    { label: "Account", href: "/account", icon: User },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 dark:bg-[#1B1C24]/95 backdrop-blur-md border-t border-[#E8E2DE] dark:border-[#2E303E] px-4 py-2"
    >
      <div className="flex items-center justify-around">
        {navItems.slice(0, 2).map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? "text-[#DC012B] font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:text-[#DC012B]"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}

        {/* Center Cart Trigger */}
        <button
          onClick={toggleCart}
          className="relative -top-3 flex flex-col items-center justify-center w-12 h-12 rounded-full bg-gradient-to-tr from-[#DC012B] to-[#7B5CFA] text-white shadow-lg active:scale-95 transition-transform cursor-pointer"
          aria-label="View Cart"
        >
          <ShoppingBag className="w-5 h-5" />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#FFC93C] text-[#18191F] text-[10px] font-black flex items-center justify-center shadow-xs">
              {count}
            </span>
          )}
        </button>

        {navItems.slice(2).map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center gap-1 py-1 px-3 rounded-xl transition-all cursor-pointer ${
                isActive
                  ? "text-[#DC012B] font-bold"
                  : "text-slate-500 dark:text-slate-400 hover:text-[#DC012B]"
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px]">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
