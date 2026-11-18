import { getProducts } from "@/server/services/product-service";
import { ProductListing } from "@/components/store/product-listing";
import { Metadata } from "next";

interface SearchPageProps {
  searchParams: Promise<{
    q?: string;
  }>;
}

export async function generateMetadata({ searchParams }: SearchPageProps): Promise<Metadata> {
  const { q } = await searchParams;
  return {
    title: q ? `Search: "${q}"` : "Search Toys",
    description: `Search results for "${q || ""}" on Khelna Bazar.`,
  };
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const { q } = await searchParams;
  const query = q || "";

  const { products } = await getProducts({
    query: query.trim() || undefined,
    limit: 48,
  });

  return (
    <ProductListing
      initialProducts={products}
      title={query ? `Search Results for "${query}"` : "Search Toys"}
      description={`Found ${products.length} matching item${products.length === 1 ? "" : "s"} for your search.`}
    />
  );
}
