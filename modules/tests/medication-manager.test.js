/**
 * @fileoverview Tests para módulo Medication Manager
 * @version 1.0.0
 */

import { testRunner, assert, mock } from './test-runner.js';
import { 
  syncChips, 
  removeMedication, 
  addMedication, 
  setupMedicationListeners,
  loadMedicationsJson
} from '../business/medication-manager.js';

// Mock del estado global
let mockAppState;
let mockLogger;
let mockErrorManager;

testRunner.setup(() => {
  // Setup del DOM para tests
  document.body.innerHTML = `
    <div id="med-display"></div>
    <input id="med-input" type="text">
    <input id="dose-input" type="text">
    <div id="dose-form" style="display: none;">
      <button id="dose-add">Agregar</button>
      <button id="dose-cancel">Cancelar</button>
    </div>
    <ul id="med-suggestions"></ul>
  `;

  // Mock del estado global
  mockAppState = {
    getCurrentBedId: mock.fn().mockReturnValue('bed1'),
    getBed: mock.fn().mockReturnValue({
      meds: ['Paracetamol 500mg', 'Ibuprofeno 400mg']
    }),
    medicationsList: [
      { nombre: 'Paracetamol' },
      { nombre: 'Ibuprofeno' },
      { nombre: 'Aspirina' },
      { nombre: 'Amoxicilina' }
    ]
  };

  mockLogger = {
    debug: mock.fn(),
    info: mock.fn(),
    warn: mock.fn(),
    error: mock.fn()
  };

  mockErrorManager = {
    handleError: mock.fn(),
    showInfo: mock.fn()
  };

  // Asignar mocks globales
  window.appState = mockAppState;
  window.logger = mockLogger;
  window.errorManager = mockErrorManager;
  window.MEDICATIONS_DATA = [
    { nombre: 'Paracetamol' },
    { nombre: 'Ibuprofeno' },
    { nombre: 'Aspirina' },
    { nombre: 'Amoxicilina' },
    { nombre: 'Metformina' }
  ];
});

testRunner.teardown(() => {
  document.body.innerHTML = '';
  delete window.appState;
  delete window.logger;
  delete window.errorManager;
  delete window.MEDICATIONS_DATA;
});

testRunner.beforeEach(() => {
  // Reset mocks antes de cada test
  Object.values(mockAppState).forEach(mockFn => {
    if (typeof mockFn.reset === 'function') mockFn.reset();
  });
  Object.values(mockLogger).forEach(mockFn => {
    if (typeof mockFn.reset === 'function') mockFn.reset();
  });
  Object.values(mockErrorManager).forEach(mockFn => {
    if (typeof mockFn.reset === 'function') mockFn.reset();
  });

  // Reset DOM
  document.getElementById('med-display').innerHTML = '';
  document.getElementById('med-input').value = '';
  document.getElementById('dose-input').value = '';
  document.getElementById('dose-form').style.display = 'none';
  document.getElementById('med-suggestions').innerHTML = '';
});

// Tests para syncChips
testRunner.test('syncChips - debe sincronizar chips correctamente', () => {
  const medDisplay = document.getElementById('med-display');
  
  syncChips();
  
  // Verificar que se crearon los chips
  const chips = medDisplay.querySelectorAll('.chip');
  assert.equals(chips.length, 2, 'Debe crear 2 chips para las medicaciones');
  
  // Verificar contenido de los chips
  assert.equals(chips[0].textContent.includes('Paracetamol'), true, 'Primer chip debe contener Paracetamol');
  assert.equals(chips[1].textContent.includes('Ibuprofeno'), true, 'Segundo chip debe contener Ibuprofeno');
  
  // Verificar que cada chip tiene botón de eliminar
  chips.forEach(chip => {
    const removeBtn = chip.querySelector('.remove-med-btn');
    assert.exists(removeBtn, 'Cada chip debe tener botón de eliminar');
    assert.equals(removeBtn.textContent, '×', 'Botón debe tener símbolo ×');
  });
}, { category: 'medication-manager' });

