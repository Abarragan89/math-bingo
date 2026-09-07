import type { NextConfig } from "next";

import { BASE_PATH } from "./lib/base-path";

const nextConfig: NextConfig = {
  // GitHub Pages is a plain static host: `next build` writes the whole site to
  // `out/`. The game is client-side after load, so nothing here needs a server.
  output: "export",

  basePath: BASE_PATH,

  // Emits `game/index.html` rather than `game.html`, which is what Pages
  // resolves a `/game/` request to without any rewrite rules.
  trailingSlash: true,
};

export default nextConfig;
