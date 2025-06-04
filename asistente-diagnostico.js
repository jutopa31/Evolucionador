// asistente-diagnostico.js
// Este componente proporciona asistencia diagnóstica neurológica mediante IA

/**
 * Componente de Asistente Diagnóstico Neurológico que utiliza OpenAI para procesar
 * datos del paciente y generar impresiones diagnósticas y recomendaciones.
 */
class AsistenteDiagnostico {
  constructor(config = {}) {
    this.apiKey = config.apiKey || localStorage.getItem("openai_api_key")
    this.modelId = config.modelId || "gpt-3.5-turbo"
    this.maxTokens = config.maxTokens || 1000
    this.temperature = config.temperature || 0.4 // Menor temperatura para respuestas más consistentes
    this.endpointUrl = "https://api.openai.com/v1/chat/completions"
    this.state = {
      isAnalyzing: false,
      result: null,
      error: null,
    }
  }

  /**
   * Recopila todos los datos relevantes del paciente desde la estructura del Estado
   * @param {Object} state - Objeto de Estado de la aplicación
   * @param {string} bedId - ID de la cama seleccionada
   * @returns {Object} Datos estructurados del paciente
   */
  recopilarDatosPaciente(state, bedId) {
    // Add explicit checks for state and bedId
    if (!state || !state.beds || !bedId || !state.beds[bedId]) {
      throw new Error("Cama no seleccionada o datos insuficientes para el análisis.")
    }

    const bed = state.beds[bedId]
    const datos = {
      datos_filiatorios: bed.structured?.datos || {},
      antecedentes: bed.structured?.antecedentes || {},
      evolucion: {
        motivo: bed.structured?.evolucion?.motivo || "",
        actual: bed.structured?.evolucion?.actual || "",
      },
      examen_fisico: bed.text?.fisico || "",
      notas_libres: bed.text?.notas_libres || "",
      medicaciones: Array.isArray(bed.meds) ? bed.meds : [],
    }

    return datos
  }

  /**
   * Construye un prompt estructurado para enviar a la API
   * @param {Object} datosPaciente - Datos estructurados del paciente
   * @returns {string} Prompt completo para enviar a OpenAI
   */
  construirPrompt(datosPaciente) {
    return `Eres un asistente neurológico experto. Por favor, analiza la siguiente información de un paciente y proporciona:
1. Impresión diagnóstica preliminar basada en la presentación clínica
2. Identificación de información faltante o estudios complementarios que serían necesarios
3. Sugerencias de conducta a seguir

# INFORMACIÓN DEL PACIENTE

## Datos Filiatorios
${Object.entries(datosPaciente.datos_filiatorios || {})
  .map(([key, value]) => `${key}: ${value}`)
  .join("\n")}

## Antecedentes
${Object.entries(datosPaciente.antecedentes || {})
  .map(([key, value]) => `${key}: ${value}`)
  .join("\n")}

## Motivo de Consulta
${datosPaciente.evolucion.motivo || "No especificado"}

## Enfermedad Actual
${datosPaciente.evolucion.actual || "No especificado"}

## Examen Físico
${datosPaciente.examen_fisico || "No especificado"}

## Medicación Actual
${datosPaciente.medicaciones.length > 0 ? datosPaciente.medicaciones.join("\n") : "Ninguna medicación registrada"}

## Notas Adicionales
${datosPaciente.notas_libres || "No hay notas adicionales"}

# INSTRUCCIONES ESPECÍFICAS

Basado en la información proporcionada:

1. IMPRESIÓN DIAGNÓSTICA: Proporciona una impresión diagnóstica preliminar, incluyendo diagnósticos diferenciales si corresponde. Organiza por probabilidad.

2. INFORMACIÓN FALTANTE: Identifica qué información clave o estudios diagnósticos serían necesarios para confirmar o descartar diagnósticos. Sé específico sobre qué buscar.

3. CONDUCTA SUGERIDA: Recomienda la conducta a seguir, incluyendo:
   - Estudios diagnósticos a solicitar
   - Consideraciones de tratamiento
   - Sugerencias de interconsultas
   - Seguimiento recomendado

Mantén un enfoque pragmático y basado en evidencia. Indica claramente cuándo hay incertidumbre diagnóstica y por qué.`
  }