testRunner.test('syncChips - debe manejar elemento med-display faltante', () => {
  document.getElementById('med-display').remove();
  
  // No debe lanzar error
  syncChips();
  
  // Debe registrar error
  assert.equals(mockErrorManager.handleError.callCount, 1, 'Debe registrar error');
  assert.isTrue(
    mockErrorManager.handleError.calls[0][0].includes('med-display'),
    'Error debe mencionar med-display'
  );
}, { category: 'medication-manager' });

testRunner.test('syncChips - debe manejar cama sin medicaciones', () => {
  mockAppState.getBed.mockReturnValue({ meds: [] });
  
  const medDisplay = document.getElementById('med-display');
  syncChips();
  
  const chips = medDisplay.querySelectorAll('.chip');
  assert.equals(chips.length, 0, 'No debe crear chips para array vacío');
}, { category: 'medication-manager' });

testRunner.test('syncChips - debe manejar medicaciones inválidas', () => {
  mockAppState.getBed.mockReturnValue({ 
    meds: ['Paracetamol', null, undefined, '', 'Ibuprofeno'] 
  });
  
  const medDisplay = document.getElementById('med-display');
  syncChips();
  
  const chips = medDisplay.querySelectorAll('.chip');
  assert.equals(chips.length, 2, 'Debe filtrar medicaciones inválidas');
}, { category: 'medication-manager' });

// Tests para removeMedication
testRunner.test('removeMedication - debe eliminar medicación correctamente', () => {
  const mockBed = { meds: ['Paracetamol 500mg', 'Ibuprofeno 400mg'] };
  mockAppState.getBed.mockReturnValue(mockBed);
  
  // Mock de funciones dependientes
  const mockSyncChips = mock.fn();
  const mockScheduleSave = mock.fn();
  window.syncChips = mockSyncChips;
  window.scheduleSaveAllData = mockScheduleSave;
  
  removeMedication('Paracetamol 500mg');
  
  // Verificar que se eliminó la medicación
  assert.equals(mockBed.meds.length, 1, 'Debe quedar 1 medicación');
  assert.equals(mockBed.meds[0], 'Ibuprofeno 400mg', 'Debe quedar la medicación correcta');
  
  // Verificar que se llamaron las funciones necesarias
  assert.equals(mockSyncChips.callCount, 1, 'Debe llamar syncChips');
  assert.equals(mockScheduleSave.callCount, 1, 'Debe programar guardado');
  
  // Cleanup
  delete window.syncChips;
  delete window.scheduleSaveAllData;
}, { category: 'medication-manager' });

testRunner.test('removeMedication - debe manejar medicación inexistente', () => {
  const mockBed = { meds: ['Paracetamol 500mg'] };
  mockAppState.getBed.mockReturnValue(mockBed);
  
  removeMedication('Medicación Inexistente');
  
  // No debe cambiar el array
  assert.equals(mockBed.meds.length, 1, 'Array debe mantener su tamaño');
  assert.equals(mockBed.meds[0], 'Paracetamol 500mg', 'Contenido debe permanecer igual');
}, { category: 'medication-manager' });

testRunner.test('removeMedication - debe manejar parámetros inválidos', () => {
  const mockBed = { meds: ['Paracetamol 500mg'] };
  mockAppState.getBed.mockReturnValue(mockBed);
  
  // Probar con diferentes valores inválidos
  removeMedication(null);
  removeMedication(undefined);
  removeMedication('');
  
  // Array debe permanecer intacto
  assert.equals(mockBed.meds.length, 1, 'Array debe mantener su tamaño');
}, { category: 'medication-manager' });

// Tests para addMedication
testRunner.test('addMedication - debe agregar medicación nueva', () => {
  const mockBed = { meds: [] };
  mockAppState.getBed.mockReturnValue(mockBed);
  
  // Mock de funciones dependientes
  const mockSyncChips = mock.fn();
  const mockScheduleSave = mock.fn();
  window.syncChips = mockSyncChips;
  window.scheduleSaveAllData = mockScheduleSave;
  
  addMedication('Nueva Medicación 100mg');
  
  // Verificar que se agregó la medicación
  assert.equals(mockBed.meds.length, 1, 'Debe agregar 1 medicación');
  assert.equals(mockBed.meds[0], 'Nueva Medicación 100mg', 'Debe agregar la medicación correcta');
  
  // Verificar que se llamaron las funciones necesarias
  assert.equals(mockSyncChips.callCount, 1, 'Debe llamar syncChips');
  assert.equals(mockScheduleSave.callCount, 1, 'Debe programar guardado');
  
  // Cleanup
  delete window.syncChips;
  delete window.scheduleSaveAllData;
}, { category: 'medication-manager' });

