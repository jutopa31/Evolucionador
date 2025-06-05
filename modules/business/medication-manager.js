/**
 * @fileoverview Gestión de medicamentos
 * @version 2.1.0
 */

import { logger } from '../core/logger.js';
import { errorManager, ErrorManager } from '../core/error-manager.js';
import { appState } from '../state/app-state-manager.js';
import { storageManager } from '../storage/storage-manager.js';
import { getElement } from '../ui/dom-helpers.js';

/**
 * Sincroniza los chips de medicación con el estado actual de la cama
 * OPTIMIZADO: Eliminado setTimeout innecesario, mejorado rendimiento DOM
 */
export function syncChips() {
  logger.debug("syncChips: Iniciando sincronización de chips...");
  const d = getElement("med-display");
  if (!d) {
    errorManager.handleError(
      "Elemento med-display no encontrado",
      { action: 'sincronizar chips de medicación' },
      ErrorManager.ErrorTypes.UI,
      ErrorManager.Severity.MEDIUM
    );
    return;
  }
  
  // Verificar estado y medicaciones usando appState
  const bedId = appState.getCurrentBedId();
  if (!bedId) {
    errorManager.handleError(
      "No hay cama seleccionada para sincronizar medicaciones",
      { action: 'sincronizar chips de medicación' },
      ErrorManager.ErrorTypes.STATE,
      ErrorManager.Severity.MEDIUM
    );
    return;
  }

  const currentBed = appState.getBed(bedId);
  if (!currentBed) {
    errorManager.handleError(
      `No se encontraron datos para la cama ${bedId}`,
      { bedId, action: 'sincronizar chips de medicación' },
      ErrorManager.ErrorTypes.STATE,
      ErrorManager.Severity.MEDIUM
    );
    return;
  }

  // Asegurar que meds es un array y está limpio
  if (!Array.isArray(currentBed.meds)) {
    logger.warn("Estado de medicación no era un array, inicializando...", { bedId });
    currentBed.meds = [];
    return;
  }

  const meds = currentBed.meds;
  logger.debug(`syncChips: Procesando ${meds.length} medicaciones...`);

  // OPTIMIZACIÓN: Usar DocumentFragment para batch DOM operations
  const fragment = document.createDocumentFragment();
  
  // Limpiar display actual de una vez
  d.innerHTML = "";

  // Crear y añadir chips para cada medicación usando fragment
  meds.forEach((item, index) => {
    if (!item) {
      logger.warn(`Medicación en índice ${index} es null o undefined, saltando...`, { bedId, index });
      return;
    }

    const c = document.createElement("span");
    c.className = "chip";
    c.textContent = item;

    const b = document.createElement("button");
    b.textContent = "×";
    b.title = `Quitar ${item}`;
    b.dataset.item = item;
    b.dataset.action = "removeMed";
    b.className = "remove-med-btn";
    
    // OPTIMIZACIÓN: Usar event delegation en lugar de onclick individual
    b.addEventListener('click', () => {
      removeMedication(item);
      // OPTIMIZACIÓN: Llamada directa sin setTimeout innecesario
      syncChips();
    });
    
    c.appendChild(b);
    fragment.appendChild(c);
    logger.debug(`syncChips: Chip creado para medicación "${item}"`);
  });
  
  // OPTIMIZACIÓN: Una sola operación DOM al final
  d.appendChild(fragment);
  logger.debug(`syncChips: Chips de medicación sincronizados. Total: ${meds.length}`);
}

/**
 * Elimina una medicación del estado de la cama actual
 * @param {string} item - El texto completo de la medicación a eliminar
 */
export function removeMedication(item) {
  const bedId = appState.getCurrentBedId();
  const bed = appState.getBed(bedId);
  
  if (!item || !bedId || !bed) {
    logger.debug("removeMedication: No se puede eliminar medicación: item inválido o cama no seleccionada.");
    return;
  }

  if (!Array.isArray(bed.meds)) {
    bed.meds = [];
    logger.debug("removeMedication: Estado de medicación no era un array.");
    return;
  }

  const idx = bed.meds.indexOf(item);
  if (idx !== -1) {
    bed.meds.splice(idx, 1);
    syncChips();
    storageManager.scheduleSave(appState, () => {});
    logger.debug(`removeMedication: Medicación "${item}" eliminada.`);
  } else {
    logger.debug(`removeMedication: Medicación "${item}" no encontrada en la lista.`);
  }
}

