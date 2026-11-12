import Link from "next/link";
import Image from "next/image";
import { getProducts, getCategories } from "@/server/services/product-service";
import { ProductCard } from "@/components/store/product-card";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Sparkles,
  Flame,
  ArrowRight,
  Gift,
  Clock,
  ShieldCheck,
  Truck,
  RotateCcw,
  Star,
  ChevronRight,
} from "lucide-react";

export const revalidate = 300; // ISR cache 5 minutes

export default async function HomePage() {
  const [featuredData, dealsData, categories] = await Promise.all([
    getProducts({ limit: 8, sort: "bestselling" }),
    getProducts({ isDeal: true, limit: 4 }),
    getCategories(),
  ]);

  const featuredProducts = featuredData.products;
  const dealProducts = dealsData.products;

  const ageCategories = [
    { label: "0 – 12 Months", sub: "Sensory & Teething", query: "0-12m", color: "from-blue-500 to-indigo-600", emoji: "🍼" },
    { label: "1 – 2 Years", sub: "Montessori & Walkers", query: "1-2y", color: "from-amber-400 to-orange-500", emoji: "🧸" },
    { label: "3 – 4 Years", sub: "Pretend Play & Blocks", query: "3-4y", color: "from-emerald-400 to-teal-600", emoji: "🎨" },
    { label: "5 – 7 Years", sub: "STEM & Early Robotics", query: "5-7y", color: "from-purple-500 to-pink-600", emoji: "🚀" },
    { label: "8 – 11 Years", sub: "RC Vehicles & Puzzles", query: "8-11y", color: "from-cyan-500 to-blue-600", emoji: "🧩" },
    { label: "12+ Years", sub: "Complex Engineering", query: "12+", color: "from-rose-500 to-red-600", emoji: "🔬" },
  ];

  return (
    <div className="space-y-12 sm:space-y-16 pb-16">
      {/* 1. HERO SECTION WITH PROMO TILES */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
          {/* Main Hero Banner (Col 1-2) */}
          <div className="lg:col-span-2 relative min-h-[380px] sm:min-h-[460px] rounded-3xl overflow-hidden bg-gradient-to-br from-[#DC012B] via-[#E63946] to-[#F59E0B] text-white p-6 sm:p-12 flex flex-col justify-between shadow-lg">
            <div className="relative z-10 max-w-xl space-y-4">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold tracking-wide uppercase">
                <Sparkles className="w-3.5 h-3.5 text-[#F59E0B]" />
                Bangladesh's Trusted Online Toy Store
              </span>
              <h1 className="font-heading text-3xl sm:text-5xl font-black leading-tight tracking-tight">
                Where Pure Joy &amp; Curiosity Begin!
              </h1>
              <p className="text-sm sm:text-base text-rose-50 max-w-md">
                Certified safe toys, building blocks, STEM robotics kits, and snuggly plushies. Pay easily with{" "}
                <strong className="text-[#FBBF24]">Cash on Delivery</strong> nationwide.
              </p>
              <div className="pt-2 flex flex-wrap gap-3">
                <Link href="/c/building-blocks">
                  <Button variant="sun" size="lg" className="shadow-md bg-[#F59E0B] hover:bg-[#D97706] text-slate-900 font-extrabold">
                    <span>Shop Building Sets</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </Button>
                </Link>
                <Link href="/gift-finder">
                  <Button variant="secondary" size="lg" className="bg-white/95 text-[#18191F] hover:bg-white font-bold">
                    <span>Gift Finder Quiz</span>
                  </Button>
                </Link>
              </div>
            </div>

            {/* Subtle Delivery Badge in Hero */}
            <div className="relative z-10 flex items-center gap-2 pt-6 text-xs text-rose-100">
              <Truck className="w-4 h-4 text-[#10B981]" />
              <span>Fast 24–48 hour delivery inside Dhaka &bull; Nationwide Cash on Delivery</span>
            </div>

            {/* Background Decorative Graphic */}
            <div className="absolute right-0 bottom-0 top-0 w-2/5 opacity-15 pointer-events-none flex items-center justify-center">
              <Sparkles className="w-96 h-96 text-white" />
            </div>
          </div>

          {/* Right Stacked Promotional Tiles (Col 3) */}
          <div className="flex flex-col gap-4 sm:gap-6">
            {/* Promo 1: RC & Speed */}
            <div className="relative flex-1 min-h-[180px] rounded-3xl overflow-hidden bg-gradient-to-r from-amber-500 to-orange-600 text-white p-6 flex flex-col justify-between shadow-md">
              <div className="relative z-10">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-200">
                  Speed &amp; Stunts
                </span>
                <h3 className="font-heading font-black text-xl mt-1">4WD Monster RC Buggies</h3>
                <p className="text-xs text-amber-100 mt-1">Up to 25 km/h all-terrain action.</p>
              </div>
              <div className="relative z-10 pt-2">
                <Link href="/c/rc-vehicles">
                  <span className="inline-flex items-center gap-1 text-xs font-bold bg-white text-orange-600 px-3 py-1.5 rounded-full hover:bg-amber-100 transition-colors">
                    Explore RC Cars <ChevronRight className="w-3 h-3" />
                  </span>
                </Link>
              </div>
            </div>

            {/* Promo 2: STEM Robotics */}
            <div className="relative flex-1 min-h-[180px] rounded-3xl overflow-hidden bg-gradient-to-r from-emerald-600 to-teal-700 text-white p-6 flex flex-col justify-between shadow-md">
              <div className="relative z-10">
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-teal-200">
                  Young Scientists
                </span>
                <h3 className="font-heading font-black text-xl mt-1">Solar &amp; Coding Kits</h3>
                <p className="text-xs text-teal-100 mt-1">Zero batteries. 100% engineering.</p>
              </div>
              <div className="relative z-10 pt-2">
                <Link href="/c/stem-science">
                  <span className="inline-flex items-center gap-1 text-xs font-bold bg-white text-emerald-700 px-3 py-1.5 rounded-full hover:bg-teal-100 transition-colors">
                    Discover STEM <ChevronRight className="w-3 h-3" />
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. SHOP BY AGE */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-heading text-2xl sm:text-3xl font-black text-[#18191F] dark:text-white">
              Shop by Child's Age
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Find developmentally appropriate, safety-certified toys tailored to each stage.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
          {ageCategories.map((item) => (
            <Link
              key={item.query}
              href={`/c/all?age=${item.query}`}
              className="group p-4 rounded-2xl bg-white dark:bg-[#161D33] border border-[#E8E2DE] dark:border-[#263050] hover:border-[#DC012B] transition-all duration-200 hover:-translate-y-1 hover:shadow-md flex flex-col items-center text-center cursor-pointer"
            >
              <div className="w-14 h-14 rounded-2xl bg-[#F7F9FC] dark:bg-[#1E2742] flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                {item.emoji}
              </div>
              <h3 className="font-heading font-bold text-xs sm:text-sm text-[#18191F] dark:text-white mt-3">
                {item.label}
              </h3>
              <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{item.sub}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* 3. FLASH DEALS WITH COUNTDOWN URGENCY */}
      {dealProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-[#FFF0F0] to-[#FFF8E6] dark:from-[#2B1010] dark:to-[#2B230B] border border-[#FF6B6B]/30 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-[#FF6B6B] text-white animate-bounce">
                  <Flame className="w-6 h-6 fill-current" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="font-heading text-xl sm:text-2xl font-black text-[#18191F] dark:text-white">
                      Today's Flash Deals
                    </h2>
                    <span className="text-xs font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#FF6B6B] text-white">
                      Limited Stock
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">
                    Save up to 35% on top rated toys. Pay via Cash on Delivery when courier arrives.
                  </p>
                </div>
              </div>

              {/* Urgency Badge */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-[#161D33] border border-[#FF6B6B]/20 text-xs font-bold text-[#FF6B6B] shadow-xs shrink-0">
                <Clock className="w-4 h-4 animate-spin text-[#FF6B6B]" />
                <span>Ends in 14h 22m</span>
              </div>
            </div>

            {/* Deal Products Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {dealProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. SHOP BY CATEGORY */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-heading text-2xl sm:text-3xl font-black text-[#18191F] dark:text-white">
              Explore Popular Categories
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Browse our diverse collection of imaginative and learning play categories.
            </p>
          </div>
          <Link
            href="/c/all"
            className="text-xs sm:text-sm font-bold text-[#DC012B] hover:underline flex items-center gap-1"
          >
            <span>View All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {categories.slice(0, 10).map((cat) => (
            <Link
              key={cat.slug}
              href={`/c/${cat.slug}`}
              className="group relative rounded-2xl overflow-hidden bg-white dark:bg-[#161D33] border border-[#E8E2DE] dark:border-[#263050] hover:border-[#DC012B] transition-all hover:shadow-md flex flex-col"
            >
              <div className="relative aspect-4/3 w-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                <Image
                  src={cat.image}
                  alt={cat.name}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                  sizes="240px"
                />
              </div>
              <div className="p-3 text-center">
                <h3 className="font-heading font-bold text-xs sm:text-sm text-[#18191F] dark:text-white line-clamp-1 group-hover:text-[#DC012B] transition-colors">
                  {cat.name}
                </h3>
                <span className="text-[11px] text-slate-400 font-medium">
                  {cat.itemCount || 10}+ Toys
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 5. GIFT FINDER QUIZ CTA BANNER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-r from-[#7B5CFA] via-[#6343E0] to-[#DC012B] text-white p-8 sm:p-12 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-3 max-w-xl text-center sm:text-left">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-xs font-bold">
              <Gift className="w-3.5 h-3.5 text-[#FFC93C]" /> Interactive Gift Assistant
            </span>
            <h2 className="font-heading text-2xl sm:text-4xl font-black">
              Not Sure What to Buy? Answer 3 Simple Questions!
            </h2>
            <p className="text-xs sm:text-sm text-purple-100">
              Our smart Gift Finder algorithm matches age, developmental milestones, and budget in under 30 seconds.
            </p>
          </div>
          <Link href="/gift-finder" className="shrink-0">
            <Button variant="sun" size="lg" className="text-sm font-extrabold shadow-lg px-8">
              <span>Start Gift Finder</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </Link>
        </div>
      </section>

      {/* 6. FEATURED BEST SELLERS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-heading text-2xl sm:text-3xl font-black text-[#18191F] dark:text-white">
              Trending Best Sellers
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Loved by thousands of happy kids and trusted by parents across Bangladesh.
            </p>
          </div>
          <Link
            href="/c/all?sort=bestselling"
            className="text-xs sm:text-sm font-bold text-[#DC012B] hover:underline flex items-center gap-1"
          >
            <span>See All</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {featuredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      </section>

      {/* 7. BUDGET PICKS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="font-heading text-2xl sm:text-3xl font-black text-[#18191F] dark:text-white">
            Shop by Budget
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Joyful surprises for every pocket, backed by our Cash on Delivery guarantee.
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <Link
            href="/c/all?maxPrice=1000"
            className="p-6 rounded-2xl bg-white dark:bg-[#161D33] border border-[#E8E2DE] dark:border-[#263050] hover:border-[#DC012B] transition-all text-center hover:shadow-md group"
          >
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Pocket Friendly</span>
            <h3 className="font-heading font-black text-xl sm:text-2xl text-[#18191F] dark:text-white mt-1 group-hover:text-[#DC012B]">
              Under ৳1,000
            </h3>
            <span className="text-xs text-[#DC012B] font-semibold mt-2 inline-block">Browse Toys &rarr;</span>
          </Link>

          <Link
            href="/c/all?minPrice=1000&maxPrice=2000"
            className="p-6 rounded-2xl bg-white dark:bg-[#161D33] border border-[#E8E2DE] dark:border-[#263050] hover:border-[#DC012B] transition-all text-center hover:shadow-md group"
          >
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Popular Range</span>
            <h3 className="font-heading font-black text-xl sm:text-2xl text-[#18191F] dark:text-white mt-1 group-hover:text-[#DC012B]">
              ৳1,000 – ৳2,000
            </h3>
            <span className="text-xs text-[#DC012B] font-semibold mt-2 inline-block">Browse Toys &rarr;</span>
          </Link>

          <Link
            href="/c/all?minPrice=2000&maxPrice=3500"
            className="p-6 rounded-2xl bg-white dark:bg-[#161D33] border border-[#E8E2DE] dark:border-[#263050] hover:border-[#DC012B] transition-all text-center hover:shadow-md group"
          >
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Free Delivery Tier</span>
            <h3 className="font-heading font-black text-xl sm:text-2xl text-[#18191F] dark:text-white mt-1 group-hover:text-[#DC012B]">
              ৳2,000 – ৳3,500
            </h3>
            <span className="text-xs text-[#DC012B] font-semibold mt-2 inline-block">Browse Toys &rarr;</span>
          </Link>

          <Link
            href="/c/all?minPrice=3500"
            className="p-6 rounded-2xl bg-white dark:bg-[#161D33] border border-[#E8E2DE] dark:border-[#263050] hover:border-[#DC012B] transition-all text-center hover:shadow-md group"
          >
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Collector &amp; Deluxe</span>
            <h3 className="font-heading font-black text-xl sm:text-2xl text-[#18191F] dark:text-white mt-1 group-hover:text-[#DC012B]">
              Above ৳3,500
            </h3>
            <span className="text-xs text-[#DC012B] font-semibold mt-2 inline-block">Browse Toys &rarr;</span>
          </Link>
        </div>
      </section>

      {/* 8. CUSTOMER LOVE / VERIFIED REVIEWS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-xl mx-auto mb-8">
          <h2 className="font-heading text-2xl sm:text-3xl font-black text-[#18191F] dark:text-white">
            Loved by Parents, Adored by Kids
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real feedback from verified Cash on Delivery buyers across Dhaka, Chittagong, Sylhet and nationwide.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-[#161D33] border border-[#E8E2DE] dark:border-[#263050] shadow-xs space-y-3">
            <div className="flex items-center text-[#FFC93C]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 italic">
              "Ordered the Space Explorer rocket set for my 7-year-old. The courier arrived in Banani the very next day.
              The blocks click firmly together just like authentic Lego. Very safe, no sharp edges!"
            </p>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="font-bold text-xs text-[#18191F] dark:text-white block">Dr. Farhana Islam</span>
              <span className="text-[11px] text-emerald-600 font-medium">Verified Purchase &bull; Dhaka</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#161D33] border border-[#E8E2DE] dark:border-[#263050] shadow-xs space-y-3">
            <div className="flex items-center text-[#FFC93C]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 italic">
              "Being able to inspect the package before giving cash to the courier gives complete peace of mind.
              The 4WD RC Buggy is lightning fast! Best online toy shop experience in BD."
            </p>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="font-bold text-xs text-[#18191F] dark:text-white block">Rashidul Karim</span>
              <span className="text-[11px] text-emerald-600 font-medium">Verified Purchase &bull; Chittagong</span>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-white dark:bg-[#161D33] border border-[#E8E2DE] dark:border-[#263050] shadow-xs space-y-3">
            <div className="flex items-center text-[#FFC93C]">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-current" />
              ))}
            </div>
            <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 italic">
              "The Montessori sensory wooden cube is top notch beechwood. Smooth, zero chemical smell, and our 14-month-old
              plays with it for hours. Highly recommended for toddler parents!"
            </p>
            <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
              <span className="font-bold text-xs text-[#18191F] dark:text-white block">Nusrat Jahan</span>
              <span className="text-[11px] text-emerald-600 font-medium">Verified Purchase &bull; Uttara</span>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
