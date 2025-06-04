console.log('🚀 FORZANDO CORRECCIÓN DEL MODAL DE VERSIONES...');

// Función para forzar el funcionamiento del modal
function forceModalFix() {
    console.log('🔧 Iniciando corrección forzada del modal...');
    
    // Obtener elementos del modal
    const modal = document.getElementById('version-splash');
    const simpleBtn = document.getElementById('version-simple');
    const complexBtn = document.getElementById('version-compleja');
    const cancelBtn = document.getElementById('version-cancel');
    const app = document.getElementById('app');
    
    console.log('🔍 Elementos encontrados:', {
        modal: !!modal,
        simpleBtn: !!simpleBtn,
        complexBtn: !!complexBtn,
        cancelBtn: !!cancelBtn,
        app: !!app
    });
    
    if (!modal || !simpleBtn || !complexBtn || !app) {
        console.error('❌ No se encontraron todos los elementos necesarios');
        return false;
    }
    
    // Limpiar todos los event listeners existentes
    const newSimpleBtn = simpleBtn.cloneNode(true);
    const newComplexBtn = complexBtn.cloneNode(true);
    const newCancelBtn = cancelBtn ? cancelBtn.cloneNode(true) : null;
    
    simpleBtn.parentNode.replaceChild(newSimpleBtn, simpleBtn);
    complexBtn.parentNode.replaceChild(newComplexBtn, complexBtn);
    if (cancelBtn && newCancelBtn) {
        cancelBtn.parentNode.replaceChild(newCancelBtn, cancelBtn);
    }
    
    console.log('🧹 Event listeners anteriores limpiados');
    
    // Función para mostrar versión simple
    function showSimpleVersion(event) {
        console.log('📝 ¡CLICK DETECTADO! Cargando versión simple...');
        
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        // Guardar preferencia
        localStorage.setItem('selectedVersion', 'simple');
        
        // Ocultar modal
        modal.style.display = 'none';
        
        // Mostrar interfaz simple
        app.innerHTML = `
            <div class="container">
                <h1 style="text-align: center; color: #333; margin-bottom: 2rem;">📝 Suite Neurología - Versión Simple</h1>
                <div style="background: #f8f9fa; padding: 2rem; border-radius: 8px; border: 1px solid #e0e0e0;">
                    <label for="simple-note" style="display: block; font-weight: 600; margin-bottom: 1rem; color: #555;">Nota de Evolución:</label>
                    <textarea 
                        id="simple-note" 
                        style="width: 100%; min-height: 400px; padding: 1rem; border: 2px solid #e0e0e0; border-radius: 6px; font-family: inherit; font-size: 14px; line-height: 1.6; resize: vertical;"
                        placeholder="Escriba aquí la nota de evolución del paciente...

Ejemplo:
Paciente de 65 años con antecedente de hipertensión arterial...
Examen físico: Consciente, orientado...
Plan: Continuar tratamiento actual..."
                    ></textarea>
                    <div style="margin-top: 1.5rem; display: flex; gap: 1rem; justify-content: flex-end; flex-wrap: wrap;">
                        <button id="copy-note" style="padding: 0.75rem 1.5rem; background: #007bff; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">
                            📋 Copiar Nota
                        </button>
                        <button id="clear-note" style="padding: 0.75rem 1.5rem; background: #6c757d; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">
                            🗑️ Limpiar
                        </button>
                        <button id="change-version" style="padding: 0.75rem 1.5rem; background: #28a745; color: white; border: none; border-radius: 6px; cursor: pointer; font-weight: 500;">
                            🔄 Cambiar Versión
                        </button>
                    </div>
                    <div id="status-message" style="display: none; margin-top: 1rem; padding: 0.75rem; border-radius: 6px; text-align: center; font-weight: 500;"></div>
                </div>
            </div>
        `;
        
        setupSimpleVersionListeners();
        loadSavedNote();
        console.log('✅ Versión simple cargada correctamente');
    }
    
    // Función para mostrar versión compleja
    function showComplexVersion(event) {
        console.log('📋 ¡CLICK DETECTADO! Cargando versión compleja...');
        
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        // Guardar preferencia
        localStorage.setItem('selectedVersion', 'complex');
        
        // Ocultar modal
        modal.style.display = 'none';
        
        // Recargar la página para cargar la versión compleja
        setTimeout(() => {
            window.location.reload();
        }, 100);
    }
    
    // Función para configurar listeners de la versión simple
    function setupSimpleVersionListeners() {
        const textarea = document.getElementById('simple-note');
        const copyBtn = document.getElementById('copy-note');
        const clearBtn = document.getElementById('clear-note');
        const changeBtn = document.getElementById('change-version');
        const statusDiv = document.getElementById('status-message');
        
        // Auto-guardar
        if (textarea) {
            textarea.addEventListener('input', function() {
                localStorage.setItem('simple-note-content', textarea.value);
                showStatus('💾 Guardado automáticamente', 'info');
            });
        }
        
        // Copiar nota
        if (copyBtn && textarea) {
            copyBtn.addEventListener('click', function() {
                const text = textarea.value.trim();
                if (text) {
                    navigator.clipboard.writeText(text).then(() => {
                        copyBtn.innerHTML = '✅ ¡Copiado!';
                        showStatus('📋 Nota copiada al portapapeles', 'success');
                        setTimeout(() => {
                            copyBtn.innerHTML = '📋 Copiar Nota';
                        }, 2000);
                    }).catch(err => {
                        console.error('Error al copiar:', err);
                        showStatus('❌ Error al copiar al portapapeles', 'error');
                    });
                } else {
                    showStatus('⚠️ No hay texto para copiar', 'info');
                }
            });
        }
        
        // Limpiar nota
        if (clearBtn && textarea) {
            clearBtn.addEventListener('click', function() {
                if (confirm('¿Está seguro de que desea limpiar la nota?')) {
                    textarea.value = '';
                    localStorage.removeItem('simple-note-content');
                    textarea.focus();
                    showStatus('🗑️ Nota limpiada', 'info');
                }
            });
        }
        
        // Cambiar versión
        if (changeBtn) {
            changeBtn.addEventListener('click', function() {
                modal.style.display = 'flex';
            });
        }
        
        function showStatus(message, type) {
            if (statusDiv) {
                statusDiv.textContent = message;
                statusDiv.className = 'status-message status-' + type;
                statusDiv.style.display = 'block';
                
                // Estilos según el tipo
                if (type === 'success') {
                    statusDiv.style.background = '#d4edda';
                    statusDiv.style.color = '#155724';
                    statusDiv.style.border = '1px solid #c3e6cb';
                } else if (type === 'info') {
                    statusDiv.style.background = '#d1ecf1';
                    statusDiv.style.color = '#0c5460';
                    statusDiv.style.border = '1px solid #bee5eb';
                } else if (type === 'error') {
                    statusDiv.style.background = '#f8d7da';
                    statusDiv.style.color = '#721c24';
                    statusDiv.style.border = '1px solid #f5c6cb';
                }
                
                setTimeout(() => {
                    statusDiv.style.display = 'none';
                }, 3000);
            }
        }
    }
    
    // Cargar nota guardada
    function loadSavedNote() {
        const savedNote = localStorage.getItem('simple-note-content');
        const textarea = document.getElementById('simple-note');
        if (savedNote && textarea) {
            textarea.value = savedNote;
            console.log('📄 Nota guardada cargada');
        }
    }
    
    // Configurar event listeners con múltiples métodos
    console.log('🔧 Configurando event listeners forzados...');
    
    // Botón versión simple
    newSimpleBtn.addEventListener('click', showSimpleVersion);
    newSimpleBtn.onclick = showSimpleVersion;
    newSimpleBtn.addEventListener('mousedown', function(e) {
        console.log('🖱️ Mousedown en botón simple');
        setTimeout(() => showSimpleVersion(e), 10);
    });
    
    // Botón versión compleja
    newComplexBtn.addEventListener('click', showComplexVersion);
    newComplexBtn.onclick = showComplexVersion;
    newComplexBtn.addEventListener('mousedown', function(e) {
        console.log('🖱️ Mousedown en botón complejo');
        setTimeout(() => showComplexVersion(e), 10);
    });
    
    // Botón cancelar (si existe)
    if (newCancelBtn) {
        newCancelBtn.addEventListener('click', function() {
            console.log('❌ Cancelando selección de versión');
            modal.style.display = 'none';
        });
    }
    
    console.log('✅ Event listeners forzados configurados');
    
    // Verificar si hay una versión guardada
    const savedVersion = localStorage.getItem('selectedVersion');
    if (savedVersion === 'simple') {
        console.log('📝 Versión simple guardada detectada, cargando...');
        setTimeout(showSimpleVersion, 100);
    } else if (savedVersion === 'complex') {
        console.log('📋 Versión compleja guardada detectada, inicializando...');
        modal.style.display = 'none';
        // La versión compleja se maneja con los scripts existentes
    } else {
        console.log('🔍 Mostrando modal de selección de versión');
        modal.style.display = 'flex';
    }
    
    return true;
}

