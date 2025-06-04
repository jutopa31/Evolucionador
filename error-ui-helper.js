/**
 * Utilidades para mostrar errores y mensajes de estado en la interfaz de usuario
 * Este archivo proporciona funciones para mostrar feedback visual consistente
 */

// Tipos de mensajes
const MessageTypes = {
  SUCCESS: "success",
  ERROR: "error",
  WARNING: "warning",
  INFO: "info",
}

// Duración predeterminada para mensajes temporales (en ms)
const DEFAULT_DURATION = 5000

/**
 * Muestra un mensaje de estado temporal en la interfaz
 * @param {string} message - Mensaje a mostrar
 * @param {string} type - Tipo de mensaje (success, error, warning, info)
 * @param {number} duration - Duración en ms (0 para no ocultar automáticamente)
 * @param {string} containerId - ID del contenedor donde mostrar el mensaje (opcional)
 * @returns {HTMLElement} El elemento de mensaje creado
 */
function showTemporaryMessage(message, type = MessageTypes.INFO, duration = DEFAULT_DURATION, containerId = null) {
  // Crear el elemento de mensaje
  const messageElement = document.createElement("div")
  messageElement.className = `ui-message ui-message-${type}`
  messageElement.textContent = message

  // Añadir estilos inline básicos (se pueden mejorar con CSS)
  messageElement.style.padding = "10px 15px"
  messageElement.style.borderRadius = "4px"
  messageElement.style.marginBottom = "10px"
  messageElement.style.animation = "fadeIn 0.3s ease"
  messageElement.style.position = "relative"

  // Estilos según el tipo
  switch (type) {
    case MessageTypes.SUCCESS:
      messageElement.style.backgroundColor = "#d4edda"
      messageElement.style.color = "#155724"
      messageElement.style.borderLeft = "4px solid #28a745"
      break
    case MessageTypes.ERROR:
      messageElement.style.backgroundColor = "#f8d7da"
      messageElement.style.color = "#721c24"
      messageElement.style.borderLeft = "4px solid #dc3545"
      break
    case MessageTypes.WARNING:
      messageElement.style.backgroundColor = "#fff3cd"
      messageElement.style.color = "#856404"
      messageElement.style.borderLeft = "4px solid #ffc107"
      break
    case MessageTypes.INFO:
    default:
      messageElement.style.backgroundColor = "#d1ecf1"
      messageElement.style.color = "#0c5460"
      messageElement.style.borderLeft = "4px solid #17a2b8"
      break
  }

  // Añadir botón de cierre
  const closeButton = document.createElement("button")
  closeButton.textContent = "×"
  closeButton.style.position = "absolute"
  closeButton.style.right = "10px"
  closeButton.style.top = "50%"
  closeButton.style.transform = "translateY(-50%)"
  closeButton.style.background = "none"
  closeButton.style.border = "none"
  closeButton.style.fontSize = "20px"
  closeButton.style.cursor = "pointer"
  closeButton.style.color = "inherit"
  closeButton.style.opacity = "0.7"
  closeButton.addEventListener("click", () => {
    removeMessage(messageElement)
  })
  messageElement.appendChild(closeButton)

  // Determinar el contenedor donde mostrar el mensaje
  let container
  if (containerId) {
    container = document.getElementById(containerId)
  }

  // Si no se especificó un contenedor o no se encontró, crear uno global
  if (!container) {
    container = document.getElementById("ui-messages-container")
    if (!container) {
      container = document.createElement("div")
      container.id = "ui-messages-container"
      container.style.position = "fixed"
      container.style.top = "20px"
      container.style.right = "20px"
      container.style.maxWidth = "350px"
      container.style.zIndex = "9999"
      document.body.appendChild(container)
    }
  }

  // Añadir el mensaje al contenedor
  container.appendChild(messageElement)

  // Configurar la eliminación automática después de la duración especificada
  if (duration > 0) {
    setTimeout(() => {
      removeMessage(messageElement)
    }, duration)
  }

  return messageElement
}

/**
 * Elimina un mensaje con animación
 * @param {HTMLElement} messageElement - Elemento de mensaje a eliminar
 */
