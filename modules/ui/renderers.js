/**
 * @fileoverview Funciones de renderizado de la interfaz de usuario
 * @version 2.0.0
 */

import { logger } from '../core/logger.js';
import { errorManager, ErrorManager } from '../core/error-manager.js';
import { appState } from '../state/app-state-manager.js';
import { getElement, makeVoiceButtonHTML } from './dom-helpers.js';

// Configuración de secciones y campos
export const Sections = [
  { key: "datos", label: "Datos del paciente" },
  { key: "antecedentes", label: "Antecedentes personales" },
  { key: "evolucion", label: "Evolución" },
  { key: "fisico", label: "Examen físico" },
  { key: "notas_libres", label: "Notas Libres" },
  { key: "ingreso_manual", label: "Ingreso manual" },
];

export const StructuredFields = {
  datos: [
    { id: "fecha", label: "Fecha Evaluación", type: "date" },
    { id: "dni", label: "DNI", type: "text", placeholder: "Nº DNI" },
    { id: "nombre", label: "Nombre", type: "text", placeholder: "Nombre y Apellido" },
    { id: "os", label: "Obra Social", type: "text", placeholder: "Obra Social / Prepaga" },
    { id: "contacto", label: "Contacto", type: "tel", placeholder: "Teléfono o Email" },
  ],
  antecedentes: [
    { id: "cardio", label: "Cardiovascular", type: "text", placeholder: "..." },
    { id: "neuro", label: "Neurológicos", type: "text", placeholder: "..." },
    { id: "onco", label: "Oncológicos", type: "text", placeholder: "..." },
  ],
  evolucion: [
    { id: "motivo", label: "Motivo de consulta", renderAs: "textarea", placeholder: "..." },
    { id: "actual", label: "Enfermedad actual", renderAs: "textarea", placeholder: "..." },
  ],
};

export const SectionRenderOrder = ["datos", "ingreso_manual", "antecedentes", "medicacion", "evolucion", "fisico", "notas_libres"];

/**
 * Crea el elemento HTML para una sección de la nota
 * @param {Object} sec - Configuración de la sección
 * @param {number} idx - Índice de la sección
 * @param {string} bedIdForElement - ID de la cama
 * @returns {HTMLElement} - Elemento de sección creado
 */
