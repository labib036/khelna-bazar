import { getProducts } from "@/server/services/product-service";
import { ProductListing } from "@/components/store/product-listing";
import { Metadata } from "next";
import { cookies } from "next/headers";

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

  const cookieStore = await cookies();
  const isBn = cookieStore.get("kb_lang")?.value === "bn";

  const { products } = await getProducts({
    query: query.trim() || undefined,
    limit: 48,
  });

  const title = query
    ? isBn
      ? `"${query}" এর অনুসন্ধানের ফলাফল`
      : `Search Results for "${query}"`
    : isBn
    ? "খেলনা খুঁজুন"
    : "Search Toys";

  const description = isBn
    ? `আপনার অনুসন্ধানে ${products.length}টি পণ্য পাওয়া গেছে।`
    : `Found ${products.length} matching item${products.length === 1 ? "" : "s"} for your search.`;

  return (
    <ProductListing
      initialProducts={products}
      title={title}
      description={description}
    />
  );
}
