/**
 * @fileoverview Ejecutor principal de tests para Suite Neurología 2.1
 * @version 1.0.0
 */

import { testRunner } from './test-runner.js';

// Importar todos los archivos de tests
import './dom-helpers.test.js';
import './medication-manager.test.js';
import './note-builder.test.js';

/**
 * Configuración principal de tests
 */
const testConfig = {
  // Configuración por defecto
  timeout: 10000,
  retries: 1,
  
  // Categorías de tests disponibles
  categories: [
    'dom-helpers',
    'medication-manager', 
    'note-builder',
    'storage-manager',
    'event-manager',
    'integration',
    'performance'
  ],
  
  // Configuración de reportes
  reporting: {
    console: true,
    html: false,
    json: false
  }
};

/**
 * Función principal para ejecutar todos los tests
 * @param {Object} options - Opciones de ejecución
 * @returns {Promise<Object>} - Resultados de los tests
 */
export async function runAllTests(options = {}) {
  const config = { ...testConfig, ...options };
  
  console.log('🚀 Iniciando Suite Completa de Tests');
  console.log('📋 Configuración:', {
    categorías: config.categories.length,
    timeout: config.timeout,
    reintentos: config.retries
  });
  
  try {
    // Ejecutar todos los tests
    const results = await testRunner.run(config);
    
    // Generar reportes adicionales si están habilitados
    if (config.reporting.html) {
      await generateHtmlReport(results);
    }
    
    if (config.reporting.json) {
      await generateJsonReport(results);
    }
    
    // Mostrar resumen final
    showFinalSummary(results);
    
    return results;
    
  } catch (error) {
    console.error('💥 Error ejecutando tests:', error);
    throw error;
  }
}

/**
 * Ejecuta tests de una categoría específica
 * @param {string} category - Categoría a ejecutar
 * @returns {Promise<Object>} - Resultados de los tests
 */
export async function runTestCategory(category) {
  if (!testConfig.categories.includes(category)) {
    throw new Error(`Categoría desconocida: ${category}`);
  }
  
  console.log(`🎯 Ejecutando tests de categoría: ${category}`);
  
  const results = await testRunner.run({ category });
  return results;
}

/**
 * Ejecuta tests de rendimiento únicamente
 * @returns {Promise<Object>} - Resultados de los tests de rendimiento
 */
export async function runPerformanceTests() {
  console.log('⚡ Ejecutando tests de rendimiento');
  
  const results = await testRunner.run({ 
    category: 'performance',
    timeout: 30000 // Mayor timeout para tests de rendimiento
  });
  
  return results;
}

/**
 * Ejecuta tests de integración únicamente
 * @returns {Promise<Object>} - Resultados de los tests de integración
 */
export async function runIntegrationTests() {
  console.log('🔗 Ejecutando tests de integración');
  
  const results = await testRunner.run({ 
    category: 'integration',
    timeout: 15000 // Mayor timeout para tests de integración
  });
  
  return results;
}

/**
 * Genera reporte HTML de los resultados
 * @param {Object} results - Resultados de los tests
 */
async function generateHtmlReport(results) {
  console.log('📄 Generando reporte HTML...');
  
  const html = `
    <!DOCTYPE html>
    <html lang="es">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reporte de Tests - Suite Neurología 2.1</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .header { background: #f5f5f5; padding: 20px; border-radius: 8px; margin-bottom: 20px; }
        .summary { display: flex; gap: 20px; margin-bottom: 20px; }
        .stat { background: white; padding: 15px; border-radius: 8px; border: 1px solid #ddd; flex: 1; }
        .passed { color: #4CAF50; }
        .failed { color: #f44336; }
        .skipped { color: #ff9800; }
        .test-list { background: white; padding: 20px; border-radius: 8px; border: 1px solid #ddd; }
        .test-item { padding: 10px; border-bottom: 1px solid #eee; }
        .test-item:last-child { border-bottom: none; }
        .category { font-weight: bold; color: #666; }
      </style>
    </head>
    <body>
      <div class="header">
        <h1>🧪 Reporte de Tests - Suite Neurología 2.1</h1>
        <p>Generado el: ${new Date().toLocaleString()}</p>
      </div>
      
      <div class="summary">
        <div class="stat">
          <h3>Total</h3>
          <div style="font-size: 2em;">${results.total}</div>
        </div>
        <div class="stat">
          <h3 class="passed">Pasaron</h3>
          <div style="font-size: 2em;" class="passed">${results.passed}</div>
        </div>
        <div class="stat">
          <h3 class="failed">Fallaron</h3>
          <div style="font-size: 2em;" class="failed">${results.failed}</div>
        </div>
        <div class="stat">
          <h3 class="skipped">Omitidos</h3>
          <div style="font-size: 2em;" class="skipped">${results.skipped}</div>
        </div>
      </div>
      
      <div class="test-list">
        <h2>Detalle de Tests</h2>
        ${results.details.map(test => `
          <div class="test-item">
            <div class="category">[${test.category}]</div>
            <div class="${test.status}">${getStatusIcon(test.status)} ${test.name}</div>
            ${test.duration ? `<small>Duración: ${test.duration}ms</small>` : ''}
            ${test.error ? `<div style="color: red; margin-top: 5px;">${test.error}</div>` : ''}
          </div>
        `).join('')}
      </div>
    </body>
    </html>
  `;
  
  // En un entorno real, esto se guardaría en un archivo
  console.log('📄 Reporte HTML generado (en producción se guardaría en archivo)');
}

