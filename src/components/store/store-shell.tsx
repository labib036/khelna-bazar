"use client";

import { usePathname } from "next/navigation";
import { AnnouncementBar } from "@/components/store/announcement-bar";
import { Header } from "@/components/store/header";
import { Footer } from "@/components/store/footer";
import { MiniCartDrawer } from "@/components/store/mini-cart-drawer";
import { MobileBottomNav } from "@/components/store/mobile-bottom-nav";
import { CompareTray } from "@/components/store/compare-tray";

interface StoreShellProps {
  children: React.ReactNode;
}

export function StoreShell({ children }: StoreShellProps) {
  const pathname = usePathname();
  const isAdmin = pathname.startsWith("/admin");

  if (isAdmin) {
    // Admin routes do NOT render storefront chrome
    return <>{children}</>;
  }

  return (
    <div className="min-h-dvh flex flex-col overflow-x-hidden">
      <AnnouncementBar />
      <Header />
      <main className="flex-1">{children}</main>
      <Footer />
      <MiniCartDrawer />
      <CompareTray />
      <MobileBottomNav />
    </div>
  );
}
