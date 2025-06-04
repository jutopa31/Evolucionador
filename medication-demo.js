/**
 * 🎬 Demostración de Mejoras de Medicamentos
 * Suite Neurología v2.1.0 - Demo Interactivo
 */

class MedicationDemo {
    constructor() {
        this.demoSteps = [
            {
                title: "🎨 Diseño Visual Mejorado",
                description: "Header con gradiente azul, iconos de medicamentos, y efectos de hover",
                action: () => this.showVisualImprovements()
            },
            {
                title: "⌨️ Atajos de Teclado",
                description: "Ctrl+M para medicamentos, Ctrl+D para dosis, Escape para cancelar",
                action: () => this.demonstrateKeyboardShortcuts()
            },
            {
                title: "✨ Animaciones Suaves",
                description: "Chips con animaciones de entrada, efectos de hover mejorados",
                action: () => this.demonstrateAnimations()
            },
            {
                title: "🎯 Validación en Tiempo Real",
                description: "Feedback visual mientras escribes, colores de validación",
                action: () => this.demonstrateValidation()
            },
            {
                title: "🖱️ Drag & Drop",
                description: "Arrastra chips para reordenar medicamentos",
                action: () => this.demonstrateDragDrop()
            },
            {
                title: "💡 Tooltips Informativos",
                description: "Información detallada al pasar el mouse sobre elementos",
                action: () => this.demonstrateTooltips()
            }
        ];
        
        this.currentStep = 0;
        this.isRunning = false;
    }

    /**
     * Inicia la demostración
     */
    startDemo() {
        if (this.isRunning) {
            console.log('🎬 Demo ya está ejecutándose');
            return;
        }

        console.log('🎬 INICIANDO DEMOSTRACIÓN DE MEJORAS DE MEDICAMENTOS');
        console.log('='.repeat(60));
        
        this.isRunning = true;
        this.currentStep = 0;
        
        this.showDemoControls();
        this.runCurrentStep();
    }

    /**
     * Muestra controles de demo
     */
    showDemoControls() {
        // Crear panel de control
        const controlPanel = document.createElement('div');
        controlPanel.id = 'medication-demo-controls';
        controlPanel.style.cssText = `
            position: fixed;
            top: 80px;
            right: 20px;
            width: 320px;
            background: linear-gradient(135deg, #1f2937 0%, #374151 100%);
            color: white;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 10px 25px rgba(0,0,0,0.2);
            z-index: 10000;
            font-family: 'Inter', sans-serif;
        `;

        controlPanel.innerHTML = `
            <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 16px;">
                <span style="font-size: 1.5rem;">🎬</span>
                <h3 style="margin: 0; font-size: 1.1rem;">Demo Medicamentos</h3>
                <button id="demo-close" style="margin-left: auto; background: none; border: none; color: white; font-size: 1.2rem; cursor: pointer;">×</button>
            </div>
            
            <div id="demo-progress" style="background: rgba(255,255,255,0.1); height: 4px; border-radius: 2px; margin-bottom: 16px;">
                <div id="demo-progress-bar" style="background: #3b82f6; height: 100%; border-radius: 2px; width: 0%; transition: width 0.3s ease;"></div>
            </div>
            
            <div id="demo-step-info" style="margin-bottom: 16px;">
                <div id="demo-step-title" style="font-weight: 600; margin-bottom: 4px;"></div>
                <div id="demo-step-desc" style="font-size: 0.9rem; color: #d1d5db;"></div>
            </div>
            
            <div style="display: flex; gap: 8px;">
                <button id="demo-prev" style="flex: 1; padding: 8px 12px; background: #374151; border: none; color: white; border-radius: 6px; cursor: pointer; font-size: 0.9rem;">← Anterior</button>
                <button id="demo-next" style="flex: 1; padding: 8px 12px; background: #3b82f6; border: none; color: white; border-radius: 6px; cursor: pointer; font-size: 0.9rem;">Siguiente →</button>
            </div>
            
            <div style="margin-top: 12px; text-align: center;">
                <span id="demo-step-counter" style="font-size: 0.8rem; color: #9ca3af;"></span>
            </div>
        `;

        document.body.appendChild(controlPanel);

        // Configurar eventos
        document.getElementById('demo-close').addEventListener('click', () => this.stopDemo());
        document.getElementById('demo-prev').addEventListener('click', () => this.previousStep());
        document.getElementById('demo-next').addEventListener('click', () => this.nextStep());

        this.updateDemoUI();
    }