testRunner.test('addMedication - debe prevenir duplicados', () => {
  const mockBed = { meds: ['Paracetamol 500mg'] };
  mockAppState.getBed.mockReturnValue(mockBed);
  
  addMedication('Paracetamol 500mg');
  
  // No debe agregar duplicado
  assert.equals(mockBed.meds.length, 1, 'No debe agregar medicación duplicada');
  
  // Debe mostrar mensaje informativo
  assert.equals(mockErrorManager.showInfo.callCount, 1, 'Debe mostrar mensaje informativo');
}, { category: 'medication-manager' });

testRunner.test('addMedication - debe manejar valores vacíos', () => {
  const mockBed = { meds: [] };
  mockAppState.getBed.mockReturnValue(mockBed);
  
  addMedication('');
  addMedication(null);
  addMedication(undefined);
  
  // No debe agregar valores vacíos
  assert.equals(mockBed.meds.length, 0, 'No debe agregar valores vacíos');
}, { category: 'medication-manager' });

// Tests para setupMedicationListeners
testRunner.test('setupMedicationListeners - debe configurar listeners correctamente', () => {
  const medInput = document.getElementById('med-input');
  const doseAdd = document.getElementById('dose-add');
  const doseCancel = document.getElementById('dose-cancel');
  
  // Verificar que los elementos existen antes del setup
  assert.exists(medInput, 'med-input debe existir');
  assert.exists(doseAdd, 'dose-add debe existir');
  assert.exists(doseCancel, 'dose-cancel debe existir');
  
  // Configurar listeners
  setupMedicationListeners();
  
  // Verificar que no se lanzan errores durante la configuración
  assert.isTrue(true, 'setupMedicationListeners debe ejecutarse sin errores');
}, { category: 'medication-manager' });

testRunner.test('setupMedicationListeners - debe manejar elementos faltantes', () => {
  // Eliminar elementos necesarios
  document.getElementById('med-input').remove();
  
  // No debe lanzar error
  setupMedicationListeners();
  
  // Debe registrar error
  assert.equals(mockLogger.error.callCount, 1, 'Debe registrar error por elementos faltantes');
}, { category: 'medication-manager' });

// Tests para búsqueda de medicamentos con debouncing
testRunner.test('búsqueda de medicamentos - debe filtrar correctamente', async () => {
  setupMedicationListeners();
  
  const medInput = document.getElementById('med-input');
  const suggestions = document.getElementById('med-suggestions');
  
  // Simular entrada de texto
  medInput.value = 'para';
  medInput.dispatchEvent(new Event('input'));
  
  // Esperar debouncing
  await new Promise(resolve => setTimeout(resolve, 350));
  
  // Verificar que se muestran sugerencias
  const suggestionItems = suggestions.querySelectorAll('li');
  assert.isTrue(suggestionItems.length > 0, 'Debe mostrar sugerencias');
  
  // Verificar que las sugerencias contienen el texto buscado
  const hasParacetamol = Array.from(suggestionItems).some(item => 
    item.textContent.toLowerCase().includes('paracetamol')
  );
  assert.isTrue(hasParacetamol, 'Debe incluir Paracetamol en las sugerencias');
}, { category: 'medication-manager', timeout: 1000 });

testRunner.test('búsqueda de medicamentos - debe ocultar sugerencias con texto corto', async () => {
  setupMedicationListeners();
  
  const medInput = document.getElementById('med-input');
  const suggestions = document.getElementById('med-suggestions');
  
  // Simular entrada de texto corto
  medInput.value = 'p';
  medInput.dispatchEvent(new Event('input'));
  
  // Esperar debouncing
  await new Promise(resolve => setTimeout(resolve, 350));
  
  // Verificar que no se muestran sugerencias
  assert.equals(suggestions.style.display, 'none', 'No debe mostrar sugerencias para texto corto');
}, { category: 'medication-manager', timeout: 1000 });

