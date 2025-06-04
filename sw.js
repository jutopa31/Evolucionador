/**
 * 🔧 Service Worker - Suite Neurología v2.1.0
 * Proporciona funcionalidad offline y PWA features
 */

const CACHE_NAME = 'suite-neurologia-v2.1.0';
const CACHE_VERSION = '2.1.0';
const OFFLINE_URL = '/offline.html';

// Recursos críticos para cachear
const CRITICAL_RESOURCES = [
    '/',
    '/index.html',
    '/app.js',
    '/style.css',
    '/modules/index.js',
    '/modules/core/logger.js',
    '/modules/core/error-manager.js',
    '/modules/state/app-state-manager.js',
    '/modules/storage/storage-manager.js',
    '/modules/ui/dom-helpers.js',
    '/modules/ui/renderers.js',
    '/modules/events/event-manager.js',
    '/modules/business/note-builder.js',
    '/modules/business/medication-manager.js',
    '/medications-data.js',
    '/offline.html'
];

// Recursos estáticos para cachear
const STATIC_RESOURCES = [
    '/test-demo.html',
    '/aspects.html',
    '/parkinson.html',
    '/nihss.html',
    '/espasticidad.html',
    '/miastenia-gravis.html',
    '/aspects.js',
    '/parkinson.js',
    '/nihss.js',
    '/espasticidad.js',
    '/miastenia-gravis.js',
    '/asistente-diagnostico.js'
];

// APIs que pueden funcionar offline
const OFFLINE_APIS = [
    '/api/medications',
    '/api/templates',
    '/api/settings'
];

/**
 * Evento de instalación del Service Worker
 */
self.addEventListener('install', (event) => {
    console.log('🔧 Service Worker: Instalando...');
    
    event.waitUntil(
        (async () => {
            try {
                // Abrir cache
                const cache = await caches.open(CACHE_NAME);
                
                // Cachear recursos críticos
                console.log('📦 Cacheando recursos críticos...');
                await cache.addAll(CRITICAL_RESOURCES);
                
                // Cachear recursos estáticos (sin fallar si alguno no existe)
                console.log('📦 Cacheando recursos estáticos...');
                await Promise.allSettled(
                    STATIC_RESOURCES.map(url => 
                        cache.add(url).catch(err => 
                            console.warn(`Advertencia cacheando ${url}:`, err)
                        )
                    )
                );
                
                console.log('✅ Service Worker instalado correctamente');
                
                // Forzar activación inmediata
                self.skipWaiting();
                
            } catch (error) {
                console.error('❌ Error instalando Service Worker:', error);
            }
        })()
    );
});

/**
 * Evento de activación del Service Worker
 */
self.addEventListener('activate', (event) => {
    console.log('🔧 Service Worker: Activando...');
    
    event.waitUntil(
        (async () => {
            try {
                // Limpiar caches antiguos
                const cacheNames = await caches.keys();
                const oldCaches = cacheNames.filter(name => 
                    name.startsWith('suite-neurologia-') && name !== CACHE_NAME
                );
                
                if (oldCaches.length > 0) {
                    console.log('🧹 Limpiando caches antiguos:', oldCaches);
                    await Promise.all(
                        oldCaches.map(name => caches.delete(name))
                    );
                }
                
                // Tomar control de todas las pestañas
                await self.clients.claim();
                
                console.log('✅ Service Worker activado correctamente');
                
                // Notificar a los clientes sobre la activación
                const clients = await self.clients.matchAll();
                clients.forEach(client => {
                    client.postMessage({
                        type: 'SW_ACTIVATED',
                        version: CACHE_VERSION
                    });
                });
                
            } catch (error) {
                console.error('❌ Error activando Service Worker:', error);
            }
        })()
    );
});

/**
 * Evento de fetch - Intercepta todas las peticiones de red
 */
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);
    
    // Solo manejar peticiones del mismo origen
    if (url.origin !== location.origin) {
        return;
    }
    
    event.respondWith(handleFetch(request));
});

/**
 * Maneja las peticiones de red con estrategias de cache
 */
