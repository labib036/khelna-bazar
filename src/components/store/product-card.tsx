"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import type { ToyProduct } from "@/types/store";
import { formatPrice, calculateDiscountPercentage } from "@/lib/utils";
import { useCartStore } from "@/lib/cart-store";
import { useWishlistStore } from "@/lib/wishlist-store";
import { useLanguage } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { QuantityStepper } from "@/components/ui/quantity-stepper";
import { Dialog } from "@/components/ui/dialog";
import {
  Heart,
  Star,
  Plus,
  Check,
  Truck,
  Eye,
  ShieldCheck,
} from "lucide-react";

export interface ProductCardProps {
  product: ToyProduct;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const { t } = useLanguage();
  const { items, addItem, updateQuantity, removeItem } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const [isHovered, setIsHovered] = useState(false);
  const [justAdded, setJustAdded] = useState(false);
  const [showQuickView, setShowQuickView] = useState(false);
  const [heartBurst, setHeartBurst] = useState(false);

  const isOutOfStock = product.stock <= 0;
  const cartItem = items.find((i) => i.productId === product.id);
  const inWishlist = isInWishlist(product.id);
  const discountPercent = calculateDiscountPercentage(product.basePrice, product.comparePrice);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    const selectedVariant = product.variants?.[0] || {
      id: "var-default",
      sku: "SKU-DEF",
      title: "Standard",
      price: product.basePrice,
      comparePrice: product.comparePrice,
      stock: product.stock,
    };

    addItem({
      id: `${product.id}-${selectedVariant.id}`,
      productId: product.id,
      variantId: selectedVariant.id,
      name: product.name,
      title: selectedVariant.title,
      price: selectedVariant.price,
      comparePrice: selectedVariant.comparePrice,
      image:
        product.images?.[0] ||
        "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=600&q=80",
      sku: selectedVariant.sku,
      maxStock: selectedVariant.stock !== undefined ? selectedVariant.stock : product.stock,
    });

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setHeartBurst(true);
    setTimeout(() => setHeartBurst(false), 600);

