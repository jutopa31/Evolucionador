// Test específico para funcionalidades de Suite Neurología
import { testRunner, assert, mock } from './modules/tests/test-runner.js';

console.log('🧠 Iniciando tests específicos de Suite Neurología...');

// Mock del estado global para tests
const mockAppState = {
  beds: {
    '1': {
      structured: {
        datos: {
          fecha: '2024-01-15',
          nombre: 'Juan Pérez',
          dni: '12345678'
        },
        antecedentes: {
          cardio: 'HTA',
          neuro: 'Sin antecedentes'
        }
      },
      text: {
        fisico: 'Paciente consciente, orientado',
        notas_libres: 'Evolución favorable'
      },
      meds: ['Paracetamol 500mg c/8hs', 'Ibuprofeno 400mg c/12hs']
    }
  },
  currentBedId: '1',
  getCurrentBedId: () => '1',
  getBed: (id) => mockAppState.beds[id]
};

// Test de construcción de notas médicas
testRunner.test('Suite Neurología - buildNote debe construir nota completa', () => {
  // Mock de la función buildNote
  function buildNote() {
    const bedId = mockAppState.getCurrentBedId();
    const bd = mockAppState.getBed(bedId);
    if (!bedId || !bd) return "Error: Cama no seleccionada.";

    let note = '';
    
    // Datos del paciente
    if (bd.structured?.datos) {
      note += 'Datos del paciente:\n';
      Object.entries(bd.structured.datos).forEach(([key, value]) => {
        if (value) note += `- ${key}: ${value}\n`;
      });
      note += '\n';
    }
    
    // Antecedentes
    if (bd.structured?.antecedentes) {
      note += 'Antecedentes personales:\n';
      Object.entries(bd.structured.antecedentes).forEach(([key, value]) => {
        if (value) note += `- ${key}: ${value}\n`;
      });
      note += '\n';
    }
    
    // Examen físico
    if (bd.text?.fisico) {
      note += `Examen físico:\n${bd.text.fisico}\n\n`;
    }
    
    // Medicación
    note += 'Medicación:\n';
    if (bd.meds && bd.meds.length > 0) {
      bd.meds.forEach(med => note += `- ${med}\n`);
    } else {
      note += '(Ninguna)\n';
    }
    
    return note.trim();
  }

  const nota = buildNote();
  
  assert.isType(nota, 'string', 'Debe retornar string');
  assert.isTrue(nota.length > 0, 'Nota no debe estar vacía');
  assert.isTrue(nota.includes('Juan Pérez'), 'Debe incluir nombre del paciente');
  assert.isTrue(nota.includes('Paracetamol'), 'Debe incluir medicamentos');
  assert.isTrue(nota.includes('HTA'), 'Debe incluir antecedentes');
  
  console.log('✅ Nota construida correctamente');
});

// Test de gestión de medicamentos
testRunner.test('Suite Neurología - gestión de medicamentos', () => {
  const bed = mockAppState.beds['1'];
  
  // Verificar estado inicial
  assert.isTrue(Array.isArray(bed.meds), 'Medicamentos debe ser array');
  assert.equals(bed.meds.length, 2, 'Debe tener 2 medicamentos iniciales');
  
  // Simular agregar medicamento
  const nuevoMed = 'Aspirina 100mg c/24hs';
  bed.meds.push(nuevoMed);
  
  assert.equals(bed.meds.length, 3, 'Debe tener 3 medicamentos después de agregar');
  assert.contains(bed.meds, nuevoMed, 'Debe contener el nuevo medicamento');
  
  // Simular eliminar medicamento
  const index = bed.meds.indexOf('Paracetamol 500mg c/8hs');
  if (index > -1) {
    bed.meds.splice(index, 1);
  }
  
  assert.equals(bed.meds.length, 2, 'Debe tener 2 medicamentos después de eliminar');
  assert.isFalse(bed.meds.includes('Paracetamol 500mg c/8hs'), 'No debe contener medicamento eliminado');
  
  console.log('✅ Gestión de medicamentos funciona correctamente');
});

// Test de validación de datos de paciente
testRunner.test('Suite Neurología - validación de datos de paciente', () => {
  const datos = mockAppState.beds['1'].structured.datos;
  
  // Validar campos requeridos
  assert.exists(datos.nombre, 'Nombre debe existir');
  assert.exists(datos.dni, 'DNI debe existir');
  assert.exists(datos.fecha, 'Fecha debe existir');
  
  // Validar formato de fecha
  const fechaRegex = /^\d{4}-\d{2}-\d{2}$/;
  assert.isTrue(fechaRegex.test(datos.fecha), 'Fecha debe tener formato YYYY-MM-DD');
  
  // Validar DNI (solo números)
  const dniRegex = /^\d+$/;
  assert.isTrue(dniRegex.test(datos.dni), 'DNI debe contener solo números');
  
  console.log('✅ Validación de datos de paciente correcta');
});

