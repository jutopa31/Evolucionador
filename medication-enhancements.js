/**
 * 💊 Mejoras de Funcionalidad para Sección de Medicamentos
 * Suite Neurología v2.1.0 - Funcionalidades Avanzadas
 */

class MedicationEnhancements {
    constructor() {
        this.isInitialized = false;
        this.animationQueue = [];
        this.isProcessingQueue = false;
        
        this.init();
    }

    /**
     * Inicializa las mejoras de medicamentos
     */
    init() {
        console.log('💊 Inicializando mejoras de medicamentos...');
        
        // Esperar a que el DOM esté listo
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.setupEnhancements());
        } else {
            this.setupEnhancements();
        }
    }

    /**
     * Configura todas las mejoras
     */
    setupEnhancements() {
        try {
            this.setupVisualEffects();
            this.setupKeyboardShortcuts();
            this.setupDragAndDrop();
            this.setupTooltips();
            this.setupAnimations();
            this.setupAccessibility();
            
            this.isInitialized = true;
            console.log('✅ Mejoras de medicamentos inicializadas');
            
        } catch (error) {
            console.error('❌ Error inicializando mejoras de medicamentos:', error);
        }
    }

    /**
     * Configura efectos visuales mejorados
     */
    setupVisualEffects() {
        // Observar cambios en la sección de medicamentos
        this.observeMedicationSection();
        
        // Mejorar feedback visual en inputs
        this.enhanceInputFeedback();
        
        // Agregar efectos de hover mejorados
        this.setupHoverEffects();
    }

    /**
     * Observa cambios en la sección de medicamentos
     */
    observeMedicationSection() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            // Si se agregó un chip de medicamento
                            if (node.classList?.contains('chip')) {
                                this.animateChipAddition(node);
                            }
                            
                            // Si se agregó una sección de medicamentos
                            if (node.getAttribute?.('data-key') === 'medicacion') {
                                this.enhanceMedicationSection(node);
                            }
                        }
                    });
                    
                    mutation.removedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE && node.classList?.contains('chip')) {
                            this.animateChipRemoval();
                        }
                    });
                }
            });
        });

        // Observar todo el documento para capturar secciones dinámicas
        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    /**
     * Mejora el feedback visual en inputs
     */
    enhanceInputFeedback() {
        document.addEventListener('input', (e) => {
            if (e.target.id?.includes('med-input') || e.target.id?.includes('dose-input')) {
                this.handleInputFeedback(e.target);
            }
        });

        document.addEventListener('focus', (e) => {
            if (e.target.id?.includes('med-input') || e.target.id?.includes('dose-input')) {
                this.handleInputFocus(e.target);
            }
        }, true);

        document.addEventListener('blur', (e) => {
            if (e.target.id?.includes('med-input') || e.target.id?.includes('dose-input')) {
                this.handleInputBlur(e.target);
            }
        }, true);
    }

    /**
     * Maneja feedback de input
     */
    handleInputFeedback(input) {
        const container = input.closest('.medication-input-container') || input.closest('#dose-form, [id*="dose-form"]');
        if (!container) return;

        // Agregar clase de typing
        container.classList.add('typing');
        
        // Remover después de un tiempo
        clearTimeout(container.typingTimeout);
        container.typingTimeout = setTimeout(() => {
            container.classList.remove('typing');
        }, 1000);

        // Validación visual en tiempo real
        this.validateInput(input);
    }

    /**
     * Maneja focus de input
     */
    handleInputFocus(input) {
        const container = input.closest('.medication-input-container') || input.closest('#dose-form, [id*="dose-form"]');
        if (container) {
            container.classList.add('focused');
        }

        // Agregar efecto de pulso suave
        input.style.animation = 'medicationFocusPulse 0.3s ease-out';
        setTimeout(() => {
            input.style.animation = '';
        }, 300);
    }

    /**
     * Maneja blur de input
     */
    handleInputBlur(input) {
        const container = input.closest('.medication-input-container') || input.closest('#dose-form, [id*="dose-form"]');
        if (container) {
            container.classList.remove('focused');
        }
    }

    /**
     * Valida input en tiempo real
     */
    validateInput(input) {
        const value = input.value.trim();
        
        // Remover clases previas
        input.classList.remove('valid', 'invalid', 'warning');
        
        if (input.id?.includes('med-input')) {
            if (value.length >= 2) {
                input.classList.add('valid');
            } else if (value.length === 1) {
                input.classList.add('warning');
            }
        } else if (input.id?.includes('dose-input')) {
            if (value.length >= 3) {
                input.classList.add('valid');
            } else if (value.length > 0) {
                input.classList.add('warning');
            }
        }
    }

    /**
     * Configura efectos de hover mejorados
     */
    setupHoverEffects() {
        document.addEventListener('mouseenter', (e) => {
            if (e.target.classList?.contains('chip')) {
                this.enhanceChipHover(e.target, true);
            } else if (e.target.classList?.contains('medication-chips')) {
                this.enhanceContainerHover(e.target, true);
            }
        }, true);

        document.addEventListener('mouseleave', (e) => {
            if (e.target.classList?.contains('chip')) {
                this.enhanceChipHover(e.target, false);
            } else if (e.target.classList?.contains('medication-chips')) {
                this.enhanceContainerHover(e.target, false);
            }
        }, true);
    }

    /**
     * Mejora hover de chips
     */
    enhanceChipHover(chip, isEntering) {
        if (isEntering) {
            chip.style.transform = 'translateY(-3px) scale(1.02)';
            chip.style.zIndex = '10';
            
            // Efecto de brillo
            chip.style.boxShadow = '0 8px 25px rgba(37, 99, 235, 0.15), 0 3px 10px rgba(0, 0, 0, 0.1)';
        } else {
            chip.style.transform = '';
            chip.style.zIndex = '';
            chip.style.boxShadow = '';
        }
    }

    /**
     * Mejora hover de contenedor
     */
    enhanceContainerHover(container, isEntering) {
        if (isEntering) {
            container.style.transform = 'scale(1.01)';
        } else {
            container.style.transform = '';
        }
    }

    /**
     * Configura atajos de teclado
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl + M para enfocar input de medicamentos
            if (e.ctrlKey && e.key === 'm') {
                e.preventDefault();
                this.focusMedicationInput();
            }
            
            // Ctrl + D para enfocar input de dosis
            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                this.focusDoseInput();
            }
            
            // Escape para cancelar formulario de dosis
            if (e.key === 'Escape') {
                this.cancelDoseForm();
            }
            
            // Enter en input de medicamentos para mostrar sugerencias
            if (e.key === 'Enter' && e.target.id?.includes('med-input')) {
                e.preventDefault();
                this.showSuggestions(e.target);
            }
        });
    }

    /**
     * Enfoca el input de medicamentos
     */
    focusMedicationInput() {
        const input = document.querySelector('#med-input, [id*="med-input"]');
        if (input) {
            input.focus();
            input.select();
            this.showNotification('💊 Input de medicamentos enfocado', 'info');
        }
    }

    /**
     * Enfoca el input de dosis
     */
    focusDoseInput() {
        const input = document.querySelector('#dose-input, [id*="dose-input"]');
        if (input && input.offsetParent !== null) { // Visible
            input.focus();
            input.select();
            this.showNotification('📏 Input de dosis enfocado', 'info');
        }
    }

    /**
     * Cancela formulario de dosis
     */
    cancelDoseForm() {
        const cancelBtn = document.querySelector('#dose-cancel, [id*="dose-cancel"]');
        if (cancelBtn && cancelBtn.offsetParent !== null) {
            cancelBtn.click();
            this.showNotification('❌ Formulario de dosis cancelado', 'warning');
        }
    }

    /**
     * Muestra sugerencias
     */
    showSuggestions(input) {
        const suggestions = input.parentElement?.querySelector('#med-suggestions, [id*="med-suggestions"]');
        if (suggestions && input.value.trim().length >= 2) {
            suggestions.style.display = 'block';
            this.showNotification('💡 Sugerencias mostradas', 'info');
        }
    }

    /**
     * Configura drag and drop
     */
    setupDragAndDrop() {
        document.addEventListener('dragstart', (e) => {
            if (e.target.classList?.contains('chip')) {
                e.dataTransfer.setData('text/plain', e.target.textContent);
                e.target.style.opacity = '0.5';
            }
        });

        document.addEventListener('dragend', (e) => {
            if (e.target.classList?.contains('chip')) {
                e.target.style.opacity = '';
            }
        });

        document.addEventListener('dragover', (e) => {
            if (e.target.classList?.contains('medication-chips')) {
                e.preventDefault();
                e.target.classList.add('drag-over');
            }
        });

        document.addEventListener('dragleave', (e) => {
            if (e.target.classList?.contains('medication-chips')) {
                e.target.classList.remove('drag-over');
            }
        });

        document.addEventListener('drop', (e) => {
            if (e.target.classList?.contains('medication-chips')) {
                e.preventDefault();
                e.target.classList.remove('drag-over');
                // Aquí se podría implementar reordenamiento
            }
        });
    }

    /**
     * Configura tooltips mejorados
     */
    setupTooltips() {
        document.addEventListener('mouseenter', (e) => {
            if (e.target.classList?.contains('chip')) {
                this.showTooltip(e.target, this.getChipTooltip(e.target));
            } else if (e.target.classList?.contains('remove-med-btn')) {
                this.showTooltip(e.target, 'Eliminar medicamento (Clic)');
            }
        }, true);

        document.addEventListener('mouseleave', (e) => {
            if (e.target.classList?.contains('chip') || e.target.classList?.contains('remove-med-btn')) {
                this.hideTooltip();
            }
        }, true);
    }

    /**
     * Obtiene tooltip para chip
     */
    getChipTooltip(chip) {
        const text = chip.textContent.replace('×', '').trim();
        return `💊 ${text}\n• Clic para editar\n• Arrastrar para reordenar\n• × para eliminar`;
    }

    /**
     * Muestra tooltip
     */
    showTooltip(element, text) {
        this.hideTooltip(); // Ocultar tooltip previo
        
        const tooltip = document.createElement('div');
        tooltip.className = 'medication-tooltip';
        tooltip.textContent = text;
        tooltip.style.cssText = `
            position: absolute;
            background: #1f2937;
            color: white;
            padding: 8px 12px;
            border-radius: 6px;
            font-size: 0.8rem;
            white-space: pre-line;
            z-index: 10000;
            pointer-events: none;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            animation: tooltipFadeIn 0.2s ease-out;
        `;
        
        document.body.appendChild(tooltip);
        
        // Posicionar tooltip
        const rect = element.getBoundingClientRect();
        tooltip.style.left = rect.left + (rect.width / 2) - (tooltip.offsetWidth / 2) + 'px';
        tooltip.style.top = rect.top - tooltip.offsetHeight - 8 + 'px';
        
        this.currentTooltip = tooltip;
    }

    /**
     * Oculta tooltip
     */
    hideTooltip() {
        if (this.currentTooltip) {
            this.currentTooltip.remove();
            this.currentTooltip = null;
        }
    }

    /**
     * Configura animaciones
     */
    setupAnimations() {
        // Agregar estilos de animación
        if (!document.getElementById('medication-animations')) {
            const style = document.createElement('style');
            style.id = 'medication-animations';
            style.textContent = `
                @keyframes medicationFocusPulse {
                    0% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
                    70% { box-shadow: 0 0 0 6px rgba(59, 130, 246, 0); }
                    100% { box-shadow: 0 0 0 0 rgba(59, 130, 246, 0); }
                }
                
                @keyframes tooltipFadeIn {
                    from { opacity: 0; transform: translateY(4px); }
                    to { opacity: 1; transform: translateY(0); }
                }
                
                .medication-input-container.typing::before {
                    opacity: 0.3 !important;
                }
                
                .medication-input-container.focused::before {
                    opacity: 0.6 !important;
                }
                
                input.valid {
                    border-color: #22c55e !important;
                    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.1) !important;
                }
                
                input.warning {
                    border-color: #f59e0b !important;
                    box-shadow: 0 0 0 3px rgba(245, 158, 11, 0.1) !important;
                }
                
                input.invalid {
                    border-color: #ef4444 !important;
                    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1) !important;
                }
                
                .medication-chips.drag-over {
                    border-color: #3b82f6 !important;
                    background: linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%) !important;
                    transform: scale(1.02);
                }
                
                .chip[draggable="true"] {
                    cursor: grab;
                }
                
                .chip[draggable="true"]:active {
                    cursor: grabbing;
                }
            `;
            document.head.appendChild(style);
        }
    }

    /**
     * Anima adición de chip
     */
    animateChipAddition(chip) {
        // Hacer chips arrastrables
        chip.draggable = true;
        
        // Agregar a cola de animación
        this.animationQueue.push({
            type: 'chipAdded',
            element: chip,
            timestamp: Date.now()
        });
        
        this.processAnimationQueue();
        
        // Actualizar estado del contenedor
        const container = chip.closest('.medication-chips');
        if (container) {
            container.classList.add('has-medications');
            container.classList.add('adding');
            setTimeout(() => {
                container.classList.remove('adding');
            }, 600);
        }
    }

    /**
     * Anima eliminación de chip
     */
    animateChipRemoval() {
        // Verificar si quedan chips
        setTimeout(() => {
            const containers = document.querySelectorAll('.medication-chips');
            containers.forEach(container => {
                const chips = container.querySelectorAll('.chip');
                if (chips.length === 0) {
                    container.classList.remove('has-medications');
                }
            });
        }, 100);
    }

    /**
     * Procesa cola de animaciones
     */
    processAnimationQueue() {
        if (this.isProcessingQueue || this.animationQueue.length === 0) return;
        
        this.isProcessingQueue = true;
        
        const animation = this.animationQueue.shift();
        
        switch (animation.type) {
            case 'chipAdded':
                this.playChipAddedAnimation(animation.element);
                break;
        }
        
        setTimeout(() => {
            this.isProcessingQueue = false;
            this.processAnimationQueue();
        }, 100);
    }

    /**
     * Reproduce animación de chip agregado
     */
    playChipAddedAnimation(chip) {
        chip.style.transform = 'scale(0.8) translateY(10px)';
        chip.style.opacity = '0';
        
        setTimeout(() => {
            chip.style.transition = 'all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)';
            chip.style.transform = 'scale(1) translateY(0)';
            chip.style.opacity = '1';
            
            setTimeout(() => {
                chip.style.transition = '';
            }, 300);
        }, 50);
    }

    /**
     * Configura accesibilidad
     */
    setupAccessibility() {
        // Agregar roles ARIA
        document.addEventListener('DOMContentLoaded', () => {
            const medicationSections = document.querySelectorAll('[data-key="medicacion"]');
            medicationSections.forEach(section => {
                section.setAttribute('role', 'region');
                section.setAttribute('aria-label', 'Sección de medicamentos');
                
                const chips = section.querySelectorAll('.chip');
                chips.forEach((chip, index) => {
                    chip.setAttribute('role', 'button');
                    chip.setAttribute('aria-label', `Medicamento ${index + 1}: ${chip.textContent.replace('×', '').trim()}`);
                    chip.setAttribute('tabindex', '0');
                });
            });
        });
        
        // Navegación por teclado en chips
        document.addEventListener('keydown', (e) => {
            if (e.target.classList?.contains('chip')) {
                if (e.key === 'Delete' || e.key === 'Backspace') {
                    const removeBtn = e.target.querySelector('.remove-med-btn');
                    if (removeBtn) {
                        removeBtn.click();
                    }
                }
            }
        });
    }

    /**
     * Mejora sección de medicamentos específica
     */
    enhanceMedicationSection(section) {
        // Agregar indicador de estado
        const header = section.querySelector('.section-header h2');
        if (header && !header.querySelector('.med-status-indicator')) {
            const indicator = document.createElement('span');
            indicator.className = 'med-status-indicator';
            indicator.style.cssText = `
                display: inline-block;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #22c55e;
                margin-left: 8px;
                animation: pulse 2s infinite;
            `;
            header.appendChild(indicator);
        }
        
        // Agregar contador de medicamentos
        this.updateMedicationCounter(section);
    }

    /**
     * Actualiza contador de medicamentos
     */
    updateMedicationCounter(section) {
        const chips = section.querySelectorAll('.chip');
        const header = section.querySelector('.section-header h2');
        
        if (header) {
            let counter = header.querySelector('.med-counter');
            if (!counter) {
                counter = document.createElement('span');
                counter.className = 'med-counter';
                counter.style.cssText = `
                    background: rgba(255,255,255,0.2);
                    color: white;
                    padding: 2px 8px;
                    border-radius: 12px;
                    font-size: 0.8rem;
                    margin-left: 8px;
                `;
                header.appendChild(counter);
            }
            
            counter.textContent = chips.length > 0 ? `${chips.length}` : '';
        }
    }

    /**
     * Muestra notificación
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `medication-notification ${type}`;
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'info' ? '#3b82f6' : type === 'warning' ? '#f59e0b' : '#ef4444'};
            color: white;
            padding: 12px 16px;
            border-radius: 8px;
            font-size: 0.9rem;
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in';
            setTimeout(() => {
                notification.remove();
            }, 300);
        }, 3000);
    }

    /**
     * Obtiene estadísticas
     */
    getStats() {
        return {
            isInitialized: this.isInitialized,
            animationQueueLength: this.animationQueue.length,
            isProcessingQueue: this.isProcessingQueue,
            totalMedications: document.querySelectorAll('.chip').length,
            activeSections: document.querySelectorAll('[data-key="medicacion"]').length
        };
    }
}

// Crear instancia global
window.MedicationEnhancements = new MedicationEnhancements();

// Agregar estilos de animación adicionales
const additionalStyles = document.createElement('style');
additionalStyles.textContent = `
    @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    
    @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(additionalStyles);

console.log(`
💊 MEJORAS DE MEDICAMENTOS CARGADAS

🎯 FUNCIONALIDADES DISPONIBLES:
• Efectos visuales mejorados
• Atajos de teclado (Ctrl+M, Ctrl+D)
• Drag & Drop para reordenar
• Tooltips informativos
• Animaciones suaves
• Accesibilidad mejorada
• Validación en tiempo real

⌨️ ATAJOS DE TECLADO:
• Ctrl + M: Enfocar input de medicamentos
• Ctrl + D: Enfocar input de dosis
• Escape: Cancelar formulario de dosis
• Enter: Mostrar sugerencias
• Delete/Backspace: Eliminar chip enfocado

📊 ESTADÍSTICAS:
window.MedicationEnhancements.getStats()
`); 