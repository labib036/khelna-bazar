"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCompareStore } from "@/lib/compare-store";
import { useMounted } from "@/lib/use-mounted";
import { useLanguage } from "@/lib/i18n";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Scale, X, Star, AlertTriangle, CheckCircle } from "lucide-react";

export default function ComparePage() {
  const mounted = useMounted();
  const { t, locale } = useLanguage();
  const isBn = locale === "bn";

  const { products, removeProduct, clearCompare } = useCompareStore();
  const [highlightDiffs, setHighlightDiffs] = useState(false);

  if (!mounted) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center text-xs text-[var(--text-muted)] animate-pulse">
        {isBn ? "তুলনা লোড হচ্ছে..." : "Loading comparison..."}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-[var(--accent)]/10 text-[var(--accent)] flex items-center justify-center mx-auto">
          <Scale className="w-10 h-10" />
        </div>
        <h1 className="font-heading text-2xl font-black text-[var(--text-primary)]">
          {isBn ? "তুলনা করার কোনো খেলনা নেই" : "No Toys to Compare"}
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)]">
          {isBn
            ? "পণ্যের বিস্তারিত পেজে থাকা \"তুলনা করুন\" বাটনে চাপ দিয়ে বৈশিষ্ট্য, বয়স ও দামের পাশাপাশি তুলনা দেখুন।"
            : "Select \"Compare Toy\" on any product detail page to compare features, age ranges, and prices side by side."}
        </p>
        <Link href="/c/all" className="inline-block pt-2">
          <Button variant="pill-primary" size="md">
            {isBn ? "খেলনা ব্রাউজ করুন" : "Browse Toys"}
          </Button>
        </Link>
      </div>
    );
  }

  // Helper to determine if row values differ
  const hasDiff = (key: keyof typeof products[0]) => {
    if (products.length <= 1) return false;
    const firstVal = products[0][key];
    return products.some((p) => p[key] !== firstVal);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-[var(--border)]">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-[var(--text-primary)] flex items-center gap-2.5">
            <Scale className="w-6 h-6 text-[var(--accent)]" />
            <span>{isBn ? `খেলনার বৈশিষ্ট্যের তুলনা (${products.length}/৪)` : `Toy Feature Comparison (${products.length}/4)`}</span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">
            {isBn ? "পাশাপাশি বৈশিষ্ট্য, নিরাপত্তা ও দাম যাচাই করুন।" : "Side-by-side specs, safety, and price evaluation."}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={highlightDiffs}
              onChange={(e) => setHighlightDiffs(e.target.checked)}
              className="w-4 h-4 rounded text-[var(--accent)]"
            />
            <span>{isBn ? "পার্থক্যসমূহ হাইলাইট করুন" : "Highlight Differences"}</span>
          </label>

          <Button type="button" onClick={clearCompare} variant="outline" size="sm" className="rounded-full text-xs font-bold">
            {isBn ? "তুলনা তালিকা মুছুন" : "Clear Comparison"}
          </Button>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto bg-[var(--surface-container-low)] rounded-3xl border border-[var(--border)] shadow-xs">
        <table className="w-full text-xs text-left divide-y divide-[var(--border)]">
          <tbody>
            {/* Row 1: Header / Product Cards */}
            <tr className="divide-x divide-[var(--border)]">
              <td className="p-4 font-bold text-[var(--text-muted)] w-44 bg-[var(--surface)]">
                {isBn ? "খেলনা" : "Toy"}
              </td>
              {products.map((p) => (
                <td key={p.id} className="p-4 min-w-[200px] align-top">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => removeProduct(p.id)}
                      className="absolute top-1 right-1 p-1 rounded-full text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors cursor-pointer"
                      title={isBn ? "সরান" : "Remove"}
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="relative w-28 h-28 mx-auto rounded-xl overflow-hidden bg-[var(--surface)] mb-2 border border-[var(--border)]">
                      <Image src={p.image} alt={p.name} fill className="object-cover" sizes="112px" />
                    </div>
                    <Link
                      href={`/p/${p.slug}`}
                      className="font-heading font-bold text-xs text-[var(--text-primary)] hover:text-[var(--primary)] line-clamp-2 text-center"
                    >
                      {p.name}
                    </Link>
                  </div>
                </td>
              ))}
            </tr>

            {/* Row 2: Price */}
            <tr
              className={`divide-x divide-[var(--border)] ${
                highlightDiffs && hasDiff("price") ? "bg-amber-500/10" : ""
              }`}
            >
              <td className="p-4 font-bold text-[var(--text-muted)] bg-[var(--surface)]">
                {isBn ? "মূল্য" : "Price"}
              </td>
              {products.map((p) => (
                <td key={p.id} className="p-4 font-black text-sm text-[var(--primary)]">
                  {formatPrice(p.price)}
                </td>
              ))}
            </tr>

            {/* Row 3: Rating */}
            <tr
              className={`divide-x divide-[var(--border)] ${
                highlightDiffs && hasDiff("ratingAvg") ? "bg-amber-500/10" : ""
              }`}
            >
              <td className="p-4 font-bold text-[var(--text-muted)] bg-[var(--surface)]">
                {isBn ? "রেটিং" : "Rating"}
              </td>
              {products.map((p) => (
                <td key={p.id} className="p-4">
                  <div className="flex items-center gap-1 font-bold text-[var(--text-primary)]">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>{p.ratingAvg.toFixed(1)}</span>
                    <span className="text-[var(--text-muted)] font-normal">({p.ratingCount})</span>
                  </div>
                </td>
              ))}
            </tr>

            {/* Row 4: Recommended Age */}
            <tr
              className={`divide-x divide-[var(--border)] ${
                highlightDiffs && hasDiff("minAgeMonths") ? "bg-amber-500/10" : ""
              }`}
            >
              <td className="p-4 font-bold text-[var(--text-muted)] bg-[var(--surface)]">
                {isBn ? "প্রস্তাবিত বয়স" : "Recommended Age"}
              </td>
              {products.map((p) => (
                <td key={p.id} className="p-4 font-semibold text-[var(--text-primary)]">
                  {Math.floor(p.minAgeMonths / 12)} {isBn ? "থেকে" : "to"} {Math.floor(p.maxAgeMonths / 12)} {isBn ? "বছর" : "Years"}
                </td>
              ))}
            </tr>

            {/* Row 5: Materials */}
            <tr
              className={`divide-x divide-[var(--border)] ${
                highlightDiffs && hasDiff("material") ? "bg-amber-500/10" : ""
              }`}
            >
              <td className="p-4 font-bold text-[var(--text-muted)] bg-[var(--surface)]">
                {isBn ? "উপাদান" : "Materials"}
              </td>
              {products.map((p) => (
                <td key={p.id} className="p-4 text-[var(--text-muted)]">
                  {p.material || "—"}
                </td>
              ))}
            </tr>

            {/* Row 6: Choking Hazard */}
            <tr
              className={`divide-x divide-[var(--border)] ${
                highlightDiffs && hasDiff("chokingHazard") ? "bg-amber-500/10" : ""
              }`}
            >
              <td className="p-4 font-bold text-[var(--text-muted)] bg-[var(--surface)]">
                {isBn ? "নিরাপত্তা সতর্কতা" : "Safety Warning"}
              </td>
              {products.map((p) => (
                <td key={p.id} className="p-4">
                  {p.chokingHazard ? (
                    <span className="text-[var(--danger)] font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> {isBn ? "ছোট অংশ (৩+)" : "Small Parts (3+)"}
                    </span>
                  ) : (
                    <span className="text-[var(--success)] font-bold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> {isBn ? "সকল বয়সের জন্য নিরাপদ" : "Safe for All Ages"}
                    </span>
                  )}
                </td>
              ))}
            </tr>

            {/* Row 7: Action */}
            <tr className="divide-x divide-[var(--border)]">
              <td className="p-4 font-bold text-[var(--text-muted)] bg-[var(--surface)]">
                {isBn ? "অ্যাকশন" : "Action"}
              </td>
              {products.map((p) => (
                <td key={p.id} className="p-4">
                  <Link href={`/p/${p.slug}`}>
                    <Button variant="pill-primary" size="sm" className="w-full text-xs font-black shadow-xs">
                      {isBn ? "বিস্তারিত দেখুন" : "View Details"}
                    </Button>
                  </Link>
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
