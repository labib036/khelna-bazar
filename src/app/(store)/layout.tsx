import { AnnouncementBar } from "@/components/store/announcement-bar";
import { Header } from "@/components/store/header";
import { Footer } from "@/components/store/footer";
import { MiniCartDrawer } from "@/components/store/mini-cart-drawer";
import { MobileBottomNav } from "@/components/store/mobile-bottom-nav";
import { CompareTray } from "@/components/store/compare-tray";

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-testid="storefront-shell" className="min-h-screen flex flex-col overflow-x-hidden pb-16 md:pb-0">
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