    /**
     * Actualiza UI de demo
     */
    updateDemoUI() {
        const step = this.demoSteps[this.currentStep];
        const progress = ((this.currentStep + 1) / this.demoSteps.length) * 100;

        document.getElementById('demo-step-title').textContent = step.title;
        document.getElementById('demo-step-desc').textContent = step.description;
        document.getElementById('demo-progress-bar').style.width = progress + '%';
        document.getElementById('demo-step-counter').textContent = `Paso ${this.currentStep + 1} de ${this.demoSteps.length}`;

        // Habilitar/deshabilitar botones
        document.getElementById('demo-prev').disabled = this.currentStep === 0;
        document.getElementById('demo-next').disabled = this.currentStep === this.demoSteps.length - 1;
    }

    /**
     * Ejecuta paso actual
     */
    runCurrentStep() {
        const step = this.demoSteps[this.currentStep];
        console.log(`\n🎯 ${step.title}`);
        console.log(`📝 ${step.description}`);
        
        // Ejecutar acción del paso
        if (step.action) {
            step.action();
        }
    }

    /**
     * Paso siguiente
     */
    nextStep() {
        if (this.currentStep < this.demoSteps.length - 1) {
            this.currentStep++;
            this.updateDemoUI();
            this.runCurrentStep();
        }
    }

