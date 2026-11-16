"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Gift, Sparkles, ArrowRight } from "lucide-react";

export function StitchGiftWizard() {
  const router = useRouter();
  const [selectedAge, setSelectedAge] = useState("3-4y");
  const [selectedBudget, setSelectedBudget] = useState("1000-2500");
  const [selectedInterest, setSelectedInterest] = useState("stem");

  const handleFindToys = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/c/all?age=${encodeURIComponent(selectedAge)}&interest=${encodeURIComponent(selectedInterest)}`);
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
              <span>30-Second Magical Gift Matcher</span>
            </div>

            <h2 className="text-2xl sm:text-4xl font-black font-heading text-[var(--text-primary)] tracking-tight">
              Not Sure What to Pick? <br />
              <span className="text-[var(--primary)]">Let Our Toy Elves Guide You!</span>
            </h2>

            <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed max-w-md">
              Answer 3 quick questions about the lucky boy or girl, and we&apos;ll curate the safest, developmentally-matched toys with doorstep Cash on Delivery.
            </p>
          </div>

          {/* Interactive Form Column */}
          <form
            onSubmit={handleFindToys}
            className="lg:col-span-7 bg-[var(--surface)] p-6 sm:p-8 rounded-3xl border border-[var(--border)] shadow-lg space-y-6"
          >
            {/* Step 1: Age */}
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider text-[var(--text-primary)]">
                1. Recipient&apos;s Age Stage
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: "0-12m (Baby)", value: "0-12m", icon: "🍼" },
                  { label: "1-2y (Toddler)", value: "1-2y", icon: "🧸" },
                  { label: "3-5y (Preschool)", value: "3-4y", icon: "🎨" },
                  { label: "6+ Yrs (Big Kid)", value: "5-7y", icon: "🚀" },
                ].map((item) => (
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
                2. Target Budget
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Under ৳1,000", value: "under-1000" },
                  { label: "৳1,000 – ৳2,500", value: "1000-2500" },
                  { label: "Above ৳2,500", value: "above-2500" },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setSelectedBudget(item.value)}
                    className={`py-2 px-3 rounded-2xl border text-xs font-bold text-center transition-all cursor-pointer ${
                      selectedBudget === item.value
                        ? "bg-[var(--secondary-container)] text-[var(--on-secondary-fixed)] border-[var(--secondary-container)] shadow-xs font-black"
                        : "bg-[var(--surface-container-low)] text-[var(--text-primary)] border-[var(--border)] hover:bg-[var(--surface-container-high)]"
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 3: Spark Interest */}
            <div className="space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider text-[var(--text-primary)]">
                3. Spark Interest &amp; Play Style
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {[
                  { label: "STEM & Robotics", value: "stem", icon: "🔬" },
                  { label: "Arts & Creativity", value: "creative", icon: "🎨" },
                  { label: "RC & Speed", value: "rc", icon: "🏎️" },
                  { label: "Sensory & Soft", value: "sensory", icon: "🧸" },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    onClick={() => setSelectedInterest(item.value)}
                    className={`p-2.5 rounded-2xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      selectedInterest === item.value
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
                <span>Find Matched Wonder Toys</span>
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
