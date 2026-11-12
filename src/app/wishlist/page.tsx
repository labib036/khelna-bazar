"use client";

import Link from "next/link";
import Image from "next/image";
import { useWishlistStore } from "@/lib/wishlist-store";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Heart,
  ShoppingBag,
  Trash2,
  ArrowRight,
  Plus,
} from "lucide-react";
import { toast } from "sonner";

export default function WishlistPage() {
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const { addItem, openCart } = useCartStore();

  const handleMoveToCart = (item: any) => {
    addItem({
      id: `${item.productId}-var-default`,
      productId: item.productId,
      variantId: "var-default",
      name: item.name,
      title: "Standard Edition",
      price: item.price,
      comparePrice: item.comparePrice,
      image: item.image,
      sku: "SKU-DEFAULT",
      maxStock: 50,
    });
    removeItem(item.productId);
    toast.success(`Moved ${item.name} to basket!`);
    openCart();
  };

  const handleMoveAllToCart = () => {
    items.forEach((item) => {
      addItem({
        id: `${item.productId}-var-default`,
        productId: item.productId,
        variantId: "var-default",
        name: item.name,
        title: "Standard Edition",
        price: item.price,
        comparePrice: item.comparePrice,
        image: item.image,
        sku: "SKU-DEFAULT",
        maxStock: 50,
      });
    });
    clearWishlist();
    toast.success("Moved all wishlist items to basket!");
    openCart();
  };

  if (items.length === 0) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-[#FFF0F0] text-[#FF6B6B] flex items-center justify-center mx-auto">
          <Heart className="w-10 h-10" />
        </div>
        <h1 className="font-heading text-2xl font-black text-[#18191F] dark:text-white">
          Your Wishlist is Empty
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Save your favorite toys by tapping the heart icon on any product card while browsing.
        </p>
        <Link href="/c/all" className="inline-block pt-2">
          <Button variant="primary" size="md">
            Explore Toys
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[#E8E2DE] dark:border-[#263050]">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-[#18191F] dark:text-white flex items-center gap-2.5">
            <Heart className="w-6 h-6 text-[#FF6B6B] fill-[#FF6B6B]" />
            <span>My Saved Toys ({items.length})</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Keep track of toys for upcoming birthdays, holidays, or gift surprises.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleMoveAllToCart} variant="sun" size="sm" className="gap-1.5 shadow-xs">
            <ShoppingBag className="w-4 h-4" />
            <span>Move All to Basket</span>
          </Button>
          <Button onClick={clearWishlist} variant="outline" size="sm">
            Clear Wishlist
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <div
            key={item.productId}
            className="group relative bg-white dark:bg-[#161D33] rounded-2xl border border-[#E8E2DE] dark:border-[#263050] overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="relative aspect-square w-full bg-slate-100 dark:bg-slate-800">
                <Image src={item.image} alt={item.name} fill className="object-cover" sizes="240px" />
                <button
                  onClick={() => removeItem(item.productId)}
                  className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 text-slate-400 hover:text-[#FF6B6B] flex items-center justify-center transition-colors cursor-pointer"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-1">
                <Link
                  href={`/p/${item.slug}`}
                  className="font-heading text-xs sm:text-sm font-bold text-[#18191F] dark:text-white hover:text-[#DC012B] transition-colors line-clamp-2"
                >
                  {item.name}
                </Link>
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="font-black text-sm text-[#DC012B]">{formatPrice(item.price)}</span>
                  {item.comparePrice && item.comparePrice > item.price && (
                    <span className="text-xs text-slate-400 line-through">
                      {formatPrice(item.comparePrice)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 pt-0">
              <Button
                onClick={() => handleMoveToCart(item)}
                variant="primary"
                size="sm"
                className="w-full text-xs font-bold h-9"
              >
                <ShoppingBag className="w-3.5 h-3.5 mr-1" />
                <span>Move to Basket</span>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
