// Este archivo muestra cómo configurar ESLint para tu proyecto
// Puedes ejecutarlo como un script de configuración o simplemente seguir los pasos manualmente

const { execSync } = require("child_process")
const fs = require("fs")

// Instalar ESLint y plugins necesarios
console.log("Instalando ESLint y plugins...")
execSync("npm install --save-dev eslint eslint-plugin-react eslint-plugin-import")

// Crear archivo de configuración de ESLint
const eslintConfig = {
  env: {
    browser: true,
    es2021: true,
    node: true,
  },
  extends: ["eslint:recommended"],
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    ecmaFeatures: {
      jsx: true,
    },
  },
  rules: {
    "no-unused-vars": "warn",
    "no-console": "off",
    "no-template-curly-in-string": "error", // Detecta errores en template strings
    "no-unexpected-multiline": "error", // Detecta errores de sintaxis en múltiples líneas
    "no-unreachable": "error", // Detecta código inalcanzable
    "valid-typeof": "error", // Asegura que las comparaciones typeof sean válidas
  },
}

fs.writeFileSync(".eslintrc.json", JSON.stringify(eslintConfig, null, 2))

// Crear script en package.json para ejecutar ESLint
console.log("Añadiendo script de lint a package.json...")
try {
  const packageJson = JSON.parse(fs.readFileSync("package.json", "utf8"))

  if (!packageJson.scripts) {
    packageJson.scripts = {}
  }

  packageJson.scripts.lint = 'eslint "**/*.js"'
  packageJson.scripts["lint:fix"] = 'eslint "**/*.js" --fix'

  fs.writeFileSync("package.json", JSON.stringify(packageJson, null, 2))
} catch (error) {
  console.error("No se pudo actualizar package.json. Asegúrate de tener un archivo package.json válido.")
  console.error("Añade manualmente estos scripts:")
  console.log('"lint": "eslint \\"**/*.js\\""')
  console.log('"lint:fix": "eslint \\"**/*.js\\" --fix"')
}

console.log('Configuración de ESLint completada. Puedes ejecutar "npm run lint" para verificar errores de sintaxis.')
