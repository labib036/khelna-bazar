"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, Truck, ChevronLeft, ChevronRight, Pause, Play, ShieldCheck, Zap } from "lucide-react";

interface HeroSlide {
  badge: string;
  title: string;
  subtitle: string;
  ctaText: string;
  ctaLink: string;
  bgGradient: string;
  fallbackBg: string;
  accent: string;
}

const SLIDES: HeroSlide[] = [
  {
    badge: "Bangladesh's Trusted Toy Marketplace",
    title: "Where Pure Joy & Curiosity Begin!",
    subtitle:
      "Building blocks, STEM robotics kits, and engaging learning toys. Reliable Cash on Delivery with doorstep inspection.",
    ctaText: "Shop Building Sets",
    ctaLink: "/c/building-blocks",
    bgGradient: "linear-gradient(135deg, #7C2D12 0%, #C2410C 35%, #EA580C 70%, #D97706 100%)",
    fallbackBg: "#C2410C",
    accent: "Cash on Delivery",
  },
  {
    badge: "Next-Gen STEM & Robotics",
    title: "Build, Code & Explore Hands-On!",
    subtitle:
      "Eco-friendly solar rover kits, coding robots, and physics experiments tailored for curious young minds.",
    ctaText: "Explore STEM Kits",
    ctaLink: "/c/stem-science",
    bgGradient: "linear-gradient(135deg, #075985 0%, #0284C7 35%, #2563EB 70%, #0D9488 100%)",
    fallbackBg: "#0284C7",
    accent: "STEM Approved",
  },
  {
    badge: "High-Speed Adrenaline",
    title: "4WD Monster RC Buggies & Stunts!",
    subtitle:
      "Water-resistant all-terrain radio control cars with rechargeable battery packs and 25 km/h top speeds.",
    ctaText: "Discover RC Toys",
    ctaLink: "/c/rc-vehicles",
    bgGradient: "linear-gradient(135deg, #9A3412 0%, #D97706 35%, #EA580C 70%, #BE123C 100%)",
    fallbackBg: "#D97706",
    accent: "Ready-to-Run",
  },
];

const SLIDE_DURATION = 6000;

