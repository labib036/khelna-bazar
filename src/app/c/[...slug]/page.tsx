import { notFound } from "next/navigation";
import { getProducts, getCategories } from "@/server/services/product-service";
import { ProductListing } from "@/components/store/product-listing";
import { Metadata } from "next";

interface CategoryPageProps {
  params: Promise<{
    slug: string[];
  }>;
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const currentSlug = slug[slug.length - 1];

  if (currentSlug === "all") {
    return {
      title: "All Toys & Games",
      description: "Browse our complete catalog of certified safe toys, STEM kits, building blocks, and plushies.",
    };
  }

  const categories = await getCategories();
  const category = categories.find((c) => c.slug === currentSlug);

  return {
    title: category ? category.name : "Category",
    description: category?.description || "Browse toys on Khelna Bazar.",
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const currentSlug = slug[slug.length - 1];

  const categories = await getCategories();
  const isAll = currentSlug === "all";
  const category = categories.find((c) => c.slug === currentSlug);

  if (!isAll && !category) {
    // If not found in primary categories, still allow searching
  }

  const { products } = await getProducts({
    category: isAll ? undefined : currentSlug,
    limit: 48,
  });

  return (
    <ProductListing
      initialProducts={products}
      title={isAll ? "All Toys & Games" : category?.name || "Toys Collection"}
      description={
        isAll
          ? "Browse our full collection of safe, engaging, and creative toys with nationwide Cash on Delivery."
          : category?.description
      }
      categorySlug={currentSlug}
    />
  );
}
