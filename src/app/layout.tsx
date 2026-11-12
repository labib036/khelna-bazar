import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import "@/styles/globals.css";
import { AnnouncementBar } from "@/components/store/announcement-bar";
import { Header } from "@/components/store/header";
import { Footer } from "@/components/store/footer";
import { MiniCartDrawer } from "@/components/store/mini-cart-drawer";
import { MobileBottomNav } from "@/components/store/mobile-bottom-nav";
import { Toaster } from "sonner";

export const metadata: Metadata = {
  title: {
    default: `${siteConfig.name} - Online Toy Store Bangladesh | Cash on Delivery`,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  metadataBase: new URL(siteConfig.url),
  openGraph: {
    type: "website",
    locale: "en_BD",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: siteConfig.ogImage,
        width: 638,
        height: 638,
        alt: "Khelna Bazar Official Logo",
      },
    ],
  },
  icons: {
    icon: [
      { url: "/favicon.png", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: "/apple-icon.png",
    shortcut: "/favicon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth" suppressHydrationWarning>
      <body className="min-h-screen flex flex-col bg-[#F7F9FC] dark:bg-[#0E1424] text-[#14213D] dark:text-[#F3F6FF] antialiased selection:bg-[#1E5BFF] selection:text-white pb-16 md:pb-0">
        <AnnouncementBar />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <MiniCartDrawer />
        <MobileBottomNav />
        <Toaster position="top-center" richColors closeButton />
      </body>
    </html>
  );
}
