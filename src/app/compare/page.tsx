"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { useCompareStore } from "@/lib/compare-store";
import { useMounted } from "@/lib/use-mounted";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Scale, X, Star, AlertTriangle, CheckCircle } from "lucide-react";

export default function ComparePage() {
  const mounted = useMounted();
  const { products, removeProduct, clearCompare } = useCompareStore();
  const [highlightDiffs, setHighlightDiffs] = useState(false);

  if (!mounted) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center text-xs text-[var(--text-muted)] animate-pulse">
        Loading comparison...
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
          No Toys to Compare
        </h1>
        <p className="text-xs sm:text-sm text-[var(--text-muted)]">
          Select &quot;Compare Toy&quot; on any product detail page to compare features, age ranges, and prices side by side.
        </p>
        <Link href="/c/all" className="inline-block pt-2">
          <Button variant="pill-primary" size="md">
            Browse Toys
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
            <span>Toy Feature Comparison ({products.length}/4)</span>
          </h1>
          <p className="text-xs text-[var(--text-muted)] mt-1">Side-by-side specs, safety, and price evaluation.</p>
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-2 text-xs font-bold text-[var(--text-primary)] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={highlightDiffs}
              onChange={(e) => setHighlightDiffs(e.target.checked)}
              className="w-4 h-4 rounded text-[var(--accent)]"
            />
            <span>Highlight Differences</span>
          </label>

          <Button type="button" onClick={clearCompare} variant="outline" size="sm" className="rounded-full text-xs font-bold">
            Clear Comparison
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
                Toy
              </td>
              {products.map((p) => (
                <td key={p.id} className="p-4 min-w-[200px] align-top">
                  <div className="relative">
                    <button
                      type="button"
                      onClick={() => removeProduct(p.id)}
                      className="absolute top-1 right-1 p-1 rounded-full text-[var(--text-muted)] hover:text-[var(--danger)] transition-colors cursor-pointer"
                      title="Remove"
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
              <td className="p-4 font-bold text-[var(--text-muted)] bg-[var(--surface)]">Price</td>
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
              <td className="p-4 font-bold text-[var(--text-muted)] bg-[var(--surface)]">Rating</td>
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
                Recommended Age
              </td>
              {products.map((p) => (
                <td key={p.id} className="p-4 font-semibold text-[var(--text-primary)]">
                  {Math.floor(p.minAgeMonths / 12)} to {Math.floor(p.maxAgeMonths / 12)} Years
                </td>
              ))}
            </tr>

            {/* Row 5: Materials */}
            <tr
              className={`divide-x divide-[var(--border)] ${
                highlightDiffs && hasDiff("material") ? "bg-amber-500/10" : ""
              }`}
            >
              <td className="p-4 font-bold text-[var(--text-muted)] bg-[var(--surface)]">Materials</td>
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
                Safety Warning
              </td>
              {products.map((p) => (
                <td key={p.id} className="p-4">
                  {p.chokingHazard ? (
                    <span className="text-[var(--danger)] font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Small Parts (3+)
                    </span>
                  ) : (
                    <span className="text-[var(--success)] font-bold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Safe for All Ages
                    </span>
                  )}
                </td>
              ))}
            </tr>

            {/* Row 7: Action */}
            <tr className="divide-x divide-[var(--border)]">
              <td className="p-4 font-bold text-[var(--text-muted)] bg-[var(--surface)]">Action</td>
              {products.map((p) => (
                <td key={p.id} className="p-4">
                  <Link href={`/p/${p.slug}`}>
                    <Button variant="pill-primary" size="sm" className="w-full text-xs font-black shadow-xs">
                      View Details
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
