/**
 * @fileoverview Módulo de gestión de almacenamiento
 * @version 2.1.0 - OPTIMIZADO
 */

import { logger } from '../core/logger.js';
import { errorManager, ErrorManager } from '../core/error-manager.js';

export class StorageManager {
  constructor() {
    // Claves de almacenamiento
    this.KEYS = {
      ALL_BEDS: "medNotesMultiBedData_v7",
      API_KEY: "openai_api_key",
      AI_ENABLED: "aiEnabled",
      SELECTED_VERSION: "selectedVersion"
    };

    // OPTIMIZACIÓN: Configuración mejorada
    this.config = {
      saveDelay: 800, // Reducido para mejor responsividad
      maxRetries: 3,
      compressionThreshold: 1024, // Comprimir datos > 1KB
      batchSize: 5, // Máximo de operaciones por batch
      maxCacheSize: 50 // Máximo elementos en cache
    };

    // Estado interno optimizado
    this._state = {
      saveTimeout: null,
      saveInProgress: false,
      lastSaveTime: null,
      saveQueue: new Map(), // Cola de guardado para batch operations
      compressionEnabled: this._checkCompressionSupport()
    };

    // OPTIMIZACIÓN: Cache de datos para evitar re-serialización
    this._dataCache = new Map();
    
    // OPTIMIZACIÓN: Throttling para operaciones de escritura
    this._writeThrottle = this._createThrottle(this._performBatchSave.bind(this), 100);
  }

  /**
   * OPTIMIZADO: Verifica soporte de compresión
   * @private
   * @returns {boolean} - True si la compresión está disponible
   */
  _checkCompressionSupport() {
    try {
      return typeof CompressionStream !== 'undefined' && typeof DecompressionStream !== 'undefined';
    } catch {
      return false;
    }
  }

