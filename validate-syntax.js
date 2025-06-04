const fs = require("fs")
const path = require("path")
const { execSync } = require("child_process")

// Directorio a escanear (puedes cambiarlo según tu estructura)
const directoryToScan = "./"

// Extensiones de archivos a verificar
const fileExtensions = [".js", ".jsx", ".ts", ".tsx"]

// Función para verificar la sintaxis de un archivo
function checkSyntax(filePath) {
  try {
    // Usamos Node.js para verificar la sintaxis sin ejecutar el código
    execSync(`node --check "${filePath}"`, { stdio: "pipe" })
    return { file: filePath, valid: true }
  } catch (error) {
    return {
      file: filePath,
      valid: false,
      error: error.stderr.toString(),
    }
  }
}

// Función para escanear directorios recursivamente
function scanDirectory(directory) {
  const files = []

  const items = fs.readdirSync(directory)

  for (const item of items) {
    const itemPath = path.join(directory, item)
    const stats = fs.statSync(itemPath)

    // Ignorar node_modules y directorios ocultos
    if (item === "node_modules" || item.startsWith(".")) {
      continue
    }

    if (stats.isDirectory()) {
      files.push(...scanDirectory(itemPath))
    } else if (stats.isFile() && fileExtensions.includes(path.extname(itemPath))) {
      files.push(itemPath)
    }
  }

  return files
}

// Ejecutar la verificación
console.log("Verificando sintaxis de archivos JavaScript...")
const files = scanDirectory(directoryToScan)
console.log(`Encontrados ${files.length} archivos para verificar.`)

const results = files.map(checkSyntax)
const validFiles = results.filter((r) => r.valid)
const invalidFiles = results.filter((r) => !r.valid)

console.log(`✅ ${validFiles.length} archivos con sintaxis válida.`)

if (invalidFiles.length > 0) {
  console.error(`❌ ${invalidFiles.length} archivos con errores de sintaxis:`)
  invalidFiles.forEach((result) => {
    console.error(`\nArchivo: ${result.file}`)
    console.error(result.error)
  })
  process.exit(1) // Salir con código de error
} else {
  console.log("¡Todos los archivos tienen sintaxis válida!")
}
