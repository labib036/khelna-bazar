"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ToyProduct } from "@/server/mock-data";
import { formatPrice, calculateDiscountPercentage } from "@/lib/utils";
import { useCartStore } from "@/lib/cart-store";
import { useWishlistStore } from "@/lib/wishlist-store";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  Star,
  Plus,
  Minus,
  Check,
  Truck,
  Eye,
  Sparkles,
} from "lucide-react";

export interface ProductCardProps {
  product: ToyProduct;
  priority?: boolean;
}

export function ProductCard({ product, priority = false }: ProductCardProps) {
  const { items, addItem, updateQuantity } = useCartStore();
  const { toggleWishlist, isInWishlist } = useWishlistStore();

  const [isHovered, setIsHovered] = useState(false);
  const [justAdded, setJustAdded] = useState(false);

  // Check if any variant of this product is in the cart
  const cartItem = items.find((i) => i.productId === product.id);
  const inWishlist = isInWishlist(product.id);
  const discountPercent = calculateDiscountPercentage(product.basePrice, product.comparePrice);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const selectedVariant = product.variants[0] || {
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
      image: product.images[0] || "https://images.unsplash.com/photo-1587654780291-39c9404d746b?auto=format&fit=crop&w=600&q=80",
      sku: selectedVariant.sku,
      maxStock: selectedVariant.stock,
    });

    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();

    toggleWishlist({
      productId: product.id,
      name: product.name,
      slug: product.slug,
      price: product.basePrice,
      comparePrice: product.comparePrice,
      image: product.images[0],
      ratingAvg: product.ratingAvg,
      ratingCount: product.ratingCount,
    });
  };

  return (
    <div
      className="group relative bg-white dark:bg-[#161D33] rounded-2xl border border-[#E8E2DE] dark:border-[#263050] overflow-hidden flex flex-col transition-all duration-200 hover:-translate-y-1 hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Image Container with Badges & Wishlist */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-50 dark:bg-[#1E2742]">
        <Link href={`/p/${product.slug}`} className="block w-full h-full">
          <Image
            src={isHovered && product.images[1] ? product.images[1] : product.images[0]}
            alt={product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            priority={priority}
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </Link>

        {/* Badges on Top Left */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 z-10">
          {discountPercent > 0 && (
            <Badge variant="coral" className="font-extrabold shadow-xs">
              -{discountPercent}% OFF
            </Badge>
          )}
          {product.isFeatured && (
            <Badge variant="sun" className="shadow-xs">
              Best Seller
            </Badge>
          )}
          {product.stock <= 5 && product.stock > 0 && (
            <Badge variant="coral" className="bg-amber-100 text-amber-800">
              Only {product.stock} Left!
            </Badge>
          )}
        </div>

        {/* Wishlist Heart on Top Right */}
        <button
          onClick={handleToggleWishlist}
          className={`absolute top-2.5 right-2.5 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-150 z-10 shadow-xs cursor-pointer ${
            inWishlist
              ? "bg-[#FFF0F2] text-[#DC012B]"
              : "bg-white/90 text-slate-400 hover:text-[#DC012B] hover:scale-110"
          }`}
          aria-label={inWishlist ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart className={`w-4 h-4 ${inWishlist ? "fill-[#DC012B]" : ""}`} />
        </button>
      </div>

      {/* Product Information */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Age Hint */}
          <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
            <span className="font-bold uppercase tracking-wider text-[#F59E0B] truncate">
              {product.brand}
            </span>
            <span className="shrink-0 font-medium bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[10px]">
              {Math.floor(product.minAgeMonths / 12)}+ Yrs
            </span>
          </div>

          {/* Title */}
          <Link href={`/p/${product.slug}`} className="block group-hover:text-[#DC012B] transition-colors">
            <h3 className="text-xs sm:text-sm font-bold text-[#18191F] dark:text-white line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </Link>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1.5 text-xs">
            <div className="flex items-center text-[#F59E0B]">
              <Star className="w-3.5 h-3.5 fill-current" />
            </div>
            <span className="font-bold text-slate-700 dark:text-slate-200 text-xs">
              {product.ratingAvg.toFixed(1)}
            </span>
            <span className="text-slate-400 text-[11px]">({product.ratingCount})</span>
          </div>
        </div>

        {/* Pricing & Add to Cart */}
        <div className="mt-3 pt-2.5 border-t border-[#E8E2DE] dark:border-[#2E303E]">
          {/* Price */}
          <div className="flex items-baseline gap-1.5 mb-2.5">
            <span className="text-base sm:text-lg font-black text-[#18191F] dark:text-white">
              {formatPrice(product.basePrice)}
            </span>
            {product.comparePrice && product.comparePrice > product.basePrice && (
              <span className="text-xs text-slate-400 line-through">
                {formatPrice(product.comparePrice)}
              </span>
            )}
          </div>

          {/* Fast Delivery Hint */}
          <div className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 mb-2 font-medium">
            <Truck className="w-3 h-3 shrink-0" />
            <span>Cash on Delivery &bull; Fast Dispatch</span>
          </div>

          {/* Add to Cart Button or Stepper */}
          {cartItem ? (
            <div className="flex items-center justify-between w-full h-9 rounded-full bg-[#FFF0F2] dark:bg-[#3D000B] border border-[#DC012B] px-2">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  updateQuantity(cartItem.id, -1);
                }}
                className="w-7 h-7 rounded-full flex items-center justify-center text-[#DC012B] hover:bg-white dark:hover:bg-[#1B1C24] transition-colors"
                aria-label="Decrease quantity"
              >
                <Minus className="w-3.5 h-3.5" />
              </button>
              <span className="text-xs font-bold text-[#DC012B] dark:text-white">
                {cartItem.quantity} in Basket
              </span>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  updateQuantity(cartItem.id, 1);
                }}
                className="w-7 h-7 rounded-full flex items-center justify-center text-[#DC012B] hover:bg-white dark:hover:bg-[#1B1C24] transition-colors"
                aria-label="Increase quantity"
              >
                <Plus className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <Button
              onClick={handleAddToCart}
              variant={justAdded ? "mint" as any : "primary"}
              size="sm"
              className="w-full text-xs font-bold h-9 shadow-xs"
            >
              {justAdded ? (
                <span className="flex items-center gap-1 text-white">
                  <Check className="w-3.5 h-3.5" /> Added!
                </span>
              ) : (
                <span className="flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5" /> Add to Basket
                </span>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
