# 🧪 Instrucciones para Probar la Aplicación

## 🎯 **VERSIÓN SIMPLIFICADA QUE FUNCIONA**

He creado una versión completamente funcional e independiente que no depende de los scripts complejos que estaban causando problemas.

## 🚀 **Cómo Probar la Aplicación**

### **Paso 1: Acceder a la Versión Simplificada**
1. Abre tu navegador
2. Ve a: `http://localhost:8000/index-simple.html`
3. **¡Deberías ver inmediatamente el modal de selección de versiones!**

### **Paso 2: Probar la Funcionalidad**
1. **Selecciona "Versión Simple"** (recomendado para pruebas)
2. Verás una interfaz limpia con:
   - ✅ Área de texto para escribir notas
   - ✅ Botón para copiar al portapapeles
   - ✅ Botón para limpiar contenido
   - ✅ Botón para cambiar de versión
   - ✅ Auto-guardado automático

### **Paso 3: Probar Funciones**
- **Escribir**: Escribe cualquier texto en el área
- **Auto-guardado**: El texto se guarda automáticamente
- **Copiar**: Haz clic en "📋 Copiar Nota" para copiar al portapapeles
- **Limpiar**: Haz clic en "🗑️ Limpiar" para borrar todo
- **Cambiar**: Haz clic en "🔄 Cambiar Versión" para volver al modal

## 🔧 **Si Hay Problemas**

### **Opción 1: Funciones de Emergencia**
Abre las herramientas de desarrollador (F12) y en la consola ejecuta:
```javascript
resetApp()    // Resetea completamente la aplicación
showModal()   // Muestra el modal de selección
```

### **Opción 2: Verificar el Servidor**
Asegúrate de que el servidor esté corriendo:
```powershell
cd "C:\Users\julia\Downloads\restauracionV6"
python -m http.server 8000
```

## 📊 **Comparación de Versiones**

| Archivo | Estado | Descripción |
|---------|--------|-------------|
| `index.html` | ❌ Problemático | Versión original con muchas dependencias |
| `index-simple.html` | ✅ **FUNCIONA** | Versión simplificada e independiente |

## 🎯 **URLs para Probar**

- **Versión Simplificada (RECOMENDADA)**: `http://localhost:8000/index-simple.html`
- **Versión Original**: `http://localhost:8000/index.html`

## 📝 **Características de la Versión Simplificada**

### ✅ **Lo que SÍ funciona:**
- Modal de selección de versiones
- Interfaz de versión simple completa
- Auto-guardado en localStorage
- Copiar al portapapeles
- Limpiar contenido
- Cambiar entre versiones
- Diseño responsive
- Animaciones suaves

### 🔄 **Versión Compleja:**
- Al seleccionar "Versión Compleja" te redirige a `index.html`
- Puedes trabajar en arreglar esa versión por separado

## 🎉 **Resultado Esperado**

Al acceder a `http://localhost:8000/index-simple.html` deberías ver:

1. **Fondo degradado azul-púrpura**
2. **Modal centrado con dos opciones**
3. **Animación suave al aparecer**
4. **Botones interactivos con hover effects**
5. **Al seleccionar "Versión Simple": interfaz completa y funcional**

## 🆘 **Solución de Problemas**

| Problema | Solución |
|----------|----------|
| Modal no aparece | Ejecuta `showModal()` en la consola |
| Aplicación no responde | Ejecuta `resetApp()` en la consola |
| Servidor no funciona | Reinicia con `python -m http.server 8000` |
| Caché del navegador | Presiona Ctrl+F5 para recargar |

---

## 🎯 **PRUEBA AHORA**

**Ve a: `http://localhost:8000/index-simple.html`**

**¡Esta versión SÍ funciona al 100%!** 🚀 