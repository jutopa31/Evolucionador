/**
 * @fileoverview Tests para módulo DOM Helpers
 * @version 1.0.0
 */

import { testRunner, assert, mock } from './test-runner.js';
import { 
  getElement, 
  getStructuredInput, 
  getTextArea, 
  insertAtCursor,
  toggleSectionVisibility,
  closeAllMenus,
  makeVoiceButtonHTML,
  clearElementCache,
  getCacheStats,
  cleanupExpiredCache
} from '../ui/dom-helpers.js';

// Setup del DOM para tests
testRunner.setup(() => {
  // Crear elementos DOM necesarios para los tests
  document.body.innerHTML = `
    <div id="test-element">Test Element</div>
    <input id="input-test-field-bed1" type="text" data-section-key="test" data-field-id="field">
    <textarea id="ta-test-bed1" rows="4"></textarea>
    <div id="content-test-bed1" style="display: none;">Content</div>
    <ul class="menu" id="test-menu" style="display: none;">
      <li>Menu Item</li>
    </ul>
    <ul class="menu" id="test-menu-2" style="display: block;">
      <li>Menu Item 2</li>
    </ul>
  `;
});

testRunner.teardown(() => {
  // Limpiar DOM después de los tests
  document.body.innerHTML = '';
  clearElementCache();
});

testRunner.beforeEach(() => {
  // Limpiar cache antes de cada test
  clearElementCache();
});

// Tests para getElement
testRunner.test('getElement - debe obtener elemento existente', () => {
  const element = getElement('test-element');
  assert.exists(element, 'Elemento debe existir');
  assert.equals(element.id, 'test-element', 'ID debe coincidir');
  assert.equals(element.textContent, 'Test Element', 'Contenido debe coincidir');
}, { category: 'dom-helpers' });

testRunner.test('getElement - debe retornar null para elemento inexistente', () => {
  const element = getElement('non-existent');
  assert.equals(element, null, 'Debe retornar null para elemento inexistente');
}, { category: 'dom-helpers' });

testRunner.test('getElement - debe usar cache correctamente', () => {
  // Primera llamada
  const element1 = getElement('test-element');
  
  // Segunda llamada debería usar cache
  const element2 = getElement('test-element');
  
  assert.equals(element1, element2, 'Debe retornar el mismo elemento desde cache');
  
  const stats = getCacheStats();
  assert.equals(stats.totalEntries, 1, 'Debe tener una entrada en cache');
  assert.equals(stats.validEntries, 1, 'Debe tener una entrada válida');
}, { category: 'dom-helpers' });

testRunner.test('getElement - debe permitir deshabilitar cache', () => {
  const element1 = getElement('test-element', false);
  const element2 = getElement('test-element', false);
  
  // Aunque son el mismo elemento DOM, no se usa cache
  const stats = getCacheStats();
  assert.equals(stats.totalEntries, 0, 'No debe usar cache cuando está deshabilitado');
}, { category: 'dom-helpers' });

// Tests para getStructuredInput
testRunner.test('getStructuredInput - debe obtener input estructurado válido', () => {
  const input = getStructuredInput('test', 'field', 'bed1');
  assert.exists(input, 'Input debe existir');
  assert.equals(input.id, 'input-test-field-bed1', 'ID debe coincidir');
}, { category: 'dom-helpers' });

testRunner.test('getStructuredInput - debe validar parámetros', () => {
  const input1 = getStructuredInput('', 'field', 'bed1');
  assert.equals(input1, null, 'Debe retornar null con sectionKey vacío');
  
  const input2 = getStructuredInput('test', '', 'bed1');
  assert.equals(input2, null, 'Debe retornar null con fieldId vacío');
  
  const input3 = getStructuredInput('test', 'field', '');
  assert.equals(input3, null, 'Debe retornar null con bedId vacío');
}, { category: 'dom-helpers' });

// Tests para getTextArea
testRunner.test('getTextArea - debe obtener textarea válido', () => {
  const textarea = getTextArea('test', 'bed1');
  assert.exists(textarea, 'Textarea debe existir');
  assert.equals(textarea.id, 'ta-test-bed1', 'ID debe coincidir');
}, { category: 'dom-helpers' });

testRunner.test('getTextArea - debe validar parámetros', () => {
  const textarea1 = getTextArea('', 'bed1');
  assert.equals(textarea1, null, 'Debe retornar null con key vacío');
  
  const textarea2 = getTextArea('test', '');
  assert.equals(textarea2, null, 'Debe retornar null con bedId vacío');
}, { category: 'dom-helpers' });