  /**
   * NUEVA FUNCIÓN: Crea función throttled para mejor rendimiento
   * @private
   * @param {Function} func - Función a throttle
   * @param {number} delay - Delay en ms
   * @returns {Function} - Función throttled
   */
  _createThrottle(func, delay) {
    let timeoutId;
    let lastExecTime = 0;
    
    return (...args) => {
      const currentTime = Date.now();
      
      if (currentTime - lastExecTime > delay) {
        func.apply(this, args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
          func.apply(this, args);
          lastExecTime = Date.now();
        }, delay - (currentTime - lastExecTime));
      }
    };
  }

  /**
   * OPTIMIZADO: Comprime datos si es necesario y está disponible
   * @private
   * @param {string} data - Datos a comprimir
   * @returns {Promise<string>} - Datos comprimidos o originales
   */
  async _compressData(data) {
    if (!this._state.compressionEnabled || data.length < this.config.compressionThreshold) {
      return data;
    }

    try {
      const stream = new CompressionStream('gzip');
      const writer = stream.writable.getWriter();
      const reader = stream.readable.getReader();
      
      writer.write(new TextEncoder().encode(data));
      writer.close();
      
      const chunks = [];
      let done = false;
      
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) chunks.push(value);
      }
      
      const compressed = new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0));
      let offset = 0;
      for (const chunk of chunks) {
        compressed.set(chunk, offset);
        offset += chunk.length;
      }
      
      // Marcar como comprimido y convertir a base64
      return 'COMPRESSED:' + btoa(String.fromCharCode(...compressed));
    } catch (error) {
      logger.warn('Error comprimiendo datos, usando datos sin comprimir', error);
      return data;
    }
  }

  /**
   * OPTIMIZADO: Descomprime datos si es necesario
   * @private
   * @param {string} data - Datos a descomprimir
   * @returns {Promise<string>} - Datos descomprimidos
   */
  async _decompressData(data) {
    if (!data.startsWith('COMPRESSED:')) {
      return data;
    }

    try {
      const compressedData = atob(data.substring(11));
      const bytes = new Uint8Array(compressedData.length);
      for (let i = 0; i < compressedData.length; i++) {
        bytes[i] = compressedData.charCodeAt(i);
      }

      const stream = new DecompressionStream('gzip');
      const writer = stream.writable.getWriter();
      const reader = stream.readable.getReader();
      
      writer.write(bytes);
      writer.close();
      
      const chunks = [];
      let done = false;
      
      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) chunks.push(value);
      }
      
      return new TextDecoder().decode(new Uint8Array(chunks.reduce((acc, chunk) => acc + chunk.length, 0)));
    } catch (error) {
      logger.error('Error descomprimiendo datos', error);
      throw new Error('Datos corruptos o formato inválido');
    }
  }

  /**
   * OPTIMIZADO: Guarda un valor en localStorage con compresión y cache
   * @param {string} key - Clave de almacenamiento
   * @param {any} value - Valor a guardar
   * @returns {Promise<boolean>} - true si se guardó exitosamente
   */
  async setItem(key, value) {
    try {
      let serializedValue;
      
      // OPTIMIZACIÓN: Verificar cache primero
      const cacheKey = `${key}:${JSON.stringify(value)}`;
      if (this._dataCache.has(cacheKey)) {
        serializedValue = this._dataCache.get(cacheKey);
      } else {
        // Serializar según el tipo
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          serializedValue = value.toString();
        } else {
          serializedValue = JSON.stringify(value);
        }
        
        // OPTIMIZACIÓN: Comprimir si es necesario
        serializedValue = await this._compressData(serializedValue);
        
        // Cachear resultado
        if (this._dataCache.size >= this.config.maxCacheSize) {
          // Limpiar cache más antiguo
          const firstKey = this._dataCache.keys().next().value;
          this._dataCache.delete(firstKey);
        }
        this._dataCache.set(cacheKey, serializedValue);
      }

      localStorage.setItem(key, serializedValue);
      this._state.lastSaveTime = Date.now();
      logger.debug(`StorageManager: Guardado exitoso para ${key}`);
      return true;
    } catch (e) {
      errorManager.handleError(
        e,
        { key, action: 'guardar en localStorage' },
        ErrorManager.ErrorTypes.STORAGE,
        e.name === 'QuotaExceededError' ? ErrorManager.Severity.CRITICAL : ErrorManager.Severity.HIGH
      );
      return false;
    }
  }

  /**
   * OPTIMIZADO: Obtiene un valor de localStorage con descompresión
   * @param {string} key - Clave de almacenamiento
   * @param {any} defaultValue - Valor por defecto si no existe
   * @returns {Promise<any>} - Valor recuperado o valor por defecto
   */
  async getItem(key, defaultValue = null) {
    try {
      const value = localStorage.getItem(key);
      if (value === null) return defaultValue;

      // OPTIMIZACIÓN: Descomprimir si es necesario
      const decompressedValue = await this._decompressData(value);

      // Intentar parsear como JSON primero
      try {
        return JSON.parse(decompressedValue);
      } catch (e) {
        // Si falla el parseo JSON, devolver el valor como string
        return decompressedValue;
      }
    } catch (e) {
      errorManager.handleError(
        e,
        { key, action: 'recuperar de localStorage' },
        ErrorManager.ErrorTypes.STORAGE,
        ErrorManager.Severity.MEDIUM
      );
      return defaultValue;
    }
  }

  /**
   * OPTIMIZADO: Programa el guardado de datos con debouncing mejorado
   * @param {Object} appState - Estado de la aplicación
   * @param {Function} saveUICallback - Callback para guardar UI
   */
  scheduleSave(appState, saveUICallback) {
    // Añadir a la cola de guardado
    this._state.saveQueue.set('bedData', { appState, saveUICallback, timestamp: Date.now() });
    
    // Limpiar timeout anterior
    if (this._state.saveTimeout) {
      clearTimeout(this._state.saveTimeout);
    }

    // OPTIMIZACIÓN: Usar requestIdleCallback si está disponible
    const scheduleCallback = window.requestIdleCallback || setTimeout;
    
    this._state.saveTimeout = scheduleCallback(() => {
      this._writeThrottle();
    }, this.config.saveDelay);
  }

  /**
   * NUEVA FUNCIÓN: Realiza guardado en batch para mejor rendimiento
   * @private
   */
  async _performBatchSave() {
    if (this._state.saveInProgress || this._state.saveQueue.size === 0) {
      return;
    }

    this._state.saveInProgress = true;

    try {
      // Procesar cola de guardado
      const saveOperations = Array.from(this._state.saveQueue.entries()).slice(0, this.config.batchSize);
      
      for (const [operation, data] of saveOperations) {
        if (operation === 'bedData') {
          if (data.saveUICallback) {
            data.saveUICallback();
          }
          await this.saveAllBedData(data.appState);
        }
        this._state.saveQueue.delete(operation);
      }

      this._showSaveIndicator();
    } catch (error) {
      logger.error('Error en guardado batch', error);
    } finally {
      this._state.saveInProgress = false;
      
      // Si quedan operaciones en cola, programar otro guardado
      if (this._state.saveQueue.size > 0) {
        setTimeout(() => this._writeThrottle(), this.config.saveDelay);
      }
    }
  }

  /**
   * OPTIMIZADO: Guarda todos los datos de las camas con mejor rendimiento
   * @param {Object} appState - Estado de la aplicación
   */
  async saveAllBedData(appState) {
    if (!appState?.beds || Object.keys(appState.beds).length === 0) {
      logger.debug("StorageManager: No hay datos para guardar");
      return;
    }

    try {
      const success = await this.setItem(this.KEYS.ALL_BEDS, appState.beds);
      if (success) {
        logger.debug("StorageManager: Datos guardados exitosamente");
      }
    } catch (e) {
      errorManager.handleError(
        e,
        { 
          action: 'guardar todos los datos de camas',
          bedCount: Object.keys(appState.beds).length
        },
        ErrorManager.ErrorTypes.STORAGE,
        e.name === "QuotaExceededError" ? ErrorManager.Severity.CRITICAL : ErrorManager.Severity.HIGH
      );
    }
  }

  /**
   * OPTIMIZADO: Carga todos los datos de las camas con mejor manejo de errores
   * @returns {Promise<boolean>} - true si se cargaron exitosamente
   */
  async loadAllBedData() {
    logger.debug("StorageManager: Cargando datos...");
    
    try {
      const data = await this.getItem(this.KEYS.ALL_BEDS, {});
      
      if (!data || Object.keys(data).length === 0) {
        logger.debug("StorageManager: No hay datos guardados");
        return false;
      }

      logger.debug(`StorageManager: Datos cargados. Total camas: ${Object.keys(data).length}`);
      return data;
    } catch (e) {
      errorManager.handleError(
        e,
        { action: 'cargar datos de camas' },
        ErrorManager.ErrorTypes.STORAGE,
        ErrorManager.Severity.HIGH
      );
      
      // Intentar limpiar datos corruptos
      this.removeItem(this.KEYS.ALL_BEDS);
      return false;
    }
  }

  /**
   * OPTIMIZADO: Muestra indicador de guardado con mejor UX
   * @private
   */
  _showSaveIndicator() {
    // OPTIMIZACIÓN: Usar requestAnimationFrame para animaciones suaves
    requestAnimationFrame(() => {
      try {
        let saveIndicator = document.getElementById('global-save-indicator');
        
        if (!saveIndicator) {
          saveIndicator = document.createElement('div');
          saveIndicator.id = 'global-save-indicator';
          saveIndicator.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white;
            padding: 8px 16px;
            border-radius: 20px;
            font-size: 14px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.15);
            z-index: 10000;
            opacity: 0;
            transform: translateY(-10px);
            transition: all 0.3s ease;
          `;
          document.body.appendChild(saveIndicator);
        }

        saveIndicator.textContent = '✓ Guardado';
        saveIndicator.style.opacity = '1';
        saveIndicator.style.transform = 'translateY(0)';
        
        setTimeout(() => {
          saveIndicator.style.opacity = '0';
          saveIndicator.style.transform = 'translateY(-10px)';
        }, 2000);
      } catch (error) {
        logger.error('Error al mostrar indicador de guardado', error);
      }
    });
  }

  /**
   * NUEVA FUNCIÓN: Obtiene estadísticas de almacenamiento
   * @returns {Object} - Estadísticas del storage
   */
  getStorageStats() {
    try {
      const used = new Blob(Object.values(localStorage)).size;
      const quota = navigator.storage?.estimate ? 
        navigator.storage.estimate().then(estimate => estimate.quota) : 
        Promise.resolve(5 * 1024 * 1024); // 5MB por defecto

      return {
        used,
        quota,
        compressionEnabled: this._state.compressionEnabled,
        cacheSize: this._dataCache.size,
        queueSize: this._state.saveQueue.size
      };
    } catch (error) {
      logger.error('Error obteniendo estadísticas de storage', error);
      return null;
    }
  }

  /**
   * NUEVA FUNCIÓN: Limpia cache y optimiza almacenamiento
   */
  cleanup() {
    this._dataCache.clear();
    this._state.saveQueue.clear();
    
    if (this._state.saveTimeout) {
      clearTimeout(this._state.saveTimeout);
      this._state.saveTimeout = null;
    }
    
    logger.debug('StorageManager: Limpieza completada');
  }

  /**
   * Elimina un valor de localStorage
   * @param {string} key - Clave de almacenamiento
   */
  removeItem(key) {
    try {
      localStorage.removeItem(key);
      // Limpiar cache relacionado
      for (const cacheKey of this._dataCache.keys()) {
        if (cacheKey.startsWith(`${key}:`)) {
          this._dataCache.delete(cacheKey);
        }
      }
      logger.debug(`StorageManager: Eliminado ${key}`);
    } catch (e) {
      errorManager.handleError(
        e,
        { key, action: 'eliminar de localStorage' },
        ErrorManager.ErrorTypes.STORAGE,
        ErrorManager.Severity.MEDIUM
      );
    }
  }
}

// Crear instancia singleton
export const storageManager = new StorageManager(); 