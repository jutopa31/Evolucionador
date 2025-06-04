const fs = require("fs")
const path = require("path")
const { parse } = require("@babel/parser")

// Directorio a escanear
const directoryToScan = "./"

// Extensiones de archivos a verificar
const fileExtensions = [".js", ".jsx", ".ts", ".tsx"]

// Función para verificar template strings en un archivo
function checkTemplateStrings(filePath) {
  try {
    const code = fs.readFileSync(filePath, "utf8")

    // Buscar patrones problemáticos en template strings
    const problematicPatterns = [
      { pattern: /`.*\$\{.*\\n.*\}.*`/g, message: "Posible problema con \\n dentro de template string" },
      {
        pattern: /`.*\$\{.*\\.*\}.*`/g,
        message: "Posible problema con caracteres de escape dentro de template string",
      },
    ]

    const issues = []

    problematicPatterns.forEach(({ pattern, message }) => {
      const matches = code.match(pattern)
      if (matches) {
        matches.forEach((match) => {
          issues.push({ match, message })
        })
      }
    })

    // Intentar parsear el código para detectar errores de sintaxis
    try {
      parse(code, {
        sourceType: "module",
        plugins: ["jsx", "typescript"],
      })
    } catch (parseError) {
      issues.push({
        message: "Error de sintaxis",
        details: parseError.message,
        line: parseError.loc?.line,
        column: parseError.loc?.column,
      })
    }

    return { file: filePath, issues }
  } catch (error) {
    return {
      file: filePath,
      issues: [{ message: "Error al leer o procesar el archivo", details: error.message }],
    }
  }
}

// Función para escanear directorios recursivamente (igual que en el script anterior)
function scanDirectory(directory) {
  // ... (mismo código que en el script anterior)
}

// Ejecutar la verificación
console.log("Verificando template strings en archivos JavaScript...")
const files = scanDirectory(directoryToScan)
console.log(`Encontrados ${files.length} archivos para verificar.`)

const results = files.map(checkTemplateStrings)
const filesWithIssues = results.filter((r) => r.issues.length > 0)

if (filesWithIssues.length > 0) {
  console.error(`❌ ${filesWithIssues.length} archivos con posibles problemas en template strings:`)
  filesWithIssues.forEach((result) => {
    console.error(`\nArchivo: ${result.file}`)
    result.issues.forEach((issue) => {
      console.error(`- ${issue.message}`)
      if (issue.details) console.error(`  Detalles: ${issue.details}`)
      if (issue.line) console.error(`  Línea: ${issue.line}, Columna: ${issue.column}`)
      if (issue.match) console.error(`  Coincidencia: ${issue.match}`)
    })
  })
  process.exit(1) // Salir con código de error
} else {
  console.log("¡No se encontraron problemas con template strings!")
}
