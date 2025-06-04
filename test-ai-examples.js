/**
 * Ejemplos y Pruebas de IA - Suite Neurología v2.1.0
 * Funciones para probar y activar las capacidades de IA
 */

// ===== EJEMPLOS CONCRETOS PARA ACTIVAR IA =====

window.AIExamples = {
    
    // Textos de ejemplo que activan análisis de IA (solo 10+ caracteres)
    examples: {
        stroke: "dolor cabeza súbito",
        parkinson: "temblor reposo",
        alzheimer: "pérdida memoria",
        epilepsia: "convulsiones",
        normal: "paciente estable"
    },

    // Función para probar análisis de texto rápido
    quickTest: function(example = 'stroke') {
        const text = this.examples[example];
        console.log(`🧪 Probando IA con: "${text}"`);
        
        if (window.AIEngine && window.AIEngine.analyzeMedicalText) {
            const result = window.AIEngine.analyzeMedicalText(text);
            console.log('📊 Resultado del análisis:', result);
            return result;
        } else {
            console.error('❌ AI Engine no disponible');
            return null;
        }
    },

    // Función para llenar automáticamente un textarea y activar IA
    fillAndAnalyze: function(sectionKey = 'fisico', example = 'stroke') {
        const bedId = window.AppState?.currentBedId || '1';
        const textareaId = `ta-${sectionKey}-${bedId}`;
        const textarea = document.getElementById(textareaId);
        
        if (textarea) {
            const text = this.examples[example];
            textarea.value = text;
            textarea.focus();
            
            // Disparar evento input para activar IA
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
            
            console.log(`✅ Texto "${text}" añadido a ${textareaId}`);
            console.log('🔄 Esperando análisis de IA...');
            
            // Mostrar notificación
            if (window.showNotification) {
                window.showNotification(`IA activada con: "${text}"`, 'info');
            }
            
            return textarea;
        } else {
            console.error(`❌ Textarea ${textareaId} no encontrado`);
            return null;
        }
    },

    // Función para probar clasificación neurológica
    testClassification: function() {
        if (window.NeurologicalPatternClassifier) {
            const symptoms = {
                age: 65,
                motorSymptoms: true,
                tremor: true,
                rigidity: true,
                balanceProblems: true
            };
            
            console.log('🧠 Probando clasificación neurológica...');
            const result = window.NeurologicalPatternClassifier.classifyNeurologicalSymptoms(symptoms);
            console.log('📊 Clasificación:', result);
            
            if (window.showNotification && result.topPrediction) {
                const condition = result.topPrediction.condition;
                const probability = result.topPrediction.probability;
                const percentage = Math.round(probability * 100);
                
                window.showNotification(`Clasificación: ${condition} (${percentage}%)`, 'success');
                console.log(`✅ Clasificación exitosa: ${condition} con ${percentage}% de confianza`);
            }
            
            return result;
        } else {
            console.error('❌ Clasificador neurológico no disponible');
            return null;
        }
    },

    // Función para probar todas las capacidades de IA
    testAll: function() {
        console.log('🚀 INICIANDO PRUEBAS COMPLETAS DE IA...');
        
        // 1. Análisis de texto
        console.log('\n1️⃣ Probando análisis de texto...');
        this.quickTest('stroke');
        
        // 2. Llenar textarea y activar IA automática
        console.log('\n2️⃣ Probando activación automática...');
        this.fillAndAnalyze('fisico', 'parkinson');
        
        // 3. Clasificación neurológica
        console.log('\n3️⃣ Probando clasificación...');
        this.testClassification();
        
        // 4. Dashboard de IA
        console.log('\n4️⃣ Probando dashboard...');
        if (window.AIDashboard && window.AIDashboard.updateMetrics) {
            window.AIDashboard.updateMetrics();
            console.log('✅ Dashboard actualizado');
        }
        
        console.log('\n✅ PRUEBAS COMPLETADAS - Revisa la consola y las notificaciones');
    }
};

// ===== ATAJOS RÁPIDOS =====

// Funciones globales para acceso rápido
window.testAI = () => window.AIExamples.testAll();
window.quickAI = (example) => window.AIExamples.quickTest(example);
window.fillAI = (section, example) => window.AIExamples.fillAndAnalyze(section, example);

// ===== INSTRUCCIONES EN CONSOLA =====
console.log(`
🧠 EJEMPLOS DE IA - Suite Neurología v2.1.0

📝 FORMAS DE ACTIVAR IA:

1️⃣ AUTOMÁTICA (Escribir en cualquier textarea):
   - Escribe al menos 10 caracteres
   - Ejemplo: "dolor cabeza"
   - La IA se activa automáticamente

2️⃣ MANUAL (Usar funciones de prueba):
   - testAI() - Prueba completa
   - quickAI('stroke') - Análisis rápido
   - fillAI('fisico', 'parkinson') - Llenar y analizar

3️⃣ EJEMPLOS DISPONIBLES:
   - 'stroke': "${window.AIExamples?.examples?.stroke || 'dolor cabeza súbito'}"
   - 'parkinson': "${window.AIExamples?.examples?.parkinson || 'temblor reposo'}"
   - 'alzheimer': "${window.AIExamples?.examples?.alzheimer || 'pérdida memoria'}"
   - 'epilepsia': "${window.AIExamples?.examples?.epilepsia || 'convulsiones'}"

🎯 PRUEBA RÁPIDA: Escribe "testAI()" en la consola
`);

// Auto-ejecutar una prueba simple al cargar
setTimeout(() => {
    if (window.AIEngine) {
        console.log('🔥 IA LISTA - Umbral reducido a 10 caracteres');
        console.log('💡 Escribe "dolor cabeza" en cualquier campo para ver la IA en acción');
    }
}, 2000); 