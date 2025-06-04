/**
 * Script para corregir automáticamente problemas comunes con template strings
 * ADVERTENCIA: Este script modifica archivos. Haz una copia de seguridad antes de ejecutarlo.
 */

const fs = require("fs")
const path = require("path")
const { promisify } = require("util")
const { checkTemplateStrings } = require("./template-string-checker")

const readFile = promisify(fs.readFile)
const writeFile = promisify(fs.writeFile)
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
 * Corrige problemas con template strings en un archivo
 * @param {string} filePath Ruta del archivo a corregir
 * @returns {Promise<Object>} Resultado de la corrección
 */
async function fixTemplateStringsInFile(filePath) {
  try {
    const content = await readFile(filePath, "utf8")
    const issues = checkTemplateStrings(content, filePath)

    if (issues.length === 0) {
      return { file: filePath, fixed: false, message: "No se encontraron problemas" }
    }

    let modifiedContent = content
    let fixCount = 0

    // Corregir problemas específicos

    // 1. Template strings con saltos de línea literal
    const newlineIssues = issues.filter((issue) => issue.type === "newline_in_template")

    if (newlineIssues.length > 0) {
      // Esta corrección es más compleja y requiere análisis de contexto
      // Por seguridad, solo identificamos los problemas pero no los corregimos automáticamente
      console.log(
        `${COLORS.yellow}[ADVERTENCIA] Se encontraron ${newlineIssues.length} template strings con saltos de línea en ${filePath}${COLORS.reset}`,
      )
      console.log(`${COLORS.yellow}Estos problemas deben corregirse manualmente para evitar errores.${COLORS.reset}`)

      // Mostrar las líneas problemáticas
      newlineIssues.forEach((issue) => {
        console.log(`  - Línea ${issue.line}: "${issue.content}"`)
      })
    }

    // 2. Corregir problemas de escape en template strings
    const escapeRegex = /`([^`]*?)\\n([^`]*?)`/g
    modifiedContent = modifiedContent.replace(escapeRegex, (match, before, after) => {
      fixCount++
      return `\`${before}\` + "\\n" + \`${after}\`` // Reemplazar con concatenación explícita
    })

    // 3. Corregir interpolaciones vacías
    const emptyInterpolationRegex = /\${(\s*)}/g
    modifiedContent = modifiedContent.replace(emptyInterpolationRegex, (match, spaces) => {
      fixCount++
      return '${""}' // Reemplazar con string vacío
    })

    // Solo guardar si se hicieron cambios
    if (modifiedContent !== content) {
      await writeFile(filePath, modifiedContent, "utf8")
      return {
        file: filePath,
        fixed: true,
        count: fixCount,
        message: `Se corrigieron ${fixCount} problemas`,
      }
    }

    return {
      file: filePath,
      fixed: false,
      count: 0,
      message: "Se encontraron problemas pero requieren corrección manual",
    }
  } catch (error) {
    console.error(`Error al corregir ${filePath}:`, error.message)
    return { file: filePath, fixed: false, error: error.message }
  }
}

/**
 * Corrige problemas con template strings en todos los archivos de un directorio
 * @param {string} rootDir Directorio raíz para comenzar la corrección
 * @param {boolean} dryRun Si es true, solo muestra los cambios sin aplicarlos
 */
async function fixTemplateStrings(rootDir, dryRun = true) {
  console.log(
    `${COLORS.cyan}Buscando y ${dryRun ? "analizando" : "corrigiendo"} problemas con template strings en ${rootDir}...${COLORS.reset}`,
  )
  console.log(
    `${dryRun ? COLORS.yellow + "[MODO SIMULACIÓN]" + COLORS.reset + " No se realizarán cambios reales." : COLORS.red + "[MODO CORRECCIÓN]" + COLORS.reset + " Se modificarán los archivos."}`,
  )

  try {
    const files = await findFiles(rootDir)
    console.log(`${COLORS.blue}Encontrados ${files.length} archivos para analizar${COLORS.reset}`)

    let fixedFiles = 0
    let totalFixes = 0
    let filesWithManualFixes = 0

    for (const file of files) {
      if (dryRun) {
        // En modo simulación, solo analizamos
        const content = await readFile(file, "utf8")
        const issues = checkTemplateStrings(content, file)

        if (issues.length > 0) {
          process.stdout.write("!")
          filesWithManualFixes++
        } else {
          process.stdout.write(".")
        }
      } else {
        // En modo corrección, intentamos corregir
        const result = await fixTemplateStringsInFile(file)

        if (result.fixed) {
          process.stdout.write("F") // Fixed
          fixedFiles++
          totalFixes += result.count
        } else if (result.error) {
          process.stdout.write("E") // Error
        } else if (result.message.includes("manual")) {
          process.stdout.write("M") // Manual fix needed
          filesWithManualFixes++
        } else {
          process.stdout.write(".") // No issues
        }
      }
    }

    console.log("\n")

    // Mostrar resumen
    if (dryRun) {
      console.log(`${COLORS.cyan}=== Resumen del análisis (SIMULACIÓN) ===${COLORS.reset}`)
      console.log(`${COLORS.blue}Archivos analizados: ${files.length}${COLORS.reset}`)
      console.log(
        `${COLORS.yellow}Archivos con problemas que requieren corrección manual: ${filesWithManualFixes}${COLORS.reset}`,
      )

      if (filesWithManualFixes > 0) {
        console.log(`\n${COLORS.yellow}Para corregir estos archivos, ejecuta:${COLORS.reset}`)
        console.log(`node fix-template-strings.js ${rootDir} --fix`)
      } else {
        console.log(`\n${COLORS.green}¡No se encontraron problemas que requieran corrección!${COLORS.reset}`)
      }
    } else {
      console.log(`${COLORS.cyan}=== Resumen de la corrección ===${COLORS.reset}`)
      console.log(`${COLORS.blue}Archivos analizados: ${files.length}${COLORS.reset}`)
      console.log(`${COLORS.green}Archivos corregidos automáticamente: ${fixedFiles}${COLORS.reset}`)
      console.log(`${COLORS.green}Total de correcciones realizadas: ${totalFixes}${COLORS.reset}`)
      console.log(`${COLORS.yellow}Archivos que requieren corrección manual: ${filesWithManualFixes}${COLORS.reset}`)

      if (filesWithManualFixes > 0) {
        console.log(
          `\n${COLORS.yellow}Algunos problemas requieren corrección manual. Revisa los mensajes anteriores.${COLORS.reset}`,
        )
      }
    }
  } catch (error) {
    console.error(`${COLORS.red}Error durante la corrección:${COLORS.reset}`, error)
  }
}

// Ejecutar la corrección si se llama directamente
if (require.main === module) {
  const rootDir = process.argv[2] || "."
  const fixMode = process.argv.includes("--fix")

  fixTemplateStrings(rootDir, !fixMode)
}

module.exports = {
  fixTemplateStringsInFile,
  fixTemplateStrings,
}
