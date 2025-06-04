/**
 * Script específico para verificar problemas con template strings
 * Este script se enfoca en detectar errores comunes en template strings
 * que podrían causar problemas similares al que se corrigió
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
 * Verifica si un template string tiene problemas potenciales
 * @param {string} content Contenido del archivo
 * @param {string} filePath Ruta del archivo
 * @returns {Array} Lista de problemas encontrados
 */
function checkTemplateStrings(content, filePath) {
  const lines = content.split("\n")
  const issues = []

  // Buscar todos los template strings en el archivo
  const templateStringRegex = /`([^`]*)`/g
  let match

  while ((match = templateStringRegex.exec(content)) !== null) {
    const templateContent = match[1]
    const startIndex = match.index

    // Calcular número de línea
    let lineNumber = 1
    let currentPos = 0

    for (let i = 0; i < lines.length; i++) {
      if (currentPos + lines[i].length >= startIndex) {
        lineNumber = i + 1
        break
      }
      currentPos += lines[i].length + 1 // +1 por el \n
    }

    // Verificar problemas específicos

    // 1. Template string con salto de línea literal
    if (templateContent.includes("\n")) {
      issues.push({
        type: "newline_in_template",
        severity: "WARNING",
        message: "Template string con salto de línea literal",
        line: lineNumber,
        file: filePath,
        content: templateContent.substring(0, 50) + (templateContent.length > 50 ? "..." : ""),
      })
    }

    // 2. Template string con posible escape incorrecto
    if (templateContent.includes("\\n") && !templateContent.includes("\\\\n")) {
      issues.push({
        type: "escape_sequence",
        severity: "INFO",
        message: "Template string con secuencia de escape \\n que podría necesitar doble escape",
        line: lineNumber,
        file: filePath,
        content: templateContent.substring(0, 50) + (templateContent.length > 50 ? "..." : ""),
      })
    }

    // 3. Template string con interpolación que podría ser problemática
    const interpolationRegex = /\${([^}]*)}/g
    let interpolationMatch

    while ((interpolationMatch = interpolationRegex.exec(templateContent)) !== null) {
      const interpolationContent = interpolationMatch[1]

      // Verificar interpolaciones vacías
      if (interpolationContent.trim() === "") {
        issues.push({
          type: "empty_interpolation",
          severity: "WARNING",
          message: "Interpolación vacía en template string",
          line: lineNumber,
          file: filePath,
          content: templateContent.substring(0, 50) + (templateContent.length > 50 ? "..." : ""),
        })
      }

      // Verificar interpolaciones con comillas sin escape
      if (interpolationContent.includes('"') || interpolationContent.includes("'")) {
        issues.push({
          type: "quotes_in_interpolation",
          severity: "INFO",
          message: "Interpolación con comillas que podrían necesitar escape",
          line: lineNumber,
          file: filePath,
          content: templateContent.substring(0, 50) + (templateContent.length > 50 ? "..." : ""),
        })
      }
    }

    // 4. Template string con caracteres especiales que podrían causar problemas
    if (templateContent.includes("`") || (templateContent.includes("${") && !templateContent.match(/\${[^}]*}/))) {
      issues.push({
        type: "special_chars",
        severity: "WARNING",
        message: "Template string con caracteres especiales que podrían necesitar escape",
        line: lineNumber,
        file: filePath,
        content: templateContent.substring(0, 50) + (templateContent.length > 50 ? "..." : ""),
      })
    }
  }

  return issues
}

/**
 * Encuentra todos los archivos JavaScript en un directorio
 * @param {string} dir Directorio a recorrer
 * @param {Array} extensions Extensiones de archivo a buscar
 * @returns {Promise<Array>} Lista de rutas de archivos
 */
