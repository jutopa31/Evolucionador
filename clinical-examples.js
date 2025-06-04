/**
 * 🏥 Ejemplos Clínicos Prácticos
 * Casos reales para demostrar el Sistema de Apoyo Clínico
 * Suite Neurología v2.1.0
 */

window.ClinicalExamples = {
    
    // Casos clínicos reales con diferentes escenarios
    cases: {
        stroke_agudo: {
            text: "Paciente de 68 años que presenta hemiparesia derecha de inicio súbito hace 2 horas, acompañada de afasia y disartria. Sin pérdida de conciencia.",
            patientData: { age: 68, hypertension: true },
            expectedFindings: ['hemiparesia', 'afasia', 'disartria'],
            expectedDx: 'Accidente Cerebrovascular (ACV)',
            urgency: 'urgent'
        },
        
        parkinson_tipico: {
            text: "Hombre de 72 años con temblor de reposo en mano derecha de 6 meses de evolución, rigidez muscular y lentitud de movimientos. Marcha con pasos cortos.",
            patientData: { age: 72 },
            expectedFindings: ['temblor', 'rigidez', 'bradicinesia'],
            expectedDx: 'Enfermedad de Parkinson',
            urgency: 'routine'
        },
        
        cefalea_alarma: {
            text: "Mujer de 45 años refiere cefalea súbita e intensa, describe como 'el peor dolor de cabeza de mi vida', acompañada de náuseas y rigidez de nuca.",
            patientData: { age: 45 },
            expectedFindings: ['cefalea'],
            redFlags: ['cefalea_subita'],
            urgency: 'urgent'
        },
        
        epilepsia_focal: {
            text: "Paciente de 28 años presenta episodios recurrentes de convulsiones focales con automatismos, pérdida de conciencia de 2-3 minutos de duración.",
            patientData: { age: 28 },
            expectedFindings: ['convulsiones'],
            expectedDx: 'Epilepsia',
            urgency: 'urgent'
        },
        
        esclerosis_multiple: {
            text: "Mujer de 32 años con episodios de diplopia, ataxia de la marcha y parestesias en extremidades, con remisiones y recaídas.",
            patientData: { age: 32 },
            expectedFindings: ['diplopia', 'ataxia', 'parestesias'],
            expectedDx: 'Esclerosis Múltiple',
            urgency: 'routine'
        },
        
        demencia_alzheimer: {
            text: "Hombre de 78 años con pérdida progresiva de memoria de 2 años de evolución, confusión frecuente y deterioro en actividades de la vida diaria.",
            patientData: { age: 78 },
            expectedFindings: ['memoria', 'confusion'],
            expectedDx: 'Demencia',
            urgency: 'routine'
        }
    },

    // Función para probar un caso clínico específico
    testCase: function(caseName) {
        const clinicalCase = this.cases[caseName];
        if (!clinicalCase) {
            console.error(`❌ Caso clínico "${caseName}" no encontrado`);
            return null;
        }

        console.log(`\n🏥 PROBANDO CASO CLÍNICO: ${caseName.toUpperCase()}`);
        console.log(`📝 Texto: ${clinicalCase.text}`);
        console.log(`👤 Paciente: ${clinicalCase.patientData.age} años`);

        if (window.ClinicalDecisionSupport) {
            const analysis = window.ClinicalDecisionSupport.analyzePatientText(
                clinicalCase.text, 
                clinicalCase.patientData
            );

            console.log(`\n🔍 RESULTADOS DEL ANÁLISIS:`);
            console.log(`• Síntomas detectados: ${analysis.findings.symptoms.join(', ')}`);
            
            if (analysis.findings.redFlags.length > 0) {
                console.log(`⚠️ Banderas rojas: ${analysis.findings.redFlags.join(', ')}`);
            }
            
            console.log(`• Urgencia: ${analysis.findings.urgency}`);
            console.log(`• Diagnósticos diferenciales:`);
            
            analysis.findings.differentialDx.forEach((dx, index) => {
                const percentage = Math.round(dx.probability * 100);
                console.log(`  ${index + 1}. ${dx.condition} (${percentage}%)`);
            });

            console.log(`• Recomendaciones:`);
            analysis.findings.recommendations.forEach(rec => {
                console.log(`  - ${rec.text}`);
            });

            // Mostrar reporte completo
            const report = window.ClinicalDecisionSupport.generateClinicalReport(analysis);
            console.log(`\n📋 REPORTE CLÍNICO:\n${report}`);

            // Mostrar notificación
            if (window.showNotification && analysis.findings.differentialDx.length > 0) {
                const topDx = analysis.findings.differentialDx[0];
                const percentage = Math.round(topDx.probability * 100);
                const urgencyIcon = analysis.findings.urgency === 'urgent' ? '🚨' : '📋';
                
                window.showNotification(
                    `${urgencyIcon} ${topDx.condition} (${percentage}%)`, 
                    analysis.findings.urgency === 'urgent' ? 'warning' : 'success'
                );
            }

            return analysis;
        } else {
            console.error('❌ Sistema de Apoyo Clínico no disponible');
            return null;
        }
    },

    // Función para probar todos los casos
    testAllCases: function() {
        console.log('🚀 INICIANDO PRUEBAS DE CASOS CLÍNICOS REALES...\n');
        
        const results = {};
        
        Object.keys(this.cases).forEach(caseName => {
            results[caseName] = this.testCase(caseName);
            console.log('\n' + '='.repeat(60) + '\n');
        });

        console.log('✅ TODAS LAS PRUEBAS COMPLETADAS');
        console.log('📊 Resumen de resultados disponible en la variable results');
        
        return results;
    },

    // Función para llenar un campo con un caso clínico
    fillCaseInField: function(caseName, fieldType = 'fisico') {
        const clinicalCase = this.cases[caseName];
        if (!clinicalCase) {
            console.error(`❌ Caso clínico "${caseName}" no encontrado`);
            return null;
        }

        const bedId = window.AppState?.currentBedId || '1';
        const textareaId = `ta-${fieldType}-${bedId}`;
        const textarea = document.getElementById(textareaId);
        
        if (textarea) {
            textarea.value = clinicalCase.text;
            textarea.focus();
            
            // Disparar evento input para activar análisis automático
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
            
            console.log(`✅ Caso "${caseName}" cargado en ${fieldType}`);
            console.log(`🔄 Análisis automático activado...`);
            
            // Mostrar notificación
            if (window.showNotification) {
                window.showNotification(`Caso clínico cargado: ${caseName}`, 'info');
            }
            
            return textarea;
        } else {
            console.error(`❌ Campo ${textareaId} no encontrado`);
            return null;
        }
    },

    // Función para probar interacciones medicamentosas
    testMedicationInteractions: function() {
        console.log('\n💊 PROBANDO INTERACCIONES MEDICAMENTOSAS...');
        
        const testMedications = [
            ['warfarina', 'aspirina'],
            ['levodopa', 'haloperidol'],
            ['fenitoína', 'warfarina'],
            ['aspirina', 'ibuprofeno']
        ];

        testMedications.forEach(meds => {
            console.log(`\n🔍 Probando: ${meds.join(' + ')}`);
            
            if (window.ClinicalDecisionSupport) {
                const interactions = window.ClinicalDecisionSupport.checkMedicationInteractions(meds);
                
                if (interactions.length > 0) {
                    interactions.forEach(interaction => {
                        console.log(`⚠️ INTERACCIÓN DETECTADA:`);
                        console.log(`   Severidad: ${interaction.severity}`);
                        console.log(`   Descripción: ${interaction.description}`);
                        console.log(`   Recomendación: ${interaction.recommendation}`);
                    });
                } else {
                    console.log(`✅ No se detectaron interacciones`);
                }
            }
        });
    },

    // Casos de uso prácticos para el día a día
    practicalUseCases: {
        urgencias: [
            "Paciente con hemiparesia súbita",
            "Cefalea súbita severa",
            "Convulsión prolongada",
            "Alteración súbita del estado de conciencia"
        ],
        consulta: [
            "Temblor de reposo progresivo",
            "Pérdida de memoria gradual",
            "Episodios de mareo recurrente",
            "Hormigueo en extremidades"
        ],
        seguimiento: [
            "Control de Parkinson en tratamiento",
            "Seguimiento post-ACV",
            "Monitoreo de epilepsia",
            "Evaluación de demencia"
        ]
    },

    // Función de ayuda para mostrar casos disponibles
    showAvailableCases: function() {
        console.log('\n📚 CASOS CLÍNICOS DISPONIBLES:\n');
        
        Object.keys(this.cases).forEach(caseName => {
            const clinicalCase = this.cases[caseName];
            console.log(`🔹 ${caseName}:`);
            console.log(`   Edad: ${clinicalCase.patientData.age} años`);
            console.log(`   Urgencia: ${clinicalCase.urgency}`);
            console.log(`   Resumen: ${clinicalCase.text.substring(0, 80)}...`);
            console.log('');
        });

        console.log('💡 USO:');
        console.log('• testCase("stroke_agudo") - Probar caso específico');
        console.log('• fillCaseInField("parkinson_tipico", "fisico") - Llenar campo');
        console.log('• testAllCases() - Probar todos los casos');
    }
};