async function handleFetch(request) {
    const url = new URL(request.url);
    const pathname = url.pathname;
    
    try {
        // Estrategia para diferentes tipos de recursos
        if (isCriticalResource(pathname)) {
            return await cacheFirst(request);
        } else if (isStaticResource(pathname)) {
            return await staleWhileRevalidate(request);
        } else if (isApiRequest(pathname)) {
            return await networkFirst(request);
        } else if (isNavigationRequest(request)) {
            return await handleNavigation(request);
        } else {
            return await networkFirst(request);
        }
        
    } catch (error) {
        console.error('❌ Error en fetch:', error);
        return await handleFetchError(request, error);
    }
}

/**
 * Estrategia Cache First - Para recursos críticos
 */
async function cacheFirst(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        throw new Error(`Cache first failed: ${error.message}`);
    }
}

/**
 * Estrategia Network First - Para APIs y contenido dinámico
 */
async function networkFirst(request) {
    try {
        const networkResponse = await fetch(request);
        
        if (networkResponse.ok) {
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, networkResponse.clone());
        }
        
        return networkResponse;
        
    } catch (error) {
        const cache = await caches.open(CACHE_NAME);
        const cachedResponse = await cache.match(request);
        
        if (cachedResponse) {
            return cachedResponse;
        }
        
        throw error;
    }
}

/**
 * Estrategia Stale While Revalidate - Para recursos estáticos
 */
async function staleWhileRevalidate(request) {
    const cache = await caches.open(CACHE_NAME);
    const cachedResponse = await cache.match(request);
    
    // Actualizar cache en background
    const fetchPromise = fetch(request).then(networkResponse => {
        if (networkResponse.ok) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    }).catch(error => {
        console.warn('Error actualizando cache:', error);
    });
    
    // Retornar respuesta cacheada inmediatamente si existe
    if (cachedResponse) {
        return cachedResponse;
    }
    
    // Si no hay cache, esperar la respuesta de red
    return await fetchPromise;
}

/**
 * Maneja peticiones de navegación
 */
async function handleNavigation(request) {
    try {
        return await networkFirst(request);
    } catch (error) {
        // Si falla la navegación, mostrar página offline
        const cache = await caches.open(CACHE_NAME);
        const offlinePage = await cache.match(OFFLINE_URL);
        
        if (offlinePage) {
            return offlinePage;
        }
        
        // Fallback básico si no hay página offline
        return new Response(
            generateOfflineHTML(),
            {
                status: 200,
                statusText: 'OK',
                headers: { 'Content-Type': 'text/html' }
            }
        );
    }
}

/**
 * Maneja errores de fetch
 */
async function handleFetchError(request, error) {
    const url = new URL(request.url);
    
    if (isNavigationRequest(request)) {
        return await handleNavigation(request);
    }
    
    if (isApiRequest(url.pathname)) {
        return new Response(
            JSON.stringify({
                error: 'Offline',
                message: 'No hay conexión a internet',
                offline: true
            }),
            {
                status: 503,
                statusText: 'Service Unavailable',
                headers: { 'Content-Type': 'application/json' }
            }
        );
    }
    
    throw error;
}

/**
 * Verifica si es un recurso crítico
 */
function isCriticalResource(pathname) {
    return CRITICAL_RESOURCES.includes(pathname);
}

/**
 * Verifica si es un recurso estático
 */
function isStaticResource(pathname) {
    return STATIC_RESOURCES.includes(pathname) ||
           pathname.endsWith('.css') ||
           pathname.endsWith('.js') ||
           pathname.endsWith('.png') ||
           pathname.endsWith('.jpg') ||
           pathname.endsWith('.svg');
}

/**
 * Verifica si es una petición a API
 */
function isApiRequest(pathname) {
    return pathname.startsWith('/api/') ||
           OFFLINE_APIS.some(api => pathname.startsWith(api));
}

/**
 * Verifica si es una petición de navegación
 */
function isNavigationRequest(request) {
    return request.mode === 'navigate' ||
           (request.method === 'GET' && 
            request.headers.get('accept').includes('text/html'));
}

/**
 * Genera HTML básico para página offline
 */
