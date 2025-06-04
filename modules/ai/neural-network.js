/**
 * 🧠 Neural Network
 * Red neuronal básica para análisis de patrones neurológicos
 */

class NeuralNetwork {
    constructor(inputSize, hiddenSize, outputSize) {
        this.inputSize = inputSize;
        this.hiddenSize = hiddenSize;
        this.outputSize = outputSize;
        
        // Inicializar pesos aleatoriamente
        this.weightsInputHidden = this.initializeWeights(inputSize, hiddenSize);
        this.weightsHiddenOutput = this.initializeWeights(hiddenSize, outputSize);
        
        // Bias
        this.biasHidden = new Array(hiddenSize).fill(0).map(() => Math.random() * 0.1);
        this.biasOutput = new Array(outputSize).fill(0).map(() => Math.random() * 0.1);
        
        // Parámetros de entrenamiento
        this.learningRate = 0.01;
        this.epochs = 1000;
        this.trainingHistory = [];
        
        console.log(`🧠 Red neuronal creada: ${inputSize} → ${hiddenSize} → ${outputSize}`);
    }

    /**
     * Inicializa pesos aleatoriamente
     */
    initializeWeights(rows, cols) {
        const weights = [];
        for (let i = 0; i < rows; i++) {
            weights[i] = [];
            for (let j = 0; j < cols; j++) {
                // Xavier initialization
                weights[i][j] = (Math.random() - 0.5) * 2 * Math.sqrt(6 / (rows + cols));
            }
        }
        return weights;
    }

    /**
     * Función de activación sigmoid
     */
    sigmoid(x) {
        return 1 / (1 + Math.exp(-x));
    }

    /**
     * Derivada de sigmoid
     */
    sigmoidDerivative(x) {
        return x * (1 - x);
    }

    /**
     * Función de activación ReLU
     */
    relu(x) {
        return Math.max(0, x);
    }

    /**
     * Derivada de ReLU
     */
    reluDerivative(x) {
        return x > 0 ? 1 : 0;
    }

    /**
     * Propagación hacia adelante
     */
    forward(inputs) {
        // Capa oculta
        const hiddenInputs = this.matrixMultiply([inputs], this.weightsInputHidden)[0];
        const hiddenOutputs = hiddenInputs.map((val, i) => this.sigmoid(val + this.biasHidden[i]));
        
        // Capa de salida
        const outputInputs = this.matrixMultiply([hiddenOutputs], this.weightsHiddenOutput)[0];
        const outputs = outputInputs.map((val, i) => this.sigmoid(val + this.biasOutput[i]));
        
        return {
            hiddenOutputs,
            outputs
        };
    }

    /**
     * Multiplicación de matrices
     */
    matrixMultiply(a, b) {
        const result = [];
        for (let i = 0; i < a.length; i++) {
            result[i] = [];
            for (let j = 0; j < b[0].length; j++) {
                let sum = 0;
                for (let k = 0; k < b.length; k++) {
                    sum += a[i][k] * b[k][j];
                }
                result[i][j] = sum;
            }
        }
        return result;
    }

    /**
     * Retropropagación
     */
    backward(inputs, targets, hiddenOutputs, outputs) {
        // Error en la salida
        const outputErrors = outputs.map((output, i) => targets[i] - output);
        const outputDeltas = outputErrors.map((error, i) => 
            error * this.sigmoidDerivative(outputs[i])
        );

        // Error en la capa oculta
        const hiddenErrors = new Array(this.hiddenSize).fill(0);
        for (let i = 0; i < this.hiddenSize; i++) {
            for (let j = 0; j < this.outputSize; j++) {
                hiddenErrors[i] += outputDeltas[j] * this.weightsHiddenOutput[i][j];
            }
        }
        
        const hiddenDeltas = hiddenErrors.map((error, i) => 
            error * this.sigmoidDerivative(hiddenOutputs[i])
        );

        // Actualizar pesos y bias
        this.updateWeights(inputs, hiddenOutputs, hiddenDeltas, outputDeltas);
        
        return outputErrors;
    }

