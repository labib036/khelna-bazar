import { db } from "@/lib/db";
import { StoreBanner } from "@/types/store";

export async function getActiveBanners(placement = "HERO"): Promise<StoreBanner[]> {
  try {
    const banners = await db.banner.findMany({
      where: {
        placement,
        active: true,
      },
      orderBy: {
        sortOrder: "asc",
      },
    });

    return banners.map((b) => ({
      id: b.id,
      placement: b.placement as StoreBanner["placement"],
      heading: b.heading,
      text: b.text,
      ctaLabel: b.ctaLabel,
      ctaUrl: b.ctaUrl,
      desktopImage: b.desktopImage,
      mobileImage: b.mobileImage,
      active: b.active,
      sortOrder: b.sortOrder,
    }));
  } catch (error) {
    console.error("Failed to query active banners:", (error as Error).message);
    return [];
  }
}

export async function getActiveAnnouncement(): Promise<string | null> {
  try {
    const announcement = await db.announcement.findFirst({
      where: {
        active: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return announcement?.text || null;
  } catch (error) {
    console.error("Failed to query active announcement:", (error as Error).message);
    return null;
  }
}
