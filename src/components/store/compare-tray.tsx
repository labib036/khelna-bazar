"use client";

import Link from "next/link";
import Image from "next/image";
import { useCompareStore } from "@/lib/compare-store";
import { useMounted } from "@/lib/use-mounted";
import { Scale, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export function CompareTray() {
  const mounted = useMounted();
  const { products, removeProduct, clearCompare } = useCompareStore();

  if (!mounted || products.length === 0) return null;

  return (
    <aside
      aria-label="Toy Comparison Tray"
      className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-2xl bg-[var(--surface)]/95 backdrop-blur-md rounded-full border-2 border-[var(--primary)] shadow-2xl p-2 sm:p-2.5 flex items-center justify-between gap-3 animate-in slide-in-from-bottom-4 duration-300 select-none"
    >
      <div className="flex items-center gap-2 pl-2">
        <div className="w-8 h-8 rounded-full bg-[var(--primary)] text-[var(--on-primary)] flex items-center justify-center shrink-0 shadow-xs">
          <Scale className="w-4 h-4" />
        </div>
        <div className="hidden sm:block">
          <span className="font-extrabold text-xs text-[var(--text-primary)] block leading-tight">
            Compare Toys
          </span>
          <span className="text-[10px] text-[var(--text-muted)]">
            {products.length} of 4 selected
          </span>
        </div>
      </div>

      {/* Thumbnails */}
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
        {products.map((p) => (
          <div
            key={p.id}
            className="relative w-10 h-10 rounded-full overflow-hidden bg-[var(--surface-container-low)] border border-[var(--border)] shrink-0 group"
          >
            <Image src={p.image || "/images/khelna-bazar-logo.png"} alt={p.name} fill className="object-cover" sizes="40px" />
            <button
              type="button"
              onClick={() => removeProduct(p.id)}
              className="absolute inset-0 bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
              aria-label={`Remove ${p.name} from comparison`}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 shrink-0 pr-1">
        <button
          type="button"
          onClick={clearCompare}
          className="text-[11px] text-[var(--text-muted)] hover:text-[var(--danger)] font-bold px-2 py-1 cursor-pointer hidden sm:inline-block"
        >
          Clear
        </button>
        <Link href="/compare">
          <Button variant="pill-primary" size="sm" className="text-xs px-3.5 py-1.5 h-8">
            <span>Compare</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Button>
        </Link>
      </div>
    </aside>
  );
}
