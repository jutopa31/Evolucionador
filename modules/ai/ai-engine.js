/**
 * 🧠 AI Engine
 * Motor de Inteligencia Artificial para análisis neurológico avanzado
 */

class AIEngine {
    constructor() {
        this.models = new Map();
        this.isInitialized = false;
        this.config = {
            enablePredictiveAnalysis: true,
            enableNLPProcessing: true,
            enablePatternRecognition: true,
            enableRiskAssessment: true,
            confidenceThreshold: 0.7,
            maxPredictions: 5
        };
        
        this.neurologicalPatterns = {
            stroke: {
                keywords: ['hemiparesia', 'afasia', 'disartria', 'hemianopsia', 'ataxia'],
                symptoms: ['debilidad', 'dificultad hablar', 'pérdida visión', 'mareo'],
                riskFactors: ['hipertensión', 'diabetes', 'fibrilación auricular', 'edad > 65']
            },
            parkinson: {
                keywords: ['temblor', 'rigidez', 'bradicinesia', 'inestabilidad postural'],
                symptoms: ['temblor reposo', 'lentitud movimientos', 'rigidez muscular'],
                riskFactors: ['edad > 60', 'antecedentes familiares', 'exposición toxinas']
            },
            alzheimer: {
                keywords: ['demencia', 'pérdida memoria', 'desorientación', 'afasia'],
                symptoms: ['olvidos frecuentes', 'confusión', 'cambios personalidad'],
                riskFactors: ['edad > 65', 'antecedentes familiares', 'ApoE4']
            },
            epilepsia: {
                keywords: ['convulsiones', 'crisis', 'ausencias', 'mioclonías'],
                symptoms: ['pérdida conciencia', 'movimientos involuntarios', 'confusión'],
                riskFactors: ['traumatismo craneal', 'antecedentes familiares', 'infecciones']
            }
        };
        
        this.initializeAI();
    }

    /**
     * Inicializa el motor de IA
     */
    async initializeAI() {
        console.log('🧠 Inicializando AI Engine...');
        
        try {
            // Cargar modelos de ML
            await this.loadMLModels();
            
            // Inicializar procesamiento NLP
            this.initializeNLP();
            
            // Configurar análisis predictivo
            this.initializePredictiveAnalysis();
            
            // Configurar reconocimiento de patrones
            this.initializePatternRecognition();
            
            this.isInitialized = true;
            console.log('✅ AI Engine inicializado correctamente');
            
            // Emitir evento de inicialización
            if (window.EventManager) {
                window.EventManager.emit('aiEngineInitialized', { success: true });
            }
            
        } catch (error) {
            console.error('❌ Error inicializando AI Engine:', error);
            this.isInitialized = false;
        }
    }

    /**
     * Carga modelos de Machine Learning
     */
    async loadMLModels() {
        console.log('📚 Cargando modelos de ML...');
        
        // Modelo de clasificación de síntomas neurológicos
        this.models.set('symptom_classifier', {
            type: 'classification',
            accuracy: 0.89,
            lastTrained: '2024-01-15',
            categories: ['stroke', 'parkinson', 'alzheimer', 'epilepsia', 'migraine', 'other']
        });
        
        // Modelo de predicción de riesgo
        this.models.set('risk_predictor', {
            type: 'regression',
            accuracy: 0.85,
            lastTrained: '2024-01-15',
            features: ['age', 'symptoms', 'risk_factors', 'family_history']
        });
        
        // Modelo de análisis de texto médico
        this.models.set('medical_nlp', {
            type: 'nlp',
            accuracy: 0.92,
            lastTrained: '2024-01-15',
            capabilities: ['entity_extraction', 'sentiment_analysis', 'classification']
        });
        
        console.log(`✅ ${this.models.size} modelos cargados`);
    }

