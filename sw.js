/* Offline shell. One version bump invalidates everything, which is the right
   trade-off for a single-file app: there is nothing to partially update. */
const CACHE = 'vlaams-v2';
const ASSETS = ['./', './index.html', './manifest.webmanifest', './icons/icon.svg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);

  /* Google Fonts: cache on first success, then serve from cache forever. */
  if (url.hostname.indexOf('fonts.g') === 0 || url.hostname.indexOf('fonts.gstatic') === 0) {
    e.respondWith(caches.match(req).then(hit => hit || fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy));
      return res;
    }).catch(() => hit)));
    return;
  }

  /* App shell: network first so a rebuild lands, cache as the offline fallback. */
  if (url.origin === location.origin) {
    e.respondWith(fetch(req).then(res => {
      const copy = res.clone();
      caches.open(CACHE).then(c => c.put(req, copy));
      return res;
    }).catch(() => caches.match(req).then(hit => hit || caches.match('./index.html'))));
  }
});