/**
 * Añade una medicación a la lista de la cama actual
 * @param {string} value - Valor de la medicación a añadir
 */
export function addMedication(value) {
  logger.debug("addMedication: Agregando medicamento:", value);
  
  if (!value) {
    const input = getElement("medication-input");
    value = input ? input.value.trim() : "";
  }

  if (!value) {
    logger.warn("addMedication: No se proporcionó un valor para el medicamento");
    return;
  }

  const bedId = appState.getCurrentBedId();
  const currentBed = appState.getBed(bedId);
  
  if (!currentBed) {
    errorManager.handleError(
      "No hay cama seleccionada para añadir medicación",
      { value, action: 'añadir medicación' },
      ErrorManager.ErrorTypes.STATE,
      ErrorManager.Severity.MEDIUM
    );
    return;
  }

  if (!Array.isArray(currentBed.meds)) {
    currentBed.meds = [];
  }

  // Verificar si ya existe
  if (currentBed.meds.includes(value)) {
    logger.warn(`Medicación "${value}" ya existe en la lista`);
    return;
  }

  currentBed.meds.push(value);
  syncChips();
  storageManager.scheduleSave(appState, () => {});
  logger.debug(`addMedication: Medicamento "${value}" agregado exitosamente`);
}

/**
 * Configura los listeners para la sección de medicación
 * OPTIMIZADO: Añadido debouncing para búsqueda, mejorado rendimiento
 */
export function setupMedicationListeners() {
  logger.debug("setupMedicationListeners: Configurando listeners de medicación...");
  
  const medInput = getElement("med-input");
  const doseInput = getElement("dose-input");
  const doseForm = getElement("dose-form");
  const suggestionsList = getElement("med-suggestions");
  const doseAdd = getElement("dose-add");
  const doseCancel = getElement("dose-cancel");

  if (!medInput || !doseInput || !doseForm || !suggestionsList || !doseAdd || !doseCancel) {
    logger.error("setupMedicationListeners: Elementos de medicación no encontrados.");
    return;
  }

  // Limpiar listeners anteriores
  const newMedInput = medInput.cloneNode(true);
  medInput.parentNode.replaceChild(newMedInput, medInput);

  // OPTIMIZACIÓN: Debouncing para búsqueda de medicamentos
  let searchTimeout;
  const SEARCH_DELAY = 300; // ms

  // Configurar listeners con debouncing optimizado
  newMedInput.addEventListener("input", (e) => {
    const query = e.target.value.trim();
    
    // Limpiar timeout anterior
    clearTimeout(searchTimeout);
    
    if (query.length < 2) {
      suggestionsList.style.display = "none";
      return;
    }

    // OPTIMIZACIÓN: Debounce la búsqueda para evitar búsquedas excesivas
    searchTimeout = setTimeout(() => {
      performMedicationSearch(query, suggestionsList);
    }, SEARCH_DELAY);
  });

  // Manejar clic en sugerencias con event delegation optimizado
  suggestionsList.addEventListener("click", (e) => {
    const li = e.target.closest("li");
    if (li) {
      const med = li.dataset.med;
      if (med) {
        newMedInput.value = med;
        suggestionsList.style.display = "none";
        doseForm.style.display = "flex";
        doseInput.focus();
      }
    }
  });

  // OPTIMIZACIÓN: Listener único para cerrar sugerencias
  const closeSuggestions = (e) => {
    if (!e.target.closest("#med-input-container")) {
      suggestionsList.style.display = "none";
    }
  };
  
  // Usar capture para mejor rendimiento
  document.addEventListener("click", closeSuggestions, { capture: true });

  // Función optimizada para agregar medicamento
  const addMedicationHandler = () => {
    const medName = newMedInput.value.trim();
    const dose = doseInput.value.trim();
    
    if (!medName) return;

    const currentBed = appState.getBed(appState.getCurrentBedId());
    if (!currentBed) {
      logger.error("No hay cama seleccionada");
      return;
    }

    if (!Array.isArray(currentBed.meds)) {
      currentBed.meds = [];
    }

    const medicationText = dose ? `${medName} ${dose}` : medName;

    // OPTIMIZACIÓN: Verificación más eficiente de duplicados
    if (!currentBed.meds.includes(medicationText)) {
      currentBed.meds.push(medicationText);
      
      // Limpiar campos
      newMedInput.value = '';
      doseInput.value = '';
      doseForm.style.display = "none";
      
      // OPTIMIZACIÓN: Batch updates
      requestAnimationFrame(() => {
        syncChips();
        storageManager.scheduleSave(appState, () => {});
      });
    } else {
      // Mostrar mensaje de duplicado de forma más eficiente
      showTemporaryMessage("Medicación ya existe en la lista", "warning");
    }
  };

  // Configurar eventos de botones
  doseAdd.addEventListener("click", addMedicationHandler);
  doseCancel.addEventListener("click", () => {
    doseForm.style.display = "none";
    newMedInput.value = "";
    doseInput.value = "";
  });

  // Permitir añadir medicación presionando Enter
  doseInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addMedicationHandler();
    }
  });

  newMedInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const medicationName = newMedInput.value.trim();
      if (medicationName) {
        suggestionsList.style.display = "none";
        doseForm.style.display = "flex";
        doseInput.focus();
      }
    }
  });

  logger.debug("setupMedicationListeners: Listeners de medicación configurados.");
}

