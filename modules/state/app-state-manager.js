/**
 * @fileoverview Gestor de estado centralizado de la aplicación
 * @version 2.1.0
 */

import { logger } from '../core/logger.js';
import { errorManager, ErrorManager } from '../core/error-manager.js';

export class AppStateManager {
  constructor() {
    this.beds = {};
    this.currentBedId = null;
    this.version = null;
    this.aiEnabled = false;
    this.initialized = false;
    this.selectedVersion = null;
    this.processingOCR = false;
    this.medicationsList = [];
  }

  // Métodos básicos de acceso
  getBed(id) { 
    if (!id) {
      logger.warn('getBed: ID de cama no proporcionado');
      return null;
    }
    return this.beds[id]; 
  }

  setBed(id, data) { 
    if (!id) {
      errorManager.handleError(
        'ID de cama no proporcionado para setBed',
        { data, action: 'establecer datos de cama' },
        ErrorManager.ErrorTypes.VALIDATION,
        ErrorManager.Severity.MEDIUM
      );
      return false;
    }
    this.beds[id] = data; 
    logger.debug(`Datos de cama ${id} establecidos`);
    return true;
  }

  getBeds() { 
    return this.beds; 
  }

  getCurrentBedId() { 
    return this.currentBedId; 
  }

  setCurrentBedId(id) { 
    if (id && !this.beds[id]) {
      errorManager.handleError(
        `Intentando establecer cama actual a ID inexistente: ${id}`,
        { id, availableBeds: Object.keys(this.beds), action: 'establecer cama actual' },
        ErrorManager.ErrorTypes.STATE,
        ErrorManager.Severity.MEDIUM
      );
      return false;
    }
    this.currentBedId = id; 
    logger.debug(`Cama actual establecida a: ${id}`);
    return true;
  }
  
  // Métodos adicionales para operaciones comunes
  getCurrentBed() { 
    return this.currentBedId ? this.beds[this.currentBedId] : null; 
  }
  
  hasBed(id) { 
    return id && this.beds.hasOwnProperty(id); 
  }
  
  getBedCount() { 
    return Object.keys(this.beds).length; 
  }
  
  getBedIds() { 
    return Object.keys(this.beds); 
  }
  
  deleteBed(id) {
    if (!this.hasBed(id)) {
      logger.warn(`Intentando eliminar cama inexistente: ${id}`);
      return false;
    }

    delete this.beds[id];
    logger.info(`Cama ${id} eliminada`);

    // Si era la cama actual, seleccionar otra
    if (this.currentBedId === id) {
      const remainingIds = this.getBedIds();
      this.currentBedId = remainingIds.length > 0 ? remainingIds[0] : null;
      logger.info(`Nueva cama actual: ${this.currentBedId}`);
    }
    return true;
  }
  
  createBed(id, data = null) {
    if (this.hasBed(id)) {
      logger.warn(`Cama ${id} ya existe, no se creará una nueva`);
      return false;
    }

    this.beds[id] = data || {
      structured: {},
      text: {},
      meds: []
    };
    
    logger.info(`Cama ${id} creada`);
    return true;
  }

  /**
   * Valida la integridad del estado
   */
  validateState() {
    const issues = [];

    // Verificar que hay al menos una cama
    if (this.getBedCount() === 0) {
      issues.push('No hay camas en el estado');
    }

    // Verificar que la cama actual existe
    if (this.currentBedId && !this.hasBed(this.currentBedId)) {
      issues.push(`Cama actual ${this.currentBedId} no existe`);
    }

    // Verificar estructura de cada cama
    Object.entries(this.beds).forEach(([bedId, bedData]) => {
      if (!bedData) {
        issues.push(`Cama ${bedId} tiene datos nulos`);
        return;
      }

      if (!bedData.meds || !Array.isArray(bedData.meds)) {
        issues.push(`Cama ${bedId} no tiene array de medicamentos válido`);
      }

      if (!bedData.structured || typeof bedData.structured !== 'object') {
        issues.push(`Cama ${bedId} no tiene objeto structured válido`);
      }

      if (!bedData.text || typeof bedData.text !== 'object') {
        issues.push(`Cama ${bedId} no tiene objeto text válido`);
      }
    });

    if (issues.length > 0) {
      errorManager.handleError(
        `Problemas de integridad en el estado: ${issues.join(', ')}`,
        { issues, bedCount: this.getBedCount(), currentBedId: this.currentBedId },
        ErrorManager.ErrorTypes.STATE,
        ErrorManager.Severity.HIGH
      );
      return false;
    }

    logger.debug('Estado validado correctamente');
    return true;
  }

