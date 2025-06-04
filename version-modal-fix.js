// Script para corregir el problema del modal de selección de versiones
console.log('🔧 Iniciando corrección del modal de selección de versiones...');

document.addEventListener('DOMContentLoaded', function() {
    console.log('📋 DOM cargado, verificando modal de versiones...');
    
    // Función para forzar la inicialización del modal
    function forceInitializeVersionModal() {
        console.log('🚀 Forzando inicialización del modal de versiones...');
        
        const modal = document.getElementById("version-splash");
        const simpleBtn = document.getElementById("version-simple");
        const complexBtn = document.getElementById("version-compleja");
        const cancelBtn = document.getElementById("version-cancel");
        
        console.log('🔍 Elementos encontrados:', {
            modal: !!modal,
            simpleBtn: !!simpleBtn,
            complexBtn: !!complexBtn,
            cancelBtn: !!cancelBtn
        });

        if (!modal || !simpleBtn || !complexBtn || !cancelBtn) {
            console.error('❌ Elementos del modal no encontrados');
            return false;
        }

        // Asegurar que el modal sea visible
        modal.style.display = "flex";
        modal.style.position = "fixed";
        modal.style.top = "0";
        modal.style.left = "0";
        modal.style.width = "100%";
        modal.style.height = "100%";
        modal.style.zIndex = "10000";
        modal.style.backgroundColor = "rgba(0, 0, 0, 0.7)";
        
        console.log('✅ Modal de versiones visible');

        function closeModal() {
            modal.style.display = "none";
            console.log('🔒 Modal cerrado');
        }

        function selectSimpleVersion() {
            console.log('📝 Versión simple seleccionada');
            closeModal();
            
            // Limpiar el contenido del app
            const app = document.getElementById("app");
            if (app) {
                app.innerHTML = `
                    <div class="simple-version-container" style="max-width: 800px; margin: 2rem auto; padding: 2rem;">
                        <h1 style="text-align: center; color: #333; margin-bottom: 2rem;">
                            📝 Suite Neurología - Versión Simple
                        </h1>
                        <div class="note-container" style="background: white; border-radius: 8px; padding: 2rem; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                            <label for="simple-note" style="display: block; font-weight: 600; margin-bottom: 1rem; color: #555;">
                                Nota de Evolución:
                            </label>
                            <textarea 
                                id="simple-note" 
                                placeholder="Escriba aquí la nota de evolución..."
                                style="width: 100%; min-height: 400px; padding: 1rem; border: 2px solid #e0e0e0; border-radius: 6px; font-family: inherit; font-size: 14px; line-height: 1.5; resize: vertical;"
                            ></textarea>
                            <div class="actions" style="margin-top: 1.5rem; display: flex; gap: 1rem; justify-content: flex-end;">
                                <button id="copy-simple-note" style="background: #007bff; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: 500;">
                                    📋 Copiar Nota
                                </button>
                                <button id="clear-simple-note" style="background: #6c757d; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: 500;">
                                    🗑️ Limpiar
                                </button>
                                <button id="change-version" style="background: #28a745; color: white; border: none; padding: 0.75rem 1.5rem; border-radius: 6px; cursor: pointer; font-weight: 500;">
                                    🔄 Cambiar Versión
                                </button>
                            </div>
                        </div>
                    </div>
                `;
                
                // Configurar listeners para la versión simple
                setupSimpleVersionListeners();
                console.log('✅ Versión simple renderizada correctamente');
            }
        }

        function selectComplexVersion() {
            console.log('📋 Versión compleja seleccionada');
            closeModal();
            
            // Llamar a la función original de renderizado complejo
            if (typeof renderVersionUI === 'function') {
                renderVersionUI('compleja');
            } else if (typeof window.renderVersionUI === 'function') {
                window.renderVersionUI('compleja');
            } else {
                console.error('❌ Función renderVersionUI no encontrada');
                // Fallback: recargar la página
                location.reload();
            }
        }

        // Configurar event listeners
        simpleBtn.onclick = selectSimpleVersion;
        complexBtn.onclick = selectComplexVersion;
        cancelBtn.onclick = closeModal;

        // Cerrar al hacer clic fuera del modal
        modal.onclick = (e) => {
            if (e.target === modal) {
                closeModal();
            }
        };

        console.log('✅ Modal de versiones inicializado correctamente');
        return true;
    }
    
    function setupSimpleVersionListeners() {
        const copyBtn = document.getElementById('copy-simple-note');
        const clearBtn = document.getElementById('clear-simple-note');
        const changeVersionBtn = document.getElementById('change-version');
        const textarea = document.getElementById('simple-note');
        
        if (copyBtn && textarea) {
            copyBtn.addEventListener('click', function() {
                const text = textarea.value.trim();
                if (text) {
                    navigator.clipboard.writeText(text).then(() => {
                        copyBtn.textContent = '✅ Copiado!';
                        setTimeout(() => {
                            copyBtn.textContent = '📋 Copiar Nota';
                        }, 2000);
                    }).catch(err => {
                        console.error('Error al copiar:', err);
                        alert('Error al copiar al portapapeles');
                    });
                } else {
                    alert('No hay texto para copiar');
                }
            });
        }
        
        if (clearBtn && textarea) {
            clearBtn.addEventListener('click', function() {
                if (confirm('¿Está seguro de que desea limpiar la nota?')) {
                    textarea.value = '';
                    textarea.focus();
                }
            });
        }
        
        if (changeVersionBtn) {
            changeVersionBtn.addEventListener('click', function() {
                const modal = document.getElementById("version-splash");
                if (modal) {
                    modal.style.display = "flex";
                }
            });
        }
        
        // Auto-guardar en localStorage
        if (textarea) {
            // Cargar nota guardada
            const savedNote = localStorage.getItem('simple-note-content');
            if (savedNote) {
                textarea.value = savedNote;
            }
            
            // Guardar automáticamente
            textarea.addEventListener('input', function() {
                localStorage.setItem('simple-note-content', textarea.value);
            });
        }
    }
    
    // Intentar inicializar inmediatamente
    setTimeout(() => {
        if (!forceInitializeVersionModal()) {
            console.log('⏳ Reintentando inicialización en 1 segundo...');
            setTimeout(forceInitializeVersionModal, 1000);
        }
    }, 100);
    
    // Verificar si hay una versión guardada
    const savedVersion = localStorage.getItem('selectedVersion');
    if (savedVersion === 'simple') {
        console.log('📝 Versión simple guardada detectada, cargando directamente...');
        setTimeout(() => {
            const simpleBtn = document.getElementById("version-simple");
            if (simpleBtn) {
                simpleBtn.click();
            }
        }, 500);
    }
});

// Función global para mostrar el modal de versiones
window.showVersionModal = function() {
    const modal = document.getElementById("version-splash");
    if (modal) {
        modal.style.display = "flex";
    }
};

console.log('✅ Script de corrección del modal de versiones cargado'); 