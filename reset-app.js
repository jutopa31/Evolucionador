// Script para resetear la aplicación y limpiar estados corruptos
console.log('🔄 Iniciando reset de la aplicación...');

// Función para limpiar localStorage
function clearAppStorage() {
    console.log('🧹 Limpiando localStorage...');
    
    // Limpiar claves específicas de la aplicación
    const keysToRemove = [
        'selectedVersion',
        'beds',
        'currentBedId',
        'aiEnabled',
        'simple-note-content'
    ];
    
    keysToRemove.forEach(key => {
        localStorage.removeItem(key);
        console.log(`🗑️ Removido: ${key}`);
    });
    
    // También limpiar cualquier clave que empiece con 'bed-'
    Object.keys(localStorage).forEach(key => {
        if (key.startsWith('bed-') || key.startsWith('Suite-')) {
            localStorage.removeItem(key);
            console.log(`🗑️ Removido: ${key}`);
        }
    });
    
    console.log('✅ localStorage limpiado');
}

// Función para resetear el estado global
function resetGlobalState() {
    console.log('🔄 Reseteando estado global...');
    
    if (window.AppState) {
        window.AppState = {
            beds: {},
            currentBedId: null,
            version: null,
            aiEnabled: false,
            initialized: false
        };
        console.log('✅ AppState reseteado');
    }
    
    // Limpiar cualquier variable global relacionada
    if (window.appState) {
        delete window.appState;
        console.log('✅ appState eliminado');
    }
}

// Función para forzar la visibilidad del modal
function forceShowVersionModal() {
    console.log('👁️ Forzando visibilidad del modal...');
    
    const modal = document.getElementById("version-splash");
    if (modal) {
        // Asegurar que el modal sea completamente visible
        modal.style.display = "flex";
        modal.style.position = "fixed";
        modal.style.top = "0";
        modal.style.left = "0";
        modal.style.width = "100%";
        modal.style.height = "100%";
        modal.style.zIndex = "99999";
        modal.style.backgroundColor = "rgba(0, 0, 0, 0.8)";
        modal.style.alignItems = "center";
        modal.style.justifyContent = "center";
        
        // Asegurar que el contenido del modal sea visible
        const modalContent = modal.querySelector('.modal-content');
        if (modalContent) {
            modalContent.style.display = "block";
            modalContent.style.position = "relative";
            modalContent.style.zIndex = "100000";
            modalContent.style.backgroundColor = "white";
            modalContent.style.padding = "2rem";
            modalContent.style.borderRadius = "8px";
            modalContent.style.maxWidth = "500px";
            modalContent.style.width = "90%";
        }
        
        console.log('✅ Modal forzado a ser visible');
        return true;
    }
    
    console.log('❌ Modal no encontrado');
    return false;
}

// Función principal de reset
function resetApplication() {
    console.log('🚀 Ejecutando reset completo de la aplicación...');
    
    clearAppStorage();
    resetGlobalState();
    
    // Esperar un poco y luego forzar el modal
    setTimeout(() => {
        forceShowVersionModal();
    }, 100);
    
    console.log('✅ Reset de aplicación completado');
}

// Ejecutar reset cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
    console.log('📋 DOM listo para reset...');
    
    // Verificar si necesitamos hacer reset
    const needsReset = !localStorage.getItem('selectedVersion') || 
                      !document.getElementById("version-splash") ||
                      document.getElementById("version-splash").style.display === "none";
    
    if (needsReset) {
        console.log('⚠️ Se detectó que la aplicación necesita reset');
        setTimeout(resetApplication, 50);
    }
});

// Función global para reset manual
window.resetApp = resetApplication;

// Función global para mostrar modal
window.forceShowModal = forceShowVersionModal;

console.log('✅ Script de reset cargado. Usa resetApp() o forceShowModal() en la consola si es necesario.'); 