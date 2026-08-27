/* FotoJoe APP · GETIN V26.2
   Absichtlich kein API-/Upload-Caching.
   Navigation: Netzwerk zuerst, damit GETIN-Updates sofort greifen.
*/
const APP_CACHE = "fotojoe-app-v26-2-stabil-repair-20260827";
const STATIC = [
  "/app/offline.html",
  "/app/manifest.webmanifest",
  "/app/icons/icon-192-v26.png",
  "/app/icons/icon-512-v26.png",
  "/app/icons/icon-maskable-512-v26.png",
  "/app/icons/apple-touch-icon-180-v26.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(APP_CACHE)
      .then(cache => cache.addAll(STATIC))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== APP_CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  const req = event.request;
  const url = new URL(req.url);

  // POST/PUT/PATCH/DELETE sowie das zentrale Backend niemals cachen oder verändern.
  if (req.method !== "GET") return;
  if (url.origin !== self.location.origin) return;
  if (!url.pathname.startsWith("/app/")) return;

  if (req.mode === "navigate") {
    event.respondWith(
      fetch(req, {cache:"no-store"})
        .catch(() => caches.match("/app/offline.html"))
    );
    return;
  }

  // Nur die kleinen PWA-Hilfsdateien aus dem Cache liefern.
  if (
    url.pathname === "/app/manifest.webmanifest" ||
    url.pathname === "/app/offline.html" ||
    url.pathname.startsWith("/app/icons/")
  ) {
    event.respondWith(
      caches.match(req).then(hit => hit || fetch(req))
    );
  }
});