    /**
     * Actualiza pesos y bias
     */
    updateWeights(inputs, hiddenOutputs, hiddenDeltas, outputDeltas) {
        // Actualizar pesos input → hidden
        for (let i = 0; i < this.inputSize; i++) {
            for (let j = 0; j < this.hiddenSize; j++) {
                this.weightsInputHidden[i][j] += this.learningRate * inputs[i] * hiddenDeltas[j];
            }
        }

        // Actualizar pesos hidden → output
        for (let i = 0; i < this.hiddenSize; i++) {
            for (let j = 0; j < this.outputSize; j++) {
                this.weightsHiddenOutput[i][j] += this.learningRate * hiddenOutputs[i] * outputDeltas[j];
            }
        }

        // Actualizar bias
        for (let i = 0; i < this.hiddenSize; i++) {
            this.biasHidden[i] += this.learningRate * hiddenDeltas[i];
        }
        
        for (let i = 0; i < this.outputSize; i++) {
            this.biasOutput[i] += this.learningRate * outputDeltas[i];
        }
    }

    /**
     * Entrena la red neuronal
     */
    train(trainingData, validationData = null) {
        console.log('🎯 Iniciando entrenamiento...');
        
        const startTime = Date.now();
        
        for (let epoch = 0; epoch < this.epochs; epoch++) {
            let totalError = 0;
            
            // Mezclar datos de entrenamiento
            const shuffledData = this.shuffleArray([...trainingData]);
            
            for (const sample of shuffledData) {
                const { inputs, targets } = sample;
                
                // Propagación hacia adelante
                const { hiddenOutputs, outputs } = this.forward(inputs);
                
                // Retropropagación
                const errors = this.backward(inputs, targets, hiddenOutputs, outputs);
                
                // Calcular error total
                totalError += errors.reduce((sum, error) => sum + error * error, 0);
            }
            
            const avgError = totalError / trainingData.length;
            
            // Validación
            let validationError = 0;
            if (validationData) {
                validationError = this.validate(validationData);
            }
            
            // Guardar historial
            this.trainingHistory.push({
                epoch,
                trainingError: avgError,
                validationError,
                timestamp: new Date().toISOString()
            });
            
            // Log progreso cada 100 épocas
            if (epoch % 100 === 0) {
                console.log(`Época ${epoch}: Error entrenamiento = ${avgError.toFixed(6)}, Error validación = ${validationError.toFixed(6)}`);
            }
            
            // Early stopping si el error es muy bajo
            if (avgError < 0.001) {
                console.log(`🎯 Convergencia alcanzada en época ${epoch}`);
                break;
            }
        }
        
        const trainingTime = Date.now() - startTime;
        console.log(`✅ Entrenamiento completado en ${trainingTime}ms`);
        
        return this.trainingHistory;
    }

    /**
     * Valida la red con datos de validación
     */
    validate(validationData) {
        let totalError = 0;
        
        for (const sample of validationData) {
            const { inputs, targets } = sample;
            const { outputs } = this.forward(inputs);
            
            const errors = outputs.map((output, i) => targets[i] - output);
            totalError += errors.reduce((sum, error) => sum + error * error, 0);
        }
        
        return totalError / validationData.length;
    }

    /**
     * Predice usando la red entrenada
     */
    predict(inputs) {
        const { outputs } = this.forward(inputs);
        return outputs;
    }

