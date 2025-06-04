/**
 * 🎨 Demo de Secciones Unificadas
 * Suite Neurología v2.1.0 - Demostración Interactiva
 */

class UnifiedSectionsDemo {
    constructor() {
        this.isRunning = false;
        this.currentStep = 0;
        this.demoSteps = [
            {
                title: '🎨 Diseño Visual Moderno',
                description: 'Cada sección tiene su propio gradiente temático y efectos visuales',
                action: () => this.demonstrateVisualDesign()
            },
            {
                title: '📊 Contadores en Tiempo Real',
                description: 'Contadores de palabras y caracteres que se actualizan mientras escribes',
                action: () => this.demonstrateCounters()
            },
            {
                title: '🔄 Colapso y Expansión',
                description: 'Secciones colapsables con animaciones suaves',
                action: () => this.demonstrateToggle()
            },
            {
                title: '💾 Auto-Save Inteligente',
                description: 'Guardado automático con indicadores visuales',
                action: () => this.demonstrateAutoSave()
            },
            {
                title: '⌨️ Atajos de Teclado',
                description: 'Navegación rápida y eficiente por teclado',
                action: () => this.demonstrateKeyboardShortcuts()
            },
            {
                title: '📱 Diseño Responsive',
                description: 'Adaptación perfecta a cualquier tamaño de pantalla',
                action: () => this.demonstrateResponsive()
            }
        ];
        
        this.init();
    }

    /**
     * Inicializa la demostración
     */
    init() {
        console.log('🎨 Demo de Secciones Unificadas inicializada');
        this.createDemoControls();
        this.setupEventListeners();
    }

