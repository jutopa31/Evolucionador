/**
 * 🧠 AI Dashboard
 * Dashboard de Inteligencia Artificial para visualización y control
 */

class AIDashboard {
    constructor() {
        this.isInitialized = false;
        this.charts = new Map();
        this.realTimeData = {
            predictions: [],
            modelMetrics: {},
            analysisHistory: []
        };
        
        this.config = {
            updateInterval: 5000, // 5 segundos
            maxHistoryItems: 100,
            enableRealTimeUpdates: true,
            showAdvancedMetrics: true
        };
        
        // NO inicializar automáticamente - solo cuando sea necesario
        // this.initializeDashboard();
    }

    /**
     * Inicializa el dashboard
     */
    async initializeDashboard() {
        console.log('📊 Inicializando AI Dashboard...');
        
        try {
            // Crear estructura del dashboard
            this.createDashboardStructure();
            
            // Inicializar gráficos
            this.initializeCharts();
            
            // Configurar actualizaciones en tiempo real
            this.setupRealTimeUpdates();
            
            // Configurar event listeners
            this.setupEventListeners();
            
            this.isInitialized = true;
            console.log('✅ AI Dashboard inicializado');
            
        } catch (error) {
            console.error('❌ Error inicializando dashboard:', error);
        }
    }

    /**
     * Crea la estructura HTML del dashboard
     */
    createDashboardStructure() {
        const dashboardHTML = `
            <div id="ai-dashboard" class="ai-dashboard" style="display: none;">
                <div class="dashboard-header">
                    <h2>🧠 AI Dashboard - Suite Neurología</h2>
                    <div class="dashboard-controls">
                        <button id="toggle-realtime" class="btn btn-primary">
                            <span id="realtime-status">⏸️ Pausar</span>
                        </button>
                        <button id="export-data" class="btn btn-secondary">📊 Exportar</button>
                        <button id="close-dashboard" class="btn btn-danger">✖️ Cerrar</button>
                    </div>
                </div>
                
                <div class="dashboard-grid">
                    <!-- Métricas principales -->
                    <div class="metric-card">
                        <h3>📈 Métricas de Modelos</h3>
                        <div id="model-metrics">
                            <div class="metric-item">
                                <span class="metric-label">Precisión Promedio:</span>
                                <span id="avg-accuracy" class="metric-value">--</span>
                            </div>
                            <div class="metric-item">
                                <span class="metric-label">Predicciones Hoy:</span>
                                <span id="predictions-today" class="metric-value">--</span>
                            </div>
                            <div class="metric-item">
                                <span class="metric-label">Tiempo Respuesta:</span>
                                <span id="response-time" class="metric-value">--</span>
                            </div>
                        </div>
                    </div>
                    
                    <!-- Gráfico de predicciones -->
                    <div class="chart-card">
                        <h3>🔮 Predicciones en Tiempo Real</h3>
                        <canvas id="predictions-chart" width="400" height="200"></canvas>
                    </div>
                    
                    <!-- Distribución de condiciones -->
                    <div class="chart-card">
                        <h3>📊 Distribución de Condiciones</h3>
                        <canvas id="conditions-chart" width="400" height="200"></canvas>
                    </div>
                    
                    <!-- Estado de modelos -->
                    <div class="model-status-card">
                        <h3>🤖 Estado de Modelos</h3>
                        <div id="model-status-list">
                            <!-- Se llena dinámicamente -->
                        </div>
                    </div>
                    
                    <!-- Análisis recientes -->
                    <div class="analysis-card">
                        <h3>🔍 Análisis Recientes</h3>
                        <div id="recent-analysis" class="analysis-list">
                            <!-- Se llena dinámicamente -->
                        </div>
                    </div>
                    
                    <!-- Alertas y recomendaciones -->
                    <div class="alerts-card">
                        <h3>⚠️ Alertas y Recomendaciones</h3>
                        <div id="ai-alerts" class="alerts-list">
                            <!-- Se llena dinámicamente -->
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Insertar en el DOM
        document.body.insertAdjacentHTML('beforeend', dashboardHTML);
        
        // Añadir estilos
        this.injectDashboardStyles();
    }

    /**
     * Inyecta estilos CSS para el dashboard
     */
    injectDashboardStyles() {
        const styles = `
            <style id="ai-dashboard-styles">
                .ai-dashboard {
                    position: fixed;
                    top: 0;
                    left: 0;
                    width: 100%;
                    height: 100%;
                    background: rgba(0, 0, 0, 0.95);
                    z-index: 10000;
                    overflow-y: auto;
                    padding: 20px;
                    box-sizing: border-box;
                }
                
                .dashboard-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 20px;
                    color: white;
                }
                