// Tests para loadMedicationsJson
testRunner.test('loadMedicationsJson - debe cargar medicamentos correctamente', async () => {
  const result = await loadMedicationsJson();
  
  assert.isTrue(result, 'Debe retornar true en carga exitosa');
  assert.isTrue(Array.isArray(mockAppState.medicationsList), 'medicationsList debe ser array');
  assert.isTrue(mockAppState.medicationsList.length > 0, 'Debe cargar medicamentos');
}, { category: 'medication-manager' });

testRunner.test('loadMedicationsJson - debe manejar MEDICATIONS_DATA faltante', async () => {
  delete window.MEDICATIONS_DATA;
  
  const result = await loadMedicationsJson();
  
  assert.isFalse(result, 'Debe retornar false cuando falta MEDICATIONS_DATA');
  assert.equals(mockErrorManager.handleError.callCount, 1, 'Debe registrar error');
  assert.isTrue(Array.isArray(mockAppState.medicationsList), 'medicationsList debe ser array vacío');
  assert.equals(mockAppState.medicationsList.length, 0, 'Array debe estar vacío');
}, { category: 'medication-manager' });

testRunner.test('loadMedicationsJson - debe manejar datos inválidos', async () => {
  window.MEDICATIONS_DATA = 'invalid data';
  
  const result = await loadMedicationsJson();
  
  assert.isFalse(result, 'Debe retornar false con datos inválidos');
  assert.equals(mockErrorManager.handleError.callCount, 1, 'Debe registrar error');
}, { category: 'medication-manager' });

// Tests de integración
testRunner.test('integración - flujo completo de agregar medicación', async () => {
  const mockBed = { meds: [] };
  mockAppState.getBed.mockReturnValue(mockBed);
  
  // Mock de funciones dependientes
  window.syncChips = mock.fn();
  window.scheduleSaveAllData = mock.fn();
  
  setupMedicationListeners();
  
  const medInput = document.getElementById('med-input');
  const doseInput = document.getElementById('dose-input');
  const doseForm = document.getElementById('dose-form');
  const doseAdd = document.getElementById('dose-add');
  
  // Simular selección de medicamento
  medInput.value = 'Paracetamol';
  
  // Simular clic en sugerencia (esto normalmente mostraría el formulario de dosis)
  doseForm.style.display = 'flex';
  doseInput.value = '500mg cada 8 horas';
  
  // Simular clic en agregar
  doseAdd.click();
  
  // Verificar que se agregó la medicación
  assert.equals(mockBed.meds.length, 1, 'Debe agregar la medicación');
  assert.isTrue(
    mockBed.meds[0].includes('Paracetamol') && mockBed.meds[0].includes('500mg'),
    'Debe incluir nombre y dosis'
  );
  
  // Cleanup
  delete window.syncChips;
  delete window.scheduleSaveAllData;
}, { category: 'medication-manager' });

// Tests de rendimiento
testRunner.test('rendimiento - búsqueda con muchos medicamentos', async () => {
  // Crear lista grande de medicamentos
  const largeMedicationList = Array.from({ length: 1000 }, (_, i) => ({
    nombre: `Medicamento${i}`
  }));
  
  mockAppState.medicationsList = largeMedicationList;
  setupMedicationListeners();
  
  const medInput = document.getElementById('med-input');
  const startTime = performance.now();
  
  // Simular búsqueda
  medInput.value = 'Medicamento1';
  medInput.dispatchEvent(new Event('input'));
  
  // Esperar debouncing
  await new Promise(resolve => setTimeout(resolve, 350));
  
  const endTime = performance.now();
  const searchTime = endTime - startTime;
  
  // La búsqueda debe completarse en tiempo razonable (< 100ms sin contar debouncing)
  assert.isTrue(searchTime < 500, `Búsqueda debe ser rápida: ${searchTime}ms`);
}, { category: 'medication-manager', timeout: 1000 });

export { testRunner }; 