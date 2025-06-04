/**
 * 🧠 AI Integration
 * Integración de IA con Suite Neurología
 */

class AIIntegration {
    constructor() {
        this.isInitialized = false;
        this.aiEngine = null;
        this.neuralClassifier = null;
        this.dashboard = null;
        
        this.config = {
            enableAutoAnalysis: true,
            enableRealTimePredictions: true,
            enableSmartSuggestions: true,
            confidenceThreshold: 0.7,
            autoTrainModels: true
        };
        
        this.analysisQueue = [];
        this.isProcessing = false;
        
        this.initializeAI();
    }

    /**
     * Inicializa la integración de IA
     */
    async initializeAI() {
        console.log('🧠 Inicializando integración de IA...');
        
        try {
            // Esperar a que los módulos estén disponibles
            await this.waitForModules();
            
            // Inicializar componentes
            this.aiEngine = window.AIEngine;
            this.neuralClassifier = window.NeurologicalPatternClassifier;
            this.dashboard = window.AIDashboard;
            
            // Entrenar modelos si es necesario
            if (this.config.autoTrainModels) {
                await this.trainModels();
            }
            
            // Configurar integración con la aplicación
            this.setupAppIntegration();
            
            // Configurar análisis automático
            this.setupAutoAnalysis();
            
            // Añadir botón de IA al UI
            // DESHABILITADO: Solo acceso por hotkey
            // this.addAIButton();
            
            this.isInitialized = true;
            console.log('✅ Integración de IA completada');
            
            // Emitir evento
            if (window.EventManager) {
                window.EventManager.emit('aiIntegrationReady', { success: true });
            }
            
        } catch (error) {
            console.error('❌ Error en integración de IA:', error);
            this.isInitialized = false;
        }
    }

    /**
     * Espera a que los módulos estén disponibles
     */
    async waitForModules() {
        const maxWait = 10000; // 10 segundos
        const checkInterval = 100; // 100ms
        let waited = 0;
        
        while (waited < maxWait) {
            if (window.AIEngine && window.NeurologicalPatternClassifier && window.AIDashboard) {
                return true;
            }
            
            await new Promise(resolve => setTimeout(resolve, checkInterval));
            waited += checkInterval;
        }
        
        throw new Error('Módulos de IA no disponibles después de 10 segundos');
    }

    /**
     * Entrena los modelos de IA
     */
    async trainModels() {
        console.log('🎯 Entrenando modelos de IA...');
        
        try {
            if (this.neuralClassifier && !this.neuralClassifier.isTrainedForNeurology) {
                await this.neuralClassifier.trainNeurologicalClassifier();
                console.log('✅ Clasificador neurológico entrenado');
            }
        } catch (error) {
            console.error('❌ Error entrenando modelos:', error);
        }
    }

    /**
     * Configura integración con la aplicación
     */
    setupAppIntegration() {
        console.log('🔗 Configurando integración con aplicación...');
        
        // Interceptar cambios en campos de texto para análisis automático
        this.setupTextAnalysis();
        
        // Configurar sugerencias inteligentes
        this.setupSmartSuggestions();
        
        // Configurar análisis de medicamentos
        this.setupMedicationAnalysis();
        
        // Configurar eventos de la aplicación
        this.setupAppEvents();
    }

    /**
     * Configura análisis de texto automático
     */
    setupTextAnalysis() {
        // Observar cambios en textareas principales
        const textAreas = document.querySelectorAll('textarea[data-key]');
        
        textAreas.forEach(textarea => {
            let analysisTimeout;
            
            textarea.addEventListener('input', () => {
                clearTimeout(analysisTimeout);
                
                // Análisis con debounce de 2 segundos
                analysisTimeout = setTimeout(() => {
                    if (textarea.value.length > 50) {
                        this.analyzeText(textarea.value, {
                            source: textarea.dataset.key,
                            element: textarea
                        });
                    }
                }, 2000);
            });
        });
    }

