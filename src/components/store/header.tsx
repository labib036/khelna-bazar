"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter, usePathname } from "next/navigation";
import { siteConfig } from "@/config/site";
import { useCartStore } from "@/lib/cart-store";
import { useWishlistStore } from "@/lib/wishlist-store";
import { useSession, signOut } from "next-auth/react";
import { formatPrice } from "@/lib/utils";
import { useMounted } from "@/lib/use-mounted";
import { useLockBodyScroll } from "@/lib/use-lock-body-scroll";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { LanguageToggle, useLanguage } from "@/lib/i18n";
import { CommandPalette } from "@/components/ui/command-palette";
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Phone,
  Package,
  Layers,
  ArrowRight,
  ShieldCheck,
  Truck,
  ExternalLink,
  Loader2,
} from "lucide-react";

const AGE_RANGES = [
  { label: "0-12m", query: "0-12m", icon: "🍼" },
  { label: "1-2y", query: "1-2y", icon: "🧸" },
  { label: "3-5y", query: "3-5y", icon: "🎨" },
  { label: "6-8y", query: "6-8y", icon: "🚀" },
  { label: "9+", query: "9+", icon: "🧩" },
];

const DEFAULT_CATEGORIES = [
  { id: "all", name: "All Toys", slug: "all" },
  { id: "new-arrivals", name: "New Arrivals", slug: "all?sort=newest" },
  { id: "montessori", name: "Montessori & Learning", slug: "baby-toddler" },
  { id: "stem", name: "STEM & Robotics", slug: "stem-robotics" },
  { id: "blocks", name: "Building Blocks", slug: "building-blocks" },
  { id: "rc", name: "RC Vehicles", slug: "rc-vehicles" },
];

interface SearchResultItem {
  id: string;
  name: string;
  slug: string;
  basePrice: number;
  comparePrice?: number | null;
  images: { url: string }[];
  categories: { name: string; slug: string }[];
}

