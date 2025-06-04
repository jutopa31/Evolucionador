/**
 * Utilidad para manejar errores de API de manera consistente
 * Este archivo centraliza la lógica de manejo de errores para todas las llamadas a APIs externas
 */

// Tipos de errores comunes que pueden ocurrir
const ErrorTypes = {
  NETWORK: "network",
  AUTH: "authentication",
  RATE_LIMIT: "rate_limit",
  TIMEOUT: "timeout",
  SERVER: "server",
  VALIDATION: "validation",
  UNKNOWN: "unknown",
}

/**
 * Analiza un error de API y lo clasifica según su tipo
 * @param {Error|Object} error - El error capturado
 * @param {Response} [response] - Objeto de respuesta fetch (opcional)
 * @returns {Object} Objeto con tipo de error y mensaje formateado
 */
function analyzeApiError(error, response = null) {
  // Objeto para almacenar información del error
  const errorInfo = {
    type: ErrorTypes.UNKNOWN,
    message: "Error desconocido",
    originalError: error,
    statusCode: response?.status || null,
    responseData: null,
  }

  // Si hay un error de red (sin conexión, CORS, etc.)
  if (error.name === "TypeError" && error.message.includes("network")) {
    errorInfo.type = ErrorTypes.NETWORK
    errorInfo.message = "Error de conexión. Verifica tu internet y vuelve a intentar."
    return errorInfo
  }

  // Si el error es un timeout
  if (error.name === "AbortError" || error.message.includes("timeout") || error.message.includes("aborted")) {
    errorInfo.type = ErrorTypes.TIMEOUT
    errorInfo.message = "La solicitud tardó demasiado tiempo y fue cancelada."
    return errorInfo
  }

  // Si tenemos un objeto response, analizar según el código de estado HTTP
  if (response) {
    const status = response.status

    // Errores de autenticación
    if (status === 401 || status === 403) {
      errorInfo.type = ErrorTypes.AUTH
      errorInfo.message = "Error de autenticación. Verifica tu API Key o permisos."
    }
    // Rate limiting
    else if (status === 429) {
      errorInfo.type = ErrorTypes.RATE_LIMIT
      errorInfo.message = "Has excedido el límite de solicitudes. Intenta más tarde."
    }
    // Errores de servidor
    else if (status >= 500) {
      errorInfo.type = ErrorTypes.SERVER
      errorInfo.message = "Error en el servidor de OpenAI. Intenta más tarde."
    }
    // Errores de validación o cliente
    else if (status >= 400) {
      errorInfo.type = ErrorTypes.VALIDATION
      errorInfo.message = "Error en la solicitud. Verifica los parámetros enviados."
    }
  }

  // Analizar mensajes específicos de OpenAI
  if (error.message) {
    if (error.message.includes("API key")) {
      errorInfo.type = ErrorTypes.AUTH
      errorInfo.message = "API key inválida o no proporcionada."
    } else if (error.message.includes("rate limit")) {
      errorInfo.type = ErrorTypes.RATE_LIMIT
      errorInfo.message = "Has excedido el límite de solicitudes a OpenAI."
    }
  }

  return errorInfo
}

/**
 * Maneja una solicitud a la API con manejo de errores mejorado
 * @param {Function} apiCall - Función asíncrona que realiza la llamada a la API
 * @param {Object} options - Opciones adicionales
 * @returns {Promise<Object>} Resultado de la API o error formateado
 */
async function handleApiRequest(apiCall, options = {}) {
  const {
    timeout = 30000, // Timeout por defecto: 30 segundos
    retries = 0, // Reintentos por defecto: 0
    onError = null, // Callback opcional para errores
  } = options

  // Crear un controlador de aborto para el timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), timeout)

  try {
    // Ejecutar la llamada a la API con el signal del controlador
    const result = await apiCall(controller.signal)
    clearTimeout(timeoutId)
    return { success: true, data: result }
  } catch (error) {
    clearTimeout(timeoutId)

    // Analizar el error
    const errorInfo = analyzeApiError(error)

    // Ejecutar callback de error si existe
    if (onError && typeof onError === "function") {
      onError(errorInfo)
    }

    // Reintentar si hay reintentos disponibles y el error es adecuado para reintento
    if (retries > 0 && [ErrorTypes.NETWORK, ErrorTypes.TIMEOUT, ErrorTypes.SERVER].includes(errorInfo.type)) {
      console.log(`Reintentando llamada a API (${retries} reintentos restantes)...`)
      return handleApiRequest(apiCall, { ...options, retries: retries - 1 })
    }

    // Devolver error formateado
    return {
      success: false,
      error: errorInfo,
    }
  }
}

/**
 * Realiza una llamada a la API de OpenAI con manejo de errores mejorado
 * @param {Object} options - Opciones para la llamada a la API
 * @returns {Promise<Object>} Resultado de la API
 */
async function callOpenAI(options) {
  const {
    endpoint = "https://api.openai.com/v1/chat/completions",
    apiKey,
    model = "gpt-3.5-turbo",
    messages,
    temperature = 0.7,
    max_tokens,
    response_format,
    timeout = 30000,
    retries = 1,
    onError = null,
  } = options

  if (!apiKey) {
    return {
      success: false,
      error: {
        type: ErrorTypes.AUTH,
        message: "API key no proporcionada",
      },
    }
  }

  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return {
      success: false,
      error: {
        type: ErrorTypes.VALIDATION,
        message: "Se requieren mensajes para la llamada a la API",
      },
    }
  }

  // Crear el payload para la API
  const payload = {
    model,
    messages,
    temperature,
  }

  // Añadir parámetros opcionales si están definidos
  if (max_tokens) payload.max_tokens = max_tokens
  if (response_format) payload.response_format = response_format

  // Función que realiza la llamada a la API
  const apiCall = async (signal) => {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify(payload),
      signal,
    })

    // Si la respuesta no es exitosa, lanzar un error
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      const error = new Error(`Error HTTP ${response.status}: ${errorData.error?.message || response.statusText}`)
      error.response = response
      error.responseData = errorData
      throw error
    }

    // Procesar la respuesta exitosa
    const data = await response.json()
    return data
  }

  // Usar el manejador genérico para la solicitud
  return handleApiRequest(apiCall, { timeout, retries, onError })
}

// Exportar funciones y constantes
window.ApiErrorHandler = {
  ErrorTypes,
  analyzeApiError,
  handleApiRequest,
  callOpenAI,
}

console.log('ApiErrorHandler loaded');
