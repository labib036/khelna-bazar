import { getProducts } from "@/server/services/product-service";
import { ProductListing } from "@/components/store/product-listing";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "New Toy Arrivals & Recent Releases",
  description: "Explore the latest imported toys, creative building sets, and STEM kits on Khelna Bazar.",
};

export default async function NewArrivalsPage() {
  const { products } = await getProducts({
    sort: "newest",
    limit: 48,
  });

  return (
    <ProductListing
      initialProducts={products}
      title="✨ New Toy Arrivals"
      description="Freshly added toys, newest building sets, and newly imported learning gear."
    />
  );
}