    toggleWishlist({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.basePrice,
      comparePrice: product.comparePrice,
      image: product.images?.[0],
      ratingAvg: product.ratingAvg,
      ratingCount: product.ratingCount,
    });
  };

  return (
    <>
      <div
        className="group relative bg-[var(--surface)] rounded-3xl border border-[var(--border)] overflow-hidden flex flex-col h-full card-sensory-lift hover:border-[var(--primary)]/40 cursor-pointer shadow-xs"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* 1:1 Aspect Ratio Image Container */}
        <div className="relative aspect-square w-full overflow-hidden bg-[var(--surface)]">
          <Link href={`/p/${product.slug}`} className="block w-full h-full">
            <Image
              src={
                isHovered && product.images?.[1] ? product.images[1] : product.images?.[0] || ""
              }
              alt={product.name}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              priority={priority}
              className={`object-cover photo-micro-zoom duration-500 ${
                isOutOfStock ? "grayscale opacity-70" : ""
              }`}
            />
          </Link>

          {/* Badges on Top Left */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
            {isOutOfStock ? (
              <Badge variant="neutral" className="font-extrabold shadow-xs">
                {t("outOfStock")}
              </Badge>
            ) : (
              <>
                {discountPercent > 0 && (
                  <Badge variant="amber" className="font-black shadow-xs">
                    -{discountPercent}% OFF
                  </Badge>
                )}
                {product.isFeatured && (
                  <Badge variant="red" className="shadow-xs font-bold">
                    Best Seller
                  </Badge>
                )}
                {product.stock <= 5 && product.stock > 0 && (
                  <Badge variant="danger" className="shadow-xs">
                    Only {product.stock} Left!
                  </Badge>
                )}
              </>
            )}
          </div>

          {/* Quick Action Buttons on Top Right */}
          <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10">
            {/* Wishlist */}
            <button
              type="button"
              onClick={handleToggleWishlist}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 shadow-xs cursor-pointer ${
                inWishlist
                  ? "bg-rose-500/15 text-[var(--primary)]"
                  : "bg-[var(--surface-elevated)]/90 text-[var(--text-muted)] hover:text-[var(--primary)] hover:scale-110"
              } ${heartBurst ? "animate-heart-burst" : ""}`}
              aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
            >
              <Heart
                className={`w-4 h-4 ${
                  inWishlist ? "fill-[var(--primary)] text-[var(--primary)]" : ""
                }`}
              />
            </button>

            {/* Quick View */}
            <button
              type="button"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                setShowQuickView(true);
              }}
              className="w-8 h-8 rounded-full bg-[var(--surface-elevated)]/90 text-[var(--text-muted)] hover:text-[var(--primary)] hover:scale-110 flex items-center justify-center transition-all duration-150 shadow-xs cursor-pointer opacity-0 group-hover:opacity-100"
              aria-label="Quick view toy details"
            >
              <Eye className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Product Information */}
        <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
          <div>
            {/* Brand & Age Hint */}
            <div className="flex items-center justify-between text-[11px] text-[var(--text-muted)] mb-1">
              <span className="font-extrabold uppercase tracking-wider text-[var(--secondary)] truncate">
                {product.brand}
              </span>
              <span className="shrink-0 font-bold bg-[var(--surface-container-low)] px-2 py-0.5 rounded-full text-[10px] text-[var(--text-primary)] border border-[var(--border)]">
                {Math.floor(product.minAgeMonths / 12)}+ Yrs
              </span>
            </div>

            {/* Title with min-height for uniform card grid alignment */}
            <Link
              href={`/p/${product.slug}`}
              className="block hover:text-[var(--primary)] transition-colors"
            >
              <h3 className="text-xs sm:text-sm font-bold text-[var(--text-primary)] line-clamp-2 min-h-[2.5rem] leading-snug">
                {product.name}
              </h3>
            </Link>

            {/* Rating (Only show if real reviews exist) */}
            {product.ratingCount > 0 ? (
              <div className="flex items-center gap-1 mt-1.5 text-xs">
                <div className="flex items-center text-[var(--warning)]">
                  <Star className="w-3.5 h-3.5 fill-current" />
                </div>
                <span className="font-bold text-[var(--text-primary)] text-xs">
                  {product.ratingAvg.toFixed(1)}
                </span>
                <span className="text-[var(--text-muted)] text-[11px]">({product.ratingCount})</span>
              </div>
            ) : (
              <div className="text-[11px] text-[var(--text-muted)] mt-1.5 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-emerald-500" />
                <span>Certified Non-Toxic</span>
              </div>
            )}

            {/* Stock Progress Bar for Deals */}
            {product.isDeal && (
              <div className="mt-2 space-y-1">
                <div className="flex justify-between text-[10px] text-[var(--text-muted)] font-medium">
                  <span>Deals Claimed</span>
                  <span className="font-bold text-[var(--primary)]">{product.soldCount || 12} sold</span>
                </div>
                <div className="w-full h-1.5 bg-[var(--surface)] rounded-full overflow-hidden border border-[var(--border)]">
                  <div
                    className="h-full bg-gradient-to-r from-amber-500 to-[var(--primary)] rounded-full"
                    style={{
                      width: `${Math.min(90, Math.max(15, ((product.soldCount || 12) / ((product.soldCount || 12) + product.stock)) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Pricing & Add to Cart */}
          <div className="mt-3 pt-2.5 border-t border-[var(--border)]">
            {/* Price */}
            <div className="flex items-baseline gap-1.5 mb-2">
              <span className="text-base sm:text-lg font-black text-[var(--text-primary)]">
                {formatPrice(product.basePrice)}
              </span>
              {product.comparePrice && product.comparePrice > product.basePrice && (
                <span className="text-xs text-[var(--text-muted)] line-through">
                  {formatPrice(product.comparePrice)}
                </span>
              )}
            </div>

            {/* Fast Delivery Hint */}
            <div className="flex items-center gap-1 text-[10px] text-[var(--success)] mb-2 font-medium">
              <Truck className="w-3 h-3 shrink-0" />
              <span>Cash on Delivery &bull; Fast Dispatch</span>
            </div>

            {/* Add to Cart Button or Stepper or Out of Stock */}
            {isOutOfStock ? (
              <Button
                variant="outline"
                size="sm"
                disabled
                className="w-full text-xs font-bold h-9 opacity-60 cursor-not-allowed bg-[var(--surface)] border-[var(--border)] text-[var(--text-muted)]"
              >
                {t("outOfStock")}
              </Button>
            ) : cartItem ? (
              <div className="flex items-center justify-center w-full h-9">
                <QuantityStepper
                  value={cartItem.quantity}
                  max={product.stock}
                  onChange={(newQty) => {
                    const diff = newQty - cartItem.quantity;
                    if (newQty <= 0) {
                      removeItem(cartItem.id);
                    } else {
                      updateQuantity(cartItem.id, diff);
                    }
                  }}
                  size="sm"
                  className="w-full justify-between"
                />
              </div>
            ) : (
              <Button
                type="button"
                onClick={handleAddToCart}
                variant={justAdded ? "secondary" : "pill-primary"}
                size="sm"
                className="w-full text-xs font-bold h-9 shadow-xs cursor-pointer"
              >
                {justAdded ? (
                  <span className="flex items-center gap-1 text-[var(--success)]">
                    <Check className="w-3.5 h-3.5" /> {t("addedToBag")}
                  </span>
                ) : (
                  <span className="flex items-center gap-1">
                    <Plus className="w-3.5 h-3.5" /> {t("addToBag")}
                  </span>
                )}
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Quick View Dialog */}
      <Dialog
        isOpen={showQuickView}
        onClose={() => setShowQuickView(false)}
        title={product.name}
        description={`${product.brand} • Age ${Math.floor(product.minAgeMonths / 12)}+ Years`}
        maxWidth="2xl"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
          {/* Image */}
          <div className="relative aspect-square rounded-2xl overflow-hidden bg-[var(--surface)] border border-[var(--border)]">
            <Image
              src={product.images?.[0] || ""}
              alt={product.name}
              fill
              className="object-cover"
            />
          </div>

          {/* Details */}
          <div className="space-y-4 flex flex-col justify-between">
            <div className="space-y-2">
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black text-[var(--text-primary)]">
                  {formatPrice(product.basePrice)}
                </span>
                {product.comparePrice && product.comparePrice > product.basePrice && (
                  <span className="text-sm text-[var(--text-muted)] line-through">
                    {formatPrice(product.comparePrice)}
                  </span>
                )}
              </div>

              <p className="text-xs text-[var(--text-muted)] line-clamp-3 leading-relaxed">
                {product.shortDesc}
              </p>

              <div className="pt-2 flex flex-wrap gap-2 text-[11px]">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold border border-emerald-500/20">
                  <ShieldCheck className="w-3.5 h-3.5" /> Safety Certified
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[var(--surface)] text-[var(--text-muted)] font-semibold border border-[var(--border)]">
                  Stock: {product.stock} units
                </span>
              </div>
            </div>

            <div className="pt-4 border-t border-[var(--border)] space-y-2">
              <Button
                type="button"
                onClick={(e) => {
                  handleAddToCart(e);
                  setShowQuickView(false);
                }}
                disabled={isOutOfStock}
                variant="primary"
                size="md"
                className="w-full text-xs font-bold"
              >
                {isOutOfStock ? t("outOfStock") : t("addToBag")}
              </Button>

              <Link
                href={`/p/${product.slug}`}
                onClick={() => setShowQuickView(false)}
                className="block text-center text-xs font-bold text-[var(--primary)] hover:underline pt-1"
              >
                View Full Product Details &rarr;
              </Link>
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
}
