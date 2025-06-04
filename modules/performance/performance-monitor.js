/**
 * 📊 Performance Monitor
 * Sistema de monitoreo de rendimiento en tiempo real
 */

class PerformanceMonitor {
    constructor() {
        this.metrics = {
            pageLoad: null,
            domContentLoaded: null,
            firstContentfulPaint: null,
            largestContentfulPaint: null,
            firstInputDelay: null,
            cumulativeLayoutShift: null,
            memoryUsage: [],
            userInteractions: [],
            apiCalls: [],
            errors: []
        };
        
        this.observers = new Map();
        this.isMonitoring = false;
        this.reportInterval = null;
        this.config = {
            reportIntervalMs: 30000, // 30 segundos
            maxMetricsHistory: 100,
            enableRealTimeReporting: true,
            enableMemoryMonitoring: true,
            enableUserInteractionTracking: true
        };
        
        this.thresholds = {
            slowPageLoad: 3000, // 3 segundos
            highMemoryUsage: 100 * 1024 * 1024, // 100MB
            slowApiCall: 2000, // 2 segundos
            highCLS: 0.1,
            highFID: 100
        };
    }

    /**
     * Inicia el monitoreo de rendimiento
     */
    startMonitoring() {
        if (this.isMonitoring) {
            console.warn('Performance monitoring ya está activo');
            return;
        }

        console.log('📊 Iniciando monitoreo de rendimiento...');
        this.isMonitoring = true;

        // Métricas básicas de carga
        this.measurePageLoadMetrics();
        
        // Web Vitals
        this.measureWebVitals();
        
        // Monitoreo de memoria
        if (this.config.enableMemoryMonitoring) {
            this.startMemoryMonitoring();
        }
        
        // Tracking de interacciones
        if (this.config.enableUserInteractionTracking) {
            this.startUserInteractionTracking();
        }
        
        // Monitoreo de API calls
        this.startApiCallMonitoring();
        
        // Reportes periódicos
        if (this.config.enableRealTimeReporting) {
            this.startPeriodicReporting();
        }
        
        // Event listeners para errores
        this.setupErrorTracking();
        
        console.log('✅ Performance monitoring iniciado');
    }

    /**
     * Detiene el monitoreo
     */
    stopMonitoring() {
        if (!this.isMonitoring) return;
        
        console.log('🛑 Deteniendo monitoreo de rendimiento...');
        this.isMonitoring = false;
        
        // Limpiar observers
        this.observers.forEach(observer => observer.disconnect());
        this.observers.clear();
        
        // Limpiar intervalos
        if (this.reportInterval) {
            clearInterval(this.reportInterval);
            this.reportInterval = null;
        }
        
        console.log('✅ Performance monitoring detenido');
    }

