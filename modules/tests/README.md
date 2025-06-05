# 🧪 Sistema de Testing - Suite Neurología v2.1.0

## Descripción General

Este directorio contiene la suite completa de tests para validar todas las funcionalidades optimizadas de Suite Neurología. El sistema de testing está diseñado para ser robusto, eficiente y fácil de mantener.

## 📁 Estructura de Archivos

```
tests/
├── test-runner.js           # Motor principal de testing
├── run-all-tests.js         # Ejecutor principal y configuración
├── dom-helpers.test.js      # Tests para módulo DOM helpers
├── medication-manager.test.js # Tests para gestión de medicamentos
├── note-builder.test.js     # Tests para construcción de notas
└── README.md               # Esta documentación
```

## 🚀 Inicio Rápido

### Ejecutar Todos los Tests

```javascript
import { runAllTests } from './tests/run-all-tests.js';

// Ejecutar suite completa
const results = await runAllTests();
console.log(`Tests completados: ${results.passed}/${results.total} exitosos`);
```

### Ejecutar Tests por Categoría

```javascript
import { runTestCategory } from './tests/run-all-tests.js';

// Ejecutar solo tests de DOM helpers
await runTestCategory('dom-helpers');

// Ejecutar solo tests de medicamentos
await runTestCategory('medication-manager');

// Ejecutar solo tests de construcción de notas
await runTestCategory('note-builder');
```

### Ejecutar Tests Específicos

```javascript
import { runPerformanceTests, runIntegrationTests } from './tests/run-all-tests.js';

// Solo tests de rendimiento
await runPerformanceTests();

// Solo tests de integración
await runIntegrationTests();
```

## 📊 Categorías de Tests

### 🎯 DOM Helpers (`dom-helpers`)
- **Cobertura**: Funciones de manipulación DOM optimizadas
- **Tests incluidos**: 15 tests
- **Funcionalidades probadas**:
  - Cache de elementos DOM
  - Validación de parámetros
  - Inserción de texto en cursor
  - Toggle de visibilidad de secciones
  - Cierre de menús flotantes
  - Generación de botones de voz
  - Gestión de cache (estadísticas, limpieza)

### 💊 Medication Manager (`medication-manager`)
- **Cobertura**: Sistema de gestión de medicamentos
- **Tests incluidos**: 18 tests
- **Funcionalidades probadas**:
  - Sincronización de chips de medicación
  - Agregar/eliminar medicaciones
  - Búsqueda con debouncing
  - Validación de duplicados
  - Carga de datos de medicamentos
  - Configuración de listeners
  - Flujos de integración completos

### 📝 Note Builder (`note-builder`)
- **Cobertura**: Construcción y formateo de notas médicas
- **Tests incluidos**: 20 tests
- **Funcionalidades probadas**:
  - Construcción de notas completas
  - Descarga de archivos
  - Validación de contenido
  - Formateo (HTML, Markdown, Plain)
  - Manejo de errores
  - Generación de nombres de archivo seguros

## 🛠️ Características del Sistema de Testing

### ✨ Funcionalidades Principales

1. **Sistema de Aserciones Completo**
   - `assert.equals()` - Igualdad estricta
   - `assert.deepEquals()` - Igualdad profunda para objetos
   - `assert.isTrue()` / `assert.isFalse()` - Validación booleana
   - `assert.exists()` - Verificación de existencia
   - `assert.throws()` / `assert.throwsAsync()` - Validación de errores
   - `assert.contains()` - Verificación de contenido en arrays
   - `assert.isType()` - Validación de tipos

2. **Sistema de Mocking Avanzado**
   - `mock.fn()` - Funciones mock con tracking de llamadas
   - `mock.object()` - Objetos mock con restauración automática
   - Implementaciones personalizadas
   - Valores de retorno configurables
   - Promesas resueltas/rechazadas

3. **Gestión de Lifecycle**
   - `setup()` - Configuración inicial
   - `teardown()` - Limpieza final
   - `beforeEach()` - Preparación antes de cada test
   - `afterEach()` - Limpieza después de cada test

4. **Configuración Flexible**
   - Timeouts personalizables
   - Categorización de tests
   - Tests marcados como `only` o `skip`
   - Filtrado por categoría

### 📈 Métricas y Reportes

El sistema genera métricas detalladas:

- **Estadísticas básicas**: Total, pasaron, fallaron, omitidos
- **Tasa de éxito**: Porcentaje de tests exitosos
- **Duración**: Tiempo de ejecución por test
- **Categorización**: Resultados agrupados por módulo
- **Tests lentos**: Identificación de tests que requieren optimización

### 🎨 Reportes Disponibles

1. **Consola** (por defecto)
   - Salida en tiempo real
   - Resumen final con recomendaciones
   - Identificación de tests lentos

2. **HTML** (opcional)
   - Reporte visual completo
   - Estadísticas interactivas
   - Detalles de errores

3. **JSON** (opcional)
   - Datos estructurados para integración
   - Información del entorno
   - Metadatos completos

