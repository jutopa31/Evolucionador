/**
 * @fileoverview Funciones auxiliares para manipulación del DOM
 * @version 2.1.0 - OPTIMIZADO
 */

import { logger } from '../core/logger.js';
import { errorManager, ErrorManager } from '../core/error-manager.js';

// OPTIMIZACIÓN: Cache de elementos DOM para evitar búsquedas repetidas
const elementCache = new Map();
const CACHE_EXPIRY = 30000; // 30 segundos

/**
 * OPTIMIZADO: Obtiene un elemento por su ID con cache
 * @param {string} id - ID del elemento
 * @param {boolean} useCache - Si usar cache (por defecto true)
 * @returns {HTMLElement|null} - Elemento encontrado o null
 */
export function getElement(id, useCache = true) {
  if (useCache && elementCache.has(id)) {
    const cached = elementCache.get(id);
    // Verificar si el elemento aún existe en el DOM y no ha expirado
    if (cached.element && document.contains(cached.element) && 
        Date.now() - cached.timestamp < CACHE_EXPIRY) {
      return cached.element;
    } else {
      elementCache.delete(id); // Limpiar cache inválido
    }
  }

  const element = document.getElementById(id);
  if (!element) {
    errorManager.handleError(
      `Elemento con ID '${id}' no encontrado`,
      { elementId: id, action: 'obtener elemento DOM' },
      ErrorManager.ErrorTypes.UI,
      ErrorManager.Severity.LOW
    );
    return null;
  }

  // Cachear elemento válido
  if (useCache) {
    elementCache.set(id, {
      element,
      timestamp: Date.now()
    });
  }

  return element;
}

/**
 * OPTIMIZADO: Obtiene un input estructurado con cache y validación mejorada
 * @param {string} sKey - Clave de sección
 * @param {string} fId - ID del campo
 * @param {string} bedId - ID de la cama
 * @returns {HTMLElement|null} - Input encontrado o null
 */
export function getStructuredInput(sKey, fId, bedId) {
  if (!sKey || !fId || !bedId) {
    logger.warn("getStructuredInput: Parámetros inválidos", { sKey, fId, bedId });
    return null;
  }

  const elementId = `input-${sKey}-${fId}-${bedId}`;
  const element = getElement(elementId);
  
  if (!element) {
    errorManager.handleError(
      `Input estructurado no encontrado: ${elementId}`,
      { sectionKey: sKey, fieldId: fId, bedId, action: 'obtener input estructurado' },
      ErrorManager.ErrorTypes.UI,
      ErrorManager.Severity.LOW
    );
  }
  
  return element;
}

/**
 * OPTIMIZADO: Obtiene un textarea principal de sección con validación mejorada
 * @param {string} key - Clave de la sección
 * @param {string} bedId - ID de la cama
 * @returns {HTMLElement|null} - Textarea encontrado o null
 */
export function getTextArea(key, bedId) {
  if (!key || !bedId) {
    logger.warn("getTextArea: Parámetros inválidos", { key, bedId });
    return null;
  }

  const elementId = `ta-${key}-${bedId}`;
  const element = getElement(elementId);
  
  if (!element) {
    // Solo registrar como error si es una sección que debería tener textarea
    const sectionsWithTextarea = new Set(['evolucion', 'fisico', 'notas_libres']);
    if (sectionsWithTextarea.has(key)) {
      errorManager.handleError(
        `Textarea no encontrado: ${elementId}`,
        { sectionKey: key, bedId, action: 'obtener textarea' },
        ErrorManager.ErrorTypes.UI,
        ErrorManager.Severity.LOW
      );
    }
  }
  
  return element;
}

/**
 * OPTIMIZADO: Inserta texto en la posición del cursor con mejor rendimiento
 * @param {HTMLTextAreaElement} textarea - El elemento textarea
 * @param {string} text - El texto a insertar
 * @param {boolean} selectInserted - Si seleccionar el texto insertado
 */
export function insertAtCursor(textarea, text, selectInserted = false) {
  if (!textarea || !text) {
    logger.debug("insertAtCursor: Textarea o texto no proporcionado.");
    return;
  }

  // OPTIMIZACIÓN: Verificar que el elemento es válido antes de proceder
  if (!(textarea instanceof HTMLTextAreaElement) && !(textarea instanceof HTMLInputElement)) {
    logger.warn("insertAtCursor: Elemento no es un textarea o input válido");
    return;
  }

  const start = textarea.selectionStart;
  const end = textarea.selectionEnd;
  const currentText = textarea.value;

  // OPTIMIZACIÓN: Usar batch updates para mejor rendimiento
  requestAnimationFrame(() => {
    // Insertar texto
    textarea.value = currentText.slice(0, start) + text + currentText.slice(end);

    // Posicionar cursor
    const newPos = start + text.length;
    textarea.selectionStart = textarea.selectionEnd = newPos;

    // Seleccionar texto insertado si se solicita
    if (selectInserted) {
      textarea.setSelectionRange(start, newPos);
    }

    textarea.focus();

    // Disparar evento 'input' para notificar cambios
    textarea.dispatchEvent(new Event("input", { bubbles: true }));
  });

  logger.debug(`insertAtCursor: Texto insertado en ${textarea.id || "textarea"}.`);
}

