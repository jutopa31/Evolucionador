document.addEventListener("DOMContentLoaded", () => {
  // Tab switching functionality
  const tabs = document.querySelectorAll(".tab")
  const tabContents = document.querySelectorAll(".tab-content")

  tabs.forEach((tab) => {
    tab.addEventListener("click", () => {
      const tabId = tab.getAttribute("data-tab")

      // Remove active class from all tabs and contents
      tabs.forEach((t) => t.classList.remove("active"))
      tabContents.forEach((content) => content.classList.remove("active"))

      // Add active class to clicked tab and corresponding content
      tab.classList.add("active")
      document.getElementById(`${tabId}-tab`).classList.add("active")
    })
  })

  // Close button functionality
  document.getElementById("close-btn").addEventListener("click", () => {
    // Send message to parent window to close the overlay
    window.parent.postMessage({ type: "closeEspasticidadScale" }, "*")
  })

  // Ashworth Scale functionality
  const ashworthSelects = document.querySelectorAll(".ashworth-select")
  const ashworthResult = document.getElementById("ashworth-result")
  const ashworthGenerate = document.getElementById("ashworth-generate")
  const ashworthReset = document.getElementById("ashworth-reset")

  // Update Ashworth result when any select changes
  ashworthSelects.forEach((select) => {
    select.addEventListener("change", updateAshworthResult)
  })

  // Generate Ashworth report
  ashworthGenerate.addEventListener("click", () => {
    const report = generateAshworthReport()
    if (report) {
      // Send the report to the parent window
      window.parent.postMessage({ type: "espasticidadText", text: report }, "*")
    }
  })

  // Reset Ashworth form
  ashworthReset.addEventListener("click", () => {
    ashworthSelects.forEach((select) => {
      select.value = ""
    })
    updateAshworthResult()
  })

  // Tardieu Scale functionality
  const tardieuMuscle = document.getElementById("tardieu-muscle")
  const tardieuEvaluation = document.getElementById("tardieu-evaluation")
  const tardieuAddMuscle = document.getElementById("tardieu-add-muscle")
  const tardieuResults = document.getElementById("tardieu-results")
  const tardieuGenerate = document.getElementById("tardieu-generate")
  const tardieuReset = document.getElementById("tardieu-reset")

  // Show evaluation form when muscle is selected
  tardieuMuscle.addEventListener("change", () => {
    if (tardieuMuscle.value) {
      tardieuEvaluation.style.display = "block"
    } else {
      tardieuEvaluation.style.display = "none"
    }
  })

  // Store Tardieu results
  let tardieuResultsData = []

  // Add muscle evaluation to results
  tardieuAddMuscle.addEventListener("click", addTardieuMuscle)

  // Generate Tardieu report
  tardieuGenerate.addEventListener("click", () => {
    const report = generateTardieuReport()
    if (report) {
      // Send the report to the parent window
      window.parent.postMessage({ type: "espasticidadText", text: report }, "*")
    }
  })

  // Reset Tardieu form
  tardieuReset.addEventListener("click", () => {
    tardieuMuscle.value = ""
    document.getElementById("tardieu-quality-v1").value = ""
    document.getElementById("tardieu-angle-v1").value = ""
    document.getElementById("tardieu-quality-v3").value = ""
    document.getElementById("tardieu-angle-v3").value = ""
    tardieuEvaluation.style.display = "none"
    tardieuResultsData = []
    updateTardieuResults()
  })

  // Function to update Ashworth result display
  function updateAshworthResult() {
    let resultText = ""
    let hasValues = false

    // Check if any select has a value
    ashworthSelects.forEach((select) => {
      if (select.value) {
        hasValues = true
      }
    })

    if (!hasValues) {
      ashworthResult.textContent = "Complete la evaluación para ver el resultado"
      return
    }

    resultText = "Escala de Ashworth Modificada:\n"

    // Upper limb
    const upperLimbResults = []
    if (document.getElementById("ashworth-flexores-codo").value) {
      upperLimbResults.push(`Flexores de codo: ${document.getElementById("ashworth-flexores-codo").value}`)
    }
    if (document.getElementById("ashworth-extensores-codo").value) {
      upperLimbResults.push(`Extensores de codo: ${document.getElementById("ashworth-extensores-codo").value}`)
    }
    if (document.getElementById("ashworth-pronadores").value) {
      upperLimbResults.push(`Pronadores: ${document.getElementById("ashworth-pronadores").value}`)
    }
    if (document.getElementById("ashworth-flexores-muneca").value) {
      upperLimbResults.push(`Flexores de muñeca: ${document.getElementById("ashworth-flexores-muneca").value}`)
    }

    // Lower limb
    const lowerLimbResults = []
    if (document.getElementById("ashworth-flexores-cadera").value) {
      lowerLimbResults.push(`Flexores de cadera: ${document.getElementById("ashworth-flexores-cadera").value}`)
    }
    if (document.getElementById("ashworth-aductores-cadera").value) {
      lowerLimbResults.push(`Aductores de cadera: ${document.getElementById("ashworth-aductores-cadera").value}`)
    }
    if (document.getElementById("ashworth-extensores-rodilla").value) {
      lowerLimbResults.push(`Extensores de rodilla: ${document.getElementById("ashworth-extensores-rodilla").value}`)
    }
    if (document.getElementById("ashworth-flexores-rodilla").value) {
      lowerLimbResults.push(`Flexores de rodilla: ${document.getElementById("ashworth-flexores-rodilla").value}`)
    }
    if (document.getElementById("ashworth-flexores-plantares").value) {
      lowerLimbResults.push(`Flexores plantares: ${document.getElementById("ashworth-flexores-plantares").value}`)
    }

    if (upperLimbResults.length > 0) {
      resultText += "\nMiembro Superior:\n- " + upperLimbResults.join("\n- ")
    }

    if (lowerLimbResults.length > 0) {
      resultText += "\n\nMiembro Inferior:\n- " + lowerLimbResults.join("\n- ")
    }

    ashworthResult.textContent = resultText
  }

  // Function to generate Ashworth report
  function generateAshworthReport() {
    let hasValues = false

    // Check if any select has a value
    ashworthSelects.forEach((select) => {
      if (select.value) {
        hasValues = true
      }
    })

    if (!hasValues) {
      alert("Complete al menos un campo de la evaluación para generar el informe.")
      return null
    }

    let report = "EVALUACIÓN DE ESPASTICIDAD - ESCALA DE ASHWORTH MODIFICADA:\n"

    // Upper limb
    const upperLimbResults = []
    if (document.getElementById("ashworth-flexores-codo").value) {
      upperLimbResults.push(`Flexores de codo: ${document.getElementById("ashworth-flexores-codo").value}`)
    }
    if (document.getElementById("ashworth-extensores-codo").value) {
      upperLimbResults.push(`Extensores de codo: ${document.getElementById("ashworth-extensores-codo").value}`)
    }
    if (document.getElementById("ashworth-pronadores").value) {
      upperLimbResults.push(`Pronadores: ${document.getElementById("ashworth-pronadores").value}`)
    }
    if (document.getElementById("ashworth-flexores-muneca").value) {
      upperLimbResults.push(`Flexores de muñeca: ${document.getElementById("ashworth-flexores-muneca").value}`)
    }

    // Lower limb
    const lowerLimbResults = []
    if (document.getElementById("ashworth-flexores-cadera").value) {
      lowerLimbResults.push(`Flexores de cadera: ${document.getElementById("ashworth-flexores-cadera").value}`)
    }
    if (document.getElementById("ashworth-aductores-cadera").value) {
      lowerLimbResults.push(`Aductores de cadera: ${document.getElementById("ashworth-aductores-cadera").value}`)
    }
    if (document.getElementById("ashworth-extensores-rodilla").value) {
      lowerLimbResults.push(`Extensores de rodilla: ${document.getElementById("ashworth-extensores-rodilla").value}`)
    }
    if (document.getElementById("ashworth-flexores-rodilla").value) {
      lowerLimbResults.push(`Flexores de rodilla: ${document.getElementById("ashworth-flexores-rodilla").value}`)
    }
    if (document.getElementById("ashworth-flexores-plantares").value) {
      lowerLimbResults.push(`Flexores plantares: ${document.getElementById("ashworth-flexores-plantares").value}`)
    }

    if (upperLimbResults.length > 0) {
      report += "\nMiembro Superior:\n- " + upperLimbResults.join("\n- ")
    }

    if (lowerLimbResults.length > 0) {
      report += "\n\nMiembro Inferior:\n- " + lowerLimbResults.join("\n- ")
    }

    report +=
      "\n\nInterpretación: 0=Sin aumento del tono; 1=Ligero aumento al final del movimiento; 1+=Ligero aumento en menos de la mitad del arco; 2=Aumento más pronunciado en la mayor parte del arco; 3=Considerable aumento, movimiento pasivo difícil; 4=Parte afectada rígida."

    return report
  }

  // Function to add Tardieu muscle evaluation
  function addTardieuMuscle() {
    const muscle = tardieuMuscle.value
    const qualityV1 = document.getElementById("tardieu-quality-v1").value
    const angleV1 = document.getElementById("tardieu-angle-v1").value
    const qualityV3 = document.getElementById("tardieu-quality-v3").value
    const angleV3 = document.getElementById("tardieu-angle-v3").value

    if (!muscle || !qualityV1 || !angleV1 || !qualityV3 || !angleV3) {
      alert("Complete todos los campos para añadir la evaluación del músculo.")
      return
    }

    // Get muscle name for display
    let muscleName = ""
    switch (muscle) {
      case "flexores-codo":
        muscleName = "Flexores de codo"
        break
      case "extensores-codo":
        muscleName = "Extensores de codo"
        break
      case "flexores-muneca":
        muscleName = "Flexores de muñeca"
        break
      case "flexores-rodilla":
        muscleName = "Flexores de rodilla"
        break
      case "extensores-rodilla":
        muscleName = "Extensores de rodilla"
        break
      case "flexores-plantares":
        muscleName = "Flexores plantares"
        break
      default:
        muscleName = muscle
    }

    // Add to results data
    tardieuResultsData.push({
      muscle: muscleName,
      qualityV1: qualityV1,
      angleV1: angleV1,
      qualityV3: qualityV3,
      angleV3: angleV3,
      angleR2R1: angleV1 - angleV3,
    })

    // Update results display
    updateTardieuResults()

    // Reset form for next muscle
    document.getElementById("tardieu-quality-v1").value = ""
    document.getElementById("tardieu-angle-v1").value = ""
    document.getElementById("tardieu-quality-v3").value = ""
    document.getElementById("tardieu-angle-v3").value = ""
    tardieuMuscle.value = ""
    tardieuEvaluation.style.display = "none"
  }

  // Function to update Tardieu results display
  function updateTardieuResults() {
    if (tardieuResultsData.length === 0) {
      tardieuResults.textContent = "No hay resultados aún"
      return
    }

    let resultText = "Escala de Tardieu Modificada:\n\n"

    tardieuResultsData.forEach((result, index) => {
      resultText += `${index + 1}. ${result.muscle}:\n`
      resultText += `   - V1: Calidad ${result.qualityV1}, Ángulo ${result.angleV1}°\n`
      resultText += `   - V3: Calidad ${result.qualityV3}, Ángulo ${result.angleV3}°\n`
      resultText += `   - Diferencia R2-R1: ${result.angleR2R1}°\n\n`
    })

    tardieuResults.textContent = resultText
  }

  // Function to generate Tardieu report
  function generateTardieuReport() {
    if (tardieuResultsData.length === 0) {
      alert("Añada al menos una evaluación muscular para generar el informe.")
      return null
    }

    let report = "EVALUACIÓN DE ESPASTICIDAD - ESCALA DE TARDIEU MODIFICADA:\n\n"

    tardieuResultsData.forEach((result, index) => {
      report += `${result.muscle}:\n`
      report += `- V1 (lento): Calidad ${result.qualityV1}, Ángulo ${result.angleV1}°\n`
      report += `- V3 (rápido): Calidad ${result.qualityV3}, Ángulo ${result.angleV3}°\n`
      report += `- Diferencia R2-R1: ${result.angleR2R1}°\n\n`
    })

    report += "Interpretación:\n"
    report +=
      '- Calidad (X): 0=Sin resistencia; 1=Ligera resistencia; 2=Claro "agarrotamiento"; 3=Clonus agotable; 4=Clonus inagotable\n'
    report += "- Velocidad (V): V1=Muy lenta; V3=Muy rápida\n"
    report +=
      "- Diferencia R2-R1: Indica el componente dinámico de la espasticidad (>10° sugiere respuesta al tratamiento con toxina botulínica)"

    return report
  }
})