// Función para ejecutar la corrección con múltiples intentos
function executeModalFix() {
    let attempts = 0;
    const maxAttempts = 10;
    
    function tryFix() {
        attempts++;
        console.log(`🔄 Intento ${attempts}/${maxAttempts} de corrección del modal...`);
        
        if (forceModalFix()) {
            console.log('✅ Modal corregido exitosamente');
            return;
        }
        
        if (attempts < maxAttempts) {
            setTimeout(tryFix, 500);
        } else {
            console.error('❌ No se pudo corregir el modal después de', maxAttempts, 'intentos');
        }
    }
    
    tryFix();
}

// Ejecutar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', executeModalFix);
} else {
    executeModalFix();
}

// También ejecutar después de un delay para asegurar que todos los scripts se hayan cargado
setTimeout(executeModalFix, 1000);
setTimeout(executeModalFix, 2000);

// Funciones globales para debugging
window.forceModalFix = forceModalFix;
window.executeModalFix = executeModalFix;

window.testModalSimple = function() {
    console.log('🧪 Probando versión simple...');
    const simpleBtn = document.getElementById('version-simple');
    if (simpleBtn) {
        simpleBtn.click();
    } else {
        console.error('❌ Botón simple no encontrado');
    }
};

window.testModalComplex = function() {
    console.log('🧪 Probando versión compleja...');
    const complexBtn = document.getElementById('version-compleja');
    if (complexBtn) {
        complexBtn.click();
    } else {
        console.error('❌ Botón complejo no encontrado');
    }
};

window.showVersionModal = function() {
    console.log('👁️ Mostrando modal de versiones...');
    const modal = document.getElementById('version-splash');
    if (modal) {
        modal.style.display = 'flex';
    } else {
        console.error('❌ Modal no encontrado');
    }
};

console.log('🎯 Script de corrección forzada cargado. Funciones disponibles:');
console.log('- forceModalFix() - Forzar corrección del modal');
console.log('- testModalSimple() - Probar versión simple');
console.log('- testModalComplex() - Probar versión compleja');
console.log('- showVersionModal() - Mostrar modal'); 