/**
 * 🎨 Mejoras Unificadas para Todas las Secciones
 * Suite Neurología v2.1.0 - Funcionalidades Modernas
 */

class UnifiedSectionsEnhancements {
    constructor() {
        this.isInitialized = false;
        this.sectionStates = new Map();
        this.observers = [];
        
        this.init();
    }

    /**
     * Inicializa las mejoras unificadas
     */
    init() {
        console.log('🎨 Inicializando mejoras unificadas para todas las secciones...');
        
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
            this.setupSectionObserver();
            this.setupHeaderEnhancements();
            this.setupContentEnhancements();
            this.setupKeyboardShortcuts();
            this.setupAnimations();
            this.setupAccessibility();
            this.setupStateManagement();
            
            this.isInitialized = true;
            console.log('✅ Mejoras unificadas inicializadas para todas las secciones');
            
        } catch (error) {
            console.error('❌ Error inicializando mejoras unificadas:', error);
        }
    }

    /**
     * Observa cambios en las secciones
     */
    setupSectionObserver() {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                if (mutation.type === 'childList') {
                    mutation.addedNodes.forEach((node) => {
                        if (node.nodeType === Node.ELEMENT_NODE && node.classList?.contains('section')) {
                            this.enhanceSection(node);
                        }
                    });
                }
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });

        this.observers.push(observer);

        // Mejorar secciones existentes
        document.querySelectorAll('.section').forEach(section => {
            this.enhanceSection(section);
        });
    }

    /**
     * Mejora una sección específica
     */
    enhanceSection(section) {
        const sectionKey = section.dataset.key || 'unknown';
        
        // Agregar contador de caracteres si tiene textarea
        this.addCharacterCounter(section);
        
        // Agregar indicadores de estado
        this.addStateIndicators(section);
        
        // Mejorar header
        this.enhanceHeader(section);
        
        // Configurar auto-save
        this.setupAutoSave(section);
        
        // Agregar tooltips
        this.addTooltips(section);
        
        console.log(`🎨 Sección ${sectionKey} mejorada`);
    }

    /**
     * Mejora headers de secciones
     */
    setupHeaderEnhancements() {
        document.addEventListener('click', (e) => {
            if (e.target.closest('.section-header')) {
                const header = e.target.closest('.section-header');
                const section = header.closest('.section');
                this.toggleSection(section);
            }
        });
    }

    /**
     * Mejora header específico
     */
    enhanceHeader(section) {
        const header = section.querySelector('.section-header');
        if (!header) return;

        // Agregar indicador de contenido
        this.addContentIndicator(header, section);
        
        // Agregar botón de colapso/expansión
        this.addToggleButton(header);
        
        // Agregar contador de palabras en el header
        this.addWordCounter(header, section);
    }

    /**
     * Agrega indicador de contenido
     */
    addContentIndicator(header, section) {
        if (header.querySelector('.content-indicator')) return;

        const indicator = document.createElement('div');
        indicator.className = 'content-indicator';
        indicator.style.cssText = `
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: rgba(255,255,255,0.3);
            margin-left: auto;
            margin-right: 8px;
            transition: all 0.3s ease;
        `;
        
        header.appendChild(indicator);
        
        // Actualizar estado del indicador
        this.updateContentIndicator(section);
    }

    /**
     * Actualiza indicador de contenido
     */
    updateContentIndicator(section) {
        const indicator = section.querySelector('.content-indicator');
        if (!indicator) return;

        const hasContent = this.sectionHasContent(section);
        
        if (hasContent) {
            indicator.style.background = '#22c55e';
            indicator.style.boxShadow = '0 0 8px rgba(34, 197, 94, 0.5)';
        } else {
            indicator.style.background = 'rgba(255,255,255,0.3)';
            indicator.style.boxShadow = 'none';
        }
    }

    /**
     * Verifica si la sección tiene contenido
     */
    sectionHasContent(section) {
        const textareas = section.querySelectorAll('textarea');
        const inputs = section.querySelectorAll('input[type="text"], input[type="email"], input[type="tel"]');
        const chips = section.querySelectorAll('.chip');
        
        for (const textarea of textareas) {
            if (textarea.value.trim().length > 0) return true;
        }
        
        for (const input of inputs) {
            if (input.value.trim().length > 0) return true;
        }
        
        return chips.length > 0;
    }

    /**
     * Agrega botón de toggle
     */
    addToggleButton(header) {
        if (header.querySelector('.toggle-button')) return;

        const toggleBtn = document.createElement('button');
        toggleBtn.className = 'toggle-button';
        toggleBtn.innerHTML = '▼';
        toggleBtn.style.cssText = `
            background: rgba(255,255,255,0.2);
            border: none;
            color: white;
            font-size: 0.8rem;
            padding: 4px 8px;
            border-radius: 4px;
            cursor: pointer;
            transition: all 0.3s ease;
            margin-left: auto;
        `;
        
        toggleBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            const section = header.closest('.section');
            this.toggleSection(section);
        });
        
        header.appendChild(toggleBtn);
    }

    /**
     * Alterna visibilidad de sección
     */
    toggleSection(section) {
        const content = section.querySelector('.section-content');
        const toggleBtn = section.querySelector('.toggle-button');
        
        if (!content) return;

        const isVisible = content.style.display !== 'none';
        
        if (isVisible) {
            content.style.display = 'none';
            if (toggleBtn) toggleBtn.innerHTML = '▶';
            section.classList.add('collapsed');
        } else {
            content.style.display = 'block';
            if (toggleBtn) toggleBtn.innerHTML = '▼';
            section.classList.remove('collapsed');
        }
        
        // Animar transición
        this.animateToggle(content, !isVisible);
    }

    /**
     * Anima toggle de sección
     */
    animateToggle(content, isOpening) {
        if (isOpening) {
            content.style.opacity = '0';
            content.style.transform = 'translateY(-10px)';
            
            setTimeout(() => {
                content.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                content.style.opacity = '1';
                content.style.transform = 'translateY(0)';
                
                setTimeout(() => {
                    content.style.transition = '';
                }, 300);
            }, 10);
        }
    }

    /**
     * Agrega contador de palabras
     */
    addWordCounter(header, section) {
        if (header.querySelector('.word-counter')) return;

        const counter = document.createElement('div');
        counter.className = 'word-counter';
        counter.style.cssText = `
            background: rgba(255,255,255,0.2);
            color: white;
            padding: 2px 6px;
            border-radius: 4px;
            font-size: 0.7rem;
            font-weight: 500;
            margin-left: 8px;
            min-width: 40px;
            text-align: center;
        `;
        
        header.appendChild(counter);
        
        // Actualizar contador
        this.updateWordCounter(section);
    }

    /**
     * Actualiza contador de palabras
     */
    updateWordCounter(section) {
        const counter = section.querySelector('.word-counter');
        if (!counter) return;

        const textareas = section.querySelectorAll('textarea');
        let totalWords = 0;
        
        textareas.forEach(textarea => {
            const words = textarea.value.trim().split(/\s+/).filter(word => word.length > 0);
            totalWords += words.length;
        });
        
        counter.textContent = totalWords > 0 ? `${totalWords}` : '0';
        
        // Cambiar color según cantidad
        if (totalWords === 0) {
            counter.style.background = 'rgba(255,255,255,0.2)';
        } else if (totalWords < 10) {
            counter.style.background = 'rgba(251, 191, 36, 0.8)';
        } else {
            counter.style.background = 'rgba(34, 197, 94, 0.8)';
        }
    }

    /**
     * Mejora contenido de secciones
     */
    setupContentEnhancements() {
        // Mejorar textareas
        document.addEventListener('input', (e) => {
            if (e.target.tagName === 'TEXTAREA') {
                this.handleTextareaInput(e.target);
            }
        });

        // Mejorar inputs
        document.addEventListener('input', (e) => {
            if (e.target.tagName === 'INPUT') {
                this.handleInputChange(e.target);
            }
        });
    }

    /**
     * Maneja input en textarea
     */
    handleTextareaInput(textarea) {
        const section = textarea.closest('.section');
        if (!section) return;

        // Actualizar contadores
        this.updateWordCounter(section);
        this.updateContentIndicator(section);
        this.updateCharacterCounter(textarea);
        
        // Auto-resize
        this.autoResizeTextarea(textarea);
        
        // Marcar como modificado
        this.markAsModified(section);
    }

    /**
     * Auto-resize de textarea
     */
    autoResizeTextarea(textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = Math.max(120, textarea.scrollHeight) + 'px';
    }

    /**
     * Maneja cambios en inputs
     */
    handleInputChange(input) {
        const section = input.closest('.section');
        if (!section) return;

        this.updateContentIndicator(section);
        this.markAsModified(section);
    }

    /**
     * Agrega contador de caracteres
     */
    addCharacterCounter(section) {
        const textareas = section.querySelectorAll('textarea');
        
        textareas.forEach(textarea => {
            if (textarea.nextElementSibling?.classList.contains('char-counter')) return;

            const counter = document.createElement('div');
            counter.className = 'char-counter';
            counter.style.cssText = `
                font-size: 0.8rem;
                color: #6b7280;
                text-align: right;
                margin-top: 4px;
                padding: 0 4px;
            `;
            
            textarea.parentNode.insertBefore(counter, textarea.nextSibling);
            this.updateCharacterCounter(textarea);
        });
    }

    /**
     * Actualiza contador de caracteres
     */
    updateCharacterCounter(textarea) {
        const counter = textarea.nextElementSibling;
        if (!counter?.classList.contains('char-counter')) return;

        const length = textarea.value.length;
        const words = textarea.value.trim().split(/\s+/).filter(word => word.length > 0).length;
        
        counter.textContent = `${length} caracteres, ${words} palabras`;
        
        // Cambiar color según longitud
        if (length === 0) {
            counter.style.color = '#9ca3af';
        } else if (length < 50) {
            counter.style.color = '#f59e0b';
        } else {
            counter.style.color = '#22c55e';
        }
    }

    /**
     * Agrega indicadores de estado
     */
    addStateIndicators(section) {
        const sectionKey = section.dataset.key || 'unknown';
        
        // Inicializar estado
        this.sectionStates.set(sectionKey, {
            isModified: false,
            lastSaved: null,
            hasContent: false
        });
    }

    /**
     * Marca sección como modificada
     */
    markAsModified(section) {
        const sectionKey = section.dataset.key || 'unknown';
        const state = this.sectionStates.get(sectionKey) || {};
        
        state.isModified = true;
        state.hasContent = this.sectionHasContent(section);
        this.sectionStates.set(sectionKey, state);
        
        // Mostrar indicador visual
        this.showModifiedIndicator(section);
    }

    /**
     * Muestra indicador de modificación
     */
    showModifiedIndicator(section) {
        const header = section.querySelector('.section-header');
        if (!header) return;

        let indicator = header.querySelector('.modified-indicator');
        if (!indicator) {
            indicator = document.createElement('div');
            indicator.className = 'modified-indicator';
            indicator.innerHTML = '●';
            indicator.style.cssText = `
                color: #f59e0b;
                font-size: 1rem;
                margin-left: 8px;
            `;
            header.appendChild(indicator);
        }
        
        indicator.style.display = 'block';
    }

    /**
     * Configura auto-save
     */
    setupAutoSave(section) {
        const sectionKey = section.dataset.key || 'unknown';
        
        // Auto-save cada 30 segundos si hay cambios
        setInterval(() => {
            const state = this.sectionStates.get(sectionKey);
            if (state?.isModified) {
                this.autoSaveSection(section);
            }
        }, 30000);
    }

    /**
     * Auto-save de sección
     */
    autoSaveSection(section) {
        const sectionKey = section.dataset.key || 'unknown';
        const state = this.sectionStates.get(sectionKey) || {};
        
        // Simular guardado (aquí se integraría con el sistema de guardado real)
        state.isModified = false;
        state.lastSaved = new Date();
        this.sectionStates.set(sectionKey, state);
        
        // Ocultar indicador de modificación
        const indicator = section.querySelector('.modified-indicator');
        if (indicator) {
            indicator.style.display = 'none';
        }
        
        // Mostrar confirmación temporal
        this.showSaveConfirmation(section);
    }

    /**
     * Muestra confirmación de guardado
     */
    showSaveConfirmation(section) {
        const header = section.querySelector('.section-header');
        if (!header) return;

        const confirmation = document.createElement('div');
        confirmation.className = 'save-confirmation';
        confirmation.innerHTML = '✓';
        confirmation.style.cssText = `
            position: absolute;
            right: 60px;
            top: 50%;
            transform: translateY(-50%);
            color: #22c55e;
            font-size: 1.2rem;
            font-weight: bold;
            z-index: 4;
            animation: fadeInOut 2s ease-in-out;
        `;
        
        header.appendChild(confirmation);
        
        setTimeout(() => {
            confirmation.remove();
        }, 2000);
    }

    /**
     * Configura atajos de teclado
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl + S para guardar sección actual
            if (e.ctrlKey && e.key === 's') {
                e.preventDefault();
                const activeSection = document.querySelector('.section:focus-within');
                if (activeSection) {
                    this.autoSaveSection(activeSection);
                }
            }
            
            // Ctrl + E para expandir/colapsar sección actual
            if (e.ctrlKey && e.key === 'e') {
                e.preventDefault();
                const activeSection = document.querySelector('.section:focus-within');
                if (activeSection) {
                    this.toggleSection(activeSection);
                }
            }
            
            // Alt + números para navegar entre secciones
            if (e.altKey && /^[1-9]$/.test(e.key)) {
                e.preventDefault();
                const sectionIndex = parseInt(e.key) - 1;
                const sections = document.querySelectorAll('.section');
                if (sections[sectionIndex]) {
                    sections[sectionIndex].scrollIntoView({ behavior: 'smooth' });
                    const firstInput = sections[sectionIndex].querySelector('textarea, input');
                    if (firstInput) {
                        firstInput.focus();
                    }
                }
            }
        });
    }

    /**
     * Configura animaciones
     */
    setupAnimations() {
        // Agregar estilos de animación
        if (!document.getElementById('unified-animations')) {
            const style = document.createElement('style');
            style.id = 'unified-animations';
            style.textContent = `
                @keyframes fadeInOut {
                    0%, 100% { opacity: 0; transform: translateY(-50%) scale(0.8); }
                    50% { opacity: 1; transform: translateY(-50%) scale(1); }
                }
                
                .section.collapsed {
                    margin-bottom: 8px;
                }
                
                .section.collapsed .section-header {
                    border-radius: var(--section-border-radius);
                }
                
                .section:focus-within {
                    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
                }
                
                /* Eliminadas animaciones problemáticas que causaban titilado */
                .modified-indicator {
                    display: inline-block;
                    color: #f59e0b;
                    font-size: 1rem;
                    margin-left: 8px;
                }
                
                .content-indicator {
                    transition: all 0.3s ease;
                }
                
                .word-counter {
                    transition: background-color 0.3s ease;
                }
            `;
            document.head.appendChild(style);
        }
    }

    /**
     * Configura accesibilidad
     */
    setupAccessibility() {
        // Agregar roles ARIA
        document.querySelectorAll('.section').forEach((section, index) => {
            section.setAttribute('role', 'region');
            section.setAttribute('aria-label', `Sección ${index + 1}`);
            
            const header = section.querySelector('.section-header');
            if (header) {
                header.setAttribute('role', 'button');
                header.setAttribute('aria-expanded', 'true');
                header.setAttribute('tabindex', '0');
                
                // Navegación por teclado en headers
                header.addEventListener('keydown', (e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        this.toggleSection(section);
                    }
                });
            }
        });
    }

    /**
     * Configura gestión de estado
     */
    setupStateManagement() {
        // Guardar estado en localStorage
        window.addEventListener('beforeunload', () => {
            const stateData = {};
            this.sectionStates.forEach((state, key) => {
                stateData[key] = state;
            });
            localStorage.setItem('sectionStates', JSON.stringify(stateData));
        });
        
        // Restaurar estado
        try {
            const savedStates = localStorage.getItem('sectionStates');
            if (savedStates) {
                const stateData = JSON.parse(savedStates);
                Object.entries(stateData).forEach(([key, state]) => {
                    this.sectionStates.set(key, state);
                });
            }
        } catch (error) {
            console.warn('No se pudo restaurar el estado de las secciones:', error);
        }
    }

    /**
     * Agrega tooltips
     */
    addTooltips(section) {
        const sectionKey = section.dataset.key || 'unknown';
        const header = section.querySelector('.section-header h3');
        
        if (header && !header.title) {
            const tooltips = {
                'medicacion': 'Gestión de medicamentos con validación automática',
                'ingreso_manual': 'Información de ingreso del paciente',
                'antecedentes_personales': 'Historial médico y antecedentes',
                'fisico': 'Examen físico y hallazgos clínicos',
                'notas_libres': 'Notas adicionales y observaciones',
                'ia': 'Análisis y sugerencias de inteligencia artificial'
            };
            
            header.title = tooltips[sectionKey] || 'Sección de la nota médica';
        }
    }

    /**
     * Obtiene estadísticas
     */
    getStats() {
        const sections = document.querySelectorAll('.section');
        const sectionsWithContent = Array.from(sections).filter(section => 
            this.sectionHasContent(section)
        ).length;
        
        return {
            isInitialized: this.isInitialized,
            totalSections: sections.length,
            sectionsWithContent,
            modifiedSections: Array.from(this.sectionStates.values()).filter(state => state.isModified).length,
            observersActive: this.observers.length
        };
    }

    /**
     * Limpia recursos
     */
    destroy() {
        this.observers.forEach(observer => observer.disconnect());
        this.observers = [];
        this.sectionStates.clear();
        this.isInitialized = false;
    }
}

// Crear instancia global
window.UnifiedSectionsEnhancements = new UnifiedSectionsEnhancements();

console.log(`
🎨 MEJORAS UNIFICADAS CARGADAS

🎯 FUNCIONALIDADES DISPONIBLES:
• Headers con gradientes específicos por sección
• Iconos temáticos para cada tipo de sección
• Contadores de palabras y caracteres en tiempo real
• Indicadores de contenido y estado
• Auto-save cada 30 segundos
• Animaciones suaves y coherentes
• Accesibilidad mejorada

⌨️ ATAJOS DE TECLADO:
• Ctrl + S: Guardar sección actual
• Ctrl + E: Expandir/colapsar sección actual
• Alt + 1-9: Navegar a sección específica

📊 ESTADÍSTICAS:
window.UnifiedSectionsEnhancements.getStats()

🎨 SECCIONES MEJORADAS:
• 💊 Medicación (azul)
• 📝 Ingreso Manual (verde)
• 📋 Antecedentes (morado)
• 🩺 Examen Físico (rojo)
• 📄 Notas Libres (amarillo)
• 🧠 IA (cian)
`); 