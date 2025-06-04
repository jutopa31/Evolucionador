/**
 * 🏥 Clinical Decision Support System
 * Sistema de Apoyo a Decisiones Clínicas para Neurología
 * Suite Neurología v2.1.0
 */

class ClinicalDecisionSupport {
    constructor() {
        this.initialized = false;
        this.clinicalRules = this.initializeClinicalRules();
        this.diagnosticCriteria = this.initializeDiagnosticCriteria();
        this.redFlags = this.initializeRedFlags();
        this.medicationInteractions = this.initializeMedicationDB();
        
        console.log('🏥 Sistema de Apoyo Clínico inicializado');
        this.initialized = true;
    }

    /**
     * Análisis clínico principal basado en texto libre
     */
    analyzePatientText(text, patientData = {}) {
        console.log('🔍 Analizando texto clínico:', text.substring(0, 50) + '...');
        
        const analysis = {
            timestamp: new Date().toISOString(),
            inputText: text,
            patientAge: patientData.age || null,
            findings: {
                symptoms: this.extractSymptoms(text),
                redFlags: this.detectRedFlags(text),
                differentialDx: [],
                recommendations: [],
                urgency: 'routine'
            },
            confidence: 0
        };

        // Análisis de síntomas
        const symptoms = analysis.findings.symptoms;
        
        // Generar diagnósticos diferenciales basados en síntomas
        analysis.findings.differentialDx = this.generateDifferentialDiagnosis(symptoms, patientData);
        
        // Detectar banderas rojas
        const redFlags = analysis.findings.redFlags;
        if (redFlags.length > 0) {
            analysis.findings.urgency = 'urgent';
            analysis.findings.recommendations.push({
                type: 'urgent',
                text: `⚠️ BANDERA ROJA detectada: ${redFlags.join(', ')}`,
                priority: 'high'
            });
        }

        // Generar recomendaciones específicas
        analysis.findings.recommendations.push(...this.generateRecommendations(symptoms, patientData));

        // Calcular confianza basada en síntomas encontrados
        analysis.confidence = Math.min(symptoms.length * 0.2, 0.95);

        console.log('✅ Análisis clínico completado:', analysis.findings.differentialDx.length, 'diagnósticos');
        return analysis;
    }

    /**
     * Extrae síntomas del texto usando patrones clínicos
     */
    extractSymptoms(text) {
        const textLower = text.toLowerCase();
        const symptoms = [];

        const symptomPatterns = {
            // Síntomas motores
            'hemiparesia': /hemiparesia|debilidad.*lado|paresia.*derech|paresia.*izquier/,
            'temblor': /temblor|temblores|tembloroso/,
            'rigidez': /rigidez|rígido|rigidez muscular|hipertonía/,
            'bradicinesia': /bradicinesia|lentitud.*movimiento|movimientos.*lento/,
            'ataxia': /ataxia|incoordinación|marcha.*inestable|equilibrio/,
            
            // Síntomas cognitivos
            'confusion': /confusión|confuso|desorientad|alteración.*conciencia/,
            'memoria': /pérdida.*memoria|olvidos|amnesia|deterioro.*cognitivo/,
            'afasia': /afasia|dificultad.*hablar|problemas.*lenguaje/,
            'disartria': /disartria|habla.*arrastrada|dificultad.*articular/,
            
            // Síntomas sensitivos
            'cefalea': /cefalea|dolor.*cabeza|cefalalgia/,
            'mareo': /mareo|vértigo|inestabilidad/,
            'parestesias': /parestesias|hormigueo|entumecimiento|adormecimiento/,
            
            // Síntomas específicos
            'convulsiones': /convulsión|convulsiones|crisis.*epiléptica|epilepsia/,
            'diplopia': /diplopia|visión.*doble|diplopía/,
            'disfagia': /disfagia|dificultad.*tragar|problemas.*deglución/,
            'incontinencia': /incontinencia|pérdida.*control.*esfínter/
        };

        for (const [symptom, pattern] of Object.entries(symptomPatterns)) {
            if (pattern.test(textLower)) {
                symptoms.push(symptom);
            }
        }

        return symptoms;
    }

    /**
     * Detecta banderas rojas que requieren atención urgente
     */
    detectRedFlags(text) {
        const textLower = text.toLowerCase();
        const redFlags = [];

        const redFlagPatterns = {
            'cefalea_subita': /cefalea.*súbita|dolor.*cabeza.*súbito|peor.*dolor.*vida/,
            'deficit_focal_agudo': /déficit.*focal.*agudo|hemiparesia.*aguda|afasia.*súbita/,
            'alteracion_conciencia': /pérdida.*conciencia|coma|estupor|glasgow/,
            'fiebre_neurologica': /fiebre.*síntomas.*neurológicos|meningismo/,
            'convulsion_prolongada': /convulsión.*prolongada|status.*epilepticus|crisis.*continua/,
            'trauma_craneal': /trauma.*craneal|golpe.*cabeza|traumatismo.*cráneo/
        };

        for (const [flag, pattern] of Object.entries(redFlagPatterns)) {
            if (pattern.test(textLower)) {
                redFlags.push(this.redFlags[flag] || flag);
            }
        }

        return redFlags;
    }

