"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { siteConfig } from "@/config/site";
import { useCartStore } from "@/lib/cart-store";
import { useWishlistStore } from "@/lib/wishlist-store";
import { useAuthStore } from "@/lib/auth-store";
import { formatPrice } from "@/lib/utils";
import { ThemeToggle } from "@/components/ui/theme-toggle";
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
  const { user, logout } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchFocused, setIsSearchFocused] = useState(false);
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
    <header className="sticky top-0 z-40 bg-white dark:bg-[#1B1C24] border-b border-[#E8E2DE] dark:border-[#2E303E] shadow-xs">
      {/* Main Header Row */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20 gap-4 sm:gap-6">
          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="lg:hidden p-2 text-slate-700 dark:text-slate-200 hover:text-[#DC012B] rounded-xl transition-colors cursor-pointer"
            aria-label="Open mobile menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Logo / Wordmark with Movable Animated Logo */}
          <Link href="/" className="flex items-center gap-3 shrink-0 group">
            <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-full overflow-hidden bg-white dark:bg-[#1B1C24] p-0.5 border-2 border-[#DC012B]/20 shadow-sm movable-logo shrink-0">
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
              <span className="font-heading text-xl sm:text-2xl font-black tracking-tight text-[#18191F] dark:text-white leading-none">
                KHELNA <span className="text-[#DC012B]">BAZAR</span>
              </span>
              <span className="text-[9px] font-bold tracking-widest text-[#DC012B] uppercase leading-none mt-1">
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
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 250)}
                className="w-full h-11 pl-5 pr-24 rounded-full border-2 border-[#DC012B] bg-[#FFF8F8] dark:bg-[#242531] text-sm text-[#18191F] dark:text-white placeholder:text-slate-400 focus:outline-none focus:bg-white dark:focus:bg-[#1B1C24] transition-colors"
              />

              {/* Instant Search Suggestions Dropdown */}
              {isSearchFocused && (
                <div className="absolute top-13 left-0 right-0 bg-white dark:bg-[#1B1C24] rounded-2xl border border-[#E8E2DE] dark:border-[#2E303E] shadow-xl p-3 z-50 text-xs animate-in fade-in slide-in-from-top-1">
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-100 dark:border-slate-800 text-[10px] font-extrabold uppercase tracking-wider text-slate-400">
                    <span>Popular Quick Searches</span>
                    <span className="text-[#DC012B] font-bold">100% Cash on Delivery</span>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pb-2.5">
                    {[
                      { label: "🔥 Flash Deals", href: "/deals" },
                      { label: "🧱 Building Blocks", href: "/c/building-blocks" },
                      { label: "🚀 STEM & Science", href: "/c/stem-science" },
                      { label: "🏎️ RC Vehicles", href: "/c/rc-vehicles" },
                      { label: "🧸 Montessori", href: "/c/baby-toddler" },
                      { label: "🎁 Gift Quiz", href: "/gift-finder" },
                    ].map((tag) => (
                      <Link
                        key={tag.href}
                        href={tag.href}
                        className="px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-[#DC012B] hover:text-white font-medium transition-colors"
                      >
                        {tag.label}
                      </Link>
                    ))}
                  </div>

                  <div className="space-y-1 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span className="text-[10px] font-bold text-slate-400 block px-1">Trending Toys</span>
                    {[
                      { name: "Titan Rex Roaring Jurassic Dinosaur", price: "৳2,310", slug: "titan-rex-dinosaur" },
                      { name: "Medieval Fortress Siege Dragon Citadel", price: "৳4,800", slug: "medieval-dragon-citadel" },
                      { name: "Magnetic Castle Architect 3D Tiles (102 Pcs)", price: "৳2,970", slug: "magnetic-castle-tiles" },
                      { name: "Solar Exploration Mars Coding Rover", price: "৳3,510", slug: "solar-mars-rover" },
                    ].map((toy) => (
                      <Link
                        key={toy.slug}
                        href={`/p/${toy.slug}`}
                        className="flex items-center justify-between p-2 rounded-xl hover:bg-rose-50 dark:hover:bg-[#242531] group transition-colors"
                      >
                        <div className="flex items-center gap-2">
                          <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#DC012B]" />
                          <span className="text-slate-700 dark:text-slate-200 group-hover:text-[#DC012B] font-medium truncate max-w-sm">
                            {toy.name}
                          </span>
                        </div>
                        <span className="font-bold text-[#DC012B] text-xs shrink-0">{toy.price}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              )}

              {/* Voice Search Button */}
              <button
                type="button"
                onClick={handleVoiceSearch}
                className={`absolute right-12 p-2 rounded-full text-slate-400 hover:text-[#DC012B] transition-colors cursor-pointer ${
                  isVoiceActive ? "text-[#DC012B] animate-pulse" : ""
                }`}
                title="Search by voice"
                aria-label="Voice search"
              >
                <Mic className="w-4 h-4" />
              </button>

              {/* Search Submit Button */}
              <button
                type="submit"
                className="absolute right-1.5 h-8 px-4 rounded-full bg-[#DC012B] hover:bg-[#B80023] text-white flex items-center justify-center transition-colors cursor-pointer shadow-xs"
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
              className="relative p-2.5 text-slate-700 dark:text-slate-200 hover:text-[#DC012B] rounded-full hover:bg-rose-50 dark:hover:bg-[#242531] transition-colors"
              title="My Wishlist"
              aria-label="Wishlist"
            >
              <Heart className="w-5 h-5" />
              {mounted && wishlistCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#DC012B] text-white text-[10px] font-bold flex items-center justify-center">
                  {wishlistCount}
                </span>
              )}
            </Link>

            {/* Theme Mode Toggle (System/Dark/Light) */}
            <ThemeToggle showDropdown />

            {/* User Account / Sign In / Create Account */}
            {mounted && !user ? (
              <div className="flex items-center gap-1 sm:gap-2">
                <Link
                  href="/login"
                  className="px-2.5 sm:px-3 py-1.5 rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-[#DC012B] hover:bg-rose-50 dark:hover:bg-[#242531] transition-colors"
                >
                  Sign In
                </Link>
                <Link
                  href="/register"
                  className="hidden sm:inline-flex items-center gap-1 px-3.5 py-1.5 rounded-full text-xs font-bold bg-[#DC012B] hover:bg-[#B80023] text-white shadow-xs transition-colors"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                  <span>Create Account</span>
                </Link>
              </div>
            ) : mounted && user ? (
              <Link
                href={user.role === "ADMIN" ? "/admin" : "/account"}
                className="flex items-center gap-2 p-1 sm:px-3 sm:py-1.5 text-slate-700 dark:text-slate-200 hover:text-[#DC012B] rounded-full bg-slate-100 dark:bg-slate-800 transition-colors"
                title={user.name}
                aria-label="Account"
              >
                <div className="w-6 h-6 rounded-full bg-[#DC012B] text-white flex items-center justify-center text-[10px] font-black">
                  {user.name?.[0] || "U"}
                </div>
                <span className="hidden xl:inline text-xs font-semibold max-w-[90px] truncate">
                  {user.name.split(" ")[0]}
                </span>
              </Link>
            ) : (
              <Link
                href="/login"
                className="px-2.5 py-1.5 rounded-full text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-[#DC012B]"
              >
                Sign In
              </Link>
            )}

            {/* Cart Trigger */}
            <button
              onClick={toggleCart}
              className="flex items-center gap-2 px-3 py-2 rounded-full bg-[#FFF0F2] dark:bg-[#3D000B] text-[#DC012B] hover:bg-[#DC012B] hover:text-white transition-all cursor-pointer shadow-xs active:scale-95 border border-[#DC012B]/20"
              aria-label="View Cart"
            >
              <div className="relative">
                <ShoppingBag className="w-5 h-5" />
                {mounted && (
                  <span className="absolute -top-2 -right-2 w-4 h-4 rounded-full bg-[#F59E0B] text-slate-900 text-[10px] font-extrabold flex items-center justify-center shadow-xs">
                    {getItemCount()}
                  </span>
                )}
              </div>
              <div className="hidden sm:flex flex-col text-left leading-none">
                <span className="text-[10px] uppercase font-bold opacity-80">Cash on Del.</span>
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
              className="w-full h-10 pl-4 pr-10 rounded-full border-2 border-[#DC012B] bg-[#FFF8F8] dark:bg-[#242531] text-xs text-[#18191F] dark:text-white placeholder:text-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              className="absolute right-3 text-[#DC012B]"
              aria-label="Search"
            >
              <Search className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>

      {/* Secondary Navigation Row (Desktop) */}
      <nav aria-label="Secondary Navigation" className="hidden lg:block border-t border-[#E8E2DE] dark:border-[#2E303E] bg-[#FAF8F6] dark:bg-[#1B1C24]/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-11 text-xs font-semibold">
            {/* Departments & Dropdowns */}
            <div className="flex items-center gap-6">
              {/* All Categories Mega Menu Link */}
              <Link
                href="/c/all"
                className="flex items-center gap-1.5 text-[#18191F] dark:text-white hover:text-[#DC012B] py-2"
              >
                <Layers className="w-4 h-4 text-[#DC012B]" />
                <span>All Categories</span>
              </Link>

              {/* Shop by Age Dropdown */}
              <div
                className="relative py-2"
                onMouseEnter={() => setIsAgeMenuOpen(true)}
                onMouseLeave={() => setIsAgeMenuOpen(false)}
              >
                <button className="flex items-center gap-1 text-[#18191F] dark:text-white hover:text-[#DC012B] cursor-pointer">
                  <span>Shop by Age</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </button>

                {isAgeMenuOpen && (
                  <div className="absolute top-full left-0 w-56 bg-white dark:bg-[#1B1C24] rounded-2xl shadow-xl border border-[#E8E2DE] dark:border-[#2E303E] py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                    {AGE_RANGES.map((age) => (
                      <Link
                        key={age.query}
                        href={`/c/all?age=${age.query}`}
                        className="flex items-center gap-2.5 px-4 py-2 hover:bg-[#FFF0F2] dark:hover:bg-[#242531] text-slate-700 dark:text-slate-200 hover:text-[#DC012B] transition-colors"
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
                className="flex items-center gap-1 text-[#DC012B] font-bold hover:underline"
              >
                <Flame className="w-3.5 h-3.5 fill-current text-[#DC012B]" />
                <span>Flash Deals</span>
              </Link>
              <Link
                href="/new-arrivals"
                className="flex items-center gap-1 text-[#F59E0B] font-bold hover:underline"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>New Arrivals</span>
              </Link>
              <Link
                href="/c/building-blocks"
                className="text-slate-700 dark:text-slate-300 hover:text-[#DC012B]"
              >
                Building Blocks
              </Link>
              <Link
                href="/c/stem-science"
                className="text-slate-700 dark:text-slate-300 hover:text-[#DC012B]"
              >
                STEM & Robotics
              </Link>
              <Link
                href="/c/rc-vehicles"
                className="text-slate-700 dark:text-slate-300 hover:text-[#DC012B]"
              >
                RC Vehicles
              </Link>
            </div>

            {/* Right Highlights */}
            <div className="flex items-center gap-4">
              <Link
                href="/gift-finder"
                className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#FFF0F2] text-[#DC012B] hover:bg-[#DC012B] hover:text-white transition-colors border border-[#DC012B]/20"
              >
                <Gift className="w-3.5 h-3.5" />
                <span>Gift Finder Quiz</span>
              </Link>
              <Link
                href="/pages/toy-safety"
                className="flex items-center gap-1 text-slate-600 dark:text-slate-300 hover:text-[#10B981]"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-[#10B981]" />
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
          <div className="fixed inset-y-0 left-0 w-4/5 max-w-sm bg-white dark:bg-[#1B1C24] shadow-2xl flex flex-col p-6 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E2DE] dark:border-[#2E303E]">
              <div className="flex items-center gap-2.5">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-white dark:bg-[#242531] p-0.5 border border-slate-200 dark:border-slate-700 movable-logo shrink-0">
                  <Image
                    src={siteConfig.logo.animatedGif || "/images/khelna-bazar-logo.gif"}
                    alt="Logo"
                    fill
                    unoptimized
                    className="object-contain"
                  />
                </div>
                <span className="font-heading font-black text-lg text-[#18191F] dark:text-white">
                  KHELNA <span className="text-[#DC012B]">BAZAR</span>
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
                className="block py-1 hover:text-[#DC012B]"
              >
                All Toys & Games
              </Link>
              <Link
                href="/deals"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-1 text-[#DC012B] font-bold"
              >
                🔥 Flash Deals
              </Link>
              <Link
                href="/new-arrivals"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-1 text-[#F59E0B] font-bold"
              >
                ✨ New Arrivals
              </Link>
              <Link
                href="/gift-finder"
                onClick={() => setIsMobileMenuOpen(false)}
                className="block py-1 text-[#DC012B]"
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
                    className="p-2 rounded-xl bg-[#FAF8F6] dark:bg-[#242531] text-xs font-medium flex items-center gap-1.5"
                  >
                    <span>{age.icon}</span>
                    <span>{age.label}</span>
                  </Link>
                ))}
              </div>

              <p className="text-xs uppercase tracking-wider text-slate-400 font-bold pt-4">Account</p>
              {!user ? (
                <div className="space-y-2 pt-1">
                  <Link
                    href="/login"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center w-full py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:border-[#DC012B] hover:text-[#DC012B] transition-colors"
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-center gap-1.5 w-full py-2.5 rounded-xl bg-[#DC012B] text-white text-xs font-bold hover:bg-[#B80023] shadow-xs transition-colors"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                    <span>Create Account &bull; 100 Pts</span>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2 pt-1">
                  <div className="p-3 rounded-2xl bg-[#FAF8F6] dark:bg-[#242531] border border-[#E8E2DE] dark:border-[#2E303E] flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#DC012B] text-white flex items-center justify-center font-bold text-xs">
                      {user.name?.[0] || "U"}
                    </div>
                    <div className="min-w-0 flex-1">
                      <span className="text-xs font-bold text-[#18191F] dark:text-white block truncate">{user.name}</span>
                      <span className="text-[10px] text-emerald-600 font-semibold">{user.loyaltyPoints} PlayPoints</span>
                    </div>
                  </div>
                  <Link
                    href={user.role === "ADMIN" ? "/admin" : "/account"}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center gap-2 py-1 text-slate-700 dark:text-slate-200 hover:text-[#DC012B]"
                  >
                    <User className="w-4 h-4 text-[#DC012B]" />
                    <span>{user.role === "ADMIN" ? "Admin Console" : "My Account"}</span>
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-2 py-1 text-xs text-rose-500 font-bold hover:underline cursor-pointer"
                  >
                    <span>Sign Out</span>
                  </button>
                </div>
              )}

              <p className="text-xs uppercase tracking-wider text-slate-400 font-bold pt-3">Help &amp; Safety</p>
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

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-slate-600 dark:text-slate-300">Appearance Mode</span>
                <ThemeToggle showDropdown />
              </div>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