/**
 * OPTIMIZADO: Alterna la visibilidad de una sección con mejor rendimiento
 * @param {string} key - La clave de la sección
 * @param {string} bedId - ID de la cama (opcional, se obtiene del estado si no se proporciona)
 * @returns {boolean} - True si la sección fue encontrada y procesada
 */
export function toggleSectionVisibility(key, bedId = null) {
  logger.debug(`toggleSectionVisibility: Alternando visibilidad de sección ${key}`);
  
  // Obtener bedId del estado global si no se proporciona
  const currentBedId = bedId || window.appState?.getCurrentBedId?.();
  if (!currentBedId) {
    logger.warn("toggleSectionVisibility: No se pudo determinar bedId");
    return false;
  }

  const contentId = `content-${key}-${currentBedId}`;
  const content = getElement(contentId);
  
  if (content) {
    // OPTIMIZACIÓN: Usar requestAnimationFrame para animaciones suaves
    requestAnimationFrame(() => {
      const isVisible = content.style.display !== 'none';
      content.style.display = isVisible ? 'none' : 'block';
      
      // OPTIMIZACIÓN: Actualizar clase para CSS transitions
      content.classList.toggle('section-hidden', isVisible);
      content.classList.toggle('section-visible', !isVisible);
      
      logger.debug(`toggleSectionVisibility: Sección ${key} ${isVisible ? 'oculta' : 'visible'}`);
    });
    return true;
  } else {
    logger.debug(`toggleSectionVisibility: No se encontró elemento ${contentId}`);
    return false;
  }
}

/**
 * OPTIMIZADO: Cierra todos los menús flotantes con mejor rendimiento
 * @param {HTMLElement} except - Menú a excluir del cierre
 */
export function closeAllMenus(except = null) {
  logger.debug("closeAllMenus: Cerrando menús flotantes.");
  
  // OPTIMIZACIÓN: Usar querySelectorAll una sola vez y procesar en batch
  const menus = document.querySelectorAll("ul.menu");
  const menusToClose = Array.from(menus).filter(m => 
    m !== except && (m.style.display === "block" || window.getComputedStyle(m).display === "block")
  );

  if (menusToClose.length > 0) {
    // OPTIMIZACIÓN: Batch DOM updates
    requestAnimationFrame(() => {
      menusToClose.forEach(m => {
        m.style.display = "none";
        logger.debug(`closeAllMenus: Menú cerrado: ${m.id || m.className}`);
      });
    });
  }
}

/**
 * OPTIMIZADO: Genera el HTML para el botón de reconocimiento de voz con validación
 * @param {string} targetInputId - ID del input objetivo
 * @returns {string} - HTML del botón de voz
 */
export function makeVoiceButtonHTML(targetInputId) {
  if (!targetInputId) {
    logger.warn("makeVoiceButtonHTML: targetInputId no proporcionado");
    return '';
  }

  // OPTIMIZACIÓN: Template string más eficiente y seguro
  const escapedId = targetInputId.replace(/"/g, '&quot;');
  return `<button type="button" 
                  class="voice-input-btn" 
                  data-action="startDictation" 
                  data-target-input="${escapedId}" 
                  title="Dictar por voz"
                  aria-label="Activar dictado por voz">
            🎙️
          </button>`;
}

/**
 * NUEVA FUNCIÓN: Limpia el cache de elementos DOM
 * @param {string} id - ID específico a limpiar (opcional)
 */
export function clearElementCache(id = null) {
  if (id) {
    elementCache.delete(id);
    logger.debug(`clearElementCache: Cache limpiado para elemento ${id}`);
  } else {
    elementCache.clear();
    logger.debug("clearElementCache: Todo el cache de elementos limpiado");
  }
}

/**
 * NUEVA FUNCIÓN: Obtiene estadísticas del cache de elementos
 * @returns {Object} - Estadísticas del cache
 */
export function getCacheStats() {
  const now = Date.now();
  const validEntries = Array.from(elementCache.entries()).filter(([id, cached]) => 
    cached.element && document.contains(cached.element) && 
    now - cached.timestamp < CACHE_EXPIRY
  );

  return {
    totalEntries: elementCache.size,
    validEntries: validEntries.length,
    expiredEntries: elementCache.size - validEntries.length
  };
}

/**
 * NUEVA FUNCIÓN: Limpia automáticamente el cache de elementos expirados
 */
export function cleanupExpiredCache() {
  const now = Date.now();
  const toDelete = [];

  for (const [id, cached] of elementCache.entries()) {
    if (!cached.element || !document.contains(cached.element) || 
        now - cached.timestamp >= CACHE_EXPIRY) {
      toDelete.push(id);
    }
  }

  toDelete.forEach(id => elementCache.delete(id));
  
  if (toDelete.length > 0) {
    logger.debug(`cleanupExpiredCache: ${toDelete.length} entradas expiradas eliminadas del cache`);
  }
}

// OPTIMIZACIÓN: Limpieza automática del cache cada 5 minutos
setInterval(cleanupExpiredCache, 5 * 60 * 1000); 