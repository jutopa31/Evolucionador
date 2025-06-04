/**
 * 🚀 Lazy Loader
 * Sistema de carga dinámica de módulos y recursos
 */

class LazyLoader {
    constructor() {
        this.loadedModules = new Map();
        this.loadingPromises = new Map();
        this.observers = new Map();
        this.config = {
            rootMargin: '50px',
            threshold: 0.1,
            enableImageLazyLoading: true,
            enableModuleLazyLoading: true,
            enableComponentLazyLoading: true,
            preloadCritical: true
        };
        
        this.moduleRegistry = new Map();
        this.componentRegistry = new Map();
        this.resourceCache = new Map();
        
        this.initializeLazyLoading();
    }

    /**
     * Inicializa el sistema de lazy loading
     */
    initializeLazyLoading() {
        console.log('🚀 Inicializando Lazy Loader...');
        
        // Configurar Intersection Observer para imágenes
        if (this.config.enableImageLazyLoading) {
            this.setupImageLazyLoading();
        }
        
        // Configurar lazy loading de componentes
        if (this.config.enableComponentLazyLoading) {
            this.setupComponentLazyLoading();
        }
        
        // Registrar módulos disponibles
        this.registerAvailableModules();
        
        // Precargar recursos críticos
        if (this.config.preloadCritical) {
            this.preloadCriticalResources();
        }
        
        console.log('✅ Lazy Loader inicializado');
    }

    /**
     * Registra módulos disponibles para carga dinámica
     */
    registerAvailableModules() {
        const modules = {
            // Módulos de performance
            'performance-monitor': {
                path: './modules/performance/performance-monitor.js',
                dependencies: [],
                critical: false,
                size: 'medium'
            },
            
            // Módulos de UI
            'dom-helpers': {
                path: './modules/ui/dom-helpers.js',
                dependencies: [],
                critical: true,
                size: 'small'
            },
            
            'renderers': {
                path: './modules/ui/renderers.js',
                dependencies: ['dom-helpers'],
                critical: true,
                size: 'medium'
            },
            
            // Módulos de negocio
            'note-builder': {
                path: './modules/business/note-builder.js',
                dependencies: ['dom-helpers'],
                critical: false,
                size: 'large'
            },
            
            'medication-manager': {
                path: './modules/business/medication-manager.js',
                dependencies: ['dom-helpers', 'storage-manager'],
                critical: false,
                size: 'large'
            },
            
            // Módulos de estado y almacenamiento
            'app-state-manager': {
                path: './modules/state/app-state-manager.js',
                dependencies: [],
                critical: true,
                size: 'small'
            },
            
            'storage-manager': {
                path: './modules/storage/storage-manager.js',
                dependencies: [],
                critical: true,
                size: 'medium'
            },
            
            // Módulos de eventos
            'event-manager': {
                path: './modules/events/event-manager.js',
                dependencies: [],
                critical: true,
                size: 'small'
            },
            
            // Módulos de testing
            'test-runner': {
                path: './modules/tests/test-runner.js',
                dependencies: [],
                critical: false,
                size: 'large'
            },
            
            // Service Worker
            'service-worker': {
                path: './sw.js',
                dependencies: [],
                critical: false,
                size: 'medium',
                type: 'service-worker'
            },
            
            // PWA Manifest
            'pwa-manifest': {
                path: './manifest.json',
                dependencies: [],
                critical: false,
                size: 'small',
                type: 'json'
            }
        };
        
        Object.entries(modules).forEach(([name, config]) => {
            this.moduleRegistry.set(name, config);
        });
        
        console.log(`📦 ${this.moduleRegistry.size} módulos registrados para lazy loading`);
    }

    /**
     * Carga un módulo de forma dinámica
     */
    async loadModule(moduleName, options = {}) {
        // Verificar si ya está cargado
        if (this.loadedModules.has(moduleName)) {
            return this.loadedModules.get(moduleName);
        }
        
        // Verificar si ya se está cargando
        if (this.loadingPromises.has(moduleName)) {
            return this.loadingPromises.get(moduleName);
        }
        
        const moduleConfig = this.moduleRegistry.get(moduleName);
        if (!moduleConfig) {
            throw new Error(`Módulo no encontrado: ${moduleName}`);
        }
        
        console.log(`🚀 Cargando módulo: ${moduleName}`);
        
        const loadPromise = this.performModuleLoad(moduleName, moduleConfig, options);
        this.loadingPromises.set(moduleName, loadPromise);
        
        try {
            const module = await loadPromise;
            this.loadedModules.set(moduleName, module);
            this.loadingPromises.delete(moduleName);
            
            console.log(`✅ Módulo cargado: ${moduleName}`);
            
            // Emitir evento de carga
            if (window.EventManager) {
                window.EventManager.emit('moduleLoaded', { moduleName, module });
            }
            
            return module;
        } catch (error) {
            this.loadingPromises.delete(moduleName);
            console.error(`❌ Error cargando módulo ${moduleName}:`, error);
            throw error;
        }
    }