    /**
     * Configura sugerencias inteligentes
     */
    setupSmartSuggestions() {
        // Crear contenedor para sugerencias
        const suggestionsContainer = document.createElement('div');
        suggestionsContainer.id = 'ai-suggestions';
        suggestionsContainer.className = 'ai-suggestions-container';
        suggestionsContainer.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 300px;
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            padding: 15px;
            z-index: 1000;
            display: none;
        `;
        
        document.body.appendChild(suggestionsContainer);
    }

    /**
     * Configura análisis de medicamentos
     */
    setupMedicationAnalysis() {
        // Interceptar adición de medicamentos
        if (window.EventManager) {
            window.EventManager.on('medicationAdded', (data) => {
                this.analyzeMedication(data.medication);
            });
        }
    }

    /**
     * Configura eventos de la aplicación
     */
    setupAppEvents() {
        if (window.EventManager) {
            // Análisis cuando se cambia de cama
            window.EventManager.on('bedChanged', (data) => {
                this.analyzeBedData(data.bedId);
            });
            
            // Análisis cuando se guarda
            window.EventManager.on('dataSaved', (data) => {
                this.performFullAnalysis(data.bedId);
            });
        }
    }

    /**
     * Configura análisis automático
     */
    setupAutoAnalysis() {
        if (this.config.enableAutoAnalysis) {
            // Análisis periódico cada 5 minutos
            setInterval(() => {
                this.performPeriodicAnalysis();
            }, 5 * 60 * 1000);
        }
    }

    /**
     * Analiza texto médico
     */
    async analyzeText(text, options = {}) {
        if (!this.isInitialized || !this.aiEngine) return;
        
        try {
            console.log('🧠 Analizando texto médico...');
            
            // Obtener datos del paciente actual
            const patientData = this.getCurrentPatientData();
            
            // Análisis con AI Engine
            const analysis = await this.aiEngine.analyzeMedicalText(text, {
                patientData,
                source: options.source
            });
            
            // Mostrar sugerencias si hay predicciones significativas
            if (analysis.predictions && analysis.predictions.length > 0) {
                this.showAISuggestions(analysis, options.element);
            }
            
            // Emitir evento para dashboard
            if (window.EventManager) {
                window.EventManager.emit('aiAnalysisCompleted', {
                    analysis,
                    source: options.source,
                    summary: `Análisis de ${options.source}: ${analysis.predictions.length} predicciones`
                });
            }
            
            return analysis;
            
        } catch (error) {
            console.error('❌ Error en análisis de texto:', error);
        }
    }

    /**
     * Analiza medicamento
     */
    async analyzeMedication(medication) {
        if (!this.isInitialized) return;
        
        try {
            console.log('💊 Analizando medicamento:', medication);
            
            // Verificar interacciones y contraindicaciones
            const analysis = {
                medication: medication,
                interactions: [],
                contraindications: [],
                recommendations: []
            };
            
            // Análisis básico de interacciones
            const currentMedications = this.getCurrentMedications();
            analysis.interactions = this.checkMedicationInteractions(medication, currentMedications);
            
            // Verificar contraindicaciones
            const patientData = this.getCurrentPatientData();
            analysis.contraindications = this.checkContraindications(medication, patientData);
            
            // Generar recomendaciones
            if (analysis.interactions.length > 0 || analysis.contraindications.length > 0) {
                this.showMedicationAlert(analysis);
            }
            
            return analysis;
            
        } catch (error) {
            console.error('❌ Error en análisis de medicamento:', error);
        }
    }

    /**
     * Analiza datos de cama completos
     */
    async analyzeBedData(bedId) {
        if (!this.isInitialized) return;
        
        try {
            console.log('🛏️ Analizando datos de cama:', bedId);
            
            const bedData = this.getBedData(bedId);
            if (!bedData) return;
            
            // Análisis neurológico con clasificador
            if (this.neuralClassifier && this.neuralClassifier.isTrainedForNeurology) {
                const symptoms = this.extractSymptomsFromBedData(bedData);
                const classification = this.neuralClassifier.classifyNeurologicalSymptoms(symptoms);
                
                // Emitir predicción para dashboard
                if (window.EventManager) {
                    window.EventManager.emit('aiPredictionMade', {
                        condition: classification.topPrediction.condition,
                        confidence: classification.topPrediction.probability,
                        bedId: bedId
                    });
                }
                
                return classification;
            }
            
        } catch (error) {
            console.error('❌ Error en análisis de cama:', error);
        }
    }

    /**
     * Realiza análisis completo
     */
    async performFullAnalysis(bedId) {
        if (!this.isInitialized) return;
        
        this.analysisQueue.push({
            type: 'full',
            bedId: bedId,
            timestamp: Date.now()
        });
        
        this.processAnalysisQueue();
    }

    /**
     * Realiza análisis periódico
     */
    async performPeriodicAnalysis() {
        if (!this.isInitialized) return;
        
        console.log('⏰ Análisis periódico automático...');
        
        // Analizar cama actual
        const currentBedId = window.AppStateManager?.getCurrentBedId();
        if (currentBedId) {
            await this.analyzeBedData(currentBedId);
        }
    }

    /**
     * Procesa cola de análisis
     */
    async processAnalysisQueue() {
        if (this.isProcessing || this.analysisQueue.length === 0) return;
        
        this.isProcessing = true;
        
        while (this.analysisQueue.length > 0) {
            const task = this.analysisQueue.shift();
            
            try {
                switch (task.type) {
                    case 'full':
                        await this.analyzeBedData(task.bedId);
                        break;
                    case 'text':
                        await this.analyzeText(task.text, task.options);
                        break;
                }
            } catch (error) {
                console.error('❌ Error procesando análisis:', error);
            }
            
            // Pausa entre análisis para no sobrecargar
            await new Promise(resolve => setTimeout(resolve, 500));
        }
        
        this.isProcessing = false;
    }

    /**
     * Muestra sugerencias de IA
     */
    showAISuggestions(analysis, targetElement) {
        const container = document.getElementById('ai-suggestions');
        if (!container) return;
        
        let html = '<h4>🧠 Sugerencias de IA</h4>';
        
        // Predicciones
        if (analysis.predictions && analysis.predictions.length > 0) {
            html += '<div class="ai-predictions">';
            html += '<strong>Posibles diagnósticos:</strong><ul>';
            
            analysis.predictions.slice(0, 3).forEach(pred => {
                const confidence = (pred.confidence * 100).toFixed(1);
                html += `<li>${pred.condition} (${confidence}%)</li>`;
            });
            
            html += '</ul></div>';
        }
        
        // Recomendaciones
        if (analysis.recommendations && analysis.recommendations.length > 0) {
            html += '<div class="ai-recommendations">';
            html += '<strong>Recomendaciones:</strong><ul>';
            
            analysis.recommendations.forEach(rec => {
                html += `<li class="priority-${rec.priority}">${rec.text}</li>`;
            });
            
            html += '</ul></div>';
        }
        
        // Botón cerrar
        html += '<button onclick="this.parentElement.style.display=\'none\'" style="float: right; margin-top: 10px;">Cerrar</button>';
        
        container.innerHTML = html;
        container.style.display = 'block';
        
        // Auto-ocultar después de 10 segundos
        setTimeout(() => {
            container.style.display = 'none';
        }, 10000);
    }

    /**
     * Muestra alerta de medicamento
     */
    showMedicationAlert(analysis) {
        let message = `⚠️ Alerta de medicamento: ${analysis.medication}\n\n`;
        
        if (analysis.interactions.length > 0) {
            message += 'Interacciones detectadas:\n';
            analysis.interactions.forEach(interaction => {
                message += `• ${interaction}\n`;
            });
        }
        
        if (analysis.contraindications.length > 0) {
            message += '\nContraindicaciones:\n';
            analysis.contraindications.forEach(contra => {
                message += `• ${contra}\n`;
            });
        }
        
        // Mostrar alerta
        if (window.ErrorManager) {
            window.ErrorManager.showWarning(message);
        } else {
            alert(message);
        }
    }

    /**
     * Obtiene datos del paciente actual
     */
    getCurrentPatientData() {
        const currentBedId = window.AppStateManager?.getCurrentBedId();
        if (!currentBedId) return {};
        
        const bedData = window.AppStateManager?.getBed(currentBedId);
        if (!bedData) return {};
        
        return {
            age: bedData.edad || 0,
            familyHistory: bedData.antecedentes_familiares || false,
            smoking: bedData.tabaquismo || false,
            hypertension: bedData.hipertension || false
        };
    }

    /**
     * Obtiene medicamentos actuales
     */
    getCurrentMedications() {
        const currentBedId = window.AppStateManager?.getCurrentBedId();
        if (!currentBedId) return [];
        
        const bedData = window.AppStateManager?.getBed(currentBedId);
        return bedData?.medicamentos || [];
    }

    /**
     * Obtiene datos de cama
     */
    getBedData(bedId) {
        return window.AppStateManager?.getBed(bedId);
    }

    /**
     * Extrae síntomas de datos de cama
     */
    extractSymptomsFromBedData(bedData) {
        return {
            age: bedData.edad || 0,
            motorSymptoms: this.hasMotorSymptoms(bedData),
            cognitiveSymptoms: this.hasCognitiveSymptoms(bedData),
            speechProblems: this.hasSpeechProblems(bedData),
            memoryIssues: this.hasMemoryIssues(bedData),
            tremor: this.hasTremor(bedData),
            rigidity: this.hasRigidity(bedData),
            balanceProblems: this.hasBalanceProblems(bedData),
            seizures: this.hasSeizures(bedData),
            consciousnessLoss: this.hasConsciousnessLoss(bedData)
        };
    }

    /**
     * Verifica síntomas motores
     */
    hasMotorSymptoms(bedData) {
        const motorKeywords = ['debilidad', 'paresia', 'parálisis', 'motor'];
        return this.hasKeywords(bedData, motorKeywords);
    }

    /**
     * Verifica síntomas cognitivos
     */
    hasCognitiveSymptoms(bedData) {
        const cognitiveKeywords = ['confusión', 'desorientación', 'demencia', 'cognitivo'];
        return this.hasKeywords(bedData, cognitiveKeywords);
    }

    /**
     * Verifica problemas del habla
     */
    hasSpeechProblems(bedData) {
        const speechKeywords = ['afasia', 'disartria', 'habla', 'lenguaje'];
        return this.hasKeywords(bedData, speechKeywords);
    }

    /**
     * Verifica problemas de memoria
     */
    hasMemoryIssues(bedData) {
        const memoryKeywords = ['memoria', 'olvido', 'amnesia'];
        return this.hasKeywords(bedData, memoryKeywords);
    }

    /**
     * Verifica temblor
     */
    hasTremor(bedData) {
        const tremorKeywords = ['temblor', 'temblores'];
        return this.hasKeywords(bedData, tremorKeywords);
    }

    /**
     * Verifica rigidez
     */
    hasRigidity(bedData) {
        const rigidityKeywords = ['rigidez', 'rígido', 'rigidez muscular'];
        return this.hasKeywords(bedData, rigidityKeywords);
    }

    /**
     * Verifica problemas de equilibrio
     */
    hasBalanceProblems(bedData) {
        const balanceKeywords = ['equilibrio', 'ataxia', 'inestabilidad', 'marcha'];
        return this.hasKeywords(bedData, balanceKeywords);
    }

    /**
     * Verifica convulsiones
     */
    hasSeizures(bedData) {
        const seizureKeywords = ['convulsión', 'crisis', 'epilepsia', 'convulsiones'];
        return this.hasKeywords(bedData, seizureKeywords);
    }

    /**
     * Verifica pérdida de conciencia
     */
    hasConsciousnessLoss(bedData) {
        const consciousnessKeywords = ['conciencia', 'inconsciencia', 'pérdida conciencia'];
        return this.hasKeywords(bedData, consciousnessKeywords);
    }

    /**
     * Verifica palabras clave en datos de cama
     */
    hasKeywords(bedData, keywords) {
        const text = JSON.stringify(bedData).toLowerCase();
        return keywords.some(keyword => text.includes(keyword.toLowerCase()));
    }

    /**
     * Verifica interacciones de medicamentos
     */
    checkMedicationInteractions(newMed, currentMeds) {
        const interactions = [];
        
        // Base de datos básica de interacciones
        const interactionDB = {
            'warfarina': ['aspirina', 'ibuprofeno'],
            'aspirina': ['warfarina', 'clopidogrel'],
            'levodopa': ['haloperidol', 'metoclopramida']
        };
        
        const newMedLower = newMed.toLowerCase();
        
        currentMeds.forEach(med => {
            const medLower = med.toLowerCase();
            
            if (interactionDB[newMedLower]?.includes(medLower) ||
                interactionDB[medLower]?.includes(newMedLower)) {
                interactions.push(`Interacción entre ${newMed} y ${med}`);
            }
        });
        
        return interactions;
    }

    /**
     * Verifica contraindicaciones
     */
    checkContraindications(medication, patientData) {
        const contraindications = [];
        
        // Base de datos básica de contraindicaciones
        const contraindicationDB = {
            'aspirina': {
                age: { min: null, max: 16, message: 'No recomendado en menores de 16 años' },
                conditions: ['úlcera péptica', 'sangrado']
            },
            'warfarina': {
                conditions: ['sangrado activo', 'embarazo']
            }
        };
        
        const medLower = medication.toLowerCase();
        const contraData = contraindicationDB[medLower];
        
        if (contraData) {
            // Verificar edad
            if (contraData.age && patientData.age) {
                if (contraData.age.max && patientData.age <= contraData.age.max) {
                    contraindications.push(contraData.age.message);
                }
            }
            
            // Verificar condiciones (simplificado)
            if (contraData.conditions) {
                contraData.conditions.forEach(condition => {
                    contraindications.push(`Contraindicado en ${condition}`);
                });
            }
        }
        
        return contraindications;
    }

    /**
     * Configura la integración
     */
    configure(newConfig) {
        this.config = { ...this.config, ...newConfig };
        console.log('🧠 Integración de IA configurada:', this.config);
    }

    /**
     * Obtiene estadísticas de la integración
     */
    getStats() {
        return {
            isInitialized: this.isInitialized,
            analysisQueueLength: this.analysisQueue.length,
            isProcessing: this.isProcessing,
            config: this.config,
            components: {
                aiEngine: !!this.aiEngine,
                neuralClassifier: !!this.neuralClassifier,
                dashboard: !!this.dashboard
            }
        };
    }
}

// Crear instancia global
window.AIIntegration = new AIIntegration(); 