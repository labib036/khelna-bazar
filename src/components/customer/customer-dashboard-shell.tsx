"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageToggle, useLanguage } from "@/lib/i18n";
import {
  User,
  Package,
  MapPin,
  Sparkles,
  LogOut,
  ArrowLeft,
  Menu,
  X,
  Phone,
  MessageCircle,
  ShoppingBag,
  ShieldCheck,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";

interface CustomerDashboardShellProps {
  children: React.ReactNode;
  hotline?: string;
}

export function CustomerDashboardShell({ children, hotline }: CustomerDashboardShellProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  const { t } = useLanguage();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut({ callbackUrl: "/login" });
    toast.info("Signed out successfully.");
  };

  const navItems = [
    {
      label: "Account Overview",
      href: "/dashboard",
      icon: User,
      exact: true,
    },
    {
      label: "My Orders & Tracking",
      href: "/dashboard/orders",
      icon: Package,
      exact: false,
    },
    {
      label: "Delivery Addresses",
      href: "/dashboard/addresses",
      icon: MapPin,
      exact: false,
    },
    {
      label: "Profile & Password",
      href: "/dashboard/profile",
      icon: User,
      exact: false,
    },
    {
      label: "PlayPoints Rewards",
      href: "/dashboard/rewards",
      icon: Sparkles,
      exact: false,
    },
  ];

  const isLinkActive = (item: (typeof navItems)[0]) => {
    if (item.exact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  return (
    <div
      data-testid="customer-dashboard-shell"
      className="min-h-screen flex flex-col bg-[var(--surface-container-low)] text-[var(--text-primary)]"
    >
      {/* Customer Header / Topbar */}
      <header className="sticky top-0 z-40 bg-[var(--surface)]/95 backdrop-blur-md border-b border-[var(--border)] px-4 sm:px-6 lg:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-container-high)] cursor-pointer"
              aria-label="Toggle Dashboard Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link href="/dashboard" className="flex items-center gap-2.5 group">
              <div className="relative w-9 h-9 rounded-xl overflow-hidden border border-[var(--border)] shadow-xs bg-white shrink-0">
                <Image
                  src="/images/khelna-bazar-logo.png"
                  alt="Khelna Bazar"
                  fill
                  className="object-contain p-1"
                />
              </div>
              <div className="flex flex-col">
                <span className="font-heading font-black text-sm text-[var(--text-primary)] leading-tight">
                  Khelna <span className="text-[var(--primary)]">Bazar</span>
                </span>
                <span className="text-[10px] font-bold text-[var(--text-muted)] tracking-wider uppercase">
                  Customer Dashboard
                </span>
              </div>
            </Link>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold text-[var(--text-primary)] hover:text-[var(--primary)] bg-[var(--surface-container-high)] hover:bg-[var(--surface-container-highest)] transition-colors border border-[var(--border)] shadow-2xs"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Back to</span> Store
            </Link>

            <LanguageToggle />
            <ThemeToggle />

            {/* User Avatar Chip */}
            <div className="flex items-center gap-2 pl-2 border-l border-[var(--border)]">
              <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-[var(--on-primary)] font-black text-xs flex items-center justify-center shadow-xs">
                {user?.name ? user.name[0].toUpperCase() : "C"}
              </div>
              <span className="text-xs font-bold hidden md:inline truncate max-w-[120px]">
                {user?.name || "Customer"}
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto w-full flex-1 flex flex-col lg:flex-row p-4 sm:p-6 lg:p-8 gap-6 sm:gap-8">
        {/* Customer Sidebar (Desktop) */}
        <aside
          data-testid="customer-sidebar"
          className="hidden lg:flex flex-col w-64 shrink-0 gap-6"
        >
          {/* User Profile Card */}
          <div className="p-5 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[var(--primary)] to-amber-500 text-[var(--on-primary)] font-black text-base flex items-center justify-center shadow-xs">
                {user?.name ? user.name[0].toUpperCase() : "C"}
              </div>
              <div className="min-w-0">
                <span className="font-heading font-black text-sm text-[var(--text-primary)] block truncate">
                  {user?.name || "Customer"}
                </span>
                <span className="text-[11px] text-[var(--text-muted)] block truncate">
                  {user?.email || user?.phone || "Personal Account"}
                </span>
                <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-600 dark:text-emerald-400">
                  <ShieldCheck className="w-3 h-3" /> Verified Customer
                </span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="p-3 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-1">
            {navItems.map((item) => {
              const active = isLinkActive(item);
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                    active
                      ? "bg-[var(--primary)] text-[var(--on-primary)] shadow-xs"
                      : "text-[var(--text-muted)] hover:text-[var(--text-primary)] hover:bg-[var(--surface-container-high)]"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </div>
                  <ChevronRight
                    className={`w-3.5 h-3.5 transition-transform ${active ? "translate-x-0.5" : "opacity-40"}`}
                  />
                </Link>
              );
            })}

            <div className="pt-2 mt-2 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Sign Out</span>
              </button>
            </div>
          </nav>

          {/* Customer Helpline Card */}
          {hotline && hotline.trim().length > 0 && (
            <div className="p-4 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-2">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block">
                Helpline &amp; Assistance
              </span>
              <div className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)]">
                <Phone className="w-4 h-4 text-[var(--primary)]" />
                <a href={`tel:${hotline.replace(/[\s-]/g, "")}`} className="hover:underline">
                  {hotline}
                </a>
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                <MessageCircle className="w-4 h-4" />
                <a
                  href={`https://wa.me/88${hotline.replace(/[\s-]/g, "").replace(/^(\+?88)/, "")}`}
                  target="_blank"
                  rel="noreferrer"
                  className="hover:underline"
                >
                  WhatsApp Support
                </a>
              </div>
            </div>
          )}
        </aside>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex">
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
              onClick={() => setIsMobileMenuOpen(false)}
            />
            <div className="relative w-72 max-w-[80vw] bg-[var(--surface)] p-6 shadow-2xl flex flex-col justify-between z-10 border-r border-[var(--border)]">
              <div className="space-y-6">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-[var(--on-primary)] font-black text-xs flex items-center justify-center">
                      {user?.name ? user.name[0].toUpperCase() : "C"}
                    </div>
                    <span className="font-bold text-xs truncate max-w-[140px]">
                      {user?.name || "Customer"}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-1 text-[var(--text-muted)] hover:text-[var(--text-primary)]"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="space-y-1">
                  {navItems.map((item) => {
                    const active = isLinkActive(item);
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={`flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-bold transition-all ${
                          active
                            ? "bg-[var(--primary)] text-[var(--on-primary)]"
                            : "text-[var(--text-muted)] hover:bg-[var(--surface-container-high)] text-[var(--text-primary)]"
                        }`}
                      >
                        <Icon className="w-4 h-4" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </nav>
              </div>

              <div className="pt-4 border-t border-[var(--border)] space-y-2">
                <Link
                  href="/"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-[var(--text-primary)] hover:bg-[var(--surface-container-high)]"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Return to Store</span>
                </Link>
                <button
                  type="button"
                  onClick={handleSignOut}
                  className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold text-rose-500 hover:bg-rose-500/10"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Dashboard Work Area */}
        <main className="flex-1 min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}
