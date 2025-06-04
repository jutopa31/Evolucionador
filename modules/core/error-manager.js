/**
 * @fileoverview Sistema de manejo de errores centralizado
 * @version 2.0.0
 */

import { logger } from './logger.js';

export class ErrorManager {
  constructor(loggerInstance = logger) {
    this.logger = loggerInstance;
    this.errorHistory = [];
    this.maxHistorySize = 50;
    this.setupGlobalErrorHandlers();
  }

  // Tipos de errores
  static ErrorTypes = {
    VALIDATION: 'VALIDATION',
    NETWORK: 'NETWORK', 
    STORAGE: 'STORAGE',
    UI: 'UI',
    STATE: 'STATE',
    API: 'API',
    UNKNOWN: 'UNKNOWN'
  };

  // Severidades de errores
  static Severity = {
    LOW: 'LOW',
    MEDIUM: 'MEDIUM',
    HIGH: 'HIGH',
    CRITICAL: 'CRITICAL'
  };

  /**
   * Maneja un error de forma centralizada
   * @param {Error|string} error - El error o mensaje de error
   * @param {Object} context - Contexto adicional del error
   * @param {string} type - Tipo de error (ErrorTypes)
   * @param {string} severity - Severidad del error (Severity)
   */
  handleError(error, context = {}, type = ErrorManager.ErrorTypes.UNKNOWN, severity = ErrorManager.Severity.MEDIUM) {
    const errorInfo = this.createErrorInfo(error, context, type, severity);
    
    // Registrar en historial
    this.addToHistory(errorInfo);
    
    // Log según severidad
    this.logError(errorInfo);
    
    // Mostrar al usuario según severidad
    this.showUserNotification(errorInfo);
    
    // Acciones automáticas según tipo y severidad
    this.executeAutoActions(errorInfo);
    
    return errorInfo;
  }

  /**
   * Crea información estructurada del error
   */
  createErrorInfo(error, context, type, severity) {
    const timestamp = new Date().toISOString();
    const errorMessage = error instanceof Error ? error.message : String(error);
    const stack = error instanceof Error ? error.stack : null;
    
    return {
      id: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      message: errorMessage,
      stack,
      type,
      severity,
      timestamp,
      context: {
        ...context,
        url: window.location.href,
        userAgent: navigator.userAgent,
        bedId: window.appState?.getCurrentBedId?.() || 'unknown'
      }
    };
  }

