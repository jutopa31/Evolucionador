/**
 * @fileoverview Sistema de gestión de eventos centralizado
 * @version 2.1.0
 */

import { logger } from '../core/logger.js';

/**
 * Sistema de gestión de eventos centralizado
 */
export class EventManager {
  constructor() {
    this.events = new Map();
  }
  
  /**
   * Registra un callback para un evento
   * @param {string} event - Nombre del evento
   * @param {Function} callback - Función callback
   */
  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event).add(callback);
    logger.debug(`Evento registrado: ${event}`);
  }
  
  /**
   * Elimina un callback de un evento
   * @param {string} event - Nombre del evento
   * @param {Function} callback - Función callback a eliminar
   */
  off(event, callback) {
    if (this.events.has(event)) {
      this.events.get(event).delete(callback);
      logger.debug(`Evento eliminado: ${event}`);
    }
  }
  
  /**
   * Emite un evento con datos
   * @param {string} event - Nombre del evento
   * @param {any} data - Datos del evento
   */
  emit(event, data) {
    if (this.events.has(event)) {
      logger.debug(`Emitiendo evento: ${event}`, data);
      this.events.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          logger.error(`Error en evento ${event}`, error);
        }
      });
    }
  }

  /**
   * Obtiene la lista de eventos registrados
   * @returns {Array<string>} - Lista de nombres de eventos
   */
  getRegisteredEvents() {
    return Array.from(this.events.keys());
  }

  /**
   * Obtiene el número de listeners para un evento
   * @param {string} event - Nombre del evento
   * @returns {number} - Número de listeners
   */
  getListenerCount(event) {
    return this.events.has(event) ? this.events.get(event).size : 0;
  }

  /**
   * Limpia todos los eventos registrados
   */
  clear() {
    this.events.clear();
    logger.debug('Todos los eventos han sido limpiados');
  }

  /**
   * Limpia los listeners de un evento específico
   * @param {string} event - Nombre del evento
   */
  clearEvent(event) {
    if (this.events.has(event)) {
      this.events.delete(event);
      logger.debug(`Evento ${event} limpiado`);
    }
  }
}

// Crear instancia global
export const eventManager = new EventManager();

// Hacer disponible globalmente para compatibilidad
if (typeof window !== 'undefined') {
  window.EventManager = eventManager;
} 