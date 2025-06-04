/* ══════════ Configuración Inicial ══════════ */
;(() => {
  // IIFE - Inicio
  const Logger = {
    levels: {
      DEBUG: 0,
      INFO: 1,
      WARN: 2,
      ERROR: 3
    },
    currentLevel: 0,
    
    log(level, message, data = null) {
      if (level >= this.currentLevel) {
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${Object.keys(this.levels).find(key => this.levels[key] === level)}]`;
        if (data) {
          console.log(`${prefix} ${message}`, data);
        } else {
          console.log(`${prefix} ${message}`);
        }
      }
    },
    
    debug(message, data) {
      this.log(this.levels.DEBUG, message, data);
    },
    
    info(message, data) {
      this.log(this.levels.INFO, message, data);
    },
    
    warn(message, data) {
      this.log(this.levels.WARN, message, data);
    },
    
    error(message, data) {
      this.log(this.levels.ERROR, message, data);
    }
  };

  // Reemplazar la función logDebug existente
  function logDebug(...args) {
    Logger.debug(args[0], args.slice(1));
  }

  // Inicializar el estado global de la aplicación
  window.AppState = {
      beds: {},
      currentBedId: null,
      version: null,
      aiEnabled: false,
      initialized: false // Agregar bandera de inicialización
  }

  // Bandera de debug (Controla la verbosidad de los logs)
  const DEBUG = true // Cambiar a false para desactivar la mayoría de los logs
  function logDebug(...args) {
    if (DEBUG) {
      console.log(...args)
    }
  }
  logDebug("app.js: Iniciando script...") // Log al inicio del script

  // Definición de secciones y campos estructurados
  const Sections = [
    { key: "datos", label: "Datos del paciente" },
    { key: "antecedentes", label: "Antecedentes personales" },
    { key: "evolucion", label: "Evolución" },
    { key: "fisico", label: "Examen físico" },
    { key: "notas_libres", label: "Notas Libres" },
    { key: "ingreso_manual", label: "Ingreso manual" },
  ]

  // Campos específicos para secciones estructuradas
  const StructuredFields = {
    datos: [
      { id: "fecha", label: "Fecha Evaluación", type: "date" },
      { id: "dni", label: "DNI", type: "text", placeholder: "Nº DNI" }, // Corrected placeholder
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
  }

  // Orden de renderizado y Hotkeys (manteniendo Alt + Número)
  const SectionRenderOrder = ["datos", "ingreso_manual", "antecedentes", "medicacion", "evolucion", "fisico", "notas_libres"]

  // El HotkeyMap ya no es estrictamente necesario para la lógica de eventos global
  // const HotkeyMap = SectionRenderOrder.reduce((map, key, index) => { ... });

  // Configuración App
  const AppConfig = {
    version: "2", // Actualizada a la versión 2
    aiFlows: [
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
    // Configuración para OCR
    ocrConfig: {
      supportedTypes: ['image/jpeg', 'image/png', 'application/pdf'],
      maxFileSize: 10 * 1024 * 1024, // 10MB
    },
    medications: ["Medicamento 1", "Medicamento 2", "Medicamento 3", "Medicamento 4", "Medicamento 5"], // Added for medication suggestions
  }

  // Estado Global (Única definición)
  const State = {
    beds: {},
    currentBedId: null,
    aiEnabled: false, // Track if AI functionality is enabled
    selectedVersion: null, // Agregar estado para la versión seleccionada
    processingOCR: false, // Nuevo estado para controlar el procesamiento OCR
    medicationsList: [] // Estado para almacenar la lista de medicamentos
  }
  window.State = State // Exponer el estado global

  const LS_ALL_BEDS_KEY = "medNotesMultiBedData_v7"
  const LS_API_KEY = "openai_api_key"
  let saveTimeout // Para el debounce simple
  const SAVE_DELAY = 1200 // ms

  // Referencias a Modales (se asignarán en initializeModals)
  let previewNoteModal, previewNoteText, confirmNoteCopyBtn, cancelNoteCopyBtn
  let efTemplateModal, efTemplateTitle, efTemplateTextarea, efInsertBtn, efCancelBtn
  let pkOverlay, pkFrame, pkClose // Referencias para el modal de Parkinson (definido en index.html)
  let apiModal, apiInput, apiSave, apiCancel // Referencias para el modal de API Key

  // Reconocimiento de Voz (Web Speech API)
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
  let recognition
  let voiceTargetInputId = null
  let voiceBtnIndicator = null

  // Estado de inicialización (Única definición)
  let isAppInitialized = false
  window.isAppInitialized = () => isAppInitialized // Exponer función global

  /* ══════════ Funciones Auxiliares (Helpers) ══════════ */

  /** Obtiene un elemento por su ID */
  function getElement(id) {
    const element = document.getElementById(id)
    if (!element && DEBUG) {
      // Solo log en debug si no se encuentra
      console.warn(`Elemento con ID '${id}' no encontrado`)
    }
    return element
  }

  /** Obtiene un input estructurado */
  function getStructuredInput(sKey, fId, bedId) { // Añadido bedId
    const elementId = `input-${sKey}-${fId}-${bedId}`;
    const element = document.getElementById(elementId);
    if (!element) {
      Logger.warn(`Elemento input estructurado con ID '${elementId}' no encontrado.`);
      return null;
    }
    return element;
  }

  /** Obtiene un textarea principal de sección */
  function getTextArea(key, bedId) { // Añadido bedId
    const elementId = `ta-${key}-${bedId}`;
    const element = document.getElementById(elementId);
    if (!element) {
      // No siempre es un error (ej. 'medicacion' no tiene un textarea principal con este patrón de ID)
      // Logger.warn(`Elemento textarea con ID '${elementId}' no encontrado.`);
      return null;
    }
    return element;
  }

  /**
   * Alterna la visibilidad de una sección (comportamiento acordeón).
   * @param {string} key La clave de la sección.
   * @returns {boolean} True si la sección fue encontrada y procesada, false en caso contrario.
   */
  window.toggleSectionVisibility = function(key) {
    logDebug(`toggleSectionVisibility: Alternando visibilidad de sección ${key}`);
    const content = document.getElementById(`content-${key}`);
    if (content) {
      const isVisible = content.style.display !== 'none';
      content.style.display = isVisible ? 'none' : 'block';
      logDebug(`toggleSectionVisibility: Sección ${key} ${isVisible ? 'oculta' : 'visible'}`);
    }
  };

  /**
   * Toggles the visibility of AI functionality
   * @param {boolean} enabled Whether to enable or disable AI
   */
  function toggleAIFunctionality(enabled) {
    State.aiEnabled = enabled
    const ingresoManualSection = document.querySelector('[data-key="ingreso_manual"]')
    const diagnosticoSection = document.querySelector('[data-key="diagnostico"]') // Get diagnostico section

    if (ingresoManualSection) {
      ingresoManualSection.style.display = enabled ? "block" : "none"
    } else {
      logDebug("toggleAIFunctionality: Demo IA section not found.")
    }

    // The asistente-diagnostico.js module will handle its own visibility
    // based on the 'aiToggled' event.
    // if (diagnosticoSection) {
    //   diagnosticoSection.style.display = enabled ? "block" : "none"
    // } else {
    //   logDebug("toggleAIFunctionality: Diagnostico section not found (might not be integrated yet).")
    // }

    // Guardar preferencia usando StorageManager
    StorageManager.setItem(StorageManager.KEYS.AI_ENABLED, enabled)
      logDebug(`toggleAIFunctionality: AI ${enabled ? "enabled" : "disabled"} and preference saved.`)

    // Dispatch event for other modules (like asistente-diagnostico.js)
    document.dispatchEvent(new CustomEvent('aiToggled', { detail: { enabled: enabled } }))
  }

  // Función para abrir la primera sección al cargar
  function openFirstSectionOnLoad() {
    logDebug("openFirstSectionOnLoad: Intentando abrir la primera sección.");
    // Abrir la sección de medicación por defecto para depuración
    const medicacionContent = document.getElementById("content-medicacion");
    if (medicacionContent) {
      medicacionContent.style.display = "block";
      logDebug("openFirstSectionOnLoad: Sección 'medicacion' forzada a visible para depuración.");
    }
    // También abrir la primera sección normal
    const firstSectionKey = SectionRenderOrder[0];
    if (firstSectionKey) {
      toggleSectionVisibility(firstSectionKey);
      logDebug(`openFirstSectionOnLoad: Primera sección "${firstSectionKey}" abierta.`);
    } else {
      logDebug("openFirstSectionOnLoad: No hay secciones definidas para abrir la primera.");
    }
  }

  /**
   * Inserta texto en la posición del cursor de un textarea.
   * @param {HTMLTextAreaElement} textarea El elemento textarea.
   * @param {string} text El texto a insertar.
   * @param {boolean} [selectInserted=false] Si true, selecciona el texto insertado.
   */
  function insertAtCursor(textarea, text, selectInserted = false) {
    if (!textarea) {
      logDebug("insertAtCursor: Textarea no proporcionado.")
      return
    }
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const currentText = textarea.value

    // Insertar texto
    textarea.value = currentText.slice(0, start) + text + currentText.slice(end)

    // Posicionar cursor
    const newPos = start + text.length
    textarea.selectionStart = textarea.selectionEnd = newPos

    textarea.focus()

    // Seleccionar texto insertado si se solicita
    if (selectInserted) {
      textarea.setSelectionRange(start, newPos)
    }

    // Disparar evento 'input' para notificar cambios (importante para guardado automático)
    textarea.dispatchEvent(new Event("input", { bubbles: true }))
    logDebug(`insertAtCursor: Texto insertado en ${textarea.id || "textarea"}.`)
  }

  /** Sincroniza los chips de medicación con el estado actual de la cama. */
  function syncChips() {
    logDebug("syncChips: Iniciando sincronización de chips...")
    const d = getElement("med-display")
    if (!d) {
        console.error("syncChips: Elemento med-display no encontrado.")
        return
    }
    
    // Limpiar display actual
    d.innerHTML = ""

    // Verificar estado y medicaciones usando window.AppState
    if (!window.AppState.currentBedId) {
        console.error("syncChips: No hay cama seleccionada (window.AppState.currentBedId es null o undefined)")
        return
    }

    const currentBed = window.AppState.beds[window.AppState.currentBedId]
    if (!currentBed) {
        console.error(`syncChips: No se encontraron datos para la cama ${window.AppState.currentBedId}`)
        return
    }

    // Asegurar que meds es un array y está limpio
    if (!Array.isArray(currentBed.meds)) {
        console.log("syncChips: Estado de medicación no era un array, inicializando...")
        currentBed.meds = []
        return
    }

    const meds = currentBed.meds
    logDebug(`syncChips: Procesando ${meds.length} medicaciones...`)

    // Crear y añadir chips para cada medicación
    meds.forEach((item, index) => {
        if (!item) {
            console.warn(`syncChips: Medicación en índice ${index} es null o undefined, saltando...`)
            return
        }

        const c = document.createElement("span")
        c.className = "chip"
        c.textContent = item // Mostrar el nombre/detalle completo

        const b = document.createElement("button")
        b.textContent = "×"
        b.title = `Quitar ${item}`
        b.dataset.item = item
        b.dataset.action = "removeMed"
        b.className = "remove-med-btn"
        b.onclick = () => {
            removeMedication(item)
            // Forzar una nueva sincronización después de eliminar
            setTimeout(syncChips, 0)
        }
        c.appendChild(b)
        d.appendChild(c)
        logDebug(`syncChips: Chip creado para medicación "${item}"`)
    })
    logDebug(`syncChips: Chips de medicación sincronizados. Total: ${meds.length}`)
  }

  /**
   * Elimina una medicación del estado de la cama actual.
   * @param {string} item El texto completo de la medicación a eliminar.
   */
  function removeMedication(item) {
    if (!item || !window.AppState.currentBedId || !window.AppState.beds[window.AppState.currentBedId]) {
      logDebug("removeMedication: No se puede eliminar medicación: item inválido o cama no seleccionada.")
      return
    }

    const meds = window.AppState.beds[window.AppState.currentBedId].meds
    if (!Array.isArray(meds)) {
      window.AppState.beds[window.AppState.currentBedId].meds = []
      logDebug("removeMedication: Estado de medicación no era un array.")
      return
    }

    const idx = meds.indexOf(item)
    if (idx !== -1) {
      meds.splice(idx, 1)
      syncChips()
      scheduleSaveAllData()
      logDebug(`removeMedication: Medicación "${item}" eliminada.`)
    } else {
      logDebug(`removeMedication: Medicación "${item}" no encontrada en la lista.`)
    }
  }

  /**
   * Construye la nota completa para la cama actual basándose en el estado.
   * @returns {string} La nota formateada o un mensaje de error.
   */
  function buildNote() {
    // saveUIToCurrentBedData(); // NO llamar aquí. Se llama antes en el handler del botón copiar.

    if (!State.currentBedId || !State.beds[State.currentBedId]) {
      logDebug("buildNote: Error: Cama no seleccionada al construir nota.")
      return "Error: Cama no seleccionada."
    }
    const bd = State.beds[State.currentBedId]

    // Lista de secciones que deben excluirse completamente
    const excludedSections = ["ingreso_manual", "diagnostico"] // 'diagnostico' no está en Sections, pero se mantiene
    // Secciones que siempre se deben incluir incluso vacías
    const alwaysIncludeSections = ["fisico", "notas_libres", "medicacion", "antecedentes"]

    const sectionsText = SectionRenderOrder.map((k) => {
      // Excluir las secciones no deseadas
      if (excludedSections.includes(k)) {
        logDebug(`buildNote: Sección "${k}" excluida.`)
        return null // Saltar esta sección
      }

      const sc = Sections.find((s) => s.key === k)
      // Obtener etiqueta, por defecto capitalizada si no está en Sections
      const l = sc ? sc.label : k === "medicacion" ? "Medicación" : k[0].toUpperCase() + k.slice(1)

      // Manejo específico de la sección de medicación
      if (k === "medicacion") {
        // Asegurarse de que bd.meds es un array
        const meds = Array.isArray(bd.meds) && bd.meds.length > 0 ? "- " + bd.meds.join("\n- ") : "(Ninguna)"
        logDebug(`buildNote: Construyendo sección "${k}": ${meds.substring(0, 50)}...`)
        return `${l}:\n${meds}`
      }
      // Manejo de secciones estructuradas
      else if (StructuredFields[k]) {
        const flds = StructuredFields[k]
        const sData = bd.structured?.[k] || {}

        // Verificar si todos los campos de la sección estructurada están vacíos (ignorando solo espacios)
        const allEmpty = flds.every((f) => !sData[f.id] || String(sData[f.id]).trim() === "")
        logDebug(`buildNote: Sección estructurada "${k}": todos vacíos? ${allEmpty}`)

        // Si la sección NO debe incluirse siempre y está vacía, retornar null
        if (allEmpty && !alwaysIncludeSections.includes(k)) {
          return null
        }

        let sTxt = `${l}:\n`
        let hasMeaningfulContent = false // Para saber si *algún* campo con valor no vacío fue incluido

        flds.forEach((f) => {
          const value = sData[f.id] || ""
          // Incluir campos con valor (ignorando solo espacios), o incluir siempre si la sección debe incluirse siempre
          // Nota: Para secciones alwaysInclude, incluso campos vacíos con sus labels se añadirán aquí.
          if (String(value).trim() !== "" || alwaysIncludeSections.includes(k)) {
            sTxt += `   - ${f.label}: ${value}` + "\n"
            if (String(value).trim() !== "") {
              hasMeaningfulContent = true // Hay contenido real
            }
          }
        })

        // Si la sección debe incluirse siempre, la retornamos.
        // Si no debe incluirse siempre, la retornamos SÓLO si tiene contenido REAL (ignorar solo label con campo vacío).
        if (alwaysIncludeSections.includes(k)) {
          // Incluso si solo tenía el encabezado y campos vacíos, se retorna sTxt.trim()
          logDebug(`buildNote: Sección "${k}" (estructurada, siempre incluida) construida.`)
          return sTxt.trim()
        } else {
          // Para secciones condicionales, solo retornar si hubo contenido real
          logDebug(
            `buildNote: Sección "${k}" (estructurada, condicional) construida. Tiene contenido REAL? ${hasMeaningfulContent}`,
          )
          return hasMeaningfulContent ? sTxt.trim() : null
        }
      }
      // Manejo de secciones de texto libre (textarea)
      else {
        const txt = bd.text?.[k] || ""
        logDebug(
          `buildNote: Sección de texto "${k}": contenido "${txt.trim().substring(0, Math.min(txt.trim().length, 50))}"...`,
        )

        // Incluir siempre ciertas secciones de texto aunque estén vacías
        if (alwaysIncludeSections.includes(k)) {
          return `${l}:\n${txt.trim()}`
        } else {
          // Solo incluir secciones de texto con contenido (ignorando solo espacios)
          return txt.trim() !== "" ? `${l}:\n${txt.trim()}` : null
        }
      }
    })
      .filter((section) => section !== null) // Eliminar secciones nulas (vacías o excluidas condicionalmente)
      .join("\n\n") // Unir secciones con doble salto de línea

    logDebug("buildNote: Nota completa construida.")
    return sectionsText
  }

  /** Descarga la nota actual como un archivo .txt */
  function downloadNote() {
    logDebug("downloadNote: Iniciando descarga...")
    const n = buildNote()
    if (n.startsWith("Error:")) {
      alert(n)
      logDebug("downloadNote: Descarga cancelada por error en buildNote.")
      return
    }
    try {
      const b = new Blob([n], { type: "text/plain;charset=utf-8" })
      const u = URL.createObjectURL(b)
      const a = document.createElement("a")
      a.href = u
      const d = new Date().toISOString().slice(0, 10) // Formato YYYY-MM-DD
      // Limpiar nombre de cama para el nombre del archivo
      const safeBedId = State.currentBedId ? State.currentBedId.replace(/[^a-z0-9]/gi, "_") : "sin_cama"
      a.download = `nota_${safeBedId}_${d}.txt`
      document.body.appendChild(a)
      a.click() // Simular click para descargar
      document.body.removeChild(a) // Limpiar elemento temporal
      URL.revokeObjectURL(u) // Liberar memoria del objeto URL
      logDebug(`downloadNote: Nota descargada como "${a.download}".`)
    } catch (e) {
      console.error("downloadNote: Error descargando nota:", e)
      alert("Error al descargar la nota.")
    }
  }

  /** Ejecuta un flujo de IA (OpenAI) con texto de Evolución. */
  async function runAI(flowKey) {
    // Usar async/await para fetch
    logDebug(`runAI: Ejecutando flujo IA: ${flowKey}`)
    const flow = AppConfig.aiFlows.find((f) => f.key === flowKey)
    if (!flow) {
      console.error(`runAI: Flujo de IA "${flowKey}" no encontrado.`)
      return
    }
    if (!State.currentBedId || !State.beds[State.currentBedId]) {
      alert("Selecciona una cama para usar la IA.")
      logDebug("runAI: No hay cama seleccionada.")
      return
    }
    const apiKey = StorageManager.getItem(StorageManager.KEYS.API_KEY)
    if (!apiKey) {
      alert("Configura tu API Key de OpenAI (🔑) en la esquina superior derecha para usar la IA.")
      logDebug("runAI: API Key no configurada.")
      return
    }

    let textToProcess = ""
    const currentBedData = State.beds[State.currentBedId] // Get current bed data

    if (flowKey === "correccion" || flowKey === "resumen" || flowKey === "preguntas") {
      // These flows operate on the full note.
      saveUIToCurrentBedData() // IMPORTANT: Save UI to State before building the note
      textToProcess = buildNote() // buildNote reads from State

      if (textToProcess.startsWith("Error:")) {
        alert(`No se pudo construir la nota para la IA: ${textToProcess}`)
        logDebug(`runAI: Error construyendo la nota: ${textToProcess}`)
        window.ErrorUI.showError(`Error al generar la nota para IA: ${textToProcess}`, 8000)
        return
      }
      if (!textToProcess.trim()) {
        // Check if the built note is empty
        alert("La nota médica está vacía. Añade información para usar esta función de IA.")
        logDebug("runAI: Nota médica (resultado de buildNote) vacía para procesar.")
        window.ErrorUI.showInfo("La nota está vacía.", 5000)
        return
      }
    } else {
      // Original logic for textToProcess (e.g., from Evolución)
      // This part might be removed if "correccion", "resumen", "preguntas" are the only AI flows using runAI.
      const evoData = currentBedData?.structured?.evolucion
      if (evoData && (evoData.motivo?.trim() || evoData.actual?.trim())) {
        if (evoData.motivo?.trim()) textToProcess += `Motivo de consulta: ${evoData.motivo.trim()}\n`
        if (evoData.actual?.trim()) textToProcess += `Enfermedad actual: ${evoData.actual.trim()}\n`
      } else {
        const evoTextareaValue = currentBedData?.text?.evolucion?.trim()
        if (evoTextareaValue) textToProcess = evoTextareaValue
      }

      if (!textToProcess.trim()) {
        alert("Ingresa texto en la sección Evolución para usar la IA (o la nota está vacía).")
        logDebug("runAI: Texto de evolución vacío o nota vacía.")
        window.ErrorUI.showInfo("Texto de evolución/nota vacío.", 5000)
        const motivoInput = getStructuredInput("evolucion", "motivo")
        if (motivoInput) motivoInput.focus()
        else getTextArea("evolucion")?.focus()
        return
      }
    }
    
    // Show a temporary processing message
    const processingMessage = window.ErrorUI.showInfo(`Procesando con IA (${flow.label})...`, 0); // 0 duration = no auto-hide

    // Usar el nuevo manejador de errores de API
    const result = await window.ApiErrorHandler.callOpenAI({
      apiKey,
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: flow.prompt + textToProcess }],
      temperature: 0.7,
      timeout: 30000,
      retries: 1,
      onError: (errorInfo) => {
        logDebug(`runAI: Error detectado: ${errorInfo.type} - ${errorInfo.message}`)
      },
    })

    if(processingMessage && processingMessage.parentNode) { // Remove processing message
        window.ErrorUI.removeMessage(processingMessage);
    }

    if (result.success) {
      const res = result.data.choices?.[0]?.message?.content

      if (res) {
        window.ErrorUI.showInfo(`Resultado IA (${flow.label}):\n${res.trim()}`, 15000, "ia-results-container"); // Show for 15s in a specific container
        logDebug("runAI: Respuesta de IA recibida.")
      } else {
        window.ErrorUI.showWarning(`Respuesta vacía de IA (${result.data.choices?.[0]?.finish_reason || "Razón desconocida"}).`, 8000);
        console.warn("runAI: Respuesta IA vacía:", result.data)
      }
    } else {
      // Manejar el error según su tipo
      const errorInfo = result.error
      let errorMessage = `Error IA: ${errorInfo.message}`
      console.error("runAI: Error API:", errorInfo)

      // Añadir información adicional según el tipo de error
      switch (errorInfo.type) {
        case window.ApiErrorHandler.ErrorTypes.AUTH:
          errorMessage += "<br>(Verifica tu API Key o permisos)"
          break
        case window.ApiErrorHandler.ErrorTypes.RATE_LIMIT:
          errorMessage += "<br>(Límite de cuota alcanzado. Intenta más tarde.)";
          break
        case window.ApiErrorHandler.ErrorTypes.TIMEOUT:
          break
        case window.ApiErrorHandler.ErrorTypes.NETWORK:
          break
      }
      window.ErrorUI.showError(errorMessage, 10000);
    }
  }

  /** Cierra todos los menús flotantes opcionales. */
  function closeAllMenus(except = null) {
    logDebug("closeAllMenus: Cerrando menús flotantes.")
    document.querySelectorAll("ul.menu").forEach((m) => {
      if (m !== except && m.style.display === "block") {
        m.style.display = "none"
        logDebug(`closeAllMenus: Menú cerrado: ${m.id || m.className}`)
      }
    })
  }

  /* ══════════ Gestión Multi-Cama y Guardado/Carga ══════════ */

  // Implementación simple de debounce para el guardado (Punto 10: Mala gestión async)
  /** Programa el guardado de todos los datos con un retardo. */
  function scheduleSaveAllData() {
    StorageManager.scheduleSave();
  }

  /** Guarda todos los datos de las camas en localStorage. */
  function saveAllBedDataToStorage() {
    StorageManager.saveAllBedData();
  }

  /** Carga todos los datos de las camas desde localStorage. */
  function loadAllBedData() {
    return StorageManager.loadAllBedData();
  }

  /** Carga los datos de una cama específica en la UI. */
  function loadBedDataIntoUI(bedId) {
    Logger.info('Cargando datos de cama en UI', { bedId });

    if (!bedId) {
        Logger.error('loadBedDataIntoUI: bedId no proporcionado. No se puede cargar UI.');
        // renderBedChips(); // Actualizar chips si es necesario, mostrando el estado actual (posiblemente ninguna cama activa)
        populateBedSelector(); // Usar populateBedSelector en lugar de renderBedChips
        return false;
    }

    // Sincronizar el estado global de la cama actual ANTES de renderizar la estructura
    if (window.AppState.currentBedId !== bedId) {
        Logger.info(`Cambiando cama activa de ${window.AppState.currentBedId} a ${bedId}`);
        window.AppState.currentBedId = bedId;
        // Si se cambia de cama, es probable que necesitemos guardar los datos de la cama anterior.
        // Esto debería manejarse en el origen del cambio de cama (ej. click en chip)
    }

    // Renderizar/Re-renderizar la estructura de secciones para la cama actual (window.AppState.currentBedId)
    // Esto asegura que los IDs de los inputs sean correctos para la cama que se va a poblar.
    renderAppStructure(); 

    try {
        // Volver a verificar que la cama (ahora currentBedId) existe en el estado
        if (!window.AppState.beds[window.AppState.currentBedId]) {
            Logger.error('La cama actual (AppState.currentBedId) no se encontró en AppState.beds después de renderAppStructure', { currentBedId: window.AppState.currentBedId });
            // renderBedChips(); 
            populateBedSelector(); // Usar populateBedSelector
            return false;
        }

        const currentBedData = window.AppState.beds[window.AppState.currentBedId]; // Usar el currentBedId sincronizado
        Logger.debug('Datos de cama a cargar en UI', { bedId: window.AppState.currentBedId, currentBedData });

        Sections.forEach((section) => {
            const sectionKey = section.key;
            if (StructuredFields[sectionKey]) {
                const sectionData = currentBedData.structured?.[sectionKey] || {};
                StructuredFields[sectionKey].forEach((field) => {
                    // Usar window.AppState.currentBedId para obtener elementos, ya que renderAppStructure los creó para esta cama
                    const inputElement = getStructuredInput(sectionKey, field.id, window.AppState.currentBedId);
                    if (inputElement) {
                        inputElement.value = sectionData[field.id] || '';
                    } 
                });
            } else {
                // Usar window.AppState.currentBedId aquí también
                const textareaElement = getTextArea(sectionKey, window.AppState.currentBedId);
                if (textareaElement) {
                    textareaElement.value = currentBedData.text?.[sectionKey] || '';
                } 
            }
        });
        
        // Ya no se usan chips; actualizar selector de camas
        populateBedSelector();
        Logger.info('Datos de cama cargados en UI correctamente', { bedId });
        return true;

    } catch (error) {
        Logger.error('Error al cargar datos de cama en UI', { bedId, error });
        return false;
    }
  }

  /** Guarda los datos de la UI actual en el estado de la cama seleccionada. */
  function saveUIToCurrentBedData(bedIdToSave) { 
    if (!bedIdToSave || !window.AppState.beds[bedIdToSave]) {
      Logger.warn("saveUIToCurrentBedData: ID de cama inválido o cama no encontrada en estado.", { bedIdToSave });
      return;
    }
    const bd = window.AppState.beds[bedIdToSave];

    if (!bd.text) bd.text = {};
    if (!bd.structured) bd.structured = {};

    Sections.forEach((s) => {
      if (StructuredFields[s.key]) {
        if (!bd.structured[s.key]) bd.structured[s.key] = {};
        StructuredFields[s.key].forEach((f) => {
          const i = getStructuredInput(s.key, f.id, bedIdToSave); 
          if (i) {
            bd.structured[s.key][f.id] = i.value;
          } else {
            Logger.warn(`Input no encontrado al guardar: ${s.key}.${f.id} para cama ${bedIdToSave}`);
          }
        });
      } else {
        const t = getTextArea(s.key, bedIdToSave); 
        if (t) {
          bd.text[s.key] = t.value;
        } else {
          if (s.key !== 'medicacion' && s.key !== 'ingreso_manual' && s.key !== 'datos') {
            Logger.warn(`Textarea no encontrado al guardar: ${s.key} para cama ${bedIdToSave}`);
          }
        }
      }
    });
    Logger.debug(`saveUIToCurrentBedData: Datos de UI guardados en el estado para cama ${bedIdToSave}.`);
  }

  /** Rellena el selector de camas (dropdown). */
  function populateBedSelector() {
    logDebug("populateBedSelector: Populando selector de camas...")
    const s = getElement("bed-selector")
    if (!s) {
      logDebug("populateBedSelector: Elemento bed-selector no encontrado.")
      return
    }

    // Guardar la cama seleccionada actualmente en el selector antes de limpiarlo
    const previouslySelectedId = s.value

    s.innerHTML = "" // Limpiar opciones actuales
    const ids = Object.keys(window.AppState.beds || {}) // Usar window.AppState.beds en lugar de State.beds

    if (ids.length === 0) {
      s.disabled = true
      s.innerHTML = '<option value="">Sin camas</option>' // Añadir value vacío
      window.AppState.currentBedId = null // Asegurar que no hay cama actual si no hay camas
      logDebug("populateBedSelector: No hay camas para popular el selector.")
      return
    }

    s.disabled = false

    // Ordenar las camas (numéricamente si es posible) y crear las opciones
    ids
      .sort((a, b) => {
        const numA = Number.parseInt(a.replace(/\D/g, ""), 10) // Extraer número del string
        const numB = Number.parseInt(b.replace(/\D/g, ""), 10)

        if (!isNaN(numA) && !isNaN(numB)) {
          return numA - numB // Orden numérico si ambos son numéricos
        }
        return a.localeCompare(b, undefined, { sensitivity: "base" }) // Orden alfabético/natural si no
      })
      .forEach((id) => {
        const o = document.createElement("option")
        o.value = id
        o.textContent = id
        // Seleccionar la cama actual, o la que estaba seleccionada antes si todavía existe
        // Prioriza window.AppState.currentBedId si está seteado y existe, si no, usa previouslySelectedId si existe.
        o.selected = window.AppState.currentBedId === id || (!window.AppState.currentBedId && previouslySelectedId === id)
        s.appendChild(o)
      })

    // Asegurarse de que el window.AppState.currentBedId coincida con la cama seleccionada en el selector
    // Si la cama actual ya no existe o no se seleccionó ninguna, intentar seleccionar la primera
    const selectedOption = s.options[s.selectedIndex]
    if (selectedOption && selectedOption.value !== window.AppState.currentBedId) {
      window.AppState.currentBedId = selectedOption.value
      logDebug(`populateBedSelector: Cama actual ajustada al selector: ${window.AppState.currentBedId}`)
      // Cargar la UI para la nueva cama seleccionada si cambió
      loadBedDataIntoUI(window.AppState.currentBedId)
    } else if (!window.AppState.currentBedId && ids.length > 0) {
      // Si no hay cama actual pero hay camas, seleccionar la primera y cargar UI
      window.AppState.currentBedId = ids[0]
      logDebug(`populateBedSelector: No había cama actual, seleccionando la primera: ${window.AppState.currentBedId}`)
      loadBedDataIntoUI(window.AppState.currentBedId)
    } else if (!window.AppState.currentBedId && ids.length === 0) {
      // Caso en que no hay camas y se acaba de eliminar la última o falló la carga
      loadBedDataIntoUI(null) // Limpiar UI
    }

    logDebug("populateBedSelector: Selector de camas populado.")
  }

  /** Añade una nueva cama. */
  function addBed(id = null, skipSave = false) {
    Logger.info('Iniciando proceso para añadir nueva cama', { idSugerido: id, skipSave });
    
    try {
        if (!window.AppState) {
            Logger.error('addBed: AppState no está inicializado.');
            alert('Error crítico: El estado de la aplicación no está disponible.');
            return null;
        }
    
        // Guardar datos de la cama actual (si existe) ANTES de cambiar el currentBedId
        if (window.AppState.currentBedId && window.AppState.beds[window.AppState.currentBedId]) {
            Logger.debug('Guardando datos de la cama actual antes de añadir una nueva', { currentBedId: window.AppState.currentBedId });
            saveUIToCurrentBedData(window.AppState.currentBedId);
        } else {
            Logger.debug('No hay cama actual o datos para guardar antes de añadir una nueva.');
        }
    
        const newBedId = id || String(Object.keys(window.AppState.beds || {}).length + 1);
        
        if (window.AppState.beds[newBedId]) {
            Logger.warn(`addBed: Ya existe una cama con el ID: ${newBedId}. No se creará una nueva.`);
            // Si ya existe, simplemente la cargamos
            if(window.AppState.currentBedId !== newBedId) {
                window.AppState.currentBedId = newBedId;
                loadBedDataIntoUI(newBedId);
            }
            return newBedId; // Retornar el ID existente
        }
    
        const initialBedData = {
            structured: {},
            text: {},
            meds: [] 
        };
        
        window.AppState.beds[newBedId] = initialBedData;
        Logger.info('Nueva cama creada en AppState', { newBedId, initialBedData });

        window.AppState.currentBedId = newBedId; // Establecer como cama actual
        Logger.debug(`Nueva cama actual establecida a: ${newBedId}`);

        // Cargar datos en la UI (esto llamará a renderAppStructure y luego a renderBedChips)
        loadBedDataIntoUI(newBedId);

        if (!skipSave) {
            StorageManager.saveAllBedData();
            Logger.debug('Datos de todas las camas guardados en almacenamiento tras añadir cama.');
        } else {
            Logger.debug('Guardado en almacenamiento omitido para nueva cama.');
        }
        
        // closeAllMenus(); // loadBedDataIntoUI -> renderAppStructure podría interferir con menús.
                         // Es mejor que el origen de la acción (botón UI) cierre menús si es necesario.
        
        if (window.EventManager) {
            window.EventManager.emit('bedCreated', { bedId: newBedId });
        }
        
        Logger.info(`Cama ${newBedId} añadida y cargada exitosamente.`);
        return newBedId;

    } catch (error) {
        Logger.error('Error crítico al añadir nueva cama', error);
        alert(`Error al crear nueva cama: ${error.message || error}`);
        renderBedChips(); // Intentar actualizar los chips incluso si falla la creación
        return null;
    }
  }

  /** Elimina la cama actualmente seleccionada. */
  function removeCurrentBed() {
    logDebug('removeCurrentBed: Intentando eliminar cama actual.')
    
    const currentBedId = window.AppState.currentBedId
    if (!currentBedId) {
        logDebug('removeCurrentBed: No hay cama actual para eliminar.')
      return
    }
    
    // Verificar que no sea la última cama
    if (Object.keys(window.AppState.beds).length <= 1) {
        logDebug('removeCurrentBed: No se puede eliminar la última cama.')
      alert('No se puede eliminar la última cama.'); // Informar al usuario
      return
    }

    // Eliminar la cama actual
    delete window.AppState.beds[currentBedId]
    logDebug(`removeCurrentBed: Cama "${currentBedId}" eliminada.`)
    
    // Seleccionar la primera cama disponible como nueva cama actual
    const remainingBedIds = Object.keys(window.AppState.beds);
    const newCurrentBedId = remainingBedIds.length > 0 ? remainingBedIds[0] : null;
    window.AppState.currentBedId = newCurrentBedId
    
    // Cargar datos de la nueva cama actual
    if (newCurrentBedId) {
        loadBedDataIntoUI(newCurrentBedId)
    } else {
        // Si no quedan camas, limpiar la UI o mostrar un estado vacío
        renderAppStructure(); // Podría necesitar limpiar #sections-container
        populateBedSelector(); // Asegurar que el selector se actualice a "Sin camas"
    }
    
    // Guardar cambios
    StorageManager.saveAllBedData(); // Guardar en StorageManager
    
    // Actualizar selector de camas
    // renderBedChips()
    populateBedSelector(); // Usar populateBedSelector
    
    // Cerrar menús flotantes
    closeAllMenus()
    
    logDebug(`removeCurrentBed: Nueva cama actual establecida a "${newCurrentBedId}".`)
  }

  /** Limpia todos los datos de la cama actualmente seleccionada (deja la cama vacía). */
  function clearCurrentBedData() {
    logDebug('clearCurrentBedData: Intentando limpiar datos de cama actual...')
    
    const currentBedId = window.AppState.currentBedId
    if (!currentBedId) {
        logDebug('clearCurrentBedData: No hay cama actual para limpiar.')
      return
    }

    logDebug(`clearCurrentBedData: Limpiando datos de cama: ${currentBedId}`)
    
    // Reiniciar datos de la cama actual
    window.AppState.beds[currentBedId] = {
        datos: {},
        antecedentes: {},
        evolucion: {},
        fisico: '',
        notas_libres: '',
        ingreso_manual: '',
        medicaciones: []
    }
    
    // Recargar UI con datos limpios
    loadBedDataIntoUI(currentBedId)
    
    // Guardar cambios
    // saveAllBedDataToStorage()
    StorageManager.saveAllBedData(); // Usar StorageManager
    
    // Actualizar selector
    // renderBedChips()
    populateBedSelector(); // Usar populateBedSelector
    
    // Cerrar menús flotantes
    closeAllMenus()
    
    logDebug(`clearCurrentBedData: Datos de cama "${currentBedId}" limpiados y guardados.`)
  }

  /* ══════════ Construcción DOM (Renderizado Inicial) ══════════ */

  // Punto 6: Repetición estructural (Factorizar voiceable button HTML)
  /** Genera el HTML para el botón de reconocimiento de voz. */
  function makeVoiceButtonHTML(targetInputId) {
    // Verificar si el reconocimiento de voz está soportado antes de añadir botones (mejora UX)
    // Si no es soportado, la función initializeSpeechRecognition los ocultará, pero es mejor no añadirlos si no existen.
    // Sin embargo, la API SpeechRecognition existe, solo el navegador puede no implementarla.
    // Dejar que se añadan y luego ocultarlos con CSS/JS en initializeSpeechRecognition es un enfoque válido.
    // Por ahora, los añadimos siempre y initializeSpeechRecognition se encarga de ocultarlos si no hay soporte.
    // Sin embargo, la API SpeechRecognition existe, solo el navegador puede no implementarla.
    // Dejar que se añadan y luego ocultarlos con CSS/JS en initializeSpeechRecognition es un enfoque válido.
    // Por ahora, los añadimos siempre y initializeSpeechRecognition se encarga de ocultarlos si no hay soporte.
    return `<button type="button" class="voice-input-btn" data-action="startDictation" data-target-input="${targetInputId}" title="Dictar por voz">🎙️</button>`
  }

  /** Crea el elemento HTML para una sección de la nota (adaptable). */
  function makeSectionElement(sec, idx, bedIdForElement) { // Añadido bedIdForElement
    Logger.debug(`makeSectionElement: Creando sección ${sec.key} para cama ${bedIdForElement}`);
    
    const div = document.createElement("div");
    div.className = "section";
    div.id = `section-${sec.key}-${bedIdForElement}`; // ID de sección único por cama
    div.dataset.key = sec.key;
    div.dataset.bedId = bedIdForElement; // Guardar el bedId en el elemento

    // const bedId = State.currentBedId; // No usar State.currentBedId aquí directamente
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

    Logger.debug(`makeSectionElement: Sección ${sec.key} para cama ${bedIdForElement} creada.`);
    return div;
  }

  /** Crea el elemento HTML para la sección de medicación. */
  function makeMedicationSection() {
    logDebug("makeMedicationSection: Creando sección de medicamentos...");
    
    const section = document.createElement("div");
    section.className = "section";
    section.id = "medicacion";
    section.setAttribute("data-key", "medicacion");

    // Verificar que tenemos medicamentos cargados
    if (!Array.isArray(State.medicationsList) || State.medicationsList.length === 0) {
      logDebug("makeMedicationSection: No hay medicamentos cargados, usando lista por defecto.");
      State.medicationsList = AppConfig.medications;
    }

    section.innerHTML = `
      <div class="section-header" data-action="toggle-section" data-key="medicacion">
        <h2>Medicación</h2>
      </div>
      <div id="content-medicacion" class="section-content" style="display: none;">
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

    // Configurar listeners después de crear la sección
    setTimeout(() => {
      setupMedicationListeners();
    }, 0);

    return section;
  }

  /** Renderiza los menús flotantes de Acciones y Escalas. */
  function renderFloatingMenus() {
    console.log('Iniciando renderFloatingMenus...');
    
    // Verificar elementos principales
    const floatingContainer = document.getElementById('floating-actions-container');
    const actionsContainer = document.getElementById('actions-container');
    const scalesContainer = document.getElementById('scales-btn-container');
    
    console.log('Estado de contenedores:', {
        floatingContainer: !!floatingContainer,
        actionsContainer: !!actionsContainer,
        scalesContainer: !!scalesContainer
    });

    if (!floatingContainer || !actionsContainer || !scalesContainer) {
        console.error('Contenedores de botones flotantes no encontrados');
        return;
    }

    // Verificar botones
    const actionsBtn = document.getElementById('actions-btn-floating');
    const scalesBtn = document.getElementById('scales-btn-floating');
    const copyBtn = document.getElementById('copy-btn-floating');

    console.log('Estado de botones:', {
        actionsBtn: !!actionsBtn,
        scalesBtn: !!scalesBtn,
        copyBtn: !!copyBtn
    });

    if (!actionsBtn || !scalesBtn || !copyBtn) {
        console.error('Botones flotantes no encontrados');
        return;
    }

    // Verificar listas de menú
    const actionsList = document.getElementById('actions-list');
    const scalesList = document.getElementById('scales-list');

    console.log('Estado de listas:', {
        actionsList: !!actionsList,
        scalesList: !!scalesList
    });

    if (!actionsList || !scalesList) {
        console.error('Listas de menú no encontradas');
        return;
    }

    // Limpiar y repoblar menú de acciones
    actionsList.innerHTML = '';
    const actions = [
        { text: '📥 Descargar Nota', action: () => downloadNote() }
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

    // Registrar eventos de clic para los botones
    actionsBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log('Clic en botón de acciones');
        actionsList.style.display = actionsList.style.display === 'none' ? 'block' : 'none';
        scalesList.style.display = 'none';
    });

    scalesBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log('Clic en botón de escalas');
        scalesList.style.display = scalesList.style.display === 'none' ? 'block' : 'none';
        actionsList.style.display = 'none';
    });

    copyBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        console.log('Clic en botón de copiar');
        showPreviewModal();
    });

    // Registrar evento global para cerrar menús
    document.addEventListener('click', (e) => {
        if (!actionsContainer.contains(e.target) && !scalesContainer.contains(e.target)) {
            actionsList.style.display = 'none';
            scalesList.style.display = 'none';
        }
    });

    console.log('renderFloatingMenus completado');
  }

  /** Renderiza la estructura principal de la aplicación dentro de #app (sin el gestor de camas). */
  function renderAppStructure() {
    Logger.info('Renderizando estructura de la aplicación en #app');
    
    const app = document.getElementById('app');
    if (!app) {
        Logger.error('Elemento #app no encontrado al renderizar estructura.');
        return;
    }

    const currentBedIdToRender = window.AppState.currentBedId;
    if (!currentBedIdToRender) {
        Logger.warn('No hay currentBedId para renderizar la estructura de secciones. Asegurando una cama primero.');
        ensureAtLeastOneBed(); // Asegura que hay una cama y un currentBedId
        // Vuelve a llamar a renderAppStructure después de asegurar la cama.
        // Esto puede causar un pequeño parpadeo si no había cama, pero es necesario.
        if(window.AppState.currentBedId) renderAppStructure(); 
        return;
    }

    // Si #app no tiene contenido, es la primera carga. Renderizar todo.
    if (!app.innerHTML.trim()) {
        Logger.debug('#app está vacío, renderizando estructura completa.');
        const baseHTML = `
            <h1 style="text-align: center; margin: 20px 0; color: #2c3e50;">Suite Neurología v1.0.0</h1>
            <div id="sections-container"></div>
        `;
        app.innerHTML = baseHTML;

        // Renderizar (o re-renderizar) solo las secciones para la cama actual
        const sectionsContainer = document.getElementById('sections-container');
        if (sectionsContainer) {
            sectionsContainer.innerHTML = ''; // Limpiar secciones antiguas
            Logger.debug(`Renderizando secciones para cama: ${currentBedIdToRender}`);
            try {
                SectionRenderOrder.forEach((key, index) => {
                    if (key === 'medicacion') {
                        sectionsContainer.appendChild(makeMedicationSection(currentBedIdToRender)); // Pasar ID si es necesario
                    } else {
                        const sectionConfig = Sections.find(s => s.key === key);
                        if (sectionConfig) {
                            const sectionElement = makeSectionElement(sectionConfig, index, currentBedIdToRender);
                            sectionsContainer.appendChild(sectionElement);
                            const contentElement = sectionElement.querySelector(`#content-${key}-${currentBedIdToRender}`);
                            if (contentElement) {
                                contentElement.style.display = 'none'; // Ocultar por defecto
                            }
                        } else {
                            Logger.warn(`Configuración de sección no encontrada para la clave: ${key}`);
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
                Logger.info(`Estructura de secciones para cama ${currentBedIdToRender} creada/actualizada.`);
            } catch (error) {
                Logger.error('Error renderizando secciones:', { currentBedIdToRender, error });
                sectionsContainer.innerHTML = '<p style="color:red;">Error creando interfaz de secciones. Por favor, recarga.</p>';
            }
        } else {
            Logger.error('#sections-container no encontrado después de renderizar baseHTML.');
        }
    }
  }

  /** Renderiza los chips de cama basados en el estado. */
  function renderBedChips() {
    Logger.info('Renderizando chips de cama');
    
    try {
        const container = document.querySelector('.bed-chips-container');
        if (!container) {
            // Logger.error('Contenedor de chips no encontrado al renderizar chips.');
            // return;
            // Si el contenedor de chips no se usa, esta función no debería hacer nada o ser eliminada.
            // Por ahora, simplemente retornamos si no encontramos el contenedor esperado.
            // Si la UI ha cambiado a un <select>, esta función es obsoleta.
            Logger.warn('renderBedChips: Contenedor .bed-chips-container no encontrado. Esta función puede ser obsoleta si se usa un <select> para camas.');
            return;
        }

        container.innerHTML = ''; // Limpiar chips existentes

        const beds = window.AppState?.beds || {};
        const currentGlobalBedId = window.AppState?.currentBedId;

        if (!beds || Object.keys(beds).length === 0) {
            Logger.warn('No hay camas para renderizar en renderBedChips. Asegurando una cama.');
            // ensureAtLeastOneBed(); // Esto podría causar un bucle si la creación falla y llama a renderBedChips de nuevo.
            // Mejor simplemente mostrar mensaje y permitir que addBed maneje la creación inicial si es necesario.
            container.innerHTML = '<div class="no-beds-message">No hay camas creadas. Añade una.</div>';
            return;
        }

        Object.keys(beds).forEach(bedId => {
            const chip = document.createElement('div');
            chip.className = `bed-chip ${bedId === currentGlobalBedId ? 'active' : ''}`;
            chip.dataset.bedId = bedId;
            chip.innerHTML = `${bedId} <span class="close-btn" title="Eliminar cama ${bedId}">×</span>`;
            
            chip.addEventListener('click', (e) => {
                const clickedBedId = chip.dataset.bedId;
                if (e.target.classList.contains('close-btn')) {
                    e.stopPropagation();
                    if (Object.keys(window.AppState.beds).length > 1) {
                        Logger.info(`Intentando eliminar cama: ${clickedBedId}`);
                        // Guardar datos de la cama actual ANTES de cualquier cambio si la cama a eliminar NO es la actual
                        if (window.AppState.currentBedId && window.AppState.currentBedId !== clickedBedId) {
                           saveUIToCurrentBedData(window.AppState.currentBedId);
                        }
                        // Eliminar la cama solicitada
                        delete window.AppState.beds[clickedBedId];
                        Logger.info(`Cama ${clickedBedId} eliminada de AppState.`);
                        
                        // Si la cama eliminada ERA la actual, seleccionar una nueva cama actual
                        if (window.AppState.currentBedId === clickedBedId) {
                            const remainingBedIds = Object.keys(window.AppState.beds);
                            window.AppState.currentBedId = remainingBedIds.length > 0 ? remainingBedIds[0] : null;
                            Logger.info(`Nueva cama actual establecida a: ${window.AppState.currentBedId}`);
                        }
                        
                        StorageManager.saveAllBedData(); // Guardar el estado sin la cama eliminada
                        
                        if (window.AppState.currentBedId) {
                            loadBedDataIntoUI(window.AppState.currentBedId); // Carga la nueva cama actual (o la que quedó)
                        } else {
                            renderAppStructure(); // Si no quedan camas, al menos re-renderizar la estructura base
                            // renderBedChips(); // Y los chips (que mostrarán "sin camas")
                            populateBedSelector(); // Usar populateBedSelector
                        }
                    } else {
                        Logger.warn('No se puede eliminar la última cama.');
                        alert('No se puede eliminar la última cama.');
                    }
                } else {
                    // Clic en el chip para cambiar de cama
                    if (clickedBedId !== window.AppState.currentBedId) {
                        Logger.info(`Cambiando a cama: ${clickedBedId}`);
                        if (window.AppState.currentBedId) {
                            saveUIToCurrentBedData(window.AppState.currentBedId); // Guardar datos de la cama que se deja
                        }
                        window.AppState.currentBedId = clickedBedId; // Establecer nueva cama actual
                        loadBedDataIntoUI(clickedBedId); // Cargar datos y re-renderizar UI para la nueva cama (esto llamará a renderBedChips indirectamente)
                    } else {
                        Logger.debug(`Cama ${clickedBedId} ya está activa.`);
                    }
                }
            });
            container.appendChild(chip);
        });

        Logger.info('Chips de cama renderizados exitosamente', { 
            totalBeds: Object.keys(beds).length,
            currentBed: currentGlobalBedId 
        });
    } catch (error) {
        Logger.error('Error al renderizar chips de cama', error);
        // Intentar mostrar un estado de error en el contenedor de chips
        const chipContainer = document.querySelector('.bed-chips-container');
        if(chipContainer) chipContainer.innerHTML = '<div class="error-message">Error al mostrar camas</div>';
    }
  }

  // Implementación de addMedication (integrado y ligeramente mejorado)
  /** Añade una medicación a la lista de la cama actual. Se llama desde la delegación de eventos. */
  function addMedication(value) {
    logDebug("addMedication: Agregando medicamento:", value);
    
    if (!value) {
      const input = document.getElementById("medication-input");
      value = input ? input.value.trim() : "";
    }

    if (!value) {
      console.warn("addMedication: No se proporcionó un valor para el medicamento");
      return;
    }

    const medicationList = document.getElementById("medication-list");
    if (!medicationList) {
      console.error("addMedication: No se encontró el contenedor de medicamentos");
      return;
    }

    const medicationItem = document.createElement("div");
    medicationItem.className = "medication-item";
    medicationItem.style.cssText = `
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 8px;
      margin-bottom: 8px;
      background-color: #f8f9fa;
      border-radius: 4px;
      border: 1px solid #e9ecef;
    `;

    const medicationText = document.createElement("span");
    medicationText.textContent = value;
    medicationText.style.flex = "1";

    const removeButton = document.createElement("button");
    removeButton.innerHTML = "×";
    removeButton.style.cssText = `
      background: none;
      border: none;
      color: #dc3545;
      font-size: 20px;
      cursor: pointer;
      padding: 0 8px;
    `;
    removeButton.onclick = () => {
      medicationItem.remove();
      logDebug("addMedication: Medicamento eliminado:", value);
    };

    medicationItem.appendChild(medicationText);
    medicationItem.appendChild(removeButton);
    medicationList.appendChild(medicationItem);

    logDebug("addMedication: Medicamento agregado exitosamente:", value);
  }

  // Implementación de handleSuggestionClick (integrado y ligeramente mejorado)
  /** Maneja el clic en una sugerencia de medicación. Se llama desde la delegación de eventos. */
  function handleSuggestionClick(e) {
    const li = e.target.closest('li')
    if (!li) return

    const medName = li.dataset.med
    if (!medName) return

    const bedId = State.currentBedId ? State.currentBedId.replace(/[^a-zA-Z0-9]/g, "") : "default"
    const medInput = getElement(`med-input-${bedId}`)
    const doseForm = getElement("dose-form")
    const doseInput = getElement(`dose-input-${bedId}`)
    const sl = getElement("med-suggestions")

    if (!medInput || !doseForm || !doseInput || !sl) return

    medInput.value = medName
    sl.style.display = "none"
    doseForm.style.display = "flex"
    doseInput.focus()
  }

  // Implementación de setupMedicationListeners (integrado y ligeramente mejorado)
  /** Configura los listeners para la sección de medicación (input de búsqueda y botones del formulario dosis). */
  function setupMedicationListeners() {
    logDebug("setupMedicationListeners: Configurando listeners de medicación...");
    
    const medInput = getElement("med-input");
    const doseInput = getElement("dose-input");
    const doseForm = getElement("dose-form");
    const suggestionsList = getElement("med-suggestions");
    const doseAdd = getElement("dose-add");
    const doseCancel = getElement("dose-cancel");

    if (!medInput || !doseInput || !doseForm || !suggestionsList || !doseAdd || !doseCancel) {
        console.error("setupMedicationListeners: Elementos de medicación no encontrados.");
        return;
    }

    // Limpiar listeners anteriores
    const newMedInput = medInput.cloneNode(true);
    medInput.parentNode.replaceChild(newMedInput, medInput);

    // Configurar listeners
    newMedInput.addEventListener("input", (e) => {
        const query = e.target.value.trim();
        if (query.length < 2) {
            suggestionsList.style.display = "none";
            return;
        }

        // Filtrar medicamentos
        const medsArray = Array.isArray(State.medicationsList) ? State.medicationsList : [];
        const matches = medsArray.filter((med) =>
            med && typeof med.nombre === 'string' && med.nombre.toLowerCase().includes(query.toLowerCase())
        );

        if (matches.length > 0) {
            suggestionsList.innerHTML = matches
                .map((med) => `<li data-med="${med.nombre}">${med.nombre}</li>`)
                .join("");
            suggestionsList.style.display = "block";
        } else {
            suggestionsList.style.display = "none";
        }
    });

    // Manejar clic en sugerencias
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

    // Manejar clic fuera para cerrar sugerencias
    document.addEventListener("click", (e) => {
        if (!e.target.closest("#med-input-container")) {
            suggestionsList.style.display = "none";
        }
    });

    // Función para agregar medicamento
    const addMedication = () => {
        const medName = newMedInput.value.trim();
        const dose = doseInput.value.trim();
        
        if (!medName) return;

        const currentBed = State.beds[State.currentBedId];
        if (!currentBed) {
            console.error("No hay cama seleccionada");
            return;
        }

        if (!Array.isArray(currentBed.meds)) {
            currentBed.meds = [];
        }

        const medicationText = dose ? `${medName} ${dose}` : medName;

        if (!currentBed.meds.includes(medicationText)) {
            currentBed.meds.push(medicationText);
            newMedInput.value = '';
            doseInput.value = '';
            doseForm.style.display = "none";
            syncChips();
            scheduleSaveAllData();
        } else {
            window.ErrorUI?.showInfo?.(`"${medicationText}" ya está en la lista.`, 3000);
        }
    };

    // Configurar eventos de botones
    doseAdd.addEventListener("click", addMedication);
    doseCancel.addEventListener("click", () => {
        doseForm.style.display = "none";
        newMedInput.value = "";
        doseInput.value = "";
    });

    // Permitir añadir medicación presionando Enter
    doseInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            addMedication();
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

    logDebug("setupMedicationListeners: Listeners de medicación configurados.");
  }

  // Inicialización del reconocimiento de voz (integrado y mejorado)
  /** Inicializa la API de reconocimiento de voz y configura sus eventos. */
  function initializeSpeechRecognition() {
    logDebug("initializeSpeechRecognition: Intentando inicializar API de reconocimiento de voz...")
    // Ocultar botones de voz si la API no es soportada (Punto 9: Edge cases - soporte)
    if (!SpeechRecognition) {
      console.warn("initializeSpeechRecognition: API de reconocimiento de voz no soportada en este navegador.")
      // Ocultar todos los botones de voz si no hay soporte
      document.querySelectorAll(".voice-input-btn").forEach((btn) => {
        btn.style.display = "none"
      })
      return null // Retornar null si no es soportado
    }

    if (recognition) {
      logDebug("initializeSpeechRecognition: Reconocimiento de voz ya inicializado previamente.")
      return recognition // Retornar instancia existente si ya fue inicializada
    }

    recognition = new SpeechRecognition()
    recognition.lang = "es-ES" // Configurar idioma (puede ser configurable si se necesita)
    recognition.continuous = false // Capturar una frase a la vez
    recognition.interimResults = false // No mostrar resultados provisionales en tiempo real

    logDebug("initializeSpeechRecognition: API de reconocimiento de voz inicializada exitosamente.")

    // Evento cuando se obtiene un resultado de voz
    recognition.onresult = (event) => {
      // results es una lista de SpeechRecognitionResult objetos.
      // SpeechRecognitionResult tiene SpeechRecognitionAlternative objetos.
      // event.results[0] es el resultado más relevante. [0] es la alternativa más probable.
      const transcript = event.results[0][0].transcript
      logDebug(`initializeSpeechRecognition.onresult: Voz reconocida: "${transcript}"`)
      if (voiceTargetInputId) {
        const targetInput = getElement(voiceTargetInputId)
        if (targetInput) {
          // Insertar el texto reconocido en el input/textarea objetivo
          insertAtCursor(targetInput, transcript + " ") // Añadir un espacio al final por conveniencia
          // insertAtCursor ya dispara el evento 'input', que programa el guardado automático
        } else {
          logDebug(`initializeSpeechRecognition.onresult: Input objetivo "${voiceTargetInputId}" no encontrado.`)
        }
      } else {
        logDebug("initializeSpeechRecognition.onresult: voiceTargetInputId no seteado.")
      }

      // Restablecer el indicador visual en el botón de voz
      if (voiceBtnIndicator) {
        voiceBtnIndicator.classList.remove("active")
      }
      voiceTargetInputId = null // Limpiar target después de resultado
      voiceBtnIndicator = null
    }

    // Evento en caso de error del reconocimiento de voz
    recognition.onerror = (event) => {
      console.error("initializeSpeechRecognition.onerror: Error de reconocimiento de voz:", event.error)
      // Informar al usuario sobre el error, especialmente si es un error común de permiso
      let errorMessage = `Error en el reconocimiento de voz: ${event.error}.`
      if (event.error === "not-allowed") {
        errorMessage += "\nPor favor, permite el acceso al micrófono en la configuración del navegador."
      } else if (event.error === "no-speech") {
        errorMessage = "No se detectó voz. Inténtalo de nuevo."
      } else if (event.error === "audio-capture") {
        errorMessage = "Error al acceder al micrófono. Asegúrate de que esté conectado y funcionando."
      }
      alert(errorMessage)

      // Restablecer el indicador visual en caso de error
      if (voiceBtnIndicator) {
        voiceBtnIndicator.classList.remove("active")
      }
      voiceTargetInputId = null // Limpiar target en caso de error
      voiceBtnIndicator = null
    }

    // Evento cuando el reconocimiento termina (ya sea por fin de voz, error, o stop)
    recognition.onend = () => {
      logDebug("initializeSpeechRecognition.onend: Reconocimiento de voz terminado.")
      // Asegurar que el indicador visual se remueva si no se hizo ya
      if (voiceBtnIndicator) {
        voiceBtnIndicator.classList.remove("active")
      }
      voiceTargetInputId = null // Limpiar target al finalizar
      voiceBtnIndicator = null
    }

    // Punto 9: Edge cases - Cancelar reconocimiento si la pestaña pierde visibilidad
    // Esto ayuda a evitar errores y consumo de recursos si el usuario cambia de pestaña mientras dicta
    document.addEventListener("visibilitychange", () => {
      // Si el documento se oculta Y el reconocimiento está activo (indicado por voiceBtnIndicator)
      if (document.hidden && recognition && voiceBtnIndicator) {
        try {
          recognition.stop() // Detener el reconocimiento
          logDebug(
            "initializeSpeechRecognition: Reconocimiento de voz detenido debido a cambio de visibilidad de pestaña.",
          )
        } catch (e) {
          console.error("initializeSpeechRecognition: Error al detener reconocimiento en visibilitychange:", e)
        }
      }
    })

    return recognition // Retornar la instancia creada (puede ser útil para depurar)
  }

  // Manejo de inicio de dictado por voz (integrado y mejorado)
  /** Inicia el reconocimiento de voz para un input específico. Se llama desde la delegación de eventos. */
  function startVoiceInput(targetInputId) {
    logDebug(`startVoiceInput: Intentando iniciar dictado para input: ${targetInputId}`)
    // Inicializar el reconocimiento si no lo está (llamará a initializeSpeechRecognition)
    if (!recognition) {
      recognition = initializeSpeechRecognition()
      if (!recognition) {
        // initializeSpeechRecognition ya muestra un error/alerta si no es soportado
        logDebug("startVoiceInput: Inicialización de reconocimiento de voz falló.")
        return // Salir si no se pudo inicializar
      }
    }

    // Si el reconocimiento ya está escuchando, detener la instancia previa antes de empezar una nueva.
    // Esto evita múltiples instancias de reconocimiento activas simultáneamente.
    if (recognition && voiceBtnIndicator) {
      try {
        recognition.stop() // Detener la instancia anterior
        logDebug("startVoiceInput: Deteniendo reconocimiento de voz previo.")
      } catch (e) {
        console.error("startVoiceInput: Error al detener reconocimiento de voz previo:", e)
      }
    }

    // Verificar que el input objetivo existe antes de intentar iniciar
    const targetInput = getElement(targetInputId)
    if (!targetInput) {
      console.error(`startVoiceInput: Input objetivo con ID "${targetInputId}" no encontrado.`)
      alert("Error interno: No se encontró el campo para dictar.")
      return
    }

    try {
      // Guardar el ID del input objetivo y la referencia al botón para el indicador visual
      voiceTargetInputId = targetInputId
      voiceBtnIndicator = document.querySelector(`[data-action="startDictation"][data-target-input="${targetInputId}"]`)

      if (voiceBtnIndicator) {
        voiceBtnIndicator.classList.add("active") // Añadir clase para indicar que está activo (CSS maneja la animación)
      }

      recognition.start() // Iniciar el reconocimiento de voz
      logDebug(`startVoiceInput: Reconocimiento de voz iniciado para input: ${targetInputId}.`)
      // El evento onstart del recognition podría usarse para confirmar el inicio real.
    } catch (e) {
      console.error("startVoiceInput: Error al iniciar reconocimiento de voz:", e)
      // Informar al usuario si hay un error al intentar iniciar
      alert(
        "Error al iniciar reconocimiento de voz. Asegúrate de que tu micrófono esté conectado y permítele acceso a esta página. Consulta la consola para más detalles.",
      )

      // Asegurarse de limpiar el indicador visual si falla al iniciar
      if (voiceBtnIndicator) {
        voiceBtnIndicator.classList.remove("active")
      }
      voiceTargetInputId = null // Limpiar target en caso de error
      voiceBtnIndicator = null
    }
  }

  // Inicialización de modales (integrado y mejorado)
  /** Obtiene referencias a los elementos de los modales (API, Preview Nota, EF Template, Parkinson) y configura sus listeners básicos. */
  function initializeModals() {
    logDebug("initializeModals: Inicializando referencias a modales y configurando listeners básicos...")
    // Obtener referencias a los modales y sus elementos
    previewNoteModal = getElement("preview-note-modal")
    previewNoteText = getElement("preview-note-text")
    confirmNoteCopyBtn = getElement("confirm-note-copy")
    cancelNoteCopyBtn = getElement("cancel-note-copy")

    efTemplateModal = getElement("ef-template-modal")
    efTemplateTitle = getElement("ef-template-title") // Referencia al título del modal EF
    efTemplateTextarea = getElement("ef-template-textarea")
    efInsertBtn = getElement("ef-insert-btn")
    efCancelBtn = getElement("ef-cancel-btn")

    // ¡NUEVO! Obtener referencias a los elementos del modal de Parkinson (definido en index.html)
    pkOverlay = getElement("pkOverlay")
    pkFrame = getElement("pkFrame")
    pkClose = getElement("pkClose") // El botón 'X'

    // Obtener referencias a los elementos del modal de API Key (definido en index.html)
    apiModal = getElement("api-modal")
    apiInput = getElement("api-input")
    apiSave = getElement("api-save")
    apiCancel = getElement("api-cancel")

    // Log para verificar si los elementos clave se encontraron
    logDebug(
      `initializeModals: previewNoteModal: ${!!previewNoteModal}, efTemplateModal: ${!!efTemplateModal}, pkOverlay: ${!!pkOverlay}, pkClose: ${!!pkClose}, apiModal: ${!!apiModal}`,
    )

    // Configurar eventos para el modal de previsualización de nota (si existe)
    if (previewNoteModal) {
      logDebug("initializeModals: Configurando modal de previsualización de nota.")
      // Cerrar modal con el botón Cancelar
      if (cancelNoteCopyBtn) {
        cancelNoteCopyBtn.addEventListener("click", () => {
          previewNoteModal.style.display = "none"
          logDebug("initializeModals: Modal de previsualización cerrado (Cancelar).")
        })
      }

      // Copiar texto al portapapeles con el botón Confirmar
      if (confirmNoteCopyBtn) {
        // Listener asíncrono para usar await con clipboard API
        confirmNoteCopyBtn.addEventListener("click", async () => {
          logDebug("initializeModals: Botón 'Copiar y Enviar' clickeado.")
          if (previewNoteText && previewNoteText.value) {
            try {
              await navigator.clipboard.writeText(previewNoteText.value)
              alert("Nota copiada al portapapeles.")
              logDebug("initializeModals: Nota copiada al portapapeles desde modal.")
            } catch (err) {
              console.error("initializeModals: Error al copiar al portapapeles:", err)
              alert("No se pudo copiar la nota al portapapeles. Por favor, cópiala manualmente (Ctrl+C).")
            }
          }
          previewNoteModal.style.display = "none" // Cerrar modal después de intentar copiar
        })
      }
      // Cerrar modal de previsualización haciendo clic fuera del contenido
      previewNoteModal.addEventListener("click", (e) => {
        // Si el clic fue directamente en el overlay (el fondo oscuro), no en el contenido del modal
        if (e.target === previewNoteModal) {
          previewNoteModal.style.display = "none"
          logDebug("initializeModals: Modal de previsualización cerrado por clic externo.")
        }
      })
    } else {
      logDebug("initializeModals: Modal de previsualización de nota (preview-note-modal) no encontrado.")
    }

    // Configurar eventos para el modal de plantillas de Examen Físico (si existe)
    if (efTemplateModal) {
      logDebug("initializeModals: Configurando modal de plantillas de Examen Físico.")
      // Cerrar modal con el botón Cancelar
      if (efCancelBtn) {
        efCancelBtn.addEventListener("click", () => {
          efTemplateModal.style.display = "none"
          // Limpiar textarea del modal al cerrar (opcional, pero buena práctica)
          if (efTemplateTextarea) efTemplateTextarea.value = ""
          logDebug("initializeModals: Modal de plantillas EF cerrado (Cancelar).")
        })
      }

      // Insertar plantilla en el textarea de Examen Físico y cerrar modal
      if (efInsertBtn) {
        efInsertBtn.addEventListener("click", () => {
          logDebug("initializeModals: Botón 'Insertar Texto' (EF) clickeado.")
          const ta = getTextArea("fisico") // Obtener el textarea de EF usando la helper
          if (ta && efTemplateTextarea && efTemplateTextarea.value) {
            insertAtCursor(ta, efTemplateTextarea.value + "\n\n") // Insertar texto + doble salto de línea
            // insertAtCursor ya dispara el evento 'input', que programa el guardado
            logDebug("initializeModals: Plantilla de EF insertada.")
          } else if (!ta) {
            console.error("initializeModals: Textarea 'ta-fisico' no encontrado para insertar plantilla.")
          } else if (!efTemplateTextarea || !efTemplateTextarea.value) {
            logDebug("initializeModals: Textarea del modal de plantilla EF vacío.")
          }
          efTemplateModal.style.display = "none" // Cerrar modal después de intentar insertar
          // Limpiar textarea del modal
          if (efTemplateTextarea) efTemplateTextarea.value = ""
        })
      }
      // Cerrar modal de plantillas EF haciendo clic fuera del contenido
      efTemplateModal.addEventListener("click", (e) => {
        if (e.target === efTemplateModal) {
          efTemplateModal.style.display = "none"
          if (efTemplateTextarea) efTemplateTextarea.value = "" // Limpiar textarea
          logDebug("initializeModals: Modal de plantillas EF cerrado por clic externo.")
        }
      })
    } else {
      logDebug("initializeModals: Modal de plantillas de Examen Físico (ef-template-modal) no encontrado.")
    }

    // Configurar eventos para el modal de API Key (si existe)
    if (apiModal) {
      logDebug("initializeModals: Configurando modal de API Key.")
      // Cargar clave guardada al inicio (se hace en setupGlobalEventListeners ahora)
      // const savedKey = localStorage.getItem(LS_API_KEY); ...

      // Los listeners para apiBtn (abrir), apiSave (guardar), apiCancel (cancelar)
      // y el keydown en apiInput se configuran en setupGlobalEventListeners
      // o en una función dedicada si el modal API tuviera más lógica compleja.
      // Para este caso, los mantendremos en setupGlobalEventListeners por simplicidad actual.

      // Cerrar modal de API Key haciendo clic fuera del contenido
      // Cerrar modal de API Key haciendo clic fuera del contenido
      apiModal.addEventListener("click", (e) => {
        if (e.target === apiModal) {
          apiModal.style.display = "none"
          // Restaurar el valor del input al último guardado al cancelar/cerrar
          if (apiInput) apiInput.value = localStorage.getItem(LS_API_KEY) || ""
          logDebug("initializeModals: Modal de API Key cerrado por clic externo.")
        }
      })
    } else {
      logDebug("initializeModals: Modal de API Key (api-modal) no encontrado.")
    }

    // Configurar eventos para el modal de Parkinson (si existe)
    // Los listeners específicos para pkClose y los mensajes del iframe
    // se configuran en setupPkOverlayListeners.
    // initializeModals solo obtiene las referencias a los elementos.
    if (pkOverlay) {
      logDebug("initializeModals: Referencia a pkOverlay obtenida.")
    } else {
      logDebug("initializeModals: Elemento pkOverlay no encontrado.")
    }
    if (pkClose) {
      logDebug("initializeModals: Referencia a pkClose obtenida.")
    } else {
      logDebug("initializeModals: Elemento pkClose no encontrado.")
    }
    if (pkFrame) {
      logDebug("initializeModals: Referencia a pkFrame obtenida.")
    } else {
      logDebug("initializeModals: Elemento pkFrame no encontrado.")
    }

    // Cerrar cualquier modal abierto con la tecla Escape
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape") {
        // Cerrar modal de previsualización si está abierto
        if (previewNoteModal?.style.display === "flex") {
          previewNoteModal.style.display = "none"
          logDebug("initializeModals: Modal de previsualización cerrado con Escape.")
        }
        // Cerrar modal de plantillas EF si está abierto
        if (efTemplateModal?.style.display === "flex") {
          efTemplateModal.style.display = "none"
          if (efTemplateTextarea) efTemplateTextarea.value = "" // Limpiar textarea
          logDebug("initializeModals: Modal de plantillas EF cerrado con Escape.")
        }
        // Cerrar modal de API Key si está abierto
        if (apiModal?.style.display === "flex") {
          apiModal.style.display = "none"
          if (apiInput) apiInput.value = localStorage.getItem(LS_API_KEY) || "" // Restaurar valor
          logDebug("initializeModals: Modal de API Key cerrado con Escape.")
        }
        // Cerrar modal de Parkinson si está abierto
        if (pkOverlay?.style.display === "flex") {
          pkOverlay.style.display = "none"
          // Opcional: limpiar iframe al cerrar
          const pkFrame = getElement("pkFrame")
          if (pkFrame) pkFrame.src = "about:blank"
          logDebug("initializeModals: Modal de Parkinson cerrado con Escape.")
        }
      }
    })
    logDebug("initializeModals: Listeners de cierre de modales (Escape, clic externo) configurados.")
  }

  // Configuración de funciones para la escala de Parkinson (integrado y mejorado)
  // La delegación del evento 'openScale' está en setupGlobalEventListeners.
  // Aquí solo definimos la función openScale que se llama desde ese manejador global.
  /**
   * Abre el modal (overlay con iframe) para la escala seleccionada.
   * @param {string} scaleType La clave del tipo de escala (ej: 'parkinson').
   */
  // Expose openScale to window for miastenia-gravis.js to extend
  window.openScale = function(scaleType) {
    logDebug(`openScale: Intentando abrir escala: ${scaleType}`)

    if (scaleType === "parkinson" || scaleType === "miastenia" || scaleType === "nihss" || scaleType === "espasticidad") {
      // Asegurarse de que las referencias a los elementos del modal existen
      if (!pkOverlay || !pkFrame) {
        console.error(`openScale: Elementos para escala "${scaleType}" (pkOverlay o pkFrame) no encontrados.`)
        alert(`Error: Elementos necesarios para la escala "${scaleType}" no encontrados. Verifica tu HTML.`)
        return
      }

      // Specific logic for each scale
      if (scaleType === "parkinson") {
        try {
          const parkinsonHtmlUrl = "parkinson.html"
          if (!pkFrame.src || !pkFrame.src.endsWith(parkinsonHtmlUrl)) {
            pkFrame.src = parkinsonHtmlUrl
            logDebug(`openScale: Cargando URL del iframe de Parkinson: ${pkFrame.src}`)
          }
          pkOverlay.style.display = "flex"
          logDebug("openScale: Overlay de Parkinson abierto.")
        } catch (e) {
          console.error(`openScale: Error al abrir escala "${scaleType}":`, e)
          alert(`Error al abrir la escala "${scaleType}".`)
        }
      } else if (scaleType === "miastenia") {
        logDebug(`openScale: Delegating opening of "${scaleType}" to its specific handler.`);
      } else if (scaleType === "nihss") {
        try {
          const nihssHtmlUrl = "NIHSS.html"
          if (!pkFrame.src || !pkFrame.src.endsWith(nihssHtmlUrl)) {
            pkFrame.src = nihssHtmlUrl
            logDebug(`openScale: Cargando URL del iframe de NIHSS: ${pkFrame.src}`)
          }
          pkOverlay.style.display = "flex"
          logDebug("openScale: Overlay de NIHSS abierto.")
        } catch (e) {
          console.error(`openScale: Error al abrir escala "${scaleType}":`, e)
          alert(`Error al abrir la escala "${scaleType}".`)
        }
      } else if (scaleType === "espasticidad") {
        try {
          const espasticidadHtmlUrl = "espasticidad.html"
          if (!pkFrame.src || !pkFrame.src.endsWith(espasticidadHtmlUrl)) {
            pkFrame.src = espasticidadHtmlUrl
            logDebug(`openScale: Cargando URL del iframe de Espasticidad: ${pkFrame.src}`)
          }
          pkOverlay.style.display = "flex"
          logDebug("openScale: Overlay de Espasticidad abierto.")
        } catch (e) {
          console.error(`openScale: Error al abrir escala "${scaleType}":`, e)
          alert(`Error al abrir la escala "${scaleType}".`)
        }
      }
    } else if (scaleType === "aspects") {
        const aspectsOverlay = document.getElementById('aspectsOverlay');
        if (!aspectsOverlay) {
            const overlay = document.createElement('div');
            overlay.id = 'aspectsOverlay';
            overlay.style.cssText = `
                display: none;
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background-color: rgba(0,0,0,0.7);
                z-index: 1000;
                justify-content: center;
                align-items: center;
            `;

            const container = document.createElement('div');
            container.style.cssText = `
                position: relative;
                width: 90%;
                max-width: 1000px;
                height: 90%;
                background-color: white;
                border-radius: 8px;
                overflow: hidden;
            `;

            const closeBtn = document.createElement('button');
            closeBtn.innerHTML = '×';
            closeBtn.style.cssText = `
                position: absolute;
                top: 10px;
                right: 10px;
                background: none;
                border: none;
                font-size: 24px;
                cursor: pointer;
                z-index: 1001;
            `;

            const iframe = document.createElement('iframe');
            iframe.src = 'aspects.html';
            iframe.style.cssText = `
                width: 100%;
                height: 100%;
                border: none;
            `;

            closeBtn.addEventListener('click', () => {
                overlay.style.display = 'none';
                iframe.src = 'about:blank';
                setTimeout(() => {
                    iframe.src = 'aspects.html';
                }, 100);
            });

            container.appendChild(closeBtn);
            container.appendChild(iframe);
            overlay.appendChild(container);
            document.body.appendChild(overlay);
        }
        document.getElementById('aspectsOverlay').style.display = 'flex';
    } else {
      console.warn(`Tipo de escala "${scaleType}" no reconocido.`)
      alert(`Escala "${scaleType}" no implementada.`)
    }
    // Cerrar los menús flotantes al abrir una escala
    closeAllMenus()
  }

  // Configurar listeners para el overlay de Parkinson (integrado y mejorado)
  /** Configura listeners para el botón de cerrar del modal de Parkinson y para recibir mensajes del iframe. */
  function setupPkOverlayListeners() {
    logDebug("setupPkOverlayListeners: Configurando listeners para overlay de Parkinson...")

    // Asegurarse de que las referencias a los elementos existen antes de añadir listeners
    // Estas referencias se obtienen en initializeModals().
    if (!pkOverlay || !pkClose || !pkFrame) {
      console.error(
        "setupPkOverlayListeners: Elementos de overlay de Parkinson (pkOverlay, pkClose, pkFrame) no encontrados. Los listeners no se configurarán.",
      )
      return // Salir si faltan elementos
    }
    logDebug("setupPkOverlayListeners: Elementos pkOverlay, pkClose, pkFrame encontrados.")

    // Evento para cerrar el overlay con el botón de cerrar ('X')
    // Este es el listener crucial que estaba fallando.
    // Aseguramos que el listener se adjunta al elemento correcto.
    pkClose.addEventListener("click", () => {
      logDebug("setupPkOverlayListeners: Clic detectado en pkClose!") // Log para confirmar que el clic llega

      // Ocultar el overlay
      pkOverlay.style.display = "none"
      logDebug("setupPkOverlayListeners: Overlay de Parkinson cerrado (clic en X).")

      // Opcional: limpiar el src del iframe para detener su contenido y liberar recursos
      //
      try {
        pkFrame.src = "about:blank" // Carga una página en blanco
        logDebug("setupPkOverlayListeners: Iframe de Parkinson limpiado.")
      } catch (e) {
        console.error("setupPkOverlayListeners: Error al limpiar src del iframe:", e)
      }
    })
    logDebug("setupPkOverlayListeners: Listener de clic en pkClose configurado.")

    // Evento para manejar mensajes desde el iframe (cuando envía el resultado UPDRS o indicación de cerrar)
    // Esta lógica ya estaba bien, solo la integramos aquí.
    window.addEventListener("message", (event) => {
      // Por seguridad, si conoces el origen exacto del iframe, verifícalo:
      // if (event.origin !== "http://localhost:XXXX") { logDebug("Mensaje de origen desconocido:", event.origin); return; }

      // Verificar si el mensaje contiene los datos esperados
      if (event.data && event.data.type === "updrsText" && event.data.text !== undefined) {
        logDebug(
          'setupPkOverlayListeners: Mensaje "updrsText" recibido desde iframe:',
          event.data.text ? event.data.text.substring(0, 50) + "..." : "(Vacío)",
        )
        // Llamar a la función que maneja el resultado (inserta texto o cierra modal si está vacío)
        handleParkinsomResult(event.data.text)
      } else {
        // Loggear otros mensajes recibidos si DEBUG está activo, pueden ser de otras fuentes.
        logDebug("setupPkOverlayListeners: Mensaje recibido desde iframe con formato inesperado:", event.data)
      }
    })
    logDebug("setupPkOverlayListeners: Listener de mensajes del iframe configurado.")

    // Cerrar modal de Parkinson con tecla Escape (Ya manejado en initializeModals)
    // document.addEventListener('keydown', ... )
  }

  // Manejar texto recibido desde el iframe de Parkinson (integrado y mejorado)
  /**
   * Inserta el texto UPDRS recibido del iframe en el textarea de Examen Físico.
   * Si el texto es vacío, cierra el modal.
   * Se llama desde el listener de mensajes del iframe.
   * @param {string} text El texto de resultado de la escala UPDRS (puede ser vacío para cerrar).
   */
  function handleParkinsomResult(text) {
    logDebug(
      "handleParkinsomResult: Manejando resultado de Parkinson. Texto recibido:",
      text ? text.substring(0, 50) + "..." : "(Vacío)",
    )

    // Si no hay texto (por ejemplo, si se envió un mensaje vacío para cerrar)
    if (!text || text.trim() === "") {
      logDebug("handleParkinsomResult: Texto UPDRS recibido está vacío. Procediendo a cerrar modal.")
      // Cerrar el overlay si está abierto
      if (pkOverlay && pkOverlay.style.display === "flex") {
        pkOverlay.style.display = "none"
        logDebug("handleParkinsomResult: Overlay de Parkinson cerrado (texto vacío).")
        // Limpiar iframe al cerrar
        if (pkFrame) pkFrame.src = "about:blank"
      } else {
        logDebug("handleParkinsomResult: Overlay de Parkinson ya estaba cerrado o no encontrado.")
      }
      return // No hay texto para insertar
    }

    // Si hay texto, obtener el textarea de Examen Físico
    const fisicoTextarea = getTextArea("fisico") // Obtener el textarea de EF usando la helper

    if (fisicoTextarea) {
      // Insertar el texto. Añadir un separador si ya hay contenido existente.
      const currentText = fisicoTextarea.value
      // Añadir doble salto de línea si el texto actual no está vacío Y no termina ya en doble salto
      const separator = currentText.trim() !== "" && !currentText.endsWith("\n\n") ? "\n\n" : ""
      const newText = currentText + separator + text.trim() // Asegurarse de limpiar espacios del texto insertado

      fisicoTextarea.value = newText // Actualizar el valor del textarea

      // Disparar evento input para notificar cambios (importante para programar el guardado automático)
      fisicoTextarea.dispatchEvent(new Event("input", { bubbles: true }))

      // Cerrar overlay después de insertar
      if (pkOverlay && pkOverlay.style.display === "flex") {
        pkOverlay.style.display = "none"
        logDebug("handleParkinsomResult: Overlay de Parkinson cerrado (texto insertado).")
        // Limpiar iframe
        if (pkFrame) pkFrame.src = "about:blank"
      }

      // Mostrar feedback al usuario (opcional, puede ser molesto)
      // alert('Escala UPDRS agregada al examen físico');

      // Considerar usar un indicador temporal en la UI en lugar de alert
      const fisicoSection = getElement("content-fisico")?.closest(".section")
      const fisicoHeader = fisicoSection?.querySelector(".section-header")

      if (fisicoHeader) {
        // Buscar un indicador existente o crear uno temporal
        let feedbackSpan = fisicoHeader.querySelector(".temp-feedback")
        if (!feedbackSpan) {
          feedbackSpan = document.createElement("span")
          feedbackSpan.className = "temp-feedback" // Clase para identificarlo
          // Estilos básicos (pueden ir en CSS)
          feedbackSpan.style.cssText =
            "margin-left: 10px; color: green; font-size: 0.8em; opacity: 0; transition: opacity 0.3s ease-out;"
          fisicoHeader.appendChild(feedbackSpan)
        }
        feedbackSpan.textContent = "✓ UPDRS Agregado"
        feedbackSpan.style.color = "green"
        feedbackSpan.style.opacity = "1" // Hacer visible

        // Ocultar después de unos segundos
        setTimeout(() => {
          feedbackSpan.style.opacity = "0"
          // Remover el elemento después de la transición
          setTimeout(() => {
            if (feedbackSpan.parentNode) feedbackSpan.parentNode.removeChild(feedbackSpan)
          }, 300) // Coincidir con la duración de la transición opacity
        }, 3000) // Mostrar por 3 segundos
      }

      logDebug("handleParkinsomResult: Texto UPDRS insertado y guardado programado.")
    } else {
      console.error(
        "handleParkinsomResult: No se encontró el textarea del examen físico (id: ta-fisico) para insertar texto UPDRS.",
      )
      alert("Error interno: No se pudo insertar el resultado de la escala UPDRS.")
      // Cerrar modal incluso con error de inserción
      if (pkOverlay && pkOverlay.style.display === "flex") {
        pkOverlay.style.display = "none"
        pkFrame.src = "about:blank"
      }
    }
  }

  // Configurar hotkeys para usar Alt+número y actualizar UI (integrado y mejorado)
  /** Configura los hotkeys (Alt+Número) para abrir secciones. */
  function setupHotkeys() {
    logDebug("setupHotkeys: Configurando hotkeys (Alt+Número y Ctrl+S/B/D)...")
    // Actualizar indicaciones visuales de teclas rápidas en los headers de sección
    document.querySelectorAll(".section-header .hotkey").forEach((el) => {
      const text = el.textContent || ""
      // Asegurarse de que el texto visual sea (Alt+Número)
      const sectionHeader = el.closest(".section-header")
      const section = sectionHeader?.closest(".section")
      if (section && section.dataset.key) {
        const hIdx = SectionRenderOrder.indexOf(section.dataset.key) + 1
        if (hIdx > 0 && hIdx <= SectionRenderOrder.length) {
          el.textContent = `(Alt+${hIdx})`
        }
      } else {
        el.textContent = ""
      }
    })

    document.addEventListener("keydown", (e) => {
      // --- Atajos Alt+Número para alternar secciones ---
      if (e.altKey && !e.ctrlKey && !e.metaKey) {
        const sectionKeys = {
          1: "datos",
          2: "antecedentes",
          3: "medicacion",
          4: "evolucion",
          5: "fisico",
          6: "notas_libres",
          7: "demo_ia",
        }
        if (e.key in sectionKeys) {
          e.preventDefault() // Corrected: sectionKeys should map to "ingreso_manual" for Alt+7
          const targetSectionKey = sectionKeys[e.key]
          toggleSectionVisibility(targetSectionKey)
          logDebug(`setupHotkeys: Hotkey Alt+${e.key} activado para sección: ${targetSectionKey}`)
          const sectionElement = getElement(targetSectionKey)?.closest(".section")
          if (sectionElement) {
            const firstInput = sectionElement.querySelector(
              ".section-content input, .section-content textarea, .section-content select",
            )
            if (firstInput) {
              setTimeout(() => {
                firstInput.focus()
                logDebug(`setupHotkeys: Foco movido al primer input de la sección "${targetSectionKey}".`)
              }, 100)
            }
          }
        }
      }
      // --- Atajos Ctrl+S, Ctrl+B, Ctrl+D ---
      if (e.ctrlKey && !e.altKey && !e.metaKey) {
        // Ctrl+S: Guardar
        if (e.key.toLowerCase() === "s") {
          e.preventDefault()
          scheduleSaveAllData()
          // Mostrar feedback visual
          const currentBed = window.currentBedId || (window.bedSelector && window.bedSelector.value)
          const saveIndicator = currentBed ? getElement(`save-${currentBed}`) : null
          if (saveIndicator) {
            saveIndicator.classList.add("visible")
            setTimeout(() => saveIndicator.classList.remove("visible"), 1500)
          }
          logDebug("setupHotkeys: Ctrl+S - Guardado manual ejecutado.")
        }
        // Ctrl+B: Nueva cama
        if (e.key.toLowerCase() === "b") {
          e.preventDefault()
          addBed()
          alert("Nueva cama creada.")
          logDebug("setupHotkeys: Ctrl+B - Nueva cama creada.")
        }
        // Ctrl+D: Duplicar cama actual
        if (e.key.toLowerCase() === "d") {
          e.preventDefault()
          const currentBed = window.currentBedId || (window.bedSelector && window.bedSelector.value)
          if (currentBed) {
            addBed(currentBed)
            alert("Cama actual duplicada.")
            logDebug("setupHotkeys: Ctrl+D - Cama duplicada.")
          } else {
            alert("No hay cama seleccionada para duplicar.")
          }
        }
      }
    })
    logDebug("setupHotkeys: Listener de hotkeys configurado.")
  }

  /** Configura listeners globales para delegación de eventos y otros. */
  function setupGlobalEventListeners() {
    logDebug('setupGlobalEventListeners: Configurando listeners globales...')

    // --- Listener Principal para Delegación de Clics ---
    document.addEventListener("click", (e) => {
        // Manejar clic en botón de añadir cama
        if (e.target.id === "add-bed-btn") {
            e.preventDefault();
            e.stopPropagation();
            addBed();
            logDebug("setupGlobalEventListeners: Nueva cama añadida desde botón +");
            return;
        }

        // Manejar clic en botón de acciones flotante
        if (e.target.id === "actions-btn-floating") {
            e.preventDefault();
            e.stopPropagation();
            const actionsList = document.getElementById("actions-list");
            if (actionsList) {
                const isOpen = actionsList.style.display === "block" || window.getComputedStyle(actionsList).display === "block";
                if (!isOpen) {
                    // Cerrar otros menús primero
                    const scalesList = document.getElementById("scales-list");
                    if (scalesList) scalesList.style.display = "none";
                    actionsList.style.display = "block";
                    logDebug("setupGlobalEventListeners: Menú de acciones abierto");
                } else {
                    actionsList.style.display = "none";
                    logDebug("setupGlobalEventListeners: Menú de acciones cerrado");
                }
            }
            return;
        }

        // Manejar clic en elementos del menú de acciones
        if (e.target.matches('ul#actions-list li[data-action]')) {
            e.preventDefault();
            e.stopPropagation();
            const action = e.target.dataset.action;
            const flow = e.target.dataset.flow;
            // Cerrar el menú antes de ejecutar la acción
            const actionsList = document.getElementById("actions-list");
            if (actionsList) {
                actionsList.style.display = "none";
            }
            switch(action) {
                case 'downloadNote':
                    downloadNote();
                    break;
                case 'showIngresoManual':
                    const ingresoManualSection = document.querySelector('.section[data-key="ingreso_manual"]');
                    if (ingresoManualSection) {
                        ingresoManualSection.style.display = 'block';
                        logDebug("setupGlobalEventListeners: Sección de ingreso manual mostrada");
                    }
                    break;
                case 'runAI':
                    if (flow) {
                        runAI(flow);
                        logDebug(`setupGlobalEventListeners: Ejecutando flujo de IA: ${flow}`);
                    }
                    break;
            }
            return;
        }

        // NUEVO: Manejar clic en headers de sección para alternar visibilidad
        if (e.target.closest('[data-action="toggle-section"]')) {
            e.preventDefault();
            e.stopPropagation();
            const header = e.target.closest('[data-action="toggle-section"]');
            const key = header.dataset.key;
            if (key) {
                toggleSectionVisibility(key);
            }
            return;
        }

        // Cerrar menús al hacer clic fuera SOLO si el clic no es sobre el botón ni el menú
        if (
            !e.target.closest(".floating-button-container") &&
            !e.target.closest("ul.menu")
        ) {
            const actionsList = document.getElementById("actions-list");
            const scalesList = document.getElementById("scales-list");
            if (actionsList) actionsList.style.display = "none";
            if (scalesList) scalesList.style.display = "none";
        }
    });
    
    // ... resto del código existente ...
  }

  // Let's also add a function to explicitly show the Demo IA section
  // Add this function after the openSection function (around line 1600):

  window.showIngresoManual = () => {
    console.log("Mostrando sección Ingreso manual")

    // Obtener referencias a los elementos
    const ingresoManualContainer = document.querySelector('[data-key="ingreso_manual"]')
    const ingresoManualContent = document.getElementById("content-ingreso_manual")

    if (ingresoManualContainer && ingresoManualContent) {
      // Asegurar que el contenedor esté visible
      ingresoManualContainer.style.display = "block"

      // Abrir la sección si está cerrada
      if (!ingresoManualContent.classList.contains("active")) {
        toggleSectionVisibility("ingreso_manual")
      }

      // Hacer scroll a la sección
      ingresoManualContainer.scrollIntoView({ behavior: "smooth" })

      // Resaltar brevemente la sección
      ingresoManualContainer.style.transition = "background-color 0.3s ease"
      ingresoManualContainer.style.backgroundColor = "rgba(76, 175, 80, 0.1)"
      setTimeout(() => {
        ingresoManualContainer.style.backgroundColor = ""
      }, 1000)
    } else {
      console.warn("No se encontró la sección Ingreso manual")
    }
  }

  /* ══════════ Inicialización de la Aplicación ══════════ */

  // 1. INICIALIZACIÓN PRINCIPAL
  /** Inicializa el modal de selección de versión */
  function initializeVersionModal() {
    const modal = getElement("version-splash");
    const simpleBtn = getElement("version-simple");
    const complexBtn = getElement("version-compleja");
    const cancelBtn = getElement("version-cancel");

    if (!modal || !simpleBtn || !complexBtn || !cancelBtn) {
        logDebug("initializeVersionModal: Elementos del modal no encontrados");
        return;
    }

    // Asegurar que el modal sea visible
    modal.style.display = "flex";

    function closeModal() {
        modal.style.display = "none";
        logDebug("initializeVersionModal: Modal cerrado");
    }

    simpleBtn.onclick = () => {
        logDebug("initializeVersionModal: Versión simple seleccionada");
        closeModal();
        renderSimpleVersionUI();
    };

    complexBtn.onclick = () => {
        logDebug("initializeVersionModal: Versión compleja seleccionada");
        closeModal();
        renderVersionUI('compleja');
    };

    cancelBtn.onclick = closeModal;

    // Cerrar al hacer clic fuera del modal
    modal.onclick = (e) => {
        if (e.target === modal) {
            closeModal();
        }
    };

    logDebug("initializeVersionModal: Modal de versión inicializado");
  }

  // Función para renderizar la UI según la versión seleccionada
  function renderVersionUI(version, options = {}) {
    logDebug(`renderVersionUI: Iniciada con versión: ${version}`);

    // Cerrar cualquier modal de versión que esté abierto
    const versionModal = document.getElementById("version-splash");
    if (versionModal) {
      versionModal.style.display = "none";
    }

    // Guardar la versión seleccionada
    StorageManager.setItem(StorageManager.KEYS.SELECTED_VERSION, version);
    logDebug(`renderVersionUI: Versión seleccionada guardada: ${version}`);

    // Cargar preferencia de AI
    const aiEnabled = localStorage.getItem("aiEnabled") === "true";
    window.AppState.aiEnabled = aiEnabled;
    logDebug(`renderVersionUI: AI preference loaded: ${aiEnabled}`);

    const app = document.getElementById("app");
    if (!app) {
        console.error("renderVersionUI: Elemento #app no encontrado.");
        return;
    }

    // Limpiar el contenido actual de #app
    app.innerHTML = "";

    if (version === "simple") {
      logDebug("renderVersionUI: Renderizando versión simple.");
        renderSimpleVersionUI();
    } else {
      logDebug("renderVersionUI: Renderizando versión compleja.");

        // Renderizar la estructura principal
      renderAppStructure();
      logDebug('renderVersionUI: Estructura base renderizada');

        // Renderizar el selector de camas DESPUÉS de que la estructura esté lista
        // renderBedChips();
        populateBedSelector(); 
        logDebug('renderVersionUI: Selector de camas populado');

        // Renderizar menús flotantes DESPUÉS de populateBedSelector
        renderFloatingMenus();
        logDebug('renderVersionUI: Menús flotantes renderizados');

        // Configurar listeners y funcionalidades
        setupGlobalEventListeners();
        setupHotkeys();
        initializeModals();
        setupApiModalListeners();
        setupOcrInputListeners();
        setupPkOverlayListeners(); // Para la escala de Parkinson
        Logger.debug('Listeners globales configurados.');

        // NOTA: El listener para add-bed-btn ahora se maneja en setupGlobalEventListeners
        // usando delegación de eventos, por lo que este código está comentado para evitar duplicación
        /*
        // Añadir listener para el botón de añadir cama
        const addBedButton = getElement('add-bed-btn');
        if (addBedButton) {
            addBedButton.addEventListener('click', () => {
                addBed();
                // Considerar un feedback menos intrusivo que alert, quizás un Logger.info o una notificación sutil.
                // alert("Nueva cama creada."); // Ya existe un alert en la función de hotkeys, y addBed maneja su propia lógica de UI.
            });
            Logger.debug('Listener para add-bed-btn configurado.');
        } else {
            Logger.warn('Botón add-bed-btn no encontrado para añadir listener.');
        }
        */

        // Si renderVersionUI no fue llamada por initializeVersionModal, y tenemos una cama,
        // asegurar que sus datos se muestren.
        // renderVersionUI ahora se encarga de llamar a loadBedDataIntoUI si es necesario.

        window.AppState.initialized = true;
        Logger.info('Aplicación inicializada correctamente.');

        EventManager.emit('appInitialized', { success: true });

    } catch (error) {
        Logger.error('Error en inicialización de la aplicación', error);
        EventManager.emit('appInitialized', { success: false, error });
        alert('Error al inicializar la aplicación. Por favor, recarga la página.');
    }
  }

  /** Inicia la aplicación: carga datos, renderiza UI, configura listeners. */
  async function initializeApp() {
    Logger.info('Iniciando aplicación...');
    
    try {
        if (!window.AppState) {
            window.AppState = {
                beds: {},
                currentBedId: null,
                version: null, // Puede ser 'simple' o 'compleja'
                aiEnabled: false,
                initialized: false
            };
            Logger.debug('Estado global AppState inicializado por primera vez.');
        }

        await loadMedicationsJson();
        Logger.info('Datos de medicamentos cargados.');

        // Cargar datos de camas del Storage. Esto también setea un currentBedId si hay camas.
        const bedsLoadedFromStorage = StorageManager.loadAllBedData();
        Logger.info('Resultado de carga de camas desde StorageManager', { bedsLoadedFromStorage });

        // Asegurar que haya al menos una cama y que currentBedId esté seteado
        // ensureAtLeastOneBed ahora es más robusto y crea/setea si es necesario.
        ensureAtLeastOneBed(); 
        Logger.info('Estado de camas asegurado (al menos una existe y currentBedId está seteado)', { currentBedId: window.AppState.currentBedId, beds: window.AppState.beds });

        // Renderizar la UI basada en la versión guardada o por defecto 'compleja'
        // Nota: initializeVersionModal puede cambiar la versión y llamar a renderVersionUI
        const storedVersion = StorageManager.getItem('selectedVersion');
        if (storedVersion) {
            Logger.info(`Versión encontrada en Storage: ${storedVersion}. Renderizando.`);
            renderVersionUI(storedVersion); 
        } else {
            Logger.info('No hay versión en Storage. Inicializando modal de versión.');
            initializeVersionModal(); // Esto eventualmente llamará a renderVersionUI
        }
        
        // Listeners globales (algunos podrían ser inicializados dentro de renderVersionUI si son específicos de la versión)
        // Pero hotkeys, modals generales, etc., pueden ir aquí si son comunes.
        setupGlobalEventListeners();
        setupHotkeys();
        initializeModals(); 
        setupApiModalListeners();
        setupOcrInputListeners();
        setupPkOverlayListeners(); // Para la escala de Parkinson
        Logger.debug('Listeners globales configurados.');

        // NOTA: El listener para add-bed-btn ahora se maneja en setupGlobalEventListeners
        // usando delegación de eventos, por lo que este código está comentado para evitar duplicación
        /*
        // Añadir listener para el botón de añadir cama
        const addBedButton = getElement('add-bed-btn');
        if (addBedButton) {
            addBedButton.addEventListener('click', () => {
                addBed();
                // Considerar un feedback menos intrusivo que alert, quizás un Logger.info o una notificación sutil.
                // alert("Nueva cama creada."); // Ya existe un alert en la función de hotkeys, y addBed maneja su propia lógica de UI.
            });
            Logger.debug('Listener para add-bed-btn configurado.');
        } else {
            Logger.warn('Botón add-bed-btn no encontrado para añadir listener.');
        }
        */

        // Si renderVersionUI no fue llamada por initializeVersionModal, y tenemos una cama,
        // asegurar que sus datos se muestren.
        // renderVersionUI ahora se encarga de llamar a loadBedDataIntoUI si es necesario.

        window.AppState.initialized = true;
        Logger.info('Aplicación inicializada correctamente.');

        EventManager.emit('appInitialized', { success: true });

    } catch (error) {
        Logger.error('Error en inicialización de la aplicación', error);
        EventManager.emit('appInitialized', { success: false, error });
        alert('Error al inicializar la aplicación. Por favor, recarga la página.');
    }
  }

  // Función para procesar archivos OCR
  const processOCRFile = (file, bedId) => {
    if (State.processingOCR) {
        window.ErrorUI?.showError?.("Ya hay un archivo siendo procesado. Por favor espere.")
        return Promise.reject(new Error("Procesamiento en curso"))
    }

    if (!file) return Promise.reject(new Error("No se proporcionó archivo"))

    // Validar tipo y tamaño del archivo
    if (!AppConfig.ocrConfig.supportedTypes.includes(file.type)) {
        window.ErrorUI?.showError?.("Tipo de archivo no soportado. Use JPG, PNG o PDF.")
        return Promise.reject(new Error("Tipo de archivo no soportado"))
    }

    if (file.size > AppConfig.ocrConfig.maxFileSize) {
        window.ErrorUI?.showError?.("El archivo es demasiado grande. Máximo 10MB.")
        return Promise.reject(new Error("Archivo demasiado grande"))
    }

    State.processingOCR = true
    const loadingOverlay = document.getElementById('loading-overlay')
    if (loadingOverlay) loadingOverlay.style.display = 'flex'

    // Mostrar mensaje de progreso
    const progressMessage = window.ErrorUI?.showInfo?.("Procesando archivo...", 0)

    // Si es PDF, convertirlo a imagen primero
    if (file.type === 'application/pdf') {
        return readFileAsArrayBuffer(file)
            .then(arrayBuffer => processPDF(arrayBuffer))
            .then(text => {
                const textarea = document.getElementById(`ta-notas_libres-${bedId}`)
                if (textarea) {
                    textarea.value = text
                    window.ErrorUI?.showSuccess?.("Texto extraído exitosamente del PDF", 3000)
                }
                return text
            })
            .catch(error => {
                console.error('Error procesando PDF:', error)
                window.ErrorUI?.showError?.(`Error procesando PDF: ${error.message}`)
                throw error
            })
            .finally(() => {
                State.processingOCR = false
                if (loadingOverlay) loadingOverlay.style.display = 'none'
                if (progressMessage) window.ErrorUI?.removeMessage?.(progressMessage)
            })
    }

    // Para imágenes, usar Tesseract.js
    return Tesseract.recognize(file, 'spa', {
        logger: m => {
            if (m.status === 'recognizing text') {
                window.ErrorUI?.showInfo?.(`Procesando: ${Math.round(m.progress * 100)}%`, 0)
            }
        }
    })
    .then(result => {
        console.log('Texto extraído:', result.data.text)
        const textarea = document.getElementById(`ta-notas_libres-${bedId}`)
        if (textarea) {
            textarea.value = result.data.text
            window.ErrorUI?.showSuccess?.("Texto extraído exitosamente", 3000)
        } else {
            throw new Error("No se encontró el campo de texto para insertar el resultado")
        }
        return result.data.text
    })
    .catch(error => {
        console.error('Error procesando archivo OCR:', error)
        window.ErrorUI?.showError?.(`Error procesando archivo: ${error.message}`)
        throw error
    })
    .finally(() => {
        State.processingOCR = false
        if (loadingOverlay) loadingOverlay.style.display = 'none'
        if (progressMessage) window.ErrorUI?.removeMessage?.(progressMessage)
    })
  }

  // Exponer la función para verificar si la app está inicializada
  window.isAppInitialized = () => isAppInitialized

  // --- Ejecutar la inicialización cuando el DOM esté completamente cargado ---
  document.addEventListener("DOMContentLoaded", () => {
      logDebug("DOMContentLoaded: El DOM está listo. Ejecutando initializeApp().")
      initializeApp()
  })

  // Escuchar mensajes de las escalas
  window.addEventListener("message", (event) => {
      if (event.data && typeof event.data === "object") {
          switch (event.data.type) {
              case "updrsText":
                  handleParkinsomResult(event.data.text)
                  break
              case "miasteniaText":
                  handleMiasteniaResult(event.data.text)
                  break
              case "nihssText":
                  handleNihssResult(event.data.text)
                  break
              case "espasticidadText":
                  handleEspasticidadResult(event.data.text)
                  break
              case "closeNihssScale":
              case "closeEspasticidadScale":
                  if (pkOverlay) {
                      pkOverlay.style.display = "none"
                      if (pkFrame) pkFrame.src = "about:blank"
                  }
                  break
              case "aspectsScaleText":
                  handleAspectsResult(event.data.text)
                  break
          }
      }
  })

  // Funciones auxiliares para OCR
  const readFileAsArrayBuffer = (file) => {
      return new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.onerror = reject
          reader.readAsArrayBuffer(file)
      })
  }

  const readFileAsDataURL = (file) => {
      return new Promise((resolve, reject) => {
          const reader = new FileReader()
          reader.onload = () => resolve(reader.result)
          reader.onerror = reject
          reader.readAsDataURL(file)
      })
  }

  const processPDF = (arrayBuffer) => {
      return window.pdfjsLib.getDocument({ data: arrayBuffer }).promise
          .then(pdf => {
              const pagePromises = []
              for (let i = 1; i <= pdf.numPages; i++) {
                  pagePromises.push(
                      pdf.getPage(i)
                          .then(page => page.getTextContent())
                          .then(content => content.items.map(item => item.str).join(' '))
                  )
              }
              return Promise.all(pagePromises)
          })
          .then(pages => pages.join('\n\n'))
  }

  const processImage = (file) => {
      const formData = new FormData()
      formData.append('file', file)
      return fetch('/api/ocr', {
          method: 'POST',
          body: formData
      })
      .then(response => {
          if (!response.ok) {
              throw new Error(`Error en la respuesta del servidor: ${response.status}`)
          }
          return response.json()
      })
      .then(result => {
          if (result.error) {
              throw new Error(result.error)
          }
          return result.text
      })
  }

  // Exponer la función para verificar si la app está inicializada
  window.isAppInitialized = () => isAppInitialized;

  /* ══════════ Nuevas Funciones para Carga de Medicamentos ══════════ */

     /** Carga la lista de medicamentos desde la variable global MEDICATIONS_DATA. */
     async function loadMedicationsJson() {
      logDebug("loadMedicationsJson: Cargando lista de medicamentos desde la variable global...");
      
      try {
        // Verificar que MEDICATIONS_DATA existe
        if (typeof window.MEDICATIONS_DATA === 'undefined') {
          throw new Error("MEDICATIONS_DATA no está definida");
        }

        const data = window.MEDICATIONS_DATA;
        if (!Array.isArray(data)) {
          throw new Error("MEDICATIONS_DATA no es un array");
        }

        // Asegurarnos de que State.medicationsList sea un array
        State.medicationsList = Array.isArray(data[0]) ? data[0] : data;
        
        // Verificar que tenemos medicamentos
        if (State.medicationsList.length === 0) {
          throw new Error("No se encontraron medicamentos en MEDICATIONS_DATA");
        }

        logDebug(`loadMedicationsJson: ${State.medicationsList.length} medicamentos cargados exitosamente.`);
        return true;
      } catch (e) {
        console.error("loadMedicationsJson: Error cargando medicamentos:", e);
        State.medicationsList = []; // Asegurar que sea un array vacío en caso de error
        return false;
      }
    }

  // Modificar initializeApp para manejar mejor la carga de medicamentos
  async function initializeApp() {
    if (isAppInitialized) {
      logDebug("initializeApp: La aplicación ya está inicializada.");
      return;
    }

    logDebug("initializeApp: Iniciando aplicación...");
    
    try {
      // Cargar medicamentos al inicio
      const medicationsLoaded = await loadMedicationsJson();
      if (!medicationsLoaded) {
        console.error("initializeApp: Error cargando medicamentos. La aplicación puede no funcionar correctamente.");
      }
      logDebug("initializeApp: Medicamentos cargados.");
      
      // Limpiar cualquier versión almacenada
      StorageManager.removeItem(StorageManager.KEYS.SELECTED_VERSION);
      
      // Inicializar el modal de versión
      initializeVersionModal();
      
      // ... resto del código de inicialización ...
    } catch (e) {
      console.error("initializeApp: Error durante la inicialización:", e);
    }
  }

  // Asegurarnos de que la sección de medicamentos se renderice correctamente
  function makeMedicationSection() {
    logDebug("makeMedicationSection: Creando sección de medicamentos...");
    
    const section = document.createElement("div");
    section.className = "section";
    section.id = "medicacion";
    section.setAttribute("data-key", "medicacion");

    // Verificar que tenemos medicamentos cargados
    if (!Array.isArray(State.medicationsList) || State.medicationsList.length === 0) {
      logDebug("makeMedicationSection: No hay medicamentos cargados, usando lista por defecto.");
      State.medicationsList = AppConfig.medications;
    }

    section.innerHTML = `
      <div class="section-header" data-action="toggle-section" data-key="medicacion">
        <h2>Medicación</h2>
      </div>
      <div id="content-medicacion" class="section-content" style="display: none;">
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

    // Configurar listeners después de crear la sección
    setTimeout(() => {
      setupMedicationListeners();
    }, 0);

    return section;
  }

  // --- Listeners para modal de API Key ---
  function setupApiModalListeners() {
    logDebug("setupApiModalListeners: Configurando listeners del modal de API Key.")
    const apiBtn = document.getElementById("api-btn")
    const apiModal = document.getElementById("api-modal")
    const apiBox = document.getElementById("api-box")
    const apiInput = document.getElementById("api-input")
    const apiSave = document.getElementById("api-save")
    const apiCancel = document.getElementById("api-cancel")

    if (!apiBtn || !apiModal || !apiBox || !apiInput || !apiSave || !apiCancel) {
        logDebug("setupApiModalListeners: Elementos del modal de API Key no encontrados.")
        return;
    }

    // Cargar clave guardada al inicio
    const savedKey = StorageManager.getItem(StorageManager.KEYS.API_KEY)
    if (savedKey) {
        apiInput.value = savedKey
        apiBtn.classList.add("saved") // Indicador visual si hay una clave guardada
    } else {
        apiInput.value = "" // Asegurar que esté vacío si no hay clave
        apiBtn.classList.remove("saved")
    }

    // Abrir modal al hacer clic en el botón de API Key
    apiBtn.addEventListener("click", (e) => {
        e.stopPropagation() // Evitar que el clic cierre los menús flotantes
        closeAllMenus() // Cerrar otros menús antes de abrir el modal
        apiModal.style.display = "flex" // Mostrar modal
        apiInput.focus() // Enfocar el input de la API Key
        logDebug("setupApiModalListeners: Modal de API Key abierto.")
    })

    // Guardar clave al hacer clic en Guardar
    apiSave.addEventListener("click", () => {
        const key = apiInput.value.trim()
        if (key) {
            StorageManager.setItem(StorageManager.KEYS.API_KEY, key)
            apiBtn.classList.add("saved") // Indicar que se guardó
            logDebug("setupApiModalListeners: API Key guardada.")
        } else {
            StorageManager.removeItem(StorageManager.KEYS.API_KEY) // Eliminar si el input está vacío
            apiBtn.classList.remove("saved") // Remover indicador visual
            logDebug("setupApiModalListeners: API Key eliminada.")
        }
        apiModal.style.display = "none" // Cerrar modal después de guardar
    })

    // Cancelar y cerrar modal
    apiCancel.addEventListener("click", () => {
        apiModal.style.display = "none" // Cerrar modal
        // Restaurar el valor del input al último guardado al cancelar
        apiInput.value = StorageManager.getItem(StorageManager.KEYS.API_KEY) || ""
        logDebug("setupApiModalListeners: Modal de API Key cancelado.")
    })

    // Guardar al presionar Enter en el input del modal de API Key
    apiInput.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault() // Prevenir comportamiento por defecto (ej: submit form)
            apiSave.click() // Simular clic en Guardar
        }
    })

    // Cerrar modal de API Key haciendo clic fuera del contenido (Ya manejado en initializeModals)
    // apiModal.addEventListener('click', ...)
}

// --- Listeners para input de archivo OCR ---
function setupOcrInputListeners() {
    logDebug("setupOcrInputListeners: Configurando listeners para input de archivo OCR.")
    
    // Listener para el botón de OCR (usando delegación de eventos)
    document.addEventListener('click', (e) => {
      if (e.target.closest('[id^="ocr-upload-btn-"]')) {
        const btn = e.target.closest('[id^="ocr-upload-btn-"]')
        const bedId = btn.id.split('-').pop()
        const fileInput = document.getElementById(`ocr-file-input-${bedId}`)
        if (fileInput) fileInput.click()
        logDebug(`setupOcrInputListeners: Botón de subir archivo OCR clickeado para cama ${bedId}.`)
      }
    })

    // Listener para cuando se selecciona un archivo en el input de archivo OCR
    document.addEventListener('change', (e) => {
      if (e.target.matches('[id^="ocr-file-input-"]')) {
        const fileInput = e.target
        const bedId = fileInput.id.split('-').pop()
        const file = fileInput.files[0]
        if (file) {
          logDebug(`setupOcrInputListeners: Archivo seleccionado para OCR para cama ${bedId}: ${file.name}.`)
          processOCRFile(file, bedId)
        } else {
          logDebug(`setupOcrInputListeners: Selección de archivo cancelada para cama ${bedId}.`)
        }
        // Limpiar el input para permitir seleccionar el mismo archivo nuevamente
        fileInput.value = ""
      }
    })
  }

  /* ══════════ Módulo de Almacenamiento ══════════ */
  const StorageManager = {
    // Claves de almacenamiento
    KEYS: {
      ALL_BEDS: "medNotesMultiBedData_v7",
      API_KEY: "openai_api_key",
      AI_ENABLED: "aiEnabled",
      SELECTED_VERSION: "selectedVersion"
    },

    // Configuración
    config: {
      saveDelay: 1200, // ms
      maxRetries: 3
    },

    // Estado interno
    _state: {
      saveTimeout: null,
      saveInProgress: false,
      lastSaveTime: null
    },

    /**
     * Guarda un valor en localStorage con manejo de errores
     * @param {string} key - Clave de almacenamiento
     * @param {any} value - Valor a guardar
     * @returns {boolean} - true si se guardó exitosamente
     */
    setItem(key, value) {
      try {
        // Para valores simples, guardarlos directamente
        if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
          localStorage.setItem(key, value.toString());
        } else {
          // Para objetos y arrays, serializar como JSON
          const serializedValue = JSON.stringify(value);
          localStorage.setItem(key, serializedValue);
        }
        this._state.lastSaveTime = Date.now();
        logDebug(`StorageManager: Guardado exitoso para ${key}`);
        return true;
      } catch (e) {
        console.error(`StorageManager: Error guardando ${key}:`, e);
        return false;
      }
    },

    /**
     * Obtiene un valor de localStorage con manejo de errores
     * @param {string} key - Clave de almacenamiento
     * @param {any} defaultValue - Valor por defecto si no existe
     * @returns {any} - Valor recuperado o valor por defecto
     */
    getItem(key, defaultValue = null) {
      try {
        const value = localStorage.getItem(key);
        if (value === null) return defaultValue;

        // Intentar parsear como JSON primero
        try {
          return JSON.parse(value);
        } catch (e) {
          // Si falla el parseo JSON, devolver el valor como string
          return value;
        }
      } catch (e) {
        console.error(`StorageManager: Error recuperando ${key}:`, e);
        return defaultValue;
      }
    },

    /**
     * Elimina un valor de localStorage
     * @param {string} key - Clave de almacenamiento
     */
    removeItem(key) {
      try {
        localStorage.removeItem(key);
        logDebug(`StorageManager: Eliminado ${key}`);
      } catch (e) {
        console.error(`StorageManager: Error eliminando ${key}:`, e);
      }
    },

    /**
     * Muestra el indicador visual de guardado
     * @private
     */
    _showSaveIndicator() {
        try {
            const currentBedId = State.currentBedId;
            if (!currentBedId) {
                Logger.debug('No hay cama actual para mostrar indicador de guardado');
                return;
            }

            // Crear el indicador si no existe
            let saveIndicator = document.getElementById(`save-${currentBedId}`);
            if (!saveIndicator) {
                saveIndicator = document.createElement('div');
                saveIndicator.id = `save-${currentBedId}`;
                saveIndicator.className = 'save-indicator';
                saveIndicator.style.cssText = `
                    position: fixed;
                    top: 10px;
                    right: 10px;
                    background: #4CAF50;
                    color: white;
                    padding: 8px 16px;
                    border-radius: 4px;
                    display: none;
                    z-index: 9999;
                `;
                document.body.appendChild(saveIndicator);
            }

            saveIndicator.textContent = 'Guardado';
            saveIndicator.style.display = 'block';
            
            setTimeout(() => {
                saveIndicator.style.display = 'none';
            }, 2000);
        } catch (error) {
            Logger.error('Error al mostrar indicador de guardado', error);
        }
    },

    /**
     * Muestra un indicador de error
     * @private
     */
    _showErrorIndicator(message = "Error!") {
        try {
            const errorIndicator = document.createElement('div');
            errorIndicator.className = 'error-indicator';
            errorIndicator.style.cssText = `
                position: fixed;
                top: 10px;
                right: 10px;
                background: #f44336;
                color: white;
                padding: 8px 16px;
                border-radius: 4px;
                z-index: 9999;
            `;
            errorIndicator.textContent = message;
            document.body.appendChild(errorIndicator);
            
            setTimeout(() => {
                errorIndicator.remove();
            }, 3000);
        } catch (error) {
            Logger.error('Error al mostrar indicador de error', error);
        }
    },

    /**
     * Programa el guardado de datos con debounce
     */
    scheduleSave() {
      if (this._state.saveTimeout) {
        clearTimeout(this._state.saveTimeout);
      }

      this._state.saveTimeout = setTimeout(() => {
        saveUIToCurrentBedData(); // Asegurar que los datos de la UI están actualizados
        this.saveAllBedData();
      }, this.config.saveDelay);
    },

    /**
     * Guarda todos los datos de las camas
     */
    saveAllBedData() {
      if (this._state.saveInProgress) {
        logDebug("StorageManager: Ya hay un guardado en progreso");
        return;
      }

      if (!State.beds || Object.keys(State.beds).length === 0) {
        logDebug("StorageManager: No hay datos para guardar");
        return;
      }

      this._state.saveInProgress = true;

      try {
        const success = this.setItem(this.KEYS.ALL_BEDS, State.beds);
        if (success) {
          logDebug("StorageManager: Datos guardados exitosamente");
          this._showSaveIndicator();
        }
      } catch (e) {
        console.error("StorageManager: Error guardando datos:", e);
        if (e.name === "QuotaExceededError") {
          alert("Error de almacenamiento: No hay suficiente espacio para guardar los datos.\nConsidera limpiar datos antiguos o descargar notas.");
        } else {
          alert("Error al guardar los datos.");
        }
        this._showErrorIndicator();
      } finally {
        this._state.saveInProgress = false;
      }
    },

    /**
     * Carga todos los datos de las camas
     * @returns {boolean} - true si se cargaron exitosamente
     */
    loadAllBedData() {
      logDebug("StorageManager: Cargando datos...");
      
      try {
        const data = this.getItem(this.KEYS.ALL_BEDS, {});
        
        if (!data || Object.keys(data).length === 0) {
          logDebug("StorageManager: No hay datos guardados, creando cama por defecto");
          this._createDefaultBed();
          return true;
        }

        // Procesar y validar datos
        Object.entries(data).forEach(([bedId, bedData]) => {
          if (!bedData.meds) {
            bedData.meds = [];
          }
          State.beds[bedId] = bedData;
        });

        // Establecer cama actual
        if (!State.currentBedId || !State.beds[State.currentBedId]) {
          State.currentBedId = Object.keys(State.beds)[0];
        }

        logDebug(`StorageManager: Datos cargados. Total camas: ${Object.keys(State.beds).length}`);
        return true;
      } catch (e) {
        console.error("StorageManager: Error cargando datos:", e);
        this.removeItem(this.KEYS.ALL_BEDS);
        this._createDefaultBed();
        return false;
      }
    },

    /**
     * Crea una cama por defecto
     * @private
     */
    _createDefaultBed() {
      const defaultBedId = "1";
      State.beds = {
        [defaultBedId]: {
          datos: {},
          antecedentes: {},
          evolucion: {},
          fisico: '',
          notas_libres: '',
          ingreso_manual: '',
          meds: [],
          structured: {},
          text: {}
        }
      };
      State.currentBedId = defaultBedId;
      this.saveAllBedData();
    }
  };

  // --- PARCHE RÁPIDO: Delegación de eventos para botones flotantes ---
  document.addEventListener("click", function (e) {
    // Botón de acciones flotante
    if (e.target && e.target.id === "actions-btn-floating") {
      const actionsList = document.getElementById("actions-list");
      if (actionsList) {
        actionsList.style.display = actionsList.style.display === "none" ? "block" : "none";
        // Cerrar otros menús si están abiertos
        const scalesList = document.getElementById("scales-list");
        if (scalesList) scalesList.style.display = "none";
      }
      return;
    }
    // Botón de escalas flotante
    if (e.target && e.target.id === "scales-btn-floating") {
      const scalesList = document.getElementById("scales-list");
      if (scalesList) {
        scalesList.style.display = scalesList.style.display === "none" ? "block" : "none";
        // Cerrar otros menús si están abiertos
        const actionsList = document.getElementById("actions-list");
        if (actionsList) actionsList.style.display = "none";
      }
      return;
    }
    // Botón de copiar flotante
    if (e.target && e.target.id === "copy-btn-floating") {
      buildNote();
      const previewNoteModal = document.getElementById("previewNoteModal");
      if (previewNoteModal) {
        previewNoteModal.style.display = "flex";
      }
      return;
    }
  });

  // --- PARCHE RÁPIDO: Botón temporal para recargar la interfaz ---
  if (!window.__reloadBtnAdded) {
    window.__reloadBtnAdded = true;
    const btn = document.createElement('button');
    btn.textContent = 'Recargar Interfaz (Parche)';
    btn.style.position = 'fixed';
    btn.style.bottom = '10px';
    btn.style.right = '10px';
    btn.style.zIndex = 99999;
    btn.style.background = '#1976d2';
    btn.style.color = 'white';
    btn.style.padding = '10px 18px';
    btn.style.border = 'none';
    btn.style.borderRadius = '6px';
    btn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
    btn.style.fontSize = '1.1em';
    btn.style.cursor = 'pointer';
    btn.onclick = function() {
      if (typeof window.renderVersionUI === 'function') {
        window.renderVersionUI('compleja');
      } else {
        location.reload();
      }
    };
    document.body.appendChild(btn);
  }

  // Función para forzar la recarga completa
  function forceReload() {
      // Limpiar almacenamiento local
      localStorage.clear();
      // Forzar recarga de la interfaz
      renderVersionUI('compleja');
  }

  // Añadir botón de recarga forzada
  if (!window.__reloadBtnAdded) {
      window.__reloadBtnAdded = true;
      const btn = document.createElement('button');
      btn.textContent = 'Recargar Interfaz (Forzado)';
      btn.style.position = 'fixed';
      btn.style.bottom = '10px';
      btn.style.right = '10px';
      btn.style.zIndex = 99999;
      btn.style.background = '#d32f2f';
      btn.style.color = 'white';
      btn.style.padding = '10px 18px';
      btn.style.border = 'none';
      btn.style.borderRadius = '6px';
      btn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
      btn.style.fontSize = '1.1em';
      btn.style.cursor = 'pointer';
      btn.onclick = forceReload;
      document.body.appendChild(btn);
  }

  // Función para forzar la creación de una cama y establecer su ID
  function forceCreateBed() {
      // Limpiar almacenamiento local
      localStorage.clear();
      
      // Crear una nueva cama con ID "1"
      const newBedId = "1";
      State.beds = {};
      State.beds[newBedId] = {
          meds: [],
          data: {}
      };
      State.currentBedId = newBedId;
      
      // Guardar el estado
      StorageManager.saveAllBedData();
      
      // Recargar la interfaz
      renderVersionUI('compleja');
  }

  // Añadir botón de recarga forzada
  if (!window.__reloadBtnAdded) {
      window.__reloadBtnAdded = true;
      const btn = document.createElement('button');
      btn.textContent = 'Forzar Creación de Cama';
      btn.style.position = 'fixed';
      btn.style.bottom = '10px';
      btn.style.right = '10px';
      btn.style.zIndex = 99999;
      btn.style.background = '#d32f2f';
      btn.style.color = 'white';
      btn.style.padding = '10px 18px';
      btn.style.border = 'none';
      btn.style.borderRadius = '6px';
      btn.style.boxShadow = '0 2px 8px rgba(0,0,0,0.15)';
      btn.style.fontSize = '1.1em';
      btn.style.cursor = 'pointer';
      btn.onclick = forceCreateBed;
      document.body.appendChild(btn);
  }

  // LIMPIEZA INTEGRAL AL INICIAR
  if (window.localStorage) {
    localStorage.clear();
  }

  // Asegurar que siempre haya al menos una cama creada
  function ensureAtLeastOneBed() {
    Logger.info('Verificando existencia de camas');
    
    try {
        // Inicializar estado global si no existe
        if (!window.AppState) {
            window.AppState = {
                beds: {},
                currentBedId: null,
                version: null,
                aiEnabled: false,
                initialized: false
            };
            Logger.debug('Estado global inicializado');
        }

        // Verificar si hay camas
        if (!window.AppState.beds || Object.keys(window.AppState.beds).length === 0) {
            Logger.info('No hay camas, creando cama por defecto');
            
            // Crear cama por defecto
            const defaultBedId = '1';
            window.AppState.beds = {
                [defaultBedId]: {
                    meds: [],
                    structured: {},
                    text: {}
                }
            };
            
            // Establecer como cama actual
            window.AppState.currentBedId = defaultBedId;
            
            // Guardar estado
            StorageManager.saveAllBedData();
            Logger.info('Cama por defecto creada y guardada');
        }

        // Asegurar que hay una cama actual seleccionada
        if (!window.AppState.currentBedId || !window.AppState.beds[window.AppState.currentBedId]) {
            window.AppState.currentBedId = Object.keys(window.AppState.beds)[0];
            Logger.debug('Cama actual actualizada', { currentBedId: window.AppState.currentBedId });
        }

        return true;
    } catch (error) {
        Logger.error('Error al asegurar existencia de camas', error);
        return false;
    }
  }

  // Llamar al inicio
  ensureAtLeastOneBed();

  function renderSimpleVersionUI() {
    logDebug("renderSimpleVersionUI: Iniciando renderizado de versión simple");
    
    // Ocultar elementos de la versión compleja
    const complexElements = document.querySelectorAll(".complex-version");
    complexElements.forEach(el => el.style.display = "none");
    
    // Mostrar elementos de la versión simple
    const simpleElements = document.querySelectorAll(".simple-version");
    simpleElements.forEach(el => el.style.display = "block");
    
    // Ocultar contenedor de botones flotantes
    const floatingContainer = document.getElementById("floating-actions-container");
    if (floatingContainer) {
        floatingContainer.style.display = "none";
    }
    
    logDebug("renderSimpleVersionUI: Versión simple renderizada");
  }

  function renderComplexVersionUI() {
    logDebug("renderComplexVersionUI: Iniciando renderizado de versión compleja");
    
    // Ocultar elementos de la versión simple
    const simpleElements = document.querySelectorAll(".simple-version");
    simpleElements.forEach(el => el.style.display = "none");
    
    // Mostrar elementos de la versión compleja
    const complexElements = document.querySelectorAll(".complex-version");
    complexElements.forEach(el => el.style.display = "block");
    
    // Asegurar que el contenedor de botones flotantes sea visible
    const floatingContainer = document.getElementById("floating-actions-container");
    if (floatingContainer) {
        floatingContainer.style.display = "flex";
    }
    
    logDebug("renderComplexVersionUI: Versión compleja renderizada");
  }

  // Inyectar CSS para depuración de menús flotantes
  (function() {
    const style = document.createElement('style');
    style.textContent = `
    ul.menu {
      background: #fff !important;
      color: #222 !important;
      border: 1px solid #888 !important;
      min-width: 180px !important;
      min-height: 40px !important;
      z-index: 9999 !important;
      position: absolute !important;
      box-shadow: 0 2px 8px rgba(0,0,0,0.15) !important;
    }
    ul.menu li {
      padding: 8px 16px !important;
      cursor: pointer !important;
      display: block !important;
    }
    ul.menu li:hover {
      background: #f0f0f0 !important;
    }
    `;
    document.head.appendChild(style);
  })();

  // Inyectar CSS para mejorar el modal de previsualización de nota
  (function() {
    const style = document.createElement('style');
    style.textContent = `
    #preview-note-modal.modal-overlay {
      /* display: flex !important; */
      align-items: center;
      justify-content: center;
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(0,0,0,0.3);
      z-index: 10000;
    }
    #preview-note-modal .modal-content {
      background: #fff;
      border-radius: 8px;
      box-shadow: 0 4px 24px rgba(0,0,0,0.18);
      padding: 2rem;
      max-width: 500px;
      width: 90vw;
      max-height: 80vh;
      display: flex;
      flex-direction: column;
      align-items: stretch;
    }
    #preview-note-text {
      width: 100%;
      min-height: 250px;
      max-height: 50vh;
      resize: vertical;
      margin-bottom: 1.5rem;
      font-size: 1.1em;
      font-family: inherit;
    }
    #preview-note-modal .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }
    `;
    document.head.appendChild(style);
  })();

  document.addEventListener('DOMContentLoaded', function() {
    const previewNoteModal = document.getElementById('preview-note-modal');
    const cancelBtn = previewNoteModal?.querySelector('button, .modal-actions button, .cancel-btn, [data-action="cancel"]');
    
    // Ocultar modal al iniciar
    if (previewNoteModal) previewNoteModal.style.display = 'none';

    // Listener para Cancelar
    if (previewNoteModal && cancelBtn) {
      cancelBtn.addEventListener('click', function() {
        previewNoteModal.style.display = 'none';
      });
    }

    // Listener para clic fuera del contenido
    if (previewNoteModal) {
      previewNoteModal.addEventListener('click', function(e) {
        if (e.target === previewNoteModal) {
          previewNoteModal.style.display = 'none';
        }
      });
    }

    // Listener para Escape
    document.addEventListener('keydown', function(e) {
      if (e.key === 'Escape' && previewNoteModal && previewNoteModal.style.display === 'flex') {
        previewNoteModal.style.display = 'none';
      }
    });
  });

  // Inyectar estilos CSS para los menús flotantes
  function injectFloatingMenuStyles() {
    const style = document.createElement('style');
    style.textContent = `
        #floating-actions-container {
            position: fixed;
            right: 20px;
            bottom: 20px;
            display: flex;
            flex-direction: column;
            gap: 10px;
            z-index: 1000;
        }

        .floating-button-container {
            position: relative;
        }

        .floating-button {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            background: #007bff;
            color: white;
            border: none;
            cursor: pointer;
            font-size: 20px;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 2px 5px rgba(0,0,0,0.2);
            transition: all 0.3s ease;
        }

        .floating-button:hover {
            background: #0056b3;
            transform: scale(1.1);
        }

        .menu {
            position: absolute;
            right: 60px;
            bottom: 0;
            background: white;
            border-radius: 8px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            padding: 8px 0;
            min-width: 200px;
            display: none;
        }

        .menu li {
            padding: 8px 16px;
            cursor: pointer;
            transition: background 0.2s;
            list-style: none;
        }

        .menu li:hover {
            background: #f0f0f0;
        }

        .popup {
            position: relative;
        }
    `;
    document.head.appendChild(style);
  }

  // Llamar a la función de inyección de estilos al inicio
  document.addEventListener('DOMContentLoaded', injectFloatingMenuStyles);

  // Implementar showPreviewModal para el botón de copiar
  function showPreviewModal() {
    const note = buildNote();
    const modal = document.getElementById('preview-note-modal');
    const textarea = document.getElementById('preview-note-text');
    if (modal && textarea) {
        textarea.value = note;
        modal.style.display = 'flex';
    } else {
        alert('No se pudo mostrar la previsualización de la nota.');
    }
  }

  // Listener para cambio de selector de cama (dropdown)
  const bedSelector = document.getElementById('bed-selector');
  if (bedSelector) {
      bedSelector.addEventListener('change', (e) => {
          const bedId = e.target.value;
          if (bedId) {
              // Guardar datos de la cama que se deja ANTES de cambiar
              if (window.AppState.currentBedId && window.AppState.currentBedId !== bedId && window.AppState.beds[window.AppState.currentBedId]) {
                  saveUIToCurrentBedData(window.AppState.currentBedId);
              }
              window.AppState.currentBedId = bedId; // Actualizar cama actual globalmente
              loadBedDataIntoUI(bedId);
              // populateBedSelector(); // No es necesario llamar aquí, loadBedDataIntoUI lo hace
          }
      });
  }

  // Función para sincronizar estados
  function syncStates() {
    // Sincronizar State con window.AppState
    if (window.AppState && window.AppState.beds) {
      State.beds = window.AppState.beds;
      State.currentBedId = window.AppState.currentBedId;
    } else if (State.beds && Object.keys(State.beds).length > 0) {
      // Si window.AppState no existe o está vacío, usar State como fuente
      if (!window.AppState) {
        window.AppState = {
          beds: {},
          currentBedId: null,
          version: null,
          aiEnabled: false,
          initialized: false
        };
      }
      window.AppState.beds = State.beds;
      window.AppState.currentBedId = State.currentBedId;
    }
    logDebug("syncStates: Estados sincronizados", { 
      stateBeds: Object.keys(State.beds).length,
      appStateBeds: Object.keys(window.AppState?.beds || {}).length,
      currentBedId: State.currentBedId || window.AppState?.currentBedId
    });
  }

})() // Final del IIFE

// Sistema de gestión de eventos
const EventManager = {
    events: new Map(),
    
    on(event, callback) {
        if (!this.events.has(event)) {
            this.events.set(event, new Set());
        }
        this.events.get(event).add(callback);
        Logger.debug(`Evento registrado: ${event}`);
    },
    
    off(event, callback) {
        if (this.events.has(event)) {
            this.events.get(event).delete(callback);
            Logger.debug(`Evento eliminado: ${event}`);
        }
    },
    
    emit(event, data) {
        if (this.events.has(event)) {
            Logger.debug(`Emitiendo evento: ${event}`, data);
            this.events.get(event).forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    Logger.error(`Error en evento ${event}`, error);
                }
            });
        }
    }
};

// Hacer EventManager disponible globalmente
window.EventManager = EventManager;
 