// Tests para insertAtCursor
testRunner.test('insertAtCursor - debe insertar texto en textarea', async () => {
  const textarea = getTextArea('test', 'bed1');
  textarea.value = 'Texto inicial';
  textarea.selectionStart = 6;
  textarea.selectionEnd = 6;
  
  // Mock del evento input
  let inputEventFired = false;
  textarea.addEventListener('input', () => {
    inputEventFired = true;
  });
  
  // Usar requestAnimationFrame para esperar la actualización
  await new Promise(resolve => {
    insertAtCursor(textarea, ' insertado');
    requestAnimationFrame(() => {
      assert.equals(textarea.value, 'Texto insertado inicial', 'Texto debe ser insertado correctamente');
      assert.isTrue(inputEventFired, 'Evento input debe ser disparado');
      resolve();
    });
  });
}, { category: 'dom-helpers' });

testRunner.test('insertAtCursor - debe manejar elementos inválidos', () => {
  // No debe lanzar error con elementos null
  insertAtCursor(null, 'texto');
  
  // No debe lanzar error con elementos que no son textarea/input
  const div = document.createElement('div');
  insertAtCursor(div, 'texto');
  
  // Test pasará si no se lanzan errores
  assert.isTrue(true, 'Debe manejar elementos inválidos sin errores');
}, { category: 'dom-helpers' });

// Tests para toggleSectionVisibility
testRunner.test('toggleSectionVisibility - debe alternar visibilidad', async () => {
  // Mock del appState global
  window.appState = {
    getCurrentBedId: () => 'bed1'
  };
  
  const content = getElement('content-test-bed1');
  assert.equals(content.style.display, 'none', 'Contenido debe estar oculto inicialmente');
  
  await new Promise(resolve => {
    const result = toggleSectionVisibility('test');
    assert.isTrue(result, 'Debe retornar true cuando encuentra la sección');
    
    requestAnimationFrame(() => {
      assert.equals(content.style.display, 'block', 'Contenido debe estar visible después del toggle');
      assert.isTrue(content.classList.contains('section-visible'), 'Debe tener clase section-visible');
      resolve();
    });
  });
}, { category: 'dom-helpers' });

testRunner.test('toggleSectionVisibility - debe manejar bedId faltante', () => {
  window.appState = {
    getCurrentBedId: () => null
  };
  
  const result = toggleSectionVisibility('test');
  assert.isFalse(result, 'Debe retornar false cuando no hay bedId');
}, { category: 'dom-helpers' });

// Tests para closeAllMenus
testRunner.test('closeAllMenus - debe cerrar todos los menús visibles', async () => {
  const menu1 = getElement('test-menu');
  const menu2 = getElement('test-menu-2');
  
  // Asegurar que menu2 esté visible
  menu2.style.display = 'block';
  
  await new Promise(resolve => {
    closeAllMenus();
    
    requestAnimationFrame(() => {
      assert.equals(menu1.style.display, 'none', 'Menu1 debe permanecer oculto');
      assert.equals(menu2.style.display, 'none', 'Menu2 debe ser cerrado');
      resolve();
    });
  });
}, { category: 'dom-helpers' });

testRunner.test('closeAllMenus - debe excluir menú especificado', async () => {
  const menu1 = getElement('test-menu');
  const menu2 = getElement('test-menu-2');
  
  menu1.style.display = 'block';
  menu2.style.display = 'block';
  
  await new Promise(resolve => {
    closeAllMenus(menu1);
    
    requestAnimationFrame(() => {
      assert.equals(menu1.style.display, 'block', 'Menu excluido debe permanecer abierto');
      assert.equals(menu2.style.display, 'none', 'Otros menús deben cerrarse');
      resolve();
    });
  });
}, { category: 'dom-helpers' });

// Tests para makeVoiceButtonHTML
testRunner.test('makeVoiceButtonHTML - debe generar HTML válido', () => {
  const html = makeVoiceButtonHTML('test-input');
  
  assert.isType(html, 'string', 'Debe retornar string');
  assert.isTrue(html.includes('test-input'), 'Debe incluir el ID del input');
  assert.isTrue(html.includes('voice-input-btn'), 'Debe incluir la clase CSS');
  assert.isTrue(html.includes('🎙️'), 'Debe incluir el emoji del micrófono');
  assert.isTrue(html.includes('data-target-input'), 'Debe incluir el atributo data');
}, { category: 'dom-helpers' });

