"use client";

import { useState, useMemo, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ToyProduct } from "@/server/mock-data";
import { ProductCard } from "@/components/store/product-card";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Filter,
  SlidersHorizontal,
  X,
  Star,
  Check,
  ChevronDown,
  ShoppingBag,
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
  const searchParams = useSearchParams();

  const [selectedAge, setSelectedAge] = useState<string | null>(searchParams.get("age"));
  const [selectedPricePreset, setSelectedPricePreset] = useState<number>(0);
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [minRating, setMinRating] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<string>("bestselling");
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Extract unique brands from products
  const availableBrands = useMemo(() => {
    const brandsSet = new Set<string>();
    initialProducts.forEach((p) => {
      if (p.brand) brandsSet.add(p.brand);
    });
    return Array.from(brandsSet);
  }, [initialProducts]);

  // Client-side filtering & sorting
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((p) => {
      // Age filter
      if (selectedAge) {
        if (selectedAge === "0-12m" && p.minAgeMonths > 12) return false;
        if (selectedAge === "1-2y" && (p.minAgeMonths > 24 || p.maxAgeMonths < 12)) return false;
        if (selectedAge === "3-4y" && (p.minAgeMonths > 48 || p.maxAgeMonths < 36)) return false;
        if (selectedAge === "5-7y" && (p.minAgeMonths > 84 || p.maxAgeMonths < 60)) return false;
        if (selectedAge === "8-11y" && (p.minAgeMonths > 132 || p.maxAgeMonths < 96)) return false;
        if (selectedAge === "12+" && p.minAgeMonths < 144) return false;
      }

      // Price preset filter
      const preset = PRICE_PRESETS[selectedPricePreset];
      if (preset.min !== undefined && p.basePrice < preset.min) return false;
      if (preset.max !== undefined && p.basePrice > preset.max) return false;

      // Brand filter
      if (selectedBrand && p.brand !== selectedBrand) return false;

      // In stock
      if (inStockOnly && p.stock <= 0) return false;

      // Rating filter
      if (minRating && p.ratingAvg < minRating) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === "price-asc") return a.basePrice - b.basePrice;
      if (sortBy === "price-desc") return b.basePrice - a.basePrice;
      if (sortBy === "rating") return b.ratingAvg - a.ratingAvg;
      return b.soldCount - a.soldCount; // bestselling default
    });
  }, [initialProducts, selectedAge, selectedPricePreset, selectedBrand, inStockOnly, minRating, sortBy]);

  const clearAllFilters = () => {
    setSelectedAge(null);
    setSelectedPricePreset(0);
    setSelectedBrand(null);
    setInStockOnly(false);
    setMinRating(null);
    router.push(window.location.pathname);
  };

  const hasActiveFilters =
    Boolean(selectedAge) || selectedPricePreset !== 0 || Boolean(selectedBrand) || inStockOnly || Boolean(minRating);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Header & Result Counts */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E8E2DE] dark:border-[#263050]">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-[#18191F] dark:text-white">
            {title}
          </h1>
          {description && (
            <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">{description}</p>
          )}
          <span className="text-xs font-semibold text-slate-400 mt-2 block">
            Showing {filteredProducts.length} toy{filteredProducts.length === 1 ? "" : "s"}
          </span>
        </div>

        {/* Sort Dropdown & Mobile Filter Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsMobileFilterOpen(true)}
            className="lg:hidden flex items-center gap-2 px-4 py-2 rounded-xl bg-white dark:bg-[#161D33] border border-[#E8E2DE] dark:border-[#263050] text-xs font-bold text-[#18191F] dark:text-white shadow-xs cursor-pointer"
          >
            <Filter className="w-4 h-4 text-[#DC012B]" />
            <span>Filters ({hasActiveFilters ? "Active" : "0"})</span>
          </button>

          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-slate-400 hidden sm:inline">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="h-10 px-3 rounded-xl bg-white dark:bg-[#161D33] border border-[#E8E2DE] dark:border-[#263050] text-xs font-bold text-[#18191F] dark:text-white focus:outline-none focus:border-[#DC012B]"
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
          <span className="text-xs text-slate-400 font-semibold mr-1">Active:</span>
          {selectedAge && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FFF0F2] text-[#DC012B] text-xs font-bold">
              Age: {selectedAge}
              <button onClick={() => setSelectedAge(null)} className="cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
          {selectedPricePreset !== 0 && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#FFF8E6] text-[#B88700] text-xs font-bold">
              {PRICE_PRESETS[selectedPricePreset].label}
              <button onClick={() => setSelectedPricePreset(0)} className="cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
          {selectedBrand && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#F3EFFF] text-[#7B5CFA] text-xs font-bold">
              Brand: {selectedBrand}
              <button onClick={() => setSelectedBrand(null)} className="cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
          {inStockOnly && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#E6FAF8] text-[#2EC4B6] text-xs font-bold">
              In Stock Only
              <button onClick={() => setInStockOnly(false)} className="cursor-pointer">
                <X className="w-3.5 h-3.5" />
              </button>
            </span>
          )}
          <button
            onClick={clearAllFilters}
            className="text-xs text-[#FF6B6B] hover:underline font-bold ml-2 cursor-pointer"
          >
            Clear All
          </button>
        </div>
      )}

      {/* Main Grid & Sticky Filter Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 pt-6">
        {/* Left Filter Sidebar (Desktop) */}
        <aside className="hidden lg:block space-y-6 self-start sticky top-24 bg-white dark:bg-[#161D33] p-5 rounded-2xl border border-[#E8E2DE] dark:border-[#263050]">
          <div className="flex items-center justify-between pb-3 border-b border-[#E8E2DE] dark:border-[#263050]">
            <span className="font-heading font-black text-sm text-[#18191F] dark:text-white flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#DC012B]" /> Filters
            </span>
            {hasActiveFilters && (
              <button
                onClick={clearAllFilters}
                className="text-xs text-[#FF6B6B] hover:underline font-bold cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>

          {/* Age Filter */}
          <div className="space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Recommended Age
            </span>
            <div className="space-y-1">
              {AGE_FILTERS.map((age) => (
                <button
                  key={age.value}
                  onClick={() => setSelectedAge(selectedAge === age.value ? null : age.value)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    selectedAge === age.value
                      ? "bg-[#DC012B] text-white"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1E2742]"
                  }`}
                >
                  <span>{age.label}</span>
                  {selectedAge === age.value && <Check className="w-3.5 h-3.5" />}
                </button>
              ))}
            </div>
          </div>

          {/* Price Range Presets */}
          <div className="space-y-2 pt-2 border-t border-[#E8E2DE] dark:border-[#263050]">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Price (BDT ৳)
            </span>
            <div className="space-y-1">
              {PRICE_PRESETS.map((preset, idx) => (
                <button
                  key={preset.label}
                  onClick={() => setSelectedPricePreset(idx)}
                  className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                    selectedPricePreset === idx
                      ? "bg-[#FFC93C] text-[#18191F]"
                      : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1E2742]"
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
            <div className="space-y-2 pt-2 border-t border-[#E8E2DE] dark:border-[#263050]">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Brand
              </span>
              <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                {availableBrands.map((b) => (
                  <button
                    key={b}
                    onClick={() => setSelectedBrand(selectedBrand === b ? null : b)}
                    className={`w-full flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                      selectedBrand === b
                        ? "bg-[#7B5CFA] text-white"
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1E2742]"
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
          <div className="pt-2 border-t border-[#E8E2DE] dark:border-[#263050]">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#18191F] dark:text-white select-none">
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                className="w-4 h-4 rounded text-[#DC012B] focus:ring-[#DC012B] cursor-pointer"
              />
              <span>In Stock Only</span>
            </label>
          </div>
        </aside>

        {/* Product Grid Area (Col 2-4) */}
        <div className="lg:col-span-3">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-16 px-4 bg-white dark:bg-[#161D33] rounded-3xl border border-[#E8E2DE] dark:border-[#263050] space-y-4">
              <div className="w-16 h-16 rounded-full bg-[#FFF0F0] text-[#FF6B6B] flex items-center justify-center mx-auto">
                <ShoppingBag className="w-8 h-8" />
              </div>
              <h3 className="font-heading font-black text-xl text-[#18191F] dark:text-white">
                No matching toys found
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
                Try clearing some filters or exploring another age group or department.
              </p>
              <Button onClick={clearAllFilters} variant="primary" size="md">
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {filteredProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {isMobileFilterOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="fixed inset-0 bg-black/50" onClick={() => setIsMobileFilterOpen(false)} />
          <div className="fixed inset-y-0 right-0 w-4/5 max-w-sm bg-white dark:bg-[#161D33] p-6 shadow-2xl flex flex-col overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#E8E2DE] dark:border-[#263050]">
              <h3 className="font-heading font-black text-lg text-[#18191F] dark:text-white">
                Filter Toys
              </h3>
              <button onClick={() => setIsMobileFilterOpen(false)} className="p-2 text-slate-400">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-6 flex-1">
              {/* Age */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Age Range
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {AGE_FILTERS.map((age) => (
                    <button
                      key={age.value}
                      onClick={() => setSelectedAge(selectedAge === age.value ? null : age.value)}
                      className={`p-2 rounded-xl text-xs font-semibold border ${
                        selectedAge === age.value
                          ? "bg-[#DC012B] text-white border-[#DC012B]"
                          : "border-slate-200 text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      {age.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Price Presets */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                  Price Presets
                </span>
                <div className="space-y-1.5">
                  {PRICE_PRESETS.map((preset, idx) => (
                    <button
                      key={preset.label}
                      onClick={() => setSelectedPricePreset(idx)}
                      className={`w-full p-2.5 rounded-xl text-xs font-semibold text-left border ${
                        selectedPricePreset === idx
                          ? "bg-[#FFC93C] text-[#18191F] border-[#FFC93C]"
                          : "border-slate-200 text-slate-700 dark:text-slate-200"
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-[#E8E2DE] dark:border-[#263050] flex gap-3">
              <Button
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
                onClick={() => setIsMobileFilterOpen(false)}
                variant="primary"
                className="flex-1 text-xs"
              >
                Apply Filters
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export function ProductListing(props: ProductListingProps) {
  return (
    <Suspense
      fallback={
        <div className="max-w-7xl mx-auto px-4 py-12 text-center text-xs text-slate-400">
          Loading catalog...
        </div>
      }
    >
      <ProductListingContent {...props} />
    </Suspense>
  );
}