export function HomeHeroSlider() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    setCurrent((prev) => (prev + 1) % SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setCurrent((prev) => (prev - 1 + SLIDES.length) % SLIDES.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      nextSlide();
    }, SLIDE_DURATION);
    return () => clearInterval(timer);
  }, [isPaused, nextSlide]);

  // Touch Swipe Handlers
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    if (touchStartX.current === null || touchEndX.current === null) return;
    const diff = touchStartX.current - touchEndX.current;
    if (Math.abs(diff) > 50) {
      if (diff > 0) nextSlide();
      else prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const slide = SLIDES[current];

  return (
    <div
      className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
    >
      {/* Main Hero Banner with Slider (Col 1-2) */}
      <div
        className="lg:col-span-2 relative min-h-[420px] sm:min-h-[480px] rounded-3xl overflow-hidden text-white p-6 sm:p-12 flex flex-col justify-between shadow-xl transition-all duration-700"
        style={{
          background: slide.bgGradient,
          backgroundColor: slide.fallbackBg,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {/* Background Mesh Overlay & Decorative Toy Shapes */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.22),transparent_70%)] pointer-events-none" />
        <div className="absolute -right-8 -bottom-8 w-72 h-72 sm:w-96 sm:h-96 rounded-full bg-white/10 blur-2xl pointer-events-none" />
        <div className="absolute top-1/4 right-8 opacity-20 pointer-events-none animate-pulse-subtle">
          <Sparkles className="w-48 h-48 sm:w-64 sm:h-64 text-white" />
        </div>

        {/* Slide Content */}
        <div className="relative z-10 max-w-xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/40 backdrop-blur-md text-xs font-black tracking-wide uppercase text-amber-200 border border-white/20 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-amber-300 fill-amber-300" />
            <span className="text-amber-200 font-black">{slide.badge}</span>
          </div>

          <h1 className="font-heading text-3xl sm:text-5xl font-black leading-tight tracking-tight text-white drop-shadow-[0_2px_4px_rgba(0,0,0,0.4)]">
            {slide.title}
          </h1>

          <p className="text-sm sm:text-base text-white/95 font-medium max-w-md leading-relaxed drop-shadow-[0_1px_2px_rgba(0,0,0,0.3)]">
            {slide.subtitle}
          </p>

          <div className="pt-3 flex flex-wrap items-center gap-3">
            <Link href={slide.ctaLink}>
              <button
                type="button"
                className="h-12 min-h-[44px] px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 active:scale-95 text-stone-950 font-black text-sm sm:text-base shadow-lg border border-amber-300 inline-flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span className="text-stone-950 font-black">{slide.ctaText}</span>
                <ArrowRight className="w-4 h-4 ml-0.5 text-stone-950 stroke-[2.5]" />
              </button>
            </Link>
            <Link href="/gift-finder">
              <button
                type="button"
                className="h-12 min-h-[44px] px-6 py-3 rounded-2xl bg-white hover:bg-amber-50 active:scale-95 text-stone-950 font-black text-sm sm:text-base shadow-lg border-2 border-white inline-flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <Sparkles className="w-4 h-4 text-amber-500 fill-amber-400" />
                <span className="text-stone-950 font-black">Gift Finder Quiz</span>
              </button>
            </Link>
          </div>
        </div>

        {/* Footer info & interactive slide progress */}
        <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-6 border-t border-white/20 text-xs text-white font-medium">
          <div className="flex items-center gap-2 text-white">
            <Truck className="w-4 h-4 text-amber-300 shrink-0" />
            <span className="text-white drop-shadow-xs font-semibold">
              24–48h delivery inside Dhaka &bull; Cash on Delivery nationwide
            </span>
          </div>

          <div className="flex items-center gap-2 self-end sm:self-auto">
            {/* Play/Pause Toggle */}
            <button
              type="button"
              onClick={() => setIsPaused(!isPaused)}
              className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center cursor-pointer transition-colors border border-white/20"
              aria-label={isPaused ? "Resume autoplay" : "Pause autoplay"}
            >
              {isPaused ? <Play className="w-3.5 h-3.5 fill-white text-white" /> : <Pause className="w-3.5 h-3.5 fill-white text-white" />}
            </button>

            {/* Prev / Next buttons */}
            <button
              type="button"
              onClick={prevSlide}
              className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center cursor-pointer transition-colors border border-white/20"
              aria-label="Previous banner"
            >
              <ChevronLeft className="w-4 h-4 text-white" />
            </button>

            {/* Slide Indicators */}
            <div className="flex items-center gap-1.5 px-2 py-1 bg-black/40 rounded-full border border-white/20">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setCurrent(i)}
                  className={`relative h-2 rounded-full transition-all cursor-pointer overflow-hidden ${
                    current === i ? "w-6 bg-white" : "w-2 bg-white/40 hover:bg-white/70"
                  }`}
                  aria-label={`Jump to slide ${i + 1}`}
                >
                  {current === i && (
                    <div
                      className="absolute inset-y-0 left-0 bg-amber-400 rounded-full transition-all"
                      style={{
                        animation: isPaused ? "none" : `shimmer ${SLIDE_DURATION}ms linear`,
                        width: "100%",
                      }}
                    />
                  )}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={nextSlide}
              className="w-8 h-8 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center cursor-pointer transition-colors border border-white/20"
              aria-label="Next banner"
            >
              <ChevronRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Right Stacked Promotional Tiles (Col 3) */}
      <div className="flex flex-col gap-4 sm:gap-6">
        {/* Promo 1: RC & Speed */}
        <div
          className="relative flex-1 min-h-[190px] rounded-3xl overflow-hidden text-white p-6 flex flex-col justify-between shadow-md group"
          style={{
            background: "linear-gradient(135deg, #B45309 0%, #EA580C 50%, #C2410C 100%)",
            backgroundColor: "#EA580C",
          }}
        >
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest text-amber-200 bg-black/30 px-2.5 py-1 rounded-full border border-white/10">
              <Zap className="w-3 h-3 text-amber-300" /> Speed &amp; Stunts
            </span>
            <h3 className="font-heading font-black text-xl mt-2 leading-tight text-white drop-shadow-sm">4WD Monster RC Buggies</h3>
            <p className="text-xs text-amber-100 mt-1 font-medium">Up to 25 km/h all-terrain action.</p>
          </div>
          <div className="relative z-10 pt-3">
            <Link href="/c/rc-vehicles">
              <span className="inline-flex items-center gap-1.5 text-xs font-black bg-white text-stone-950 px-4 py-2 rounded-full hover:bg-amber-50 transition-transform group-hover:translate-x-1 shadow-md cursor-pointer">
                <span className="text-orange-700 font-black">Explore RC Cars</span>
                <ArrowRight className="w-3.5 h-3.5 text-orange-700 stroke-[2.5]" />
              </span>
            </Link>
          </div>
        </div>

        {/* Promo 2: STEM Robotics */}
        <div
          className="relative flex-1 min-h-[190px] rounded-3xl overflow-hidden text-white p-6 flex flex-col justify-between shadow-md group"
          style={{
            background: "linear-gradient(135deg, #047857 0%, #0D9488 50%, #0369A1 100%)",
            backgroundColor: "#0D9488",
          }}
        >
          <div className="relative z-10">
            <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase tracking-widest text-teal-200 bg-black/30 px-2.5 py-1 rounded-full border border-white/10">
              <ShieldCheck className="w-3 h-3 text-emerald-300" /> Young Scientists
            </span>
            <h3 className="font-heading font-black text-xl mt-2 leading-tight text-white drop-shadow-sm">Solar &amp; Coding Kits</h3>
            <p className="text-xs text-teal-100 mt-1 font-medium">Zero batteries required. 100% engineering.</p>
          </div>
          <div className="relative z-10 pt-3">
            <Link href="/c/stem-science">
              <span className="inline-flex items-center gap-1.5 text-xs font-black bg-white text-stone-950 px-4 py-2 rounded-full hover:bg-teal-50 transition-transform group-hover:translate-x-1 shadow-md cursor-pointer">
                <span className="text-teal-800 font-black">Discover STEM</span>
                <ArrowRight className="w-3.5 h-3.5 text-teal-800 stroke-[2.5]" />
              </span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