/**
 * Genera reporte JSON de los resultados
 * @param {Object} results - Resultados de los tests
 */
async function generateJsonReport(results) {
  console.log('📊 Generando reporte JSON...');
  
  const report = {
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    summary: {
      total: results.total,
      passed: results.passed,
      failed: results.failed,
      skipped: results.skipped,
      successRate: results.total > 0 ? Math.round((results.passed / results.total) * 100) : 0
    },
    details: results.details,
    environment: {
      userAgent: navigator.userAgent,
      platform: navigator.platform,
      language: navigator.language
    }
  };
  
  // En un entorno real, esto se guardaría en un archivo
  console.log('📊 Reporte JSON generado:', JSON.stringify(report, null, 2));
}

/**
 * Obtiene el icono para el estado del test
 * @param {string} status - Estado del test
 * @returns {string} - Icono correspondiente
 */
function getStatusIcon(status) {
  const icons = {
    passed: '✅',
    failed: '❌',
    skipped: '⏭️'
  };
  return icons[status] || '❓';
}

/**
 * Muestra resumen final con recomendaciones
 * @param {Object} results - Resultados de los tests
 */
function showFinalSummary(results) {
  console.log('\n' + '🎯 RESUMEN FINAL'.padStart(40, '='));
  
  const successRate = results.total > 0 ? Math.round((results.passed / results.total) * 100) : 0;
  
  // Evaluación de calidad basada en resultados
  let qualityLevel = 'EXCELENTE';
  let recommendations = [];
  
  if (successRate < 100) {
    qualityLevel = successRate >= 90 ? 'BUENA' : successRate >= 70 ? 'REGULAR' : 'NECESITA MEJORAS';
  }
  
  if (results.failed > 0) {
    recommendations.push(`🔧 Corregir ${results.failed} test(s) fallido(s)`);
  }
  
  if (results.skipped > 0) {
    recommendations.push(`⚠️  Revisar ${results.skipped} test(s) omitido(s)`);
  }
  
  if (successRate < 90) {
    recommendations.push('📈 Mejorar cobertura de tests');
  }
  
  console.log(`📊 Calidad del código: ${qualityLevel} (${successRate}%)`);
  
  if (recommendations.length > 0) {
    console.log('\n📋 Recomendaciones:');
    recommendations.forEach(rec => console.log(`  ${rec}`));
  }
  
  // Mostrar tests más lentos
  const slowTests = results.details
    .filter(test => test.duration && test.duration > 100)
    .sort((a, b) => b.duration - a.duration)
    .slice(0, 3);
    
  if (slowTests.length > 0) {
    console.log('\n⏱️  Tests más lentos:');
    slowTests.forEach(test => {
      console.log(`  • ${test.name}: ${test.duration}ms`);
    });
  }
  
  console.log('\n' + '='.repeat(60));
}

/**
 * Función de utilidad para ejecutar tests en modo watch
 * @param {Object} options - Opciones de configuración
 */
export function watchTests(options = {}) {
  console.log('👀 Modo watch no implementado en esta versión');
  console.log('💡 Sugerencia: Ejecutar manualmente cuando sea necesario');
}

/**
 * Función de utilidad para limpiar resultados de tests anteriores
 */
export function clearTestResults() {
  testRunner.clear();
  console.log('🧹 Resultados de tests anteriores limpiados');
}

// Exportar configuración para uso externo
export { testConfig };

// Si se ejecuta directamente, correr todos los tests
if (typeof window !== 'undefined' && window.location) {
  // Ejecutar automáticamente si se carga en el navegador
  document.addEventListener('DOMContentLoaded', () => {
    console.log('🔄 Auto-ejecutando tests al cargar la página...');
    runAllTests().catch(console.error);
  });
} 