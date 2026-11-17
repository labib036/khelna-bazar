"use client";

import { ShieldCheck, AlertTriangle, Box, Info, CheckCircle2 } from "lucide-react";

interface SafetyPanelProps {
  ageRange?: string;
  materials?: string;
  chokingHazard?: boolean;
  whatsInTheBox?: string[];
}

export function SafetyPanel({
  ageRange = "All Ages",
  materials,
  chokingHazard = false,
  whatsInTheBox = [],
}: SafetyPanelProps) {
  return (
    <section aria-labelledby="product-spec-heading" className="w-full mt-10">
      <div className="relative overflow-hidden rounded-4xl bg-[var(--surface-container-low)] p-6 sm:p-8 lg:p-10 border border-[var(--border)] shadow-xs">
        {/* Subtle Background Glow */}
        <div className="absolute -right-16 -bottom-16 w-72 h-72 bg-[var(--secondary-container)]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-[var(--primary)] text-[var(--on-primary)] flex items-center justify-center shadow-xs shrink-0">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[var(--primary)] block">
                  Product Guide &amp; Safety Notice
                </span>
                <h2 id="product-spec-heading" className="font-heading text-xl sm:text-2xl font-black text-[var(--text-primary)]">
                  Age Range &amp; Delivery Inspection Guidelines
                </h2>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="px-3.5 py-1.5 rounded-full bg-[var(--surface)] font-bold text-xs text-[var(--text-primary)] shadow-xs border border-[var(--border)]">
                Recommended Age: <strong>{ageRange}</strong>
              </span>
            </div>
          </div>

          {/* Mandatory Choking Hazard Warning Alert (If applicable) */}
          {chokingHazard && (
            <div className="p-4 sm:p-5 rounded-3xl bg-[var(--secondary-container)]/20 border-2 border-[var(--secondary-container)] flex items-start gap-4">
              <div className="w-10 h-10 rounded-full bg-[var(--secondary-container)] text-[var(--on-secondary-container)] flex items-center justify-center shrink-0 shadow-xs">
                <AlertTriangle className="w-5 h-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-heading font-black text-sm sm:text-base text-[var(--text-primary)]">
                  সতর্কতা: ছোট পার্টস / WARNING: CHOKING HAZARD — Small Parts
                </h3>
                <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1 leading-relaxed">
                  এই খেলনাটিতে ছোট অংশ রয়েছে। ৩ বছরের কম বয়সী শিশুদের জন্য অনুপযুক্ত। {ageRange} বয়সী শিশুদের জন্য অভিভাবকের তত্ত্বাবধানে ব্যবহারের পরামর্শ দেওয়া হচ্ছে।
                </p>
              </div>
            </div>
          )}

          {/* Delivery Inspection Policy (Owner Confirmed Rule) */}
          <div className="p-4 sm:p-5 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs flex items-start gap-4">
            <div className="w-10 h-10 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-1">
              <h3 className="font-heading font-black text-sm sm:text-base text-[var(--text-primary)]">
                ডেলিভারির সময় দেখে নিন / Inspect Before You Accept
              </h3>
              <p className="text-xs sm:text-sm text-[var(--text-muted)] leading-relaxed">
                ডেলিভারি ম্যানের সামনে পণ্যটি দেখে নিয়ে তারপর গ্রহণ করুন। ডেলিভারির সময় ত্রুটি ধরা পড়লে পণ্য ফেরত ও সম্পূর্ণ রিফান্ড করা হবে। পণ্য গ্রহণ করার পর রিফান্ড করা সম্ভব নয়।
              </p>
            </div>
          </div>

          {/* Real Specifications (Materials & Contents) */}
          {(materials || (whatsInTheBox && whatsInTheBox.length > 0)) && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              {materials && (
                <div className="p-4 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-1">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-[var(--primary)]" /> Materials
                  </span>
                  <p className="text-xs font-bold text-[var(--text-primary)]">{materials}</p>
                </div>
              )}
              {whatsInTheBox && whatsInTheBox.length > 0 && (
                <div className="p-4 rounded-3xl bg-[var(--surface)] border border-[var(--border)] shadow-xs space-y-1">
                  <span className="text-[10px] uppercase font-extrabold tracking-wider text-[var(--text-muted)] flex items-center gap-1.5">
                    <Box className="w-3.5 h-3.5 text-[var(--secondary)]" /> What&apos;s In The Box
                  </span>
                  <ul className="text-xs font-medium text-[var(--text-primary)] list-disc list-inside space-y-0.5">
                    {whatsInTheBox.map((item, idx) => (
                      <li key={idx}>{item}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