    /**
     * Genera diagnósticos diferenciales basados en síntomas
     */
    generateDifferentialDiagnosis(symptoms, patientData) {
        const differentials = [];
        const age = patientData.age || 50;

        // Reglas clínicas para diagnósticos diferenciales
        const diagnosticRules = [
            {
                condition: 'Accidente Cerebrovascular (ACV)',
                symptoms: ['hemiparesia', 'afasia', 'disartria', 'diplopia'],
                ageWeight: age > 50 ? 1.2 : 0.8,
                urgency: 'urgent',
                description: 'Déficit neurológico focal de inicio agudo'
            },
            {
                condition: 'Enfermedad de Parkinson',
                symptoms: ['temblor', 'rigidez', 'bradicinesia'],
                ageWeight: age > 60 ? 1.1 : 0.9,
                urgency: 'routine',
                description: 'Trastorno neurodegenerativo con síntomas motores'
            },
            {
                condition: 'Epilepsia',
                symptoms: ['convulsiones'],
                ageWeight: 1.0,
                urgency: 'urgent',
                description: 'Trastorno convulsivo'
            },
            {
                condition: 'Migraña',
                symptoms: ['cefalea', 'mareo'],
                ageWeight: age < 50 ? 1.1 : 0.9,
                urgency: 'routine',
                description: 'Cefalea primaria recurrente'
            },
            {
                condition: 'Esclerosis Múltiple',
                symptoms: ['ataxia', 'diplopia', 'parestesias'],
                ageWeight: age < 40 ? 1.2 : 0.7,
                urgency: 'routine',
                description: 'Enfermedad desmielinizante'
            },
            {
                condition: 'Demencia',
                symptoms: ['memoria', 'confusion'],
                ageWeight: age > 65 ? 1.3 : 0.6,
                urgency: 'routine',
                description: 'Deterioro cognitivo progresivo'
            }
        ];

        // Calcular probabilidades para cada diagnóstico
        diagnosticRules.forEach(rule => {
            const matchedSymptoms = rule.symptoms.filter(s => symptoms.includes(s));
            
            if (matchedSymptoms.length > 0) {
                const baseScore = matchedSymptoms.length / rule.symptoms.length;
                const ageAdjustedScore = baseScore * rule.ageWeight;
                const finalScore = Math.min(ageAdjustedScore, 0.95);

                if (finalScore > 0.2) { // Solo incluir si hay probabilidad razonable
                    differentials.push({
                        condition: rule.condition,
                        probability: finalScore,
                        matchedSymptoms: matchedSymptoms,
                        urgency: rule.urgency,
                        description: rule.description,
                        confidence: finalScore > 0.7 ? 'high' : finalScore > 0.4 ? 'medium' : 'low'
                    });
                }
            }
        });

        // Ordenar por probabilidad
        differentials.sort((a, b) => b.probability - a.probability);

        return differentials.slice(0, 5); // Top 5 diagnósticos
    }

    /**
     * Genera recomendaciones clínicas específicas
     */
    generateRecommendations(symptoms, patientData) {
        const recommendations = [];

        // Recomendaciones basadas en síntomas específicos
        if (symptoms.includes('hemiparesia') || symptoms.includes('afasia')) {
            recommendations.push({
                type: 'imaging',
                text: '🧠 Considerar TC/RM cerebral urgente para descartar ACV',
                priority: 'high'
            });
        }

        if (symptoms.includes('cefalea')) {
            recommendations.push({
                type: 'assessment',
                text: '📋 Evaluar características de cefalea (inicio, intensidad, factores desencadenantes)',
                priority: 'medium'
            });
        }

        if (symptoms.includes('convulsiones')) {
            recommendations.push({
                type: 'monitoring',
                text: '⚡ Monitoreo neurológico estrecho, considerar EEG',
                priority: 'high'
            });
        }

        if (symptoms.includes('temblor') && symptoms.includes('rigidez')) {
            recommendations.push({
                type: 'specialist',
                text: '👨‍⚕️ Considerar evaluación por neurología para trastornos del movimiento',
                priority: 'medium'
            });
        }

        if (symptoms.includes('memoria') && patientData.age > 65) {
            recommendations.push({
                type: 'cognitive',
                text: '🧠 Evaluación cognitiva formal (MMSE, MoCA)',
                priority: 'medium'
            });
        }

        return recommendations;
    }

