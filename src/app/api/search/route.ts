import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q")?.trim() || "";

  if (q.length < 2) {
    return NextResponse.json({ products: [], categories: [] });
  }

  try {
    const [products, categories] = await Promise.all([
      db.product.findMany({
        where: {
          status: "ACTIVE",
          OR: [
            { name: { contains: q, mode: "insensitive" } },
            { shortDesc: { contains: q, mode: "insensitive" } },
          ],
        },
        select: {
          id: true,
          name: true,
          slug: true,
          basePrice: true,
          comparePrice: true,
          images: {
            take: 1,
            orderBy: { sortOrder: "asc" },
            select: { url: true },
          },
          categories: {
            take: 1,
            select: { name: true, slug: true },
          },
        },
        take: 8,
      }),
      db.category.findMany({
        where: {
          name: { contains: q, mode: "insensitive" },
        },
        select: {
          id: true,
          name: true,
          slug: true,
        },
        take: 4,
      }),
    ]);

    const formattedProducts = products.map((p) => ({
      id: p.id,
      name: p.name,
      slug: p.slug,
      price: p.basePrice,
      comparePrice: p.comparePrice,
      image: p.images[0]?.url || "",
      category: p.categories[0]?.name || "Toys",
    }));

    return NextResponse.json(
      { products: formattedProducts, categories },
      {
        headers: {
          "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120",
        },
      }
    );
  } catch (error) {
    console.error("Search API error:", (error as Error).message);
    return NextResponse.json({ products: [], categories: [] });
  }
}
