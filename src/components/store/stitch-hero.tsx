"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";
import { ToyProduct } from "@/types/store";
import { useLanguage } from "@/lib/i18n";
import {
  Sparkles,
  ShieldCheck,
  Truck,
  Check,
  Plus,
  ArrowRight,
} from "lucide-react";

interface StitchHeroProps {
  initialProducts?: ToyProduct[];
}

export function StitchHero({ initialProducts = [] }: StitchHeroProps) {
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [selectedToyIndex, setSelectedToyIndex] = useState(0);
  const [justAdded, setJustAdded] = useState(false);
  const { addItem } = useCartStore();

  const validProducts = initialProducts.filter(
    (p) => p.variants && p.variants.length > 0 && p.variants[0].stock > 0
  );

  const hasProducts = validProducts.length > 0;
  const currentToy = hasProducts ? validProducts[selectedToyIndex % validProducts.length] : null;
  const primaryVariant = currentToy ? currentToy.variants[0] : null;

  const handleQuickAdd = () => {
    if (!currentToy || !primaryVariant) return;

    addItem({
      id: `${currentToy.id}-${primaryVariant.id}`,
      productId: currentToy.id,
      variantId: primaryVariant.id,
      name: currentToy.name,
      title: primaryVariant.title || "Standard",
      price: primaryVariant.price,
      comparePrice: primaryVariant.comparePrice,
      image: currentToy.images[0] || "/images/placeholder-toy.png",
      sku: primaryVariant.sku,
      maxStock: primaryVariant.stock,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <section className="relative w-full overflow-hidden px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="max-w-[1360px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Editorial Column (Cols 1-7) */}
        <div className="lg:col-span-7 flex flex-col items-start z-10 space-y-5">
          {/* Floating Pill Badges (Approved Facts Only) */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[var(--secondary-container)] text-[var(--on-secondary-fixed)] shadow-sm font-extrabold text-xs">
              <Truck className="w-3.5 h-3.5 text-[var(--on-secondary-fixed)]" />
              <span className="uppercase tracking-wider">
                {isBn ? "ক্যাশ অন ডেলিভারি সুবিধা" : "Cash on Delivery Available"}
              </span>
            </div>

            <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[var(--surface-container-high)] text-[var(--primary)] font-bold text-xs border border-[var(--primary)]/15 shadow-2xs">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>
                {isBn
                  ? "গ্রহণের আগে পরীক্ষা করুন • হেল্পলাইন: 01712-039707"
                  : "Inspect Before You Accept • Helpline: 01712-039707"}
              </span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading tracking-tight leading-[1.1] text-[var(--text-primary)]">
            {isBn ? (
              <>
                শিশুর খেলার আনন্দে{" "}
                <span className="text-[var(--primary)] inline-flex items-center gap-2">
                  নতুন মাত্রা <span className="inline-block text-2xl sm:text-4xl animate-bounce">🚀</span>
                </span>
              </>
            ) : (
              <>
                Find a little more{" "}
                <span className="text-[var(--primary)] inline-flex items-center gap-2">
                  joy in play <span className="inline-block text-2xl sm:text-4xl animate-bounce">🚀</span>
                </span>
              </>
            )}
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-[var(--text-muted)] max-w-xl leading-relaxed">
            {isBn
              ? "আনন্দময় খেলা, শিখন ও উপহারের খেলনা সংগ্রহ। ডেলিভারি প্রতিনিধির সামনে পণ্য পরীক্ষা করার সুবিধা সহ নির্ভরযোগ্য ক্যাশ অন ডেলিভারি।"
              : "Explore toys for play, learning and thoughtful gifting. Check your product in front of the delivery person with reliable Cash on Delivery."}
          </p>

          {/* Dual Playful CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/c/all"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[var(--primary)] text-[var(--on-primary)] font-bold text-sm shadow-[0_4px_0_#93000E] active:translate-y-[2px] active:shadow-[0_2px_0_#93000E] hover:bg-[var(--primary-hover)] transition-all cursor-pointer"
            >
              <span>{isBn ? "খেলনাগুলো দেখুন" : "Explore Toys"}</span>
              <Sparkles className="w-4 h-4 text-[var(--secondary-container)]" />
            </Link>

            <Link
              href="/gift-finder"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[var(--surface-container-high)] text-[var(--text-primary)] font-bold text-sm border border-[var(--border)] hover:bg-[var(--surface-container-highest)] hover:border-[var(--primary)]/30 transition-all cursor-pointer"
            >
              <span>{isBn ? "বয়স অনুযায়ী খেলনা খুঁজুন" : "Find by Child's Age"}</span>
              <ArrowRight className="w-4 h-4 text-[var(--text-muted)]" />
            </Link>
          </div>
        </div>

        {/* Right Product Carousel Column (Cols 8-12) */}
        <div className="lg:col-span-5 relative flex flex-col items-center">
          {hasProducts && currentToy && primaryVariant ? (
            <div className="w-full max-w-md bg-[var(--surface-container-low)] rounded-4xl border border-[var(--border)] p-6 shadow-sm flex flex-col items-center text-center space-y-4">
              <div className="relative w-full aspect-square rounded-3xl overflow-hidden bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center">
                {currentToy.images[0] ? (
                  <Image
                    src={currentToy.images[0]}
                    alt={currentToy.name}
                    fill
                    className="object-contain p-4 transition-transform duration-500 hover:scale-105"
                    sizes="(max-width: 768px) 100vw, 400px"
                    priority
                  />
                ) : (
                  <div className="text-4xl">🧸</div>
                )}
              </div>

              <div className="space-y-1 w-full">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[var(--secondary)]">
                  {currentToy.category}
                </span>
                <h3 className="font-heading font-black text-lg text-[var(--text-primary)] line-clamp-1">
                  <Link href={`/p/${currentToy.slug}`} className="hover:text-[var(--primary)]">
                    {currentToy.name}
                  </Link>
                </h3>
                <div className="flex items-center justify-center gap-2 pt-1">
                  <span className="text-2xl font-black text-[var(--primary)]">
                    {formatPrice(primaryVariant.price)}
                  </span>
                  {primaryVariant.comparePrice && primaryVariant.comparePrice > primaryVariant.price && (
                    <span className="text-xs text-[var(--text-muted)] line-through">
                      {formatPrice(primaryVariant.comparePrice)}
                    </span>
                  )}
                </div>
              </div>

              <div className="w-full flex items-center gap-2 pt-2">
                <Link
                  href={`/p/${currentToy.slug}`}
                  className="flex-1 py-3 rounded-full border border-[var(--border)] bg-[var(--surface)] text-xs font-bold text-[var(--text-primary)] hover:border-[var(--primary)] text-center transition-colors"
                >
                  {isBn ? "বিস্তারিত দেখুন" : "View Details"}
                </Link>

                <button
                  type="button"
                  onClick={handleQuickAdd}
                  className="flex-1 py-3 rounded-full bg-[var(--primary)] text-[var(--on-primary)] text-xs font-bold shadow-xs hover:bg-[var(--primary-hover)] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                >
                  {justAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                  <span>{justAdded ? (isBn ? "যোগ হয়েছে!" : "Added!") : (isBn ? "কার্টে নিন" : "Add to Cart")}</span>
                </button>
              </div>

              {/* Selector Dots if multiple products */}
              {validProducts.length > 1 && (
                <div className="flex items-center gap-2 pt-2">
                  {validProducts.slice(0, 4).map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedToyIndex(idx)}
                      className={`w-2.5 h-2.5 rounded-full transition-all cursor-pointer ${
                        selectedToyIndex === idx ? "bg-[var(--primary)] w-6" : "bg-[var(--border)] hover:bg-[var(--text-muted)]"
                      }`}
                      aria-label={`Slide ${idx + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="w-full max-w-md bg-[var(--surface-container-low)] rounded-4xl border border-[var(--border)] p-8 text-center space-y-4 shadow-sm">
              <div className="w-20 h-20 mx-auto rounded-3xl bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center text-4xl shadow-xs">
                🧸
              </div>
              <h3 className="font-heading font-black text-xl text-[var(--text-primary)]">
                {isBn ? "খেলনা কালেকশন দেখুন" : "Explore Toy Collections"}
              </h3>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                {isBn
                  ? "বিভিন্ন বয়সের উপযোগী সৃজনশীল ও মননশীল খেলনা ব্রাউজ করুন।"
                  : "Browse safe, developmental, and creative toys curated for children in Bangladesh."}
              </p>
              <Link
                href="/c/all"
                className="inline-flex items-center justify-center gap-2 w-full py-3.5 rounded-full bg-[var(--primary)] text-[var(--on-primary)] font-bold text-xs shadow-xs hover:bg-[var(--primary-hover)] transition-all"
              >
                <span>{isBn ? "সকল খেলনা ব্রাউজ করুন" : "Browse All Toys"}</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
