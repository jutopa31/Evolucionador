/**
 * 📱 PWA Manager
 * Gestiona funcionalidades de Progressive Web App
 */

class PWAManager {
    constructor() {
        this.isInstalled = false;
        this.isInstallable = false;
        this.deferredPrompt = null;
        this.swRegistration = null;
        this.updateAvailable = false;
        
        this.config = {
            enableInstallPrompt: true,
            enableUpdateNotifications: true,
            enableOfflineIndicator: true,
            enablePushNotifications: false,
            autoUpdate: false
        };
        
        this.initializePWA();
    }

    /**
     * Inicializa las funcionalidades PWA
     */
    async initializePWA() {
        console.log('📱 Inicializando PWA Manager...');
        
        try {
            // Verificar soporte PWA
            this.checkPWASupport();
            
            // Registrar Service Worker
            await this.registerServiceWorker();
            
            // Configurar eventos de instalación
            this.setupInstallEvents();
            
            // Configurar indicador offline
            if (this.config.enableOfflineIndicator) {
                this.setupOfflineIndicator();
            }
            
            // Verificar si ya está instalado
            this.checkInstallationStatus();
            
            // Configurar actualizaciones
            this.setupUpdateHandling();
            
            console.log('✅ PWA Manager inicializado');
            
        } catch (error) {
            console.error('❌ Error inicializando PWA:', error);
        }
    }

    /**
     * Verifica soporte para PWA
     */
    checkPWASupport() {
        const support = {
            serviceWorker: 'serviceWorker' in navigator,
            manifest: 'manifest' in document.createElement('link'),
            installPrompt: 'onbeforeinstallprompt' in window,
            pushNotifications: 'PushManager' in window,
            notifications: 'Notification' in window,
            backgroundSync: 'serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype
        };
        
        console.log('📱 Soporte PWA:', support);
        
        // Emitir evento con información de soporte
        if (window.EventManager) {
            window.EventManager.emit('pwaSupport', support);
        }
        
        return support;
    }

    /**
     * Registra el Service Worker
     */
    async registerServiceWorker() {
        if (!('serviceWorker' in navigator)) {
            throw new Error('Service Workers no soportados');
        }
        
        try {
            console.log('🔧 Registrando Service Worker...');
            
            this.swRegistration = await navigator.serviceWorker.register('/sw.js', {
                scope: '/'
            });
            
            console.log('✅ Service Worker registrado:', this.swRegistration);
            
            // Configurar listeners para el SW
            this.setupServiceWorkerListeners();
            
            return this.swRegistration;
            
        } catch (error) {
            console.error('❌ Error registrando Service Worker:', error);
            throw error;
        }
    }

