"use client";

import { useState } from "react";
import Link from "next/link";
import { MOCK_PRODUCTS, ToyProduct } from "@/server/mock-data";
import { ProductCard } from "@/components/store/product-card";
import { Button } from "@/components/ui/button";
import {
  Gift,
  Sparkles,
  ArrowRight,
  RotateCcw,
  Check,
  ChevronRight,
  Smile,
  Heart,
} from "lucide-react";

export default function GiftFinderPage() {
  const [step, setStep] = useState(1);
  const [targetRecipient, setTargetRecipient] = useState<string>("any");
  const [targetAge, setTargetAge] = useState<string>("5-7y");
  const [selectedInterests, setSelectedInterests] = useState<string[]>(["building"]);
  const [targetBudget, setTargetBudget] = useState<number>(3000);
  const [showResults, setShowResults] = useState(false);

  const interestOptions = [
    { id: "building", label: "Building & Bricks", emoji: "🧱" },
    { id: "stem", label: "Robotics & Science", emoji: "🔬" },
    { id: "rc", label: "RC Cars & Speed", emoji: "🏎️" },
    { id: "plush", label: "Plush & Soft Cuddles", emoji: "🧸" },
    { id: "arts", label: "Arts, Crafts & Clay", emoji: "🎨" },
    { id: "montessori", label: "Sensory & Toddler", emoji: "🍼" },
    { id: "puzzles", label: "Puzzles & Board Games", emoji: "🧩" },
  ];

  const handleInterestToggle = (id: string) => {
    setSelectedInterests((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const handleFinishQuiz = () => {
    setShowResults(true);
  };

  const resetQuiz = () => {
    setStep(1);
    setShowResults(false);
  };

  // Filter recommendations based on quiz inputs
  const matchedProducts = MOCK_PRODUCTS.filter((p) => {
    // Budget check
    if (p.basePrice > targetBudget * 1.2) return false;
    return true;
  }).slice(0, 8);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 space-y-10">
      {/* Quiz Banner Header */}
      <div className="text-center space-y-3">
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F3EFFF] text-[#7B5CFA] text-xs font-bold uppercase tracking-wider">
          <Gift className="w-3.5 h-3.5" /> Interactive Toy Gift Matcher
        </span>
        <h1 className="font-heading text-3xl sm:text-5xl font-black text-[#18191F] dark:text-white">
          Find the Perfect Gift in 30 Seconds
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          Whether it's a birthday, celebration, or developmental milestone, our smart quiz curates the best
          safe toys for your child.
        </p>
      </div>

      {!showResults ? (
        <div className="bg-white dark:bg-[#161D33] p-6 sm:p-10 rounded-3xl border border-[#E8E2DE] dark:border-[#263050] shadow-md space-y-8">
          {/* Progress Indicator */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 pb-4 border-b border-slate-100 dark:border-slate-800">
            <span>Question {step} of 4</span>
            <div className="flex gap-2">
              {[1, 2, 3, 4].map((s) => (
                <div
                  key={s}
                  className={`w-6 sm:w-10 h-2 rounded-full transition-all ${
                    s <= step ? "bg-[#7B5CFA]" : "bg-slate-200 dark:bg-slate-700"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* STEP 1: Recipient */}
          {step === 1 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h2 className="font-heading font-black text-xl text-[#18191F] dark:text-white text-center">
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
                    onClick={() => setTargetRecipient(item.id)}
                    className={`p-6 rounded-2xl border-2 flex flex-col items-center gap-3 transition-all cursor-pointer ${
                      targetRecipient === item.id
                        ? "border-[#7B5CFA] bg-[#F3EFFF] dark:bg-[#2A1D57] shadow-sm scale-105"
                        : "border-[#E8E2DE] dark:border-[#263050] hover:border-slate-300"
                    }`}
                  >
                    <span className="text-4xl">{item.icon}</span>
                    <span className="text-xs sm:text-sm font-bold text-[#18191F] dark:text-white">
                      {item.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 2: Age */}
          {step === 2 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h2 className="font-heading font-black text-xl text-[#18191F] dark:text-white text-center">
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
                    onClick={() => setTargetAge(age.id)}
                    className={`p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                      targetAge === age.id
                        ? "border-[#7B5CFA] bg-[#F3EFFF] dark:bg-[#2A1D57] shadow-sm"
                        : "border-[#E8E2DE] dark:border-[#263050] hover:border-slate-300"
                    }`}
                  >
                    <span className="text-xs sm:text-sm font-bold text-[#18191F] dark:text-white block">
                      {age.label}
                    </span>
                    <span className="text-[11px] text-slate-500">{age.sub}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* STEP 3: Interests */}
          {step === 3 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h2 className="font-heading font-black text-xl text-[#18191F] dark:text-white text-center">
                What do they enjoy doing most? (Pick 1 or more)
              </h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {interestOptions.map((opt) => {
                  const selected = selectedInterests.includes(opt.id);
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleInterestToggle(opt.id)}
                      className={`p-4 rounded-2xl border-2 flex items-center gap-3 transition-all cursor-pointer ${
                        selected
                          ? "border-[#7B5CFA] bg-[#F3EFFF] dark:bg-[#2A1D57] shadow-sm"
                          : "border-[#E8E2DE] dark:border-[#263050] hover:border-slate-300"
                      }`}
                    >
                      <span className="text-2xl">{opt.emoji}</span>
                      <span className="text-xs font-bold text-[#18191F] dark:text-white text-left flex-1">
                        {opt.label}
                      </span>
                      {selected && <Check className="w-4 h-4 text-[#7B5CFA]" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* STEP 4: Budget */}
          {step === 4 && (
            <div className="space-y-6 animate-in fade-in duration-200">
              <h2 className="font-heading font-black text-xl text-[#18191F] dark:text-white text-center">
                What is your approximate budget?
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                  { amount: 1500, label: "Up to ৳1,500", desc: "Thoughtful pocket gifts" },
                  { amount: 3000, label: "Up to ৳3,000", desc: "Popular top birthday toys" },
                  { amount: 6000, label: "৳3,000 – ৳6,000+", desc: "Premium heirloom & RC gear" },
                ].map((b) => (
                  <button
                    key={b.amount}
                    onClick={() => setTargetBudget(b.amount)}
                    className={`p-5 rounded-2xl border-2 text-center transition-all cursor-pointer ${
                      targetBudget === b.amount
                        ? "border-[#7B5CFA] bg-[#F3EFFF] dark:bg-[#2A1D57] shadow-sm scale-105"
                        : "border-[#E8E2DE] dark:border-[#263050] hover:border-slate-300"
                    }`}
                  >
                    <span className="font-heading font-black text-lg text-[#18191F] dark:text-white block">
                      {b.label}
                    </span>
                    <span className="text-xs text-slate-500 mt-1 block">{b.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Step Actions */}
          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            {step > 1 ? (
              <Button onClick={() => setStep(step - 1)} variant="ghost" size="sm">
                Back
              </Button>
            ) : (
              <div />
            )}

            {step < 4 ? (
              <Button onClick={() => setStep(step + 1)} variant="primary" size="md">
                <span>Continue</span>
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleFinishQuiz} variant="sun" size="lg" className="shadow-md">
                <Sparkles className="w-4 h-4 mr-1.5" />
                <span>Show Handpicked Toys</span>
              </Button>
            )}
          </div>
        </div>
      ) : (
        /* Results View */
        <div className="space-y-8 animate-in fade-in duration-300">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white dark:bg-[#161D33] border border-[#E8E2DE] dark:border-[#263050]">
            <div>
              <h2 className="font-heading font-black text-xl text-[#18191F] dark:text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-[#7B5CFA]" />
                Top Handpicked Matches For You
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Matched for {targetAge} &bull; Budget up to ৳{targetBudget.toLocaleString()}
              </p>
            </div>
            <Button onClick={resetQuiz} variant="outline" size="sm" className="gap-1.5">
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
