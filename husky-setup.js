const { execSync } = require("child_process")
const fs = require("fs")

// Instalar Husky y lint-staged
console.log("Instalando Husky y lint-staged...")
execSync("npm install --save-dev husky lint-staged")

// Configurar Husky
console.log("Configurando Husky...")
execSync("npx husky install")
execSync('npm set-script prepare "husky install"')

// Crear pre-commit hook
console.log("Creando pre-commit hook...")
execSync('npx husky add .husky/pre-commit "npx lint-staged"')

// Configurar lint-staged
const lintStagedConfig = {
  "*.js": [
    "node --check", // Verificar sintaxis
    "eslint --fix", // Ejecutar ESLint y arreglar problemas automáticamente
  ],
}

fs.writeFileSync(".lintstagedrc.json", JSON.stringify(lintStagedConfig, null, 2))

console.log("Configuración de Husky y lint-staged completada.")
console.log("Ahora se verificará la sintaxis de los archivos JavaScript antes de cada commit.")
