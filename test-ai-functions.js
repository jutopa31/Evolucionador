// 🧠 Script de Prueba para la Suite de IA
// Ejecuta este código en la consola del navegador para probar las funciones

console.log('🧪 INICIANDO PRUEBAS DE IA...');

// 1. Verificar que los módulos estén cargados
function checkAIModules() {
    console.log('\n📋 VERIFICANDO MÓDULOS DE IA:');
    
    const modules = [
        'window.AIEngine',
        'window.NeurologicalPatternClassifier', 
        'window.AIDashboard',
        'window.AIIntegration'
    ];
    
    modules.forEach(module => {
        const exists = eval(`typeof ${module} !== 'undefined'`);
        console.log(`${exists ? '✅' : '❌'} ${module}: ${exists ? 'CARGADO' : 'NO ENCONTRADO'}`);
    });
}

// 2. Probar análisis de texto médico
async function testMedicalTextAnalysis() {
    console.log('\n🔬 PROBANDO ANÁLISIS DE TEXTO MÉDICO:');
    
    const testTexts = [
        "Paciente presenta hemiparesia derecha y afasia de expresión",
        "Temblor en reposo, rigidez muscular y bradicinesia",
        "Pérdida de memoria reciente y desorientación temporal",
        "Crisis convulsivas tónico-clónicas generalizadas"
    ];
    
    for (const text of testTexts) {
        console.log(`\n📝 Analizando: "${text}"`);
        
        if (window.AIEngine) {
            try {
                const analysis = await window.AIEngine.analyzeMedicalText(text);
                console.log('🧠 Resultado:', analysis);
            } catch (error) {
                console.error('❌ Error:', error);
            }
        } else {
            console.log('❌ AIEngine no disponible');
        }
    }
}

// 3. Probar clasificador neurológico
function testNeurologicalClassifier() {
    console.log('\n🧬 PROBANDO CLASIFICADOR NEUROLÓGICO:');
    
    const testSymptoms = [
        {
            age: 70,
            motorSymptoms: true,
            tremor: false,
            rigidity: false,
            balanceProblems: true,
            speechProblems: true,
            memoryIssues: false,
            cognitiveSymptoms: false,
            seizures: false,
            consciousnessLoss: false
        },
        {
            age: 65,
            motorSymptoms: true,
            tremor: true,
            rigidity: true,
            balanceProblems: true,
            speechProblems: false,
            memoryIssues: false,
            cognitiveSymptoms: false,
            seizures: false,
            consciousnessLoss: false
        }
    ];
    
    testSymptoms.forEach((symptoms, index) => {
        console.log(`\n🔍 Caso ${index + 1}:`, symptoms);
        
        if (window.NeurologicalPatternClassifier) {
            try {
                const classification = window.NeurologicalPatternClassifier.classifyNeurologicalSymptoms(symptoms);
                console.log('🎯 Clasificación:', classification);
            } catch (error) {
                console.error('❌ Error:', error);
            }
        } else {
            console.log('❌ NeurologicalPatternClassifier no disponible');
        }
    });
}

// 4. Activar análisis automático
function triggerAutoAnalysis() {
    console.log('\n⚡ ACTIVANDO ANÁLISIS AUTOMÁTICO:');
    
    // Simular escritura en textarea para activar análisis automático
    const textareas = document.querySelectorAll('textarea');
    
    if (textareas.length > 0) {
        const textarea = textareas[0];
        const testText = "Paciente de 68 años con temblor en reposo en mano derecha, rigidez muscular y bradicinesia. Antecedentes de hipertensión arterial.";
        
        console.log('📝 Escribiendo texto de prueba en textarea...');
        textarea.value = testText;
        
        // Disparar eventos para activar análisis automático
        textarea.dispatchEvent(new Event('input', { bubbles: true }));
        textarea.dispatchEvent(new Event('change', { bubbles: true }));
        
        console.log('✅ Texto insertado, esperando análisis automático...');
    } else {
        console.log('❌ No se encontraron textareas');
    }
}

// 5. Probar dashboard de IA
function testAIDashboard() {
    console.log('\n📊 PROBANDO DASHBOARD DE IA:');
    
    if (window.AIDashboard) {
        try {
            // Mostrar dashboard
            window.AIDashboard.showDashboard();
            console.log('✅ Dashboard mostrado');
            
            // Agregar datos de prueba
            window.AIDashboard.addAnalysisResult({
                type: 'medical_text',
                result: 'Posible Parkinson',
                confidence: 0.85,
                timestamp: Date.now()
            });
            
            window.AIDashboard.addPredictionResult({
                condition: 'parkinson',
                confidence: 0.85
            });
            
            console.log('✅ Datos de prueba agregados al dashboard');
        } catch (error) {
            console.error('❌ Error:', error);
        }
    } else {
        console.log('❌ AIDashboard no disponible');
    }
}