export function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const mounted = useMounted();
  const { t, locale } = useLanguage();
  const { data: session } = useSession();
  const user = session?.user;
  const isStaffOrAdmin = user?.role === "ADMIN" || user?.role === "STAFF";

  const { toggleCart, getItemCount, getSubtotal } = useCartStore();
  const wishlistCount = useWishlistStore((state) => state.getCount());

  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<SearchResultItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchContainerRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Lock body scroll when mobile menu is open
  useLockBodyScroll(isMobileMenuOpen);

  // Debounced search query
  useEffect(() => {
    const q = searchQuery.trim();
    if (q.length < 2) {
      setSearchResults([]);
      setIsSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.products || []);
        }
      } catch {
        // network or search failure
      } finally {
        setIsSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Close menus on outside click or escape
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchFocused(false);
      }
      if (
        userMenuRef.current &&
        !userMenuRef.current.contains(e.target as Node)
      ) {
        setIsUserMenuOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsSearchFocused(false);
        setIsAgeMenuOpen(false);
        setIsUserMenuOpen(false);
        setIsMobileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (selectedIndex >= 0 && searchResults[selectedIndex]) {
      router.push(`/p/${searchResults[selectedIndex].slug}`);
      setIsSearchFocused(false);
      return;
    }
    if (searchQuery.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setIsSearchFocused(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isSearchFocused || searchResults.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSearchSubmit();
    }
  };

  const itemCount = mounted ? getItemCount() : 0;
  const cartSubtotal = mounted ? getSubtotal() : 0;
  const countWishlist = mounted ? wishlistCount : 0;

  return (
    <header
      className={`sticky-header z-40 bg-[var(--surface)]/95 backdrop-blur-md text-[var(--text-primary)] border-b border-[var(--border)] transition-all duration-300 ${
        isScrolled ? "shadow-md" : "shadow-xs"
      }`}
    >
      {/* ---------------------------------------------------------------------
          1. TOP UTILITY STRIP (Desktop only)
      --------------------------------------------------------------------- */}
      <div className="hidden md:block bg-[var(--surface-container-low)] border-b border-[var(--border)] text-xs text-[var(--text-muted)] py-1.5 px-4 sm:px-6 lg:px-8">
        <div className="max-w-[1360px] mx-auto flex items-center justify-between">
          <div className="flex items-center gap-6">
            <a
              href={`tel:${siteConfig.contact.hotline || ""}`}
              className="flex items-center gap-1.5 hover:text-[var(--primary)] transition-colors font-medium"
            >
              <Phone className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>Hotline: {siteConfig.contact.hotline || "Support"}</span>
            </a>
            <div className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              <Truck className="w-3.5 h-3.5" />
              <span>Cash on Delivery across all 64 districts</span>
            </div>
          </div>

          <div className="flex items-center gap-5">
            <Link
              href="/track-order"
              className="flex items-center gap-1.5 hover:text-[var(--primary)] transition-colors font-semibold"
            >
              <Package className="w-3.5 h-3.5 text-[var(--primary)]" />
              <span>{t("trackOrder")}</span>
            </Link>

            <Link
              href="/pages/toy-safety"
              className="hover:text-[var(--primary)] transition-colors font-medium"
            >
              {t("safetyGuarantee")}
            </Link>

            <div className="flex items-center gap-2 pl-3 border-l border-[var(--border)]">
              <LanguageToggle />
              <ThemeToggle showDropdown />
            </div>
          </div>
        </div>
      </div>

      {/* ---------------------------------------------------------------------
          2. MAIN HEADER ROW (Stitch Logo, Pill Search, 3D Push Bag, Wishlist)
      --------------------------------------------------------------------- */}
      <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div
          className={`flex items-center justify-between gap-3 sm:gap-6 transition-all duration-300 ${
            isScrolled ? "h-14 sm:h-16" : "h-16 sm:h-20"
          }`}
        >
          {/* Mobile Menu Hamburger */}
          <button
            onClick={() => setIsMobileMenuOpen(true)}
            className="md:hidden p-2.5 text-[var(--text-muted)] hover:text-[var(--primary)] rounded-full transition-colors cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center"
            aria-label="Open mobile navigation menu"
          >
            <Menu className="w-6 h-6" />
          </button>

          {/* Stitch Brand Logo Lockup */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 shrink-0 group">
            <div className="relative w-11 h-11 sm:w-13 sm:h-13 rounded-full overflow-hidden bg-white p-0.5 border-2 border-[var(--primary)]/20 shadow-xs shrink-0 group-hover:scale-105 transition-transform">
              <Image
                src={siteConfig.logo.path}
                alt="Khelna Bazar Official Logo"
                width={52}
                height={52}
                priority
                className="object-contain w-full h-full"
              />
            </div>
            <div className="flex flex-col">
              <span className="font-heading text-lg sm:text-2xl font-black tracking-tight text-[var(--primary)] leading-none">
                Khelna <span className="text-[var(--text-primary)]">Bazar</span>
              </span>
              <span className="text-[10px] font-extrabold tracking-tight text-[var(--secondary)] mt-0.5 hidden sm:block">
                khelnabazar.com.bd • Joy Toy Boutique
              </span>
            </div>
          </Link>

          {/* Desktop "All Categories" Pill Button */}
          <Link
            href="/c/all"
            className="hidden xl:flex items-center gap-1.5 bg-[var(--surface-container-low)] text-[var(--text-primary)] hover:bg-[var(--surface-container-high)] text-xs font-bold px-4 py-2.5 rounded-full transition-all border border-[var(--border)] shadow-2xs shrink-0"
          >
            <Layers className="w-4 h-4 text-[var(--primary)]" />
            <span>All Categories</span>
            <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
          </Link>

          {/* Desktop Prominent Pill Search with Live Autocomplete */}
          <div
            ref={searchContainerRef}
            className="hidden md:flex flex-1 max-w-xl relative flex-col gap-1"
          >
            <form onSubmit={handleSearchSubmit} className="relative w-full flex items-center">
              <Search className="absolute left-4 text-[var(--primary)] w-4 h-4 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={
                  locale === "bn"
                    ? "খেলনা, লেগো, মন্টেসরি বা বয়স দিয়ে খুঁজুন..."
                    : "Search magical toys, LEGO, plushies, Montessori..."
                }
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setSelectedIndex(-1);
                }}
                onFocus={() => setIsSearchFocused(true)}
                onKeyDown={handleKeyDown}
                className="w-full h-11 pl-11 pr-24 rounded-full border border-[var(--border)] bg-[var(--surface-container-low)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:bg-[var(--surface)] transition-all shadow-xs"
                aria-label="Search toy store"
                autoComplete="off"
              />

              <button
                type="button"
                onClick={() => setIsCommandPaletteOpen(true)}
                className="hidden lg:flex items-center gap-0.5 absolute right-12 px-2 py-0.5 rounded-md border border-[var(--border)] bg-[var(--surface)] text-[10px] font-bold text-[var(--text-muted)] hover:text-[var(--text-primary)] transition-all cursor-pointer shadow-2xs"
                title="Open Command Palette (Cmd/Ctrl + K)"
              >
                <span>⌘K</span>
              </button>

              <button
                type="submit"
                className="absolute right-1.5 h-8 px-3 rounded-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--on-primary)] flex items-center justify-center transition-colors cursor-pointer shadow-xs font-bold"
                aria-label="Search"
              >
                <Search className="w-3.5 h-3.5" />
              </button>
            </form>

            {/* Trending Search Keywords Chips */}
            <div className="flex items-center gap-1 px-3 text-[11px]">
              <span className="font-extrabold text-[var(--text-muted)] uppercase tracking-wider text-[10px]">
                Trending:
              </span>
              <Link href="/c/building-blocks" className="text-[var(--text-muted)] hover:text-[var(--primary)] font-medium transition-colors">
                Lego Technic,
              </Link>
              <Link href="/c/baby-toddler" className="text-[var(--text-muted)] hover:text-[var(--primary)] font-medium transition-colors">
                Montessori Wooden,
              </Link>
              <Link href="/c/all?sort=deals" className="text-[var(--text-muted)] hover:text-[var(--primary)] font-medium transition-colors">
                Latim &amp; Spinning Tops
              </Link>
            </div>

            {/* Live Autocomplete Dropdown */}
            {isSearchFocused && (
              <div
                role="listbox"
                className="absolute top-16 left-0 right-0 bg-[var(--surface)] text-[var(--text-primary)] rounded-3xl border border-[var(--border)] shadow-xl p-3 z-50 text-xs animate-in fade-in slide-in-from-top-1"
              >
                {searchResults.length > 0 ? (
                  <div className="space-y-1">
                    <div className="flex items-center justify-between pb-2 mb-1.5 border-b border-[var(--border)] text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)]">
                      <span>Matching Toys ({searchResults.length})</span>
                      <span className="text-[var(--primary)]">Use ↑↓ arrows to navigate</span>
                    </div>
                    {searchResults.map((item, idx) => {
                      const isHighlighted = idx === selectedIndex;
                      const imgUrl = item.images?.[0]?.url || "/images/khelna-bazar-logo.png";
                      const catName = item.categories?.[0]?.name || "Toys";
                      return (
                        <div
                          key={item.id}
                          role="option"
                          aria-selected={isHighlighted}
                          onMouseEnter={() => setSelectedIndex(idx)}
                          onClick={() => {
                            router.push(`/p/${item.slug}`);
                            setIsSearchFocused(false);
                          }}
                          className={`flex items-center justify-between p-2 rounded-2xl cursor-pointer transition-colors ${
                            isHighlighted
                              ? "bg-[var(--surface-container-low)] text-[var(--primary)]"
                              : "hover:bg-[var(--surface-container-low)]"
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-white shrink-0 border border-[var(--border)]">
                              <Image
                                src={imgUrl}
                                alt={item.name}
                                fill
                                className="object-cover"
                                sizes="36px"
                              />
                            </div>
                            <div className="min-w-0">
                              <span className="font-bold text-xs truncate block text-[var(--text-primary)]">
                                {item.name}
                              </span>
                              <span className="text-[10px] text-[var(--text-muted)] block truncate">
                                {catName}
                              </span>
                            </div>
                          </div>
                          <span className="font-black text-sm text-[var(--primary)] shrink-0 ml-3">
                            {formatPrice(item.basePrice)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div>
                    {isSearching ? (
                      <div className="p-4 text-center text-xs text-[var(--text-muted)] flex items-center justify-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin text-[var(--primary)]" />
                        <span>Searching catalog...</span>
                      </div>
                    ) : (
                      <div className="p-3 text-center text-xs text-[var(--text-muted)]">
                        Search toys by title, age group, or brand.
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Icons (Wishlist, Stitch 3D Push Cart, User) */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Mobile Theme Toggle */}
            <div className="md:hidden">
              <ThemeToggle />
            </div>

            {/* Wishlist Pill */}
            <Link
              href="/wishlist"
              className="relative p-2.5 rounded-full bg-[var(--surface-container-low)] hover:bg-[var(--surface-container-high)] text-[var(--text-primary)] hover:text-[var(--primary)] transition-transform hover:scale-105 min-w-[44px] min-h-[44px] flex items-center justify-center shadow-2xs"
              aria-label={`Wishlist: ${countWishlist} items`}
              title="My Wishlist"
            >
              <Heart className="w-5 h-5 text-[var(--primary)]" />
              {countWishlist > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-[var(--primary)] text-[var(--on-primary)] text-[10px] font-black flex items-center justify-center shadow-xs animate-bounce">
                  {countWishlist}
                </span>
              )}
            </Link>

            {/* STITCH SIGNATURE 3D PUSH SHOPPING BAG BUTTON */}
            <button
              onClick={toggleCart}
              type="button"
              className="flex items-center gap-2 bg-[var(--secondary-container)] text-[var(--on-secondary-fixed)] hover:filter hover:brightness-105 text-xs sm:text-sm font-bold px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-full shadow-[0_4px_0_#B45309] active:translate-y-[2px] active:shadow-[0_2px_0_#B45309] transition-all cursor-pointer min-h-[40px] sm:min-h-[44px] select-none"
              aria-label={`Open shopping cart with ${itemCount} items`}
            >
              <ShoppingBag className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              <span className="hidden sm:inline font-black tabular-nums">
                {cartSubtotal > 0 ? formatPrice(cartSubtotal) : "৳ 0"}
              </span>
              <span className="hidden sm:inline opacity-40">•</span>
              <span className="px-2 py-0.5 rounded-full bg-[var(--on-secondary-fixed)]/10 text-[11px] font-black">
                {itemCount} {itemCount === 1 ? "item" : "items"}
              </span>
            </button>

            {/* User Account Menu Avatar */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex items-center gap-1.5 p-1 rounded-full hover:bg-[var(--surface-container-low)] transition-colors min-w-[44px] min-h-[44px] cursor-pointer"
                aria-label="User Account Menu"
                aria-expanded={isUserMenuOpen}
              >
                <div className="w-8 h-8 rounded-full bg-[var(--surface-container-high)] border-2 border-[var(--primary)] flex items-center justify-center text-xs font-black text-[var(--primary)] shadow-xs">
                  {mounted && user?.name ? user.name[0].toUpperCase() : <User className="w-4 h-4" />}
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)] hidden sm:block" />
              </button>

              {isUserMenuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xl p-2.5 z-50 text-xs animate-in fade-in zoom-in-95">
                  {mounted && user ? (
                    <div className="space-y-1">
                      <div className="px-3 py-2 border-b border-[var(--border)]">
                        <span className="font-bold text-[var(--text-primary)] block truncate">
                          {user.name || "Customer"}
                        </span>
                        <span className="text-[10px] text-[var(--text-muted)] block truncate">
                          {user.email || user.phone}
                        </span>
                        <span className="inline-block mt-1 px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-[var(--primary)]/10 text-[var(--primary)]">
                          {user.role}
                        </span>
                      </div>

                      {isStaffOrAdmin && (
                        <Link
                          href="/admin"
                          onClick={() => setIsUserMenuOpen(false)}
                          className="flex items-center justify-between px-3 py-2 rounded-xl text-purple-600 dark:text-purple-400 font-bold hover:bg-purple-500/10"
                        >
                          <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" />
                            <span>Admin Console</span>
                          </div>
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      )}

                      <Link
                        href="/account"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-[var(--text-primary)] hover:bg-[var(--surface-container-low)] font-medium"
                      >
                        <User className="w-4 h-4" />
                        <span>My Account</span>
                      </Link>

                      <Link
                        href="/account/orders"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 rounded-xl text-[var(--text-primary)] hover:bg-[var(--surface-container-low)] font-medium"
                      >
                        <Package className="w-4 h-4" />
                        <span>Order History</span>
                      </Link>

                      <button
                        onClick={async () => {
                          setIsUserMenuOpen(false);
                          await signOut({ callbackUrl: "/login" });
                        }}
                        className="w-full text-left px-3 py-2 rounded-xl text-red-500 hover:bg-red-500/10 font-bold cursor-pointer"
                      >
                        Sign Out
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2 p-1">
                      <Link
                        href="/login"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="w-full flex items-center justify-center py-2.5 rounded-full bg-[var(--primary)] text-[var(--on-primary)] font-bold text-center shadow-xs"
                      >
                        Sign In
                      </Link>
                      <Link
                        href="/register"
                        onClick={() => setIsUserMenuOpen(false)}
                        className="w-full flex items-center justify-center py-2 rounded-full border border-[var(--border)] text-[var(--text-primary)] hover:bg-[var(--surface-container-low)] font-bold text-center"
                      >
                        Create Free Account
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Full-Width Search Input (Row 2 on mobile) */}
        <div className="md:hidden pb-3">
          <form onSubmit={handleSearchSubmit} className="relative w-full">
            <Search className="absolute left-3.5 top-3 text-[var(--primary)] w-4 h-4 pointer-events-none" />
            <input
              type="text"
              placeholder={locale === "bn" ? "খেলনা, বয়স বা ব্র্যান্ড খুঁজুন..." : "Search toys by title, age, Lego..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full h-10 pl-10 pr-11 rounded-full border border-[var(--border)] bg-[var(--surface-container-low)] text-xs text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:bg-[var(--surface)]"
              aria-label="Search toy store"
            />
            <button
              type="submit"
              className="absolute right-1 top-1 h-8 w-8 rounded-full bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-[var(--on-primary)] flex items-center justify-center transition-colors cursor-pointer shadow-xs"
              aria-label="Search"
            >
              <Search className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>

      {/* ---------------------------------------------------------------------
          3. STITCH CATEGORY & AGE QUICK-BAR (Desktop only)
      --------------------------------------------------------------------- */}
      <nav
        aria-label="Category Quick Navigation"
        className="hidden md:block border-t border-[var(--border)] bg-[var(--surface-container-low)]/80 text-xs font-bold"
      >
        <div className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-11">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {/* Home Link */}
            <Link
              href="/"
              className={`px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap ${
                pathname === "/"
                  ? "bg-[var(--primary)] text-[var(--on-primary)] font-black shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--surface)]"
              }`}
            >
              Home
            </Link>

            {/* Categories */}
            {DEFAULT_CATEGORIES.map((cat) => {
              const isActive = pathname === `/c/${cat.slug}` || (cat.slug === "all" && pathname === "/c/all");
              return (
                <Link
                  key={cat.id}
                  href={`/c/${cat.slug}`}
                  className={`px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-[var(--primary)] text-[var(--on-primary)] font-black shadow-sm"
                      : "text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--surface)]"
                  }`}
                >
                  {cat.name}
                </Link>
              );
            })}

            {/* Wonder Club Link */}
            <Link
              href="/account/rewards"
              className={`px-3.5 py-1.5 rounded-full transition-all whitespace-nowrap ${
                pathname.includes("rewards")
                  ? "bg-[var(--primary)] text-[var(--on-primary)] font-black shadow-sm"
                  : "text-[var(--text-muted)] hover:text-[var(--primary)] hover:bg-[var(--surface)]"
              }`}
            >
              Wonder Club
            </Link>
          </div>

          {/* Shop by Age Pills on Right */}
          <div className="flex items-center gap-2 shrink-0 pl-4 border-l border-[var(--border)]">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--secondary)] mr-0.5">
              Age:
            </span>
            <div className="flex items-center gap-1">
              {AGE_RANGES.map((age) => (
                <Link
                  key={age.query}
                  href={`/c/all?age=${age.query}`}
                  className="px-2.5 py-1 rounded-full bg-[var(--surface)] text-[var(--text-primary)] hover:bg-[var(--secondary-container)] hover:text-[var(--on-secondary-fixed)] text-[11px] font-bold transition-all shadow-2xs border border-[var(--border)] flex items-center gap-1"
                >
                  <span>{age.icon}</span>
                  <span>{age.label}</span>
                </Link>
              ))}
            </div>

            {/* Flash Deals Shortcut */}
            <Link
              href="/deals"
              className="flex items-center gap-1 px-3 py-1 rounded-full bg-rose-500/10 text-[var(--primary)] hover:bg-[var(--primary)] hover:text-white font-black text-xs transition-colors ml-2"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Flash Deals</span>
            </Link>
          </div>
        </div>
      </nav>

      {/* ---------------------------------------------------------------------
          4. MOBILE DRAWER NAVIGATION
      --------------------------------------------------------------------- */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden" role="dialog" aria-modal="true">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <div className="relative w-80 max-w-[85vw] h-full bg-[var(--surface)] text-[var(--text-primary)] p-5 flex flex-col justify-between overflow-y-auto z-10 shadow-2xl">
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                <Link href="/" onClick={() => setIsMobileMenuOpen(false)} className="flex items-center gap-2.5">
                  <div className="relative w-8 h-8 rounded-full overflow-hidden bg-white p-0.5 border border-[var(--border)]">
                    <Image src={siteConfig.logo.path} alt="Khelna Bazar" width={32} height={32} className="object-contain" />
                  </div>
                  <span className="font-heading font-black text-base">
                    Khelna <span className="text-[var(--primary)]">Bazar</span>
                  </span>
                </Link>
                <button
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="p-1.5 text-[var(--text-muted)] hover:text-[var(--text-primary)] rounded-full min-w-[44px] min-h-[44px] flex items-center justify-center"
                  aria-label="Close navigation menu"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Categories Navigation */}
              <div className="space-y-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block">
                  Top Categories
                </span>
                <Link
                  href="/c/all"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center justify-between py-2 text-sm font-bold text-[var(--primary)]"
                >
                  <span>All Toys &amp; Games</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                {DEFAULT_CATEGORIES.map((cat) => (
                  <Link
                    key={cat.id}
                    href={`/c/${cat.slug}`}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex items-center justify-between py-2 text-xs font-semibold text-[var(--text-primary)] hover:text-[var(--primary)]"
                  >
                    <span>{cat.name}</span>
                  </Link>
                ))}
              </div>

              {/* Shop by Age */}
              <div className="space-y-2 pt-2 border-t border-[var(--border)]">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[var(--text-muted)] block">
                  Shop by Age
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {AGE_RANGES.map((age) => (
                    <Link
                      key={age.query}
                      href={`/c/all?age=${age.query}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="p-2 rounded-2xl bg-[var(--surface-container-low)] border border-[var(--border)] text-xs font-bold flex items-center gap-1.5"
                    >
                      <span>{age.icon}</span>
                      <span>{age.label}</span>
                    </Link>
                  ))}
                </div>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="pt-4 border-t border-[var(--border)] space-y-2.5">
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span>Language / ভাষা</span>
                <LanguageToggle />
              </div>
              <div className="flex items-center justify-between text-xs text-[var(--text-muted)]">
                <span>Theme Mode</span>
                <ThemeToggle showDropdown />
              </div>
              {siteConfig.contact.hotline && (
                <a
                  href={`tel:${siteConfig.contact.hotline}`}
                  className="flex items-center gap-2 text-xs font-bold text-[var(--primary)]"
                >
                  <Phone className="w-4 h-4" />
                  <span>Call Hotline: {siteConfig.contact.hotline}</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </header>
  );
}