// Funciones globales para acceso rápido
window.testClinicalCase = (caseName) => window.ClinicalExamples.testCase(caseName);
window.fillCase = (caseName, field) => window.ClinicalExamples.fillCaseInField(caseName, field);
window.testAllClinical = () => window.ClinicalExamples.testAllCases();
window.showCases = () => window.ClinicalExamples.showAvailableCases();

// Mostrar instrucciones al cargar
console.log(`
🏥 SISTEMA DE APOYO CLÍNICO - Ejemplos Prácticos

📋 CASOS CLÍNICOS REALES DISPONIBLES:
• stroke_agudo - ACV con hemiparesia
• parkinson_tipico - Parkinson clásico
• cefalea_alarma - Cefalea con banderas rojas
• epilepsia_focal - Crisis epilépticas
• esclerosis_multiple - EM con síntomas típicos
• demencia_alzheimer - Deterioro cognitivo

🎯 FUNCIONES RÁPIDAS:
• showCases() - Ver todos los casos
• testClinicalCase("stroke_agudo") - Probar caso
• fillCase("parkinson_tipico", "fisico") - Llenar campo
• testAllClinical() - Probar todos

💡 ESTO ES LO QUE HACE EL SISTEMA:
✅ Detecta síntomas automáticamente del texto
✅ Genera diagnósticos diferenciales con probabilidades
✅ Identifica banderas rojas urgentes
✅ Proporciona recomendaciones específicas
✅ Considera edad y factores de riesgo
✅ Verifica interacciones medicamentosas
`); 