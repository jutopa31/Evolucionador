/**
 * 🧪 Test de Posiciones de Botones
 * Verifica que los botones no se superpongan
 */

function testButtonPositions() {
    console.log('🧪 VERIFICANDO POSICIONES DE BOTONES...\n');
    
    // Esperar a que los botones se carguen
    setTimeout(() => {
        const buttons = [
            { id: 'actions-btn-floating', name: 'Acciones', expected: 'bottom: 20px' },
            { id: 'copy-btn-floating', name: 'Copiar', expected: 'bottom: 20px' },
            { id: 'scales-btn-floating', name: 'Escalas', expected: 'bottom: 20px' },
            { id: 'ai-dashboard-btn', name: 'IA Dashboard', expected: 'bottom: 200px' },
            { id: 'ai-test-btn', name: 'Test IA', expected: 'bottom: 260px' }
        ];
        
        const positions = [];
        
        buttons.forEach(buttonInfo => {
            const button = document.getElementById(buttonInfo.id);
            if (button) {
                const style = window.getComputedStyle(button);
                const bottom = style.bottom;
                const right = style.right;
                const position = style.position;
                
                positions.push({
                    name: buttonInfo.name,
                    id: buttonInfo.id,
                    bottom: bottom,
                    right: right,
                    position: position,
                    found: true
                });
                
                console.log(`✅ ${buttonInfo.name}:`);
                console.log(`   ID: ${buttonInfo.id}`);
                console.log(`   Position: ${position}`);
                console.log(`   Bottom: ${bottom}`);
                console.log(`   Right: ${right}`);
                console.log(`   Expected: ${buttonInfo.expected}`);
                console.log('');
            } else {
                positions.push({
                    name: buttonInfo.name,
                    id: buttonInfo.id,
                    found: false
                });
                
                console.log(`❌ ${buttonInfo.name} (${buttonInfo.id}) - NO ENCONTRADO`);
                console.log('');
            }
        });
        
        // Verificar superposiciones
        console.log('🔍 VERIFICANDO SUPERPOSICIONES...\n');
        
        const foundButtons = positions.filter(p => p.found);
        let overlaps = false;
        
        for (let i = 0; i < foundButtons.length; i++) {
            for (let j = i + 1; j < foundButtons.length; j++) {
                const btn1 = foundButtons[i];
                const btn2 = foundButtons[j];
                
                // Convertir bottom a números para comparar
                const bottom1 = parseInt(btn1.bottom);
                const bottom2 = parseInt(btn2.bottom);
                const right1 = parseInt(btn1.right);
                const right2 = parseInt(btn2.right);
                
                // Verificar si están en la misma posición (superposición)
                if (Math.abs(bottom1 - bottom2) < 60 && Math.abs(right1 - right2) < 60) {
                    console.log(`⚠️ POSIBLE SUPERPOSICIÓN:`);
                    console.log(`   ${btn1.name} (bottom: ${btn1.bottom})`);
                    console.log(`   ${btn2.name} (bottom: ${btn2.bottom})`);
                    console.log(`   Diferencia: ${Math.abs(bottom1 - bottom2)}px`);
                    console.log('');
                    overlaps = true;
                }
            }
        }
        
        if (!overlaps) {
            console.log('✅ NO SE DETECTARON SUPERPOSICIONES');
        }
        
        console.log('\n📊 RESUMEN:');
        console.log(`• Botones encontrados: ${foundButtons.length}/${buttons.length}`);
        console.log(`• Superposiciones: ${overlaps ? 'SÍ' : 'NO'}`);
        console.log(`• Estado: ${!overlaps && foundButtons.length === buttons.length ? '✅ CORRECTO' : '⚠️ REVISAR'}`);
        
        return positions;
        
    }, 2000); // Esperar 2 segundos para que se carguen todos los módulos
}

// Función para mostrar botones visualmente
function highlightButtons() {
    console.log('🎨 RESALTANDO BOTONES PARA INSPECCIÓN VISUAL...');
    
    const buttonIds = [
        'actions-btn-floating',
        'copy-btn-floating', 
        'scales-btn-floating',
        'ai-dashboard-btn',
        'ai-test-btn'
    ];
    
    buttonIds.forEach((id, index) => {
        const button = document.getElementById(id);
        if (button) {
            // Agregar borde colorido temporal
            const colors = ['red', 'blue', 'green', 'purple', 'orange'];
            button.style.border = `3px solid ${colors[index]}`;
            button.style.boxShadow = `0 0 10px ${colors[index]}`;
            
            console.log(`🎨 ${id} resaltado en ${colors[index]}`);
            
            // Remover resaltado después de 5 segundos
            setTimeout(() => {
                button.style.border = '';
                button.style.boxShadow = '0 4px 15px rgba(0,0,0,0.2)';
            }, 5000);
        }
    });
}

// Función para ajustar posiciones si es necesario
function adjustButtonPositions() {
    console.log('🔧 AJUSTANDO POSICIONES DE BOTONES...');
    
    // Posiciones recomendadas (de abajo hacia arriba)
    const positions = [
        { id: 'actions-btn-floating', bottom: '20px' },
        { id: 'copy-btn-floating', bottom: '20px' },
        { id: 'scales-btn-floating', bottom: '20px' },
        { id: 'ai-dashboard-btn', bottom: '200px' },
        { id: 'ai-test-btn', bottom: '260px' }
    ];
    
    positions.forEach(pos => {
        const button = document.getElementById(pos.id);
        if (button) {
            button.style.bottom = pos.bottom;
            console.log(`✅ ${pos.id} ajustado a bottom: ${pos.bottom}`);
        }
    });
    
    console.log('🔧 Ajustes completados');
}

// Ejecutar automáticamente cuando se carga la página
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        testButtonPositions();
    });
} else {
    testButtonPositions();
}

// Hacer funciones disponibles globalmente
window.testButtonPositions = testButtonPositions;
window.highlightButtons = highlightButtons;
window.adjustButtonPositions = adjustButtonPositions;

console.log(`
🧪 TEST DE POSICIONES DE BOTONES CARGADO

🎯 FUNCIONES DISPONIBLES:
• testButtonPositions() - Verificar posiciones
• highlightButtons() - Resaltar botones visualmente  
• adjustButtonPositions() - Ajustar posiciones

⏰ El test se ejecutará automáticamente en 2 segundos...
`); 