/**
 * @fileoverview Punto de entrada principal para todos los módulos de Suite Neurología
 * @version 2.1.0 - Incluye sistema de testing
 */

/**
 * 🧠 Suite Neurología v2.1.0 - Módulos Principales
 * Sistema modular completo con IA avanzada
 */

// Configurar instancias globales para compatibilidad
const ModuleSystem = {
    // Core modules
    Logger: window.Logger,
    ErrorManager: window.ErrorManager,
    
    // State modules
    AppStateManager: window.AppStateManager,
    StorageManager: window.StorageManager,
    EventManager: window.EventManager,
    
    // AI modules (Paso 8)
    AIEngine: window.AIEngine,
    NeuralNetwork: window.NeuralNetwork,
    NeurologicalPatternClassifier: window.NeurologicalPatternClassifier,
    AIDashboard: window.AIDashboard,
    AIIntegration: window.AIIntegration
};

/**
 * Clase principal del sistema modular
 */
class SuiteNeurologiaModules {
    constructor() {
        this.version = '2.1.0';
        this.modules = new Map();
        this.isInitialized = false;
        this.initializationOrder = [
            'logger',
            'errorManager', 
            'eventManager',
            'appStateManager',
            'storageManager',
            'domHelpers',
            'renderers',
            'noteBuilder',
            'medicationManager',
            'performanceMonitor',
            'lazyLoader',
            'pwaManager',
            'securityManager',
            'authManager',
            'headerManager',
            'aiEngine',
            'neuralNetwork',
            'neurologicalClassifier',
            'aiDashboard',
            'aiIntegration'
        ];
        
        this.initializeModules();
    }

    /**
     * Inicializa todos los módulos en orden
     */
    async initializeModules() {
        console.log(`🧠 Inicializando Suite Neurología v${this.version}...`);
        
        try {
            // Registrar módulos
            this.registerModules();
            
            // Inicializar en orden específico
            for (const moduleName of this.initializationOrder) {
                await this.initializeModule(moduleName);
            }
            
            // Configurar integraciones
            this.setupIntegrations();
            
            this.isInitialized = true;
            console.log('✅ Todos los módulos inicializados correctamente');
            
            // Emitir evento de inicialización completa
            if (window.EventManager) {
                window.EventManager.emit('systemInitialized', {
                    version: this.version,
                    modulesCount: this.modules.size,
                    timestamp: new Date().toISOString()
                });
            }
            
        } catch (error) {
            console.error('❌ Error inicializando módulos:', error);
            this.handleInitializationError(error);
        }
    }

    /**
     * Registra todos los módulos
     */
    registerModules() {
        // Módulos core
        this.modules.set('logger', { 
            instance: window.Logger, 
            initialized: false,
            dependencies: []
        });
        
        this.modules.set('errorManager', { 
            instance: window.ErrorManager, 
            initialized: false,
            dependencies: ['logger']
        });
        
        // Módulos de estado
        this.modules.set('eventManager', { 
            instance: window.EventManager, 
            initialized: false,
            dependencies: []
        });
        
        this.modules.set('appStateManager', { 
            instance: window.AppStateManager, 
            initialized: false,
            dependencies: ['logger', 'errorManager']
        });
        
        this.modules.set('storageManager', { 
            instance: window.StorageManager, 
            initialized: false,
            dependencies: ['logger', 'errorManager', 'eventManager']
        });
        
        // Módulos de UI
        this.modules.set('domHelpers', { 
            instance: window.DOMHelpers, 
            initialized: false,
            dependencies: ['logger', 'errorManager']
        });
        
        this.modules.set('renderers', { 
            instance: window.Renderers, 
            initialized: false,
            dependencies: ['domHelpers', 'appStateManager']
        });
        
        // Módulos de negocio
        this.modules.set('noteBuilder', { 
            instance: window.NoteBuilder, 
            initialized: false,
            dependencies: ['appStateManager', 'domHelpers']
        });
        
        this.modules.set('medicationManager', { 
            instance: window.MedicationManager, 
            initialized: false,
            dependencies: ['domHelpers', 'eventManager']
        });
        
        // Módulos de performance
        this.modules.set('performanceMonitor', { 
            instance: window.PerformanceMonitor, 
            initialized: false,
            dependencies: ['eventManager']
        });
        
        this.modules.set('lazyLoader', { 
            instance: window.LazyLoader, 
            initialized: false,
            dependencies: []
        });
        
        // Módulos PWA
        this.modules.set('pwaManager', { 
            instance: window.PWAManager, 
            initialized: false,
            dependencies: ['eventManager']
        });
        
        // Módulos de seguridad
        this.modules.set('securityManager', { 
            instance: window.SecurityManager, 
            initialized: false,
            dependencies: ['logger', 'errorManager']
        });
        
        this.modules.set('authManager', { 
            instance: window.AuthManager, 
            initialized: false,
            dependencies: ['securityManager']
        });
        
        this.modules.set('headerManager', { 
            instance: window.HeaderManager, 
            initialized: false,
            dependencies: []
        });
        
        // Módulos de IA (Paso 8)
        this.modules.set('aiEngine', { 
            instance: window.AIEngine, 
            initialized: false,
            dependencies: ['eventManager', 'logger']
        });
        
        this.modules.set('neuralNetwork', { 
            instance: window.NeuralNetwork, 
            initialized: false,
            dependencies: []
        });
        
        this.modules.set('neurologicalClassifier', { 
            instance: window.NeurologicalPatternClassifier, 
            initialized: false,
            dependencies: ['neuralNetwork']
        });
        
        this.modules.set('aiDashboard', { 
            instance: window.AIDashboard, 
            initialized: false,
            dependencies: ['aiEngine', 'eventManager']
        });
        
        this.modules.set('aiIntegration', { 
            instance: window.AIIntegration, 
            initialized: false,
            dependencies: ['aiEngine', 'neurologicalClassifier', 'aiDashboard', 'eventManager']
        });
    }

