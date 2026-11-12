"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import {
  LayoutDashboard,
  Package,
  ShoppingBag,
  Layers,
  Tag,
  Users,
  Settings,
  Truck,
  LogOut,
  Store,
  Menu,
  X,
  Bell,
  Search,
  CheckCircle,
} from "lucide-react";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const navItems = [
    { label: "Dashboard", href: "/admin", icon: LayoutDashboard },
    { label: "Orders & COD Cash", href: "/admin/orders", icon: ShoppingBag },
    { label: "Product Catalog", href: "/admin/products", icon: Package },
    { label: "Inventory Stock", href: "/admin/inventory", icon: Layers },
    { label: "Coupons & Deals", href: "/admin/coupons", icon: Tag },
    { label: "Delivery & Store Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#F7F9FC] dark:bg-[#0E1424] flex flex-col lg:flex-row">
      {/* Mobile Top Header */}
      <div className="lg:hidden bg-white dark:bg-[#161D33] border-b border-[#E3E8F2] dark:border-[#263050] px-4 py-3 flex items-center justify-between">
        <button onClick={() => setIsSidebarOpen(true)} className="p-2 text-slate-600">
          <Menu className="w-6 h-6" />
        </button>
        <span className="font-heading font-black text-lg text-[#14213D] dark:text-white">
          KB <span className="text-[#1E5BFF]">ADMIN</span>
        </span>
        <Link href="/" className="text-xs font-bold text-[#1E5BFF]">
          Storefront &rarr;
        </Link>
      </div>

      {/* Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-[#14213D] text-white p-5 flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 lg:static lg:min-h-screen ${
          isSidebarOpen ? "translate-x-0" : "-translate-x-0 max-lg:-translate-x-full"
        }`}
      >
        <div className="space-y-6">
          {/* Logo & Storefront Switch */}
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2.5">
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white p-0.5 shrink-0 shadow-xs">
                <Image
                  src="/images/khelna-bazar-logo.png"
                  alt="Khelna Bazar Badge"
                  fill
                  className="object-contain"
                />
              </div>
              <div>
                <span className="font-heading font-black text-lg text-white tracking-tight leading-none block">
                  KHELNA <span className="text-[#1E5BFF]">BAZAR</span>
                </span>
                <span className="text-[10px] font-mono text-emerald-400 block tracking-widest uppercase mt-0.5">
                  Admin Console
                </span>
              </div>
            </div>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Role Badge */}
          <div className="p-3 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#1E5BFF] flex items-center justify-center font-bold text-xs text-white">
              {user?.name?.[0] || "A"}
            </div>
            <div className="min-w-0">
              <span className="text-xs font-bold text-white block truncate">{user?.name || "Owner"}</span>
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">
                {user?.role || "ADMIN"} Role
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav aria-label="Admin Navigation" className="space-y-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#1E5BFF] text-white shadow-sm"
                      : "text-slate-400 hover:text-white hover:bg-slate-800"
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Actions */}
        <div className="pt-4 border-t border-slate-800 space-y-2">
          <Link
            href="/"
            className="flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <Store className="w-4 h-4 text-[#FFC93C]" />
            <span>Visit Live Storefront</span>
          </Link>
        </div>
      </aside>

      {/* Main Admin Page Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto space-y-8">
        {children}
      </main>
    </div>
  );
}