    /**
     * Realiza la carga efectiva del módulo
     */
    async performModuleLoad(moduleName, moduleConfig, options) {
        // Cargar dependencias primero
        if (moduleConfig.dependencies && moduleConfig.dependencies.length > 0) {
            console.log(`📦 Cargando dependencias para ${moduleName}:`, moduleConfig.dependencies);
            
            const dependencyPromises = moduleConfig.dependencies.map(dep => 
                this.loadModule(dep, { ...options, isDependency: true })
            );
            
            await Promise.all(dependencyPromises);
        }
        
        // Cargar el módulo según su tipo
        switch (moduleConfig.type) {
            case 'service-worker':
                return this.loadServiceWorker(moduleConfig.path);
            case 'json':
                return this.loadJSON(moduleConfig.path);
            default:
                return this.loadJavaScriptModule(moduleConfig.path, options);
        }
    }

    /**
     * Carga un módulo JavaScript
     */
    async loadJavaScriptModule(path, options = {}) {
        try {
            // Usar import dinámico
            const module = await import(path);
            
            // Si el módulo tiene una función de inicialización, llamarla
            if (module.default && typeof module.default.initialize === 'function') {
                await module.default.initialize(options);
            }
            
            return module;
        } catch (error) {
            // Fallback: cargar como script tradicional
            return this.loadScriptFallback(path);
        }
    }

    /**
     * Fallback para cargar scripts tradicionales
     */
    async loadScriptFallback(path) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = path;
            script.type = 'module';
            
            script.onload = () => {
                resolve({ loaded: true, path });
            };
            
            script.onerror = () => {
                reject(new Error(`Error cargando script: ${path}`));
            };
            