function removeMessage(messageElement) {
  if (!messageElement || !messageElement.parentNode) return

  // Añadir animación de salida
  messageElement.style.animation = "fadeOut 0.3s ease forwards"

  // Eliminar después de la animación
  setTimeout(() => {
    if (messageElement.parentNode) {
      messageElement.parentNode.removeChild(messageElement)

      // Si el contenedor está vacío, eliminarlo también
      const container = document.getElementById("ui-messages-container")
      if (container && container.children.length === 0) {
        container.parentNode.removeChild(container)
      }
    }
  }, 300)
}

/**
 * Muestra un mensaje de error en la interfaz
 * @param {string} message - Mensaje de error
 * @param {number} duration - Duración en ms
 * @param {string} containerId - ID del contenedor
 */
function showError(message, duration = DEFAULT_DURATION, containerId = null) {
  return showTemporaryMessage(message, MessageTypes.ERROR, duration, containerId)
}

/**
 * Muestra un mensaje de éxito en la interfaz
 * @param {string} message - Mensaje de éxito
 * @param {number} duration - Duración en ms
 * @param {string} containerId - ID del contenedor
 */
function showSuccess(message, duration = DEFAULT_DURATION, containerId = null) {
  return showTemporaryMessage(message, MessageTypes.SUCCESS, duration, containerId)
}

/**
 * Muestra un mensaje de advertencia en la interfaz
 * @param {string} message - Mensaje de advertencia
 * @param {number} duration - Duración en ms
 * @param {string} containerId - ID del contenedor
 */
function showWarning(message, duration = DEFAULT_DURATION, containerId = null) {
  return showTemporaryMessage(message, MessageTypes.WARNING, duration, containerId)
}

/**
 * Muestra un mensaje informativo en la interfaz
 * @param {string} message - Mensaje informativo
 * @param {number} duration - Duración en ms
 * @param {string} containerId - ID del contenedor
 */
function showInfo(message, duration = DEFAULT_DURATION, containerId = null) {
  return showTemporaryMessage(message, MessageTypes.INFO, duration, containerId)
}

/**
 * Actualiza el estado visual de un elemento de carga
 * @param {HTMLElement} element - Elemento a actualizar
 * @param {boolean} isLoading - Si está cargando o no
 * @param {string} loadingText - Texto a mostrar durante la carga
 * @param {string} originalText - Texto original a restaurar
 */
function updateLoadingState(element, isLoading, loadingText = "Cargando...", originalText = null) {
  if (!element) return

  if (isLoading) {
    // Guardar el texto original si no se proporcionó
    if (!originalText) {
      element.dataset.originalText = element.textContent || ""
    }

    // Aplicar estado de carga
    element.textContent = loadingText
    element.disabled = true
    element.classList.add("loading")
  } else {
    // Restaurar estado original
    element.textContent = originalText || element.dataset.originalText || ""
    element.disabled = false
    element.classList.remove("loading")
    delete element.dataset.originalText
  }
}

// Añadir estilos CSS para animaciones
function addStyles() {
  const styleElement = document.createElement("style")
  styleElement.textContent = `
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(-10px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes fadeOut {
      from { opacity: 1; transform: translateY(0); }
      to { opacity: 0; transform: translateY(-10px); }
    }
    
    .ui-message {
      box-shadow: 0 2px 5px rgba(0,0,0,0.1);
      transition: all 0.3s ease;
    }
    
    .ui-message:hover {
      box-shadow: 0 3px 8px rgba(0,0,0,0.15);
    }
    
    .loading {
      position: relative;
      pointer-events: none;
      opacity: 0.7;
    }
    
    .loading::after {
      content: '';
      position: absolute;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(0,0,0,0.1);
      border-top-color: currentColor;
      border-radius: 50%;
      right: 10px;
      top: 50%;
      margin-top: -8px;
      animation: spin 0.8s linear infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `
  document.head.appendChild(styleElement)
}

// Inicializar estilos cuando se carga el documento
document.addEventListener("DOMContentLoaded", addStyles)

// Exportar funciones y constantes
window.ErrorUI = {
  MessageTypes,
  showTemporaryMessage,
  showError,
  showSuccess,
  showWarning,
  showInfo,
  updateLoadingState,
  removeMessage, // Add removeMessage here
}
