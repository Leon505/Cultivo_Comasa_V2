const CACHE_NAME = 'cultivo-comasa-v3'; // Pasamos a la versión 3

const urlsToCache = [
    './',
    './index.html',
    './style.css',
    './app.js',
    './manifest.json',
    './LOGO.png'
];

// Evento de instalación: Fuerza al nuevo Service Worker a instalarse de inmediato
self.addEventListener('install', event => {
    self.skipWaiting(); // <-- NUEVO: No espera a que cierres la app
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(urlsToCache))
    );
});

// Evento de activación (NUEVO): Borra la caché vieja para liberar espacio y toma el control
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheName !== CACHE_NAME) {
                        console.log('Borrando caché antigua:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim()) // <-- NUEVO: Aplica el nuevo código a las ventanas abiertas
    );
});

// Evento fetch: ESTO GARANTIZA QUE FUNCIONE SIN INTERNET (Queda igual)
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                if (response) return response;
                return fetch(event.request);
            })
    );
});