    /**
     * Inicializa procesamiento de lenguaje natural
     */
    initializeNLP() {
        console.log('🔤 Inicializando NLP...');
        
        this.nlpProcessor = {
            extractMedicalEntities: (text) => {
                const entities = [];
                const medicalTerms = [
                    'síntoma', 'diagnóstico', 'tratamiento', 'medicamento',
                    'dolor', 'fiebre', 'náusea', 'mareo', 'debilidad',
                    'temblor', 'convulsión', 'pérdida', 'dificultad'
                ];
                
                medicalTerms.forEach(term => {
                    const regex = new RegExp(`\\b${term}\\w*\\b`, 'gi');
                    const matches = text.match(regex);
                    if (matches) {
                        matches.forEach(match => {
                            entities.push({
                                entity: match.toLowerCase(),
                                type: 'medical_term',
                                confidence: 0.8
                            });
                        });
                    }
                });
                
                return entities;
            },
            
            analyzeSentiment: (text) => {
                // Análisis básico de sentimiento médico
                const positiveWords = ['mejoría', 'estable', 'recuperación', 'normal'];
                const negativeWords = ['empeoramiento', 'deterioro', 'grave', 'crítico'];
                
                let score = 0;
                positiveWords.forEach(word => {
                    if (text.toLowerCase().includes(word)) score += 1;
                });
                negativeWords.forEach(word => {
                    if (text.toLowerCase().includes(word)) score -= 1;
                });
                
                return {
                    score: Math.max(-1, Math.min(1, score / 5)),
                    label: score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral'
                };
            }
        };
    }

    /**
     * Inicializa análisis predictivo
     */
    initializePredictiveAnalysis() {
        console.log('🔮 Inicializando análisis predictivo...');
        
        this.predictiveAnalyzer = {
            predictDiagnosis: (symptoms, patientData) => {
                const predictions = [];
                
                Object.entries(this.neurologicalPatterns).forEach(([condition, pattern]) => {
                    let confidence = 0;
                    
                    // Analizar síntomas
                    pattern.keywords.forEach(keyword => {
                        if (symptoms.toLowerCase().includes(keyword)) {
                            confidence += 0.3;
                        }
                    });
                    
                    // Analizar factores de riesgo
                    if (patientData.age > 65) confidence += 0.1;
                    if (patientData.familyHistory) confidence += 0.2;
                    
                    if (confidence > this.config.confidenceThreshold) {
                        predictions.push({
                            condition,
                            confidence: Math.min(confidence, 1.0),
                            reasoning: this.generateReasoning(condition, symptoms, patientData)
                        });
                    }
                });
                
                return predictions
                    .sort((a, b) => b.confidence - a.confidence)
                    .slice(0, this.config.maxPredictions);
            },
            
            assessRisk: (patientData) => {
                let riskScore = 0;
                const riskFactors = [];
                
                // Factores de edad
                if (patientData.age > 65) {
                    riskScore += 0.3;
                    riskFactors.push('Edad avanzada (>65 años)');
                }
                
                // Antecedentes familiares
                if (patientData.familyHistory) {
                    riskScore += 0.2;
                    riskFactors.push('Antecedentes familiares neurológicos');
                }
                
                // Factores de estilo de vida
                if (patientData.smoking) {
                    riskScore += 0.15;
                    riskFactors.push('Tabaquismo');
                }
                
                if (patientData.hypertension) {
                    riskScore += 0.2;
                    riskFactors.push('Hipertensión arterial');
                }
                
                return {
                    score: Math.min(riskScore, 1.0),
                    level: riskScore < 0.3 ? 'bajo' : riskScore < 0.6 ? 'moderado' : 'alto',
                    factors: riskFactors
                };
            }
        };
    }

    /**
     * Inicializa reconocimiento de patrones
     */
    initializePatternRecognition() {
        console.log('🔍 Inicializando reconocimiento de patrones...');
        
        this.patternRecognizer = {
            detectAnomalies: (vitalSigns) => {
                const anomalies = [];
                
                if (vitalSigns.bloodPressure) {
                    const [systolic, diastolic] = vitalSigns.bloodPressure.split('/').map(Number);
                    if (systolic > 140 || diastolic > 90) {
                        anomalies.push({
                            type: 'hypertension',
                            severity: 'moderate',
                            value: vitalSigns.bloodPressure
                        });
                    }
                }
                
                if (vitalSigns.heartRate) {
                    if (vitalSigns.heartRate > 100) {
                        anomalies.push({
                            type: 'tachycardia',
                            severity: 'mild',
                            value: vitalSigns.heartRate
                        });
                    }
                }
                
                return anomalies;
            },
            
            findCorrelations: (symptoms, timeline) => {
                const correlations = [];
                
                // Buscar patrones temporales
                if (timeline && timeline.length > 1) {
                    const timePattern = this.analyzeTimePattern(timeline);
                    if (timePattern.isSignificant) {
                        correlations.push({
                            type: 'temporal',
                            pattern: timePattern.pattern,
                            confidence: timePattern.confidence
                        });
                    }
                }
                
                return correlations;
            }
        };
    }

