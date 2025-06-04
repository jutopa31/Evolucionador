/**
 * @fileoverview Tests para módulo Note Builder
 * @version 1.0.0
 */

import { testRunner, assert, mock } from './test-runner.js';
import { 
  buildNote, 
  downloadNote, 
  validateNote, 
  formatNote 
} from '../business/note-builder.js';

// Mock del estado global
let mockAppState;
let mockLogger;
let mockErrorManager;

testRunner.setup(() => {
  // Mock del estado global
  mockAppState = {
    getCurrentBedId: mock.fn().mockReturnValue('bed1'),
    getBed: mock.fn().mockReturnValue({
      structured: {
        datos: {
          fecha: '2024-01-15',
          nombre: 'Juan Pérez',
          dni: '12345678'
        },
        antecedentes: {
          cardio: 'HTA',
          neuro: 'Sin antecedentes'
        },
        evolucion: {
          motivo: 'Dolor de cabeza',
          actual: 'Cefalea de 3 días de evolución'
        }
      },
      text: {
        fisico: 'Paciente consciente, orientado. TA: 120/80',
        notas_libres: 'Evolución favorable'
      },
      meds: ['Paracetamol 500mg c/8hs', 'Ibuprofeno 400mg c/12hs']
    })
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

  // Mock de URL.createObjectURL para tests de descarga
  window.URL = {
    createObjectURL: mock.fn().mockReturnValue('blob:mock-url'),
    revokeObjectURL: mock.fn()
  };

  // Mock de Blob
  window.Blob = mock.fn().mockImplementation((content, options) => ({
    content,
    options,
    size: content[0].length
  }));
});

testRunner.teardown(() => {
  delete window.appState;
  delete window.logger;
  delete window.errorManager;
  delete window.URL;
  delete window.Blob;
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

  // Reset URL mocks
  if (window.URL.createObjectURL.reset) window.URL.createObjectURL.reset();
  if (window.URL.revokeObjectURL.reset) window.URL.revokeObjectURL.reset();
  if (window.Blob.reset) window.Blob.reset();

  // Restaurar datos de cama por defecto
  mockAppState.getBed.mockReturnValue({
    structured: {
      datos: {
        fecha: '2024-01-15',
        nombre: 'Juan Pérez',
        dni: '12345678'
      },
      antecedentes: {
        cardio: 'HTA',
        neuro: 'Sin antecedentes'
      },
      evolucion: {
        motivo: 'Dolor de cabeza',
        actual: 'Cefalea de 3 días de evolución'
      }
    },
    text: {
      fisico: 'Paciente consciente, orientado. TA: 120/80',
      notas_libres: 'Evolución favorable'
    },
    meds: ['Paracetamol 500mg c/8hs', 'Ibuprofeno 400mg c/12hs']
  });
});

// Tests para buildNote
testRunner.test('buildNote - debe construir nota completa correctamente', () => {
  const note = buildNote();
  
  assert.isType(note, 'string', 'Debe retornar string');
  assert.isTrue(note.length > 0, 'Nota no debe estar vacía');
  
  // Verificar que contiene las secciones principales
  assert.isTrue(note.includes('Datos del paciente'), 'Debe incluir sección de datos');
  assert.isTrue(note.includes('Juan Pérez'), 'Debe incluir nombre del paciente');
  assert.isTrue(note.includes('Antecedentes personales'), 'Debe incluir antecedentes');
  assert.isTrue(note.includes('Evolución'), 'Debe incluir evolución');
  assert.isTrue(note.includes('Examen físico'), 'Debe incluir examen físico');
  assert.isTrue(note.includes('Medicación'), 'Debe incluir medicación');
  assert.isTrue(note.includes('Paracetamol'), 'Debe incluir medicamentos');
}, { category: 'note-builder' });

testRunner.test('buildNote - debe manejar cama no seleccionada', () => {
  mockAppState.getCurrentBedId.mockReturnValue(null);
  
  const note = buildNote();
  
  assert.isTrue(note.startsWith('Error:'), 'Debe retornar mensaje de error');
  assert.isTrue(note.includes('Cama no seleccionada'), 'Debe indicar que no hay cama seleccionada');
}, { category: 'note-builder' });

testRunner.test('buildNote - debe manejar datos de cama faltantes', () => {
  mockAppState.getBed.mockReturnValue(null);
  
  const note = buildNote();
  
  assert.isTrue(note.startsWith('Error:'), 'Debe retornar mensaje de error');
}, { category: 'note-builder' });

testRunner.test('buildNote - debe excluir secciones configuradas', () => {
  const note = buildNote();
  
  // Verificar que las secciones excluidas no aparecen
  assert.isFalse(note.includes('ingreso_manual'), 'No debe incluir ingreso_manual');
  assert.isFalse(note.includes('diagnostico'), 'No debe incluir diagnostico');
}, { category: 'note-builder' });

testRunner.test('buildNote - debe incluir secciones siempre requeridas aunque estén vacías', () => {
  // Configurar cama con secciones vacías
  mockAppState.getBed.mockReturnValue({
    structured: {},
    text: {
      fisico: '',
      notas_libres: '',
      antecedentes: ''
    },
    meds: []
  });
  
  const note = buildNote();
  
  // Estas secciones deben aparecer aunque estén vacías
  assert.isTrue(note.includes('Examen físico'), 'Debe incluir examen físico aunque esté vacío');
  assert.isTrue(note.includes('Notas Libres'), 'Debe incluir notas libres aunque esté vacío');
  assert.isTrue(note.includes('Medicación'), 'Debe incluir medicación aunque esté vacía');
}, { category: 'note-builder' });

testRunner.test('buildNote - debe formatear medicaciones correctamente', () => {
  const note = buildNote();
  
  // Verificar formato de medicaciones
  assert.isTrue(note.includes('- Paracetamol 500mg c/8hs'), 'Debe formatear medicaciones con guiones');
  assert.isTrue(note.includes('- Ibuprofeno 400mg c/12hs'), 'Debe incluir todas las medicaciones');
}, { category: 'note-builder' });

testRunner.test('buildNote - debe manejar medicaciones vacías', () => {
  mockAppState.getBed.mockReturnValue({
    structured: {},
    text: {},
    meds: []
  });
  
  const note = buildNote();
  
  assert.isTrue(note.includes('(Ninguna)'), 'Debe mostrar "(Ninguna)" para medicaciones vacías');
}, { category: 'note-builder' });

testRunner.test('buildNote - debe formatear secciones estructuradas correctamente', () => {
  const note = buildNote();
  
  // Verificar formato de campos estructurados
  assert.isTrue(note.includes('- Fecha Evaluación: 2024-01-15'), 'Debe formatear campos con guiones');
  assert.isTrue(note.includes('- Nombre: Juan Pérez'), 'Debe incluir todos los campos');
  assert.isTrue(note.includes('- Cardiovascular: HTA'), 'Debe formatear antecedentes');
}, { category: 'note-builder' });

// Tests para downloadNote
testRunner.test('downloadNote - debe descargar nota correctamente', () => {
  // Mock del DOM para simular descarga
  const mockLink = {
    href: '',
    download: '',
    click: mock.fn(),
    remove: mock.fn()
  };
  
  document.createElement = mock.fn().mockReturnValue(mockLink);
  document.body.appendChild = mock.fn();
  document.body.removeChild = mock.fn();
  
  downloadNote();
  
  // Verificar que se creó el blob
  assert.equals(window.Blob.callCount, 1, 'Debe crear un Blob');
  assert.equals(window.URL.createObjectURL.callCount, 1, 'Debe crear URL del objeto');
  
  // Verificar que se configuró el enlace de descarga
  assert.isTrue(mockLink.download.includes('nota_'), 'Nombre de archivo debe incluir "nota_"');
  assert.isTrue(mockLink.download.includes('.txt'), 'Archivo debe tener extensión .txt');
  
  // Verificar que se simuló el clic
  assert.equals(mockLink.click.callCount, 1, 'Debe simular clic para descarga');
  
  // Verificar limpieza
  assert.equals(window.URL.revokeObjectURL.callCount, 1, 'Debe limpiar URL del objeto');
  assert.equals(document.body.removeChild.callCount, 1, 'Debe remover elemento temporal');
}, { category: 'note-builder' });

testRunner.test('downloadNote - debe manejar errores en buildNote', () => {
  mockAppState.getCurrentBedId.mockReturnValue(null);
  
  downloadNote();
  
  // No debe intentar crear blob si hay error en buildNote
  assert.equals(window.Blob.callCount, 0, 'No debe crear Blob con error en buildNote');
  assert.equals(mockErrorManager.handleError.callCount, 1, 'Debe registrar error');
}, { category: 'note-builder' });

testRunner.test('downloadNote - debe manejar errores de descarga', () => {
  // Simular error en createObjectURL
  window.URL.createObjectURL.mockImplementation(() => {
    throw new Error('Error de URL');
  });
  
  downloadNote();
  
  // Debe manejar el error graciosamente
  assert.equals(mockErrorManager.handleError.callCount, 1, 'Debe registrar error de descarga');
}, { category: 'note-builder' });

testRunner.test('downloadNote - debe generar nombre de archivo seguro', () => {
  mockAppState.getCurrentBedId.mockReturnValue('cama-1/test');
  
  const mockLink = {
    href: '',
    download: '',
    click: mock.fn(),
    remove: mock.fn()
  };
  
  document.createElement = mock.fn().mockReturnValue(mockLink);
  document.body.appendChild = mock.fn();
  document.body.removeChild = mock.fn();
  
  downloadNote();
  
  // Verificar que los caracteres especiales se reemplazan
  assert.isFalse(mockLink.download.includes('/'), 'No debe contener barras');
  assert.isTrue(mockLink.download.includes('cama-1_test'), 'Debe reemplazar caracteres especiales');
}, { category: 'note-builder' });

// Tests para validateNote
testRunner.test('validateNote - debe validar nota válida', () => {
  const validNote = `
    Datos del paciente:
    - Nombre: Juan Pérez
    
    Evolución:
    - Motivo: Dolor de cabeza
  `;
  
  const result = validateNote(validNote);
  
  assert.isTrue(result.isValid, 'Nota válida debe pasar validación');
  assert.equals(result.errors.length, 0, 'No debe tener errores');
  assert.isTrue(result.warnings.length >= 0, 'Puede tener advertencias');
}, { category: 'note-builder' });

testRunner.test('validateNote - debe detectar nota vacía', () => {
  const result = validateNote('');
  
  assert.isFalse(result.isValid, 'Nota vacía no debe ser válida');
  assert.isTrue(result.errors.length > 0, 'Debe tener errores');
  assert.isTrue(result.errors.some(e => e.includes('vacía')), 'Debe indicar que está vacía');
}, { category: 'note-builder' });

testRunner.test('validateNote - debe detectar nota muy corta', () => {
  const result = validateNote('Nota muy corta');
  
  assert.isFalse(result.isValid, 'Nota muy corta no debe ser válida');
  assert.isTrue(result.errors.some(e => e.includes('muy corta')), 'Debe indicar que es muy corta');
}, { category: 'note-builder' });

testRunner.test('validateNote - debe detectar secciones faltantes', () => {
  const noteWithoutPatientData = `
    Evolución:
    - Motivo: Dolor de cabeza
    
    Examen físico:
    Paciente consciente
  `;
  
  const result = validateNote(noteWithoutPatientData);
  
  assert.isTrue(result.warnings.length > 0, 'Debe tener advertencias');
  assert.isTrue(
    result.warnings.some(w => w.includes('Datos del paciente')),
    'Debe advertir sobre datos del paciente faltantes'
  );
}, { category: 'note-builder' });

testRunner.test('validateNote - debe manejar entrada inválida', () => {
  const result = validateNote(null);
  
  assert.isFalse(result.isValid, 'Entrada null no debe ser válida');
  assert.isTrue(result.errors.length > 0, 'Debe tener errores');
}, { category: 'note-builder' });

// Tests para formatNote
testRunner.test('formatNote - debe formatear como plain text por defecto', () => {
  const note = 'Datos del paciente:\n- Nombre: Juan\n\nEvolución:\n- Motivo: Dolor';
  
  const formatted = formatNote(note);
  
  assert.equals(formatted, note, 'Formato plain debe retornar texto sin cambios');
}, { category: 'note-builder' });

testRunner.test('formatNote - debe formatear como HTML', () => {
  const note = 'Datos del paciente:\n- Nombre: Juan\n\nEvolución:\n- Motivo: Dolor';
  
  const formatted = formatNote(note, 'html');
  
  assert.isTrue(formatted.includes('<h3>'), 'Debe convertir títulos a H3');
  assert.isTrue(formatted.includes('<ul>'), 'Debe convertir listas a UL');
  assert.isTrue(formatted.includes('<li>'), 'Debe convertir items a LI');
  assert.isTrue(formatted.includes('<br>'), 'Debe convertir saltos de línea');
}, { category: 'note-builder' });

testRunner.test('formatNote - debe formatear como Markdown', () => {
  const note = 'Datos del paciente:\n- Nombre: Juan\n\nEvolución:\n- Motivo: Dolor';
  
  const formatted = formatNote(note, 'markdown');
  
  assert.isTrue(formatted.includes('### '), 'Debe convertir títulos a H3 markdown');
  assert.isTrue(formatted.includes('* '), 'Debe convertir guiones a asteriscos');
}, { category: 'note-builder' });

testRunner.test('formatNote - debe manejar formato desconocido', () => {
  const note = 'Texto de prueba';
  
  const formatted = formatNote(note, 'unknown-format');
  
  assert.equals(formatted, note, 'Formato desconocido debe retornar texto original');
}, { category: 'note-builder' });

testRunner.test('formatNote - debe manejar texto vacío', () => {
  const formatted = formatNote('', 'html');
  
  assert.equals(formatted, '', 'Texto vacío debe retornar vacío');
}, { category: 'note-builder' });

testRunner.test('formatNote - debe escapar HTML en formato HTML', () => {
  const note = 'Datos: <script>alert("test")</script>';
  
  const formatted = formatNote(note, 'html');
  
  assert.isFalse(formatted.includes('<script>'), 'Debe escapar tags de script');
  assert.isTrue(formatted.includes('&lt;script&gt;'), 'Debe convertir a entidades HTML');
}, { category: 'note-builder' });

// Tests de integración
testRunner.test('integración - flujo completo de construcción y validación', () => {
  // Construir nota
  const note = buildNote();
  
  // Validar nota construida
  const validation = validateNote(note);
  
  assert.isTrue(validation.isValid, 'Nota construida debe ser válida');
  assert.equals(validation.errors.length, 0, 'No debe tener errores de validación');
  
  // Formatear nota
  const htmlNote = formatNote(note, 'html');
  const markdownNote = formatNote(note, 'markdown');
  
  assert.isTrue(htmlNote.includes('<h3>'), 'Formato HTML debe funcionar');
  assert.isTrue(markdownNote.includes('### '), 'Formato Markdown debe funcionar');
}, { category: 'note-builder' });

// Tests de rendimiento
testRunner.test('rendimiento - construcción de nota debe ser rápida', () => {
  const iterations = 100;
  const startTime = performance.now();
  
  for (let i = 0; i < iterations; i++) {
    buildNote();
  }
  
  const endTime = performance.now();
  const avgTime = (endTime - startTime) / iterations;
  
  assert.isTrue(avgTime < 5, `Construcción debe ser rápida: ${avgTime}ms promedio`);
}, { category: 'note-builder', timeout: 5000 });

testRunner.test('rendimiento - validación debe ser eficiente', () => {
  const longNote = 'Datos del paciente:\n'.repeat(1000) + 'Contenido muy largo...';
  
  const startTime = performance.now();
  const result = validateNote(longNote);
  const endTime = performance.now();
  
  const validationTime = endTime - startTime;
  
  assert.isTrue(validationTime < 50, `Validación debe ser eficiente: ${validationTime}ms`);
  assert.exists(result, 'Debe retornar resultado de validación');
}, { category: 'note-builder', timeout: 1000 });

export { testRunner }; 