/* Math Bingo service worker.
 *
 * The game is entirely client-side once loaded, so caching the shell plus the
 * hashed build assets makes it fully playable offline — worth having in a
 * classroom where the wifi comes and goes mid-lesson.
 */

const VERSION = "math-bingo-v2";
const SHELL_CACHE = `${VERSION}-shell`;
const ASSET_CACHE = `${VERSION}-assets`;

// Everything needed to open the game cold with no network.
const SHELL = [
  "/",
  "/game",
  "/manifest.webmanifest",
  "/sounds/number-spin.wav",
  "/sounds/bingo-winner.wav",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable-512.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL_CACHE);
      // Individually, so one 404 cannot fail the whole install.
      await Promise.allSettled(SHELL.map((url) => cache.add(url)));
      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys
          .filter((key) => key !== SHELL_CACHE && key !== ASSET_CACHE)
          .map((key) => caches.delete(key))
      );
      await self.clients.claim();
    })()
  );
});

/** Hashed build output and media: the URL changes when the content does. */
function isImmutable(url) {
  return (
    url.pathname.startsWith("/_next/static/") ||
    url.pathname.startsWith("/sounds/") ||
    /\.(png|svg|ico|woff2?)$/.test(url.pathname)
  );
}

/**
 * Media elements ask for byte ranges. The Cache API only stores whole
 * responses, so a range request has to be answered by slicing one into a 206 —
 * handing back the full 200 makes Safari refuse to play the audio.
 */
async function rangeResponse(request, cached) {
  const range = request.headers.get("range");
  if (!range) return cached;

  const match = /bytes=(\d+)-(\d*)/.exec(range);
  if (!match) return cached;

  const body = await cached.arrayBuffer();
  const start = Number(match[1]);
  const end = match[2] ? Math.min(Number(match[2]), body.byteLength - 1) : body.byteLength - 1;
  if (start >= body.byteLength) {
    return new Response(null, {
      status: 416,
      headers: { "Content-Range": `bytes */${body.byteLength}` },
    });
  }

  return new Response(body.slice(start, end + 1), {
    status: 206,
    statusText: "Partial Content",
    headers: {
      "Content-Type": cached.headers.get("Content-Type") || "application/octet-stream",
      "Content-Range": `bytes ${start}-${end}/${body.byteLength}`,
      "Content-Length": String(end - start + 1),
      "Accept-Ranges": "bytes",
    },
  });
}

async function cacheFirst(request) {
  // Searches every cache in the origin: the shell cache holds the precached
  // sounds and icons, while the asset cache fills in with build output.
  const hit = await caches.match(request, { ignoreSearch: false });
  if (hit) return rangeResponse(request, hit);

  const response = await fetch(request);
  if (response.ok && response.status === 200) {
    const cache = await caches.open(ASSET_CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

async function networkFirst(request) {
  const cache = await caches.open(SHELL_CACHE);
  try {
    const response = await fetch(request);
    if (response.ok) cache.put(request, response.clone());
    return response;
  } catch (error) {
    const hit = (await cache.match(request)) || (await cache.match("/game"));
    if (hit) return hit;
    throw error;
  }
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return;

  // React Server Component payloads are per-navigation and version-specific;
  // serving a stale one would mismatch the running build.
  if (url.searchParams.has("_rsc")) return;

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }
  if (isImmutable(url)) {
    event.respondWith(cacheFirst(request));
  }
});
