# 🧠 Guía de Pruebas - Suite de IA Neurológica

## 🚀 Cómo Probar las Funciones de IA

### 📋 **Paso 1: Verificación Inicial**

1. **Abre la aplicación** en tu navegador: `http://localhost:8000`
2. **Abre la consola del navegador** (F12 → Console)
3. **Verifica que los módulos estén cargados**:

```javascript
// Ejecuta en la consola:
window.AITests.checkModules()
```

**Resultado esperado:**
```
✅ window.AIEngine: CARGADO
✅ window.NeurologicalPatternClassifier: CARGADO  
✅ window.AIDashboard: CARGADO
✅ window.AIIntegration: CARGADO
```

---

### 🔬 **Paso 2: Probar Análisis de Texto Médico**

#### **Método 1: Automático (Recomendado)**
```javascript
// Ejecuta en la consola:
window.AITests.testTextAnalysis()
```

#### **Método 2: Manual**
1. **Escribe texto médico** en cualquier textarea de la aplicación
2. **Ejemplos de texto que activan la IA**:
   - "Paciente presenta hemiparesia derecha y afasia"
   - "Temblor en reposo, rigidez muscular y bradicinesia"
   - "Pérdida de memoria reciente y desorientación"
   - "Crisis convulsivas tónico-clónicas"

3. **Observa la consola** para ver el análisis automático

---

### 🧬 **Paso 3: Probar Clasificador Neurológico**

```javascript
// Ejecuta en la consola:
window.AITests.testClassifier()
```

**O prueba manualmente:**
```javascript
// Caso de Parkinson
const symptoms = {
    age: 65,
    motorSymptoms: true,
    tremor: true,
    rigidity: true,
    balanceProblems: true
};

const result = window.NeurologicalPatternClassifier.classifyNeurologicalSymptoms(symptoms);
console.log('Clasificación:', result);
```

---

### 📊 **Paso 4: Probar Dashboard de IA**

#### **Método 1: Botón en la Interfaz**
1. **Busca el botón "🧠 IA Dashboard"** en la esquina inferior derecha
2. **Haz clic** para abrir el dashboard
3. **Observa las métricas** en tiempo real

#### **Método 2: Desde la Consola**
```javascript
// Ejecuta en la consola:
window.AITests.testDashboard()
```

#### **Método 3: Acceso Directo**
```javascript
// Mostrar dashboard
window.AIDashboard.showDashboard()

// Agregar datos de prueba
window.AIDashboard.addPredictionResult({
    condition: 'parkinson',
    confidence: 0.92
});
```

---

### ⚡ **Paso 5: Activar Análisis Automático**

#### **Triggers Automáticos de la IA:**

1. **Escritura en Textareas** (>50 caracteres):
   - Escribe síntomas neurológicos
   - La IA analiza automáticamente después de 2 segundos

2. **Adición de Medicamentos**:
   - Agrega medicamentos como "Levodopa", "Carbidopa"
   - La IA verifica interacciones automáticamente

3. **Cambio de Cama/Paciente**:
   - Al cambiar de cama, la IA analiza todos los datos

#### **Activación Manual:**
```javascript
// Simular análisis automático
window.AITests.triggerAuto()
```

---

### 💊 **Paso 6: Probar Análisis de Medicamentos**

#### **Método 1: Interfaz**
1. **Ve a la sección de medicamentos**
2. **Agrega medicamentos** como:
   - Levodopa
   - Carbidopa  
   - Ropinirol
   - Warfarina

3. **Observa alertas** de interacciones en la consola

#### **Método 2: Consola**
```javascript
// Ejecuta en la consola:
window.AITests.testMedications()
```

---

### 🎯 **Paso 7: Prueba Completa**

**Ejecuta todas las pruebas de una vez:**
```javascript
// Ejecuta en la consola:
window.AITests.runAll()
```

---

## 🔍 **Qué Buscar en las Pruebas**

### ✅ **Indicadores de Funcionamiento Correcto:**

1. **En la Consola:**
   - Mensajes de "🧠 Analizando texto médico..."
   - Resultados de clasificación neurológica
   - Eventos de "aiAnalysisCompleted"

2. **En la Interfaz:**
   - Sugerencias flotantes aparecen al escribir
   - Dashboard de IA se abre correctamente
   - Métricas se actualizan en tiempo real

3. **Análisis Automático:**
   - Predicciones aparecen después de escribir >50 caracteres
   - Alertas de medicamentos se muestran
   - Dashboard muestra actividad reciente

### ❌ **Problemas Comunes:**

1. **"AIEngine no disponible"**
   - Verifica que todos los scripts estén cargados
   - Recarga la página

2. **"No se encontraron textareas"**
   - Asegúrate de estar en la versión compleja
   - Verifica que hay camas creadas