    /**
     * Análisis de interacciones medicamentosas
     */
    checkMedicationInteractions(medications) {
        const interactions = [];
        
        for (let i = 0; i < medications.length; i++) {
            for (let j = i + 1; j < medications.length; j++) {
                const med1 = medications[i].toLowerCase();
                const med2 = medications[j].toLowerCase();
                
                const interaction = this.findInteraction(med1, med2);
                if (interaction) {
                    interactions.push({
                        medications: [medications[i], medications[j]],
                        severity: interaction.severity,
                        description: interaction.description,
                        recommendation: interaction.recommendation
                    });
                }
            }
        }

        return interactions;
    }

    /**
     * Busca interacciones específicas entre medicamentos
     */
    findInteraction(med1, med2) {
        const interactionPairs = [
            {
                meds: ['warfarina', 'aspirina'],
                severity: 'high',
                description: 'Riesgo aumentado de sangrado',
                recommendation: 'Monitoreo estrecho de INR y signos de sangrado'
            },
            {
                meds: ['levodopa', 'haloperidol'],
                severity: 'high',
                description: 'Antagonismo dopaminérgico',
                recommendation: 'Evitar uso concomitante, considerar alternativas'
            },
            {
                meds: ['fenitoína', 'warfarina'],
                severity: 'medium',
                description: 'Alteración del metabolismo de warfarina',
                recommendation: 'Ajustar dosis y monitorear INR'
            }
        ];

        return interactionPairs.find(pair => 
            (pair.meds.includes(med1) && pair.meds.includes(med2))
        );
    }

    /**
     * Inicializa reglas clínicas
     */
    initializeClinicalRules() {
        return {
            stroke_criteria: {
                major: ['hemiparesia', 'afasia', 'alteracion_conciencia'],
                minor: ['disartria', 'diplopia', 'ataxia'],
                timeWindow: '4.5 horas para trombolisis'
            },
            parkinson_criteria: {
                cardinal: ['temblor', 'rigidez', 'bradicinesia'],
                supportive: ['respuesta_levodopa', 'asimetria_sintomas']
            }
        };
    }

    /**
     * Inicializa criterios diagnósticos
     */
    initializeDiagnosticCriteria() {
        return {
            stroke: 'Déficit neurológico focal de inicio agudo',
            parkinson: 'Al menos 2 de 3 síntomas cardinales',
            epilepsia: 'Crisis epilépticas recurrentes no provocadas'
        };
    }

    /**
     * Inicializa banderas rojas
     */
    initializeRedFlags() {
        return {
            cefalea_subita: 'Cefalea súbita severa',
            deficit_focal_agudo: 'Déficit neurológico focal agudo',
            alteracion_conciencia: 'Alteración del estado de conciencia',
            fiebre_neurologica: 'Fiebre con síntomas neurológicos',
            convulsion_prolongada: 'Convulsión prolongada',
            trauma_craneal: 'Trauma craneoencefálico reciente'
        };
    }

    /**
     * Inicializa base de datos de medicamentos
     */
    initializeMedicationDB() {
        return {
            anticoagulantes: ['warfarina', 'heparina', 'rivaroxaban'],
            antiepilépticos: ['fenitoína', 'carbamazepina', 'valproato'],
            antiparkinsonianos: ['levodopa', 'pramipexol', 'ropinirol']
        };
    }

    /**
     * Genera reporte clínico completo
     */
    generateClinicalReport(analysis) {
        let report = `📋 REPORTE CLÍNICO NEUROLÓGICO\n`;
        report += `Fecha: ${new Date(analysis.timestamp).toLocaleString()}\n\n`;
        
        report += `🔍 SÍNTOMAS IDENTIFICADOS:\n`;
        analysis.findings.symptoms.forEach(symptom => {
            report += `• ${symptom}\n`;
        });
        
        if (analysis.findings.redFlags.length > 0) {
            report += `\n⚠️ BANDERAS ROJAS:\n`;
            analysis.findings.redFlags.forEach(flag => {
                report += `• ${flag}\n`;
            });
        }
        
        report += `\n🎯 DIAGNÓSTICOS DIFERENCIALES:\n`;
        analysis.findings.differentialDx.forEach((dx, index) => {
            const percentage = Math.round(dx.probability * 100);
            report += `${index + 1}. ${dx.condition} (${percentage}%)\n`;
            report += `   ${dx.description}\n`;
        });
        
        report += `\n💡 RECOMENDACIONES:\n`;
        analysis.findings.recommendations.forEach(rec => {
            report += `• ${rec.text}\n`;
        });
        
        return report;
    }

    /**
     * Obtiene estadísticas del sistema
     */
    getSystemStats() {
        return {
            initialized: this.initialized,
            clinicalRules: Object.keys(this.clinicalRules).length,
            redFlags: Object.keys(this.redFlags).length,
            medicationInteractions: 'Base de datos básica cargada'
        };
    }
}

// Crear instancia global
window.ClinicalDecisionSupport = new ClinicalDecisionSupport();

console.log('🏥 Sistema de Apoyo a Decisiones Clínicas cargado'); 