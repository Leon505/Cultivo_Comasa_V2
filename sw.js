// Aumentamos la versión a v7 para forzar a los celulares a reinstalar la memoria
const CACHE_NAME = 'cultivo-comasa-v8'; 

const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './manifest.json',
  './LOGO.png', // VERIFICA: Debe coincidir exactamente con el nombre en GitHub (mayúsculas/minúsculas)
  './icon-192x192.png',
  './icon-512x512.png'
];

// 1. Instalación blindada: guarda archivo por archivo con manejo de errores
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async cache => {
      for (const url of urlsToCache) {
        try {
          await cache.add(url);
        } catch (err) {
          console.error('Error guardando en caché:', url, err);
        }
      }
    })
  );
});

// 2. Activación: Borra la memoria antigua y toma el control de inmediato
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
    }).then(() => self.clients.claim())
  );
});

// 3. Respuesta Offline: Si no hay red, sirve los archivos desde la memoria interna
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      // Si el archivo está guardado en la memoria local, lo entrega de inmediato
      if (cachedResponse) {
        return cachedResponse;
      }
      
      // Si no está guardado, intenta buscarlo en internet
      return fetch(event.request).catch(() => {
        // Si no hay internet y el usuario entra a la app, entrega la pantalla principal guardada
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html') || caches.match('./');
        }
      });
    })
  );
});