## 🔧 Configuración Avanzada

### Personalizar Timeouts

```javascript
await runAllTests({
  timeout: 15000, // 15 segundos por test
  retries: 2      // 2 reintentos en caso de fallo
});
```

### Habilitar Reportes

```javascript
await runAllTests({
  reporting: {
    console: true,
    html: true,     // Generar reporte HTML
    json: true      // Generar reporte JSON
  }
});
```

### Ejecutar Tests Específicos

```javascript
// Solo tests marcados como 'only'
testRunner.test('test importante', () => {
  // ...
}, { only: true });

// Omitir tests específicos
testRunner.test('test en desarrollo', () => {
  // ...
}, { skip: true });
```

## 📋 Ejemplos de Uso

### Test Básico

```javascript
testRunner.test('debe sumar correctamente', () => {
  const resultado = suma(2, 3);
  assert.equals(resultado, 5, 'La suma debe ser correcta');
});
```

### Test Asíncrono

```javascript
testRunner.test('debe cargar datos', async () => {
  const datos = await cargarDatos();
  assert.exists(datos, 'Los datos deben existir');
  assert.isTrue(Array.isArray(datos), 'Debe ser un array');
});
```

### Test con Mock

```javascript
testRunner.test('debe llamar función externa', () => {
  const mockFn = mock.fn();
  const objeto = { metodo: mockFn };
  
  objeto.metodo('parámetro');
  
  assert.equals(mockFn.callCount, 1, 'Debe llamarse una vez');
  assert.equals(mockFn.calls[0][0], 'parámetro', 'Debe recibir parámetro correcto');
});
```

### Test de Rendimiento

```javascript
testRunner.test('debe ser eficiente', () => {
  const inicio = performance.now();
  
  // Operación a medir
  operacionCompleja();
  
  const duracion = performance.now() - inicio;
  assert.isTrue(duracion < 100, `Debe completarse en <100ms: ${duracion}ms`);
}, { category: 'performance', timeout: 5000 });
```

## 🎯 Mejores Prácticas

### 1. Nomenclatura de Tests
```javascript
// ✅ Bueno: Descriptivo y específico
testRunner.test('getElement - debe retornar null para elemento inexistente', () => {});

// ❌ Malo: Vago y poco descriptivo
testRunner.test('test de elemento', () => {});
```

### 2. Organización por Funcionalidad
```javascript
// Agrupar tests relacionados
testRunner.test('syncChips - debe sincronizar correctamente', () => {}, { category: 'medication-manager' });
testRunner.test('syncChips - debe manejar errores', () => {}, { category: 'medication-manager' });
```

### 3. Setup y Teardown Apropiados
```javascript
testRunner.beforeEach(() => {
  // Limpiar estado antes de cada test
  clearCache();
  resetMocks();
});

testRunner.afterEach(() => {
  // Limpiar después de cada test
  restoreOriginalFunctions();
});
```

### 4. Aserciones Específicas
```javascript
// ✅ Bueno: Mensaje específico
assert.equals(resultado.length, 3, 'Debe retornar exactamente 3 elementos');

// ❌ Malo: Sin contexto
assert.equals(resultado.length, 3);
```

## 🚨 Solución de Problemas

### Tests Fallando Intermitentemente
- Verificar condiciones de carrera en tests asíncronos
- Asegurar limpieza completa en `afterEach`
- Revisar dependencias entre tests

### Tests Lentos
- Identificar operaciones costosas
- Usar mocks para dependencias externas
- Optimizar setup/teardown

### Errores de Timeout
- Aumentar timeout para tests específicos
- Verificar operaciones asíncronas sin resolver
- Revisar bucles infinitos

## 📊 Métricas de Calidad

El sistema evalúa automáticamente la calidad del código:

- **EXCELENTE**: 100% tests pasando
- **BUENA**: 90-99% tests pasando
- **REGULAR**: 70-89% tests pasando
- **NECESITA MEJORAS**: <70% tests pasando

### Recomendaciones Automáticas

El sistema proporciona recomendaciones basadas en resultados:
- 🔧 Corregir tests fallidos
- ⚠️ Revisar tests omitidos
- 📈 Mejorar cobertura de tests
- ⏱️ Optimizar tests lentos

## 🔄 Integración Continua

Para integrar con sistemas de CI/CD:

```javascript
// En tu pipeline de CI
import { runAllTests } from './modules/tests/run-all-tests.js';

const results = await runAllTests({
  reporting: { json: true }
});

// Fallar el build si hay tests fallidos
if (results.failed > 0) {
  process.exit(1);
}
```

## 📚 Referencias

- [Documentación de Aserciones](./test-runner.js#L200)
- [Sistema de Mocking](./test-runner.js#L350)
- [Configuración de Tests](./run-all-tests.js#L15)
- [Ejemplos de Tests](./dom-helpers.test.js)

---

**Versión**: 1.0.0  
**Última actualización**: Enero 2024  
**Mantenedor**: Equipo Suite Neurología 