"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ToyProduct } from "@/types/store";
import { formatPrice, calculateDiscountPercentage } from "@/lib/utils";
import { useCartStore } from "@/lib/cart-store";
import { useWishlistStore } from "@/lib/wishlist-store";
import { useCompareStore } from "@/lib/compare-store";
import { Button } from "@/components/ui/button";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { ProductCard } from "@/components/store/product-card";
import { Dialog } from "@/components/ui/dialog";
import { SafetyPanel } from "@/components/store/safety-panel";
import { RadarSkillChart } from "@/components/store/radar-skill-chart";
import {
  Star,
  ShieldCheck,
  Heart,
  Scale,
  Gift,
  AlertTriangle,
  Share2,
  ShoppingBag,
  Maximize2,
  MapPin,
  Sparkles,
  Truck,
  RotateCw,
  Flame,
  Award,
  ChevronRight,
  Layers,
  Cpu,
} from "lucide-react";
import { toast } from "sonner";

interface ProductDetailViewProps {
  product: ToyProduct;
  relatedProducts: ToyProduct[];
}

export function ProductDetailView({ product, relatedProducts }: ProductDetailViewProps) {
  const router = useRouter();

  const { addItem, openCart, toggleGiftWrap: storeToggleGiftWrap } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();
  const { addProduct: addToCompare, isInCompare } = useCompareStore();

  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [selectedVariantId, setSelectedVariantId] = useState(
    product.variants?.[0]?.id || "var-default"
  );
  const [quantity, setQuantity] = useState(1);
  const [giftWrap, setGiftWrap] = useState(false);
  const [giftMessage, setGiftMessage] = useState("");
  const [activeTab, setActiveTab] = useState<"features" | "box" | "radar" | "specs" | "reviews">("features");
  const [selectedDistrict, setSelectedDistrict] = useState("Dhaka");
  const [isRotating, setIsRotating] = useState(false);

  const currentVariant =
    product.variants?.find((v) => v.id === selectedVariantId) ||
    product.variants?.[0] || {
      id: "var-default",
      sku: "SKU-DEFAULT",
      title: "Standard Edition",
      price: product.basePrice,
      comparePrice: product.comparePrice,
      stock: product.stock,
    };

  const isOutOfStock = (currentVariant.stock !== undefined ? currentVariant.stock : product.stock) <= 0;
  const availableStock = currentVariant.stock !== undefined ? currentVariant.stock : product.stock;
  const discountPercent = calculateDiscountPercentage(currentVariant.price, currentVariant.comparePrice);
  const inWishlist = isInWishlist(product.id);
  const inCompare = isInCompare(product.id);

  const handleAddToCart = (openDrawer = true) => {
    if (isOutOfStock) return;

    const cartItemId = `${product.id}-${currentVariant.id}`;
    addItem(
      {
        id: cartItemId,
        productId: product.id,
        variantId: currentVariant.id,
        name: product.name,
        title: currentVariant.title,
        price: currentVariant.price,
        comparePrice: currentVariant.comparePrice,
        image: product.images?.[activeImageIndex] || product.images?.[0] || "",
        sku: currentVariant.sku,
        maxStock: availableStock,
      },
      quantity
    );

    if (giftWrap) {
      storeToggleGiftWrap(cartItemId);
    }

    if (openDrawer) {
      toast.success(`Added ${product.name} to your basket!`);
      openCart();
    }
  };

  const handleBuyNow = () => {
    if (isOutOfStock) return;
    handleAddToCart(false);
    router.push("/checkout");
  };

  const handleToggleWishlist = () => {
    const added = toggleWishlist({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: currentVariant.price,
      comparePrice: currentVariant.comparePrice,
      image: product.images?.[0],
      ratingAvg: product.ratingAvg,
      ratingCount: product.ratingCount,
    });
    if (added) toast.success("Added to your wishlist!");
    else toast.info("Removed from your wishlist.");
  };

  const handleToggleCompare = () => {
    const res = addToCompare({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: currentVariant.price,
      comparePrice: currentVariant.comparePrice,
      image: product.images?.[0],
      ratingAvg: product.ratingAvg,
      ratingCount: product.ratingCount,
      minAgeMonths: product.minAgeMonths,
      maxAgeMonths: product.maxAgeMonths,
      material: product.material,
      batteryInfo: product.batteryInfo,
      chokingHazard: product.chokingHazard,
      brandName: product.brand,
      categoryName: product.category,
    });
    if (res.success) toast.success(res.message);
    else toast.warning(res.message);
  };

  const handleShare = () => {
    if (typeof window !== "undefined" && navigator.share) {
      navigator.share({
        title: product.name,
        text: `Check out ${product.name} on Khelna Bazar!`,
        url: window.location.href,
      }).catch(() => {});
    } else if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("Product link copied to clipboard!");
    }
  };

  const handleSpin360 = () => {
    setIsRotating(true);
    let step = 0;
    const interval = setInterval(() => {
      step++;
      if (product.images && product.images.length > 1) {
        setActiveImageIndex((prev) => (prev + 1) % product.images.length);
      }
      if (step >= 8) {
        clearInterval(interval);
        setIsRotating(false);
      }
    }, 180);
  };

  const ageYears = `${Math.floor(product.minAgeMonths / 12)}–${Math.floor(product.maxAgeMonths / 12)}y`;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-10 pb-28 sm:pb-12">
      {/* Top Breadcrumb & Status Ribbon */}
      <section aria-label="Breadcrumb and SKU" className="flex flex-wrap items-center justify-between gap-3 py-2 border-b border-[var(--border)] text-xs text-[var(--text-muted)]">
        <nav className="flex items-center gap-1.5">
          <Link href="/" className="hover:text-[var(--primary)] transition-colors">
            Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link href={`/c/${product.categorySlug}`} className="hover:text-[var(--primary)] transition-colors">
            {product.category}
          </Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="font-bold text-[var(--text-primary)] truncate max-w-xs">{product.name}</span>
        </nav>
        <div className="flex items-center gap-3">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[var(--surface-container-high)] font-bold text-[11px] text-[var(--secondary)]">
            <ShieldCheck className="w-3.5 h-3.5 text-[var(--primary)]" /> Khelna Originals Verified
          </span>
          <span className="font-mono text-[11px] text-[var(--text-muted)]">SKU: {currentVariant.sku}</span>
        </div>
      </section>

      {/* Main Product Showcase Grid (Desktop ~55% / 45%) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
        {/* LEFT COLUMN: Media Gallery (~55%) */}
        <div className="lg:col-span-7 flex flex-col gap-4">
          {/* Main Hero Image Frame */}
          <div className="relative w-full aspect-square sm:aspect-[4/3] rounded-4xl bg-[var(--surface)] overflow-hidden border border-[var(--border)] shadow-md group">
            <Image
              src={product.images?.[activeImageIndex] || product.images?.[0] || "/images/logo-placeholder.svg"}
              alt={product.name}
              fill
              priority
              className={`object-contain p-6 sm:p-10 transition-transform duration-500 ease-out group-hover:scale-105 ${
                isRotating ? "animate-spin" : ""
              } ${isOutOfStock ? "grayscale opacity-75" : ""}`}
              sizes="(max-width: 1024px) 100vw, 700px"
            />

            {/* Overlaid Floater Badges */}
            <div className="absolute top-4 left-4 flex flex-col gap-2 z-10 pointer-events-none">
              {product.isFeatured && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--primary)] text-[var(--on-primary)] text-xs font-black shadow-xs uppercase tracking-wider">
                  <Flame className="w-3.5 h-3.5 text-[var(--secondary-container)]" /> Trending #1 Pick
                </span>
              )}
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[var(--secondary-container)] text-[var(--on-secondary-container)] text-xs font-black shadow-xs uppercase tracking-wider">
                <Award className="w-3.5 h-3.5 text-[var(--primary)]" /> ASTM &amp; CE Certified Safe
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--accent)] text-white text-xs font-black shadow-xs uppercase tracking-wider">
                <Sparkles className="w-3.5 h-3.5" /> Age {ageYears}
              </span>
            </div>

            {/* Floating Quick Interactions */}
            <div className="absolute bottom-4 right-4 flex items-center gap-2 z-10">
              <button
                type="button"
                onClick={handleSpin360}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[var(--surface)]/90 backdrop-blur-md text-[var(--text-primary)] hover:bg-[var(--primary)] hover:text-[var(--on-primary)] text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer border border-[var(--border)]"
                title="Interactive 360 Spin View"
              >
                <RotateCw className={`w-3.5 h-3.5 ${isRotating ? "animate-spin" : ""}`} />
                <span>360° Spin</span>
              </button>
              <button
                type="button"
                onClick={() => setLightboxOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-[var(--surface)]/90 backdrop-blur-md text-[var(--text-primary)] hover:bg-[var(--primary)] hover:text-[var(--on-primary)] text-xs font-bold transition-all shadow-md active:scale-95 cursor-pointer border border-[var(--border)]"
                title="Open fullscreen view"
              >
                <Maximize2 className="w-3.5 h-3.5" />
                <span>Zoom</span>
              </button>
            </div>
          </div>

          {/* Thumbnail Strip (5 interactive views) */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-2 sm:gap-3">
              {product.images.slice(0, 5).map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImageIndex(idx)}
                  className={`relative aspect-square rounded-2xl bg-[var(--surface)] p-1.5 shadow-xs overflow-hidden transition-all border-2 cursor-pointer ${
                    activeImageIndex === idx
                      ? "border-[var(--primary)] bg-[var(--surface-container-high)] shadow-sm scale-102"
                      : "border-[var(--border)] hover:border-[var(--primary)]/60"
                  }`}
                  aria-label={`View angle ${idx + 1}`}
                >
                  <Image src={img} alt={`Thumbnail ${idx + 1}`} fill className="object-contain" sizes="80px" />
                  <span className="absolute bottom-1 right-1 text-[9px] bg-[var(--surface)]/90 text-[var(--text-primary)] px-1 rounded font-bold">
                    #{idx + 1}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Quick Parent Trust Guarantee Snippets below media */}
          <div className="grid grid-cols-3 gap-2 sm:gap-3 p-4 rounded-3xl bg-[var(--surface-container-low)] border border-[var(--border)] shadow-xs">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shrink-0">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--text-primary)] leading-tight">100% Recyclable</p>
                <p className="text-[10px] text-[var(--text-muted)]">Food-grade ABS resin</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[var(--secondary-container)]/20 text-[var(--secondary)] flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--text-primary)] leading-tight">Drop-Tested 1.8m</p>
                <p className="text-[10px] text-[var(--text-muted)]">Toddler-proof build</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-[var(--text-primary)] leading-tight">Screen-Free Play</p>
                <p className="text-[10px] text-[var(--text-muted)]">Active floor discovery</p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Buy Box & Options (~45%) */}
        <div className="lg:col-span-5 flex flex-col gap-5 bg-[var(--surface-container-low)] p-6 sm:p-8 rounded-4xl border border-[var(--border)] shadow-xs">
          {/* Maker & Dispatch Lockup */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-[var(--surface)] text-[var(--primary)] text-[11px] font-black uppercase tracking-wider border border-[var(--border)]">
                {product.brand || "Khelna Originals"}
              </span>
              <span className="text-[11px] font-bold text-[var(--secondary)]">Toy Boutique</span>
            </div>
            <span className="flex items-center gap-1.5 text-xs text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-3 py-1 rounded-full font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Dispatch in 24h
            </span>
          </div>

          {/* Product Title */}
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-black text-[var(--text-primary)] tracking-tight leading-tight">
              {product.name}
            </h1>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 font-medium">
              Certified safe, sensory-rich educational play with nationwide Cash on Delivery.
            </p>
          </div>

          {/* Rating & Review Strip */}
          <div className="flex items-center gap-3 pb-2 border-b border-[var(--border)]">
            <div className="flex items-center gap-1 bg-[var(--secondary-container)]/20 px-3 py-1 rounded-full">
              <div className="flex text-amber-500">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`w-3.5 h-3.5 ${
                      i < Math.round(product.ratingAvg || 5) ? "fill-current" : "opacity-30"
                    }`}
                  />
                ))}
              </div>
              <span className="text-xs font-black text-[var(--on-secondary-container)] ml-1">
                {(product.ratingAvg || 4.9).toFixed(1)}
              </span>
            </div>
            <a href="#reviews-section" className="text-xs font-bold text-[var(--primary)] hover:underline">
              ({product.ratingCount || 128} verified parent reviews)
            </a>
          </div>

          {/* Price & Savings Ledger */}
          <div className="p-4 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-1">
            <div className="flex items-baseline gap-3">
              <span className="text-3xl sm:text-4xl font-black text-[var(--primary)]">
                {formatPrice(currentVariant.price)}
              </span>
              {currentVariant.comparePrice && currentVariant.comparePrice > currentVariant.price && (
                <>
                  <span className="text-sm text-[var(--text-muted)] line-through">
                    {formatPrice(currentVariant.comparePrice)}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full bg-[var(--secondary-container)] text-[var(--on-secondary-container)] text-xs font-black">
                    SAVE {formatPrice(currentVariant.comparePrice - currentVariant.price)} ({discountPercent}%)
                  </span>
                </>
              )}
            </div>
            <p className="text-[11px] text-[var(--text-muted)]">
              All taxes included &bull; 100% Cash on Delivery &bull; Doorstep inspection allowed
            </p>
          </div>

          {/* Variant Selector */}
          {product.variants && product.variants.length > 1 && (
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider text-[var(--text-muted)] block">
                Select Edition:
              </label>
              <div className="flex flex-wrap gap-2">
                {product.variants.map((v) => (
                  <button
                    key={v.id}
                    type="button"
                    onClick={() => setSelectedVariantId(v.id)}
                    className={`px-4 py-2 rounded-full text-xs font-bold border transition-all cursor-pointer ${
                      selectedVariantId === v.id
                        ? "bg-[var(--primary)] text-[var(--on-primary)] border-[var(--primary)] shadow-xs"
                        : "bg-[var(--surface)] border-[var(--border)] text-[var(--text-primary)] hover:border-[var(--primary)]"
                    }`}
                  >
                    <span>{v.title}</span>
                    <span className="ml-1 opacity-80">({formatPrice(v.price)})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Quantity Stepper & Stock Notice */}
          <div className="flex items-center justify-between gap-4 pt-1">
            <div className="flex items-center gap-3">
              <span className="text-xs font-bold uppercase text-[var(--text-muted)]">Qty:</span>
              <QuantityStepper
                value={quantity}
                max={availableStock}
                onChange={(q) => setQuantity(q)}
                disabled={isOutOfStock}
                size="md"
              />
            </div>
            {isOutOfStock ? (
              <span className="text-xs text-[var(--danger)] font-bold flex items-center gap-1">
                <AlertTriangle className="w-3.5 h-3.5" /> Out of Stock
              </span>
            ) : (
              <span className="text-xs text-emerald-700 dark:text-emerald-400 font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                In Stock ({availableStock} units in Dhaka Hub)
              </span>
            )}
          </div>

          {/* Gift Wrap Add-on */}
          <div className="p-3.5 rounded-3xl border border-dashed border-[var(--secondary-container)] bg-[var(--secondary-container)]/10 space-y-2">
            <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[var(--text-primary)]">
              <input
                type="checkbox"
                checked={giftWrap}
                onChange={(e) => setGiftWrap(e.target.checked)}
                className="w-4 h-4 rounded text-[var(--primary)] focus:ring-[var(--primary)] cursor-pointer"
              />
              <Gift className="w-4 h-4 text-[var(--secondary)]" />
              <span>Add Premium Gift Wrapping &amp; Birthday Ribbon (+৳50)</span>
            </label>
            {giftWrap && (
              <input
                type="text"
                placeholder="Write custom gift card message..."
                value={giftMessage}
                onChange={(e) => setGiftMessage(e.target.value)}
                className="w-full text-xs h-9 px-3 rounded-full border border-[var(--border)] bg-[var(--surface)] text-[var(--text-primary)] placeholder:text-[var(--text-muted)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              />
            )}
          </div>

          {/* Primary 3D Action Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <Button
              type="button"
              onClick={() => handleAddToCart(true)}
              disabled={isOutOfStock}
              variant="pill-primary"
              size="lg"
              className="font-black text-sm h-12 shadow-[0_4px_0_#93000E] active:translate-y-[2px] active:shadow-[0_2px_0_#93000E]"
            >
              <ShoppingBag className="w-4 h-4 mr-2" />
              <span>{isOutOfStock ? "Out of Stock" : "Add to Bag"}</span>
            </Button>
            <Button
              type="button"
              onClick={handleBuyNow}
              disabled={isOutOfStock}
              variant="pill-amber"
              size="lg"
              className="font-black text-sm h-12 shadow-[0_4px_0_#B45309] active:translate-y-[2px] active:shadow-[0_2px_0_#B45309]"
            >
              <span>Buy Now (COD)</span>
            </Button>
          </div>

          {/* Wishlist, Compare & Share Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-[var(--border)] text-xs text-[var(--text-muted)]">
            <button
              type="button"
              onClick={handleToggleWishlist}
              className="flex items-center gap-1.5 hover:text-[var(--primary)] font-bold transition-colors cursor-pointer"
            >
              <Heart className={`w-4 h-4 ${inWishlist ? "fill-[var(--primary)] text-[var(--primary)]" : ""}`} />
              <span>{inWishlist ? "In Wishlist" : "Wishlist"}</span>
            </button>
            <button
              type="button"
              onClick={handleToggleCompare}
              className="flex items-center gap-1.5 hover:text-[var(--accent)] font-bold transition-colors cursor-pointer"
            >
              <Scale className="w-4 h-4 text-[var(--accent)]" />
              <span>{inCompare ? "Comparing" : "Compare"}</span>
            </button>
            <button
              type="button"
              onClick={handleShare}
              className="flex items-center gap-1.5 hover:text-[var(--primary)] font-bold transition-colors cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Share</span>
            </button>
          </div>

          {/* Bangladesh Delivery Calculator */}
          <div className="p-4 rounded-3xl bg-[var(--surface)] border border-[var(--border)] space-y-2 text-xs">
            <div className="flex items-center justify-between font-bold text-[var(--text-primary)]">
              <span className="flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-[var(--primary)]" />
                <span>Bangladesh Delivery Rates &amp; Speed</span>
              </span>
              <span className="text-[11px] text-[var(--secondary)] font-bold">Doorstep COD</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <MapPin className="w-3.5 h-3.5 absolute left-3 top-2.5 text-[var(--text-muted)]" />
                <select
                  value={selectedDistrict}
                  onChange={(e) => setSelectedDistrict(e.target.value)}
                  className="w-full h-8 pl-8 pr-3 rounded-full bg-[var(--surface-container-low)] border border-[var(--border)] text-xs font-bold text-[var(--text-primary)] focus:outline-none"
                >
                  <option value="Dhaka">Dhaka Metro (Dhanmondi, Gulshan, Uttara, Mirpur)</option>
                  <option value="Chittagong">Chittagong Metro</option>
                  <option value="Sylhet">Sylhet Metro</option>
                  <option value="Rajshahi">Rajshahi Division</option>
                  <option value="Khulna">Khulna Division</option>
                  <option value="Barisal">Barisal Division</option>
                  <option value="Rangpur">Rangpur Division</option>
                  <option value="Mymensingh">Mymensingh Division</option>
                </select>
              </div>
            </div>
            <div className="pt-1 space-y-1 text-[11px] text-[var(--text-muted)]">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[var(--text-primary)] font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  {selectedDistrict === "Dhaka" ? "Magic Express (Dhaka Metro):" : "Nationwide 64 Districts:"}
                </span>
                <span className="font-bold text-emerald-700 dark:text-emerald-400">
                  {selectedDistrict === "Dhaka" ? "Today by 6:30 PM (Free over ৳1,500)" : "2–3 Days (৳90 via Courier)"}
                </span>
              </div>
              <p className="text-[10px] text-[var(--text-muted)]">
                Doorstep parcel unboxing permitted before payment. 7-day replacement guarantee.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* DEDICATED SAFETY & CHOKING HAZARD PANEL */}
      <SafetyPanel
        ageRange={ageYears}
        chokingHazard={product.chokingHazard ?? true}
      />

      {/* MODULAR TABS SECTION */}
      <section className="pt-6">
        {/* Tab Buttons */}
        <div className="flex items-center gap-2 overflow-x-auto pb-3 border-b border-[var(--border)]" role="tablist">
          <button
            type="button"
            onClick={() => setActiveTab("features")}
            className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-black transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "features"
                ? "bg-[var(--primary)] text-[var(--on-primary)] shadow-xs"
                : "bg-[var(--surface-container-low)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            Toy Wonders &amp; Features
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("box")}
            className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-black transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "box"
                ? "bg-[var(--primary)] text-[var(--on-primary)] shadow-xs"
                : "bg-[var(--surface-container-low)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            What&apos;s in the Wonder Box
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("radar")}
            className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-black transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "radar"
                ? "bg-[var(--primary)] text-[var(--on-primary)] shadow-xs"
                : "bg-[var(--surface-container-low)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            Developmental Radar &amp; Skills
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("specs")}
            className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-black transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "specs"
                ? "bg-[var(--primary)] text-[var(--on-primary)] shadow-xs"
                : "bg-[var(--surface-container-low)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            Tech Specifications
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("reviews")}
            className={`px-5 py-2.5 rounded-full text-xs sm:text-sm font-black transition-all whitespace-nowrap cursor-pointer ${
              activeTab === "reviews"
                ? "bg-[var(--primary)] text-[var(--on-primary)] shadow-xs"
                : "bg-[var(--surface-container-low)] text-[var(--text-muted)] hover:text-[var(--text-primary)]"
            }`}
          >
            Parent Reviews ({product.ratingCount || 128})
          </button>
        </div>

        {/* Tab 1: Features */}
        {activeTab === "features" && (
          <div className="pt-6 space-y-6">
            <div
              className="prose dark:prose-invert max-w-none text-xs sm:text-sm text-[var(--text-primary)] leading-relaxed"
              dangerouslySetInnerHTML={{ __html: product.descriptionHtml }}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4">
              <div className="p-5 rounded-3xl bg-[var(--surface-container-low)] border border-[var(--border)] shadow-xs flex flex-col gap-2">
                <div className="w-10 h-10 rounded-2xl bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center font-bold">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-black text-sm text-[var(--text-primary)]">Bilingual Voice Guidance</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Greets and coaches little learners with warm encouraging phrases in both Bangla and English phonetics.
                </p>
              </div>
              <div className="p-5 rounded-3xl bg-[var(--surface-container-low)] border border-[var(--border)] shadow-xs flex flex-col gap-2">
                <div className="w-10 h-10 rounded-2xl bg-[var(--secondary-container)]/20 text-[var(--secondary)] flex items-center justify-center font-bold">
                  <Cpu className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-black text-sm text-[var(--text-primary)]">Intelligent Obstacle Avoidance</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Dual optical sonars detect room corners, toys, and pets up to 15cm away, calculating playful escape paths.
                </p>
              </div>
              <div className="p-5 rounded-3xl bg-[var(--surface-container-low)] border border-[var(--border)] shadow-xs flex flex-col gap-2">
                <div className="w-10 h-10 rounded-2xl bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center font-bold">
                  <Layers className="w-5 h-5" />
                </div>
                <h3 className="font-heading font-black text-sm text-[var(--text-primary)]">Tactile Sequencing &amp; Loops</h3>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                  Hands-on tangible magnetic tiles turn computer science coding principles into lively floor adventures.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: What's in the box */}
        {activeTab === "box" && (
          <div className="pt-6">
            <div className="p-6 sm:p-8 rounded-4xl bg-[var(--surface-container-low)] border border-[var(--border)] shadow-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div className="flex items-start gap-3 p-4 rounded-3xl bg-[var(--surface)] border border-[var(--border)]">
                  <div className="w-9 h-9 rounded-full bg-[var(--primary)] text-[var(--on-primary)] font-black text-xs flex items-center justify-center shrink-0">
                    1x
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-xs text-[var(--text-primary)]">{product.name} Main Unit</h4>
                    <p className="text-[11px] text-[var(--text-muted)]">Reinforced ABS shell with integrated motor wheels &amp; LED eyes.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-3xl bg-[var(--surface)] border border-[var(--border)]">
                  <div className="w-9 h-9 rounded-full bg-[var(--secondary-container)] text-[var(--on-secondary-container)] font-black text-xs flex items-center justify-center shrink-0">
                    36x
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-xs text-[var(--text-primary)]">Tactile Sequencing Tiles</h4>
                    <p className="text-[11px] text-[var(--text-muted)]">Forward, Reverse, Left 90°, Right 90°, Loop &amp; Action command cards.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-3xl bg-[var(--accent)] text-white font-black text-xs flex items-center justify-center shrink-0">
                  1x
                </div>
                <div>
                  <h4 className="font-heading font-bold text-xs text-[var(--text-primary)]">Giant Floor Play Map</h4>
                  <p className="text-[11px] text-[var(--text-muted)]">Durable spill-resistant activity mat (85cm x 85cm) with double-sided grid.</p>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-3xl bg-[var(--surface)] border border-[var(--border)]">
                  <div className="w-9 h-9 rounded-full bg-[var(--surface-container-high)] text-[var(--text-primary)] font-black text-xs flex items-center justify-center shrink-0">
                    1x
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-xs text-[var(--text-primary)]">Braided USB-C Safe Cable</h4>
                    <p className="text-[11px] text-[var(--text-muted)]">Tangle-resistant child-safe reinforced cord for rapid recharging.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-3xl bg-[var(--surface)] border border-[var(--border)]">
                  <div className="w-9 h-9 rounded-full bg-[var(--primary)] text-[var(--on-primary)] font-black text-xs flex items-center justify-center shrink-0">
                    24x
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-xs text-[var(--text-primary)]">Wonder Mission Stickers</h4>
                    <p className="text-[11px] text-[var(--text-muted)]">Holographic badges and reward stickers for completed challenges.</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 rounded-3xl bg-[var(--surface)] border border-[var(--border)]">
                  <div className="w-9 h-9 rounded-full bg-[var(--secondary-container)] text-[var(--on-secondary-container)] font-black text-xs flex items-center justify-center shrink-0">
                    1x
                  </div>
                  <div>
                    <h4 className="font-heading font-bold text-xs text-[var(--text-primary)]">Bilingual Parent Guide</h4>
                    <p className="text-[11px] text-[var(--text-muted)]">28-page colorful curriculum designed by early childhood educators.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Developmental Radar */}
        {activeTab === "radar" && (
          <div className="pt-6">
            <RadarSkillChart />
          </div>
        )}

        {/* Tab 4: Tech Specs */}
        {activeTab === "specs" && (
          <div className="pt-6">
            <div className="max-w-2xl divide-y divide-[var(--border)] text-xs rounded-3xl bg-[var(--surface-container-low)] p-6 border border-[var(--border)]">
              <div className="py-3 flex justify-between">
                <span className="text-[var(--text-muted)] font-medium">Recommended Age</span>
                <span className="font-bold text-[var(--text-primary)]">
                  {Math.floor(product.minAgeMonths / 12)} to {Math.floor(product.maxAgeMonths / 12)} Years
                </span>
              </div>
              <div className="py-3 flex justify-between">
                <span className="text-[var(--text-muted)] font-medium">Materials</span>
                <span className="font-bold text-[var(--text-primary)]">{product.material || "Non-Toxic ABS Resin"}</span>
              </div>
              <div className="py-3 flex justify-between">
                <span className="text-[var(--text-muted)] font-medium">Battery Requirements</span>
                <span className="font-bold text-[var(--text-primary)]">{product.batteryInfo || "Built-in Rechargeable (USB-C Included)"}</span>
              </div>
              <div className="py-3 flex justify-between">
                <span className="text-[var(--text-muted)] font-medium">Model / SKU</span>
                <span className="font-mono text-[var(--text-primary)] font-bold">{currentVariant.sku}</span>
              </div>
              {product.attributes?.map((a, i) => (
                <div key={i} className="py-3 flex justify-between">
                  <span className="text-[var(--text-muted)] font-medium">{a.name}</span>
                  <span className="font-bold text-[var(--text-primary)]">{a.value}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 5: Reviews */}
        {activeTab === "reviews" && (
          <div id="reviews-section" className="pt-6 space-y-6 max-w-3xl">
            <div className="p-6 rounded-3xl bg-[var(--surface-container-low)] border border-[var(--border)] flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-4xl font-black text-[var(--text-primary)]">
                    {(product.ratingAvg || 4.9).toFixed(1)}
                  </span>
                  <div>
                    <div className="flex text-amber-500">
                      {[...Array(5)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                    <p className="text-xs text-[var(--text-muted)] mt-0.5">
                      Based on {product.ratingCount || 128} verified purchases
                    </p>
                  </div>
                </div>
              </div>
              <Button variant="pill-primary" size="sm" onClick={() => toast.info("Review form will open after order delivery verification.")}>
                Write a Review
              </Button>
            </div>

            {/* Parent Testimonial Card */}
            <div className="p-5 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-[var(--on-primary)] font-bold text-xs flex items-center justify-center">
                    SN
                  </div>
                  <div>
                    <span className="font-bold text-xs text-[var(--text-primary)] block">Syeda Nasreen (Uttara, Dhaka)</span>
                    <span className="text-[10px] text-[var(--text-muted)]">Verified Buyer &bull; Mom of 5-year-old</span>
                  </div>
                </div>
                <div className="flex text-amber-500">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-current" />
                  ))}
                </div>
              </div>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                &ldquo;Arrived within 24 hours via RedX courier in Uttara. The build quality is exceptional—no sharp edges, completely odorless plastic, and my daughter hasn&apos;t put it down since Friday. Truly worth every Taka!&rdquo;
              </p>
            </div>
          </div>
        )}
      </section>

      {/* CROSS SELL: RELATED TOYS */}
      {relatedProducts?.length > 0 && (
        <section className="pt-8 border-t border-[var(--border)]">
          <div className="flex items-center justify-between mb-6">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-[var(--primary)] block">
                Recommended For You
              </span>
              <h2 className="font-heading text-xl sm:text-2xl font-black text-[var(--text-primary)]">
                More Wonder Toys &amp; Games
              </h2>
            </div>
            <Link href="/c/all" className="text-xs font-bold text-[var(--primary)] hover:underline flex items-center gap-1">
              <span>View All</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {relatedProducts.slice(0, 4).map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}

      {/* FULLSCREEN LIGHTBOX DIALOG */}
      <Dialog
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        title={product.name}
        maxWidth="2xl"
      >
        <div className="relative aspect-square w-full max-h-[70vh] rounded-3xl overflow-hidden bg-[var(--surface-container-low)]">
          <Image
            src={product.images?.[activeImageIndex] || product.images?.[0] || ""}
            alt={product.name}
            fill
            className="object-contain p-4"
          />
        </div>
      </Dialog>

      {/* STICKY MOBILE BUY BAR */}
      <div className="fixed bottom-16 inset-x-0 sm:hidden z-30 bg-[var(--surface)]/95 backdrop-blur-md border-t border-[var(--border)] p-3 shadow-2xl flex items-center justify-between gap-3 animate-in slide-in-from-bottom-2 duration-300">
        <div className="min-w-0 flex-1">
          <span className="text-[10px] text-[var(--text-muted)] block truncate">{product.name}</span>
          <span className="text-sm font-black text-[var(--primary)] block">
            {formatPrice(currentVariant.price)}
          </span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            type="button"
            onClick={() => handleAddToCart(true)}
            disabled={isOutOfStock}
            variant="pill-primary"
            size="sm"
            className="text-xs font-black px-3.5 h-9"
          >
            {isOutOfStock ? "Out of Stock" : "Add to Bag"}
          </Button>
          <Button
            type="button"
            onClick={handleBuyNow}
            disabled={isOutOfStock}
            variant="pill-amber"
            size="sm"
            className="text-xs font-black px-3.5 h-9"
          >
            Buy Now
          </Button>
        </div>
      </div>
    </div>
  );
}