            document.head.appendChild(script);
        });
    }

    /**
     * Carga un Service Worker
     */
    async loadServiceWorker(path) {
        if (!('serviceWorker' in navigator)) {
            throw new Error('Service Workers no soportados');
        }
        
        try {
            const registration = await navigator.serviceWorker.register(path);
            console.log('✅ Service Worker registrado:', registration);
            return registration;
        } catch (error) {
            console.error('❌ Error registrando Service Worker:', error);
            throw error;
        }
    }

    /**
     * Carga un archivo JSON
     */
    async loadJSON(path) {
        const response = await fetch(path);
        if (!response.ok) {
            throw new Error(`Error cargando JSON: ${response.status}`);
        }
        return response.json();
    }

    /**
     * Configura lazy loading de imágenes
     */
    setupImageLazyLoading() {
        const imageObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    this.loadImage(img);
                    imageObserver.unobserve(img);
                }
            });
        }, {
            rootMargin: this.config.rootMargin,
            threshold: this.config.threshold
        });
        
        // Observar todas las imágenes con data-src
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
        
        this.observers.set('images', imageObserver);
        console.log('🖼️ Image lazy loading configurado');
    }

    /**
     * Carga una imagen de forma lazy
     */
    loadImage(img) {
        const src = img.dataset.src;
        if (!src) return;
        
        // Crear nueva imagen para precargar
        const newImg = new Image();
        
        newImg.onload = () => {
            img.src = src;
            img.classList.add('loaded');
            img.removeAttribute('data-src');
        };
        
        newImg.onerror = () => {
            img.classList.add('error');
            console.warn('Error cargando imagen:', src);
        };
        
        newImg.src = src;
    }

    /**
     * Configura lazy loading de componentes
     */
    setupComponentLazyLoading() {
        const componentObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const element = entry.target;
                    this.loadComponent(element);
                    componentObserver.unobserve(element);
                }
            });
        }, {
            rootMargin: this.config.rootMargin,
            threshold: this.config.threshold
        });
        
        // Observar elementos con data-lazy-component
        document.querySelectorAll('[data-lazy-component]').forEach(element => {
            componentObserver.observe(element);
        });
        
        this.observers.set('components', componentObserver);
        console.log('🧩 Component lazy loading configurado');
    }

    /**
     * Carga un componente de forma lazy
     */
    async loadComponent(element) {
        const componentName = element.dataset.lazyComponent;
        if (!componentName) return;
        
        try {
            element.classList.add('loading');
            
            // Cargar el módulo del componente
            const module = await this.loadModule(componentName);
            
            // Si el módulo tiene una función render, usarla
            if (module.default && typeof module.default.render === 'function') {
                const content = await module.default.render(element.dataset);
                element.innerHTML = content;
            }
            
            element.classList.remove('loading');
            element.classList.add('loaded');
            element.removeAttribute('data-lazy-component');
            
        } catch (error) {
            element.classList.remove('loading');
            element.classList.add('error');
            console.error('Error cargando componente:', componentName, error);
        }
    }

    /**
     * Precarga recursos críticos
     */
    async preloadCriticalResources() {
        console.log('⚡ Precargando recursos críticos...');
        
        const criticalModules = Array.from(this.moduleRegistry.entries())
            .filter(([name, config]) => config.critical)
            .map(([name]) => name);
        
        const preloadPromises = criticalModules.map(moduleName => 
            this.loadModule(moduleName, { preload: true })
                .catch(error => console.warn(`Advertencia precargando ${moduleName}:`, error))
        );
        
        await Promise.allSettled(preloadPromises);
        console.log(`✅ ${criticalModules.length} recursos críticos precargados`);
    }

    /**
     * Precarga un módulo específico
     */
    async preloadModule(moduleName) {
        try {
            await this.loadModule(moduleName, { preload: true });
            console.log(`⚡ Módulo precargado: ${moduleName}`);
        } catch (error) {
            console.warn(`Advertencia precargando ${moduleName}:`, error);
        }
    }

    /**
     * Precarga múltiples módulos
     */
    async preloadModules(moduleNames) {
        const promises = moduleNames.map(name => this.preloadModule(name));
        await Promise.allSettled(promises);
    }

    /**
     * Obtiene información de un módulo
     */
    getModuleInfo(moduleName) {
        const config = this.moduleRegistry.get(moduleName);
        const isLoaded = this.loadedModules.has(moduleName);
        const isLoading = this.loadingPromises.has(moduleName);
        
        return {
            name: moduleName,
            config,
            isLoaded,
            isLoading,
            loadedModule: isLoaded ? this.loadedModules.get(moduleName) : null
        };
    }

    /**
     * Obtiene estadísticas de carga
     */
    getLoadingStats() {
        const totalModules = this.moduleRegistry.size;
        const loadedModules = this.loadedModules.size;
        const loadingModules = this.loadingPromises.size;
        
        return {
            total: totalModules,
            loaded: loadedModules,
            loading: loadingModules,
            pending: totalModules - loadedModules - loadingModules,
            loadedPercentage: Math.round((loadedModules / totalModules) * 100)
        };
    }

    /**
     * Descarga un módulo de la memoria
     */
    unloadModule(moduleName) {
        if (this.loadedModules.has(moduleName)) {
            const module = this.loadedModules.get(moduleName);
            
            // Si el módulo tiene cleanup, ejecutarlo
            if (module.default && typeof module.default.cleanup === 'function') {
                module.default.cleanup();
            }
            
            this.loadedModules.delete(moduleName);
            console.log(`🗑️ Módulo descargado: ${moduleName}`);
            
            // Emitir evento
            if (window.EventManager) {
                window.EventManager.emit('moduleUnloaded', { moduleName });
            }
        }
    }

    /**
     * Limpia recursos y observers
     */
    cleanup() {
        console.log('🧹 Limpiando Lazy Loader...');
        
        // Desconectar observers
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
        
        // Limpiar módulos cargados
        this.loadedModules.forEach((module, name) => {
            this.unloadModule(name);
        });
        
        // Limpiar promesas pendientes
        this.loadingPromises.clear();
        
        console.log('✅ Lazy Loader limpiado');
    }

    /**
     * Configura el lazy loader
     */
    configure(newConfig) {
        this.config = { ...this.config, ...newConfig };
        console.log('🚀 Lazy Loader configurado:', this.config);
    }

    /**
     * Registra un nuevo módulo
     */
    registerModule(name, config) {
        this.moduleRegistry.set(name, config);
        console.log(`📦 Módulo registrado: ${name}`);
    }

    /**
     * Desregistra un módulo
     */
    unregisterModule(name) {
        this.moduleRegistry.delete(name);
        this.unloadModule(name);
        console.log(`📦 Módulo desregistrado: ${name}`);
    }
}

// Crear instancia global
window.LazyLoader = new LazyLoader();

export default LazyLoader; 