    /**
     * Crea controles de demostración
     */
    createDemoControls() {
        // Verificar si ya existen los controles
        if (document.getElementById('unified-demo-controls')) return;

        const demoPanel = document.createElement('div');
        demoPanel.id = 'unified-demo-controls';
        demoPanel.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            width: 320px;
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            border: 1px solid #475569;
            border-radius: 12px;
            padding: 20px;
            box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
            z-index: 1000;
            color: white;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            backdrop-filter: blur(10px);
            transform: translateX(340px);
            transition: transform 0.3s ease;
        `;

        demoPanel.innerHTML = `
            <div style="display: flex; align-items: center; margin-bottom: 16px;">
                <h3 style="margin: 0; font-size: 1.1rem; font-weight: 600; color: #f1f5f9;">
                    🎨 Demo Secciones Unificadas
                </h3>
                <button id="demo-toggle" style="
                    margin-left: auto;
                    background: rgba(255,255,255,0.1);
                    border: 1px solid rgba(255,255,255,0.2);
                    color: white;
                    padding: 4px 8px;
                    border-radius: 6px;
                    cursor: pointer;
                    font-size: 0.8rem;
                ">◀</button>
            </div>
            
            <div id="demo-content">
                <div style="margin-bottom: 16px;">
                    <div style="font-size: 0.9rem; color: #cbd5e1; margin-bottom: 8px;">
                        Paso <span id="demo-step">1</span> de ${this.demoSteps.length}
                    </div>
                    <div style="background: rgba(255,255,255,0.1); height: 4px; border-radius: 2px; overflow: hidden;">
                        <div id="demo-progress" style="
                            background: linear-gradient(90deg, #22c55e, #16a34a);
                            height: 100%;
                            width: 0%;
                            transition: width 0.3s ease;
                        "></div>
                    </div>
                </div>
                
                <div id="demo-step-info">
                    <h4 id="demo-title" style="margin: 0 0 8px 0; font-size: 1rem; color: #f8fafc;"></h4>
                    <p id="demo-description" style="margin: 0 0 16px 0; font-size: 0.85rem; color: #cbd5e1; line-height: 1.4;"></p>
                </div>
                
                <div style="display: flex; gap: 8px;">
                    <button id="demo-prev" style="
                        flex: 1;
                        background: rgba(255,255,255,0.1);
                        border: 1px solid rgba(255,255,255,0.2);
                        color: white;
                        padding: 8px 12px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 0.85rem;
                        transition: all 0.2s ease;
                    " disabled>← Anterior</button>
                    
                    <button id="demo-next" style="
                        flex: 1;
                        background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
                        border: none;
                        color: white;
                        padding: 8px 12px;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 0.85rem;
                        font-weight: 500;
                        transition: all 0.2s ease;
                    ">Siguiente →</button>
                </div>
                
                <div style="margin-top: 16px; padding-top: 16px; border-top: 1px solid rgba(255,255,255,0.1);">
                    <div style="font-size: 0.8rem; color: #94a3b8; margin-bottom: 8px;">Atajos rápidos:</div>
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 4px; font-size: 0.75rem; color: #cbd5e1;">
                        <div>Alt + 1-9: Navegar</div>
                        <div>Ctrl + E: Toggle</div>
                        <div>Ctrl + S: Guardar</div>
                        <div>Ctrl + D: Demo</div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(demoPanel);
        
        // Mostrar panel después de un momento
        setTimeout(() => {
            demoPanel.style.transform = 'translateX(0)';
        }, 500);

        this.updateDemoStep();
    }

    /**
     * Configura event listeners
     */
    setupEventListeners() {
        // Toggle del panel
        document.addEventListener('click', (e) => {
            if (e.target.id === 'demo-toggle') {
                this.toggleDemoPanel();
            }
        });

        // Navegación de la demo
        document.addEventListener('click', (e) => {
            if (e.target.id === 'demo-next') {
                this.nextStep();
            } else if (e.target.id === 'demo-prev') {
                this.prevStep();
            }
        });

        // Atajo de teclado para mostrar/ocultar demo
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                this.toggleDemoPanel();
            }
        });

        // Hover effects para botones
        document.addEventListener('mouseover', (e) => {
            if (e.target.id === 'demo-next') {
                e.target.style.transform = 'translateY(-1px)';
                e.target.style.boxShadow = '0 4px 12px rgba(34, 197, 94, 0.3)';
            } else if (e.target.id === 'demo-prev' && !e.target.disabled) {
                e.target.style.background = 'rgba(255,255,255,0.2)';
            }
        });

        document.addEventListener('mouseout', (e) => {
            if (e.target.id === 'demo-next') {
                e.target.style.transform = '';
                e.target.style.boxShadow = '';
            } else if (e.target.id === 'demo-prev') {
                e.target.style.background = 'rgba(255,255,255,0.1)';
            }
        });
    }

    /**
     * Alterna visibilidad del panel de demo
     */
    toggleDemoPanel() {
        const panel = document.getElementById('unified-demo-controls');
        const toggle = document.getElementById('demo-toggle');
        
        if (!panel) return;

        const isVisible = panel.style.transform === 'translateX(0px)';
        
        if (isVisible) {
            panel.style.transform = 'translateX(340px)';
            toggle.innerHTML = '▶';
        } else {
            panel.style.transform = 'translateX(0)';
            toggle.innerHTML = '◀';
        }
    }

    /**
     * Siguiente paso de la demo
     */
    nextStep() {
        if (this.currentStep < this.demoSteps.length - 1) {
            this.currentStep++;
            this.updateDemoStep();
            this.runCurrentStep();
        } else if (this.currentStep === this.demoSteps.length - 1) {
            // Estamos en el último paso, finalizar demo
            this.finishDemo();
        }
    }

    /**
     * Paso anterior de la demo
     */
    prevStep() {
        if (this.currentStep > 0) {
            this.currentStep--;
            this.updateDemoStep();
            this.runCurrentStep();
        }
    }

    /**
     * Actualiza la información del paso actual
     */
    updateDemoStep() {
        const stepElement = document.getElementById('demo-step');
        const titleElement = document.getElementById('demo-title');
        const descriptionElement = document.getElementById('demo-description');
        const progressElement = document.getElementById('demo-progress');
        const prevButton = document.getElementById('demo-prev');
        const nextButton = document.getElementById('demo-next');

        if (!stepElement) return;

        const currentStepData = this.demoSteps[this.currentStep];
        
        stepElement.textContent = this.currentStep + 1;
        titleElement.textContent = currentStepData.title;
        descriptionElement.textContent = currentStepData.description;
        
        const progress = ((this.currentStep + 1) / this.demoSteps.length) * 100;
        progressElement.style.width = `${progress}%`;
        
        // Actualizar botones
        prevButton.disabled = this.currentStep === 0;
        prevButton.style.opacity = this.currentStep === 0 ? '0.5' : '1';
        prevButton.style.cursor = this.currentStep === 0 ? 'not-allowed' : 'pointer';
        
        if (this.currentStep === this.demoSteps.length - 1) {
            nextButton.textContent = '🎉 Finalizar';
        } else {
            nextButton.textContent = 'Siguiente →';
        }
    }

    /**
     * Ejecuta el paso actual
     */
    runCurrentStep() {
        const currentStepData = this.demoSteps[this.currentStep];
        if (currentStepData.action) {
            currentStepData.action();
        }
    }

    /**
     * Demuestra el diseño visual
     */
    demonstrateVisualDesign() {
        console.log('🎨 Demostrando diseño visual...');
        
        const sections = document.querySelectorAll('.section');
        sections.forEach((section, index) => {
            setTimeout(() => {
                // Efecto de highlight
                section.style.transform = 'scale(1.02)';
                section.style.boxShadow = '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 3px rgba(59, 130, 246, 0.1)';
                
                setTimeout(() => {
                    section.style.transform = '';
                    section.style.boxShadow = '';
                }, 1000);
            }, index * 200);
        });
        
        this.showToast('🎨 Observa los gradientes únicos de cada sección');
    }

    /**
     * Demuestra los contadores
     */
    demonstrateCounters() {
        console.log('📊 Demostrando contadores...');
        
        const firstTextarea = document.querySelector('.section textarea');
        if (firstTextarea) {
            const originalValue = firstTextarea.value;
            firstTextarea.value = '';
            
            const demoText = 'Este es un texto de demostración para mostrar cómo funcionan los contadores en tiempo real. Observa cómo se actualizan los números mientras escribo...';
            
            let i = 0;
            const typeInterval = setInterval(() => {
                if (i < demoText.length) {
                    firstTextarea.value += demoText[i];
                    firstTextarea.dispatchEvent(new Event('input', { bubbles: true }));
                    i++;
                } else {
                    clearInterval(typeInterval);
                    setTimeout(() => {
                        firstTextarea.value = originalValue;
                        firstTextarea.dispatchEvent(new Event('input', { bubbles: true }));
                    }, 2000);
                }
            }, 50);
        }
        
        this.showToast('📊 Los contadores se actualizan en tiempo real');
    }

    /**
     * Demuestra toggle de secciones
     */
    demonstrateToggle() {
        console.log('🔄 Demostrando colapso/expansión...');
        
        const sections = document.querySelectorAll('.section');
        sections.forEach((section, index) => {
            setTimeout(() => {
                if (window.UnifiedSectionsEnhancements) {
                    window.UnifiedSectionsEnhancements.toggleSection(section);
                    
                    setTimeout(() => {
                        window.UnifiedSectionsEnhancements.toggleSection(section);
                    }, 1000);
                }
            }, index * 300);
        });
        
        this.showToast('🔄 Secciones colapsables con animaciones suaves');
    }

    /**
     * Demuestra auto-save
     */
    demonstrateAutoSave() {
        console.log('💾 Demostrando auto-save...');
        
        const firstSection = document.querySelector('.section');
        if (firstSection && window.UnifiedSectionsEnhancements) {
            // Simular modificación
            window.UnifiedSectionsEnhancements.markAsModified(firstSection);
            
            setTimeout(() => {
                // Simular guardado
                window.UnifiedSectionsEnhancements.autoSaveSection(firstSection);
            }, 2000);
        }
        
        this.showToast('💾 Auto-save cada 30 segundos con indicadores visuales');
    }

    /**
     * Demuestra atajos de teclado
     */
    demonstrateKeyboardShortcuts() {
        console.log('⌨️ Demostrando atajos de teclado...');
        
        this.showToast('⌨️ Prueba: Alt+1-9 (navegar), Ctrl+E (toggle), Ctrl+S (guardar)', 4000);
        
        // Simular navegación por secciones
        const sections = document.querySelectorAll('.section');
        sections.forEach((section, index) => {
            setTimeout(() => {
                section.scrollIntoView({ behavior: 'smooth', block: 'center' });
                section.style.outline = '2px solid #3b82f6';
                
                setTimeout(() => {
                    section.style.outline = '';
                }, 800);
            }, index * 1000);
        });
    }

    /**
     * Demuestra diseño responsive
     */
    demonstrateResponsive() {
        console.log('📱 Demostrando diseño responsive...');
        
        const body = document.body;
        const originalWidth = body.style.width;
        
        // Simular vista móvil
        body.style.width = '375px';
        body.style.margin = '0 auto';
        body.style.transition = 'all 0.5s ease';
        
        this.showToast('📱 Simulando vista móvil...');
        
        setTimeout(() => {
            // Volver a vista normal
            body.style.width = originalWidth;
            body.style.margin = '';
            this.showToast('🖥️ Volviendo a vista desktop');
        }, 3000);
    }

    /**
     * Muestra un toast de notificación
     */
    showToast(message, duration = 2500) {
        // Remover toast anterior si existe
        const existingToast = document.getElementById('demo-toast');
        if (existingToast) {
            existingToast.remove();
        }

        const toast = document.createElement('div');
        toast.id = 'demo-toast';
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%) translateY(100px);
            background: linear-gradient(135deg, #1e293b 0%, #334155 100%);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            z-index: 1001;
            font-size: 0.9rem;
            font-weight: 500;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            transition: transform 0.3s ease;
            max-width: 400px;
            text-align: center;
        `;
        
        toast.textContent = message;
        document.body.appendChild(toast);
        
        // Animar entrada
        setTimeout(() => {
            toast.style.transform = 'translateX(-50%) translateY(0)';
        }, 10);
        
        // Animar salida
        setTimeout(() => {
            toast.style.transform = 'translateX(-50%) translateY(100px)';
            setTimeout(() => {
                toast.remove();
            }, 300);
        }, duration);
    }

    /**
     * Inicia la demo automática
     */
    startAutoDemo() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.currentStep = 0;
        this.updateDemoStep();
        
        const runNextStep = () => {
            if (this.currentStep < this.demoSteps.length && this.isRunning) {
                this.runCurrentStep();
                this.currentStep++;
                this.updateDemoStep();
                
                setTimeout(runNextStep, 4000);
            } else {
                this.isRunning = false;
                this.showToast('🎉 Demo completada! Explora las funcionalidades');
            }
        };
        
        runNextStep();
    }

    /**
     * Detiene la demo automática
     */
    stopAutoDemo() {
        this.isRunning = false;
    }

    /**
     * Obtiene estadísticas de la demo
     */
    getStats() {
        return {
            isRunning: this.isRunning,
            currentStep: this.currentStep,
            totalSteps: this.demoSteps.length,
            progress: ((this.currentStep + 1) / this.demoSteps.length) * 100
        };
    }

    /**
     * Finaliza la demo
     */
    finishDemo() {
        this.isRunning = false;
        this.currentStep = 0;
        
        // Eliminar panel de demo completamente del DOM
        const demoPanel = document.getElementById('unified-demo-controls');
        if (demoPanel) {
            demoPanel.style.display = 'none';
            demoPanel.style.visibility = 'hidden';
            demoPanel.style.opacity = '0';
            demoPanel.style.transform = 'translateX(400px)';
            demoPanel.remove(); // Eliminar completamente del DOM
        }
        
        // Eliminar cualquier elemento relacionado con la demo
        const demoElements = document.querySelectorAll('[id*="demo"], [class*="demo"], .demo-toast, #demo-toast');
        demoElements.forEach(element => {
            element.remove();
        });
        
        // Limpiar highlights y estilos aplicados
        this.clearHighlights();
        
        // Limpiar estilos del body
        const body = document.body;
        body.style.width = '';
        body.style.margin = '';
        body.style.transition = '';
        
        // Limpiar cualquier interval o timeout activo
        if (this.demoInterval) {
            clearInterval(this.demoInterval);
            this.demoInterval = null;
        }
        
        if (this.demoTimeout) {
            clearTimeout(this.demoTimeout);
            this.demoTimeout = null;
        }
        
        // Eliminar event listeners específicos de la demo
        document.removeEventListener('keydown', this.demoKeyHandler);
        
        // Limpiar la instancia global
        if (window.UnifiedSectionsDemo) {
            delete window.UnifiedSectionsDemo;
        }
        
        console.log('🎯 Demo de secciones unificadas finalizada y completamente eliminada');
        
        // Mostrar mensaje final
        const finalToast = document.createElement('div');
        finalToast.style.cssText = `
            position: fixed;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: linear-gradient(135deg, #22c55e 0%, #16a34a 100%);
            color: white;
            padding: 12px 20px;
            border-radius: 8px;
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            z-index: 1001;
            font-size: 0.9rem;
            font-weight: 500;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255, 255, 255, 0.1);
            max-width: 400px;
            text-align: center;
        `;
        
        finalToast.textContent = '🎉 Demo completada! Todas las funcionalidades están activas';
        document.body.appendChild(finalToast);
        
        // Eliminar el toast final después de 3 segundos
        setTimeout(() => {
            if (finalToast && finalToast.parentNode) {
                finalToast.remove();
            }
        }, 3000);
    }

    /**
     * Limpia highlights de las secciones
     */
    clearHighlights() {
        const sections = document.querySelectorAll('.section');
        sections.forEach(section => {
            section.style.transform = '';
            section.style.boxShadow = '';
            section.style.outline = '';
            section.style.border = '';
            section.classList.remove('highlight');
        });
    }
}

// Crear instancia global
window.UnifiedSectionsDemo = new UnifiedSectionsDemo();

console.log(`
🎨 DEMO DE SECCIONES UNIFICADAS CARGADA

🎯 CONTROLES DISPONIBLES:
• Panel de demo en la esquina superior derecha
• Navegación paso a paso con botones
• Ctrl + D para mostrar/ocultar panel

🎬 PASOS DE LA DEMO:
1. 🎨 Diseño Visual Moderno
2. 📊 Contadores en Tiempo Real  
3. 🔄 Colapso y Expansión
4. 💾 Auto-Save Inteligente
5. ⌨️ Atajos de Teclado
6. 📱 Diseño Responsive

📊 ESTADÍSTICAS:
window.UnifiedSectionsDemo.getStats()

🚀 DEMO AUTOMÁTICA:
window.UnifiedSectionsDemo.startAutoDemo()
`); 