// Archivo de prueba para demostrar el sistema de testing
import { testRunner, assert, mock } from './modules/tests/test-runner.js';

console.log('🧪 Iniciando demostración del sistema de testing...');

// Test básico de ejemplo
testRunner.test('Ejemplo - suma básica', () => {
  const resultado = 2 + 3;
  assert.equals(resultado, 5, 'La suma debe ser correcta');
  console.log('✅ Test de suma básica pasó');
});

// Test con mock
testRunner.test('Ejemplo - función mock', () => {
  const mockFn = mock.fn();
  mockFn('test');
  assert.equals(mockFn.callCount, 1, 'Debe llamarse una vez');
  assert.equals(mockFn.calls[0][0], 'test', 'Debe recibir parámetro correcto');
  console.log('✅ Test de mock pasó');
});

// Test asíncrono
testRunner.test('Ejemplo - operación asíncrona', async () => {
  const promesa = new Promise(resolve => setTimeout(() => resolve('éxito'), 100));
  const resultado = await promesa;
  assert.equals(resultado, 'éxito', 'Promesa debe resolverse correctamente');
  console.log('✅ Test asíncrono pasó');
});

// Test de validación de tipos
testRunner.test('Ejemplo - validación de tipos', () => {
  assert.isType('hello', 'string', 'Debe ser string');
  assert.isType(42, 'number', 'Debe ser number');
  assert.isType([], 'object', 'Array debe ser object');
  console.log('✅ Test de tipos pasó');
});

// Test de arrays
testRunner.test('Ejemplo - operaciones con arrays', () => {
  const arr = [1, 2, 3, 4, 5];
  assert.contains(arr, 3, 'Array debe contener el número 3');
  assert.equals(arr.length, 5, 'Array debe tener 5 elementos');
  console.log('✅ Test de arrays pasó');
});

// Test que falla intencionalmente para mostrar manejo de errores
testRunner.test('Ejemplo - test que falla', () => {
  try {
    assert.equals(1, 2, 'Este test debe fallar intencionalmente');
  } catch (e) {
    console.log('❌ Test falló como se esperaba:', e.message);
    throw e; // Re-lanzar para que el runner lo registre como fallo
  }
});

// Test de rendimiento
testRunner.test('Ejemplo - test de rendimiento', () => {
  const inicio = performance.now();
  
  // Simular operación
  let suma = 0;
  for (let i = 0; i < 10000; i++) {
    suma += i;
  }
  
  const duracion = performance.now() - inicio;
  assert.isTrue(duracion < 100, `Operación debe ser rápida: ${duracion}ms`);
  console.log(`✅ Test de rendimiento pasó (${duracion.toFixed(2)}ms)`);
}, { category: 'performance' });

// Ejecutar los tests
testRunner.run().then(results => {
  console.log('\n📊 Resultados de la demostración:');
  console.log(`Total: ${results.total}`);
  console.log(`Pasaron: ${results.passed}`);
  console.log(`Fallaron: ${results.failed}`);
  console.log(`Omitidos: ${results.skipped}`);
  console.log(`Tasa de éxito: ${Math.round((results.passed / results.total) * 100)}%`);
  
  console.log('\n📋 Detalles de tests:');
  results.details.forEach(test => {
    const icon = test.status === 'passed' ? '✅' : test.status === 'failed' ? '❌' : '⏭️';
    console.log(`${icon} ${test.name} (${test.duration || 0}ms)`);
    if (test.error) {
      console.log(`   Error: ${test.error}`);
    }
  });
}).catch(console.error); 