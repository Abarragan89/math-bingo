import type { MetadataRoute } from "next";

import { BASE_PATH, withBasePath } from "@/lib/base-path";

// Served at <base path>/manifest.webmanifest and linked automatically by Next.

// A manifest is a Route Handler under the hood, and `output: "export"` requires
// handlers to opt in to being prerendered. Nothing here reads the request.
export const dynamic = "force-static";

export default function manifest(): MetadataRoute.Manifest {
  return {
    // Resolved against the origin, and every GitHub Pages project site on
    // <user>.github.io shares one — so the id has to be the sub-path, not "/",
    // or two of them would install over each other.
    id: `${BASE_PATH}/`,
    name: "Math Bingo",
    short_name: "Math Bingo",
    description:
      "A multiplication bingo caller: spin two reels for a times-table fact, call it out, and verify a player's card.",
    // Next prefixes the <link rel="manifest"> URL with the base path, but the
    // URLs inside the manifest are ours to resolve.
    start_url: `${BASE_PATH}/`,
    scope: `${BASE_PATH}/`,
    display: "standalone",
    background_color: "#0d2b1d",
    theme_color: "#0d2b1d",
    categories: ["education", "games"],
    icons: [
      { src: withBasePath("/icon-192.png"), sizes: "192x192", type: "image/png", purpose: "any" },
      { src: withBasePath("/icon-512.png"), sizes: "512x512", type: "image/png", purpose: "any" },
      {
        src: withBasePath("/icon-maskable-512.png"),
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
