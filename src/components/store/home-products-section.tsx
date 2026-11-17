"use client";

import type { ToyProduct } from "@/types/store";
import { ProductCard } from "@/components/store/product-card";

interface HomeProductsSectionProps {
  initialProducts: ToyProduct[];
  filterType?: "featured" | "deals";
  limit?: number;
}

export function HomeProductsSection({
  initialProducts,
  filterType = "featured",
  limit = 8,
}: HomeProductsSectionProps) {
  let filtered: ToyProduct[] = [];
  if (filterType === "deals") {
    filtered = initialProducts.filter((p) => p.isDeal || (p.comparePrice && p.comparePrice > p.basePrice));
    if (filtered.length === 0) filtered = initialProducts.slice(0, 4);
  } else {
    filtered = initialProducts.filter((p) => p.isFeatured);
    if (filtered.length === 0) filtered = initialProducts;
  }

  const displayed = filtered.slice(0, limit);

  return (
    <div className={`grid grid-cols-2 ${filterType === "deals" ? "md:grid-cols-4" : "sm:grid-cols-3 lg:grid-cols-4"} gap-4`}>
      {displayed.map((p) => (
        <ProductCard key={p.id} product={p} />
      ))}
    </div>
  );
}
