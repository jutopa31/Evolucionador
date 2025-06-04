/**
 * 🔧 Correcciones Específicas para Modal de Versión
 * Suite Neurología v2.1.0 - Solución Simple y Directa
 */

(function() {
    'use strict';

    console.log('🔧 Iniciando correcciones específicas para modal de versión...');

    // Variable para evitar múltiples ejecuciones
    let modalFixed = false;

    // Función para corregir el modal de versión una sola vez
    function fixVersionModal() {
        if (modalFixed) return false;
        
        const versionModal = document.getElementById('version-splash');
        
        if (versionModal) {
            console.log('🔧 Corrigiendo modal de versión...');
            
            // Asegurar que el modal sea visible y clickeable
            versionModal.style.pointerEvents = 'auto';
            versionModal.style.zIndex = '2000';
            versionModal.style.display = 'flex';
            
            // Corregir botones específicos del modal
            const versionButtons = versionModal.querySelectorAll('.version-btn, .cancel-btn');
            versionButtons.forEach(button => {
                button.style.pointerEvents = 'auto';
                button.style.cursor = 'pointer';
                button.style.zIndex = 'auto';
                
                // Agregar listener para cerrar el modal después de seleccionar
                if (button.classList.contains('version-btn')) {
                    button.addEventListener('click', function() {
                        modalFixed = true;
                        setTimeout(() => {
                            if (versionModal.style.display !== 'none') {
                                versionModal.style.display = 'none';
                            }
                        }, 100);
                    });
                }
            });
            
            modalFixed = true;
            console.log('✅ Modal de versión corregido');
            return true;
        }
        
        return false;
    }

    // Función para limpiar localStorage si hay problemas
    function cleanupIfNeeded() {
        // Solo limpiar si hay evidencia de bucle infinito
        const modalShownCount = sessionStorage.getItem('modalShownCount') || '0';
        const count = parseInt(modalShownCount);
        
        if (count > 3) {
            console.log('🧹 Detectado bucle infinito, limpiando localStorage...');
            localStorage.removeItem('selectedVersion');
            sessionStorage.removeItem('modalShownCount');
            modalFixed = false;
        } else {
            sessionStorage.setItem('modalShownCount', (count + 1).toString());
        }
    }

    // Aplicar correcciones cuando el DOM esté listo
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            cleanupIfNeeded();
            setTimeout(fixVersionModal, 100);
        });
    } else {
        cleanupIfNeeded();
        setTimeout(fixVersionModal, 100);
    }

    // Aplicar correcciones una vez más después de que todo esté cargado
    window.addEventListener('load', function() {
        setTimeout(fixVersionModal, 200);
    });

    console.log('🔧 Sistema de correcciones de modal inicializado');

})(); 