import { notFound } from "next/navigation";
import { getProductBySlug, getProducts } from "@/server/services/product-service";
import { ProductDetailView } from "@/components/store/product-detail-view";
import { Metadata } from "next";

interface ProductPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return {
      title: "Toy Not Found",
    };
  }

  return {
    title: product.name,
    description: product.shortDesc,
    openGraph: {
      title: product.name,
      description: product.shortDesc,
      images: [
        {
          url: product.images[0],
          width: 800,
          height: 800,
          alt: product.name,
        },
      ],
    },
  };
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  // Fetch related products in the same category
  const { products: relatedProducts } = await getProducts({
    category: product.categorySlug,
    limit: 4,
  });

  return (
    <ProductDetailView
      product={product}
      relatedProducts={relatedProducts.filter((p) => p.id !== product.id)}
    />
  );
}
