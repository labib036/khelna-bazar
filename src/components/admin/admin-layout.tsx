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
  Settings,
  Store,
  Menu,
  X,
  LogOut,
  Bell,
  Search,
  ExternalLink,
  ShieldCheck,
  Truck,
} from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    toast.success("Signed out successfully.");
    router.push("/login");
  };

  const navItems = [
    { label: "Dashboard Overview", href: "/admin", icon: LayoutDashboard },
    { label: "Orders & COD Cash", href: "/admin/orders", icon: ShoppingBag },
    { label: "Product Catalog", href: "/admin/products", icon: Package },
    { label: "Inventory & Stock", href: "/admin/inventory", icon: Layers },
    { label: "Coupons & Discounts", href: "/admin/coupons", icon: Tag },
    { label: "Store & Delivery Settings", href: "/admin/settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-[#FAF8F6] dark:bg-[#121318] flex flex-col lg:flex-row font-sans">
      {/* Mobile Top Header */}
      <header className="lg:hidden bg-[#18191F] text-white px-5 py-3.5 flex items-center justify-between sticky top-0 z-40 border-b border-slate-800 shadow-sm">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-slate-300 hover:text-white rounded-xl focus:outline-none"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <Link href="/admin" className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-white p-0.5 border border-[#DC012B]/30">
            <Image
              src="/images/khelna-bazar-logo.gif"
              alt="Khelna Bazar"
              fill
              unoptimized
              className="object-contain"
            />
          </div>
          <span className="font-heading font-black text-lg text-white tracking-tight">
            KHELNA <span className="text-[#DC012B]">ADMIN</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Link
            href="/"
            className="text-xs font-bold px-3 py-1.5 rounded-full bg-slate-800 text-[#F59E0B] hover:bg-slate-700 flex items-center gap-1"
          >
            <span>Store</span>
            <ExternalLink className="w-3 h-3" />
          </Link>
        </div>
      </header>

      {/* Spacious Sidebar Navigation */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#18191F] text-white p-6 flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 lg:static lg:min-h-screen border-r border-slate-800/80 shrink-0 ${
          isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="space-y-7">
          {/* Brand Header with Animated Movable Logo */}
          <div className="flex items-center justify-between pb-5 border-b border-slate-800">
            <Link href="/" className="flex items-center gap-3.5 group">
              <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white p-0.5 border-2 border-[#DC012B]/40 shadow-md movable-logo shrink-0">
                <Image
                  src="/images/khelna-bazar-logo.gif"
                  alt="Khelna Bazar Animated Logo"
                  fill
                  unoptimized
                  className="object-contain"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-black text-xl text-white tracking-tight leading-none">
                  KHELNA <span className="text-[#DC012B]">BAZAR</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-1">
                  Operations Console
                </span>
              </div>
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1.5 text-slate-400 hover:text-white rounded-lg"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Card */}
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[#DC012B] flex items-center justify-center font-black text-sm text-white shadow-xs shrink-0">
              {user?.name?.[0] || "A"}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-white block truncate">
                {user?.name || "Khelna Bazar Owner"}
              </span>
              <span className="text-[11px] font-semibold text-slate-400 block truncate">
                {user?.email || "admin@khelnabazar.com"}
              </span>
              <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                {user?.role || "ADMIN"} ACCESS
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav aria-label="Admin Navigation" className="space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 px-3 block mb-2">
              Store Management
            </span>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? "bg-[#DC012B] text-white shadow-md shadow-[#DC012B]/20"
                      : "text-slate-300 hover:text-white hover:bg-slate-800/80"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${isActive ? "text-white" : "text-slate-400"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Navigation Actions */}
        <div className="pt-6 border-t border-slate-800 space-y-2.5">
          <div className="flex items-center justify-between px-4 py-2 rounded-2xl bg-slate-900 border border-slate-800 text-xs font-bold text-slate-300">
            <span>Theme Mode</span>
            <ThemeToggle showDropdown />
          </div>

          <Link
            href="/"
            className="flex items-center justify-between px-4 py-2.5 rounded-2xl text-xs font-bold bg-slate-900 text-slate-200 hover:text-white hover:bg-slate-800 transition-colors border border-slate-800"
          >
            <div className="flex items-center gap-2">
              <Store className="w-4 h-4 text-[#F59E0B]" />
              <span>Live Storefront</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Page Content with Generous Scaling & Spacing */}
      <main className="flex-1 min-w-0 p-6 sm:p-8 lg:p-10 w-full max-w-[1600px] mx-auto space-y-8">
        {children}
      </main>
    </div>
  );
}