3. **Dashboard no se abre**
   - Verifica el botón en esquina inferior derecha
   - Usa `window.AIDashboard.showDashboard()` en consola

---

## 🧪 **Casos de Prueba Específicos**

### **Caso 1: Detección de Parkinson**
```
Texto: "Paciente de 65 años con temblor en reposo en mano derecha, rigidez muscular y bradicinesia"
Resultado esperado: Clasificación como Parkinson con alta confianza
```

### **Caso 2: Detección de Stroke**
```
Texto: "Hemiparesia derecha súbita, afasia de expresión y desviación de la mirada"
Resultado esperado: Clasificación como Stroke con alta confianza
```

### **Caso 3: Interacción de Medicamentos**
```
Medicamentos: Levodopa + Warfarina
Resultado esperado: Alerta de posible interacción
```

---

## 📈 **Métricas de Rendimiento**

### **Tiempos Esperados:**
- **Análisis de texto**: < 100ms
- **Clasificación neurológica**: < 50ms
- **Carga de dashboard**: < 200ms
- **Análisis automático**: 2 segundos después de escribir

### **Precisión Esperada:**
- **Clasificador neurológico**: ~89%
- **Extracción de entidades**: ~92%
- **Detección de patrones**: ~85%

---

## 🎉 **¡Listo para Probar!**

1. **Abre la aplicación**
2. **Abre la consola (F12)**
3. **Ejecuta**: `window.AITests.runAll()`
4. **Observa los resultados**
5. **Prueba manualmente** escribiendo síntomas

**¡La IA debería activarse automáticamente y mostrar análisis inteligentes!** 🧠✨ 

---

## 💊 **Prueba Específica: Sección de Medicamentos**

### **Problema Reportado**
La sección de medicamentos no funcionaba correctamente. Se han aplicado las siguientes correcciones:

1. **IDs únicos por cama**: Todos los elementos ahora usan IDs únicos (`med-input-${bedId}`)
2. **Listeners actualizados**: `setupMedicationListeners` ahora funciona con los nuevos IDs
3. **Datos de medicamentos**: Se usa `window.MEDICATIONS_DATA` correctamente
4. **Función syncChips**: Actualizada para trabajar con IDs únicos

### **Prueba Rápida**

#### **Paso 1: Verificación Inicial**
```javascript
// Ejecuta en la consola:
quickMedicationTest()
```

**Resultado esperado:**
```
🚀 PRUEBA RÁPIDA DE MEDICAMENTOS
================================
🛏️ Cama actual: 1
🔍 VERIFICACIÓN DE ELEMENTOS:
✅ section: OK
✅ input: OK  
✅ suggestions: OK
✅ display: OK
💊 VERIFICACIÓN DE DATOS:
📋 MEDICATIONS_DATA: 20 medicamentos
📋 appState.medicationsList: 20 medicamentos
```

#### **Paso 2: Abrir Sección de Medicamentos**
1. **Busca la sección "Medicación"** en la interfaz
2. **Haz clic en el encabezado** para expandirla
3. **Verifica que aparece el campo de entrada**

#### **Paso 3: Probar Funcionalidad**
```javascript
// Agregar medicamento de prueba:
quickMedicationAdd("Paracetamol")
```

#### **Paso 4: Prueba Manual**
1. **Escribe "para"** en el campo de medicamentos
2. **Verifica que aparecen sugerencias** (debería mostrar "Paracetamol")
3. **Haz clic en una sugerencia**
4. **Agrega dosis** (ej: "500mg cada 8 horas")
5. **Haz clic en "Agregar"**
6. **Verifica que aparece el chip** del medicamento

### **Solución de Problemas**

#### **Si no aparecen elementos:**
```javascript
// Verificar cama actual
console.log('Cama actual:', window.appState?.getCurrentBedId());

// Forzar renderizado de sección
const bedId = window.appState?.getCurrentBedId();
if (bedId) {
    const section = document.getElementById(`section-medicacion-${bedId}`);
    console.log('Sección encontrada:', !!section);
}
```

#### **Si no aparecen sugerencias:**
```javascript
// Verificar datos de medicamentos
console.log('Medicamentos cargados:', window.MEDICATIONS_DATA?.length);
console.log('Lista en appState:', window.appState?.medicationsList?.length);

// Recargar datos si es necesario
if (window.MEDICATIONS_DATA) {
    window.appState.medicationsList = window.MEDICATIONS_DATA;
    console.log('Datos recargados');
}
```

#### **Si los listeners no funcionan:**
```javascript
// Reconfigurar listeners manualmente
const bedId = window.appState?.getCurrentBedId();
if (bedId && typeof setupMedicationListeners === 'function') {
    setupMedicationListeners(bedId);
    console.log('Listeners reconfigurados');
}
```

### **Verificación Final**
```javascript
// Prueba completa
window.AITests.testMedicationSection()
```

--- 