  /**
   * Registra el error en el historial
   */
  addToHistory(errorInfo) {
    this.errorHistory.unshift(errorInfo);
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(0, this.maxHistorySize);
    }
  }

  /**
   * Registra el error en logs
   */
  logError(errorInfo) {
    const logMessage = `${errorInfo.type}: ${errorInfo.message}`;
    const logData = {
      id: errorInfo.id,
      context: errorInfo.context,
      stack: errorInfo.stack
    };

    switch (errorInfo.severity) {
      case ErrorManager.Severity.CRITICAL:
        this.logger.error(`[CRÍTICO] ${logMessage}`, logData);
        break;
      case ErrorManager.Severity.HIGH:
        this.logger.error(`[ALTO] ${logMessage}`, logData);
        break;
      case ErrorManager.Severity.MEDIUM:
        this.logger.warn(`[MEDIO] ${logMessage}`, logData);
        break;
      case ErrorManager.Severity.LOW:
        this.logger.info(`[BAJO] ${logMessage}`, logData);
        break;
    }
  }

  /**
   * Muestra notificación al usuario
   */
  showUserNotification(errorInfo) {
    const userMessage = this.getUserFriendlyMessage(errorInfo);
    
    switch (errorInfo.severity) {
      case ErrorManager.Severity.CRITICAL:
        this.showCriticalError(userMessage, errorInfo);
        break;
      case ErrorManager.Severity.HIGH:
        this.showError(userMessage);
        break;
      case ErrorManager.Severity.MEDIUM:
        this.showWarning(userMessage);
        break;
      case ErrorManager.Severity.LOW:
        this.showInfo(userMessage);
        break;
    }
  }

  /**
   * Convierte errores técnicos en mensajes amigables
   */
  getUserFriendlyMessage(errorInfo) {
    const messageMap = {
      [ErrorManager.ErrorTypes.VALIDATION]: 'Los datos ingresados no son válidos',
      [ErrorManager.ErrorTypes.NETWORK]: 'Error de conexión. Verifica tu internet',
      [ErrorManager.ErrorTypes.STORAGE]: 'Error al guardar datos. Espacio insuficiente',
      [ErrorManager.ErrorTypes.UI]: 'Error en la interfaz. Intenta recargar',
      [ErrorManager.ErrorTypes.STATE]: 'Error en el estado de la aplicación',
      [ErrorManager.ErrorTypes.API]: 'Error en el servicio. Intenta más tarde',
      [ErrorManager.ErrorTypes.UNKNOWN]: 'Ha ocurrido un error inesperado'
    };

    const baseMessage = messageMap[errorInfo.type] || messageMap[ErrorManager.ErrorTypes.UNKNOWN];
    
    // Agregar contexto específico si está disponible
    if (errorInfo.context.action) {
      return `${baseMessage} al ${errorInfo.context.action}`;
    }
    
    return baseMessage;
  }

  /**
   * Muestra error crítico con opción de reporte
   */
  showCriticalError(message, errorInfo) {
    const fullMessage = `${message}\n\nID del error: ${errorInfo.id}\n\n¿Deseas reportar este error?`;
    
    if (confirm(fullMessage)) {
      this.reportError(errorInfo);
    }
    
    // También mostrar en UI si está disponible
    if (window.ErrorUI?.showError) {
      window.ErrorUI.showError(`[CRÍTICO] ${message}`, 0); // Sin auto-hide
    }
  }

  /**
   * Muestra error normal
   */
  showError(message) {
    if (window.ErrorUI?.showError) {
      window.ErrorUI.showError(message, 8000);
    } else {
      alert(`Error: ${message}`);
    }
  }

  /**
   * Muestra advertencia
   */
  showWarning(message) {
    if (window.ErrorUI?.showWarning) {
      window.ErrorUI.showWarning(message, 5000);
    } else {
      console.warn(`Advertencia: ${message}`);
    }
  }

  /**
   * Muestra información
   */
  showInfo(message) {
    if (window.ErrorUI?.showInfo) {
      window.ErrorUI.showInfo(message, 3000);
    } else {
      console.info(`Info: ${message}`);
    }
  }

  /**
   * Ejecuta acciones automáticas según el error
   */
  executeAutoActions(errorInfo) {
    switch (errorInfo.type) {
      case ErrorManager.ErrorTypes.STORAGE:
        if (errorInfo.severity === ErrorManager.Severity.CRITICAL) {
          this.handleStorageFailure();
        }
        break;
      case ErrorManager.ErrorTypes.STATE:
        if (errorInfo.severity >= ErrorManager.Severity.HIGH) {
          this.handleStateCorruption();
        }
        break;
      case ErrorManager.ErrorTypes.NETWORK:
        this.handleNetworkError();
        break;
    }
  }

  /**
   * Maneja fallos de almacenamiento
   */
  handleStorageFailure() {
    try {
      // Intentar limpiar storage antiguo
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && (key.includes('old_') || key.includes('backup_'))) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      this.logger.info('Storage limpiado automáticamente');
    } catch (e) {
      this.logger.error('No se pudo limpiar storage automáticamente', e);
    }
  }

  /**
   * Maneja corrupción de estado
   */
  handleStateCorruption() {
    try {
      // Intentar restaurar estado mínimo
      if (window.appState && typeof window.appState.createBed === 'function') {
        if (window.appState.getBedCount() === 0) {
          window.appState.createBed('1');
          window.appState.setCurrentBedId('1');
          this.logger.info('Estado mínimo restaurado automáticamente');
        }
      }
    } catch (e) {
      this.logger.error('No se pudo restaurar estado automáticamente', e);
    }
  }

  /**
   * Maneja errores de red
   */
  handleNetworkError() {
    // Implementar retry logic o modo offline si es necesario
    this.logger.info('Error de red detectado - implementar lógica de reintento');
  }

  /**
   * Reporta error (placeholder para futura implementación)
   */
  reportError(errorInfo) {
    // Aquí se podría enviar a un servicio de reporte de errores
    this.logger.info('Error reportado', { errorId: errorInfo.id });
    console.log('Error para reportar:', errorInfo);
  }

  /**
   * Configura manejadores globales de errores
   */
  setupGlobalErrorHandlers() {
    // Errores JavaScript no capturados
    window.addEventListener('error', (event) => {
      this.handleError(
        event.error || event.message,
        { 
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          action: 'ejecución de script'
        },
        ErrorManager.ErrorTypes.UNKNOWN,
        ErrorManager.Severity.HIGH
      );
    });

    // Promesas rechazadas no capturadas
    window.addEventListener('unhandledrejection', (event) => {
      this.handleError(
        event.reason,
        { action: 'promesa rechazada' },
        ErrorManager.ErrorTypes.UNKNOWN,
        ErrorManager.Severity.MEDIUM
      );
    });
  }

  /**
   * Obtiene estadísticas de errores
   */
  getErrorStats() {
    const stats = {
      total: this.errorHistory.length,
      byType: {},
      bySeverity: {},
      recent: this.errorHistory.slice(0, 5)
    };

    this.errorHistory.forEach(error => {
      stats.byType[error.type] = (stats.byType[error.type] || 0) + 1;
      stats.bySeverity[error.severity] = (stats.bySeverity[error.severity] || 0) + 1;
    });

    return stats;
  }

  /**
   * Limpia el historial de errores
   */
  clearHistory() {
    this.errorHistory = [];
    this.logger.info('Historial de errores limpiado');
  }
}

// Instancia singleton
export const errorManager = new ErrorManager(); 