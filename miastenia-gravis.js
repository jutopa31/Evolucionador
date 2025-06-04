/**
 * Miastenia Gravis Scale Integration
 * This script handles the integration of the Miastenia Gravis scale with the main application.
 */

// Function to open the Miastenia Gravis scale in a modal
function openMiasteniaGravisScale() {
  console.log("Opening Miastenia Gravis Scale...")

  // Get the overlay element or create it if it doesn't exist
  let mgOverlay = document.getElementById("mgOverlay")

  if (!mgOverlay) {
    // Create overlay if it doesn't exist
    mgOverlay = document.createElement("div")
    mgOverlay.id = "mgOverlay"
    mgOverlay.style.cssText = `
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
    `

    // Create container for the iframe
    const mgFrameContainer = document.createElement("div")
    mgFrameContainer.style.cssText = `
      position: relative;
      width: 90%;
      max-width: 1000px;
      height: 90%;
      background-color: white;
      border-radius: 8px;
      overflow: hidden;
    `

    // Create close button
    const mgClose = document.createElement("button")
    mgClose.id = "mgClose"
    mgClose.innerHTML = "×"
    mgClose.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      background: none;
      border: none;
      font-size: 24px;
      cursor: pointer;
      z-index: 1001;
    `

    // Create iframe
    const mgFrame = document.createElement("iframe")
    mgFrame.id = "mgFrame"
    mgFrame.src = "miastenia-gravis.html"
    mgFrame.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
    `

    // Add event listener to close button
    mgClose.addEventListener("click", () => {
      mgOverlay.style.display = "none"
      // Optional: clear iframe
      mgFrame.src = "about:blank"
      setTimeout(() => {
        mgFrame.src = "miastenia-gravis.html"
      }, 100)
    })

    // Assemble the elements
    mgFrameContainer.appendChild(mgClose)
    mgFrameContainer.appendChild(mgFrame)
    mgOverlay.appendChild(mgFrameContainer)
    document.body.appendChild(mgOverlay)

    // Add event listener for messages from the iframe
    window.addEventListener("message", (event) => {
      if (event.data && event.data.type === "mgScaleText" && event.data.text) {
        handleMiasteniaGravisResult(event.data.text)
      }
    })
  }

  // Show the overlay
  mgOverlay.style.display = "flex"
}

/**
 * Handles the result text from the Miastenia Gravis scale
 * @param {string} text The formatted text result from the scale
 */
function handleMiasteniaGravisResult(text) {
  console.log("Handling Miastenia Gravis result:", text)

  if (!text || text.trim() === "") {
    console.warn("Empty Miastenia Gravis result text")
    return
  }

  // Get the textarea for the physical exam
  const fisicoTextarea = document.getElementById("ta-fisico")

  if (fisicoTextarea) {
    // Insert the text at the cursor position or append to the end
    if (typeof window.insertAtCursor === "function") {
      window.insertAtCursor(fisicoTextarea, text + "\n\n")
    } else {
      // Fallback if insertAtCursor is not available
      const currentText = fisicoTextarea.value
      const separator = currentText.trim() !== "" && !currentText.endsWith("\n\n") ? "\n\n" : ""
      fisicoTextarea.value = currentText + separator + text

      // Trigger input event to save changes
      fisicoTextarea.dispatchEvent(new Event("input", { bubbles: true }))
    }

    // Close the overlay
    const mgOverlay = document.getElementById("mgOverlay")
    if (mgOverlay) {
      mgOverlay.style.display = "none"
    }

    // Show feedback
    alert("Escala de Miastenia Gravis insertada en el examen físico.")
  } else {
    console.error("Physical exam textarea not found")
    alert("Error: No se pudo encontrar el área de examen físico para insertar la escala.")
  }
}

// Extend the openScale function to handle Miastenia Gravis
function extendOpenScaleFunction() {
  // Store the original openScale function if it exists
  const originalOpenScale = window.openScale

  // Replace with our extended version
  window.openScale = (scaleType) => {
    if (scaleType === "miastenia") {
      openMiasteniaGravisScale()
    } else if (typeof originalOpenScale === "function") {
      // Call the original function for other scale types
      originalOpenScale(scaleType)
    } else {
      console.warn(`Scale type "${scaleType}" not supported.`)
    }
  }
}

// Initialize when the document is ready
document.addEventListener("DOMContentLoaded", () => {
  console.log("Initializing Miastenia Gravis scale integration...")

  // Extend the openScale function
  extendOpenScaleFunction()
})

// Also initialize when the app is fully initialized (in case DOMContentLoaded fired before app.js)
document.addEventListener("appInitialized", () => {
  console.log("App initialized, ensuring Miastenia Gravis scale integration...")

  // Extend the openScale function
  extendOpenScaleFunction()
})

// Integración básica para escala de Miastenia Gravis
console.log('Initializing Miastenia Gravis scale integration...');

// Función para manejar resultados de Miastenia Gravis
function handleMiasteniaResult(text) {
    console.log('Miastenia result received:', text);
    
    if (!text || text.trim() === "") {
        console.log('Empty miastenia result, closing modal');
        return;
    }
    
    // Buscar el textarea de examen físico
    const fisicoTextarea = document.querySelector('[id^="ta-fisico-"]');
    if (fisicoTextarea) {
        const currentText = fisicoTextarea.value;
        const separator = currentText.trim() !== "" && !currentText.endsWith("\n\n") ? "\n\n" : "";
        fisicoTextarea.value = currentText + separator + text.trim();
        
        // Disparar evento input para guardado automático
        fisicoTextarea.dispatchEvent(new Event("input", { bubbles: true }));
        console.log('Miastenia result inserted into physical exam');
    } else {
        console.warn('Physical exam textarea not found for miastenia result');
    }
}

// Exponer función globalmente
window.handleMiasteniaResult = handleMiasteniaResult;

console.log('Miastenia Gravis integration loaded');