    /**
     * Paso anterior
     */
    previousStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.updateDemoUI();
            this.runCurrentStep();
        }
    }

    /**
     * Detiene demo
     */
    stopDemo() {
        this.isRunning = false;
        
        const controlPanel = document.getElementById('medication-demo-controls');
        if (controlPanel) {
            controlPanel.remove();
        }
        
        console.log('🎬 Demo finalizada');
    }

    /**
     * Demuestra mejoras visuales
     */
    showVisualImprovements() {
        const medicationSection = document.querySelector('[data-key="medicacion"]');
        if (!medicationSection) {
            this.showMessage('⚠️ Abra la sección de medicamentos para ver las mejoras', 'warning');
            return;
        }

        // Resaltar elementos mejorados
        this.highlightElement(medicationSection, 'Sección con gradiente y efectos mejorados');
        
        const header = medicationSection.querySelector('.section-header');
        if (header) {
            this.highlightElement(header, 'Header con gradiente azul y icono de medicamento');
        }

        const chips = medicationSection.querySelectorAll('.chip');
        chips.forEach((chip, index) => {
            setTimeout(() => {
                this.highlightElement(chip, `Chip ${index + 1} con diseño mejorado`);
            }, index * 200);
        });

        this.showMessage('🎨 Observe el nuevo diseño con gradientes, iconos y efectos visuales', 'info');
    }

    /**
     * Demuestra atajos de teclado
     */
    demonstrateKeyboardShortcuts() {
        this.showMessage(`
⌨️ ATAJOS DE TECLADO DISPONIBLES:

• Ctrl + M: Enfocar input de medicamentos
• Ctrl + D: Enfocar input de dosis  
• Escape: Cancelar formulario de dosis
• Enter: Mostrar sugerencias
• Delete/Backspace: Eliminar chip enfocado

¡Pruébalos ahora!`, 'info');

        // Simular Ctrl+M después de 2 segundos
        setTimeout(() => {
            if (window.MedicationEnhancements) {
                window.MedicationEnhancements.focusMedicationInput();
            }
        }, 2000);
    }

    /**
     * Demuestra animaciones
     */
    demonstrateAnimations() {
        const medicationSection = document.querySelector('[data-key="medicacion"]');
        if (!medicationSection) {
            this.showMessage('⚠️ Abra la sección de medicamentos para ver las animaciones', 'warning');
            return;
        }

        // Simular agregar medicamento para mostrar animación
        const input = medicationSection.querySelector('[id*="med-input"]');
        if (input) {
            input.value = 'Paracetamol 500mg';
            input.dispatchEvent(new Event('input', { bubbles: true }));
            
            // Simular selección de sugerencia
            setTimeout(() => {
                const suggestions = medicationSection.querySelector('[id*="med-suggestions"]');
                if (suggestions) {
                    suggestions.style.display = 'block';
                    this.showMessage('💡 Observe las animaciones suaves en sugerencias y chips', 'info');
                }
            }, 500);
        }

        this.showMessage('✨ Las animaciones incluyen: entrada de chips, hover effects, y transiciones suaves', 'info');
    }

    /**
     * Demuestra validación
     */
    demonstrateValidation() {
        const medicationSection = document.querySelector('[data-key="medicacion"]');
        if (!medicationSection) {
            this.showMessage('⚠️ Abra la sección de medicamentos para ver la validación', 'warning');
            return;
        }

        const input = medicationSection.querySelector('[id*="med-input"]');
        if (input) {
            // Simular escritura gradual
            const text = 'Aspirina';
            let currentText = '';
            
            for (let i = 0; i <= text.length; i++) {
                setTimeout(() => {
                    currentText = text.substring(0, i);
                    input.value = currentText;
                    input.dispatchEvent(new Event('input', { bubbles: true }));
                    
                    if (i === 1) {
                        this.showMessage('⚠️ Validación: Texto muy corto (amarillo)', 'warning');
                    } else if (i >= 2) {
                        this.showMessage('✅ Validación: Texto válido (verde)', 'success');
                    }
                }, i * 300);
            }
        }
    }

    /**
     * Demuestra drag & drop
     */
    demonstrateDragDrop() {
        const chips = document.querySelectorAll('.chip');
        if (chips.length === 0) {
            this.showMessage('⚠️ Agregue algunos medicamentos para probar drag & drop', 'warning');
            return;
        }

        // Resaltar chips arrastrables
        chips.forEach((chip, index) => {
            setTimeout(() => {
                chip.style.cursor = 'grab';
                chip.style.transform = 'scale(1.05)';
                chip.style.boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
                
                setTimeout(() => {
                    chip.style.transform = '';
                    chip.style.boxShadow = '';
                }, 1000);
            }, index * 200);
        });

        this.showMessage('🖱️ Los chips son arrastrables. Mantenga presionado y arrastre para reordenar', 'info');
    }

    /**
     * Demuestra tooltips
     */
    demonstrateTooltips() {
        const chips = document.querySelectorAll('.chip');
        if (chips.length === 0) {
            this.showMessage('⚠️ Agregue algunos medicamentos para ver los tooltips', 'warning');
            return;
        }

        this.showMessage('💡 Pase el mouse sobre los chips y botones para ver tooltips informativos', 'info');

        // Simular hover en primer chip
        if (chips[0]) {
            setTimeout(() => {
                const event = new MouseEvent('mouseenter', { bubbles: true });
                chips[0].dispatchEvent(event);
                
                setTimeout(() => {
                    const event = new MouseEvent('mouseleave', { bubbles: true });
                    chips[0].dispatchEvent(event);
                }, 3000);
            }, 1000);
        }
    }

    /**
     * Resalta elemento
     */
    highlightElement(element, message) {
        const originalStyle = element.style.cssText;
        
        element.style.outline = '3px solid #3b82f6';
        element.style.outlineOffset = '2px';
        element.style.position = 'relative';
        element.style.zIndex = '1000';
        
        // Crear etiqueta
        const label = document.createElement('div');
        label.className = 'demo-highlight-label';
        label.textContent = message;
        label.style.cssText = `
            position: absolute;
            top: -30px;
            left: 0;
            background: #1f2937;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8rem;
            white-space: nowrap;
            z-index: 1001;
            animation: fadeInDown 0.3s ease-out;
        `;
        
        element.appendChild(label);
        
        // Remover después de 3 segundos
        setTimeout(() => {
            element.style.cssText = originalStyle;
            if (label.parentNode) {
                label.remove();
            }
        }, 3000);
    }

    /**
     * Muestra mensaje
     */
    showMessage(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `demo-notification ${type}`;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: ${type === 'info' ? '#3b82f6' : type === 'warning' ? '#f59e0b' : type === 'success' ? '#22c55e' : '#ef4444'};
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            font-size: 0.9rem;
            z-index: 10001;
            max-width: 400px;
            text-align: center;
            white-space: pre-line;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: slideInDown 0.3s ease-out;
        `;
        
        notification.textContent = message;
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutUp 0.3s ease-in';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 4000);
    }
}

// Crear instancia global
window.MedicationDemo = new MedicationDemo();

// Agregar estilos de animación
const demoStyles = document.createElement('style');
demoStyles.textContent = `
    @keyframes fadeInDown {
        from { opacity: 0; transform: translateY(-10px); }
        to { opacity: 1; transform: translateY(0); }
    }
    
    @keyframes slideInDown {
        from { opacity: 0; transform: translateX(-50%) translateY(-20px); }
        to { opacity: 1; transform: translateX(-50%) translateY(0); }
    }
    
    @keyframes slideOutUp {
        from { opacity: 1; transform: translateX(-50%) translateY(0); }
        to { opacity: 0; transform: translateX(-50%) translateY(-20px); }
    }
`;
document.head.appendChild(demoStyles);

// Función de acceso rápido
window.startMedicationDemo = () => {
    window.MedicationDemo.startDemo();
};

console.log(`
🎬 DEMO DE MEDICAMENTOS CARGADO

🚀 PARA INICIAR LA DEMOSTRACIÓN:
window.startMedicationDemo()

o simplemente:
startMedicationDemo()

📋 PASOS DE LA DEMO:
1. 🎨 Diseño Visual Mejorado
2. ⌨️ Atajos de Teclado  
3. ✨ Animaciones Suaves
4. 🎯 Validación en Tiempo Real
5. 🖱️ Drag & Drop
6. 💡 Tooltips Informativos
`); 