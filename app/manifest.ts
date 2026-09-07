import type { MetadataRoute } from "next";

// Served at /manifest.webmanifest and linked automatically by Next.
export default function manifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "Math Bingo",
    short_name: "Math Bingo",
    description:
      "A multiplication bingo caller: spin two reels for a times-table fact, call it out, and verify a player's card.",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: "#0d2b1d",
    theme_color: "#0d2b1d",
    categories: ["education", "games"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: "/icon-maskable-512.png",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
