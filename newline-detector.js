/**
 * Script simple para detectar problemas específicos con saltos de línea en strings
 * Este script se enfoca en el problema específico que se corrigió anteriormente
 */

const fs = require("fs")
const path = require("path")
const { promisify } = require("util")

const readFile = promisify(fs.readFile)
const readdir = promisify(fs.readdir)
const stat = promisify(fs.stat)

// Colores para la consola
const COLORS = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  green: "\x1b[32m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
}

/**
 * Busca problemas específicos con saltos de línea en strings
 * @param {string} filePath Ruta del archivo a analizar
 * @returns {Promise<Array>} Lista de problemas encontrados
 */
async function detectNewlineIssues(filePath) {
  try {
    const content = await readFile(filePath, "utf8")
    const lines = content.split("\n")
    const issues = []

    // Patrones específicos a buscar
    const patterns = [
      {
        // Template string con salto de línea literal
        regex: /`[^`]*\n[^`]*`/g,
        type: "template_string_newline",
        message: "Template string con salto de línea literal",
      },
      {
        // String con + concatenando con salto de línea
        regex: /['"][^'"]*['"]\s*\+\s*['"]/g,
        type: "string_concat_potential_issue",
        message: "Concatenación de strings que podría tener problemas",
      },
      {
        // Posible intento de escape de salto de línea
        regex: /\\n(?!\s*['"`])/g,
        type: "newline_escape_sequence",
        message: "Secuencia de escape de salto de línea que podría estar mal formateada",
      },
    ]

    // Buscar cada patrón en el contenido
    patterns.forEach((pattern) => {
      let match
      while ((match = pattern.regex.exec(content)) !== null) {
        // Encontrar número de línea
        const matchPosition = match.index
        let lineNumber = 0
        let currentPos = 0

        for (let i = 0; i < lines.length; i++) {
          currentPos += lines[i].length + 1 // +1 por el \n
          if (currentPos > matchPosition) {
            lineNumber = i + 1
            break
          }
        }

        // Extraer contexto (línea donde ocurre el problema)
        const context = lines[lineNumber - 1] || ""

        issues.push({
          file: filePath,
          line: lineNumber,
          type: pattern.type,
          message: pattern.message,
          context: context.trim(),
        })
      }
    })

    // Búsqueda específica para el problema de buildNote() con template strings
    const buildNoteFunctionRegex = /function\s+buildNote\s*$$\s*$$\s*\{[\s\S]*?\}/g
    const buildNoteMatches = [...content.matchAll(buildNoteFunctionRegex)]

    for (const match of buildNoteMatches) {
      const functionContent = match[0]

      // Buscar template strings dentro de la función
      const templateStringRegex = /`([^`]*)`/g
      let templateMatch

      while ((templateMatch = templateStringRegex.exec(functionContent)) !== null) {
        const templateContent = templateMatch[1]

        // Verificar si hay saltos de línea literales
        if (templateContent.includes("\n")) {
          // Encontrar número de línea
          const matchPosition = match.index + templateMatch.index
          let lineNumber = 0
          let currentPos = 0

          for (let i = 0; i < lines.length; i++) {
            currentPos += lines[i].length + 1 // +1 por el \n
            if (currentPos > matchPosition) {
              lineNumber = i + 1
              break
            }
          }

          // Extraer contexto (línea donde comienza el template string)
          const context = lines[lineNumber - 1] || ""

          issues.push({
            file: filePath,
            line: lineNumber,
            type: "buildNote_template_string_newline",
            message: "Template string con salto de línea literal en función buildNote()",
            context: context.trim(),
            suggestion: 'Usa concatenación explícita con "\\n" en lugar de saltos de línea literales',
          })
        }
      }
    }

    return issues
  } catch (error) {
    console.error(`Error al analizar ${filePath}:`, error.message)
    return []
  }
}

/**
 * Encuentra todos los archivos JavaScript en un directorio
 * @param {string} dir Directorio a recorrer
 * @returns {Promise<Array>} Lista de rutas de archivos JavaScript
 */
async function findJsFiles(dir) {
  const files = []

  try {
    const entries = await readdir(dir)

    for (const entry of entries) {
      if (entry === "node_modules" || entry === ".git") continue

      const fullPath = path.join(dir, entry)
      const stats = await stat(fullPath)

      if (stats.isDirectory()) {
        const subFiles = await findJsFiles(fullPath)
        files.push(...subFiles)
      } else if (
        stats.isFile() &&
        (fullPath.endsWith(".js") || fullPath.endsWith(".jsx") || fullPath.endsWith(".ts") || fullPath.endsWith(".tsx"))
      ) {
        files.push(fullPath)
      }
    }
  } catch (error) {
    console.error(`Error al leer directorio ${dir}:`, error.message)
  }

  return files
}

/**
 * Analiza todos los archivos JavaScript en un directorio
 * @param {string} rootDir Directorio raíz para comenzar el análisis
 */
async function analyzeDirectory(rootDir) {
  console.log(`${COLORS.cyan}Buscando problemas con saltos de línea en ${rootDir}...${COLORS.reset}`)

  try {
    const files = await findJsFiles(rootDir)
    console.log(`${COLORS.blue}Encontrados ${files.length} archivos para analizar${COLORS.reset}`)

    let allIssues = []

    for (const file of files) {
      const issues = await detectNewlineIssues(file)
      allIssues = [...allIssues, ...issues]

      // Mostrar progreso
      if (issues.length > 0) {
        process.stdout.write("!")
      } else {
        process.stdout.write(".")
      }
    }

    console.log("\n")

    // Mostrar resumen
    console.log(`${COLORS.cyan}=== Resumen del análisis ===${COLORS.reset}`)
    console.log(`${COLORS.blue}Archivos analizados: ${files.length}${COLORS.reset}`)
    console.log(`${COLORS.yellow}Problemas encontrados: ${allIssues.length}${COLORS.reset}\n`)

    // Agrupar por tipo de problema
    const problemsByType = {}
    allIssues.forEach((issue) => {
      if (!problemsByType[issue.type]) {
        problemsByType[issue.type] = []
      }
      problemsByType[issue.type].push(issue)
    })

    // Mostrar problemas por tipo
    if (allIssues.length > 0) {
      console.log(`${COLORS.cyan}=== Problemas encontrados por tipo ===${COLORS.reset}`)

      for (const [type, issues] of Object.entries(problemsByType)) {
        console.log(`\n${COLORS.yellow}--- ${type} (${issues.length}) ---${COLORS.reset}`)

        issues.forEach((issue) => {
          console.log(`\nArchivo: ${issue.file}`)
          console.log(`Línea: ${issue.line}`)
          console.log(`Mensaje: ${issue.message}`)
          console.log(`Contexto: "${issue.context}"`)
          if (issue.suggestion) {
            console.log(`Sugerencia: ${issue.suggestion}`)
          }
        })
      }

      // Sugerencias generales
      console.log(`\n${COLORS.cyan}=== Sugerencias generales ===${COLORS.reset}`)
      console.log(`1. Para template strings con saltos de línea, usa concatenación explícita:`)
      console.log(`   const texto = \`Primera línea\` + "\\n" + \`Segunda línea\`;`)
      console.log(`2. Evita saltos de línea literales en strings, usa "\\n" en su lugar.`)
      console.log(
        `3. Revisa cuidadosamente las concatenaciones de strings, especialmente en funciones como buildNote().`,
      )
    } else {
      console.log(`${COLORS.green}¡No se encontraron problemas con saltos de línea!${COLORS.reset}`)
    }
  } catch (error) {
    console.error(`${COLORS.red}Error durante el análisis:${COLORS.reset}`, error)
  }
}

// Ejecutar el análisis si se llama directamente
if (require.main === module) {
  const rootDir = process.argv[2] || "."
  analyzeDirectory(rootDir)
}

module.exports = {
  detectNewlineIssues,
  findJsFiles,
  analyzeDirectory,
}
