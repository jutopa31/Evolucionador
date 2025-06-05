/**
 * @fileoverview Lógica de construcción de notas médicas
 * @version 2.1.0
 */

import { logger } from '../core/logger.js';
import { appState } from '../state/app-state-manager.js';
import { Sections, StructuredFields, SectionRenderOrder } from '../ui/renderers.js';

/**
 * Construye la nota completa para la cama actual basándose en el estado
 * OPTIMIZADO: Mejorado rendimiento y legibilidad con programación funcional
 * @returns {string} - La nota formateada o un mensaje de error
 */
export function buildNote() {
  const bedId = appState.getCurrentBedId();
  const bd = appState.getBed(bedId);
  if (!bedId || !bd) {
    logger.debug("buildNote: Error: Cama no seleccionada al construir nota.");
    return "Error: Cama no seleccionada.";
  }

  // OPTIMIZACIÓN: Configuración centralizada para mejor mantenimiento
  const config = {
    excludedSections: new Set(["ingreso_manual", "diagnostico"]),
    alwaysIncludeSections: new Set(["fisico", "notas_libres", "medicacion", "antecedentes"]),
    sectionSeparator: "\n\n"
  };

  // OPTIMIZACIÓN: Usar Map para búsquedas O(1) en lugar de find() O(n)
  const sectionsMap = new Map(Sections.map(s => [s.key, s]));

  const sectionsText = SectionRenderOrder
    .filter(k => !config.excludedSections.has(k)) // Filtrar excluidas primero
    .map(k => buildSectionContent(k, bd, sectionsMap, config))
    .filter(Boolean) // Eliminar secciones nulas de forma más eficiente
    .join(config.sectionSeparator);

  logger.debug("buildNote: Nota completa construida.");
  return sectionsText;
}

/**
 * NUEVA FUNCIÓN OPTIMIZADA: Construye el contenido de una sección específica
 * @param {string} sectionKey - Clave de la sección
 * @param {Object} bedData - Datos de la cama
 * @param {Map} sectionsMap - Mapa de secciones para búsqueda rápida
 * @param {Object} config - Configuración de construcción
 * @returns {string|null} - Contenido de la sección o null si está vacía
 */
function buildSectionContent(sectionKey, bedData, sectionsMap, config) {
  const sectionConfig = sectionsMap.get(sectionKey);
  const label = sectionConfig?.label || 
                (sectionKey === "medicacion" ? "Medicación" : 
                 sectionKey[0].toUpperCase() + sectionKey.slice(1));

  // OPTIMIZACIÓN: Manejo específico optimizado por tipo de sección
  switch (sectionKey) {
    case "medicacion":
      return buildMedicationSection(label, bedData.meds);
    
    default:
      if (StructuredFields[sectionKey]) {
        return buildStructuredSection(sectionKey, label, bedData, config);
      } else {
        return buildTextSection(sectionKey, label, bedData, config);
      }
  }
}

/**
 * NUEVA FUNCIÓN: Construye sección de medicación optimizada
 * @param {string} label - Etiqueta de la sección
 * @param {Array} meds - Array de medicamentos
 * @returns {string} - Contenido formateado
 */
function buildMedicationSection(label, meds) {
  const medsText = Array.isArray(meds) && meds.length > 0 
    ? "- " + meds.join("\n- ") 
    : "(Ninguna)";
  
  logger.debug(`buildNote: Construyendo sección medicación: ${medsText.substring(0, 50)}...`);
  return `${label}:\n${medsText}`;
}

/**
 * NUEVA FUNCIÓN: Construye sección estructurada optimizada
 * @param {string} sectionKey - Clave de la sección
 * @param {string} label - Etiqueta de la sección
 * @param {Object} bedData - Datos de la cama
 * @param {Object} config - Configuración
 * @returns {string|null} - Contenido formateado o null
 */
