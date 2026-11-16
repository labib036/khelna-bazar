"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCartStore } from "@/lib/cart-store";
import { formatPrice } from "@/lib/utils";
import {
  Sparkles,
  Gift,
  Star,
  Plus,
  Check,
  ShieldCheck,
  Zap,
} from "lucide-react";

const HERO_FEATURED_TOYS = [
  {
    id: "toy-hero-1",
    name: "Cosmic Bot 3000 STEM Companion",
    category: "STEM & Robotics",
    age: "3-6 Yrs",
    price: 2450,
    comparePrice: 3200,
    discount: 24,
    image: "https://images.unsplash.com/photo-1546776310-eef45dd6d63c?auto=format&fit=crop&w=800&q=80",
    badge: "Staff Pick",
  },
  {
    id: "toy-hero-2",
    name: "Montessori Wooden Rainbow Arch",
    category: "Montessori & Wooden",
    age: "1-4 Yrs",
    price: 1850,
    comparePrice: 2400,
    discount: 23,
    image: "https://images.unsplash.com/photo-1596461404969-9ae70f2830c1?auto=format&fit=crop&w=800&q=80",
    badge: "Sensory Calm",
  },
  {
    id: "toy-hero-3",
    name: "AeroSparks 4WD High-Speed Stunt RC",
    category: "RC Vehicles",
    age: "6-10 Yrs",
    price: 3100,
    comparePrice: 4200,
    discount: 26,
    image: "https://images.unsplash.com/photo-1594787318286-3d835c1d207f?auto=format&fit=crop&w=800&q=80",
    badge: "Speed & Stunts",
  },
];

