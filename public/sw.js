/* PRIMA offline-first service worker.
   Cache-first for immutable assets and media (fast repeat loads),
   stale-while-revalidate for public pages (instant paints, fresh content).
   Auth-sensitive routes (/admin, /portal, /login, /auth) are never cached. */
const VERSION = "prima-v1";
const ASSET_CACHE = `${VERSION}-assets`;
const PAGE_CACHE = `${VERSION}-pages`;

self.addEventListener("install", () => {
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => !key.startsWith(VERSION))
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  const response = await fetch(request);
  if (response.ok) {
    const cache = await caches.open(ASSET_CACHE);
    cache.put(request, response.clone());
  }
  return response;
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(PAGE_CACHE);
  const cached = await cache.match(request);
  const network = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => cached);
  return cached || network;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  const isImmutableAsset = url.pathname.startsWith("/_next/static/");
  const isMedia =
    url.pathname.startsWith("/_next/image") ||
    url.href.includes("/storage/v1/object/public/public-media/") ||
    /\.(png|webp|jpe?g|svg|ico|woff2?)$/.test(url.pathname);

  if (isImmutableAsset || isMedia) {
    event.respondWith(cacheFirst(request));
    return;
  }

  const isPrivate = /^\/(admin|portal|login|auth|api)(\/|$)/.test(url.pathname);
  if (
    request.mode === "navigate" &&
    url.origin === self.location.origin &&
    !isPrivate
  ) {
    event.respondWith(staleWhileRevalidate(request));
  }
});