  /**
   * Procesa los datos del paciente para obtener análisis diagnóstico
   * @param {Object} state - Objeto de Estado de la aplicación
   * @param {string} bedId - ID de la cama seleccionada
   * @returns {Promise<Object>} Resultado del análisis
   */
  async analizarPaciente(state, bedId) {
    try {
      this.state.isAnalyzing = true
      this.state.result = null
      this.state.error = null

      // Verificar API key
      if (!this.apiKey) {
        throw new Error("Se requiere API key de OpenAI para el análisis diagnóstico")
      }

      // Recopilar datos del paciente
      const datosPaciente = this.recopilarDatosPaciente(state, bedId)

      // Construir el prompt
      const prompt = this.construirPrompt(datosPaciente)

      // Usar el nuevo manejador de errores de API
      const result = await window.ApiErrorHandler.callOpenAI({
        apiKey: this.apiKey,
        model: this.modelId,
        messages: [
          {
            role: "system",
            content:
              "Eres un asistente neurológico experto que ayuda con el diagnóstico y manejo de pacientes neurológicos basado en datos clínicos.",
          },
          { role: "user", content: prompt },
        ],
        max_tokens: this.maxTokens,
        temperature: this.temperature,
        timeout: 45000, // Tiempo de espera más largo para análisis completos
        retries: 1,
      })

      if (result.success) {
        const analisis = result.data.choices?.[0]?.message?.content

        if (!analisis) {
          throw new Error("No se recibió respuesta analítica de la IA")
        }

        this.state.result = this.formatearResultado(analisis)
        return this.state.result
      } else {
        // Manejar el error según su tipo
        const errorInfo = result.error
        const errorMessage = `Error en el análisis: ${errorInfo.message}`
        this.state.error = errorMessage
        throw new Error(errorMessage)
      }
    } catch (error) {
      this.state.error = error.message
      throw error
    } finally {
      this.state.isAnalyzing = false
    }
  }

  /**
   * Formatea el resultado de la IA en secciones estructuradas
   * @param {string} rawAnalisis - Texto completo del análisis
   * @returns {Object} Análisis estructurado
   */
  formatearResultado(rawAnalisis) {
    // Extraer las secciones principales del análisis
    const seccionesRegex = {
      impresion: /IMPRESIÓN DIAGNÓSTICA[:\s]+([\s\S]*?)(?=INFORMACIÓN FALTANTE[:\s]+|CONDUCTA SUGERIDA[:\s]+|$)/i,
      faltante: /INFORMACIÓN FALTANTE[:\s]+([\s\S]*?)(?=IMPRESIÓN DIAGNÓSTICA[:\s]+|CONDUCTA SUGERIDA[:\s]+|$)/i,
      conducta: /CONDUCTA SUGERIDA[:\s]+([\s\S]*?)(?=IMPRESIÓN DIAGNÓSTICA[:\s]+|INFORMACIÓN FALTANTE[:\s]+|$)/i,
    }

    const resultado = {
      textoCompleto: rawAnalisis,
      secciones: {},
    }

    // Extraer cada sección
    for (const [key, regex] of Object.entries(seccionesRegex)) {
      const match = rawAnalisis.match(regex)
      resultado.secciones[key] = match ? match[1].trim() : ""
    }

    return resultado
  }

  /**
   * Genera HTML para mostrar el resultado del análisis
   * @param {Object} resultado - Resultado del análisis
   * @returns {string} HTML formateado para mostrar
   */
  formatearHTMLResultado(resultado) {
    if (!resultado) {
      return "<p>No hay análisis disponible</p>"
    }

    const sections = [
      { id: "impresion", title: "Impresión Diagnóstica", icon: "🔍" },
      { id: "faltante", title: "Información Faltante / Estudios Necesarios", icon: "❓" },
      { id: "conducta", title: "Conducta Sugerida", icon: "📋" },
    ]

    let html = `<div>`

    for (const section of sections) {
      const content = resultado.secciones[section.id] || "No disponible"
      html += `
            <div style="margin-bottom: 15px; padding-bottom: 15px; border-bottom: 1px dashed var(--border-color);">
                <h4 style="margin-bottom: 8px; font-weight: 500;">${section.icon} ${section.title}</h4>
                <div style="padding-left: 15px; line-height: 1.6;">${this.formatearTextoAHTML(content)}</div>
            </div>
        `
    }

    html += `
        <div style="margin-top: 15px; color: var(--text-color-light); font-size: 0.9em; text-align: right;">
            <small><em>Nota: Este análisis es asistido por IA y debe ser validado por criterio clínico profesional.</em></small>
        </div>
    </div>`

    return html
  }