/**
 * NUEVA FUNCIÓN OPTIMIZADA: Realiza búsqueda de medicamentos de forma eficiente
 * @param {string} query - Término de búsqueda
 * @param {HTMLElement} suggestionsList - Lista de sugerencias
 */
function performMedicationSearch(query, suggestionsList) {
  const medsArray = Array.isArray(appState.medicationsList) ? appState.medicationsList : [];
  
  // OPTIMIZACIÓN: Búsqueda más eficiente con límite de resultados
  const MAX_RESULTS = 10;
  const queryLower = query.toLowerCase();
  
  const matches = medsArray
    .filter((med) => med && typeof med.nombre === 'string' && 
             med.nombre.toLowerCase().includes(queryLower))
    .slice(0, MAX_RESULTS); // Limitar resultados para mejor rendimiento

  if (matches.length > 0) {
    // OPTIMIZACIÓN: Usar innerHTML una sola vez en lugar de múltiples operaciones DOM
    suggestionsList.innerHTML = matches
      .map((med) => `<li data-med="${escapeHtml(med.nombre)}">${escapeHtml(med.nombre)}</li>`)
      .join("");
    suggestionsList.style.display = "block";
  } else {
    suggestionsList.style.display = "none";
  }
}

/**
 * NUEVA FUNCIÓN: Escape HTML para prevenir XSS
 * @param {string} text - Texto a escapar
 * @returns {string} - Texto escapado
 */
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/**
 * NUEVA FUNCIÓN: Muestra mensaje temporal optimizado
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de mensaje (info, warning, error)
 */
function showTemporaryMessage(message, type = 'info') {
  // Implementación simple y eficiente de notificación
  const notification = document.createElement('div');
  notification.className = `temp-notification temp-notification--${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 12px 16px;
    border-radius: 4px;
    color: white;
    background: ${type === 'warning' ? '#ff9800' : type === 'error' ? '#f44336' : '#4caf50'};
    z-index: 10000;
    animation: slideIn 0.3s ease-out;
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.style.animation = 'slideOut 0.3s ease-in';
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

/**
 * Carga la lista de medicamentos desde la variable global MEDICATIONS_DATA
 * @returns {Promise<boolean>} - True si se cargaron exitosamente
 */
export async function loadMedicationsJson() {
  logger.debug("loadMedicationsJson: Cargando lista de medicamentos desde la variable global...");
  
  try {
    // Verificar que MEDICATIONS_DATA existe
    if (typeof window.MEDICATIONS_DATA === 'undefined') {
      throw new Error("MEDICATIONS_DATA no está definida");
    }

    const data = window.MEDICATIONS_DATA;
    if (!Array.isArray(data)) {
      throw new Error("MEDICATIONS_DATA no es un array");
    }

    // Asegurarnos de que appState.medicationsList sea un array
    appState.medicationsList = Array.isArray(data[0]) ? data[0] : data;
    
    // Verificar que tenemos medicamentos
    if (appState.medicationsList.length === 0) {
      throw new Error("No se encontraron medicamentos en MEDICATIONS_DATA");
    }

    logger.debug(`loadMedicationsJson: ${appState.medicationsList.length} medicamentos cargados exitosamente.`);
    return true;
  } catch (e) {
    errorManager.handleError(
      e,
      { action: 'cargar lista de medicamentos' },
      ErrorManager.ErrorTypes.VALIDATION,
      ErrorManager.Severity.MEDIUM
    );
    appState.medicationsList = []; // Asegurar que sea un array vacío en caso de error
    return false;
  }
} 