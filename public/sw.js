// Service Worker for Costa Rica Tree Atlas
// Provides offline support for field use

const STATIC_CACHE = "cr-tree-atlas-static-v2";
const DYNAMIC_CACHE = "cr-tree-atlas-dynamic-v2";

// Static assets to cache on install
// Note: Don't cache "/" as it redirects to locale paths
const STATIC_ASSETS = [
  "/en",
  "/es",
  "/en/trees",
  "/es/trees",
  "/en/identify",
  "/es/identify",
  "/en/compare",
  "/es/compare",
  "/manifest.json",
  "/images/cr-tree-atlas-logo.png",
];

// Install event - cache static assets
self.addEventListener("install", (event) => {
  console.log("[SW] Installing service worker...");
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      console.log("[SW] Pre-caching static assets");
      return cache.addAll(STATIC_ASSETS);
    })
  );
  // Activate immediately
  self.skipWaiting();
});

// Activate event - clean old caches
self.addEventListener("activate", (event) => {
  console.log("[SW] Activating service worker...");
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys
          .filter((key) => key !== STATIC_CACHE && key !== DYNAMIC_CACHE)
          .map((key) => {
            console.log("[SW] Deleting old cache:", key);
            return caches.delete(key);
          })
      );
    })
  );
  // Claim all clients immediately
  self.clients.claim();
});

// Fetch event - network first, cache fallback strategy
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip cross-origin requests
  if (url.origin !== location.origin) {
    return;
  }

  // Skip non-GET requests
  if (request.method !== "GET") {
    return;
  }

  // For HTML pages - network first, cache fallback
  if (request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          // Only cache successful responses
          if (response.ok) {
            const clone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return cached version on network failure
          return caches.match(request).then((cached) => {
            if (cached) return cached;
            // Try locale-specific fallbacks instead of "/"
            const pathname = url.pathname;
            const localeMatch = pathname.match(/^\/(en|es)/);
            const locale = localeMatch ? localeMatch[1] : "en";
            return caches.match(`/${locale}`).then(
              (localeCached) =>
                localeCached ||
                new Response(
                  locale === "es"
                    ? `<!DOCTYPE html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Sin conexión</title><style>body{font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f5f5f5;color:#1a1a1a;text-align:center;padding:1rem}h1{color:#2d5a27}</style></head><body><div><span style="font-size:4rem">🌲</span><h1>Sin conexión</h1><p>Por favor, verifica tu conexión a internet.</p><p><a href="javascript:location.reload()" style="color:#2d5a27">Intentar de nuevo</a></p></div></body></html>`
                    : `<!DOCTYPE html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Offline</title><style>body{font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;background:#f5f5f5;color:#1a1a1a;text-align:center;padding:1rem}h1{color:#2d5a27}</style></head><body><div><span style="font-size:4rem">🌲</span><h1>You're Offline</h1><p>Please check your internet connection.</p><p><a href="javascript:location.reload()" style="color:#2d5a27">Try again</a></p></div></body></html>`,
                  {
                    headers: { "Content-Type": "text/html; charset=utf-8" },
                  }
                )
            );
          });
        })
    );
    return;
  }

  // For images - cache first, network fallback
  if (
    request.destination === "image" ||
    url.pathname.startsWith("/images/")
  ) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) {
          return cached;
        }
        return fetch(request)
          .then((response) => {
            if (response.ok) {
              const clone = response.clone();
              caches.open(DYNAMIC_CACHE).then((cache) => {
                cache.put(request, clone);
              });
            }
            return response;
          })
          .catch(() => {
            // Return placeholder for failed image loads
            return new Response("", { status: 404 });
          });
      })
    );
    return;
  }

  // For other assets (JS, CSS) - stale while revalidate
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetchPromise = fetch(request)
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(DYNAMIC_CACHE).then((cache) => {
              cache.put(request, clone);
            });
          }
          return response;
        })
        .catch(() => {
          // Return empty response for failed asset loads
          return new Response("", { status: 404 });
        });
      return cached || fetchPromise;
    })
  );
});

// Handle messages from the app
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});
