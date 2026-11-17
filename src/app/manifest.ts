import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Khelna Bazar - Safe & Educational Toys in Bangladesh",
    short_name: "Khelna Bazar",
    description: "Premier online toy store in Bangladesh for authentic, STEM, Montessori, and educational toys.",
    start_url: "/",
    display: "standalone",
    background_color: "#FFFFFF",
    theme_color: "#C83E00",
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
      {
        src: "/icon-192.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
