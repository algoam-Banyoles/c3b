// Configuració del Service Worker
const APP_VERSION = '1.0.0';
const CACHE_NAME = `billar-stats-v${APP_VERSION}`;
const CACHE_PREFIX = 'billar-stats-';

// Recursos a cachear durant la instal·lació
const STATIC_ASSETS = [
  './',
  './index.html',
  './chuecos.html',
  './select-user.html',
  './manage-users.html',
  './manifest.json',
  './config.js',
  './navbar.js',
  './icons/billar-stats-icon-32.png',
  './icons/billar-stats-icon-48.png',
  './icons/billar-stats-icon-72.png',
  './icons/billar-stats-icon-96.png',
  './icons/billar-stats-icon-128.png',
  './icons/billar-stats-icon-152.png',
  './icons/billar-stats-icon-167.png',
  './icons/billar-stats-icon-180.png',
  './icons/billar-stats-icon-192.png',
  './icons/billar-stats-icon-512.png',
  './icons/billar-stats-icon-1024.png'
];

// Recursos externs (CDN)
const EXTERNAL_ASSETS = [
  'https://cdn.jsdelivr.net/npm/chart.js'
];

// Timeout per peticions de xarxa (ms)
const NETWORK_TIMEOUT = 3000;

/**
 * Event d'instal·lació del Service Worker
 * Precarrega els recursos estàtics essencials
 */
self.addEventListener('install', event => {
  console.log(`[SW] Instal·lant Service Worker v${APP_VERSION}`);

  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Precachejant recursos estàtics');
        return cache.addAll(STATIC_ASSETS);
      })
      .then(() => {
        console.log('[SW] Instal·lació completada');
        // Forçar activació immediata
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('[SW] Error durant la instal·lació:', error);
      })
  );
});

/**
 * Event d'activació del Service Worker
 * Neteja caches antigues i pren control de les pàgines
 */
self.addEventListener('activate', event => {
  console.log(`[SW] Activant Service Worker v${APP_VERSION}`);

  event.waitUntil(
    Promise.all([
      // Netejar caches antigues
      cleanupOldCaches(),
      // Prendre control de totes les pàgines immediatament
      self.clients.claim()
    ])
      .then(() => {
        console.log('[SW] Service Worker activat i en control');
      })
  );
});

/**
 * Neteja les caches antigues que no coincideixen amb la versió actual
 */
async function cleanupOldCaches() {
  const cacheNames = await caches.keys();
  const cachesToDelete = cacheNames.filter(cacheName =>
    cacheName.startsWith(CACHE_PREFIX) && cacheName !== CACHE_NAME
  );

  if (cachesToDelete.length > 0) {
    console.log('[SW] Eliminant caches antigues:', cachesToDelete);
    await Promise.all(
      cachesToDelete.map(cacheName => caches.delete(cacheName))
    );
  }
}

/**
 * Event de fetch
 * Estratègia: Network First amb fallback a Cache
 * Això assegura que sempre tenim la versió més recent, però funciona offline
 */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Ignorar peticions que no són GET
  if (request.method !== 'GET') {
    return;
  }

  // Estratègia diferent segons el tipus de recurs
  if (url.origin === location.origin) {
    // Recursos locals: Network First
    event.respondWith(networkFirstStrategy(request));
  } else {
    // Recursos externs (CDN): Cache First
    event.respondWith(cacheFirstStrategy(request));
  }
});

/**
 * Estratègia Network First
 * Intenta obtenir de la xarxa primer, si falla usa la cache
 * Ideal per HTML, CSS, JS que poden canviar
 */
async function networkFirstStrategy(request) {
  try {
    // Intentar obtenir de la xarxa amb timeout
    const networkResponse = await fetchWithTimeout(request, NETWORK_TIMEOUT);

    // Si és exitosa, actualitzar la cache
    if (networkResponse && networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.log('[SW] Network failed, intentant cache:', request.url);

    // Si la xarxa falla, intentar la cache
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Si no hi ha res a la cache, retornar error
    return new Response('Contingut no disponible offline', {
      status: 503,
      statusText: 'Service Unavailable',
      headers: new Headers({
        'Content-Type': 'text/plain'
      })
    });
  }
}

/**
 * Estratègia Cache First
 * Intenta obtenir de la cache primer, si falla usa la xarxa
 * Ideal per recursos externs que canvien poc (CDN, fonts, etc.)
 */
async function cacheFirstStrategy(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse && networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    console.error('[SW] Error obtenint recurs:', request.url, error);
    return new Response('Recurs no disponible', {
      status: 503,
      statusText: 'Service Unavailable'
    });
  }
}

/**
 * Fetch amb timeout per evitar esperes infinites
 */
function fetchWithTimeout(request, timeout) {
  return Promise.race([
    fetch(request),
    new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Network timeout')), timeout)
    )
  ]);
}

/**
 * Gestió de missatges des del client
 * Permet forçar actualitzacions des de la pàgina
 */
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    console.log('[SW] Skip waiting forçat pel client');
    self.skipWaiting();
  }

  if (event.data && event.data.type === 'CLEAR_CACHE') {
    console.log('[SW] Netejant cache per petició del client');
    event.waitUntil(
      caches.delete(CACHE_NAME).then(() => {
        console.log('[SW] Cache eliminada');
      })
    );
  }
});