import { getProducts } from "@/server/services/product-service";
import { ProductListing } from "@/components/store/product-listing";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Today's Flash Deals & Special Discounts",
  description: "Limited time toy deals and flash sales with nationwide Cash on Delivery in Bangladesh.",
};

export default async function DealsPage() {
  const { products } = await getProducts({
    isDeal: true,
    limit: 48,
  });

  return (
    <ProductListing
      initialProducts={products}
      title="🔥 Today's Flash Deals & Discounts"
      description="Save up to 35% on certified toys. Limited quantities available. Pay cash on delivery."
    />
  );
}