// 6. Probar integración con medicamentos
function testMedicationAnalysis() {
    console.log('\n💊 PROBANDO ANÁLISIS DE MEDICAMENTOS:');
    
    const testMedications = ['Levodopa', 'Carbidopa', 'Ropinirol', 'Warfarina'];
    
    testMedications.forEach(async (med) => {
        console.log(`\n💊 Analizando: ${med}`);
        
        if (window.AIIntegration) {
            try {
                const analysis = await window.AIIntegration.analyzeMedication(med);
                console.log('🔍 Análisis:', analysis);
            } catch (error) {
                console.error('❌ Error:', error);
            }
        } else {
            console.log('❌ AIIntegration no disponible');
        }
    });
}

// 8. Probar sección de medicamentos específicamente
function testMedicationSection() {
    console.log('\n💊 PROBANDO SECCIÓN DE MEDICAMENTOS:');
    
    const bedId = window.appState?.getCurrentBedId();
    if (!bedId) {
        console.log('❌ No hay cama seleccionada');
        return;
    }
    
    console.log(`🛏️ Cama actual: ${bedId}`);
    
    // Verificar elementos de la sección
    const elements = {
        section: document.getElementById(`section-medicacion-${bedId}`),
        content: document.getElementById(`content-medicacion-${bedId}`),
        input: document.getElementById(`med-input-${bedId}`),
        suggestions: document.getElementById(`med-suggestions-${bedId}`),
        doseForm: document.getElementById(`dose-form-${bedId}`),
        doseInput: document.getElementById(`dose-input-${bedId}`),
        addBtn: document.getElementById(`dose-add-${bedId}`),
        cancelBtn: document.getElementById(`dose-cancel-${bedId}`),
        display: document.getElementById(`med-display-${bedId}`)
    };
    
    console.log('🔍 Verificando elementos:');
    Object.entries(elements).forEach(([name, element]) => {
        console.log(`${element ? '✅' : '❌'} ${name}: ${element ? 'encontrado' : 'NO encontrado'}`);
    });
    
    // Probar funcionalidad si los elementos existen
    if (elements.input && elements.suggestions) {
        console.log('\n📝 Probando funcionalidad de búsqueda...');
        
        // Simular escritura
        elements.input.value = 'levo';
        elements.input.dispatchEvent(new Event('input', { bubbles: true }));
        
        setTimeout(() => {
            const suggestions = elements.suggestions.children.length;
            console.log(`🔍 Sugerencias mostradas: ${suggestions}`);
            
            if (suggestions > 0) {
                console.log('✅ Sistema de sugerencias funcionando');
                
                // Simular clic en primera sugerencia
                const firstSuggestion = elements.suggestions.children[0];
                if (firstSuggestion) {
                    firstSuggestion.click();
                    console.log('🖱️ Simulando clic en primera sugerencia');
                    
                    setTimeout(() => {
                        if (elements.doseForm && elements.doseForm.style.display !== 'none') {
                            console.log('✅ Formulario de dosis mostrado correctamente');
                            
                            // Simular agregar dosis
                            if (elements.doseInput && elements.addBtn) {
                                elements.doseInput.value = '500mg cada 8 horas';
                                elements.addBtn.click();
                                console.log('💊 Simulando agregar medicamento con dosis');
                                
                                setTimeout(() => {
                                    const chips = elements.display ? elements.display.children.length : 0;
                                    console.log(`🏷️ Chips de medicamentos: ${chips}`);
                                    
                                    if (chips > 0) {
                                        console.log('✅ Medicamento agregado exitosamente');
                                    } else {
                                        console.log('❌ Medicamento no se agregó');
                                    }
                                }, 500);
                            }
                        } else {
                            console.log('❌ Formulario de dosis no se mostró');
                        }
                    }, 300);
                }
            } else {
                console.log('❌ No se mostraron sugerencias');
            }
        }, 500);
    } else {
        console.log('❌ Elementos básicos no encontrados, no se puede probar funcionalidad');
    }
    
    // Verificar datos en el estado
    const currentBed = window.appState?.getBed(bedId);
    if (currentBed) {
        console.log(`\n📊 Medicamentos en estado: ${Array.isArray(currentBed.meds) ? currentBed.meds.length : 'No es array'}`);
        if (Array.isArray(currentBed.meds) && currentBed.meds.length > 0) {
            console.log('💊 Medicamentos actuales:', currentBed.meds);
        }
    }
}

// 9. Ejecutar todas las pruebas incluyendo medicamentos
async function runAllTests() {
    console.log('🚀 EJECUTANDO TODAS LAS PRUEBAS DE IA...\n');
    
    checkAIModules();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    await testMedicalTextAnalysis();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    testNeurologicalClassifier();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    triggerAutoAnalysis();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    testAIDashboard();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    testMedicationAnalysis();
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    testMedicationSection();
    
    console.log('\n🎉 PRUEBAS COMPLETADAS!');
}