async function findFiles(dir, extensions = [".js", ".jsx", ".ts", ".tsx"]) {
  const files = []
  const entries = await readdir(dir)

  for (const entry of entries) {
    if (entry === "node_modules" || entry === ".git") continue

    const fullPath = path.join(dir, entry)
    const stats = await stat(fullPath)

    if (stats.isDirectory()) {
      const subFiles = await findFiles(fullPath, extensions)
      files.push(...subFiles)
    } else if (stats.isFile() && extensions.includes(path.extname(fullPath))) {
      files.push(fullPath)
    }
  }

  return files
}

/**
 * Analiza un archivo en busca de problemas con template strings
 * @param {string} filePath Ruta del archivo a analizar
 * @returns {Promise<Array>} Lista de problemas encontrados
 */
async function analyzeFile(filePath) {
  try {
    const content = await readFile(filePath, "utf8")
    return checkTemplateStrings(content, filePath)
  } catch (error) {
    console.error(`Error al analizar ${filePath}:`, error.message)
    return []
  }
}

/**
 * Analiza todos los archivos JavaScript en un directorio
 * @param {string} rootDir Directorio raíz para comenzar el análisis
 */
async function analyzeDirectory(rootDir) {
  console.log(`${COLORS.cyan}Analizando template strings en ${rootDir}...${COLORS.reset}`)

  try {
    const files = await findFiles(rootDir)
    console.log(`${COLORS.blue}Encontrados ${files.length} archivos para analizar${COLORS.reset}`)

    let allIssues = []
    let filesWithIssues = 0

    for (const file of files) {
      const issues = await analyzeFile(file)

      if (issues.length > 0) {
        allIssues = [...allIssues, ...issues]
        filesWithIssues++
        process.stdout.write("!")
      } else {
        process.stdout.write(".")
      }
    }

    console.log("\n")

    // Mostrar resumen
    console.log(`${COLORS.cyan}=== Resumen del análisis de template strings ===${COLORS.reset}`)
    console.log(`${COLORS.blue}Archivos analizados: ${files.length}${COLORS.reset}`)
    console.log(`${COLORS.yellow}Archivos con problemas: ${filesWithIssues}${COLORS.reset}`)
    console.log(`${COLORS.red}Total de problemas: ${allIssues.length}${COLORS.reset}\n`)

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
        console.log(`\n${COLORS.yellow}--- ${type.toUpperCase()} (${issues.length}) ---${COLORS.reset}`)

        issues.forEach((issue) => {
          console.log(`\n${COLORS.yellow}[${issue.severity}] ${issue.message}${COLORS.reset}`)
          console.log(`Archivo: ${issue.file}`)
          console.log(`Línea: ${issue.line}`)
          console.log(`Contenido: "${issue.content}"`)
        })
      }

      // Sugerencias para corregir problemas comunes
      console.log(`\n${COLORS.cyan}=== Sugerencias para corregir problemas comunes ===${COLORS.reset}`)

      if (problemsByType.newline_in_template) {
        console.log(`\n${COLORS.yellow}Para template strings con saltos de línea:${COLORS.reset}`)
        console.log(`- Usa concatenación explícita con "\\n" en lugar de saltos de línea literales`)
        console.log(`- Ejemplo: \`Línea 1\\nLínea 2\` en lugar de \`Línea 1\nLínea 2\``)
      }

      if (problemsByType.escape_sequence) {
        console.log(`\n${COLORS.yellow}Para secuencias de escape en template strings:${COLORS.reset}`)
        console.log(`- Asegúrate de que las secuencias de escape estén correctamente formateadas`)
        console.log(`- Para incluir un "\\n" literal en un template string, usa "\\\\n"`)
      }

      if (problemsByType.empty_interpolation) {
        console.log(`\n${COLORS.yellow}Para interpolaciones vacías:${COLORS.reset}`)
        console.log(`- Elimina las interpolaciones vacías o asegúrate de que contengan valores válidos`)
        console.log(`- Ejemplo: \`Valor: \${valor || ''}\` en lugar de \`Valor: \${ }\``)
      }
    } else {
      console.log(`${COLORS.green}¡No se encontraron problemas con template strings!${COLORS.reset}`)
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
  checkTemplateStrings,
  analyzeFile,
  analyzeDirectory,
}