export function makeSectionElement(sec, idx, bedIdForElement) {
  logger.debug(`makeSectionElement: Creando sección ${sec.key} para cama ${bedIdForElement}`);
  
  const div = document.createElement("div");
  div.className = "section";
  div.id = `section-${sec.key}-${bedIdForElement}`;
  div.dataset.key = sec.key;
  div.dataset.bedId = bedIdForElement;

  const hIdx = SectionRenderOrder.indexOf(sec.key) + 1;
  const hHint = hIdx > 0 && hIdx <= SectionRenderOrder.length ? `<span class="hotkey">(Alt+${hIdx})</span>` : "";

  let contentHTML = "";

  if (sec.key === "fisico") {
    const textareaId = `ta-${sec.key}-${bedIdForElement}`;
    contentHTML = `
      <div class="fisico-plantillas-bar" style="margin-bottom: 10px; display: flex; gap: 8px;">
        <button type="button" data-action="addFisicoTemplate" data-tpl="ef_neuro" title="EF Neurológico Normal">🧠 Neuro</button>
        <button type="button" data-action="addFisicoTemplate" data-tpl="ef_cardio" title="EF Cardiovascular Normal">❤️ Cardio</button>
        <button type="button" data-action="addFisicoTemplate" data-tpl="resp" title="EF Respiratorio Normal">🫁 Resp</button>
      </div>
      <div class="textarea-wrapper" style="position: relative;">
        <textarea rows="4" id="${textareaId}" placeholder="${sec.label}…"></textarea>
        ${makeVoiceButtonHTML(textareaId)}
      </div>
    `;
  } else if (StructuredFields[sec.key]) {
    contentHTML = `<div class="structured-input-container">`;
    StructuredFields[sec.key].forEach((f) => {
      const id = `input-${sec.key}-${f.id}-${bedIdForElement}`;
      const voiceBtnHTML = makeVoiceButtonHTML(id);
      let fieldHTML = "";
      if (f.renderAs === "textarea") {
        fieldHTML = `<textarea id="${id}" placeholder="${f.placeholder || ""}" data-section-key="${sec.key}" data-field-id="${f.id}" rows="${f.rows || 3}"></textarea>${voiceBtnHTML}`;
      } else {
        fieldHTML = `<input type="${f.type || "text"}" id="${id}" placeholder="${f.placeholder || ""}" data-section-key="${sec.key}" data-field-id="${f.id}">${voiceBtnHTML}`;
      }
      contentHTML += `<div class="input-group"><label for="${id}">${f.label}</label>${fieldHTML}</div>`;
    });
    contentHTML += "</div>";
  } else {
    const textareaId = `ta-${sec.key}-${bedIdForElement}`;
    contentHTML = `<div class="textarea-wrapper" style="position: relative;">
      <textarea rows="4" id="${textareaId}" placeholder="${sec.label}…"></textarea>
      ${makeVoiceButtonHTML(textareaId)}
    </div>`;
  }

  div.innerHTML = `
    <div class="section-header no-border-bottom" data-action="toggle-section" data-key="${sec.key}" style="cursor: pointer;">
      <h3>${sec.label}${hHint}</h3>
      <span id="save-${sec.key}-${bedIdForElement}" class="save-indicator">Guardado</span>
    </div>
    <div class="section-content" id="content-${sec.key}-${bedIdForElement}" style="display: none;">
      ${contentHTML}
    </div>
  `;

  logger.debug(`makeSectionElement: Sección ${sec.key} para cama ${bedIdForElement} creada.`);
  return div;
}

/**
 * Crea el elemento HTML para la sección de medicación
 * @returns {HTMLElement} - Elemento de sección de medicación
 */
export function makeMedicationSection() {
  logger.debug("makeMedicationSection: Creando sección de medicamentos...");
  
  const bedId = appState.getCurrentBedId();
  const section = document.createElement("div");
  section.className = "section";
  section.id = `section-medicacion-${bedId}`;
  section.setAttribute("data-key", "medicacion");

  section.innerHTML = `
    <div class="section-header" data-action="toggle-section" data-key="medicacion">
      <h2>Medicación</h2>
    </div>
    <div id="content-medicacion-${bedId}" class="section-content" style="display: none;">
      <div id="med-input-container" class="medication-input-container">
        <input type="text" 
               id="med-input" 
               placeholder="Ingrese medicación..." 
               autocomplete="off">
        <ul id="med-suggestions"></ul>
      </div>
      <div id="dose-form" style="display: none;">
        <input type="text" 
               id="dose-input" 
               placeholder="Dosis y frecuencia...">
        <button id="dose-add" class="action-btn">Agregar</button>
        <button id="dose-cancel" class="action-btn secondary">Cancelar</button>
      </div>
      <div id="med-display" class="medication-chips"></div>
    </div>
  `;

  return section;
}

/**
 * Renderiza los menús flotantes de Acciones y Escalas
 */