export function StitchHero() {
  const [selectedToyIndex, setSelectedToyIndex] = useState(0);
  const [justAdded, setJustAdded] = useState(false);
  const { addItem } = useCartStore();

  const currentToy = HERO_FEATURED_TOYS[selectedToyIndex];

  const handleQuickAdd = () => {
    addItem({
      id: `${currentToy.id}-var-hero`,
      productId: currentToy.id,
      variantId: "var-hero",
      name: currentToy.name,
      title: "Standard Edition",
      price: currentToy.price,
      comparePrice: currentToy.comparePrice,
      image: currentToy.image,
      sku: `HERO-${selectedToyIndex + 1}`,
      maxStock: 15,
    });
    setJustAdded(true);
    setTimeout(() => setJustAdded(false), 1200);
  };

  return (
    <section className="relative w-full overflow-hidden px-4 sm:px-6 lg:px-8 py-4 sm:py-8">
      <div className="max-w-[1360px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
        {/* Left Editorial Column (Cols 1-7) */}
        <div className="lg:col-span-7 flex flex-col items-start z-10 space-y-5">
          {/* Floating Pill Badges */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[var(--secondary-container)] text-[var(--on-secondary-fixed)] shadow-sm font-extrabold text-xs">
              <Star className="w-3.5 h-3.5 fill-current text-[var(--on-secondary-fixed)]" />
              <span className="uppercase tracking-wider">4.9/5 Parent Trust Rating</span>
            </div>

            <div className="flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[var(--surface-container-high)] text-[var(--primary)] font-bold text-xs border border-[var(--primary)]/15 shadow-2xs">
              <Zap className="w-3.5 h-3.5" />
              <span>Same-Day Dispatch • Free Over ৳1500</span>
            </div>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black font-heading tracking-tight leading-[1.1] text-[var(--text-primary)]">
            Where Childhood Wonders{" "}
            <span className="text-[var(--primary)] inline-flex items-center gap-2">
              Come Alive <span className="inline-block text-2xl sm:text-4xl animate-bounce">🚀</span>
            </span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-[var(--text-muted)] max-w-xl leading-relaxed">
            Carefully tested, sensory-rich play essentials and artisan toymaking from Bangladesh and around the world. Designed to nurture curious young minds with complete safety.
          </p>

          {/* Dual Playful CTAs */}
          <div className="flex flex-wrap items-center gap-3 pt-2">
            <Link
              href="/c/all"
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[var(--primary)] text-[var(--on-primary)] font-bold text-sm shadow-[0_4px_0_#93000E] active:translate-y-[2px] active:shadow-[0_2px_0_#93000E] hover:bg-[var(--primary-hover)] transition-all cursor-pointer"
            >
              <span>Explore Best Sellers</span>
              <Sparkles className="w-4 h-4 text-[var(--secondary-container)]" />
            </Link>

            <button
              type="button"
              onClick={() => {
                const el = document.getElementById("gift-wizard-banner");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-full bg-[var(--surface)] text-[var(--text-primary)] hover:bg-[var(--surface-container-low)] font-bold text-sm shadow-xs border border-[var(--border)] active:translate-y-[1px] transition-all cursor-pointer"
            >
              <Gift className="w-4 h-4 text-[var(--secondary)]" />
              <span>Try 4-Step Gift Finder</span>
            </button>
          </div>

          {/* Micro Social Proof Snippet */}
          <div className="flex items-center gap-3.5 p-2.5 sm:p-3 rounded-2xl bg-[var(--surface-container-low)] border border-[var(--border)] shadow-xs">
            <div className="flex -space-x-2.5 shrink-0">
              <div className="w-9 h-9 rounded-full bg-emerald-500 text-white font-black text-xs flex items-center justify-center ring-2 ring-white">
                S
              </div>
              <div className="w-9 h-9 rounded-full bg-purple-500 text-white font-black text-xs flex items-center justify-center ring-2 ring-white">
                T
              </div>
              <div className="w-9 h-9 rounded-full bg-amber-500 text-white font-black text-xs flex items-center justify-center ring-2 ring-white">
                L
              </div>
            </div>
            <div className="flex flex-col text-xs">
              <div className="flex items-center gap-1 text-[var(--secondary)]">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="w-3 h-3 fill-current" />
                ))}
                <span className="font-black text-[var(--text-primary)] ml-1">4.9 / 5.0</span>
              </div>
              <span className="text-[11px] text-[var(--text-muted)] font-medium">
                Loved by 12,000+ Happy Families across Bangladesh
              </span>
            </div>
          </div>
        </div>

        {/* Right Visual Bento Column (Cols 8-12) */}
        <div className="lg:col-span-5 relative flex flex-col items-center">
          {/* Ambient Glows */}
          <div className="absolute -top-10 -right-10 w-72 h-72 rounded-full bg-[var(--primary)]/15 blur-3xl pointer-events-none" />
          <div className="absolute -bottom-10 -left-10 w-64 h-64 rounded-full bg-[var(--secondary-container)]/25 blur-3xl pointer-events-none" />

          {/* Main Featured Showcase Card */}
          <div className="relative z-10 w-full rounded-3xl bg-[var(--surface)] border border-[var(--border)] p-4 sm:p-5 shadow-lg space-y-4">
            {/* Top Badge Strip */}
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-[var(--primary)] text-[var(--on-primary)] text-[10px] font-extrabold uppercase tracking-wider shadow-xs">
                {currentToy.badge}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-600 dark:text-emerald-400">
                <ShieldCheck className="w-3.5 h-3.5" /> Certified Non-Toxic
              </span>
            </div>

            {/* 1:1 Image Viewport */}
            <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-[var(--surface-container-low)] border border-[var(--border)]">
              <Image
                src={currentToy.image}
                alt={currentToy.name}
                fill
                priority
                className="object-cover photo-micro-zoom duration-500"
                sizes="(max-width: 1024px) 100vw, 400px"
              />
              <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-full bg-[var(--surface)]/90 backdrop-blur-xs text-[11px] font-bold text-[var(--text-primary)] shadow-xs">
                {currentToy.age}
              </div>
            </div>

            {/* Product Meta & Action */}
            <div className="space-y-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-[var(--secondary)]">
                {currentToy.category}
              </div>
              <h3 className="text-base sm:text-lg font-black text-[var(--text-primary)] line-clamp-1">
                {currentToy.name}
              </h3>

              <div className="flex items-center justify-between pt-1">
                <div className="flex items-baseline gap-2">
                  <span className="text-xl sm:text-2xl font-black text-[var(--primary)] tabular-nums">
                    {formatPrice(currentToy.price)}
                  </span>
                  <span className="text-xs text-[var(--text-muted)] line-through tabular-nums">
                    {formatPrice(currentToy.comparePrice)}
                  </span>
                  <span className="text-[10px] font-extrabold px-1.5 py-0.5 rounded-full bg-[var(--secondary-container)] text-[var(--on-secondary-fixed)]">
                    -{currentToy.discount}%
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleQuickAdd}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-[var(--primary)] text-[var(--on-primary)] hover:bg-[var(--primary-hover)] text-xs font-bold shadow-xs active:scale-95 transition-all cursor-pointer"
                  aria-label={`Add ${currentToy.name} to basket`}
                >
                  {justAdded ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Added!</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add to Bag</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Mini Toy Carousel Selector Bar */}
          <div className="relative z-10 flex items-center gap-2 mt-4 w-full">
            {HERO_FEATURED_TOYS.map((toy, idx) => {
              const isSelected = idx === selectedToyIndex;
              return (
                <button
                  key={toy.id}
                  type="button"
                  onClick={() => setSelectedToyIndex(idx)}
                  className={`flex-1 p-2 rounded-2xl border text-left transition-all cursor-pointer flex items-center gap-2 ${
                    isSelected
                      ? "bg-[var(--surface)] border-[var(--primary)] shadow-sm ring-2 ring-[var(--primary)]/20"
                      : "bg-[var(--surface-container-low)] border-[var(--border)] hover:bg-[var(--surface)] opacity-75 hover:opacity-100"
                  }`}
                >
                  <div className="relative w-8 h-8 rounded-xl overflow-hidden bg-white shrink-0">
                    <Image src={toy.image} alt={toy.name} fill className="object-cover" sizes="32px" />
                  </div>
                  <div className="min-w-0">
                    <span className="block text-[11px] font-bold text-[var(--text-primary)] truncate">
                      {toy.name}
                    </span>
                    <span className="block text-[10px] text-[var(--primary)] font-black">
                      {formatPrice(toy.price)}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
