"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import {
  User,
  Package,
  MapPin,
  Sparkles,
  Heart,
  LogOut,
  ShieldAlert,
  Headphones,
  MessageCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useWishlistStore } from "@/lib/wishlist-store";

export function AccountNav() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const user = session?.user;
  const wishlistCount = useWishlistStore((state) => state.getCount());

  const handleLogout = async () => {
    await signOut({ callbackUrl: "/login" });
    toast.info("You have signed out.");
  };

  const links = [
    {
      label: "Dashboard Overview",
      href: "/account",
      icon: User,
      badge: null,
    },
    {
      label: "My Orders & Delivery",
      href: "/account/orders",
      icon: Package,
      badge: null,
    },
    {
      label: "Saved Addresses",
      href: "/account/addresses",
      icon: MapPin,
      badge: null,
    },
    {
      label: "PlayPoints Rewards",
      href: "/account/rewards",
      icon: Sparkles,
      badge: "1,450 pts",
      badgeColor: "bg-[var(--secondary-container)] text-[var(--on-secondary-container)]",
    },
    {
      label: "Wishlist Shelves",
      href: "/wishlist",
      icon: Heart,
      badge: wishlistCount > 0 ? String(wishlistCount) : null,
      badgeColor: "bg-[var(--surface-container-high)] text-[var(--text-muted)]",
    },
  ];

  return (
    <aside className="w-full lg:w-72 bg-[var(--surface-container-low)] p-5 rounded-3xl border border-[var(--border)] space-y-6 shrink-0 shadow-xs">
      {/* User Mini Profile Header */}
      <div className="flex items-center gap-3 pb-5 border-b border-[var(--border)]">
        <div className="w-12 h-12 rounded-2xl bg-[var(--primary)] text-[var(--on-primary)] flex items-center justify-center font-bold text-lg shadow-sm font-heading">
          {user?.name?.[0] || <User className="w-6 h-6" />}
        </div>
        <div className="min-w-0">
          <h3 className="font-heading font-black text-sm text-[var(--text-primary)] truncate">
            {user?.name || "Khelna Shopper"}
          </h3>
          <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[var(--secondary-container)] text-[var(--on-secondary-container)] inline-block mt-0.5">
            Wonder Explorer 🌟
          </span>
        </div>
      </div>

      {/* Navigation Links */}
      <nav className="space-y-1.5">
        <div className="px-3 py-1 text-[10px] font-extrabold uppercase tracking-widest text-[var(--text-muted)]">
          Account Portal
        </div>
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = pathname === link.href;

          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-full font-bold text-xs transition-all ${
                isActive
                  ? "bg-[var(--primary)] text-[var(--on-primary)] shadow-[0_2px_8px_rgba(215,25,33,0.3)]"
                  : "text-[var(--text-primary)] hover:bg-[var(--surface-container)] hover:text-[var(--primary)]"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-[var(--on-primary)]" : "text-[var(--primary)]"}`} />
                <span className="truncate">{link.label}</span>
              </div>
              {link.badge && (
                <span
                  className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                    isActive ? "bg-white/20 text-white" : link.badgeColor
                  }`}
                >
                  {link.badge}
                </span>
              )}
            </Link>
          );
        })}

        {/* Admin Link if role is Admin or Staff */}
        {(user?.role === "ADMIN" || user?.role === "STAFF") && (
          <Link
            href="/admin"
            className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-full font-bold text-xs text-[var(--primary)] bg-[var(--primary)]/10 hover:bg-[var(--primary)]/15 transition-colors mt-3 border border-[var(--primary)]/20"
          >
            <ShieldAlert className="w-4 h-4 shrink-0" />
            <span>Admin Operations Console</span>
          </Link>
        )}
      </nav>

      {/* Parent Elf Help Card */}
      <div className="bg-[var(--surface)] p-4 rounded-2xl border border-[var(--border)] text-center space-y-2">
        <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center mx-auto">
          <Headphones className="w-4 h-4" />
        </div>
        <div className="font-heading font-black text-xs text-[var(--text-primary)]">
          Parent Elf Hotline
        </div>
        <p className="text-[11px] text-[var(--text-muted)] leading-tight">
          Toy safety questions or urgent delivery requests?
        </p>
        <a
          href="https://wa.me/8801700000000"
          target="_blank"
          rel="noreferrer"
          className="inline-flex items-center justify-center gap-1.5 w-full py-1.5 px-3 rounded-full bg-[var(--surface-container-high)] text-[var(--primary)] hover:bg-[var(--primary)] hover:text-[var(--on-primary)] text-xs font-bold transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5" />
          <span>WhatsApp Elf Chat</span>
        </a>
      </div>

      {/* Sign Out Button */}
      <div className="pt-2 border-t border-[var(--border)]">
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2.5 px-3.5 py-2 rounded-full font-bold text-xs text-[var(--danger)] hover:bg-[var(--danger)]/10 transition-colors cursor-pointer text-left"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
