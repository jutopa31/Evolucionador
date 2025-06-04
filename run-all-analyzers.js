/**
 * Script para ejecutar todos los analizadores de código
 * Este script ejecuta los tres analizadores y muestra un resumen combinado
 */

const { analyzeCodebase } = require("./syntax-analyzer")
const { analyzeDirectory: analyzeTemplateStrings } = require("./template-string-checker")
const { analyzeDirectory: analyzeNewlines } = require("./newline-detector")

// Colores para la consola
const COLORS = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
  magenta: "\x1b[35m",
}

/**
 * Ejecuta todos los analizadores en secuencia
 * @param {string} rootDir Directorio raíz para comenzar el análisis
 */
async function runAllAnalyzers(rootDir) {
  console.log(`${COLORS.magenta}=======================================${COLORS.reset}`)
  console.log(`${COLORS.magenta}= ANÁLISIS COMPLETO DE CÓDIGO FUENTE =${COLORS.reset}`)
  console.log(`${COLORS.magenta}=======================================${COLORS.reset}\n`)

  console.log(`${COLORS.cyan}Directorio a analizar: ${rootDir}${COLORS.reset}\n`)

  try {
    // 1. Ejecutar analizador general de sintaxis
    console.log(`${COLORS.yellow}[1/3] Ejecutando analizador general de sintaxis...${COLORS.reset}\n`)
    await analyzeCodebase(rootDir)

    console.log(`\n${COLORS.magenta}---------------------------------------${COLORS.reset}\n`)

    // 2. Ejecutar analizador específico de template strings
    console.log(`${COLORS.yellow}[2/3] Ejecutando analizador de template strings...${COLORS.reset}\n`)
    await analyzeTemplateStrings(rootDir)

    console.log(`\n${COLORS.magenta}---------------------------------------${COLORS.reset}\n`)

    // 3. Ejecutar detector de problemas con saltos de línea
    console.log(`${COLORS.yellow}[3/3] Ejecutando detector de problemas con saltos de línea...${COLORS.reset}\n`)
    await analyzeNewlines(rootDir)

    console.log(`\n${COLORS.magenta}=======================================${COLORS.reset}`)
    console.log(`${COLORS.green}Análisis completo finalizado.${COLORS.reset}`)
    console.log(`${COLORS.magenta}=======================================${COLORS.reset}\n`)

    // Mostrar recomendaciones finales
    console.log(`${COLORS.cyan}Recomendaciones finales:${COLORS.reset}`)
    console.log(`1. Revisa todos los problemas marcados como WARNING primero.`)
    console.log(`2. Presta especial atención a los template strings con saltos de línea.`)
    console.log(`3. Considera implementar ESLint para detectar estos problemas automáticamente.`)
    console.log(`4. Añade pruebas unitarias para las funciones que manipulan strings.`)
    console.log(`5. Implementa pre-commit hooks para ejecutar estos analizadores antes de cada commit.`)
  } catch (error) {
    console.error(`${COLORS.red}Error durante la ejecución de los analizadores:${COLORS.reset}`, error)
  }
}

// Ejecutar todos los analizadores si se llama directamente
if (require.main === module) {
  const rootDir = process.argv[2] || "."
  runAllAnalyzers(rootDir)
}

module.exports = {
  runAllAnalyzers,
}
