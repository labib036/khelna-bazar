"use client";

import { useState, useMemo, useEffect, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import type { ToyProduct } from "@/types/store";
import { ProductCard } from "@/components/store/product-card";
import { useMounted } from "@/lib/use-mounted";
import { Button } from "@/components/ui/button";
import { Drawer } from "@/components/ui/drawer";
import { EmptyState } from "@/components/ui/empty-state";
import { NoResultsIllustration } from "@/components/ui/illustrations";
import Link from "next/link";
import {
  Filter,
  SlidersHorizontal,
  X,
  Check,
  LayoutGrid,
  Grid3X3,
  ChevronRight,
} from "lucide-react";

interface ProductListingProps {
  initialProducts: ToyProduct[];
  title: string;
  description?: string;
  categorySlug?: string;
}

const AGE_FILTERS = [
  { label: "0 – 12 Months", value: "0-12m" },
  { label: "1 – 2 Years", value: "1-2y" },
  { label: "3 – 4 Years", value: "3-4y" },
  { label: "5 – 7 Years", value: "5-7y" },
  { label: "8 – 11 Years", value: "8-11y" },
  { label: "12+ Years", value: "12+" },
];

const PRICE_PRESETS = [
  { label: "All Prices", min: undefined, max: undefined },
  { label: "Under ৳1,000", min: 0, max: 1000 },
  { label: "৳1,000 – ৳2,000", min: 1000, max: 2000 },
  { label: "৳2,000 – ৳3,500", min: 2000, max: 3500 },
  { label: "Above ৳3,500", min: 3500, max: undefined },
];

function ProductListingContent({
  initialProducts,
  title,
  description,
}: ProductListingProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const mounted = useMounted();

  // Initialize filters from URL params
  const [selectedAge, setSelectedAge] = useState<string | null>(searchParams.get("age"));
  const [selectedPricePreset, setSelectedPricePreset] = useState<number>(() => {
    const minP = searchParams.get("minPrice");
    const maxP = searchParams.get("maxPrice");
    if (minP === "3500") return 4;
    if (minP === "2000" && maxP === "3500") return 3;
    if (minP === "1000" && maxP === "2000") return 2;
    if (maxP === "1000") return 1;
    return 0;
  });
  const [selectedBrand, setSelectedBrand] = useState<string | null>(searchParams.get("brand"));
  const [inStockOnly, setInStockOnly] = useState<boolean>(searchParams.get("inStock") === "1");
  const [sortBy, setSortBy] = useState<string>(searchParams.get("sort") || "bestselling");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isDenseGrid, setIsDenseGrid] = useState(false);

  // Determine base products from SSR props
  const baseProducts = useMemo(() => {
    return initialProducts;
  }, [initialProducts]);

  // Sync state changes to URL search params
  useEffect(() => {
    if (!mounted) return;
    const params = new URLSearchParams();
    if (selectedAge) params.set("age", selectedAge);

    const preset = PRICE_PRESETS[selectedPricePreset];
    if (preset.min !== undefined) params.set("minPrice", preset.min.toString());
    if (preset.max !== undefined) params.set("maxPrice", preset.max.toString());

    if (selectedBrand) params.set("brand", selectedBrand);
    if (inStockOnly) params.set("inStock", "1");
    if (sortBy !== "bestselling") params.set("sort", sortBy);

    const query = searchParams.get("q");
    if (query) params.set("q", query);

    const queryString = params.toString();
    const newUrl = queryString ? `${pathname}?${queryString}` : pathname;
    router.replace(newUrl, { scroll: false });
  }, [selectedAge, selectedPricePreset, selectedBrand, inStockOnly, sortBy, pathname, router, mounted, searchParams]);

  // Extract unique brands
  const availableBrands = useMemo(() => {
    const brandsSet = new Set<string>();
    baseProducts.forEach((p) => {
      if (p.brand) brandsSet.add(p.brand);
    });
    return Array.from(brandsSet);
  }, [baseProducts]);

  // Client-side filtering & sorting
  const filteredProducts = useMemo(() => {
    return baseProducts
      .filter((p) => {
        // Age filter
        if (selectedAge) {
          const minAge = p.minAgeMonths ?? 36;
          const maxAge = p.maxAgeMonths ?? 144;
          if (selectedAge === "0-12m" && minAge > 12) return false;
          if (selectedAge === "1-2y" && (minAge > 24 || maxAge < 12)) return false;
          if (selectedAge === "3-4y" && (minAge > 48 || maxAge < 36)) return false;
          if (selectedAge === "5-7y" && (minAge > 84 || maxAge < 60)) return false;
          if (selectedAge === "8-11y" && (minAge > 132 || maxAge < 96)) return false;
          if (selectedAge === "12+" && minAge < 144) return false;
        }

        // Price preset filter
        const preset = PRICE_PRESETS[selectedPricePreset];
        if (preset.min !== undefined && p.basePrice < preset.min) return false;
        if (preset.max !== undefined && p.basePrice > preset.max) return false;

        // Brand filter
        if (selectedBrand && p.brand !== selectedBrand) return false;

        // In stock
        if (inStockOnly && p.stock <= 0) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "price-asc") return a.basePrice - b.basePrice;
        if (sortBy === "price-desc") return b.basePrice - a.basePrice;
        if (sortBy === "rating") return b.ratingAvg - a.ratingAvg;
        return (b.soldCount || 0) - (a.soldCount || 0);
      });
  }, [baseProducts, selectedAge, selectedPricePreset, selectedBrand, inStockOnly, sortBy]);

  const clearAllFilters = () => {
    setSelectedAge(null);
    setSelectedPricePreset(0);
    setSelectedBrand(null);
    setInStockOnly(false);
    setSortBy("bestselling");
    router.replace(pathname, { scroll: false });
  };

  const hasActiveFilters =
    Boolean(selectedAge) || selectedPricePreset !== 0 || Boolean(selectedBrand) || inStockOnly || sortBy !== "bestselling";

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-xs text-[var(--text-muted)] mb-4">
        <Link href="/" className="hover:text-[var(--primary)] transition-colors">
          Home
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <Link href="/c/all" className="hover:text-[var(--primary)] transition-colors">
          Toys
        </Link>
        <ChevronRight className="w-3.5 h-3.5" />
        <span className="font-bold text-[var(--text-primary)] truncate max-w-xs">{title}</span>
      </nav>

      {/* Top Header & Result Counts */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[var(--border)]">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
            {title}
          </h1>
          {description && (
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 max-w-2xl">{description}</p>
          )}
          <span className="text-xs font-semibold text-[var(--text-muted)] mt-2 block">
            Showing {filteredProducts.length} toy{filteredProducts.length === 1 ? "" : "s"}
          </span>
        </div>

        {/* Sort Dropdown, Density Toggle & Mobile Filter Button */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] text-xs font-bold text-[var(--text-primary)] shadow-xs cursor-pointer"
          >
            <Filter className="w-4 h-4 text-primary" />
            <span>Filters ({hasActiveFilters ? "Active" : "0"})</span>
          </button>

          {/* Grid Density Toggle (Desktop) */}
          <div className="hidden sm:flex items-center border border-[var(--border)] rounded-xl p-0.5 bg-[var(--surface)]">
            <button
              type="button"
              onClick={() => setIsDenseGrid(false)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                !isDenseGrid ? "bg-[var(--surface-elevated)] text-primary shadow-xs" : "text-[var(--text-muted)]"
              }`}
              aria-label="Spacious 3-column grid"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsDenseGrid(true)}
              className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                isDenseGrid ? "bg-[var(--surface-elevated)] text-primary shadow-xs" : "text-[var(--text-muted)]"
              }`}
              aria-label="Dense 4-column grid"
            >
              <Grid3X3 className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-[var(--text-muted)] hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-10 px-3 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)] text-xs font-bold text-[var(--text-primary)] focus:outline-none focus:border-primary"
            >
              <option value="bestselling">Best Selling</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Top Customer Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <div className="flex items-center flex-wrap gap-2 py-4">
          <span className="text-xs text-[var(--text-muted)] font-semibold mr-1">Active:</span>
          {selectedAge && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-rose-500/10 text-primary text-xs font-bold border border-rose-500/20">
              Age: {selectedAge}
              <button type="button" onClick={() => setSelectedAge(null)} className="cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
          {selectedPricePreset !== 0 && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-500/10 text-amber-700 dark:text-amber-300 text-xs font-bold border border-amber-500/20">
              {PRICE_PRESETS[selectedPricePreset].label}
              <button type="button" onClick={() => setSelectedPricePreset(0)} className="cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
          {selectedBrand && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-bold border border-purple-500/20">
              Brand: {selectedBrand}
              <button type="button" onClick={() => setSelectedBrand(null)} className="cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
          {inStockOnly && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-xs font-bold border border-emerald-500/20">
              In Stock Only
              <button type="button" onClick={() => setInStockOnly(false)} className="cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
          <button
            type="button"
            onClick={clearAllFilters}
            className="text-xs text-[var(--danger)] hover:underline font-bold ml-2 cursor-pointer"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Main Grid & Sticky Filter Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-6">
        {/* Left Filter Sidebar (Desktop) */}
        <aside className="hidden lg:block space-y-6 self-start sticky top-24 bg-[var(--surface-container-low)] p-6 rounded-3xl border border-[var(--border)] shadow-xs">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
            <span className="font-heading font-black text-sm text-[var(--text-primary)] flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-primary" /> Filters
            </span>
            {hasActiveFilters && (
              <button
                type="button"
                onClick={clearAllFilters}
                className="text-xs text-[var(--danger)] hover:underline font-bold cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          {/* Age Filter */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] block">
              Recommended Age
            </span>
            <div className="space-y-1">
              {AGE_FILTERS.map((age) => (
                <button
                  key={age.value}
                  type="button"
                  onClick={() => setSelectedAge(selectedAge === age.value ? null : age.value)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    selectedAge === age.value
                      ? "bg-primary text-on-primary font-bold shadow-xs"
                      : "text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <span>{age.label}</span>
                  {selectedAge === age.value && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Presets */}
          <div className="space-y-2 pt-2 border-t border-[var(--border)]">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] block">
              Price (BDT ৳)
            </span>
            <div className="space-y-1">
              {PRICE_PRESETS.map((preset, idx) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setSelectedPricePreset(idx)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    selectedPricePreset === idx
                      ? "bg-[var(--secondary-container)] text-[var(--on-secondary-container)] font-bold shadow-xs"
                      : "text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)]"
                  }`}
                >
                  <span>{preset.label}</span>
                  {selectedPricePreset === idx && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Brands Filter */}
          {availableBrands.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-[var(--border)]">
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                Brand
              </span>
              <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                {availableBrands.map((b) => (
                  <button
                    key={b}
                    type="button"
                    onClick={() => setSelectedBrand(selectedBrand === b ? null : b)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      selectedBrand === b
                        ? "bg-[var(--accent)] text-white font-bold shadow-xs"
                        : "text-[var(--text-muted)] hover:bg-[var(--surface)] hover:text-[var(--text-primary)]"
                    }`}
                  >
                    <span>{b}</span>
                    {selectedBrand === b && <Check className="w-3.5 h-3.5" />}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock Toggle */}
          <div className="pt-2 border-t border-[var(--border)]">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[var(--text-primary)] select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </aside>

        {/* Product Grid Area */}
        <div className="lg:col-span-3">
          {filteredProducts.length === 0 ? (
            <EmptyState
              illustration={<NoResultsIllustration className="w-36 h-36" />}
              title="No Matching Toys Found"
              description="We couldn't find any toys matching your current filter criteria. Try clearing some filters or searching for different categories."
              action={
                <Button onClick={clearAllFilters} variant="primary" size="md">
                  Clear All Filters
                </Button>
              }
            />
          ) : (
            <div className={`grid grid-cols-2 ${isDenseGrid ? "sm:grid-cols-3 lg:grid-cols-4" : "sm:grid-cols-3"} gap-4`}>
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      <Drawer
        isOpen={isMobileFilterOpen}
        onClose={() => setIsMobileFilterOpen(false)}
        title="Filter Toys"
        position="bottom"
      >
        <div className="space-y-6 py-2">
          {/* Age */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Age Range
            </span>
            <div className="grid grid-cols-2 gap-2">
              {AGE_FILTERS.map((age) => (
                <button
                  key={age.value}
                  type="button"
                  onClick={() => setSelectedAge(selectedAge === age.value ? null : age.value)}
                  className={`p-2.5 rounded-2xl text-xs font-semibold border cursor-pointer ${
                    selectedAge === age.value
                      ? "bg-primary text-on-primary border-primary font-bold shadow-xs"
                      : "border-[var(--border)] text-[var(--text-muted)]"
                  }`}
                >
                  {age.label}
                </button>
              ))}
            </div>
          </div>

          {/* Price Presets */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)]">
              Price Presets
            </span>
            <div className="space-y-1.5">
              {PRICE_PRESETS.map((preset, idx) => (
                <button
                  key={preset.label}
                  type="button"
                  onClick={() => setSelectedPricePreset(idx)}
                  className={`w-full p-3 rounded-2xl text-xs font-semibold text-left border cursor-pointer ${
                    selectedPricePreset === idx
                      ? "bg-[var(--secondary-container)] text-[var(--on-secondary-container)] border-[var(--secondary-container)] font-bold shadow-xs"
                      : "border-[var(--border)] text-[var(--text-muted)]"
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>

          {/* Stock Toggle */}
          <div>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[var(--text-primary)]">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded text-primary focus:ring-primary cursor-pointer"
              />
              <span>In Stock Only</span>
            </label>
          </div>

          <div className="pt-4 border-t border-[var(--border)] flex gap-3">
            <Button
              type="button"
              onClick={() => {
                clearAllFilters();
                setIsMobileFilterOpen(false);
              }}
              variant="outline"
              className="flex-1 text-xs"
            >
              Reset
            </Button>
            <Button
              type="button"
              onClick={() => setIsMobileFilterOpen(false)}
              variant="primary"
              className="flex-1 text-xs"
            >
              Apply Filters
            </Button>
          </div>
        </div>
      </Drawer>
    </div>
  );
}

export function ProductListing(props: ProductListingProps) {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-12 text-center text-xs text-[var(--text-muted)] animate-pulse">
          Loading catalog...
        </div>
      }
    >
      <ProductListingContent {...props} />
    </Suspense>
  );
}