    /**
     * Inicializa un módulo específico
     */
    async initializeModule(moduleName) {
        const moduleInfo = this.modules.get(moduleName);
        
        if (!moduleInfo) {
            console.warn(`⚠️ Módulo ${moduleName} no encontrado`);
            return;
        }
        
        if (moduleInfo.initialized) {
            return; // Ya inicializado
        }
        
        // Verificar dependencias
        for (const dependency of moduleInfo.dependencies) {
            const depInfo = this.modules.get(dependency);
            if (!depInfo || !depInfo.initialized) {
                console.log(`⏳ Esperando dependencia ${dependency} para ${moduleName}`);
                await this.initializeModule(dependency);
            }
        }
        
        try {
            console.log(`🔧 Inicializando ${moduleName}...`);
            
            // Inicializar el módulo si tiene método de inicialización
            if (moduleInfo.instance && typeof moduleInfo.instance.initialize === 'function') {
                await moduleInfo.instance.initialize();
            }
            
            moduleInfo.initialized = true;
            console.log(`✅ ${moduleName} inicializado`);
            
        } catch (error) {
            console.error(`❌ Error inicializando ${moduleName}:`, error);
            throw error;
        }
    }

    /**
     * Configura integraciones entre módulos
     */
    setupIntegrations() {
        console.log('🔗 Configurando integraciones...');
        
        // Integración Performance Monitor con otros módulos
        if (window.PerformanceMonitor && window.StorageManager) {
            window.PerformanceMonitor.monitorModule('StorageManager', window.StorageManager);
        }
        
        // Integración Security Manager con Storage
        if (window.SecurityManager && window.StorageManager) {
            window.StorageManager.setSecurityManager(window.SecurityManager);
        }
        
        // Integración AI con Event Manager
        if (window.AIIntegration && window.EventManager) {
            // Los eventos ya están configurados en AIIntegration
            console.log('🧠 Integración de IA configurada');
        }
        
        // Configurar lazy loading para módulos pesados
        if (window.LazyLoader) {
            window.LazyLoader.preloadCritical([
                '/modules/ai/ai-engine.js',
                '/modules/ai/neural-network.js'
            ]);
        }
    }

    /**
     * Maneja errores de inicialización
     */
    handleInitializationError(error) {
        console.error('💥 Error crítico en inicialización:', error);
        
        // Intentar mostrar error al usuario
        if (window.ErrorManager) {
            window.ErrorManager.handleError(error, {
                context: 'Module Initialization',
                critical: true
            });
        } else {
            // Fallback si ErrorManager no está disponible
            alert(`Error crítico inicializando la aplicación: ${error.message}`);
        }
    }

    /**
     * Obtiene información de un módulo
     */
    getModuleInfo(moduleName) {
        return this.modules.get(moduleName);
    }

    /**
     * Obtiene estadísticas del sistema
     */
    getSystemStats() {
        const stats = {
            version: this.version,
            isInitialized: this.isInitialized,
            totalModules: this.modules.size,
            initializedModules: 0,
            failedModules: 0,
            modules: {}
        };
        
        this.modules.forEach((moduleInfo, name) => {
            if (moduleInfo.initialized) {
                stats.initializedModules++;
            } else {
                stats.failedModules++;
            }
            
            stats.modules[name] = {
                initialized: moduleInfo.initialized,
                dependencies: moduleInfo.dependencies,
                hasInstance: !!moduleInfo.instance
            };
        });
        
        return stats;
    }

    /**
     * Reinicia un módulo específico
     */
    async restartModule(moduleName) {
        const moduleInfo = this.modules.get(moduleName);
        
        if (!moduleInfo) {
            throw new Error(`Módulo ${moduleName} no encontrado`);
        }
        
        console.log(`🔄 Reiniciando ${moduleName}...`);
        
        // Marcar como no inicializado
        moduleInfo.initialized = false;
        
        // Reinicializar
        await this.initializeModule(moduleName);
        
        console.log(`✅ ${moduleName} reiniciado`);
    }

    /**
     * Obtiene la versión del sistema
     */
    getVersion() {
        return this.version;
    }

    /**
     * Verifica si el sistema está completamente inicializado
     */
    isSystemReady() {
        return this.isInitialized && Array.from(this.modules.values()).every(m => m.initialized);
    }
}

// Crear instancia global del sistema de módulos
window.SuiteNeurologiaModules = new SuiteNeurologiaModules(); 