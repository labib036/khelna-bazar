"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Gift, Sparkles, ArrowRight } from "lucide-react";
import { useLanguage } from "@/lib/i18n";

export function StitchGiftWizard() {
  const router = useRouter();
  const { language } = useLanguage();
  const isBn = language === "bn";

  const [selectedAge, setSelectedAge] = useState("3-4y");
  const [selectedBudget, setSelectedBudget] = useState("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

  const ageBands = [
    { label: isBn ? "০-১২ মাস" : "0–12 Months", value: "0-12m", icon: "🍼" },
    { label: isBn ? "১-২ বছর" : "1–2 Years", value: "1-2y", icon: "🧸" },
    { label: isBn ? "৩-৪ বছর" : "3–4 Years", value: "3-4y", icon: "🎨" },
    { label: isBn ? "৫-৭ বছর" : "5–7 Years", value: "5-7y", icon: "🚀" },
    { label: isBn ? "৮-১১ বছর" : "8–11 Years", value: "8-11y", icon: "🧩" },
    { label: isBn ? "১২+ বছর" : "12+ Years", value: "12+", icon: "🔬" },
  ];

  const budgetOptions = [
    { label: isBn ? "সকল বাজেট" : "All Budgets", value: "all" },
    { label: isBn ? "১,০০০ টাকার নিচে" : "Under ৳1,000", value: "under-1000" },
    { label: isBn ? "৳১,০০০ – ৳২,৫০০" : "৳1,000 – ৳2,500", value: "1000-2500" },
    { label: isBn ? "৳২,৫০০ এর উপরে" : "Above ৳2,500", value: "above-2500" },
  ];

  const categoryOptions = [
    { label: isBn ? "সকল খেলনা" : "All Categories", value: "all", icon: "✨" },
    { label: isBn ? "রোবটিক্স ও স্টেম" : "STEM & Robotics", value: "stem-robotics", icon: "🔬" },
    { label: isBn ? "বিল্ডিং ব্লক" : "Building Blocks", value: "building-blocks", icon: "🧱" },
    { label: isBn ? "বোর্ড গেম ও পাজল" : "Board Games", value: "board-games-puzzles", icon: "🧩" },
    { label: isBn ? "রিমোট কন্ট্রোল" : "RC Vehicles", value: "rc-vehicles", icon: "🏎️" },
    { label: isBn ? "আর্ট ও ক্রাফট" : "Arts & Crafts", value: "arts-crafts", icon: "🎨" },
  ];

  const handleFindToys = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (selectedAge) params.set("age", selectedAge);

    if (selectedBudget === "under-1000") {
      params.set("maxPrice", "1000");
    } else if (selectedBudget === "1000-2500") {
      params.set("minPrice", "1000");
      params.set("maxPrice", "2500");
    } else if (selectedBudget === "above-2500") {
      params.set("minPrice", "2500");
    }

    if (selectedCategory && selectedCategory !== "all") {
      router.push(`/c/${encodeURIComponent(selectedCategory)}?${params.toString()}`);
    } else {
      router.push(`/c/all?${params.toString()}`);
    }
  };

  return (
    <section id="gift-wizard-banner" className="relative w-full overflow-hidden px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
      <div className="max-w-[1360px] mx-auto relative rounded-4xl bg-gradient-to-br from-[var(--surface-container-high)] via-[var(--surface-peach)] to-[var(--surface-sun)] border border-[var(--border)] p-6 sm:p-10 lg:p-12 shadow-md overflow-hidden">
        {/* Floating Decorative Auras */}
        <div className="absolute -top-12 -right-12 w-80 h-80 bg-[var(--secondary-container)]/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-12 w-80 h-80 bg-[var(--primary)]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Header Column */}
          <div className="lg:col-span-5 space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--surface)] text-[var(--primary)] text-xs font-black shadow-xs border border-[var(--primary)]/15">
              <Gift className="w-3.5 h-3.5" />
              <span>{isBn ? "সহজ গিফট ফাইন্ডার" : "Quick Gift Finder"}</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black font-heading text-[var(--text-primary)] tracking-tight">
              {isBn ? (
                <>
                  সঠিক খেলনাটি বেছে নিতে <br />
                  <span className="text-[var(--primary)]">আমাদের গাইড সাহায্য করবে</span>
                </>
              ) : (
                <>
                  Find the Right Toy <br />
                  <span className="text-[var(--primary)]">By Age &amp; Category</span>
                </>
              )}
            </h2>

            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed max-w-md">
              {isBn
                ? "শিশুর বয়স এবং আপনার পছন্দের ধরন নির্বাচন করুন। ডেলিভারির সময় দেখে নেওয়ার সুবিধা সহ নির্ভরযোগ্য ক্যাশ অন ডেলিভারি।"
                : "Select the child's age group and category preferences. Doorstep Cash on Delivery with inspect-before-accept assurance."}
            </p>
          </div>

          {/* Interactive Form Column */}
          <form
            onSubmit={handleFindToys}
            className="lg:col-span-7 bg-[var(--surface)] p-6 sm:p-8 rounded-3xl border border-[var(--border)] shadow-lg space-y-6"
          >
            {/* Step 1: Approved 6 Age Bands */}
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider text-[var(--text-primary)]">
                {isBn ? "১. শিশুর বয়স নির্ধারণ করুন" : "1. Child's Age Group"}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {ageBands.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setSelectedAge(item.value)}
                    className={`p-2.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      selectedAge === item.value
                        ? "bg-[var(--primary)] text-[var(--on-primary)] border-[var(--primary)] shadow-xs font-black"
                        : "bg-[var(--surface-container-low)] text-[var(--text-primary)] border-[var(--border)] hover:bg-[var(--surface-container-high)]"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Budget */}
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider text-[var(--text-primary)]">
                {isBn ? "২. বাজেট নির্বাচন করুন" : "2. Target Budget"}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {budgetOptions.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setSelectedBudget(item.value)}
                    className={`py-2 px-2.5 rounded-2xl border text-xs font-bold text-center transition-all cursor-pointer ${
                      selectedBudget === item.value
                        ? "bg-[var(--secondary-container)] text-[var(--on-secondary-fixed)] border-[var(--secondary-container)] shadow-xs font-black"
                        : "bg-[var(--surface-container-low)] text-[var(--text-primary)] border-[var(--border)] hover:bg-[var(--surface-container-high)]"
                    }`}
                  >
                    <span className="truncate block">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Category */}
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider text-[var(--text-primary)]">
                {isBn ? "৩. ক্যাটাগরি পছন্দ করুন" : "3. Toy Category"}
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {categoryOptions.map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setSelectedCategory(item.value)}
                    className={`p-2.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      selectedCategory === item.value
                        ? "bg-[var(--accent)] text-[var(--on-accent)] border-[var(--accent)] shadow-xs font-black"
                        : "bg-[var(--surface-container-low)] text-[var(--text-primary)] border-[var(--border)] hover:bg-[var(--surface-container-high)]"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span className="truncate">{item.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Step 4: Submit CTA */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-4 rounded-full bg-[var(--primary)] text-[var(--on-primary)] hover:bg-[var(--primary-hover)] font-bold text-sm shadow-[0_4px_0_#93000E] active:translate-y-[2px] active:shadow-[0_2px_0_#93000E] transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{isBn ? "পছন্দের খেলনাগুলো দেখুন" : "Find Matched Toys"}</span>
                <Sparkles className="w-4 h-4 text-[var(--secondary-container)]" />
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </form>
        </div>
      </div>
    </section>
  );
}
