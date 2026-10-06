/**
 * Offline cache for the installed app.
 *
 * Network-first with a cache fallback, so a redeploy is picked up as soon as the
 * phone is online and the app still opens with no signal. No cache-version
 * constant is needed because a stale entry can never outlive a successful fetch.
 */

const CACHE_NAME = 'bio-exam-terms-shell';

const SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable-512.png',
  './apple-touch-icon.png',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(SHELL))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((names) =>
        Promise.all(names.filter((name) => name !== CACHE_NAME).map((name) => caches.delete(name))),
      )
      .then(() => self.clients.claim()),
  );
});

async function offlineResponse(request) {
  const cached = await caches.match(request);
  if (cached !== undefined) {
    return cached;
  }
  const shell = await caches.match('./index.html');
  if (shell !== undefined) {
    return shell;
  }
  return new Response('离线，且本机没有缓存内容。', {
    status: 503,
    headers: { 'Content-Type': 'text/plain; charset=utf-8' },
  });
}

self.addEventListener('fetch', (event) => {
  const request = event.request;
  if (request.method !== 'GET') {
    return;
  }
  if (new URL(request.url).origin !== self.location.origin) {
    return;
  }
  event.respondWith(
    fetch(request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
        return response;
      })
      .catch(() => offlineResponse(request)),
  );
});