    /**
     * Mide métricas básicas de carga de página
     */
    measurePageLoadMetrics() {
        // Navigation Timing API
        if (performance.timing) {
            const timing = performance.timing;
            this.metrics.pageLoad = timing.loadEventEnd - timing.navigationStart;
            this.metrics.domContentLoaded = timing.domContentLoadedEventEnd - timing.navigationStart;
        }

        // Performance Observer para navigation
        if ('PerformanceObserver' in window) {
            const navObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (entry.entryType === 'navigation') {
                        this.metrics.pageLoad = entry.loadEventEnd - entry.fetchStart;
                        this.metrics.domContentLoaded = entry.domContentLoadedEventEnd - entry.fetchStart;
                    }
                });
            });
            
            try {
                navObserver.observe({ entryTypes: ['navigation'] });
                this.observers.set('navigation', navObserver);
            } catch (error) {
                console.warn('Navigation timing no soportado:', error);
            }
        }
    }

    /**
     * Mide Web Vitals (Core Web Vitals)
     */
    measureWebVitals() {
        // First Contentful Paint (FCP)
        this.measureFCP();
        
        // Largest Contentful Paint (LCP)
        this.measureLCP();
        
        // First Input Delay (FID)
        this.measureFID();
        
        // Cumulative Layout Shift (CLS)
        this.measureCLS();
    }

    /**
     * Mide First Contentful Paint
     */
    measureFCP() {
        if ('PerformanceObserver' in window) {
            const fcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const fcpEntry = entries.find(entry => entry.name === 'first-contentful-paint');
                if (fcpEntry) {
                    this.metrics.firstContentfulPaint = fcpEntry.startTime;
                    this.checkThreshold('FCP', fcpEntry.startTime, 1800); // 1.8s threshold
                }
            });
            
            try {
                fcpObserver.observe({ entryTypes: ['paint'] });
                this.observers.set('fcp', fcpObserver);
            } catch (error) {
                console.warn('FCP measurement no soportado:', error);
            }
        }
    }

    /**
     * Mide Largest Contentful Paint
     */
    measureLCP() {
        if ('PerformanceObserver' in window) {
            const lcpObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                const lastEntry = entries[entries.length - 1];
                if (lastEntry) {
                    this.metrics.largestContentfulPaint = lastEntry.startTime;
                    this.checkThreshold('LCP', lastEntry.startTime, 2500); // 2.5s threshold
                }
            });
            
            try {
                lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
                this.observers.set('lcp', lcpObserver);
            } catch (error) {
                console.warn('LCP measurement no soportado:', error);
            }
        }
    }

    /**
     * Mide First Input Delay
     */
    measureFID() {
        if ('PerformanceObserver' in window) {
            const fidObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (entry.entryType === 'first-input') {
                        const fid = entry.processingStart - entry.startTime;
                        this.metrics.firstInputDelay = fid;
                        this.checkThreshold('FID', fid, this.thresholds.highFID);
                    }
                });
            });
            
            try {
                fidObserver.observe({ entryTypes: ['first-input'] });
                this.observers.set('fid', fidObserver);
            } catch (error) {
                console.warn('FID measurement no soportado:', error);
            }
        }
    }

    /**
     * Mide Cumulative Layout Shift
     */
    measureCLS() {
        if ('PerformanceObserver' in window) {
            let clsValue = 0;
            
            const clsObserver = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    if (!entry.hadRecentInput) {
                        clsValue += entry.value;
                    }
                });
                
                this.metrics.cumulativeLayoutShift = clsValue;
                this.checkThreshold('CLS', clsValue, this.thresholds.highCLS);
            });
            
            try {
                clsObserver.observe({ entryTypes: ['layout-shift'] });
                this.observers.set('cls', clsObserver);
            } catch (error) {
                console.warn('CLS measurement no soportado:', error);
            }
        }
    }

    /**
     * Inicia monitoreo de memoria
     */
    startMemoryMonitoring() {
        if (!performance.memory) {
            console.warn('Memory API no disponible');
            return;
        }

        const measureMemory = () => {
            if (!this.isMonitoring) return;
            
            const memInfo = {
                timestamp: Date.now(),
                usedJSHeapSize: performance.memory.usedJSHeapSize,
                totalJSHeapSize: performance.memory.totalJSHeapSize,
                jsHeapSizeLimit: performance.memory.jsHeapSizeLimit
            };
            
            this.metrics.memoryUsage.push(memInfo);
            
            // Mantener solo los últimos N registros
            if (this.metrics.memoryUsage.length > this.config.maxMetricsHistory) {
                this.metrics.memoryUsage.shift();
            }
            
            // Verificar threshold de memoria
            this.checkThreshold('Memory', memInfo.usedJSHeapSize, this.thresholds.highMemoryUsage);
        };

        // Medir cada 5 segundos
        const memoryInterval = setInterval(measureMemory, 5000);
        this.observers.set('memory', { disconnect: () => clearInterval(memoryInterval) });
        
        // Medición inicial
        measureMemory();
    }

    /**
     * Inicia tracking de interacciones de usuario
     */
    startUserInteractionTracking() {
        const trackInteraction = (type, target, timestamp = Date.now()) => {
            const interaction = {
                type,
                target: target.tagName + (target.id ? `#${target.id}` : '') + (target.className ? `.${target.className.split(' ')[0]}` : ''),
                timestamp,
                url: window.location.pathname
            };
            
            this.metrics.userInteractions.push(interaction);
            
            // Mantener solo las últimas N interacciones
            if (this.metrics.userInteractions.length > this.config.maxMetricsHistory) {
                this.metrics.userInteractions.shift();
            }
        };

        // Event listeners para diferentes tipos de interacciones
        const events = ['click', 'keydown', 'scroll', 'resize'];
        
        events.forEach(eventType => {
            document.addEventListener(eventType, (e) => {
                if (this.isMonitoring) {
                    trackInteraction(eventType, e.target);
                }
            }, { passive: true });
        });
    }

    /**
     * Monitorea llamadas a API
     */
    startApiCallMonitoring() {
        // Interceptar fetch
        const originalFetch = window.fetch;
        window.fetch = async (...args) => {
            const startTime = performance.now();
            const url = args[0];
            
            try {
                const response = await originalFetch(...args);
                const endTime = performance.now();
                const duration = endTime - startTime;
                
                this.recordApiCall(url, duration, response.status, 'fetch');
                return response;
            } catch (error) {
                const endTime = performance.now();
                const duration = endTime - startTime;
                
                this.recordApiCall(url, duration, 0, 'fetch', error);
                throw error;
            }
        };

        // Interceptar XMLHttpRequest
        const originalXHROpen = XMLHttpRequest.prototype.open;
        const originalXHRSend = XMLHttpRequest.prototype.send;
        
        XMLHttpRequest.prototype.open = function(method, url, ...args) {
            this._perfMonitor = { method, url, startTime: null };
            return originalXHROpen.call(this, method, url, ...args);
        };
        
        XMLHttpRequest.prototype.send = function(...args) {
            if (this._perfMonitor) {
                this._perfMonitor.startTime = performance.now();
                
                this.addEventListener('loadend', () => {
                    const endTime = performance.now();
                    const duration = endTime - this._perfMonitor.startTime;
                    
                    window.PerformanceMonitor?.recordApiCall(
                        this._perfMonitor.url,
                        duration,
                        this.status,
                        'xhr'
                    );
                });
            }
            
            return originalXHRSend.call(this, ...args);
        };
    }

    /**
     * Registra una llamada a API
     */
    recordApiCall(url, duration, status, method, error = null) {
        const apiCall = {
            url,
            duration,
            status,
            method,
            timestamp: Date.now(),
            error: error ? error.message : null
        };
        
        this.metrics.apiCalls.push(apiCall);
        
        // Mantener solo las últimas N llamadas
        if (this.metrics.apiCalls.length > this.config.maxMetricsHistory) {
            this.metrics.apiCalls.shift();
        }
        
        // Verificar threshold de velocidad
        this.checkThreshold('API Call', duration, this.thresholds.slowApiCall);
    }

    /**
     * Configura tracking de errores
     */
    setupErrorTracking() {
        // Errores JavaScript
        window.addEventListener('error', (event) => {
            this.recordError({
                type: 'javascript',
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno,
                stack: event.error?.stack,
                timestamp: Date.now()
            });
        });

        // Errores de recursos
        window.addEventListener('error', (event) => {
            if (event.target !== window) {
                this.recordError({
                    type: 'resource',
                    element: event.target.tagName,
                    source: event.target.src || event.target.href,
                    timestamp: Date.now()
                });
            }
        }, true);

        // Promise rejections no manejadas
        window.addEventListener('unhandledrejection', (event) => {
            this.recordError({
                type: 'promise',
                reason: event.reason,
                timestamp: Date.now()
            });
        });
    }

    /**
     * Registra un error
     */
    recordError(errorInfo) {
        this.metrics.errors.push(errorInfo);
        
        // Mantener solo los últimos N errores
        if (this.metrics.errors.length > this.config.maxMetricsHistory) {
            this.metrics.errors.shift();
        }
        
        console.warn('📊 Error registrado:', errorInfo);
    }

    /**
     * Verifica thresholds y genera alertas
     */
    checkThreshold(metric, value, threshold) {
        if (value > threshold) {
            console.warn(`⚠️ Threshold excedido - ${metric}: ${value} > ${threshold}`);
            
            // Emitir evento para alertas
            if (window.EventManager) {
                window.EventManager.emit('performanceThresholdExceeded', {
                    metric,
                    value,
                    threshold,
                    timestamp: Date.now()
                });
            }
        }
    }

    /**
     * Inicia reportes periódicos
     */
    startPeriodicReporting() {
        this.reportInterval = setInterval(() => {
            if (this.isMonitoring) {
                this.generateReport();
            }
        }, this.config.reportIntervalMs);
    }

    /**
     * Genera reporte de rendimiento
     */
    generateReport() {
        const report = {
            timestamp: Date.now(),
            url: window.location.href,
            userAgent: navigator.userAgent,
            metrics: {
                ...this.metrics,
                // Calcular promedios y estadísticas
                avgMemoryUsage: this.calculateAverageMemory(),
                recentInteractions: this.getRecentInteractions(60000), // Último minuto
                recentApiCalls: this.getRecentApiCalls(60000),
                errorRate: this.calculateErrorRate()
            }
        };
        
        console.log('📊 Performance Report:', report);
        
        // Emitir evento con el reporte
        if (window.EventManager) {
            window.EventManager.emit('performanceReport', report);
        }
        
        return report;
    }

    /**
     * Calcula uso promedio de memoria
     */
    calculateAverageMemory() {
        if (this.metrics.memoryUsage.length === 0) return null;
        
        const total = this.metrics.memoryUsage.reduce((sum, mem) => sum + mem.usedJSHeapSize, 0);
        return Math.round(total / this.metrics.memoryUsage.length);
    }

    /**
     * Obtiene interacciones recientes
     */
    getRecentInteractions(timeWindow) {
        const cutoff = Date.now() - timeWindow;
        return this.metrics.userInteractions.filter(interaction => interaction.timestamp > cutoff);
    }

    /**
     * Obtiene llamadas API recientes
     */
    getRecentApiCalls(timeWindow) {
        const cutoff = Date.now() - timeWindow;
        return this.metrics.apiCalls.filter(call => call.timestamp > cutoff);
    }

    /**
     * Calcula tasa de errores
     */
    calculateErrorRate() {
        const recentErrors = this.metrics.errors.filter(error => 
            error.timestamp > Date.now() - 300000 // Últimos 5 minutos
        );
        
        return {
            count: recentErrors.length,
            rate: recentErrors.length / 5 // errores por minuto
        };
    }

    /**
     * Obtiene métricas actuales
     */
    getCurrentMetrics() {
        return {
            ...this.metrics,
            isMonitoring: this.isMonitoring,
            timestamp: Date.now()
        };
    }

    /**
     * Configura el monitor
     */
    configure(newConfig) {
        this.config = { ...this.config, ...newConfig };
        console.log('📊 Performance monitor configurado:', this.config);
    }

    /**
     * Limpia métricas históricas
     */
    clearMetrics() {
        this.metrics.memoryUsage = [];
        this.metrics.userInteractions = [];
        this.metrics.apiCalls = [];
        this.metrics.errors = [];
        console.log('📊 Métricas limpiadas');
    }
}

// Crear instancia global
window.PerformanceMonitor = new PerformanceMonitor();

export default PerformanceMonitor; 