                .dashboard-header h2 {
                    margin: 0;
                    font-size: 24px;
                }
                
                .dashboard-controls {
                    display: flex;
                    gap: 10px;
                }
                
                .dashboard-controls .btn {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                }
                
                .btn-primary { background: #007bff; color: white; }
                .btn-secondary { background: #6c757d; color: white; }
                .btn-danger { background: #dc3545; color: white; }
                
                .dashboard-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
                    gap: 20px;
                }
                
                .metric-card, .chart-card, .model-status-card, .analysis-card, .alerts-card {
                    background: white;
                    border-radius: 8px;
                    padding: 20px;
                    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                
                .metric-card h3, .chart-card h3, .model-status-card h3, .analysis-card h3, .alerts-card h3 {
                    margin: 0 0 15px 0;
                    color: #333;
                    font-size: 18px;
                }
                
                .metric-item {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 10px;
                    padding: 8px 0;
                    border-bottom: 1px solid #eee;
                }
                
                .metric-label {
                    font-weight: 500;
                    color: #666;
                }
                
                .metric-value {
                    font-weight: bold;
                    color: #007bff;
                }
                
                .model-status-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 10px;
                    margin-bottom: 8px;
                    background: #f8f9fa;
                    border-radius: 4px;
                }
                
                .model-name {
                    font-weight: 500;
                }
                
                .model-accuracy {
                    background: #28a745;
                    color: white;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 12px;
                }
                
                .analysis-item {
                    padding: 10px;
                    margin-bottom: 8px;
                    background: #f8f9fa;
                    border-radius: 4px;
                    border-left: 4px solid #007bff;
                }
                
                .analysis-time {
                    font-size: 12px;
                    color: #666;
                    margin-bottom: 5px;
                }
                
                .analysis-result {
                    font-weight: 500;
                }
                
                .alert-item {
                    padding: 10px;
                    margin-bottom: 8px;
                    border-radius: 4px;
                    border-left: 4px solid #ffc107;
                    background: #fff3cd;
                }
                
                .alert-high {
                    border-left-color: #dc3545;
                    background: #f8d7da;
                }
                
                .alert-medium {
                    border-left-color: #ffc107;
                    background: #fff3cd;
                }
                
                .alert-low {
                    border-left-color: #28a745;
                    background: #d4edda;
                }
                
                .chart-container {
                    position: relative;
                    height: 200px;
                }
                
                canvas {
                    max-width: 100%;
                    height: auto;
                }
            </style>
        `;
        
        document.head.insertAdjacentHTML('beforeend', styles);
    }

    /**
     * Inicializa los gráficos
     */
    initializeCharts() {
        console.log('📊 Inicializando gráficos...');
        
        // Gráfico de predicciones en tiempo real
        this.initializePredictionsChart();
        
        // Gráfico de distribución de condiciones
        this.initializeConditionsChart();
    }

    /**
     * Inicializa gráfico de predicciones
     */
    initializePredictionsChart() {
        const canvas = document.getElementById('predictions-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        // Configuración básica del gráfico
        this.charts.set('predictions', {
            canvas: canvas,
            ctx: ctx,
            data: {
                labels: [],
                datasets: [{
                    label: 'Confianza Promedio',
                    data: [],
                    borderColor: '#007bff',
                    backgroundColor: 'rgba(0, 123, 255, 0.1)',
                    tension: 0.4
                }]
            }
        });
        
        this.drawPredictionsChart();
    }

    /**
     * Inicializa gráfico de condiciones
     */
    initializeConditionsChart() {
        const canvas = document.getElementById('conditions-chart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        
        this.charts.set('conditions', {
            canvas: canvas,
            ctx: ctx,
            data: {
                labels: ['Stroke', 'Parkinson', 'Alzheimer', 'Epilepsia', 'Normal'],
                datasets: [{
                    data: [0, 0, 0, 0, 0],
                    backgroundColor: [
                        '#dc3545', '#ffc107', '#6f42c1', '#fd7e14', '#28a745'
                    ]
                }]
            }
        });
        
        this.drawConditionsChart();
    }

    /**
     * Dibuja gráfico de predicciones
     */
    drawPredictionsChart() {
        const chart = this.charts.get('predictions');
        if (!chart) return;
        
        const { ctx, data } = chart;
        const { width, height } = chart.canvas;
        
        // Limpiar canvas
        ctx.clearRect(0, 0, width, height);
        
        // Dibujar línea de tiempo
        if (data.datasets[0].data.length > 0) {
            ctx.beginPath();
            ctx.strokeStyle = '#007bff';
            ctx.lineWidth = 2;
            
            const points = data.datasets[0].data;
            const stepX = width / Math.max(points.length - 1, 1);
            
            points.forEach((point, index) => {
                const x = index * stepX;
                const y = height - (point * height);
                
                if (index === 0) {
                    ctx.moveTo(x, y);
                } else {
                    ctx.lineTo(x, y);
                }
            });
            
            ctx.stroke();
        }
        
        // Dibujar ejes y etiquetas
        this.drawChartAxes(ctx, width, height);
    }

    /**
     * Dibuja gráfico de condiciones (pie chart básico)
     */
    drawConditionsChart() {
        const chart = this.charts.get('conditions');
        if (!chart) return;
        
        const { ctx, data } = chart;
        const { width, height } = chart.canvas;
        
        // Limpiar canvas
        ctx.clearRect(0, 0, width, height);
        
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 3;
        
        const total = data.datasets[0].data.reduce((sum, val) => sum + val, 0);
        
        if (total > 0) {
            let currentAngle = -Math.PI / 2;
            
            data.datasets[0].data.forEach((value, index) => {
                const sliceAngle = (value / total) * 2 * Math.PI;
                
                // Dibujar slice
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
                ctx.closePath();
                ctx.fillStyle = data.datasets[0].backgroundColor[index];
                ctx.fill();
                
                // Dibujar etiqueta
                if (value > 0) {
                    const labelAngle = currentAngle + sliceAngle / 2;
                    const labelX = centerX + Math.cos(labelAngle) * (radius + 20);
                    const labelY = centerY + Math.sin(labelAngle) * (radius + 20);
                    
                    ctx.fillStyle = '#333';
                    ctx.font = '12px Arial';
                    ctx.textAlign = 'center';
                    ctx.fillText(data.labels[index], labelX, labelY);
                }
                
                currentAngle += sliceAngle;
            });
        }
    }

    /**
     * Dibuja ejes del gráfico
     */
    drawChartAxes(ctx, width, height) {
        ctx.strokeStyle = '#ddd';
        ctx.lineWidth = 1;
        
        // Eje X
        ctx.beginPath();
        ctx.moveTo(0, height);
        ctx.lineTo(width, height);
        ctx.stroke();
        
        // Eje Y
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(0, height);
        ctx.stroke();
    }

    /**
     * Configura actualizaciones en tiempo real
     */
    setupRealTimeUpdates() {
        if (this.config.enableRealTimeUpdates) {
            this.updateInterval = setInterval(() => {
                this.updateDashboard();
            }, this.config.updateInterval);
        }
    }

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        // Toggle tiempo real
        const toggleBtn = document.getElementById('toggle-realtime');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', () => {
                this.toggleRealTimeUpdates();
            });
        }
        
        // Exportar datos
        const exportBtn = document.getElementById('export-data');
        if (exportBtn) {
            exportBtn.addEventListener('click', () => {
                this.exportDashboardData();
            });
        }
        
        // Cerrar dashboard
        const closeBtn = document.getElementById('close-dashboard');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideDashboard();
            });
        }
        
        // Escuchar eventos de IA
        if (window.EventManager) {
            window.EventManager.on('aiAnalysisCompleted', (data) => {
                this.addAnalysisResult(data);
            });
            
            window.EventManager.on('aiPredictionMade', (data) => {
                this.addPredictionResult(data);
            });
        }
    }

    /**
     * Actualiza el dashboard
     */
    updateDashboard() {
        this.updateMetrics();
        this.updateCharts();
        this.updateModelStatus();
        this.updateRecentAnalysis();
        this.updateAlerts();
    }

    /**
     * Actualiza métricas principales
     */
    updateMetrics() {
        // Precisión promedio
        const avgAccuracy = this.calculateAverageAccuracy();
        const avgAccuracyEl = document.getElementById('avg-accuracy');
        if (avgAccuracyEl) {
            avgAccuracyEl.textContent = `${(avgAccuracy * 100).toFixed(1)}%`;
        }
        
        // Predicciones hoy
        const predictionsToday = this.countPredictionsToday();
        const predictionsTodayEl = document.getElementById('predictions-today');
        if (predictionsTodayEl) {
            predictionsTodayEl.textContent = predictionsToday.toString();
        }
        
        // Tiempo de respuesta
        const responseTime = this.calculateAverageResponseTime();
        const responseTimeEl = document.getElementById('response-time');
        if (responseTimeEl) {
            responseTimeEl.textContent = `${responseTime}ms`;
        }
    }

    /**
     * Actualiza gráficos
     */
    updateCharts() {
        this.drawPredictionsChart();
        this.drawConditionsChart();
    }

    /**
     * Actualiza estado de modelos
     */
    updateModelStatus() {
        const statusList = document.getElementById('model-status-list');
        if (!statusList) return;
        
        let html = '';
        
        if (window.AIEngine && window.AIEngine.isInitialized) {
            const models = window.AIEngine.getModelInfo();
            
            models.forEach(model => {
                html += `
                    <div class="model-status-item">
                        <span class="model-name">${model.name}</span>
                        <span class="model-accuracy">${(model.accuracy * 100).toFixed(1)}%</span>
                    </div>
                `;
            });
        }
        
        if (html === '') {
            html = '<p>No hay modelos cargados</p>';
        }
        
        statusList.innerHTML = html;
    }

    /**
     * Actualiza análisis recientes
     */
    updateRecentAnalysis() {
        const analysisList = document.getElementById('recent-analysis');
        if (!analysisList) return;
        
        let html = '';
        
        this.realTimeData.analysisHistory.slice(-5).reverse().forEach(analysis => {
            html += `
                <div class="analysis-item">
                    <div class="analysis-time">${new Date(analysis.timestamp).toLocaleTimeString()}</div>
                    <div class="analysis-result">${analysis.result}</div>
                </div>
            `;
        });
        
        if (html === '') {
            html = '<p>No hay análisis recientes</p>';
        }
        
        analysisList.innerHTML = html;
    }

    /**
     * Actualiza alertas
     */
    updateAlerts() {
        const alertsList = document.getElementById('ai-alerts');
        if (!alertsList) return;
        
        const alerts = this.generateAlerts();
        let html = '';
        
        alerts.forEach(alert => {
            html += `
                <div class="alert-item alert-${alert.priority}">
                    <strong>${alert.title}</strong><br>
                    ${alert.message}
                </div>
            `;
        });
        
        if (html === '') {
            html = '<p>No hay alertas activas</p>';
        }
        
        alertsList.innerHTML = html;
    }

    /**
     * Añade resultado de análisis
     */
    addAnalysisResult(data) {
        this.realTimeData.analysisHistory.push({
            timestamp: new Date().toISOString(),
            result: data.summary || 'Análisis completado',
            confidence: data.confidence || 0
        });
        
        // Mantener solo los últimos elementos
        if (this.realTimeData.analysisHistory.length > this.config.maxHistoryItems) {
            this.realTimeData.analysisHistory.shift();
        }
    }

    /**
     * Añade resultado de predicción
     */
    addPredictionResult(data) {
        this.realTimeData.predictions.push({
            timestamp: new Date().toISOString(),
            confidence: data.confidence || 0,
            condition: data.condition || 'unknown'
        });
        
        // Actualizar datos del gráfico
        const chart = this.charts.get('predictions');
        if (chart) {
            chart.data.datasets[0].data.push(data.confidence || 0);
            chart.data.labels.push(new Date().toLocaleTimeString());
            
            // Mantener solo los últimos 20 puntos
            if (chart.data.datasets[0].data.length > 20) {
                chart.data.datasets[0].data.shift();
                chart.data.labels.shift();
            }
        }
        
        // Actualizar distribución de condiciones
        this.updateConditionDistribution(data.condition);
    }

    /**
     * Actualiza distribución de condiciones
     */
    updateConditionDistribution(condition) {
        const chart = this.charts.get('conditions');
        if (!chart) return;
        
        const conditionIndex = chart.data.labels.findIndex(label => 
            label.toLowerCase() === condition.toLowerCase()
        );
        
        if (conditionIndex !== -1) {
            chart.data.datasets[0].data[conditionIndex]++;
        }
    }

    /**
     * Calcula precisión promedio
     */
    calculateAverageAccuracy() {
        if (window.AIEngine && window.AIEngine.isInitialized) {
            const models = window.AIEngine.getModelInfo();
            if (models.length > 0) {
                const totalAccuracy = models.reduce((sum, model) => sum + model.accuracy, 0);
                return totalAccuracy / models.length;
            }
        }
        return 0;
    }

    /**
     * Cuenta predicciones de hoy
     */
    countPredictionsToday() {
        const today = new Date().toDateString();
        return this.realTimeData.predictions.filter(pred => 
            new Date(pred.timestamp).toDateString() === today
        ).length;
    }

    /**
     * Calcula tiempo de respuesta promedio
     */
    calculateAverageResponseTime() {
        // Simulado - en implementación real se mediría el tiempo real
        return Math.floor(Math.random() * 100) + 50;
    }

    /**
     * Genera alertas automáticas
     */
    generateAlerts() {
        const alerts = [];
        
        // Verificar precisión de modelos
        const avgAccuracy = this.calculateAverageAccuracy();
        if (avgAccuracy < 0.8) {
            alerts.push({
                title: 'Precisión Baja',
                message: 'La precisión promedio de los modelos está por debajo del 80%',
                priority: 'high'
            });
        }
        
        // Verificar predicciones recientes
        const recentPredictions = this.realTimeData.predictions.filter(pred => 
            Date.now() - new Date(pred.timestamp).getTime() < 3600000 // última hora
        );
        
        if (recentPredictions.length > 50) {
            alerts.push({
                title: 'Alto Volumen',
                message: 'Se han realizado más de 50 predicciones en la última hora',
                priority: 'medium'
            });
        }
        
        return alerts;
    }

    /**
     * Toggle actualizaciones en tiempo real
     */
    toggleRealTimeUpdates() {
        this.config.enableRealTimeUpdates = !this.config.enableRealTimeUpdates;
        
        const statusEl = document.getElementById('realtime-status');
        if (statusEl) {
            statusEl.textContent = this.config.enableRealTimeUpdates ? '⏸️ Pausar' : '▶️ Reanudar';
        }
        
        if (this.config.enableRealTimeUpdates) {
            this.setupRealTimeUpdates();
        } else {
            if (this.updateInterval) {
                clearInterval(this.updateInterval);
            }
        }
    }

    /**
     * Exporta datos del dashboard
     */
    exportDashboardData() {
        const data = {
            timestamp: new Date().toISOString(),
            metrics: {
                averageAccuracy: this.calculateAverageAccuracy(),
                predictionsToday: this.countPredictionsToday(),
                responseTime: this.calculateAverageResponseTime()
            },
            predictions: this.realTimeData.predictions,
            analysisHistory: this.realTimeData.analysisHistory,
            modelStatus: window.AIEngine ? window.AIEngine.getModelInfo() : []
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        
        const a = document.createElement('a');
        a.href = url;
        a.download = `ai-dashboard-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        
        URL.revokeObjectURL(url);
        
        console.log('📊 Datos del dashboard exportados');
    }

    /**
     * Muestra el dashboard
     */
    showDashboard() {
        const dashboard = document.getElementById('ai-dashboard');
        if (dashboard) {
            dashboard.style.display = 'block';
            this.updateDashboard();
        }
    }

    /**
     * Oculta el dashboard
     */
    hideDashboard() {
        const dashboard = document.getElementById('ai-dashboard');
        if (dashboard) {
            dashboard.style.display = 'none';
        }
        
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
    }

    /**
     * Destruye el dashboard
     */
    destroy() {
        this.hideDashboard();
        
        // Remover elementos del DOM
        const dashboard = document.getElementById('ai-dashboard');
        if (dashboard) {
            dashboard.remove();
        }
        
        const styles = document.getElementById('ai-dashboard-styles');
        if (styles) {
            styles.remove();
        }
        
        // Limpiar intervalos
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        console.log('📊 AI Dashboard destruido');
    }
}

// Crear instancia global
// DESHABILITADO: Solo se creará cuando se necesite
// window.AIDashboard = new AIDashboard(); 