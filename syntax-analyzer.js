/**
 * Script para analizar el código JavaScript en busca de problemas comunes de sintaxis
 * Especialmente enfocado en template strings y problemas similares al error corregido
 */

const fs = require("fs")
const path = require("path")
const { promisify } = require("util")

const readdir = promisify(fs.readdir)
const readFile = promisify(fs.readFile)
const stat = promisify(fs.stat)

// Patrones problemáticos a buscar
const PATTERNS = [
  {
    name: "Template string con salto de línea literal",
    regex: /`[^`]*\n[^`]*`/g,
    severity: "WARNING",
    description: "Template string con salto de línea literal que podría causar problemas",
    suggestion: 'Considera usar concatenación explícita con "\\n" en lugar de saltos de línea literales',
  },
  {
    name: "Template string con posible interpolación incorrecta",
    regex: /`[^`]*\${[^}]*}[^`]*`/g,
    severity: "INFO",
    description: "Template string con interpolación que debería revisarse",
    suggestion: "Verifica que la interpolación ${...} esté correctamente formateada",
  },
  {
    name: "Concatenación de strings con posible error",
    regex: /['"]\s*\+\s*['"]/g,
    severity: "INFO",
    description: "Concatenación de strings que podría simplificarse",
    suggestion: "Considera usar template strings o concatenar sin espacios innecesarios",
  },
  {
    name: "Posible error en JSON.stringify",
    regex: /JSON\.stringify$$[^)]*,\s*null\s*,\s*[^)]*$$/g,
    severity: "INFO",
    description: "Uso de JSON.stringify con formato que podría causar problemas",
    suggestion: "Verifica que los parámetros de JSON.stringify sean correctos",
  },
  {
    name: "Comentario dentro de string",
    regex: /['"`][^'"`]*\/\/[^'"`]*['"`]/g,
    severity: "WARNING",
    description: "Posible comentario dentro de un string que podría causar confusión",
    suggestion: "Verifica que no haya comentarios accidentales dentro de strings",
  },
  {
    name: "HTML en JavaScript sin escape",
    regex: /['"`][^'"`]*<[a-zA-Z][^>]*>[^'"`]*['"`]/g,
    severity: "INFO",
    description: "HTML dentro de strings que podría necesitar escape",
    suggestion: "Considera usar funciones de escape para HTML o template literals adecuados",
  },
]

// Archivos y directorios a ignorar
const IGNORE_DIRS = ["node_modules", ".git", "dist", "build"]
const IGNORE_FILES = [".DS_Store", "package-lock.json", "yarn.lock"]
const FILE_EXTENSIONS = [".js", ".jsx", ".ts", ".tsx"]

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
 * Analiza un archivo en busca de patrones problemáticos
 * @param {string} filePath Ruta del archivo a analizar
 * @returns {Promise<Array>} Lista de problemas encontrados
 */