export function renderFloatingMenus() {
  logger.debug('Iniciando renderFloatingMenus...');
  
  const floatingContainer = getElement('floating-actions-container');
  const actionsContainer = getElement('actions-container');
  const scalesContainer = getElement('scales-btn-container');
  
  if (!floatingContainer || !actionsContainer || !scalesContainer) {
    logger.error('Contenedores de botones flotantes no encontrados');
    return;
  }

  const actionsBtn = getElement('actions-btn-floating');
  const scalesBtn = getElement('scales-btn-floating');
  const copyBtn = getElement('copy-btn-floating');

  if (!actionsBtn || !scalesBtn || !copyBtn) {
    logger.error('Botones flotantes no encontrados');
    return;
  }

  const actionsList = getElement('actions-list');
  const scalesList = getElement('scales-list');

  if (!actionsList || !scalesList) {
    logger.error('Listas de menú no encontradas');
    return;
  }

  // Limpiar y repoblar menú de acciones
  actionsList.innerHTML = '';
  const actions = [
    { text: '📥 Descargar Nota', action: () => window.downloadNote?.() }
  ];
  
  actions.forEach(action => {
    const li = document.createElement('li');
    li.textContent = action.text;
    li.addEventListener('click', (e) => {
      e.stopPropagation();
      action.action();
      actionsList.style.display = 'none';
    });
    actionsList.appendChild(li);
  });

  // Limpiar y repoblar menú de escalas
  scalesList.innerHTML = '';
  const scales = [
    { text: '🧠 Parkinson', type: 'parkinson' },
    { text: '💪 Miastenia Gravis', type: 'miastenia' },
    { text: '🧮 NIHSS', type: 'nihss' },
    { text: '🦵 Espasticidad', type: 'espasticidad' },
    { text: '🧠 ASPECTS', type: 'aspects' }
  ];
  
  scales.forEach(scale => {
    const li = document.createElement('li');
    li.textContent = scale.text;
    li.addEventListener('click', (e) => {
      e.stopPropagation();
      if (typeof window.openScale === 'function') {
        window.openScale(scale.type);
      }
      scalesList.style.display = 'none';
    });
    scalesList.appendChild(li);
  });

  logger.debug('renderFloatingMenus completado');
}

/**
 * Renderiza la estructura principal de la aplicación
 */
export function renderAppStructure() {
  logger.info('Renderizando estructura de la aplicación en #app');
  
  const app = getElement('app');
  if (!app) {
    logger.error('Elemento #app no encontrado al renderizar estructura.');
    return;
  }

  const currentBedIdToRender = appState.getCurrentBedId();
  if (!currentBedIdToRender) {
    logger.warn('No hay currentBedId para renderizar la estructura de secciones.');
    return;
  }

  // Si #app no tiene contenido, es la primera carga
  if (!app.innerHTML.trim()) {
    logger.debug('#app está vacío, renderizando estructura completa.');
    const baseHTML = `
      <h1 style="text-align: center; margin: 20px 0; color: #2c3e50;">Suite Neurologia v2.1</h1>
      <div id="sections-container"></div>
    `;
    app.innerHTML = baseHTML;

    const sectionsContainer = getElement('sections-container');
    if (sectionsContainer) {
      sectionsContainer.innerHTML = '';
      logger.debug(`Renderizando secciones para cama: ${currentBedIdToRender}`);
      
      try {
        SectionRenderOrder.forEach((key, index) => {
          if (key === 'medicacion') {
            sectionsContainer.appendChild(makeMedicationSection());
          } else {
            const sectionConfig = Sections.find(s => s.key === key);
            if (sectionConfig) {
              const sectionElement = makeSectionElement(sectionConfig, index, currentBedIdToRender);
              sectionsContainer.appendChild(sectionElement);
              const contentElement = sectionElement.querySelector(`#content-${key}-${currentBedIdToRender}`);
              if (contentElement) {
                contentElement.style.display = 'none';
              }
            } else {
              logger.warn(`Configuración de sección no encontrada para la clave: ${key}`);
            }
          }
        });

        const firstSectionKey = SectionRenderOrder[0];
        const firstSectionContent = document.getElementById(`content-${firstSectionKey}-${currentBedIdToRender}`);
        if (firstSectionContent) {
          firstSectionContent.style.display = 'block';
          const firstHeader = firstSectionContent.previousElementSibling;
          if (firstHeader && firstHeader.classList.contains('section-header')) {
            firstHeader.classList.remove('no-border-bottom');
          }
        }
        logger.info(`Estructura de secciones para cama ${currentBedIdToRender} creada/actualizada.`);
      } catch (error) {
        logger.error('Error renderizando secciones:', { currentBedIdToRender, error });
        sectionsContainer.innerHTML = '<p style="color:red;">Error creando interfaz de secciones. Por favor, recarga.</p>';
      }
    }
  }
} 