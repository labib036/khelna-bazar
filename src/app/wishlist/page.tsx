"use client";

import Link from "next/link";
import Image from "next/image";
import { useWishlistStore } from "@/lib/wishlist-store";
import { useCartStore } from "@/lib/cart-store";
import { useMounted } from "@/lib/use-mounted";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Heart,
  ShoppingBag,
  Trash2,
} from "lucide-react";
import { toast } from "sonner";

export default function WishlistPage() {
  const mounted = useMounted();
  const { items, removeItem, clearWishlist } = useWishlistStore();
  const { addItem, openCart } = useCartStore();

  if (!mounted) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center text-xs text-[var(--text-muted)] animate-pulse">
        Loading wishlist...
      </div>
    );
  }

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
        <div className="w-20 h-20 rounded-full bg-rose-500/10 text-[var(--danger)] flex items-center justify-center mx-auto">
          <Heart className="w-10 h-10" />
        </div>
        <h1 className="font-heading text-2xl font-black text-[var(--text-primary)]">
          Your Wishlist is Empty
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)]">
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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border)]">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-[var(--text-primary)] flex items-center gap-2.5">
            <Heart className="w-6 h-6 text-[var(--danger)] fill-[var(--danger)]" />
            <span>My Saved Toys ({items.length})</span>
          </h1>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">
            Keep track of toys for upcoming birthdays, holidays, or gift surprises.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            onClick={handleMoveAllToCart}
            variant="pill-amber"
            size="sm"
            className="gap-1.5 font-black text-xs h-9 shadow-xs"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Move All to Basket</span>
          </Button>
          <Button
            type="button"
            onClick={clearWishlist}
            variant="outline"
            size="sm"
            className="rounded-full text-xs font-bold h-9"
          >
            Clear Wishlist
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {items.map((item) => (
          <div
            key={item.productId}
            className="group relative bg-[var(--surface-container-low)] rounded-3xl border border-[var(--border)] overflow-hidden flex flex-col justify-between hover:shadow-md transition-shadow"
          >
            <div>
              <div className="relative aspect-square w-full bg-[var(--surface)] p-2">
                <Image src={item.image} alt={item.name} fill className="object-contain p-2" sizes="240px" />
                <button
                  type="button"
                  onClick={() => removeItem(item.productId)}
                  className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-[var(--surface)]/90 text-[var(--text-muted)] hover:text-[var(--danger)] flex items-center justify-center transition-colors cursor-pointer shadow-xs border border-[var(--border)]"
                  title="Remove from wishlist"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <div className="p-4 space-y-1">
                <Link
                  href={`/p/${item.slug}`}
                  className="font-heading text-xs sm:text-sm font-bold text-[var(--text-primary)] hover:text-[var(--primary)] transition-colors line-clamp-2"
                >
                  {item.name}
                </Link>
                <div className="flex items-baseline gap-2 pt-1">
                  <span className="font-black text-sm text-[var(--primary)]">{formatPrice(item.price)}</span>
                  {item.comparePrice && item.comparePrice > item.price && (
                    <span className="text-xs text-[var(--text-muted)] line-through">
                      {formatPrice(item.comparePrice)}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="p-4 pt-0">
              <Button
                type="button"
                onClick={() => handleMoveToCart(item)}
                variant="pill-primary"
                size="sm"
                className="w-full text-xs font-black h-9 shadow-xs"
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