// Función de prueba rápida para medicamentos
function quickMedicationTest() {
    console.log('🚀 PRUEBA RÁPIDA DE MEDICAMENTOS');
    console.log('================================');
    
    const bedId = window.appState?.getCurrentBedId();
    console.log(`🛏️ Cama actual: ${bedId || 'NO ENCONTRADA'}`);
    
    if (!bedId) {
        console.log('❌ ERROR: No hay cama seleccionada');
        return;
    }
    
    // Verificar elementos críticos
    const elements = {
        section: document.getElementById(`section-medicacion-${bedId}`),
        input: document.getElementById(`med-input-${bedId}`),
        suggestions: document.getElementById(`med-suggestions-${bedId}`),
        display: document.getElementById(`med-display-${bedId}`)
    };
    
    console.log('\n🔍 VERIFICACIÓN DE ELEMENTOS:');
    let allElementsFound = true;
    Object.entries(elements).forEach(([name, element]) => {
        const found = !!element;
        console.log(`${found ? '✅' : '❌'} ${name}: ${found ? 'OK' : 'FALTANTE'}`);
        if (!found) allElementsFound = false;
    });
    
    if (!allElementsFound) {
        console.log('\n❌ ELEMENTOS FALTANTES - La sección puede no estar renderizada');
        console.log('💡 Intenta abrir la sección de medicamentos manualmente');
        return;
    }
    
    // Verificar datos de medicamentos
    console.log('\n💊 VERIFICACIÓN DE DATOS:');
    console.log(`📋 MEDICATIONS_DATA: ${window.MEDICATIONS_DATA ? window.MEDICATIONS_DATA.length + ' medicamentos' : 'NO CARGADO'}`);
    console.log(`📋 appState.medicationsList: ${window.appState?.medicationsList ? window.appState.medicationsList.length + ' medicamentos' : 'NO CARGADO'}`);
    
    // Verificar estado de la cama
    const currentBed = window.appState?.getBed(bedId);
    console.log(`🛏️ Datos de cama: ${currentBed ? 'OK' : 'NO ENCONTRADOS'}`);
    console.log(`💊 Medicamentos en cama: ${Array.isArray(currentBed?.meds) ? currentBed.meds.length : 'NO ES ARRAY'}`);
    
    if (Array.isArray(currentBed?.meds) && currentBed.meds.length > 0) {
        console.log('📝 Medicamentos actuales:', currentBed.meds);
    }
    
    console.log('\n🧪 PRUEBA FUNCIONAL:');
    console.log('Ejecuta: window.AITests.testMedicationSection() para prueba completa');
    console.log('O usa: quickMedicationAdd("Paracetamol") para agregar medicamento');
}

// Función para agregar medicamento rápidamente
function quickMedicationAdd(medicationName) {
    const bedId = window.appState?.getCurrentBedId();
    if (!bedId) {
        console.log('❌ No hay cama seleccionada');
        return;
    }
    
    const input = document.getElementById(`med-input-${bedId}`);
    const addBtn = document.getElementById(`dose-add-${bedId}`);
    
    if (!input || !addBtn) {
        console.log('❌ Elementos de medicamentos no encontrados');
        return;
    }
    
    console.log(`💊 Agregando medicamento: ${medicationName}`);
    
    // Simular proceso completo
    input.value = medicationName;
    input.dispatchEvent(new Event('input', { bubbles: true }));
    
    setTimeout(() => {
        // Simular selección y agregar
        const doseInput = document.getElementById(`dose-input-${bedId}`);
        if (doseInput) {
            doseInput.value = '500mg cada 8 horas';
            addBtn.click();
            console.log('✅ Medicamento agregado');
        }
    }, 500);
}

// Exportar funciones para uso manual
window.AITests = {
    checkModules: checkAIModules,
    testTextAnalysis: testMedicalTextAnalysis,
    testClassifier: testNeurologicalClassifier,
    triggerAuto: triggerAutoAnalysis,
    testDashboard: testAIDashboard,
    testMedications: testMedicationAnalysis,
    testMedicationSection: testMedicationSection,
    quickMedicationTest: quickMedicationTest,
    quickMedicationAdd: quickMedicationAdd,
    runAll: runAllTests
};

console.log('✅ Script de pruebas cargado.');
console.log('🧪 Funciones disponibles:');
console.log('  - window.AITests.runAll() - Ejecutar todas las pruebas');
console.log('  - quickMedicationTest() - Prueba rápida de medicamentos');
console.log('  - quickMedicationAdd("NombreMedicamento") - Agregar medicamento');
console.log('  - window.AITests.testMedicationSection() - Prueba completa de medicamentos'); 