    /**
     * Configura listeners para el Service Worker
     */
    setupServiceWorkerListeners() {
        if (!this.swRegistration) return;
        
        // Listener para actualizaciones
        this.swRegistration.addEventListener('updatefound', () => {
            const newWorker = this.swRegistration.installing;
            
            newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    this.updateAvailable = true;
                    this.showUpdateNotification();
                }
            });
        });
        
        // Listener para mensajes del SW
        navigator.serviceWorker.addEventListener('message', (event) => {
            this.handleServiceWorkerMessage(event);
        });
        
        // Listener para cambios de estado
        navigator.serviceWorker.addEventListener('controllerchange', () => {
            console.log('🔄 Service Worker controller cambió');
            if (this.config.autoUpdate) {
                window.location.reload();
            }
        });
    }

    /**
     * Maneja mensajes del Service Worker
     */
    handleServiceWorkerMessage(event) {
        const { type, data } = event.data;
        
        switch (type) {
            case 'SW_ACTIVATED':
                console.log('✅ Service Worker activado, versión:', data.version);
                break;
                
            case 'BACKGROUND_SYNC_COMPLETE':
                console.log('🔄 Sincronización background completada');
                this.showNotification('Datos sincronizados', 'Los datos se han sincronizado correctamente');
                break;
                
            case 'CACHE_UPDATED':
                console.log('📦 Cache actualizado');
                break;
        }
        
        // Emitir evento para la aplicación
        if (window.EventManager) {
            window.EventManager.emit('serviceWorkerMessage', { type, data });
        }
    }

    /**
     * Configura eventos de instalación
     */
    setupInstallEvents() {
        // Evento beforeinstallprompt
        window.addEventListener('beforeinstallprompt', (event) => {
            console.log('📱 Evento beforeinstallprompt detectado');
            
            // Prevenir el prompt automático
            event.preventDefault();
            
            // Guardar el evento para uso posterior
            this.deferredPrompt = event;
            this.isInstallable = true;
            
            // Mostrar botón de instalación personalizado
            if (this.config.enableInstallPrompt) {
                this.showInstallButton();
            }
            
            // Emitir evento
            if (window.EventManager) {
                window.EventManager.emit('pwaInstallable', { installable: true });
            }
        });
        
        // Evento appinstalled
        window.addEventListener('appinstalled', (event) => {
            console.log('✅ PWA instalada exitosamente');
            this.isInstalled = true;
            this.isInstallable = false;
            this.deferredPrompt = null;
            
            this.hideInstallButton();
            this.showNotification('¡Instalación exitosa!', 'Suite Neurología se ha instalado correctamente');
            
            // Emitir evento
            if (window.EventManager) {
                window.EventManager.emit('pwaInstalled', { installed: true });
            }
        });
    }

    /**
     * Muestra el botón de instalación
     */
    showInstallButton() {
        // Verificar si ya existe
        if (document.getElementById('pwa-install-button')) return;
        
        const installButton = document.createElement('button');
        installButton.id = 'pwa-install-button';
        installButton.innerHTML = '📱 Instalar App';
        installButton.className = 'pwa-install-btn';
        
        // Estilos del botón
        installButton.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 12px 20px;
            border-radius: 25px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
            z-index: 10000;
            transition: all 0.3s ease;
            animation: slideInUp 0.5s ease;
        `;
        
        // Agregar animación CSS
        if (!document.getElementById('pwa-animations')) {
            const style = document.createElement('style');
            style.id = 'pwa-animations';
            style.textContent = `
                @keyframes slideInUp {
                    from { transform: translateY(100px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                .pwa-install-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
                }
            `;
            document.head.appendChild(style);
        }
        
        // Event listener para instalación
        installButton.addEventListener('click', () => {
            this.promptInstall();
        });
        
        document.body.appendChild(installButton);
        console.log('📱 Botón de instalación mostrado');
    }

    /**
     * Oculta el botón de instalación
     */
    hideInstallButton() {
        const installButton = document.getElementById('pwa-install-button');
        if (installButton) {
            installButton.style.animation = 'slideOutDown 0.5s ease';
            setTimeout(() => {
                installButton.remove();
            }, 500);
        }
    }

    /**
     * Solicita la instalación de la PWA
     */
    async promptInstall() {
        if (!this.deferredPrompt) {
            console.warn('No hay prompt de instalación disponible');
            return false;
        }
        
        try {
            console.log('📱 Solicitando instalación...');
            
            // Mostrar el prompt
            this.deferredPrompt.prompt();
            
            // Esperar la respuesta del usuario
            const { outcome } = await this.deferredPrompt.userChoice;
            
            console.log('📱 Respuesta del usuario:', outcome);
            
            if (outcome === 'accepted') {
                console.log('✅ Usuario aceptó la instalación');
            } else {
                console.log('❌ Usuario rechazó la instalación');
            }
            
            // Limpiar el prompt
            this.deferredPrompt = null;
            this.isInstallable = false;
            
            return outcome === 'accepted';
            
        } catch (error) {
            console.error('❌ Error en instalación:', error);
            return false;
        }
    }

    /**
     * Verifica el estado de instalación
     */
    checkInstallationStatus() {
        // Verificar si se ejecuta como PWA instalada
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                            window.navigator.standalone ||
                            document.referrer.includes('android-app://');
        
        this.isInstalled = isStandalone;
        
        console.log('📱 Estado de instalación:', {
            isInstalled: this.isInstalled,
            isInstallable: this.isInstallable,
            displayMode: window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser'
        });
        
        // Emitir evento
        if (window.EventManager) {
            window.EventManager.emit('pwaStatus', {
                isInstalled: this.isInstalled,
                isInstallable: this.isInstallable
            });
        }
    }

    /**
     * Configura el indicador de estado offline
     */
    setupOfflineIndicator() {
        const updateOnlineStatus = () => {
            const isOnline = navigator.onLine;
            this.showConnectionStatus(isOnline);
            
            // Emitir evento
            if (window.EventManager) {
                window.EventManager.emit('connectionChange', { online: isOnline });
            }
        };
        
        window.addEventListener('online', updateOnlineStatus);
        window.addEventListener('offline', updateOnlineStatus);
        
        // Estado inicial
        updateOnlineStatus();
    }

    /**
     * Muestra el estado de conexión
     */
    showConnectionStatus(isOnline) {
        // Remover indicador anterior
        const existingIndicator = document.getElementById('connection-indicator');
        if (existingIndicator) {
            existingIndicator.remove();
        }
        
        if (!isOnline) {
            const indicator = document.createElement('div');
            indicator.id = 'connection-indicator';
            indicator.innerHTML = '📡 Modo Offline';
            indicator.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: #ff6b6b;
                color: white;
                text-align: center;
                padding: 8px;
                font-size: 14px;
                font-weight: 600;
                z-index: 10001;
                animation: slideInDown 0.3s ease;
            `;
            
            document.body.appendChild(indicator);
        }
    }

    /**
     * Configura manejo de actualizaciones
     */
    setupUpdateHandling() {
        if (!this.config.enableUpdateNotifications) return;
        
        // Verificar actualizaciones periódicamente
        setInterval(() => {
            this.checkForUpdates();
        }, 60000); // Cada minuto
    }

    /**
     * Verifica si hay actualizaciones disponibles
     */
    async checkForUpdates() {
        if (!this.swRegistration) return;
        
        try {
            await this.swRegistration.update();
        } catch (error) {
            console.warn('Error verificando actualizaciones:', error);
        }
    }

    /**
     * Muestra notificación de actualización
     */
    showUpdateNotification() {
        if (!this.config.enableUpdateNotifications) return;
        
        const notification = document.createElement('div');
        notification.id = 'update-notification';
        notification.innerHTML = `
            <div style="display: flex; align-items: center; justify-content: space-between;">
                <span>🔄 Nueva versión disponible</span>
                <div>
                    <button onclick="window.PWAManager.applyUpdate()" style="margin-left: 10px; padding: 5px 10px; background: #4CAF50; color: white; border: none; border-radius: 3px; cursor: pointer;">Actualizar</button>
                    <button onclick="this.parentElement.parentElement.parentElement.remove()" style="margin-left: 5px; padding: 5px 10px; background: #f44336; color: white; border: none; border-radius: 3px; cursor: pointer;">Después</button>
                </div>
            </div>
        `;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 15px;
            box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
            z-index: 10002;
            max-width: 300px;
            animation: slideInRight 0.5s ease;
        `;
        
        document.body.appendChild(notification);
        
        // Auto-remover después de 10 segundos
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 10000);
    }

    /**
     * Aplica la actualización disponible
     */
    async applyUpdate() {
        if (!this.swRegistration || !this.updateAvailable) return;
        
        try {
            console.log('🔄 Aplicando actualización...');
            
            // Enviar mensaje al SW para que se active
            if (this.swRegistration.waiting) {
                this.swRegistration.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
            
            // Remover notificación
            const notification = document.getElementById('update-notification');
            if (notification) {
                notification.remove();
            }
            
            // Mostrar indicador de actualización
            this.showNotification('Actualizando...', 'La aplicación se está actualizando');
            
        } catch (error) {
            console.error('❌ Error aplicando actualización:', error);
        }
    }

    /**
     * Muestra una notificación del sistema
     */
    async showNotification(title, body, options = {}) {
        // Verificar soporte y permisos
        if (!('Notification' in window)) {
            console.warn('Notificaciones no soportadas');
            return;
        }
        
        let permission = Notification.permission;
        
        if (permission === 'default') {
            permission = await Notification.requestPermission();
        }
        
        if (permission === 'granted') {
            const notification = new Notification(title, {
                body,
                icon: '/icons/icon-192x192.png',
                badge: '/icons/badge-72x72.png',
                tag: 'suite-neurologia',
                renotify: true,
                ...options
            });
            
            // Auto-cerrar después de 5 segundos
            setTimeout(() => {
                notification.close();
            }, 5000);
            
            return notification;
        }
    }

    /**
     * Solicita permisos para notificaciones push
     */
    async requestPushPermission() {
        if (!this.config.enablePushNotifications) return false;
        
        try {
            const permission = await Notification.requestPermission();
            
            if (permission === 'granted' && this.swRegistration) {
                const subscription = await this.swRegistration.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: this.urlBase64ToUint8Array('YOUR_VAPID_PUBLIC_KEY')
                });
                
                console.log('✅ Suscripción push creada:', subscription);
                return subscription;
            }
            
            return false;
            
        } catch (error) {
            console.error('❌ Error solicitando permisos push:', error);
            return false;
        }
    }

    /**
     * Convierte VAPID key a Uint8Array
     */
    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding)
            .replace(/-/g, '+')
            .replace(/_/g, '/');
        
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        
        return outputArray;
    }

    /**
     * Obtiene información del PWA
     */
    getPWAInfo() {
        return {
            isInstalled: this.isInstalled,
            isInstallable: this.isInstallable,
            updateAvailable: this.updateAvailable,
            swRegistration: !!this.swRegistration,
            online: navigator.onLine,
            config: this.config
        };
    }

    /**
     * Configura el PWA Manager
     */
    configure(newConfig) {
        this.config = { ...this.config, ...newConfig };
        console.log('📱 PWA Manager configurado:', this.config);
    }

    /**
     * Limpia recursos del PWA Manager
     */
    cleanup() {
        console.log('🧹 Limpiando PWA Manager...');
        
        // Remover elementos UI
        const elements = ['pwa-install-button', 'connection-indicator', 'update-notification'];
        elements.forEach(id => {
            const element = document.getElementById(id);
            if (element) element.remove();
        });
        
        // Limpiar referencias
        this.deferredPrompt = null;
        
        console.log('✅ PWA Manager limpiado');
    }
}

// Crear instancia global
window.PWAManager = new PWAManager();

export default PWAManager; 