    /**
     * Mezcla array aleatoriamente
     */
    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    /**
     * Guarda el modelo
     */
    saveModel() {
        return {
            inputSize: this.inputSize,
            hiddenSize: this.hiddenSize,
            outputSize: this.outputSize,
            weightsInputHidden: this.weightsInputHidden,
            weightsHiddenOutput: this.weightsHiddenOutput,
            biasHidden: this.biasHidden,
            biasOutput: this.biasOutput,
            learningRate: this.learningRate,
            trainingHistory: this.trainingHistory,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Carga un modelo guardado
     */
    loadModel(modelData) {
        this.inputSize = modelData.inputSize;
        this.hiddenSize = modelData.hiddenSize;
        this.outputSize = modelData.outputSize;
        this.weightsInputHidden = modelData.weightsInputHidden;
        this.weightsHiddenOutput = modelData.weightsHiddenOutput;
        this.biasHidden = modelData.biasHidden;
        this.biasOutput = modelData.biasOutput;
        this.learningRate = modelData.learningRate;
        this.trainingHistory = modelData.trainingHistory || [];
        
        console.log('✅ Modelo cargado correctamente');
    }

    /**
     * Obtiene estadísticas del modelo
     */
    getStats() {
        const lastTraining = this.trainingHistory[this.trainingHistory.length - 1];
        
        return {
            architecture: `${this.inputSize}-${this.hiddenSize}-${this.outputSize}`,
            totalParameters: this.getTotalParameters(),
            trainingEpochs: this.trainingHistory.length,
            lastTrainingError: lastTraining ? lastTraining.trainingError : null,
            lastValidationError: lastTraining ? lastTraining.validationError : null,
            learningRate: this.learningRate
        };
    }

    /**
     * Calcula el número total de parámetros
     */
    getTotalParameters() {
        const inputHiddenParams = this.inputSize * this.hiddenSize;
        const hiddenOutputParams = this.hiddenSize * this.outputSize;
        const biasParams = this.hiddenSize + this.outputSize;
        
        return inputHiddenParams + hiddenOutputParams + biasParams;
    }
}

/**
 * 🧠 Neurological Pattern Classifier
 * Clasificador especializado para patrones neurológicos
 */
class NeurologicalPatternClassifier extends NeuralNetwork {
    constructor() {
        // 10 características de entrada, 15 neuronas ocultas, 5 clases de salida
        super(10, 15, 5);
        
        this.classes = ['stroke', 'parkinson', 'alzheimer', 'epilepsia', 'normal'];
        this.features = [
            'age', 'motor_symptoms', 'cognitive_symptoms', 'speech_problems',
            'memory_issues', 'tremor', 'rigidity', 'balance_problems',
            'seizures', 'consciousness_loss'
        ];
        
        this.isTrainedForNeurology = false;
    }

    /**
     * Prepara datos neurológicos para entrenamiento
     */
    prepareNeurologicalData() {
        console.log('📊 Preparando datos neurológicos...');
        
        // Datos sintéticos para entrenamiento
        const trainingData = [
            // Stroke
            { inputs: [0.8, 1.0, 0.7, 1.0, 0.3, 0.0, 0.2, 0.8, 0.0, 0.0], targets: [1, 0, 0, 0, 0] },
            { inputs: [0.7, 0.9, 0.8, 0.9, 0.4, 0.1, 0.3, 0.7, 0.0, 0.0], targets: [1, 0, 0, 0, 0] },
            { inputs: [0.9, 1.0, 0.6, 1.0, 0.2, 0.0, 0.1, 0.9, 0.0, 0.0], targets: [1, 0, 0, 0, 0] },
            
            // Parkinson
            { inputs: [0.7, 0.8, 0.3, 0.4, 0.2, 1.0, 0.9, 0.6, 0.0, 0.0], targets: [0, 1, 0, 0, 0] },
            { inputs: [0.8, 0.9, 0.2, 0.3, 0.1, 0.9, 1.0, 0.7, 0.0, 0.0], targets: [0, 1, 0, 0, 0] },
            { inputs: [0.6, 0.7, 0.4, 0.5, 0.3, 0.8, 0.8, 0.5, 0.0, 0.0], targets: [0, 1, 0, 0, 0] },
            
            // Alzheimer
            { inputs: [0.9, 0.3, 1.0, 0.6, 1.0, 0.1, 0.2, 0.4, 0.0, 0.0], targets: [0, 0, 1, 0, 0] },
            { inputs: [0.8, 0.2, 0.9, 0.5, 0.9, 0.0, 0.1, 0.3, 0.0, 0.0], targets: [0, 0, 1, 0, 0] },
            { inputs: [1.0, 0.4, 1.0, 0.7, 1.0, 0.2, 0.3, 0.5, 0.0, 0.0], targets: [0, 0, 1, 0, 0] },
            
            // Epilepsia
            { inputs: [0.3, 0.6, 0.4, 0.2, 0.1, 0.3, 0.1, 0.2, 1.0, 1.0], targets: [0, 0, 0, 1, 0] },
            { inputs: [0.4, 0.7, 0.3, 0.1, 0.2, 0.2, 0.0, 0.3, 0.9, 0.9], targets: [0, 0, 0, 1, 0] },
            { inputs: [0.2, 0.5, 0.5, 0.3, 0.0, 0.1, 0.2, 0.1, 1.0, 1.0], targets: [0, 0, 0, 1, 0] },
            
            // Normal
            { inputs: [0.3, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0], targets: [0, 0, 0, 0, 1] },
            { inputs: [0.4, 0.1, 0.1, 0.0, 0.1, 0.0, 0.0, 0.1, 0.0, 0.0], targets: [0, 0, 0, 0, 1] },
            { inputs: [0.2, 0.0, 0.0, 0.1, 0.0, 0.1, 0.0, 0.0, 0.0, 0.0], targets: [0, 0, 0, 0, 1] }
        ];
        
        return trainingData;
    }

    /**
     * Entrena el clasificador neurológico
     */
    async trainNeurologicalClassifier() {
        console.log('🧠 Entrenando clasificador neurológico...');
        
        const trainingData = this.prepareNeurologicalData();
        
        // Dividir en entrenamiento y validación (80/20)
        const splitIndex = Math.floor(trainingData.length * 0.8);
        const training = trainingData.slice(0, splitIndex);
        const validation = trainingData.slice(splitIndex);
        
        // Configurar parámetros de entrenamiento
        this.learningRate = 0.1;
        this.epochs = 2000;
        
        // Entrenar
        const history = this.train(training, validation);
        
        this.isTrainedForNeurology = true;
        console.log('✅ Clasificador neurológico entrenado');
        
        return history;
    }

    /**
     * Clasifica síntomas neurológicos
     */
    classifyNeurologicalSymptoms(symptoms) {
        if (!this.isTrainedForNeurology) {
            throw new Error('El clasificador no ha sido entrenado para neurología');
        }
        
        // Normalizar síntomas a vector de características
        const features = this.symptomsToFeatures(symptoms);
        
        // Predecir
        const predictions = this.predict(features);
        
        // Convertir a probabilidades y clasificaciones
        const results = predictions.map((prob, index) => ({
            condition: this.classes[index],
            probability: prob,
            confidence: prob > 0.7 ? 'high' : prob > 0.4 ? 'medium' : 'low'
        }));
        
        // Ordenar por probabilidad
        results.sort((a, b) => b.probability - a.probability);
        
        return {
            topPrediction: results[0],
            allPredictions: results,
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Convierte síntomas a vector de características
     */
    symptomsToFeatures(symptoms) {
        const features = new Array(10).fill(0);
        
        // Mapear síntomas a características (simplificado)
        if (symptoms.age) features[0] = Math.min(symptoms.age / 100, 1);
        if (symptoms.motorSymptoms) features[1] = 1;
        if (symptoms.cognitiveSymptoms) features[2] = 1;
        if (symptoms.speechProblems) features[3] = 1;
        if (symptoms.memoryIssues) features[4] = 1;
        if (symptoms.tremor) features[5] = 1;
        if (symptoms.rigidity) features[6] = 1;
        if (symptoms.balanceProblems) features[7] = 1;
        if (symptoms.seizures) features[8] = 1;
        if (symptoms.consciousnessLoss) features[9] = 1;
        
        return features;
    }

    /**
     * Obtiene explicación de la predicción
     */
    explainPrediction(symptoms, prediction) {
        const explanation = {
            condition: prediction.topPrediction.condition,
            probability: prediction.topPrediction.probability,
            keyFactors: [],
            reasoning: ''
        };
        
        const features = this.symptomsToFeatures(symptoms);
        
        // Identificar factores clave
        features.forEach((value, index) => {
            if (value > 0.5) {
                explanation.keyFactors.push(this.features[index]);
            }
        });
        
        // Generar razonamiento
        explanation.reasoning = `Basado en ${explanation.keyFactors.length} factores clave: ${explanation.keyFactors.join(', ')}. Probabilidad: ${(prediction.topPrediction.probability * 100).toFixed(1)}%`;
        
        return explanation;
    }
}

// Crear instancia global
window.NeuralNetwork = NeuralNetwork;
window.NeurologicalPatternClassifier = new NeurologicalPatternClassifier(); 