testRunner.test('makeVoiceButtonHTML - debe escapar caracteres especiales', () => {
  const html = makeVoiceButtonHTML('test"input');
  
  assert.isTrue(html.includes('&quot;'), 'Debe escapar comillas dobles');
  assert.isFalse(html.includes('test"input'), 'No debe contener comillas sin escapar');
}, { category: 'dom-helpers' });

testRunner.test('makeVoiceButtonHTML - debe manejar input vacío', () => {
  const html = makeVoiceButtonHTML('');
  
  assert.equals(html, '', 'Debe retornar string vacío para input vacío');
}, { category: 'dom-helpers' });

// Tests para gestión de cache
testRunner.test('clearElementCache - debe limpiar cache específico', () => {
  // Llenar cache
  getElement('test-element');
  
  let stats = getCacheStats();
  assert.equals(stats.totalEntries, 1, 'Debe tener una entrada antes de limpiar');
  
  clearElementCache('test-element');
  
  stats = getCacheStats();
  assert.equals(stats.totalEntries, 0, 'Debe estar vacío después de limpiar');
}, { category: 'dom-helpers' });

testRunner.test('clearElementCache - debe limpiar todo el cache', () => {
  // Llenar cache con múltiples elementos
  getElement('test-element');
  getStructuredInput('test', 'field', 'bed1');
  
  let stats = getCacheStats();
  assert.isTrue(stats.totalEntries > 0, 'Debe tener entradas antes de limpiar');
  
  clearElementCache();
  
  stats = getCacheStats();
  assert.equals(stats.totalEntries, 0, 'Debe estar completamente vacío');
}, { category: 'dom-helpers' });

testRunner.test('getCacheStats - debe retornar estadísticas correctas', () => {
  // Llenar cache
  getElement('test-element');
  getStructuredInput('test', 'field', 'bed1');
  
  const stats = getCacheStats();
  
  assert.isType(stats.totalEntries, 'number', 'totalEntries debe ser número');
  assert.isType(stats.validEntries, 'number', 'validEntries debe ser número');
  assert.isType(stats.expiredEntries, 'number', 'expiredEntries debe ser número');
  assert.equals(stats.totalEntries, 2, 'Debe contar correctamente las entradas');
  assert.equals(stats.validEntries, 2, 'Todas las entradas deben ser válidas');
  assert.equals(stats.expiredEntries, 0, 'No debe haber entradas expiradas');
}, { category: 'dom-helpers' });

// Test de integración para cache con elementos eliminados del DOM
testRunner.test('cache - debe manejar elementos eliminados del DOM', () => {
  // Crear elemento temporal
  const tempElement = document.createElement('div');
  tempElement.id = 'temp-element';
  document.body.appendChild(tempElement);
  
  // Cachear elemento
  const cachedElement = getElement('temp-element');
  assert.exists(cachedElement, 'Elemento debe ser cacheado');
  
  // Eliminar elemento del DOM
  document.body.removeChild(tempElement);
  
  // Intentar obtener elemento nuevamente
  const elementAfterRemoval = getElement('temp-element');
  assert.equals(elementAfterRemoval, null, 'Debe retornar null para elemento eliminado');
  
  // Verificar que el cache se limpió automáticamente
  const stats = getCacheStats();
  assert.equals(stats.expiredEntries, 0, 'Cache debe limpiarse automáticamente');
}, { category: 'dom-helpers' });

// Test de rendimiento para cache
testRunner.test('cache - debe mejorar rendimiento en búsquedas repetidas', () => {
  const iterations = 100;
  
  // Medir tiempo sin cache
  const startWithoutCache = performance.now();
  for (let i = 0; i < iterations; i++) {
    getElement('test-element', false);
  }
  const timeWithoutCache = performance.now() - startWithoutCache;
  
  // Limpiar y medir tiempo con cache
  clearElementCache();
  const startWithCache = performance.now();
  for (let i = 0; i < iterations; i++) {
    getElement('test-element', true);
  }
  const timeWithCache = performance.now() - startWithCache;
  
  // El cache debería ser significativamente más rápido
  assert.isTrue(timeWithCache < timeWithoutCache, 
    `Cache debe ser más rápido: ${timeWithCache}ms vs ${timeWithoutCache}ms`);
}, { category: 'dom-helpers', timeout: 10000 });

export { testRunner }; 