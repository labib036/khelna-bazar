"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/lib/auth-store";
import {
  User,
  Package,
  MapPin,
  Sparkles,
  Heart,
  Settings,
  LogOut,
  ShieldAlert,
} from "lucide-react";
import { toast } from "sonner";

export function AccountNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    toast.info("You have signed out.");
    router.push("/login");
  };

  const links = [
    { label: "Dashboard Overview", href: "/account", icon: User },
    { label: "My Orders & Delivery", href: "/account/orders", icon: Package },
    { label: "Saved Addresses", href: "/account/addresses", icon: MapPin },
    { label: "PlayPoints Rewards", href: "/account/rewards", icon: Sparkles },
    { label: "Wishlist", href: "/wishlist", icon: Heart },
  ];

  return (
    <aside className="w-full lg:w-64 bg-white dark:bg-[#1B1C24] p-5 rounded-3xl border border-[#E8E2DE] dark:border-[#2E303E] space-y-6 shrink-0 shadow-xs">
      {/* User Mini Profile Header */}
      <div className="flex items-center gap-3 pb-5 border-b border-slate-100 dark:border-slate-800">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#DC012B] to-[#F59E0B] text-white flex items-center justify-center font-bold text-lg shadow-sm">
          {user?.name?.[0] || <User className="w-6 h-6" />}
        </div>
        <div className="min-w-0">
          <h3 className="font-heading font-bold text-sm text-[#18191F] dark:text-white truncate">
            {user?.name || "Guest Visitor"}
          </h3>
          {user ? (
            <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#FFF0F2] text-[#DC012B] inline-block mt-0.5">
              {user.tier} Member &bull; {user.loyaltyPoints} Pts
            </span>
          ) : (
            <Link href="/login" className="text-[11px] font-bold text-[#DC012B] hover:underline block mt-0.5">
              Sign In &bull; Claim 100 Pts
            </Link>
          )}
        </div>
      </div>

      {/* Nav Links */}
      <nav aria-label="Account navigation" className="space-y-1">
        {links.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-[#DC012B] text-white shadow-xs"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#242531]"
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{item.label}</span>
            </Link>
          );
        })}

        {/* If user is Admin or Staff, show shortcut to Admin Panel */}
        {(user?.role === "ADMIN" || user?.role === "STAFF") && (
          <Link
            href="/admin"
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl text-xs font-bold bg-[#F3EFFF] text-[#7B5CFA] hover:bg-[#7B5CFA] hover:text-white transition-all cursor-pointer mt-3"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>Open Admin Dashboard</span>
          </Link>
        )}
      </nav>

      {/* Sign Out / Sign In Action */}
      <div className="pt-3 border-t border-slate-100 dark:border-slate-800">
        {user ? (
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3.5 py-2 rounded-2xl text-xs font-bold text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        ) : (
          <div className="space-y-1.5">
            <Link
              href="/login"
              className="w-full flex items-center justify-center py-2 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-[#DC012B] hover:text-[#DC012B] transition-colors"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="w-full flex items-center justify-center py-2 rounded-xl bg-[#DC012B] text-white text-xs font-bold hover:bg-[#B80023] transition-colors"
            >
              Create Account
            </Link>
          </div>
        )}
      </div>
    </aside>
  );
}
