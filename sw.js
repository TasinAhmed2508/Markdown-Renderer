/**
 * Service Worker for TA RenderX
 * Cache-first for local assets, network-first for CDN resources
 */

const CACHE_NAME = 'renderx-v4';

const APP_SHELL = [
    './',
    './index.html',
    './js/main.js',
    './css/base/variables.css',
    './css/base/reset.css',
    './css/base/scrollbar.css',
    './css/layout/layout.css',
    './css/components/navbar.css',
    './css/components/buttons.css',
    './css/components/glass-pane.css',
    './css/components/editor.css',
    './css/components/editor-toolbar.css',
    './css/components/linenumbers.css',
    './css/components/loader.css',
    './css/components/embeds.css',
    './css/components/swatches.css',
    './css/components/controls.css',
    './css/components/math.css',
    './css/components/tables.css',
    './css/components/diagrams.css',
    './css/components/code-blocks.css',
    './css/themes/light.css',
    './css/themes/sunset.css',
    './css/themes/ocean.css',
    './css/themes/forest.css',
    './css/themes/dark.css',
    './css/responsive/mobile.css',
    './css/print/pdf-styles.css',
    './manifest.json'
];

// Install: cache the app shell
self.addEventListener('install', (event) => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(APP_SHELL).catch((err) => {
                console.warn('SW: Some assets failed to cache during install:', err);
            });
        })
    );
});

// Activate: clean up old caches and force clients to reload
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((key) => key !== CACHE_NAME)
                    .map((key) => caches.delete(key))
            );
        }).then(() => self.clients.claim())
          .then(() => {
              // Notify all clients to reload with fresh code
              return self.clients.matchAll({ type: 'window' }).then(clients => {
                  clients.forEach(client => client.navigate(client.url));
              });
          })
    );
});

// Fetch: network-first for local assets, network-first for CDN
self.addEventListener('fetch', (event) => {
    const url = new URL(event.request.url);

    // Network-first for CDN / external resources
    if (url.origin !== self.location.origin) {
        event.respondWith(
            fetch(event.request)
                .then((response) => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                    return response;
                })
                .catch(() => caches.match(event.request))
        );
        return;
    }

    // Network-first for local assets (always get fresh code, cache as offline fallback)
    event.respondWith(
        fetch(event.request)
            .then((response) => {
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
                }
                return response;
            })
            .catch(() => {
                return caches.match(event.request).then((cached) => {
                    if (cached) return cached;
                    // Offline fallback for navigation
                    if (event.request.mode === 'navigate') {
                        return caches.match('./index.html');
                    }
                });
            })
    );
});