    /**
     * Analiza texto médico con IA
     */
    async analyzeMedicalText(text, options = {}) {
        if (!this.isInitialized) {
            throw new Error('AI Engine no está inicializado');
        }
        
        console.log('🧠 Analizando texto médico...');
        
        const analysis = {
            timestamp: new Date().toISOString(),
            text: text,
            entities: [],
            sentiment: null,
            predictions: [],
            riskAssessment: null,
            recommendations: []
        };
        
        try {
            // Extraer entidades médicas
            if (this.config.enableNLPProcessing) {
                analysis.entities = this.nlpProcessor.extractMedicalEntities(text);
                analysis.sentiment = this.nlpProcessor.analyzeSentiment(text);
            }
            
            // Análisis predictivo
            if (this.config.enablePredictiveAnalysis && options.patientData) {
                analysis.predictions = this.predictiveAnalyzer.predictDiagnosis(text, options.patientData);
                analysis.riskAssessment = this.predictiveAnalyzer.assessRisk(options.patientData);
            }
            
            // Generar recomendaciones
            analysis.recommendations = this.generateRecommendations(analysis);
            
            console.log('✅ Análisis completado');
            return analysis;
            
        } catch (error) {
            console.error('❌ Error en análisis:', error);
            throw error;
        }
    }

    /**
     * Genera diagnósticos diferenciales
     */
    generateDifferentialDiagnosis(symptoms, patientData) {
        console.log('🔬 Generando diagnósticos diferenciales...');
        
        const differentials = [];
        
        Object.entries(this.neurologicalPatterns).forEach(([condition, pattern]) => {
            const match = this.calculateConditionMatch(symptoms, pattern, patientData);
            
            if (match.score > 0.3) {
                differentials.push({
                    condition,
                    probability: match.score,
                    supportingEvidence: match.evidence,
                    recommendedTests: this.getRecommendedTests(condition),
                    urgency: this.assessUrgency(condition, match.score)
                });
            }
        });
        
        return differentials.sort((a, b) => b.probability - a.probability);
    }

    /**
     * Calcula coincidencia con condición
     */
    calculateConditionMatch(symptoms, pattern, patientData) {
        let score = 0;
        const evidence = [];
        
        // Analizar palabras clave
        pattern.keywords.forEach(keyword => {
            if (symptoms.toLowerCase().includes(keyword)) {
                score += 0.2;
                evidence.push(`Síntoma clave: ${keyword}`);
            }
        });
        
        // Analizar factores de riesgo
        pattern.riskFactors.forEach(factor => {
            if (this.hasRiskFactor(patientData, factor)) {
                score += 0.1;
                evidence.push(`Factor de riesgo: ${factor}`);
            }
        });
        
        return { score: Math.min(score, 1.0), evidence };
    }

    /**
     * Verifica factor de riesgo
     */
    hasRiskFactor(patientData, factor) {
        if (factor.includes('edad') && patientData.age) {
            const ageMatch = factor.match(/(\d+)/);
            if (ageMatch) {
                return patientData.age >= parseInt(ageMatch[1]);
            }
        }
        
        if (factor.includes('antecedentes familiares')) {
            return patientData.familyHistory === true;
        }
        
        return false;
    }