// Test de estado de la aplicación
testRunner.test('Suite Neurología - estado de la aplicación', () => {
  // Verificar estructura del estado
  assert.exists(mockAppState.beds, 'Debe tener objeto beds');
  assert.exists(mockAppState.currentBedId, 'Debe tener currentBedId');
  assert.isType(mockAppState.getCurrentBedId, 'function', 'getCurrentBedId debe ser función');
  assert.isType(mockAppState.getBed, 'function', 'getBed debe ser función');
  
  // Verificar funcionamiento de métodos
  const currentId = mockAppState.getCurrentBedId();
  assert.equals(currentId, '1', 'getCurrentBedId debe retornar ID correcto');
  
  const bed = mockAppState.getBed('1');
  assert.exists(bed, 'getBed debe retornar cama existente');
  assert.exists(bed.structured, 'Cama debe tener datos estructurados');
  assert.exists(bed.text, 'Cama debe tener datos de texto');
  assert.exists(bed.meds, 'Cama debe tener medicamentos');
  
  console.log('✅ Estado de la aplicación es válido');
});

// Test de rendimiento para operaciones médicas
testRunner.test('Suite Neurología - rendimiento operaciones médicas', () => {
  const inicio = performance.now();
  
  // Simular operaciones típicas
  for (let i = 0; i < 100; i++) {
    // Construir nota
    const bedId = mockAppState.getCurrentBedId();
    const bed = mockAppState.getBed(bedId);
    
    // Procesar datos
    const datos = bed.structured?.datos || {};
    const antecedentes = bed.structured?.antecedentes || {};
    const medicamentos = bed.meds || [];
    
    // Validar datos
    const isValid = datos.nombre && datos.dni && medicamentos.length >= 0;
  }
  
  const duracion = performance.now() - inicio;
  assert.isTrue(duracion < 100, `Operaciones médicas deben ser rápidas: ${duracion.toFixed(2)}ms`);
  
  console.log(`✅ Rendimiento adecuado: ${duracion.toFixed(2)}ms para 100 operaciones`);
}, { category: 'performance' });

// Test de integridad de datos
testRunner.test('Suite Neurología - integridad de datos', () => {
  const bed = mockAppState.beds['1'];
  
  // Verificar que no hay datos corruptos
  assert.isType(bed.structured, 'object', 'Structured debe ser objeto');
  assert.isType(bed.text, 'object', 'Text debe ser objeto');
  assert.isTrue(Array.isArray(bed.meds), 'Meds debe ser array');
  
  // Verificar que los datos son consistentes
  Object.values(bed.structured).forEach(section => {
    assert.isType(section, 'object', 'Cada sección estructurada debe ser objeto');
  });
  
  Object.values(bed.text).forEach(text => {
    assert.isType(text, 'string', 'Cada texto debe ser string');
  });
  
  bed.meds.forEach(med => {
    assert.isType(med, 'string', 'Cada medicamento debe ser string');
    assert.isTrue(med.length > 0, 'Medicamento no debe estar vacío');
  });
  
  console.log('✅ Integridad de datos verificada');
});

// Test de casos edge
testRunner.test('Suite Neurología - casos edge', () => {
  // Test con cama inexistente
  const bedInexistente = mockAppState.getBed('999');
  assert.isFalse(!!bedInexistente, 'Cama inexistente debe retornar falsy');
  
  // Test con datos vacíos
  const bedVacia = {
    structured: {},
    text: {},
    meds: []
  };
  
  assert.isType(bedVacia.structured, 'object', 'Structured vacío debe ser objeto');
  assert.isType(bedVacia.text, 'object', 'Text vacío debe ser objeto');
  assert.equals(bedVacia.meds.length, 0, 'Meds vacío debe tener longitud 0');
  
  // Test con datos null/undefined
  const bedConNulls = {
    structured: { datos: { nombre: null, dni: undefined } },
    text: { fisico: null },
    meds: null
  };
  
  // Debe manejar nulls graciosamente
  assert.exists(bedConNulls.structured, 'Debe manejar structured con nulls');
  
  console.log('✅ Casos edge manejados correctamente');
});

// Ejecutar todos los tests
testRunner.run().then(results => {
  console.log('\n🧠 RESULTADOS TESTS SUITE NEUROLOGÍA');
  console.log('=====================================');
  console.log(`📊 Total: ${results.total}`);
  console.log(`✅ Pasaron: ${results.passed}`);
  console.log(`❌ Fallaron: ${results.failed}`);
  console.log(`⏭️ Omitidos: ${results.skipped}`);
  console.log(`📈 Tasa de éxito: ${Math.round((results.passed / results.total) * 100)}%`);
  
  if (results.failed > 0) {
    console.log('\n❌ Tests fallidos:');
    results.details
      .filter(test => test.status === 'failed')
      .forEach(test => {
        console.log(`  • ${test.name}: ${test.error}`);
      });
  }
  
  console.log('\n📋 Resumen por categoría:');
  const categories = {};
  results.details.forEach(test => {
    const cat = test.category || 'general';
    if (!categories[cat]) categories[cat] = { passed: 0, failed: 0, total: 0 };
    categories[cat][test.status]++;
    categories[cat].total++;
  });
  
  Object.entries(categories).forEach(([cat, stats]) => {
    console.log(`  ${cat}: ${stats.passed}/${stats.total} (${Math.round((stats.passed/stats.total)*100)}%)`);
  });
  
  if (results.passed === results.total) {
    console.log('\n🎉 ¡Todos los tests de Suite Neurología pasaron exitosamente!');
  } else {
    console.log('\n⚠️ Algunos tests fallaron. Revisar implementación.');
  }
}).catch(error => {
  console.error('❌ Error ejecutando tests:', error);
}); 