  /**
   * Repara problemas comunes del estado
   */
  repairState() {
    logger.info('Iniciando reparación del estado');
    let repaired = false;

    // Crear cama por defecto si no hay ninguna
    if (this.getBedCount() === 0) {
      this.createBed('1');
      this.setCurrentBedId('1');
      repaired = true;
      logger.info('Cama por defecto creada');
    }

    // Establecer cama actual si no hay una válida
    if (!this.currentBedId || !this.hasBed(this.currentBedId)) {
      const firstBedId = this.getBedIds()[0];
      if (firstBedId) {
        this.setCurrentBedId(firstBedId);
        repaired = true;
        logger.info(`Cama actual reparada: ${firstBedId}`);
      }
    }

    // Reparar estructura de camas
    Object.entries(this.beds).forEach(([bedId, bedData]) => {
      if (!bedData) {
        this.beds[bedId] = { structured: {}, text: {}, meds: [] };
        repaired = true;
        logger.info(`Estructura de cama ${bedId} reparada`);
        return;
      }

      if (!Array.isArray(bedData.meds)) {
        bedData.meds = [];
        repaired = true;
        logger.info(`Array de medicamentos de cama ${bedId} reparado`);
      }

      if (!bedData.structured || typeof bedData.structured !== 'object') {
        bedData.structured = {};
        repaired = true;
        logger.info(`Objeto structured de cama ${bedId} reparado`);
      }

      if (!bedData.text || typeof bedData.text !== 'object') {
        bedData.text = {};
        repaired = true;
        logger.info(`Objeto text de cama ${bedId} reparado`);
      }
    });

    if (repaired) {
      logger.info('Estado reparado exitosamente');
    } else {
      logger.debug('No se requirieron reparaciones');
    }

    return repaired;
  }

  /**
   * Obtiene un resumen del estado actual
   */
  getStateSummary() {
    return {
      bedCount: this.getBedCount(),
      currentBedId: this.currentBedId,
      bedIds: this.getBedIds(),
      version: this.version,
      aiEnabled: this.aiEnabled,
      initialized: this.initialized,
      medicationsCount: this.medicationsList.length,
      processingOCR: this.processingOCR
    };
  }

  /**
   * Exporta el estado para backup
   */
  exportState() {
    return {
      beds: this.beds,
      currentBedId: this.currentBedId,
      version: this.version,
      aiEnabled: this.aiEnabled,
      selectedVersion: this.selectedVersion,
      medicationsList: this.medicationsList,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Importa estado desde backup
   */
  importState(stateData) {
    try {
      if (!stateData || typeof stateData !== 'object') {
        throw new Error('Datos de estado inválidos');
      }

      // Validar estructura básica
      if (!stateData.beds || typeof stateData.beds !== 'object') {
        throw new Error('Estructura de camas inválida');
      }

      // Importar datos
      this.beds = stateData.beds;
      this.currentBedId = stateData.currentBedId || null;
      this.version = stateData.version || null;
      this.aiEnabled = stateData.aiEnabled || false;
      this.selectedVersion = stateData.selectedVersion || null;
      this.medicationsList = stateData.medicationsList || [];

      // Validar y reparar si es necesario
      this.repairState();
      
      logger.info('Estado importado exitosamente', this.getStateSummary());
      return true;
    } catch (error) {
      errorManager.handleError(
        error,
        { stateData, action: 'importar estado' },
        ErrorManager.ErrorTypes.STATE,
        ErrorManager.Severity.HIGH
      );
      return false;
    }
  }

  /**
   * Resetea el estado a valores por defecto
   */
  reset() {
    logger.info('Reseteando estado de la aplicación');
    
    this.beds = {};
    this.currentBedId = null;
    this.version = null;
    this.aiEnabled = false;
    this.initialized = false;
    this.selectedVersion = null;
    this.processingOCR = false;
    this.medicationsList = [];

    // Crear cama por defecto
    this.createBed('1');
    this.setCurrentBedId('1');

    logger.info('Estado reseteado exitosamente');
  }
}

// Instancia singleton
export const appState = new AppStateManager(); 