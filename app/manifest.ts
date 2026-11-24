import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Pilihin",
    short_name: "Pilihin",
    description: "Pilihin — creative photography and visual storytelling.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#f5f3ee",
    theme_color: "#f5f3ee",
    icons: [
      { src: "/apple-icon", sizes: "180x180", type: "image/png", purpose: "any" },
      { src: "/icon", sizes: "512x512", type: "image/png", purpose: "any" },
    ],
  };
}
