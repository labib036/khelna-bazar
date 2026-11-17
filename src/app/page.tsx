import Link from "next/link";
import { getProducts } from "@/server/services/product-service";
import { StitchHero } from "@/components/store/stitch-hero";
import { StitchGiftWizard } from "@/components/store/stitch-gift-wizard";
import { HomeProductsSection } from "@/components/store/home-products-section";
import { Countdown } from "@/components/ui/countdown";
import {
  Flame,
  ArrowRight,
  ChevronRight,
  ShieldCheck,
  Truck,
  RotateCcw,
  Sparkles,
  Star,
  CheckCircle2,
} from "lucide-react";

export const revalidate = 300; // ISR cache 5 minutes

export default async function HomePage() {
  const [featuredData, dealsData] = await Promise.all([
    getProducts({ limit: 8, sort: "bestselling" }),
    getProducts({ isDeal: true, limit: 4 }),
  ]);

  const featuredProducts = featuredData.products;
  const dealProducts = dealsData.products;

  const ageCategories = [
    { label: "0 – 12 Months", sub: "Sensory & Soft", query: "0-12m", emoji: "🍼" },
    { label: "1 – 2 Years", sub: "Toddler Active", query: "1-2y", emoji: "🧸" },
    { label: "3 – 5 Years", sub: "Creative & Play", query: "3-4y", emoji: "🎨" },
    { label: "6 – 8 Years", sub: "STEM & Discovery", query: "5-7y", emoji: "🚀" },
    { label: "9 – 11 Years", sub: "Brain & Puzzles", query: "8-11y", emoji: "🧩" },
    { label: "12+ Years", sub: "Robotics & Tech", query: "12+", emoji: "🔬" },
  ];

  const curatedCategoryBento = [
    { name: "STEM & Robotics", slug: "stem-robotics", icon: "🔬", desc: "Build & Code", bg: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-500/20" },
    { name: "Montessori & Wooden", slug: "baby-toddler", icon: "🪵", desc: "Early Learning", bg: "bg-amber-500/10 text-amber-800 dark:text-amber-200 border-amber-500/20" },
    { name: "Dolls & Plushies", slug: "baby-toddler", icon: "🧸", desc: "Snuggly Wonders", bg: "bg-rose-500/10 text-rose-700 dark:text-rose-300 border-rose-500/20" },
    { name: "RC & Diecast Vehicles", slug: "rc-vehicles", icon: "🏎️", desc: "High Speed Stunts", bg: "bg-orange-500/10 text-orange-700 dark:text-orange-300 border-orange-500/20" },
    { name: "Creative Arts & Crafts", slug: "creative-arts-crafts", icon: "🎨", desc: "Paints & Slime", bg: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20" },
    { name: "Board Games & Puzzles", slug: "educational-board-games", icon: "🧩", desc: "Family Brain Play", bg: "bg-sky-500/10 text-sky-700 dark:text-sky-300 border-sky-500/20" },
    { name: "Building Blocks & Lego", slug: "building-blocks", icon: "🧱", desc: "Architectural Sets", bg: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-500/20" },
    { name: "Sensory & Calm", slug: "baby-toddler", icon: "✨", desc: "Quiet Focus Toys", bg: "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-500/20" },
  ];

  return (
    <div className="space-y-12 sm:space-y-16 pb-16 bg-[var(--bg-primary)]">
      {/* 1. STITCH SENSORY HERO SHOWCASE */}
      <StitchHero />

      {/* 2. SHOP BY AGE GROUP */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--secondary)] uppercase tracking-wider mb-1">
              <span>🧸 Child Milestone Matching</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
              Shop by Child&apos;s Age Group
            </h2>
          </div>
          <Link
            href="/c/all"
            className="text-xs sm:text-sm font-bold text-[var(--primary)] hover:underline flex items-center gap-1"
          >
            <span>All Brackets</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {ageCategories.map((item) => (
            <Link
              key={item.query}
              href={`/c/all?age=${item.query}`}
              className="group p-4 sm:p-5 rounded-3xl bg-[var(--surface)] border border-[var(--border)] transition-all duration-200 card-sensory-lift flex flex-col items-center text-center cursor-pointer hover:border-[var(--primary)]/40 shadow-xs"
            >
              <div className="w-14 h-14 rounded-2xl bg-[var(--surface-container-low)] border border-[var(--border)] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform duration-300 shadow-2xs">
                {item.emoji}
              </div>
              <h3 className="font-heading font-black text-xs sm:text-sm text-[var(--text-primary)] mt-3">
                {item.label}
              </h3>
              <p className="text-[11px] text-[var(--text-muted)] mt-0.5 line-clamp-1 font-medium">{item.sub}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FLASH DEALS WITH LIVE FLIP COUNTDOWN */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-8 rounded-4xl bg-gradient-to-r from-rose-500/10 via-[var(--surface-container-low)] to-[var(--surface-sun)] border border-[var(--primary)]/20 shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-[var(--primary)] text-[var(--on-primary)] shadow-xs">
                <Flame className="w-6 h-6 fill-current animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-heading text-xl sm:text-2xl font-black text-[var(--text-primary)]">
                    Today&apos;s Flash Deals
                  </h2>
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-[var(--primary)] text-[var(--on-primary)] shadow-xs">
                    Limited Stock
                  </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] mt-0.5">
                  Save up to 35% on top rated toys. Pay via Cash on Delivery when courier arrives.
                </p>
              </div>
            </div>

            {/* Live Flip Countdown */}
            <div className="flex items-center gap-2 p-2 rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-xs">
              <Countdown label="Deals Expire in:" size="md" initialHours={8} initialMinutes={14} initialSeconds={30} />
            </div>
          </div>

          {/* Deal Products Grid */}
          <HomeProductsSection initialProducts={dealProducts} filterType="deals" limit={4} />
        </div>
      </section>

      {/* 4. CURATED CATEGORY GRID (8 BENTO TILES) */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--secondary)] uppercase tracking-wider mb-1">
              <span>Explore Wonder Collections</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
              Curated Toy Categories
            </h2>
          </div>
          <Link
            href="/c/all"
            className="text-xs sm:text-sm font-bold text-[var(--primary)] hover:underline flex items-center gap-1"
          >
            <span>View All Categories</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
          {curatedCategoryBento.map((item) => (
            <Link
              key={item.slug + item.name}
              href={`/c/${item.slug}`}
              className={`p-4 sm:p-5 rounded-3xl border transition-all duration-200 card-sensory-lift flex flex-col justify-between cursor-pointer ${item.bg}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-3xl">{item.icon}</span>
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/60 dark:bg-black/30">
                  {item.desc}
                </span>
              </div>
              <div className="mt-4">
                <h3 className="font-heading font-black text-sm sm:text-base tracking-tight leading-snug">
                  {item.name}
                </h3>
                <span className="text-[11px] font-bold opacity-80 inline-flex items-center gap-1 mt-1">
                  Explore <ArrowRight className="w-3 h-3" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. INTERACTIVE GIFT FINDER BANNER (30-SECOND WIZARD) */}
      <StitchGiftWizard />

      {/* 6. TABBED HOT LISTS (BEST SELLERS & NEW ARRIVALS) */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--secondary)] uppercase tracking-wider mb-1">
              <span>⭐ Parent Verified Favorites</span>
            </div>
            <h2 className="font-heading text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
              Trending Best Sellers
            </h2>
          </div>
          <Link
            href="/c/all?sort=bestselling"
            className="text-xs sm:text-sm font-bold text-[var(--primary)] hover:underline flex items-center gap-1"
          >
            <span>Browse Full Catalog</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <HomeProductsSection initialProducts={featuredProducts} filterType="featured" limit={8} />
      </section>

      {/* 7. STORE COMMITMENT & QUALITY STANDARDS (Confirmed Owner Trust Pillars) */}
      <section className="max-w-[1360px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-6 sm:p-10 rounded-4xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border)]">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[var(--primary)] uppercase tracking-wider mb-1">
                <ShieldCheck className="w-4 h-4" /> আমাদের প্রতিশ্রুতি / Store Commitment
              </div>
              <h2 className="font-heading text-2xl sm:text-3xl font-black text-[var(--text-primary)]">
                Our 4-Point Promise to Every Family
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-md">
              প্রতিটি খেলনা যাচাইকৃত ও আনন্দদায়ক। ডেলিভারির সময় দেখে নিয়ে গ্রহণ করার নিশ্চয়তা।
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="p-5 rounded-3xl bg-[var(--surface-container-low)] border border-[var(--border)] space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-[var(--primary)]/15 text-[var(--primary)] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="font-heading font-black text-sm text-[var(--text-primary)]">
                Inspect Before You Accept
              </h4>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                ডেলিভারি ম্যানের সামনেই খেলনাটি পরীক্ষা করুন। Check your toy at delivery before accepting.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-[var(--surface-container-low)] border border-[var(--border)] space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <RotateCcw className="w-5 h-5" />
              </div>
              <h4 className="font-heading font-black text-sm text-[var(--text-primary)]">
                Defective? We Refund
              </h4>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                ডেলিভারির সময় ত্রুটি ধরা পড়লে ফেরত ও রিফান্ড। Refund for defective products reported at delivery.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-[var(--surface-container-low)] border border-[var(--border)] space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Truck className="w-5 h-5" />
              </div>
              <h4 className="font-heading font-black text-sm text-[var(--text-primary)]">
                Cash on Delivery
              </h4>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                পণ্য হাতে পেয়ে টাকা দিন। Pay in cash when you receive your order.
              </p>
            </div>

            <div className="p-5 rounded-3xl bg-[var(--surface-container-low)] border border-[var(--border)] space-y-2">
              <div className="w-10 h-10 rounded-2xl bg-blue-500/15 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
              <h4 className="font-heading font-black text-sm text-[var(--text-primary)]">
                Order Support
              </h4>
              <p className="text-xs text-[var(--text-muted)] leading-relaxed">
                কল বা হোয়াটসঅ্যাপ: <strong>01712-039707</strong>. Real customer assistance anytime.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
