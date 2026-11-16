"use client";

import { useState, useMemo } from "react";
import type { ToyProduct } from "@/types/store";
import { ProductCard } from "@/components/store/product-card";
import { Button } from "@/components/ui/button";
import {
  Gift,
  Sparkles,
  RotateCcw,
  Check,
  ChevronRight,
} from "lucide-react";

interface GiftFinderClientProps {
  products: ToyProduct[];
}

export function GiftFinderClient({ products }: GiftFinderClientProps) {
  const [step, setStep] = useState(1);
  const [targetRecipient, setTargetRecipient] = useState<string>("any");
  const [targetAge, setTargetAge] = useState<string>("5-7y");
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["building"]);
  const [targetBudget, setTargetBudget] = useState<number>(3000);
  const [showResults, setShowResults] = useState(false);

  const interestOptions = [
    { id: "building", label: "Building & Bricks", emoji: "🧱", categoryMatch: "building-blocks" },
    { id: "stem", label: "Robotics & Science", emoji: "🔬", categoryMatch: "stem-science" },
    { id: "rc", label: "RC Cars & Speed", emoji: "🏎️", categoryMatch: "rc-vehicles" },
    { id: "plush", label: "Plush & Soft Cuddles", emoji: "🧸", categoryMatch: "plush-toys" },
    { id: "montessori", label: "Sensory & Toddler", emoji: "🍼", categoryMatch: "baby-toddler" },
  ];

  const handleInterestToggle = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const resetQuiz = () => {
    setStep(1);
    setShowResults(false);
  };

  // Scored matching algorithm
  const matchedProducts = useMemo(() => {
    return products
      .map((p) => {
        let score = 0;

        // Budget match (within budget gets points)
        if (p.basePrice <= targetBudget) score += 40;
        else if (p.basePrice <= targetBudget * 1.25) score += 20;

        // Age match
        if (targetAge === "0-12m" && p.minAgeMonths <= 12) score += 30;
        else if (targetAge === "1-2y" && p.minAgeMonths <= 24 && p.maxAgeMonths >= 12) score += 30;
        else if (targetAge === "3-4y" && p.minAgeMonths <= 48 && p.maxAgeMonths >= 36) score += 30;
        else if (targetAge === "5-7y" && p.minAgeMonths <= 84 && p.maxAgeMonths >= 60) score += 30;
        else if (targetAge === "8-11y" && p.minAgeMonths <= 132 && p.maxAgeMonths >= 96) score += 30;
        else if (targetAge === "12+" && p.minAgeMonths >= 120) score += 30;

        // Interest category match
        for (const int of selectedInterests) {
          const opt = interestOptions.find((o) => o.id === int);
          if (opt && p.categorySlug?.includes(opt.categoryMatch)) score += 30;
        }

        // Bestseller boost
        if (p.isFeatured) score += 10;

        return { product: p, score };
      })
      .sort((a, b) => b.score - a.score)
      .map((item) => item.product)
      .slice(0, 8);
  }, [products, targetBudget, targetAge, selectedInterests, interestOptions]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Quiz Banner Header */}
      <div className="text-center space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] text-xs font-bold uppercase tracking-wider">
          <Gift className="w-3.5 h-3.5" /> Interactive Toy Gift Matcher
        </span>
        <h1 className="font-heading text-3xl sm:text-5xl font-black text-[var(--text-primary)]">
          Find the Perfect Gift in 30 Seconds
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)] max-w-lg mx-auto">
          Whether it&apos;s a birthday, celebration, or developmental milestone, our smart quiz curates the best
          safe toys for your child.
        </p>
      </div>

      {!showResults ? (
        <div className="bg-[var(--surface-elevated)] p-6 sm:p-10 rounded-3xl border border-[var(--border)] shadow-md space-y-8">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between text-xs font-bold text-[var(--text-muted)] pb-4 border-b border-[var(--border)]">
            <span>Question {step} of 4</span>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`w-6 sm:w-10 h-2 rounded-full transition-all ${
                    s <= step ? "bg-[var(--primary)]" : "bg-[var(--surface)] border border-[var(--border)]"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* STEP 1: Recipient */}
          {step === 1 && (
            <div className="space-y-6">
              <h2 className="font-heading font-black text-xl text-[var(--text-primary)] text-center">
                Who are you shopping for?
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { id: "boy", label: "Boy", icon: "👦" },
                  { id: "girl", label: "Girl", icon: "👧" },
                  { id: "baby", label: "Baby / Toddler", icon: "👶" },
                  { id: "any", label: "Any Child", icon: "✨" },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setTargetRecipient(item.id)}
                    className={`p-6 rounded-3xl border-2 flex flex-col items-center gap-3 transition-all cursor-pointer ${
                      targetRecipient === item.id
                        ? "border-[var(--primary)] bg-[var(--primary)]/10 shadow-sm scale-105"
                        : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--text-muted)]"
                    }`}
                  >
                    <span className="text-4xl">{item.icon}</span>
                    <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)]">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Age */}
          {step === 2 && (
            <div className="space-y-6">
              <h2 className="font-heading font-black text-xl text-[var(--text-primary)] text-center">
                How old is the child?
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {[
                  { id: "0-12m", label: "0 – 12 Months", sub: "Baby / Sensory" },
                  { id: "1-2y", label: "1 – 2 Years", sub: "Toddler / Walker" },
                  { id: "3-4y", label: "3 – 4 Years", sub: "Preschooler" },
                  { id: "5-7y", label: "5 – 7 Years", sub: "Primary School" },
                  { id: "8-11y", label: "8 – 11 Years", sub: "Pre-Teen Explorer" },
                  { id: "12+", label: "12+ Years", sub: "Teen / Engineering" },
                ].map((age) => (
                  <button
                    key={age.id}
                    type="button"
                    onClick={() => setTargetAge(age.id)}
                    className={`p-4 rounded-3xl border-2 text-left transition-all cursor-pointer ${
                      targetAge === age.id
                        ? "border-[var(--primary)] bg-[var(--primary)]/10 shadow-sm"
                        : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--text-muted)]"
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-bold text-[var(--text-primary)] block">
                      {age.label}
                    </span>
                    <span className="text-[11px] text-[var(--text-muted)]">{age.sub}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Interests */}
          {step === 3 && (
            <div className="space-y-6">
              <h2 className="font-heading font-black text-xl text-[var(--text-primary)] text-center">
                What do they enjoy doing most? (Pick 1 or more)
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {interestOptions.map((opt) => {
                  const selected = selectedInterests.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      type="button"
                      onClick={() => handleInterestToggle(opt.id)}
                      className={`p-4 rounded-3xl border-2 flex items-center gap-3 transition-all cursor-pointer ${
                        selected
                          ? "border-[var(--primary)] bg-[var(--primary)]/10 shadow-sm"
                          : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--text-muted)]"
                      }`}
                    >
                      <span className="text-2xl">{opt.emoji}</span>
                      <span className="text-xs font-bold text-[var(--text-primary)] text-left flex-1">
                        {opt.label}
                      </span>
                      {selected && <Check className="w-4 h-4 text-[var(--primary)]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Budget */}
          {step === 4 && (
            <div className="space-y-6">
              <h2 className="font-heading font-black text-xl text-[var(--text-primary)] text-center">
                What is your approximate budget?
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { amount: 1500, label: "Up to ৳1,500", desc: "Thoughtful pocket gifts" },
                  { amount: 3000, label: "Up to ৳3,000", desc: "Popular top birthday toys" },
                  { amount: 6000, label: "৳3,000 – ৳6,000+", desc: "Premium deluxe & RC gear" },
                ].map((b) => (
                  <button
                    key={b.amount}
                    type="button"
                    onClick={() => setTargetBudget(b.amount)}
                    className={`p-5 rounded-3xl border-2 text-center transition-all cursor-pointer ${
                      targetBudget === b.amount
                        ? "border-[var(--primary)] bg-[var(--primary)]/10 shadow-sm scale-105"
                        : "border-[var(--border)] bg-[var(--surface)] hover:border-[var(--text-muted)]"
                    }`}
                  >
                    <span className="font-heading font-black text-lg text-[var(--text-primary)] block">
                      {b.label}
                    </span>
                    <span className="text-xs text-[var(--text-muted)] mt-1 block">{b.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step Actions */}
          <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between">
            {step > 1 ? (
              <Button type="button" onClick={() => setStep(step - 1)} variant="ghost" size="sm" className="rounded-full">
                Back
              </Button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <Button type="button" onClick={() => setStep(step + 1)} variant="pill-primary" size="md" className="font-black">
                <span>Continue</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button
                type="button"
                onClick={() => setShowResults(true)}
                variant="pill-amber"
                size="lg"
                className="font-black text-sm shadow-[0_4px_0_#B45309]"
              >
                <Sparkles className="w-4 h-4 mr-1.5" />
                <span>Show Handpicked Toys</span>
              </Button>
            )}
          </div>
        </div>
      ) : (
        /* Results View */
        <div className="space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-[var(--surface-elevated)] border border-[var(--border)]">
            <div>
              <h2 className="font-heading font-black text-xl text-[var(--text-primary)] flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-purple-600" />
                Top Handpicked Matches For You
              </h2>
              <p className="text-xs text-[var(--text-muted)] mt-0.5">
                Matched for {targetAge} &bull; Budget up to ৳{targetBudget.toLocaleString()}
              </p>
            </div>
            <Button type="button" onClick={resetQuiz} variant="outline" size="sm" className="gap-1.5">
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Retake Quiz</span>
            </Button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {matchedProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