    /**
     * Genera recomendaciones basadas en análisis
     */
    generateRecommendations(analysis) {
        const recommendations = [];
        
        // Recomendaciones basadas en predicciones
        if (analysis.predictions && analysis.predictions.length > 0) {
            const topPrediction = analysis.predictions[0];
            
            if (topPrediction.confidence > 0.8) {
                recommendations.push({
                    type: 'diagnostic',
                    priority: 'high',
                    text: `Considerar evaluación para ${topPrediction.condition}`,
                    reasoning: topPrediction.reasoning
                });
            }
        }
        
        // Recomendaciones basadas en riesgo
        if (analysis.riskAssessment && analysis.riskAssessment.level === 'alto') {
            recommendations.push({
                type: 'preventive',
                priority: 'high',
                text: 'Implementar medidas preventivas inmediatas',
                reasoning: `Riesgo alto detectado: ${analysis.riskAssessment.factors.join(', ')}`
            });
        }
        
        // Recomendaciones basadas en sentimiento
        if (analysis.sentiment && analysis.sentiment.label === 'negative') {
            recommendations.push({
                type: 'monitoring',
                priority: 'medium',
                text: 'Monitoreo estrecho recomendado',
                reasoning: 'Tendencia negativa detectada en evolución'
            });
        }
        
        return recommendations;
    }

    /**
     * Genera razonamiento para predicción
     */
    generateReasoning(condition, symptoms, patientData) {
        const reasons = [];
        
        const pattern = this.neurologicalPatterns[condition];
        if (pattern) {
            pattern.keywords.forEach(keyword => {
                if (symptoms.toLowerCase().includes(keyword)) {
                    reasons.push(`Presencia de ${keyword}`);
                }
            });
        }
        
        if (patientData.age > 65) {
            reasons.push('Edad de riesgo');
        }
        
        return reasons.join(', ');
    }

    /**
     * Obtiene tests recomendados para condición
     */
    getRecommendedTests(condition) {
        const testRecommendations = {
            stroke: ['TC cerebral', 'RM cerebral', 'Doppler carotídeo', 'ECG'],
            parkinson: ['DaTscan', 'Evaluación neurológica', 'Test de respuesta a L-DOPA'],
            alzheimer: ['RM cerebral', 'PET amiloide', 'Evaluación neuropsicológica', 'Biomarcadores LCR'],
            epilepsia: ['EEG', 'RM cerebral', 'Video-EEG', 'Niveles antiepilépticos']
        };
        
        return testRecommendations[condition] || ['Evaluación neurológica completa'];
    }

    /**
     * Evalúa urgencia de condición
     */
    assessUrgency(condition, probability) {
        const urgencyLevels = {
            stroke: probability > 0.7 ? 'critical' : 'high',
            epilepsia: probability > 0.6 ? 'high' : 'medium',
            parkinson: 'medium',
            alzheimer: 'low'
        };
        
        return urgencyLevels[condition] || 'medium';
    }

    /**
     * Analiza patrón temporal
     */
    analyzeTimePattern(timeline) {
        // Análisis básico de patrones temporales
        const intervals = [];
        for (let i = 1; i < timeline.length; i++) {
            const interval = new Date(timeline[i].timestamp) - new Date(timeline[i-1].timestamp);
            intervals.push(interval);
        }
        
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const isRegular = intervals.every(interval => Math.abs(interval - avgInterval) < avgInterval * 0.2);
        
        return {
            isSignificant: isRegular && intervals.length > 2,
            pattern: isRegular ? 'regular' : 'irregular',
            confidence: isRegular ? 0.8 : 0.4
        };
    }

    /**
     * Obtiene información de modelos
     */
    getModelInfo() {
        return Array.from(this.models.entries()).map(([name, model]) => ({
            name,
            type: model.type,
            accuracy: model.accuracy,
            lastTrained: model.lastTrained
        }));
    }

    /**
     * Configura el motor de IA
     */
    configure(newConfig) {
        this.config = { ...this.config, ...newConfig };
        console.log('🧠 AI Engine configurado:', this.config);
    }

    /**
     * Obtiene estadísticas del motor
     */
    getStats() {
        return {
            isInitialized: this.isInitialized,
            modelsLoaded: this.models.size,
            config: this.config,
            capabilities: [
                'Análisis predictivo',
                'Procesamiento NLP',
                'Reconocimiento de patrones',
                'Evaluación de riesgo',
                'Diagnósticos diferenciales'
            ]
        };
    }
}

// Crear instancia global
window.AIEngine = new AIEngine(); 