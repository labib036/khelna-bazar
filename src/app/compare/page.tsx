"use client";

import Link from "next/link";
import Image from "next/image";
import { useCompareStore } from "@/lib/compare-store";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Scale, X, Star, AlertTriangle, CheckCircle, ShoppingBag } from "lucide-react";

export default function ComparePage() {
  const { products, removeProduct, clearCompare } = useCompareStore();

  if (products.length === 0) {
    return (
      <div className="max-w-md mx-auto py-20 px-4 text-center space-y-4">
        <div className="w-20 h-20 rounded-full bg-[#F3EFFF] text-[#7B5CFA] flex items-center justify-center mx-auto">
          <Scale className="w-10 h-10" />
        </div>
        <h1 className="font-heading text-2xl font-black text-[#14213D] dark:text-white">
          No Toys to Compare
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Select "Compare Toy" on any product detail page to compare features, age ranges, and prices side by side.
        </p>
        <Link href="/c/all" className="inline-block pt-2">
          <Button variant="primary" size="md">
            Browse Toys
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12 space-y-8">
      <div className="flex items-center justify-between pb-6 border-b border-[#E3E8F2] dark:border-[#263050]">
        <div>
          <h1 className="font-heading text-2xl sm:text-3xl font-black text-[#14213D] dark:text-white flex items-center gap-2.5">
            <Scale className="w-6 h-6 text-[#7B5CFA]" />
            <span>Toy Feature Comparison ({products.length}/4)</span>
          </h1>
          <p className="text-xs text-slate-500 mt-1">Side-by-side specs, safety, and price evaluation.</p>
        </div>

        <Button onClick={clearCompare} variant="outline" size="sm">
          Clear Comparison
        </Button>
      </div>

      {/* Comparison Table */}
      <div className="overflow-x-auto bg-white dark:bg-[#161D33] rounded-3xl border border-[#E3E8F2] dark:border-[#263050] shadow-xs">
        <table className="w-full text-xs text-left divide-y divide-[#E3E8F2] dark:divide-[#263050]">
          <tbody>
            {/* Row 1: Header / Product Cards */}
            <tr className="divide-x divide-[#E3E8F2] dark:divide-[#263050]">
              <td className="p-4 font-bold text-slate-400 w-44 bg-slate-50 dark:bg-[#1E2742]">
                Toy
              </td>
              {products.map((p) => (
                <td key={p.id} className="p-4 min-w-[200px] align-top">
                  <div className="relative">
                    <button
                      onClick={() => removeProduct(p.id)}
                      className="absolute top-1 right-1 p-1 rounded-full text-slate-400 hover:text-[#FF6B6B] transition-colors"
                      title="Remove"
                    >
                      <X className="w-4 h-4" />
                    </button>
                    <div className="relative w-28 h-28 mx-auto rounded-xl overflow-hidden bg-slate-100 mb-2">
                      <Image src={p.image} alt={p.name} fill className="object-cover" sizes="112px" />
                    </div>
                    <Link
                      href={`/p/${p.slug}`}
                      className="font-heading font-bold text-xs text-[#14213D] dark:text-white hover:text-[#1E5BFF] line-clamp-2 text-center"
                    >
                      {p.name}
                    </Link>
                  </div>
                </td>
              ))}
            </tr>

            {/* Row 2: Price */}
            <tr className="divide-x divide-[#E3E8F2] dark:divide-[#263050]">
              <td className="p-4 font-bold text-slate-400 bg-slate-50 dark:bg-[#1E2742]">Price</td>
              {products.map((p) => (
                <td key={p.id} className="p-4 font-black text-sm text-[#1E5BFF]">
                  {formatPrice(p.price)}
                </td>
              ))}
            </tr>

            {/* Row 3: Rating */}
            <tr className="divide-x divide-[#E3E8F2] dark:divide-[#263050]">
              <td className="p-4 font-bold text-slate-400 bg-slate-50 dark:bg-[#1E2742]">Rating</td>
              {products.map((p) => (
                <td key={p.id} className="p-4">
                  <div className="flex items-center gap-1 font-bold text-slate-700 dark:text-slate-200">
                    <Star className="w-3.5 h-3.5 fill-[#FFC93C] text-[#FFC93C]" />
                    <span>{p.ratingAvg.toFixed(1)}</span>
                    <span className="text-slate-400 font-normal">({p.ratingCount})</span>
                  </div>
                </td>
              ))}
            </tr>

            {/* Row 4: Recommended Age */}
            <tr className="divide-x divide-[#E3E8F2] dark:divide-[#263050]">
              <td className="p-4 font-bold text-slate-400 bg-slate-50 dark:bg-[#1E2742]">
                Recommended Age
              </td>
              {products.map((p) => (
                <td key={p.id} className="p-4 font-semibold text-[#14213D] dark:text-white">
                  {Math.floor(p.minAgeMonths / 12)} to {Math.floor(p.maxAgeMonths / 12)} Years
                </td>
              ))}
            </tr>

            {/* Row 5: Materials */}
            <tr className="divide-x divide-[#E3E8F2] dark:divide-[#263050]">
              <td className="p-4 font-bold text-slate-400 bg-slate-50 dark:bg-[#1E2742]">Materials</td>
              {products.map((p) => (
                <td key={p.id} className="p-4 text-slate-600 dark:text-slate-300">
                  {p.material || "Non-toxic child-safe plastic"}
                </td>
              ))}
            </tr>

            {/* Row 6: Choking Hazard */}
            <tr className="divide-x divide-[#E3E8F2] dark:divide-[#263050]">
              <td className="p-4 font-bold text-slate-400 bg-slate-50 dark:bg-[#1E2742]">
                Choking Warning
              </td>
              {products.map((p) => (
                <td key={p.id} className="p-4">
                  {p.chokingHazard ? (
                    <span className="text-[#FF6B6B] font-bold flex items-center gap-1">
                      <AlertTriangle className="w-3.5 h-3.5" /> Small Parts (3+)
                    </span>
                  ) : (
                    <span className="text-[#2EC4B6] font-bold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5" /> Toddler Safe (No Choking)
                    </span>
                  )}
                </td>
              ))}
            </tr>

            {/* Row 7: Action */}
            <tr className="divide-x divide-[#E3E8F2] dark:divide-[#263050]">
              <td className="p-4 font-bold text-slate-400 bg-slate-50 dark:bg-[#1E2742]">Action</td>
              {products.map((p) => (
                <td key={p.id} className="p-4">
                  <Link href={`/p/${p.slug}`}>
                    <Button variant="primary" size="sm" className="w-full text-xs">
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
