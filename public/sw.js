const CACHE_NAME = 'aurora-luxe-v1'
const STATIC_CACHE = 'aurora-static-v1'
const DYNAMIC_CACHE = 'aurora-dynamic-v1'

// Files to cache immediately
const STATIC_ASSETS = [
  '/',
  '/aurora-index.html',
  '/manifest.json',
  '/music.json',
]

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('Service Worker: Installing...')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Service Worker: Caching static assets')
        return cache.addAll(STATIC_ASSETS)
      })
      .then(() => {
        console.log('Service Worker: Static assets cached')
        return self.skipWaiting()
      })
      .catch((error) => {
        console.error('Service Worker: Failed to cache static assets', error)
      })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker: Activating...')
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== DYNAMIC_CACHE) {
              console.log('Service Worker: Deleting old cache', cacheName)
              return caches.delete(cacheName)
            }
          })
        )
      })
      .then(() => {
        console.log('Service Worker: Activated')
        return self.clients.claim()
      })
  )
})

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event
  const url = new URL(request.url)
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }
  
  // Skip external requests (except for images and audio)
  if (url.origin !== location.origin && 
      !request.url.includes('imgur.com') && 
      !request.url.includes('archive.org') &&
      !request.url.includes('cdn.example.com')) {
    return
  }
  
  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // Return cached version if available
        if (cachedResponse) {
          console.log('Service Worker: Serving from cache', request.url)
          return cachedResponse
        }
        
        // Otherwise fetch from network
        return fetch(request)
          .then((networkResponse) => {
            // Don't cache if not a valid response
            if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
              return networkResponse
            }
            
            // Clone the response
            const responseToCache = networkResponse.clone()
            
            // Determine which cache to use
            let cacheName = DYNAMIC_CACHE
            
            // Cache static assets in static cache
            if (STATIC_ASSETS.includes(url.pathname) || 
                request.url.includes('.js') || 
                request.url.includes('.css') ||
                request.url.includes('music.json')) {
              cacheName = STATIC_CACHE
            }
            
            // Cache the response
            caches.open(cacheName)
              .then((cache) => {
                console.log('Service Worker: Caching new resource', request.url)
                cache.put(request, responseToCache)
              })
              .catch((error) => {
                console.error('Service Worker: Failed to cache', request.url, error)
              })
            
            return networkResponse
          })
          .catch((error) => {
            console.error('Service Worker: Fetch failed', request.url, error)
            
            // Return offline fallback for navigation requests
            if (request.destination === 'document') {
              return caches.match('/')
            }
            
            // Return a generic offline response for other requests
            return new Response('Offline', {
              status: 503,
              statusText: 'Service Unavailable',
              headers: new Headers({
                'Content-Type': 'text/plain'
              })
            })
          })
      })
  )
})

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Service Worker: Background sync', event.tag)
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Perform background sync tasks
      syncOfflineActions()
    )
  }
})

// Push notifications (for future use)
self.addEventListener('push', (event) => {
  console.log('Service Worker: Push received', event)
  
  const options = {
    body: event.data ? event.data.text() : 'New music available!',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'Explore',
        icon: '/icons/icon-96x96.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/icon-96x96.png'
      }
    ]
  }
  
  event.waitUntil(
    self.registration.showNotification('Aurora Luxe Music', options)
  )
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  console.log('Service Worker: Notification clicked', event)
  
  event.notification.close()
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/')
    )
  }
})

// Helper function for background sync
async function syncOfflineActions() {
  try {
    // Sync any offline actions stored in IndexedDB
    console.log('Service Worker: Syncing offline actions')
    
    // This would typically involve:
    // 1. Reading offline actions from IndexedDB
    // 2. Sending them to the server
    // 3. Clearing them from IndexedDB on success
    
    return Promise.resolve()
  } catch (error) {
    console.error('Service Worker: Background sync failed', error)
    throw error
  }
}

// Message handler for communication with main thread
self.addEventListener('message', (event) => {
  console.log('Service Worker: Message received', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: CACHE_NAME })
  }
})

