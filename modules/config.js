/**
 * @fileoverview Configuración y carga de módulos para Suite Neurología
 * @version 2.0.0
 */

/**
 * Configuración de la aplicación
 */
export const AppConfig = {
  version: "2.0.0",
  name: "Suite Neurología",
  
  // Configuración de logging
  logging: {
    level: 'DEBUG', // DEBUG, INFO, WARN, ERROR
    enableConsole: true,
    enableStorage: false
  },
  
  // Configuración de almacenamiento
  storage: {
    prefix: 'medNotesMultiBedData_',
    version: 'v7',
    maxRetries: 3,
    saveDelay: 1200
  },
  
  // Configuración de errores
  errorHandling: {
    maxHistorySize: 50,
    enableGlobalHandlers: true,
    enableUserNotifications: true
  },
  
  // Configuración de AI
  ai: {
    flows: [
      {
        key: "correccion",
        label: "Corregir nota",
        prompt: "Corrige únicamente los errores gramaticales, de ortografía y de puntuación en la siguiente nota médica. No añadas ni elimines información clínica, sugerencias, ni contenido nuevo. Mantén el formato general.: ",
      },
      {
        key: "resumen",
        label: "Resumir nota",
        prompt: "Resume la siguiente nota médica, destacando los puntos más importantes: ",
      },
      {
        key: "preguntas",
        label: "Generar preguntas",
        prompt: "Genera 3-5 preguntas relevantes para hacer seguimiento a partir de esta nota médica: ",
      },
    ],
    defaultModel: "gpt-3.5-turbo",
    timeout: 30000
  },
  
  // Configuración de OCR
  ocr: {
    supportedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
    maxFileSize: 10 * 1024 * 1024, // 10MB
    language: 'spa'
  },
  
  // Configuración de medicamentos
  medications: {
    minQueryLength: 2,
    maxSuggestions: 10,
    enableAutoComplete: true
  }
};

/**
 * Inicializa la configuración de los módulos
 * @param {Object} customConfig - Configuración personalizada
 */
export function initializeModules(customConfig = {}) {
  // Combinar configuración por defecto con personalizada
  const config = { ...AppConfig, ...customConfig };
  
  // Configurar logging
  if (window.Logger) {
    window.Logger.setLevel(config.logging.level);
  }
  
  // Configurar error manager
  if (window.ErrorManager) {
    window.ErrorManager.maxHistorySize = config.errorHandling.maxHistorySize;
  }
  
  // Configurar storage manager
  if (window.StorageManager) {
    window.StorageManager.config = {
      ...window.StorageManager.config,
      ...config.storage
    };
  }
  
  // Exponer configuración globalmente
  window.AppConfig = config;
  
  console.log(`${config.name} v${config.version} - Módulos inicializados`);
  
  return config;
}

/**
 * Verifica que todos los módulos estén cargados correctamente
 * @returns {Object} - Estado de carga de módulos
 */
export function checkModulesStatus() {
  const modules = {
    Logger: !!window.Logger,
    ErrorManager: !!window.ErrorManager,
    appState: !!window.appState,
    StorageManager: !!window.StorageManager,
    EventManager: !!window.EventManager,
    
    // UI Helpers
    getElement: !!window.getElement,
    toggleSectionVisibility: !!window.toggleSectionVisibility,
    
    // Renderers
    renderAppStructure: !!window.renderAppStructure,
    makeSectionElement: !!window.makeSectionElement,
    
    // Business Logic
    buildNote: !!window.buildNote,
    downloadNote: !!window.downloadNote,
    
    // Medications
    syncChips: !!window.syncChips,
    addMedication: !!window.addMedication,
    
    // Configurations
    Sections: !!window.Sections,
    StructuredFields: !!window.StructuredFields
  };
  
  const loadedCount = Object.values(modules).filter(Boolean).length;
  const totalCount = Object.keys(modules).length;
  const allLoaded = loadedCount === totalCount;
  
  const status = {
    allLoaded,
    loadedCount,
    totalCount,
    percentage: Math.round((loadedCount / totalCount) * 100),
    modules,
    missing: Object.keys(modules).filter(key => !modules[key])
  };
  
  if (allLoaded) {
    console.log('✅ Todos los módulos cargados correctamente');
  } else {
    console.warn(`⚠️ ${status.missing.length} módulos faltantes:`, status.missing);
  }
  
  return status;
}

/**
 * Función de utilidad para cargar módulos de forma asíncrona
 * @returns {Promise<boolean>} - True si todos los módulos se cargaron
 */
export async function loadModules() {
  try {
    // Importar el punto de entrada principal
    await import('./index.js');
    
    // Verificar estado de carga
    const status = checkModulesStatus();
    
    if (status.allLoaded) {
      // Inicializar configuración
      initializeModules();
      return true;
    } else {
      throw new Error(`Faltan módulos: ${status.missing.join(', ')}`);
    }
  } catch (error) {
    console.error('Error cargando módulos:', error);
    return false;
  }
}

// Auto-inicialización si se carga directamente
if (typeof window !== 'undefined') {
  // Exponer funciones de utilidad globalmente
  window.initializeModules = initializeModules;
  window.checkModulesStatus = checkModulesStatus;
  window.loadModules = loadModules;
} 