function buildStructuredSection(sectionKey, label, bedData, config) {
  const fields = StructuredFields[sectionKey];
  const sectionData = bedData.structured?.[sectionKey] || {};
  const alwaysInclude = config.alwaysIncludeSections.has(sectionKey);

  // OPTIMIZACIÓN: Verificación más eficiente de campos vacíos
  const fieldsWithContent = fields.filter(f => {
    const value = sectionData[f.id];
    return value && String(value).trim() !== "";
  });

  const allEmpty = fieldsWithContent.length === 0;
  logger.debug(`buildNote: Sección estructurada "${sectionKey}": todos vacíos? ${allEmpty}`);

  if (allEmpty && !alwaysInclude) {
    return null;
  }

  // OPTIMIZACIÓN: Construcción más eficiente del contenido
  const fieldLines = fields
    .filter(f => {
      const value = sectionData[f.id] || "";
      return String(value).trim() !== "" || alwaysInclude;
    })
    .map(f => `   - ${f.label}: ${sectionData[f.id] || ""}`);

  const content = `${label}:\n${fieldLines.join("\n")}`;
  
  logger.debug(`buildNote: Sección "${sectionKey}" (estructurada) construida.`);
  return content.trim();
}

/**
 * NUEVA FUNCIÓN: Construye sección de texto libre optimizada
 * @param {string} sectionKey - Clave de la sección
 * @param {string} label - Etiqueta de la sección
 * @param {Object} bedData - Datos de la cama
 * @param {Object} config - Configuración
 * @returns {string|null} - Contenido formateado o null
 */
function buildTextSection(sectionKey, label, bedData, config) {
  const text = bedData.text?.[sectionKey] || "";
  const trimmedText = text.trim();
  const alwaysInclude = config.alwaysIncludeSections.has(sectionKey);

  logger.debug(
    `buildNote: Sección de texto "${sectionKey}": contenido "${trimmedText.substring(0, 50)}"...`
  );

  if (alwaysInclude || trimmedText !== "") {
    return `${label}:\n${trimmedText}`;
  }
  
  return null;
}

/**
 * Descarga la nota actual como un archivo .txt
 */
export function downloadNote() {
  logger.debug("downloadNote: Iniciando descarga...");
  const n = buildNote();
  if (n.startsWith("Error:")) {
    logger.error("downloadNote: Error en buildNote:", n);
    return;
  }
  
  try {
    const b = new Blob([n], { type: "text/plain;charset=utf-8" });
    const u = URL.createObjectURL(b);
    const a = document.createElement("a");
    a.href = u;
    const d = new Date().toISOString().slice(0, 10); // Formato YYYY-MM-DD
    // Limpiar nombre de cama para el nombre del archivo
    const bedId = appState.getCurrentBedId();
    const safeBedId = bedId ? bedId.replace(/[^a-z0-9]/gi, "_") : "sin_cama";
    a.download = `nota_${safeBedId}_${d}.txt`;
    document.body.appendChild(a);
    a.click(); // Simular click para descargar
    document.body.removeChild(a); // Limpiar elemento temporal
    URL.revokeObjectURL(u); // Liberar memoria del objeto URL
    logger.debug(`downloadNote: Nota descargada como "${a.download}".`);
  } catch (e) {
    logger.error("downloadNote: Error al descargar:", e);
  }
}

/**
 * Valida que una nota tenga contenido mínimo requerido
 * @param {string} noteText - Texto de la nota
 * @returns {Object} - Resultado de validación con isValid y errores
 */
export function validateNote(noteText) {
  const errors = [];
  
  if (!noteText || noteText.trim().length === 0) {
    errors.push("La nota está vacía");
  }
  
  if (noteText.length < 50) {
    errors.push("La nota es demasiado corta (mínimo 50 caracteres)");
  }
  
  // Verificar que tenga al menos una sección
  const hasSections = SectionRenderOrder.some(section => 
    noteText.includes(section) || 
    noteText.includes(Sections.find(s => s.key === section)?.label || section)
  );
  
  if (!hasSections) {
    errors.push("La nota no contiene secciones reconocibles");
  }
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings: []
  };
}

/**
 * Formatea una nota para diferentes propósitos (impresión, email, etc.)
 * @param {string} noteText - Texto de la nota
 * @param {string} format - Formato deseado ('plain', 'html', 'markdown')
 * @returns {string} - Nota formateada
 */
export function formatNote(noteText, format = 'plain') {
  switch (format) {
    case 'html':
      return noteText
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/^/, '<p>')
        .replace(/$/, '</p>');
    
    case 'markdown':
      return noteText
        .replace(/^([A-Za-z\s]+):$/gm, '## $1')
        .replace(/^   - /gm, '- ');
    
    case 'plain':
    default:
      return noteText;
  }
} 