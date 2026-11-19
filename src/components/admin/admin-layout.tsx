"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
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
  Users,
  ShieldAlert,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { toast } from "sonner";
import { ThemeToggle } from "@/components/ui/theme-toggle";

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const pathname = usePathname();
  const sessionResult = useSession();
  const user = sessionResult?.data?.user;
  const userRole = (user?.role as string) || "STAFF";
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
    toast.success("Signed out successfully.");
  };

  const isSuperAdmin = userRole === "SUPER_ADMIN";
  const isAdminOrSuper = userRole === "ADMIN" || isSuperAdmin;

  const baseNavItems = [
    { label: "Dashboard Overview", href: "/admin/dashboard", icon: LayoutDashboard, exact: true },
    { label: "Orders & COD Cash", href: "/admin/orders", icon: ShoppingBag, exact: false },
    ...(isAdminOrSuper
      ? [
          { label: "Product Catalog", href: "/admin/products", icon: Package, exact: false },
          { label: "Inventory & Stock", href: "/admin/inventory", icon: Layers, exact: false },
          { label: "Coupons & Discounts", href: "/admin/coupons", icon: Tag, exact: false },
          { label: "Store & Delivery Settings", href: "/admin/settings", icon: Settings, exact: false },
        ]
      : []),
    ...(isSuperAdmin
      ? [
          { label: "Staff Accounts", href: "/admin/staff", icon: Users, exact: false },
          { label: "Security & Audit Logs", href: "/admin/audit-logs", icon: ShieldAlert, exact: false },
        ]
      : []),
  ];

  const isItemActive = (href: string, exact: boolean) => {
    if (exact) {
      return pathname === href || pathname === "/admin";
    }
    return pathname.startsWith(href);
  };

  return (
    <div
      data-testid="admin-dashboard-shell"
      className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] flex flex-col lg:flex-row font-sans"
    >
      {/* Mobile Top Header */}
      <header className="lg:hidden bg-stone-900 text-white px-5 py-3.5 flex items-center justify-between sticky top-0 z-40 border-b border-stone-800 shadow-sm">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className="p-2 text-stone-300 hover:text-white rounded-xl focus:outline-none cursor-pointer"
          aria-label="Open sidebar menu"
        >
          <Menu className="w-6 h-6" />
        </button>
        <Link href="/admin/dashboard" className="flex items-center gap-2.5">
          <div className="relative w-8 h-8 rounded-full overflow-hidden bg-white p-0.5 border border-[var(--primary)]/30 shrink-0">
            <Image
              src="/images/khelna-bazar-logo.png"
              alt="Khelna Bazar"
              fill
              className="object-contain p-0.5"
            />
          </div>
          <span className="font-heading font-black text-lg text-white tracking-tight">
            KHELNA <span className="text-[var(--primary)]">ADMIN</span>
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="p-2 text-stone-300 hover:text-white rounded-xl focus:outline-none"
            title="View Storefront"
          >
            <Store className="w-5 h-5 text-amber-400" />
          </Link>
          <ThemeToggle />
        </div>
      </header>

      {/* Spacious Sidebar Navigation */}
      <aside
        data-testid="admin-sidebar"
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-stone-900 text-stone-100 p-6 flex flex-col justify-between transition-transform duration-200 lg:translate-x-0 lg:static lg:min-h-screen border-r border-stone-800 shrink-0 ${
          isSidebarOpen ? "translate-x-0 shadow-2xl" : "-translate-x-full lg:translate-x-0"
        }`}
      >
        <div className="space-y-7">
          {/* Brand Header */}
          <div className="flex items-center justify-between pb-5 border-b border-stone-800">
            <Link href="/admin/dashboard" className="flex items-center gap-3.5 group">
              <div className="relative w-11 h-11 rounded-2xl overflow-hidden bg-white p-1 border-2 border-[var(--primary)]/40 shadow-md shrink-0">
                <Image
                  src="/images/khelna-bazar-logo.png"
                  alt="Khelna Bazar"
                  fill
                  className="object-contain p-0.5"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-black text-lg text-white tracking-tight leading-none">
                  KHELNA <span className="text-[var(--primary)]">BAZAR</span>
                </span>
                <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest mt-1">
                  Management Console
                </span>
              </div>
            </Link>
            <button
              onClick={() => setIsSidebarOpen(false)}
              className="lg:hidden p-1.5 text-stone-400 hover:text-white rounded-lg cursor-pointer"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Profile Card */}
          <div className="p-4 rounded-2xl bg-stone-800/80 border border-stone-700/80 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-[var(--primary)] flex items-center justify-center font-black text-sm text-white shadow-xs shrink-0">
              {user?.name?.[0] || user?.email?.[0] || "A"}
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs font-bold text-white block truncate">
                {user?.name || "Administrator"}
              </span>
              <span className="text-[11px] font-semibold text-stone-400 block truncate">
                {user?.email || "Admin Console"}
              </span>
              <span
                className={`inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider border ${
                  isSuperAdmin
                    ? "bg-purple-500/20 text-purple-400 border-purple-500/30"
                    : isAdminOrSuper
                    ? "bg-emerald-500/15 text-emerald-400 border-emerald-500/30"
                    : "bg-blue-500/15 text-blue-400 border-blue-500/30"
                }`}
              >
                {userRole} ACCESS
              </span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav aria-label="Admin Navigation" className="space-y-1.5">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-stone-400 px-3 block mb-2">
              Store Management
            </span>
            {baseNavItems.map((item) => {
              const active = isItemActive(item.href, item.exact);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsSidebarOpen(false)}
                  className={`flex items-center gap-3 px-3.5 py-3 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? "bg-[var(--primary)] text-white shadow-md shadow-[var(--primary)]/20"
                      : "text-stone-300 hover:text-white hover:bg-stone-800/80"
                  }`}
                >
                  <Icon className={`w-4 h-4 ${active ? "text-white" : "text-stone-400"}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Navigation Actions */}
        <div className="pt-6 border-t border-stone-800 space-y-2.5">
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full flex items-center justify-between px-4 py-2.5 rounded-2xl bg-stone-800 border border-stone-700 text-xs font-bold text-stone-300 hover:text-white hover:border-stone-600 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <Store className="w-4 h-4 text-amber-400" />
              <span>View Storefront</span>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-stone-400" />
          </Link>

          <div className="flex items-center justify-between px-4 py-2 rounded-2xl bg-stone-800 border border-stone-700 text-xs font-bold text-stone-300">
            <span>Theme Mode</span>
            <ThemeToggle showDropdown />
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold text-stone-400 hover:text-rose-400 hover:bg-rose-950/20 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Page Content */}
      <main className="flex-1 min-w-0 p-6 sm:p-8 lg:p-10 w-full max-w-[1600px] mx-auto space-y-8">
        {children}
      </main>
    </div>
  );
}