async function analyzeFile(filePath) {
  try {
    const content = await readFile(filePath, "utf8")
    const lines = content.split("\n")
    const issues = []

    // Buscar patrones problemáticos
    PATTERNS.forEach((pattern) => {
      const matches = [...content.matchAll(pattern.regex)]

      matches.forEach((match) => {
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
          pattern: pattern.name,
          severity: pattern.severity,
          description: pattern.description,
          suggestion: pattern.suggestion,
          context: context.trim(),
        })
      })
    })

    // Análisis específico para template strings con saltos de línea
    const templateStringRegex = /`([^`]*)`/g
    let match

    while ((match = templateStringRegex.exec(content)) !== null) {
      const templateContent = match[1]

      // Verificar si hay saltos de línea literales
      if (templateContent.includes("\n")) {
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

        // Extraer contexto (línea donde comienza el template string)
        const context = lines[lineNumber - 1] || ""

        issues.push({
          file: filePath,
          line: lineNumber,
          pattern: "Template string con salto de línea",
          severity: "WARNING",
          description: "Template string que contiene saltos de línea literales",
          suggestion: 'Considera usar "\\n" explícito en lugar de saltos de línea literales para mayor claridad',
          context: context.trim(),
        })
      }
    }

    return issues
  } catch (error) {
    console.error(`Error al analizar ${filePath}:`, error.message)
    return []
  }
}

/**
 * Recorre recursivamente un directorio buscando archivos JavaScript
 * @param {string} dir Directorio a recorrer
 * @returns {Promise<Array>} Lista de rutas de archivos JavaScript
 */
async function findJsFiles(dir) {
  const files = []

  try {
    const entries = await readdir(dir)

    for (const entry of entries) {
      const fullPath = path.join(dir, entry)

      // Ignorar archivos y directorios específicos
      if (IGNORE_DIRS.includes(entry) || IGNORE_FILES.includes(entry)) {
        continue
      }

      const stats = await stat(fullPath)

      if (stats.isDirectory()) {
        const subFiles = await findJsFiles(fullPath)
        files.push(...subFiles)
      } else if (stats.isFile() && FILE_EXTENSIONS.includes(path.extname(fullPath))) {
        files.push(fullPath)
      }
    }
  } catch (error) {
    console.error(`Error al leer directorio ${dir}:`, error.message)
  }

  return files
}

/**
 * Función principal que analiza todos los archivos JavaScript en un directorio
 * @param {string} rootDir Directorio raíz para comenzar el análisis
 */
async function analyzeCodebase(rootDir) {
  console.log(`${COLORS.cyan}Analizando código en ${rootDir}...${COLORS.reset}`)

  try {
    // Encontrar todos los archivos JavaScript
    const files = await findJsFiles(rootDir)
    console.log(`${COLORS.blue}Encontrados ${files.length} archivos para analizar${COLORS.reset}`)

    // Analizar cada archivo
    let allIssues = []

    for (const file of files) {
      const issues = await analyzeFile(file)
      allIssues = [...allIssues, ...issues]

      // Mostrar progreso
      if (issues.length > 0) {
        process.stdout.write("!")
      } else {
        process.stdout.write(".")
      }
    }

    console.log("\n")

    // Agrupar problemas por severidad
    const warnings = allIssues.filter((issue) => issue.severity === "WARNING")
    const infos = allIssues.filter((issue) => issue.severity === "INFO")

    // Mostrar resumen
    console.log(`${COLORS.cyan}=== Resumen del análisis ===${COLORS.reset}`)
    console.log(`${COLORS.yellow}Advertencias: ${warnings.length}${COLORS.reset}`)
    console.log(`${COLORS.blue}Información: ${infos.length}${COLORS.reset}`)
    console.log(`${COLORS.cyan}Total de problemas: ${allIssues.length}${COLORS.reset}\n`)

    // Mostrar problemas encontrados
    if (allIssues.length > 0) {
      console.log(`${COLORS.cyan}=== Problemas encontrados ===${COLORS.reset}`)

      // Primero mostrar advertencias
      if (warnings.length > 0) {
        console.log(`\n${COLORS.yellow}--- ADVERTENCIAS ---${COLORS.reset}`)
        warnings.forEach((issue) => {
          console.log(`\n${COLORS.yellow}[${issue.severity}] ${issue.pattern}${COLORS.reset}`)
          console.log(`Archivo: ${issue.file}`)
          console.log(`Línea: ${issue.line}`)
          console.log(`Contexto: "${issue.context}"`)
          console.log(`Descripción: ${issue.description}`)
          console.log(`Sugerencia: ${issue.suggestion}`)
        })
      }

      // Luego mostrar información
      if (infos.length > 0) {
        console.log(`\n${COLORS.blue}--- INFORMACIÓN ---${COLORS.reset}`)
        infos.forEach((issue) => {
          console.log(`\n${COLORS.blue}[${issue.severity}] ${issue.pattern}${COLORS.reset}`)
          console.log(`Archivo: ${issue.file}`)
          console.log(`Línea: ${issue.line}`)
          console.log(`Contexto: "${issue.context}"`)
          console.log(`Descripción: ${issue.description}`)
          console.log(`Sugerencia: ${issue.suggestion}`)
        })
      }
    } else {
      console.log(`${COLORS.green}¡No se encontraron problemas!${COLORS.reset}`)
    }
  } catch (error) {
    console.error(`${COLORS.red}Error durante el análisis:${COLORS.reset}`, error)
  }
}

// Ejecutar el análisis si se llama directamente
if (require.main === module) {
  const rootDir = process.argv[2] || "."
  analyzeCodebase(rootDir)
}

module.exports = {
  analyzeFile,
  findJsFiles,
  analyzeCodebase,
}
