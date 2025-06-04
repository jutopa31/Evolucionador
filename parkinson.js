// Modificar el script de parkinson.js para mejorar la comunicación con la ventana padre
document.addEventListener("DOMContentLoaded", () => {
  // Inicializar referencias DOM
  const previewModal = document.getElementById("previewModal")
  const previewText = document.getElementById("previewText")
  const confirmCopyBtn = document.getElementById("confirmCopyBtn")
  const cancelCopyBtn = document.getElementById("cancelCopyBtn")
  const feedbackMessage = document.getElementById("feedback-message")

  // Variables para almacenar datos temporales
  let textToCopyGlobal = ""

  // Items con puntuación Izquierda/Derecha en UPDRS III
  const bilateralItems = [20, 21, 24, 25, 26, 27, 28, 29]

  // Definir secciones para navegación y cálculo de puntajes
  const PkSections = [
    { id: "updrs1", label: "UPDRS I", scoreStart: 1, scoreEnd: 4, maxScore: 16 },
    { id: "updrs2", label: "UPDRS II", scoreStart: 5, scoreEnd: 17, maxScore: 52 },
    { id: "updrs3", label: "UPDRS III", scoreStart: 18, scoreEnd: 34, maxScore: 68 },
    { id: "updrs4", label: "UPDRS IV", scoreStart: 35, scoreEnd: 45, maxScore: 23 },
    { id: "parkinsonDiagnosis", label: "Diagnóstico EP" },
  ]

  // Notificar a la ventana padre que el iframe está listo
  function notifyParentReady() {
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: "pkReady" }, "*")
        console.log("Mensaje de inicialización enviado a la ventana padre")
      }
    } catch (e) {
      console.error("Error enviando mensaje de inicialización:", e)
    }
  }

  // Enviar texto a la ventana padre con mejor manejo de errores
  function sendTextToParent(text) {
    try {
      if (window.parent && window.parent !== window) {
        window.parent.postMessage({ type: "updrsText", text: text }, "*")
        console.log("Mensaje enviado al padre:", {
          type: "updrsText",
          text: text ? text.substring(0, 50) + "..." : "(vacío)",
        })
        showFeedback("Texto enviado a la nota principal")
        return true
      } else {
        console.log("No se detectó ventana padre")
        showFeedback("No se pudo enviar a la ventana principal")
        return false
      }
    } catch (e) {
      console.error("Error enviando mensaje:", e)
      showFeedback("Error al enviar", true)

      // Notificar error a la ventana padre
      try {
        if (window.parent && window.parent !== window) {
          window.parent.postMessage(
            {
              type: "pkError",
              message: "Error al enviar datos: " + (e.message || "Error desconocido"),
            },
            "*",
          )
        }
      } catch (err) {
        // Si falla incluso la notificación de error, solo registramos en consola
        console.error("Error enviando notificación de error:", err)
      }

      return false
    }
  }

  // Mostrar feedback visual
  function showFeedback(message, isError = false) {
    if (!feedbackMessage) return

    feedbackMessage.textContent = message
    feedbackMessage.style.backgroundColor = isError ? "#d32f2f" : "rgba(0, 0, 0, 0.75)"
    feedbackMessage.classList.add("visible")

    setTimeout(() => {
      feedbackMessage.classList.remove("visible")
    }, 2000)
  }

  // Muestra una sección específica y oculta las demás
  function showSection(sectionId) {
    console.log("Mostrando sección:", sectionId)
    document.querySelectorAll(".section").forEach((section) => {
      section.classList.toggle("active", section.id === sectionId)
    })

    // Scroll suave al inicio
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Calcular y actualizar el puntaje total
  function updateTotalScore(sectionId) {
    const sectionConfig = PkSections.find((s) => s.id === sectionId)
    if (!sectionConfig || !sectionConfig.scoreStart) return

    const { scoreStart, scoreEnd, maxScore } = sectionConfig
    let total = 0

    // Sumar puntajes
    for (let i = scoreStart; i <= scoreEnd; i++) {
      if (bilateralItems.includes(i)) {
        const leftVal = Number.parseInt(document.getElementById(`s${i}L`)?.value || 0)
        const rightVal = Number.parseInt(document.getElementById(`s${i}R`)?.value || 0)
        total += leftVal + rightVal
      } else {
        total += Number.parseInt(document.getElementById(`s${i}`)?.value || 0)
      }
    }

    // Actualizar el display
    const scoreDisplay = document.getElementById(`${sectionId}-score`)
    if (scoreDisplay) {
      scoreDisplay.textContent = `${total}/${maxScore}`
    }
  }

  // Generar texto para copia
  function copyScores(sectionId) {
    const sectionConfig = PkSections.find((s) => s.id === sectionId)
    if (!sectionConfig || !sectionConfig.scoreStart) return ""

    const { scoreStart, scoreEnd, maxScore } = sectionConfig
    let output = `${sectionConfig.label.toUpperCase()}:\n`
    let total = 0

    // Obtener items y sus nombres
    const items = getAllItemsMap()

    // Generar texto por ítem
    for (let i = scoreStart; i <= scoreEnd; i++) {
      const itemName = items[i] || `Ítem ${i}`

      if (bilateralItems.includes(i)) {
        const left = Number.parseInt(document.getElementById(`s${i}L`)?.value || 0)
        const right = Number.parseInt(document.getElementById(`s${i}R`)?.value || 0)
        output += `${itemName}: ${left}/${right}\n`
        total += left + right
      } else {
        const score = Number.parseInt(document.getElementById(`s${i}`)?.value || 0)
        output += `${itemName}: ${score}\n`
        total += score
      }
    }

    output += `\nTotal ${sectionConfig.label}: ${total}/${maxScore}`
    return output
  }

  // Generar resultado diagnóstico
  function copyParkinsonDiagnosisResult() {
    // Evaluar criterios principales
    const brady = document.querySelector('input[name="parkinson1"]:checked')?.value === "si"
    const tremor = document.querySelector('input[name="parkinson2"]:checked')?.value === "si"
    const rigidity = document.querySelector('input[name="parkinson3"]:checked')?.value === "si"
    const parkinsonSyndrome = brady && (tremor || rigidity)

    // Simplificado para este ejemplo
    const result = parkinsonSyndrome
      ? "Cumple criterios de síndrome parkinsoniano"
      : "No cumple criterios de síndrome parkinsoniano"

    return `Diagnóstico Parkinson (MDS 2015):\n${result}`
  }

  // Manejar previsualización y copia
  function handlePreviewAndCopy(targetId) {
    if (!targetId || !previewModal || !previewText) return

    let textToPreview = ""

    if (targetId === "parkinsonDiagnosis") {
      textToPreview = copyParkinsonDiagnosisResult()
    } else {
      textToPreview = copyScores(targetId)
    }

    if (!textToPreview) {
      showFeedback("No hay contenido para copiar", true)
      return
    }

    // Guardar para uso posterior
    textToCopyGlobal = textToPreview

    // Mostrar en modal
    previewText.textContent = textToPreview
    previewModal.style.display = "flex"
  }

  // Configurar event listeners
  function setupEventListeners() {
    // Delegación de eventos para acciones
    document.addEventListener("click", (e) => {
      const target = e.target

      // Buscar elemento con atributo data-action
      const actionElement = target.closest("[data-action]")
      if (!actionElement) return

      const action = actionElement.dataset.action
      const targetId = actionElement.dataset.target

      switch (action) {
        case "showSection":
          if (targetId) showSection(targetId)
          break

        case "previewAndCopy":
          handlePreviewAndCopy(targetId)
          break

        case "returnToIndex":
          showSection("index")
          // Enviar mensaje vacío para cerrar overlay en la ventana padre
          sendTextToParent("")
          break
      }
    })

    // Eventos para actualizar puntajes
    document.addEventListener("input", (e) => {
      if (e.target.matches('input[type="number"][data-input-type="score"]')) {
        const section = e.target.closest(".section")
        if (section && section.id) {
          updateTotalScore(section.id)
        }
      }
    })

    // Botones del modal
    if (confirmCopyBtn) {
      confirmCopyBtn.addEventListener("click", () => {
        if (textToCopyGlobal) {
          sendTextToParent(textToCopyGlobal)
        }
        if (previewModal) {
          previewModal.style.display = "none"
        }
      })
    }

    if (cancelCopyBtn) {
      cancelCopyBtn.addEventListener("click", () => {
        if (previewModal) {
          previewModal.style.display = "none"
        }
      })
    }

    // Cerrar modal con clic fuera
    if (previewModal) {
      previewModal.addEventListener("click", (e) => {
        if (e.target === previewModal) {
          previewModal.style.display = "none"
        }
      })
    }

    // Hotkeys (Ctrl+número)
    document.addEventListener("keydown", (e) => {
      if (e.ctrlKey && !e.altKey && !e.metaKey) {
        const keyMap = {
          1: "updrs1",
          2: "updrs2",
          3: "updrs3",
          4: "updrs4",
          5: "parkinsonDiagnosis",
          0: "index",
        }

        const targetKey = keyMap[e.key]
        if (targetKey) {
          e.preventDefault()
          showSection(targetKey)
        }
      }
    })

    // Escuchar mensajes de la ventana padre
    window.addEventListener("message", (event) => {
      console.log("Mensaje recibido de la ventana padre:", event.data)

      if (event.data && typeof event.data === "object") {
        if (event.data.type === "resetFromParent") {
          // Reiniciar la aplicación si se solicita
          showSection("index")
          console.log("Aplicación reiniciada por solicitud de la ventana padre")
        } else if (event.data.type === "initFromParent") {
          // Manejar inicialización desde la ventana padre
          console.log("Inicialización recibida de la ventana padre:", event.data.data)
        }
      }
    })
  }

  // Mapa de nombres de ítems
  function getAllItemsMap() {
    return {
      1: "Alteración del Intelecto",
      2: "Trastornos del Pensamiento",
      3: "Depresión",
      4: "Motivación - Iniciativa",
      5: "Lenguaje (AVD)",
      6: "Salivación",
      7: "Deglución",
      8: "Escritura",
      9: "Cortar Alimentos",
      10: "Vestido",
      11: "Higiene",
      12: "Vueltas en Cama",
      13: "Caídas",
      14: "Congelación al Caminar",
      15: "Caminar",
      16: "Temblor (AVD)",
      17: "Síntomas Sensoriales",
      18: "Lenguaje (Motor)",
      19: "Expresión Facial",
      20: "Temblor de Reposo (MMSS)",
      21: "Temblor (MMII)",
      22: "Temblor de Acción (Manos)",
      23: "Rigidez Axial",
      24: "Rigidez (MMSS)",
      25: "Rigidez (MMII)",
      26: "Golpeteo de Dedos",
      27: "Movimientos Alternantes (Manos)",
      28: "Movimientos Rápidos (MMSS)",
      29: "Agilidad (MMII)",
      30: "Levantarse de la Silla",
      31: "Postura",
      32: "Marcha",
      33: "Estabilidad Postural",
      34: "Bradiquinesia",
      35: "Duración de Discinesias",
      36: "Incapacidad por Discinesias",
      37: "Discinesias Dolorosas",
      38: "Distonía Matutina",
      39: "Períodos OFF Predecibles",
      40: "Períodos OFF Impredecibles",
      41: "Períodos OFF Súbitos",
      42: "Proporción OFF",
      43: "Anorexia, Náuseas",
      44: "Trastornos del Sueño",
      45: "Ortostatismo Sintomático",
    }
  }

  // Inicialización al cargar
  function initApp() {
    setupEventListeners()

    // Calcular scores iniciales
    ;["updrs1", "updrs2", "updrs3", "updrs4"].forEach(updateTotalScore)

    // Notificar a la ventana padre que estamos listos
    setTimeout(notifyParentReady, 500)

    console.log("Aplicación UPDRS iniciada")
  }

  // Iniciar la aplicación
  initApp()
})
