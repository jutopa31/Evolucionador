# 🧪 Guía de Uso - Sistema de Testing Suite Neurología

## 🚀 Cómo Usar el Sistema de Testing

### 1. **Desde la Aplicación Principal**

El sistema de testing está integrado en Suite Neurología y se puede acceder de varias formas:

#### **Opción A: Consola del Navegador**
```javascript
// Ejecutar todos los tests
window.Testing.runAll()

// Ejecutar tests por categoría
window.Testing.runCategory('dom-helpers')
window.Testing.runCategory('medication-manager')
window.Testing.runCategory('note-builder')

// Ejecutar solo tests de rendimiento
window.Testing.runPerformance()

// Ejecutar solo tests de integración
window.Testing.runIntegration()
```

#### **Opción B: Demo HTML Interactiva**
1. Abrir `test-demo.html` en el navegador
2. Usar los botones para ejecutar diferentes tipos de tests
3. Ver resultados en tiempo real en la consola visual

### 2. **Desde Node.js (Desarrollo)**

```bash
# Ejecutar test simple de demostración
node test-simple.mjs

# Ejecutar tests específicos de Suite Neurología
node test-suite-neurologia.js
```

## 📋 Tipos de Tests Disponibles

### 1. **Tests de DOM Helpers**
Validan las funciones auxiliares de manipulación DOM:

```javascript
// Ejemplo de test DOM
testRunner.test('DOM - cache de elementos', () => {
  const element = getElement('test-id');
  assert.exists(element, 'Elemento debe existir');
  assert.isType(element, 'object', 'Debe ser un elemento DOM');
});
```

### 2. **Tests de Medication Manager**
Verifican la gestión de medicamentos:

```javascript
// Ejemplo de test de medicamentos
testRunner.test('Medicamentos - agregar medicamento', () => {
  const initialCount = getCurrentBed().meds.length;
  addMedication('Paracetamol 500mg');
  assert.equals(getCurrentBed().meds.length, initialCount + 1);
});
```

### 3. **Tests de Note Builder**
Validan la construcción de notas médicas:

```javascript
// Ejemplo de test de construcción de notas
testRunner.test('Notas - construcción completa', () => {
  const note = buildNote();
  assert.isType(note, 'string', 'Nota debe ser string');
  assert.isTrue(note.length > 0, 'Nota no debe estar vacía');
});
```

### 4. **Tests de Rendimiento**
Miden la velocidad de operaciones críticas:

```javascript
// Ejemplo de test de rendimiento
testRunner.test('Rendimiento - sincronización chips', () => {
  const start = performance.now();
  syncChips();
  const duration = performance.now() - start;
  assert.isTrue(duration < 50, `Debe ser rápido: ${duration}ms`);
}, { category: 'performance' });
```

## 🔧 Crear Tests Personalizados

### 1. **Test Básico**
```javascript
import { testRunner, assert } from './modules/tests/test-runner.js';

testRunner.test('Mi test personalizado', () => {
  const resultado = miFuncion();
  assert.equals(resultado, valorEsperado, 'Descripción del test');
});
```

### 2. **Test con Mock**
```javascript
import { testRunner, assert, mock } from './modules/tests/test-runner.js';

testRunner.test('Test con función mock', () => {
  const mockFn = mock.fn();
  
  // Usar la función mock
  miModulo.setCallback(mockFn);
  miModulo.ejecutar();
  
  // Verificar que se llamó
  assert.equals(mockFn.callCount, 1, 'Callback debe llamarse una vez');
});
```

### 3. **Test Asíncrono**
```javascript
testRunner.test('Test asíncrono', async () => {
  const resultado = await miOperacionAsincrona();
  assert.exists(resultado, 'Debe retornar un resultado');
});
```

### 4. **Test con Categoría**
```javascript
testRunner.test('Test de integración', () => {
  // Lógica del test
}, { category: 'integration' });
```

## 📊 Interpretar Resultados

### **Resultado Exitoso**
```
✅ Mi test (2.34ms)
```
- ✅ = Test pasó
- Tiempo de ejecución en milisegundos

### **Resultado Fallido**
```
❌ Mi test: Expected 5, got 3
```
- ❌ = Test falló
- Mensaje descriptivo del error

### **Resumen Final**
```
📊 RESULTADOS FINALES
=====================
📈 Total: 15
✅ Pasaron: 14
❌ Fallaron: 1
📊 Tasa de éxito: 93%
```

## 🎯 Mejores Prácticas

### 1. **Nombres Descriptivos**
```javascript
// ❌ Malo
testRunner.test('test1', () => { ... });

// ✅ Bueno
testRunner.test('Medicamentos - debe agregar medicamento válido', () => { ... });
```

### 2. **Mensajes de Error Claros**
```javascript
// ❌ Malo
assert.equals(result, 5);

// ✅ Bueno
assert.equals(result, 5, 'La suma de 2+3 debe ser 5');
```

### 3. **Tests Independientes**
```javascript
// Cada test debe poder ejecutarse independientemente
testRunner.beforeEach(() => {
  // Configuración limpia para cada test
  resetAppState();
});
```

### 4. **Categorización**
```javascript
// Agrupar tests relacionados
testRunner.test('DOM - elemento existe', () => { ... }, { category: 'dom' });
testRunner.test('DOM - elemento se crea', () => { ... }, { category: 'dom' });
```

## 🚨 Solución de Problemas

### **Error: "Module not found"**
```javascript
// Verificar que la ruta de importación sea correcta
import { testRunner } from './modules/tests/test-runner.js';
```

### **Error: "assert is not defined"**
```javascript
// Asegurarse de importar assert
import { testRunner, assert } from './modules/tests/test-runner.js';
```

### **Tests no se ejecutan**
```javascript
// Verificar que se llame a run()
testRunner.run().then(results => {
  console.log('Tests completados:', results);
});
```

## 📈 Métricas y Reportes

### **Ejecutar con Métricas Detalladas**
```javascript
const results = await testRunner.run({ 
  verbose: true,
  includePerformance: true 
});

console.log('Estadísticas:', results.stats);
console.log('Tests más lentos:', results.slowest);
```

### **Generar Reporte HTML**
```javascript
import { generateHtmlReport } from './modules/tests/run-all-tests.js';

const results = await testRunner.run();
const htmlReport = await generateHtmlReport(results);
// Guardar o mostrar el reporte HTML
```

## 🔄 Integración Continua

### **Script de CI/CD**
```bash
#!/bin/bash
echo "Ejecutando tests de Suite Neurología..."

# Ejecutar tests
node test-simple.mjs

# Verificar código de salida
if [ $? -eq 0 ]; then
  echo "✅ Todos los tests pasaron"
  exit 0
else
  echo "❌ Algunos tests fallaron"
  exit 1
fi
```

## 📚 Recursos Adicionales

- **Documentación completa**: `modules/tests/README.md`
- **Ejemplos de tests**: `modules/tests/*.test.js`
- **Demo interactiva**: `test-demo.html`
- **Tests de Suite Neurología**: `test-suite-neurologia.js`

---

**¡El sistema de testing está listo para usar!** 🎉

Comienza ejecutando `window.Testing.runAll()` en la consola del navegador para ver todos los tests en acción. 