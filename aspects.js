/**
 * Escala ASPECTS (Alberta Stroke Program Early CT Score)
 * Este script maneja la lógica de la escala ASPECTS para evaluar la extensión
 * del infarto isquémico temprano en la TC inicial.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Elementos del DOM
    const form = document.getElementById('aspects-form');
    const calculateBtn = document.getElementById('calculate-btn');
    const resetBtn = document.getElementById('reset-btn');
    const insertBtn = document.getElementById('insert-btn');
    const totalScoreDisplay = document.getElementById('total-score');
    const interpretationDisplay = document.getElementById('interpretation');

    // Mapeo de regiones para el texto descriptivo
    const regionNames = {
        m1: 'Corteza insular',
        m2: 'Corteza MCA anterior',
        m3: 'Corteza MCA posterior',
        m4: 'Corteza MCA anterior superior',
        m5: 'Corteza MCA lateral',
        m6: 'Corteza MCA posterior superior',
        c: 'Núcleo caudado',
        l: 'Núcleo lentiforme',
        ic: 'Cápsula interna',
        a: 'Radiación coronal anterior'
    };

    // Función para calcular la puntuación total
    function calculateScore() {
        const formData = new FormData(form);
        let totalScore = 0;
        const affectedRegions = [];

        // Calcular puntuación y recopilar regiones afectadas
        for (const [region, value] of formData.entries()) {
            const score = parseInt(value);
            totalScore += score;
            if (score === 0) {
                affectedRegions.push(regionNames[region]);
            }
        }

        // Actualizar la puntuación total
        totalScoreDisplay.textContent = totalScore;

        // Determinar la interpretación
        let interpretation = '';
        if (totalScore >= 8) {
            interpretation = 'Isquemia leve (≤2 regiones afectadas)';
        } else if (totalScore >= 5) {
            interpretation = 'Isquemia moderada (3-5 regiones afectadas)';
        } else {
            interpretation = 'Isquemia extensa (>5 regiones afectadas)';
        }

        interpretationDisplay.textContent = `Interpretación: ${interpretation}`;

        return {
            score: totalScore,
            interpretation,
            affectedRegions
        };
    }

    // Función para generar el texto del resultado
    function generateResultText(result) {
        const { score, interpretation, affectedRegions } = result;
        
        let text = 'ESCALA ASPECTS (Alberta Stroke Program Early CT Score):\n\n';
        text += `Puntuación total: ${score}/10\n`;
        text += `Interpretación: ${interpretation}\n\n`;
        
        if (affectedRegions.length > 0) {
            text += 'Regiones afectadas:\n';
            affectedRegions.forEach(region => {
                text += `- ${region}\n`;
            });
        } else {
            text += 'No se observan regiones afectadas.\n';
        }

        return text;
    }

    // Función para reiniciar el formulario
    function resetForm() {
        form.reset();
        totalScoreDisplay.textContent = '0';
        interpretationDisplay.textContent = 'Interpretación: Isquemia extensa (>7 regiones afectadas)';
    }

    // Event Listeners
    calculateBtn.addEventListener('click', () => {
        // Verificar que todos los campos estén completos
        const allFieldsFilled = Array.from(form.elements).every(element => {
            if (element.type === 'radio') {
                const name = element.name;
                return form.querySelector(`input[name="${name}"]:checked`) !== null;
            }
            return true;
        });

        if (!allFieldsFilled) {
            alert('Por favor, complete todas las evaluaciones antes de calcular la puntuación.');
            return;
        }

        const result = calculateScore();
        console.log('Resultado ASPECTS:', result);
    });

    resetBtn.addEventListener('click', resetForm);

    insertBtn.addEventListener('click', () => {
        // Verificar que todos los campos estén completos
        const allFieldsFilled = Array.from(form.elements).every(element => {
            if (element.type === 'radio') {
                const name = element.name;
                return form.querySelector(`input[name="${name}"]:checked`) !== null;
            }
            return true;
        });

        if (!allFieldsFilled) {
            alert('Por favor, complete todas las evaluaciones antes de insertar el resultado.');
            return;
        }

        const result = calculateScore();
        const resultText = generateResultText(result);

        // Enviar el resultado a la ventana principal
        if (window.parent) {
            window.parent.postMessage({
                type: 'aspectsScaleText',
                text: resultText
            }, '*');
        }
    });

    // Manejar mensajes de la ventana principal
    window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'resetAspectsScale') {
            resetForm();
        }
    });
}); 