  /**
   * Formatea texto plano a HTML con formato
   * @param {string} texto - Texto a formatear
   * @returns {string} HTML formateado
   */
  formatearTextoAHTML(texto) {
    // Convertir saltos de línea a <br>
    let html = texto.replace(/\n/g, "<br>")

    // Convertir listas con guiones
    html = html.replace(/- ([^\n<]+)/g, "• $1")

    // Resaltar términos importantes
    const terminosImportantes = [
      "urgente",
      "prioritario",
      "crítico",
      "necesario",
      "esencial",
      "confirmar",
      "descartar",
      "revaluar",
      "seguimiento",
    ]

    terminosImportantes.forEach((termino) => {
      const regex = new RegExp(`\\b${termino}\\b`, "gi")
      html = html.replace(regex, (match) => `<strong>${match}</strong>`)
    })

    return html
  }
}

/**
 * Función para añadir el componente de Asistente Diagnóstico a la aplicación
 */
function integrarAsistenteDiagnostico() {
  console.log("Integrando Asistente Diagnóstico Neurológico...")

  // 1. Crear la nueva sección en la UI sin modificar los estilos existentes
  const seccionDiagnostico = document.createElement("div")
  seccionDiagnostico.className = "section"
  seccionDiagnostico.dataset.key = "diagnostico"
  // Set initial display based on current AI state from app.js
  if (window.State && !window.State.aiEnabled) {
    seccionDiagnostico.style.display = "none";
    console.log("Asistente Diagnóstico section initially hidden as AI is disabled.");
  }

  // 2. Definir contenido HTML de la sección - usando las clases CSS estándar
  seccionDiagnostico.innerHTML = `
        <div class="section-header" data-action="toggle-section">
            <h3>Asistente Diagnóstico IA <span class="hotkey">(Alt+8)</span></h3>
            <span id="save-diagnostico" class="save-indicator">Procesado</span>
        </div>
        <div class="section-content" id="content-diagnostico">
            <div id="diagnostico-controles">
                <button id="iniciar-analisis" class="btn-primary">Analizar Caso Clínico</button>
                <button id="copiar-analisis" style="display:none;">Copiar Análisis</button>
                <span id="estado-analisis"></span>
            </div>
            <div id="resultado-analisis" style="display:none; margin-top: 15px; padding: 15px; border: 1px solid var(--border-color); border-radius: var(--border-radius); background-color: var(--section-background);">
            </div>
        </div>
    `

  // 3. Añadir a la aplicación
  const app = document.getElementById("app")
  if (app) {
    app.appendChild(seccionDiagnostico)
  }

  // 4. Instanciar el componente
  const asistente = new AsistenteDiagnostico()

  // 5. Agregar listeners - sin cambios
  const iniciarBtn = document.getElementById("iniciar-analisis")
  const copiarBtn = document.getElementById("copiar-analisis")
  const estadoElem = document.getElementById("estado-analisis")
  const resultadoElem = document.getElementById("resultado-analisis")

  if (iniciarBtn) {
    iniciarBtn.addEventListener("click", async () => {
      try {
        // Sin cambios en la lógica...
        if (!asistente.apiKey) {
          alert("Por favor, configura la API key de OpenAI (🔑) antes de usar el asistente diagnóstico.")
          return
        }

        estadoElem.textContent = "Analizando datos del paciente..."
        estadoElem.style.display = "inline"
        iniciarBtn.disabled = true
        resultadoElem.style.display = "none"

        // --- MODIFICATION START ---
        // Check if window.State is defined and if the app is initialized
        if (!window.State || (typeof window.isAppInitialized === "function" && !window.isAppInitialized())) {
          throw new Error("El estado de la aplicación no está completamente cargado. Intenta de nuevo.")
        }
        const state = window.State
        const bedId = state.currentBedId

        // Check for bedId and state.beds
        if (!bedId || !state.beds || !state.beds[bedId]) {
          throw new Error("No hay una cama seleccionada o los datos de la cama no están disponibles.")
        }
        // --- MODIFICATION END ---

        const resultado = await asistente.analizarPaciente(state, bedId)

        resultadoElem.innerHTML = asistente.formatearHTMLResultado(resultado)
        resultadoElem.style.display = "block"
        copiarBtn.style.display = "inline-block"
        estadoElem.textContent = "Análisis completado"

        if (!state.beds[bedId].diagnostico) {
          state.beds[bedId].diagnostico = {}
        }
        state.beds[bedId].diagnostico.analisis = resultado

        if (typeof window.scheduleSaveAllData === "function") {
          window.scheduleSaveAllData()
        }
      } catch (error) {
        console.error("Error en análisis diagnóstico:", error)
        estadoElem.textContent = `Error: ${error.message}`
        resultadoElem.innerHTML = `<p style="color: var(--danger-color);">No se pudo completar el análisis: ${error.message}</p>
                <p>Sugerencias:</p>
                <ul>
                    <li>Verifica que has ingresado suficiente información en las secciones de datos del paciente.</li>
                    <li>Asegúrate de que la API key de OpenAI es correcta y está activa.</li>
                    <li>Comprueba tu conexión a Internet.</li>
                    <li>Asegúrate de haber seleccionado una cama.</li> </ul>`
        resultadoElem.style.display = "block"
      } finally {
        iniciarBtn.disabled = false
      }
    })

    // --- Optional: Disable button until app is ready ---
    // iniciarBtn.disabled = true;

    // If you want to enable the button when the app is fully initialized,
    // you could listen for the 'appInitialized' event dispatched by app.js
    // document.addEventListener('appInitialized', () => {
    //     const btn = document.getElementById('iniciar-analisis');
    //     if(btn) btn.disabled = false;
    //     console.log("Botón 'Analizar Caso Clínico' habilitado.");
    // });
    // --- END Optional ---
  }

  if (copiarBtn) {
    // Sin cambios en la lógica del botón copiar...
    copiarBtn.addEventListener("click", () => {
      try {
        const state = window.State
        const bedId = state.currentBedId
        const analisis = state.beds[bedId]?.diagnostico?.analisis

        if (analisis && analisis.textoCompleto) {
          navigator.clipboard
            .writeText(analisis.textoCompleto)
            .then(() => {
              estadoElem.textContent = "Análisis copiado al portapapeles"
              setTimeout(() => {
                estadoElem.textContent = "Análisis completado"
              }, 2000)
            })
            .catch((err) => {
              console.error("Error al copiar:", err)
              estadoElem.textContent = "Error al copiar al portapapeles"
            })
        }
      } catch (error) {
        console.error("Error al copiar análisis:", error)
      }
    })
  }

  // 6. Añadir acceso por tecla rápida (Alt+8)
  document.addEventListener("keydown", (e) => {
    if (e.altKey && !e.ctrlKey && !e.metaKey && e.key === "8") {
      e.preventDefault()
      const contentDiagnostico = document.getElementById("content-diagnostico")
      if (contentDiagnostico) {
        contentDiagnostico.classList.add("active")
        const header = contentDiagnostico.previousElementSibling
        if (header && header.classList.contains("section-header")) {
          header.classList.remove("no-border-bottom")
        }
        seccionDiagnostico.scrollIntoView({ behavior: "smooth" })
      }
    }
  })

  // 7. ELIMINAR la aplicación de estilos específicos
  // No agregamos ningún estilo personalizado para mantener la apariencia original

  // Listen for AI toggle events from app.js
  document.addEventListener('aiToggled', (event) => {
    const diagnosticoSectionElement = document.querySelector('[data-key="diagnostico"]');
    if (diagnosticoSectionElement) {
      diagnosticoSectionElement.style.display = event.detail.enabled ? "block" : "none";
      console.log(`Asistente Diagnóstico section visibility toggled via event to: ${event.detail.enabled}`);
    }
  });

  console.log("Asistente Diagnóstico Neurológico integrado correctamente")
  return asistente
}

// Exportar componentes
window.AsistenteDiagnostico = AsistenteDiagnostico
window.integrarAsistenteDiagnostico = integrarAsistenteDiagnostico

// Inicializar cuando la app principal esté completamente cargada
document.addEventListener("appInitialized", () => {
  if (!document.querySelector('[data-key="diagnostico"]')) {
    integrarAsistenteDiagnostico()
  }
})