function generateOfflineHTML() {
    return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Suite Neurología - Offline</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            margin: 0;
            padding: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            text-align: center;
        }
        .container {
            max-width: 500px;
            background: rgba(255, 255, 255, 0.1);
            padding: 40px;
            border-radius: 20px;
            backdrop-filter: blur(10px);
            box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
        }
        h1 {
            font-size: 2.5em;
            margin-bottom: 20px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
        p {
            font-size: 1.2em;
            line-height: 1.6;
            margin-bottom: 30px;
        }
        .icon {
            font-size: 4em;
            margin-bottom: 20px;
        }
        .retry-btn {
            background: rgba(255, 255, 255, 0.2);
            border: 2px solid white;
            color: white;
            padding: 15px 30px;
            border-radius: 50px;
            font-size: 1.1em;
            cursor: pointer;
            transition: all 0.3s ease;
        }
        .retry-btn:hover {
            background: rgba(255, 255, 255, 0.3);
            transform: translateY(-2px);
        }
        .features {
            margin-top: 30px;
            text-align: left;
        }
        .feature {
            margin: 10px 0;
            padding: 10px;
            background: rgba(255, 255, 255, 0.1);
            border-radius: 10px;
        }
    </style>
</head>
<body>
    <div class="container">
        <div class="icon">🧠</div>
        <h1>Suite Neurología</h1>
        <p>No hay conexión a internet, pero puedes seguir trabajando con las funcionalidades offline.</p>
        
        <div class="features">
            <div class="feature">✅ Crear y editar notas médicas</div>
            <div class="feature">✅ Gestionar medicamentos</div>
            <div class="feature">✅ Usar plantillas guardadas</div>
            <div class="feature">✅ Acceder a datos locales</div>
        </div>
        
        <button class="retry-btn" onclick="window.location.reload()">
            🔄 Reintentar Conexión
        </button>
    </div>
</body>
</html>`;
}

/**
 * Maneja mensajes desde la aplicación principal
 */
self.addEventListener('message', (event) => {
    const { type, data } = event.data;
    
    switch (type) {
        case 'SKIP_WAITING':
            self.skipWaiting();
            break;
            
        case 'GET_VERSION':
            event.ports[0].postMessage({
                version: CACHE_VERSION,
                cacheName: CACHE_NAME
            });
            break;
            
        case 'CLEAR_CACHE':
            clearAllCaches().then(() => {
                event.ports[0].postMessage({ success: true });
            }).catch(error => {
                event.ports[0].postMessage({ success: false, error: error.message });
            });
            break;
            
        case 'CACHE_RESOURCE':
            cacheResource(data.url).then(() => {
                event.ports[0].postMessage({ success: true });
            }).catch(error => {
                event.ports[0].postMessage({ success: false, error: error.message });
            });
            break;
    }
});

/**
 * Limpia todos los caches
 */
async function clearAllCaches() {
    const cacheNames = await caches.keys();
    await Promise.all(
        cacheNames.map(name => caches.delete(name))
    );
    console.log('🧹 Todos los caches limpiados');
}

/**
 * Cachea un recurso específico
 */
async function cacheResource(url) {
    const cache = await caches.open(CACHE_NAME);
    await cache.add(url);
    console.log(`📦 Recurso cacheado: ${url}`);
}

/**
 * Evento de sincronización en background
 */
self.addEventListener('sync', (event) => {
    if (event.tag === 'background-sync') {
        event.waitUntil(doBackgroundSync());
    }
});

/**
 * Realiza sincronización en background
 */
async function doBackgroundSync() {
    try {
        console.log('🔄 Ejecutando sincronización en background...');
        
        // Aquí se pueden sincronizar datos pendientes
        // Por ejemplo, enviar notas médicas guardadas offline
        
        const clients = await self.clients.matchAll();
        clients.forEach(client => {
            client.postMessage({
                type: 'BACKGROUND_SYNC_COMPLETE'
            });
        });
        
    } catch (error) {
        console.error('❌ Error en sincronización background:', error);
    }
}

/**
 * Evento de notificación push
 */
self.addEventListener('push', (event) => {
    if (!event.data) return;
    
    const data = event.data.json();
    const options = {
        body: data.body,
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: data.data,
        actions: [
            {
                action: 'open',
                title: 'Abrir',
                icon: '/icon-open.png'
            },
            {
                action: 'close',
                title: 'Cerrar',
                icon: '/icon-close.png'
            }
        ]
    };
    
    event.waitUntil(
        self.registration.showNotification(data.title, options)
    );
});

/**
 * Evento de click en notificación
 */
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'open') {
        event.waitUntil(
            clients.openWindow('/')
        );
    }
});

console.log('🔧 Service Worker cargado - Suite Neurología v2.1.0'); 