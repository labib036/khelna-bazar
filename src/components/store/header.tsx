"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/config/site";
import { useCartStore } from "@/lib/cart-store";
import { useWishlistStore } from "@/lib/wishlist-store";
import { formatPrice } from "@/lib/utils";
import {
  Search,
  Mic,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Flame,
  Gift,
  ShieldCheck,
  Package,
  Layers,
} from "lucide-react";

const AGE_RANGES = [
  { label: "0 – 12 Months", query: "0-12m", icon: "🍼" },
  { label: "1 – 2 Years", query: "1-2y", icon: "🧸" },
  { label: "3 – 4 Years", query: "3-4y", icon: "🎨" },
  { label: "5 – 7 Years", query: "5-7y", icon: "🚀" },
  { label: "8 – 11 Years", query: "8-11y", icon: "🧩" },
  { label: "12+ Years", query: "12+", icon: "🔬" },
];

export function Header() {
  const router = useRouter();
  const { toggleCart, getItemCount, getSubtotal } = useCartStore();
  const wishlistCount = useWishlistStore((state) => state.getCount());

  const [searchQuery, setSearchQuery] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAgeMenuOpen, setIsAgeMenuOpen] = useState(false);
  const [isVoiceActive, setIsVoiceActive] = useState(false);
  const [mounted, setMounted] = useState(false);

  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  // Web Speech API Voice Search
  const handleVoiceSearch = () => {
    if (!("webkitSpeechRecognition" in window || "SpeechRecognition" in window)) {
      alert("Voice search is not supported in this browser. Please use Google Chrome or Edge.");
      return;
    }

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => setIsVoiceActive(true);
    recognition.onend = () => setIsVoiceActive(false);
    recognition.onerror = () => setIsVoiceActive(false);

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setSearchQuery(transcript);
      router.push(`/search?q=${encodeURIComponent(transcript)}`);
    };

    recognition.start();
  };

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-[#161D33] border-b border-[#E3E8F2] dark:border-[#263050] shadow-xs">
      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20 gap-4 sm:gap-6">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 text-slate-700 dark:text-slate-200 hover:text-[#1E5BFF] rounded-xl transition-colors cursor-pointer"
            aria-label="Open mobile menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo / Wordmark with Movable Animated Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden bg-white dark:bg-[#1E2742] p-0.5 border border-slate-200/80 dark:border-slate-700 shadow-sm movable-logo shrink-0">
              <Image
                src={siteConfig.logo.animatedGif || "/images/khelna-bazar-logo.gif"}
                alt="Khelna Bazar Animated Logo"
                fill
                unoptimized
                className="object-contain"
                priority
              />
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-xl sm:text-2xl font-black tracking-tight text-[#14213D] dark:text-white leading-none">
                KHELNA <span className="text-[#1E5BFF]">BAZAR</span>
              </span>
              <span className="text-[9px] font-bold tracking-widest text-[#FF6B6B] uppercase leading-none mt-1">
                khelnabazar.com.bd
              </span>
            </div>
          </Link>

          {/* Instant Search Bar (Desktop) */}
          <form
            onSubmit={handleSearchSubmit}
            className="hidden md:flex flex-1 max-w-2xl relative items-center"
          >
            <div className="relative w-full flex items-center">
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search toys by name, age, STEM, Lego, Barbie..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-11 pl-5 pr-24 rounded-full border-2 border-[#1E5BFF] bg-[#F7F9FC] dark:bg-[#1E2742] text-sm text-[#14213D] dark:text-white placeholder:text-slate-400 focus:outline-none focus:bg-white dark:focus:bg-[#161D33] transition-colors"
              />

              {/* Voice Search Button */}
              <button
                type="button"
                onClick={handleVoiceSearch}
                className={`absolute right-12 p-2 rounded-full text-slate-400 hover:text-[#1E5BFF] transition-colors cursor-pointer ${
                  isVoiceActive ? "text-[#FF6B6B] animate-pulse" : ""
                }`}
                title="Search by voice"
                aria-label="Voice search"
              >
                <Mic className="w-4 h-4" />
              </button>

              {/* Search Submit Button */}
              <button
                type="submit"
                className="absolute right-1.5 h-8 px-4 rounded-full bg-[#1E5BFF] hover:bg-[#1546CC] text-white flex items-center justify-center transition-colors cursor-pointer"
                aria-label="Search"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>
          </form>

          {/* Action Icons (Wishlist, Account, Cart) */}
          <div className="flex items-center gap-1 sm:gap-3">
            {/* Wishlist */}
            <Link
              href="/wishlist"
              className="relative p-2.5 text-slate-700 dark:text-slate-200 hover:text-[#FF6B6B] rounded-full hover:bg-slate-100 dark:hover:bg-[#1E2742] transition-colors"
              title="My Wishlist"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {mounted && wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#FF6B6B] text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Account */}
            <Link
              href="/account"
              className="flex items-center gap-2 p-2 text-slate-700 dark:text-slate-200 hover:text-[#1E5BFF] rounded-full hover:bg-slate-100 dark:hover:bg-[#1E2742] transition-colors"
              title="My Account"
              aria-label="Account"
            >
              <User className="w-5 h-5" />
              <span className="hidden xl:inline text-xs font-semibold">Account</span>
            </Link>

            {/* Cart Trigger */}
            <button
              onClick={toggleCart}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-[#EBF1FF] dark:bg-[#1E2D5A] text-[#1E5BFF] hover:bg-[#1E5BFF] hover:text-white transition-all cursor-pointer shadow-xs active:scale-95"
              aria-label="View Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                {mounted && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-[#FFC93C] text-[#14213D] text-[10px] font-extrabold flex items-center justify-center shadow-xs">
                    {getItemCount()}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left leading-none">
                <span className="text-[10px] uppercase font-bold opacity-75">Cash on Del.</span>
                <span className="text-xs font-black">
                  {mounted ? formatPrice(getSubtotal()) : "৳0"}
                </span>
              </div>
            </button>
          </div>
        </div>

        {/* Mobile Search Row (visible on small screens) */}
        <div className="pb-3 md:hidden">
          <form onSubmit={handleSearchSubmit} className="relative flex items-center">
            <input
              type="text"
              placeholder="Search toys, brands, age..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-4 pr-10 rounded-full border border-[#E3E8F2] dark:border-[#263050] bg-[#F7F9FC] dark:bg-[#1E2742] text-xs text-[#14213D] dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-[#1E5BFF]"
            />
            <button
              type="submit"
              className="absolute right-3 text-slate-400 hover:text-[#1E5BFF]"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Secondary Navigation Row (Desktop) */}
      <nav aria-label="Secondary Navigation" className="hidden lg:block border-t border-[#E3E8F2] dark:border-[#263050] bg-[#F7F9FC]/70 dark:bg-[#1E2742]/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-11 text-xs font-semibold">
            {/* Departments & Dropdowns */}
            <div className="flex items-center gap-6">
              {/* All Categories Mega Menu Link */}
              <Link
                href="/c/all"
                className="flex items-center gap-1.5 text-[#14213D] dark:text-white hover:text-[#1E5BFF] py-2"
              >
                <Layers className="w-4 h-4 text-[#1E5BFF]" />
                <span>All Categories</span>
              </Link>

              {/* Shop by Age Dropdown */}
              <div
                className="relative py-2"
                onMouseEnter={() => setIsAgeMenuOpen(true)}
                onMouseLeave={() => setIsAgeMenuOpen(false)}
              >
                <button className="flex items-center gap-1 text-[#14213D] dark:text-white hover:text-[#1E5BFF] cursor-pointer">
                  <span>Shop by Age</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {isAgeMenuOpen && (
                  <div className="absolute top-full left-0 w-56 bg-white dark:bg-[#161D33] rounded-2xl shadow-xl border border-[#E3E8F2] dark:border-[#263050] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {AGE_RANGES.map((age) => (
                      <Link
                        key={age.query}
                        href={`/c/all?age=${age.query}`}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-[#F7F9FC] dark:hover:bg-[#1E2742] text-slate-700 dark:text-slate-200 hover:text-[#1E5BFF] transition-colors"
                      >
                        <span className="text-base">{age.icon}</span>
                        <span>{age.label}</span>
                      </Link>
                    ))}
                  </div>
                )}
              </div>

              {/* Direct Department Links */}
              <Link
                href="/deals"
                className="flex items-center gap-1 text-[#FF6B6B] hover:underline"
              >
                <Flame className="w-3.5 h-3.5 fill-current" />
                <span>Flash Deals</span>
              </Link>
              <Link
                href="/new-arrivals"
                className="flex items-center gap-1 text-[#7B5CFA] hover:underline"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>New Arrivals</span>
              </Link>
              <Link
                href="/c/building-blocks"
                className="text-slate-600 dark:text-slate-300 hover:text-[#1E5BFF]"
              >
                Building Blocks
              </Link>
              <Link
                href="/c/stem-science"
                className="text-slate-600 dark:text-slate-300 hover:text-[#1E5BFF]"
              >
                STEM & Robotics
              </Link>
              <Link
                href="/c/rc-vehicles"
                className="text-slate-600 dark:text-slate-300 hover:text-[#1E5BFF]"
              >
                RC Vehicles
              </Link>
            </div>

            {/* Right Highlights */}
            <div className="flex items-center gap-4">
              <Link
                href="/gift-finder"
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3EFFF] text-[#7B5CFA] hover:bg-[#7B5CFA] hover:text-white transition-colors"
              >
                <Gift className="w-3.5 h-3.5" />
                <span>Gift Finder Quiz</span>
              </Link>
              <Link
                href="/pages/toy-safety"
                className="flex items-center gap-1 text-slate-500 hover:text-[#2EC4B6]"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#2EC4B6]" />
                <span>Child Safety Certified</span>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileMenuOpen(false)} />
          <div className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-white dark:bg-[#161D33] shadow-2xl flex flex-col p-6 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#E3E8F2] dark:border-[#263050]">
              <div className="flex items-center gap-2.5">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white dark:bg-[#1E2742] p-0.5 border border-slate-200 dark:border-slate-700 movable-logo shrink-0">
                  <Image
                    src={siteConfig.logo.animatedGif || "/images/khelna-bazar-logo.gif"}
                    alt="Logo"
                    fill
                    unoptimized
                    className="object-contain"
                  />
                </div>
                <span className="font-heading font-black text-lg text-[#14213D] dark:text-white">
                  KHELNA <span className="text-[#1E5BFF]">BAZAR</span>
                </span>
              </div>
              <button onClick={() => setIsMobileMenuOpen(false)} className="p-2 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
              <p className="text-xs uppercase tracking-wider text-slate-400 font-bold">Categories</p>
              <Link
                href="/c/all"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-1 hover:text-[#1E5BFF]"
              >
                All Toys & Games
              </Link>
              <Link
                href="/deals"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-1 text-[#FF6B6B]"
              >
                🔥 Flash Deals
              </Link>
              <Link
                href="/new-arrivals"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-1 text-[#7B5CFA]"
              >
                ✨ New Arrivals
              </Link>
              <Link
                href="/gift-finder"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-1 text-[#1E5BFF]"
              >
                🎁 Gift Finder Quiz
              </Link>

              <p className="text-xs uppercase tracking-wider text-slate-400 font-bold pt-4">Shop by Age</p>
              <div className="grid grid-cols-2 gap-2 pt-1">
                {AGE_RANGES.map((age) => (
                  <Link
                    key={age.query}
                    href={`/c/all?age=${age.query}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="p-2 rounded-xl bg-[#F7F9FC] dark:bg-[#1E2742] text-xs font-medium flex items-center gap-1.5"
                  >
                    <span>{age.icon}</span>
                    <span>{age.label}</span>
                  </Link>
                ))}
              </div>

              <p className="text-xs uppercase tracking-wider text-slate-400 font-bold pt-4">Account & Help</p>
              <Link
                href="/account"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 py-1"
              >
                <User className="w-4 h-4 text-[#1E5BFF]" />
                <span>My Account</span>
              </Link>
              <Link
                href="/track-order"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 py-1"
              >
                <Package className="w-4 h-4 text-[#2EC4B6]" />
                <span>Track Cash on Delivery Order</span>
              </Link>
              <Link
                href="/pages/toy-safety"
                onClick={() => setIsMobileMenuOpen(false)}
                className="flex items-center gap-2 py-1"
              >
                <ShieldCheck className="w-4 h-4 text-[#2EC4B6]" />
                <span>Toy Safety & Certifications</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
