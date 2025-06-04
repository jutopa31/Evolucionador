const fs = require('fs');

try {
    const code = fs.readFileSync('app.js', 'utf8');
    
    // Intentar evaluar la sintaxis sin ejecutar
    new Function(code);
    
    console.log('✅ Sintaxis de app.js es válida');
} catch (error) {
    console.error('❌ Error de sintaxis en app.js:');
    console.error(error.message);
    
    // Intentar encontrar la línea del error
    if (error.message.includes('line')) {
        const match = error.message.match(/line (\d+)/);
        if (match) {
            const lineNumber = parseInt(match[1]);
            console.log(`Error en línea: ${lineNumber}`);
        }
    }
} 