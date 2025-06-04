/**
 * UI Enhancements - Funcionalidades avanzadas de interfaz
 * Suite Neurología v2.1.0 - Paso 8: Mejora de UI y UX
 */

class UIEnhancements {
    constructor() {
        this.notifications = [];
        this.init();
    }

    /**
     * Función de compatibilidad para closest()
     */
    getClosest(element, selector) {
        if (!element) return null;
        
        // Si el navegador soporta closest, usarlo
        if (element.closest) {
            return element.closest(selector);
        }
        
        // Fallback para navegadores que no soportan closest
        let current = element;
        while (current && current !== document) {
            if (current.matches && current.matches(selector)) {
                return current;
            }
            current = current.parentElement;
        }
        return null;
    }

    init() {
        this.setupScrollAnimations();
        this.setupRippleEffects();
        this.setupTooltips();
        this.setupNotificationSystem();
        this.setupProgressIndicators();
        this.setupMicroInteractions();
        this.setupKeyboardShortcuts();
        console.log('✨ UI Enhancements inicializadas');
    }

    /**
     * Sistema de notificaciones modernas
     */
    setupNotificationSystem() {
        window.showNotification = (message, type = 'info', duration = 5000) => {
            const notification = document.createElement('div');
            notification.className = `notification notification-${type} slide-in`;
            notification.innerHTML = `
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="font-size: 1.2em;">${this.getNotificationIcon(type)}</span>
                    <span style="flex: 1;">${message}</span>
                    <button onclick="this.parentElement.parentElement.remove()" 
                            style="background: none; border: none; color: inherit; cursor: pointer; font-size: 1.2em;">×</button>
                </div>
            `;

            document.body.appendChild(notification);
            this.notifications.push(notification);

            // Auto-remove después del tiempo especificado
            setTimeout(() => {
                if (notification.parentElement) {
                    notification.style.animation = 'slideOutRight 0.3s ease-out forwards';
                    setTimeout(() => notification.remove(), 300);
                }
            }, duration);

            // Limitar número de notificaciones
            if (this.notifications.length > 3) {
                const oldest = this.notifications.shift();
                if (oldest.parentElement) oldest.remove();
            }
        };
    }

    getNotificationIcon(type) {
        const icons = {
            success: '✅',
            error: '❌',
            warning: '⚠️',
            info: 'ℹ️'
        };
        return icons[type] || icons.info;
    }

    /**
     * Animaciones de scroll
     */
    setupScrollAnimations() {
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                }
            });
        }, observerOptions);

        // Observar elementos con clases de animación
        const animatedElements = document.querySelectorAll('.fade-in-up, .fade-in-left, .fade-in-right');
        animatedElements.forEach(el => observer.observe(el));

        // Re-observar elementos dinámicos
        this.observeNewElements = () => {
            const newElements = document.querySelectorAll('.fade-in-up:not(.visible), .fade-in-left:not(.visible), .fade-in-right:not(.visible)');
            newElements.forEach(el => observer.observe(el));
        };
    }

    /**
     * Efectos ripple para botones
     */
    setupRippleEffects() {
        document.addEventListener('click', (e) => {
            const rippleElement = this.getClosest(e.target, '.ripple');
            if (rippleElement) {
                const rect = rippleElement.getBoundingClientRect();
                const size = Math.max(rect.width, rect.height);
                const x = e.clientX - rect.left - size / 2;
                const y = e.clientY - rect.top - size / 2;

                const ripple = document.createElement('span');
                ripple.style.cssText = `
                    position: absolute;
                    width: ${size}px;
                    height: ${size}px;
                    left: ${x}px;
                    top: ${y}px;
                    background: rgba(255, 255, 255, 0.5);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple-animation 0.6s linear;
                    pointer-events: none;
                `;

                rippleElement.appendChild(ripple);
                setTimeout(() => ripple.remove(), 600);
            }
        });

        // Agregar estilos de animación ripple
        if (!document.getElementById('ripple-styles')) {
            const style = document.createElement('style');
            style.id = 'ripple-styles';
            style.textContent = `
                @keyframes ripple-animation {
                    to {
                        transform: scale(4);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    /**
     * Sistema de tooltips mejorado
     */
    setupTooltips() {
        let currentTooltip = null;

        document.addEventListener('mouseenter', (e) => {
            const tooltipElement = this.getClosest(e.target, '.tooltip');
            if (tooltipElement) {
                const tooltipText = tooltipElement.querySelector('.tooltip-text');
                if (tooltipText) {
                    tooltipText.style.visibility = 'visible';
                    tooltipText.style.opacity = '1';
                    currentTooltip = tooltipText;
                }
            }
        }, true);

        document.addEventListener('mouseleave', (e) => {
            const tooltipElement = this.getClosest(e.target, '.tooltip');
            if (tooltipElement) {
                const tooltipText = tooltipElement.querySelector('.tooltip-text');
                if (tooltipText) {
                    tooltipText.style.visibility = 'hidden';
                    tooltipText.style.opacity = '0';
                    currentTooltip = null;
                }
            }
        }, true);
    }

    /**
     * Indicadores de progreso circulares
     */
    setupProgressIndicators() {
        window.createProgressRing = (percentage, container) => {
            const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svg.classList.add('progress-ring');
            svg.innerHTML = `
                <circle class="progress-ring-circle" 
                        cx="30" cy="30" r="25" 
                        stroke-dasharray="157" 
                        stroke-dashoffset="${157 - (157 * percentage) / 100}">
                </circle>
            `;
            
            if (container) {
                container.appendChild(svg);
            }
            return svg;
        };
    }

    /**
     * Micro-interacciones
     */
    setupMicroInteractions() {
        // Efecto de hover para cards
        document.addEventListener('mouseenter', (e) => {
            const cardElement = this.getClosest(e.target, '.card');
            if (cardElement) {
                cardElement.style.transform = 'translateY(-4px)';
            }
        }, true);

        document.addEventListener('mouseleave', (e) => {
            const cardElement = this.getClosest(e.target, '.card');
            if (cardElement) {
                cardElement.style.transform = 'translateY(0)';
            }
        }, true);

        // Efecto de focus para inputs
        document.addEventListener('focus', (e) => {
            if (e.target.matches && e.target.matches('input, textarea, select')) {
                e.target.parentElement?.classList.add('focused');
            }
        }, true);

        document.addEventListener('blur', (e) => {
            if (e.target.matches && e.target.matches('input, textarea, select')) {
                e.target.parentElement?.classList.remove('focused');
            }
        }, true);
    }

    /**
     * Atajos de teclado mejorados
     */
    setupKeyboardShortcuts() {
        document.addEventListener('keydown', (e) => {
            // Ctrl + Shift + N = Nueva notificación de prueba
            if (e.ctrlKey && e.shiftKey && e.key === 'N') {
                e.preventDefault();
                window.showNotification('¡Notificación de prueba!', 'success');
            }

            // Ctrl + Shift + T = Toggle tema (preparado para futuro)
            if (e.ctrlKey && e.shiftKey && e.key === 'T') {
                e.preventDefault();
                this.toggleTheme();
            }

            // Escape = Cerrar notificaciones
            if (e.key === 'Escape') {
                this.closeAllNotifications();
            }
        });
    }

    /**
     * Toggle de tema (preparado para modo oscuro)
     */
    toggleTheme() {
        document.body.classList.toggle('dark-theme');
        const isDark = document.body.classList.contains('dark-theme');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        window.showNotification(
            `Tema ${isDark ? 'oscuro' : 'claro'} activado`, 
            'info'
        );
    }

    /**
     * Cerrar todas las notificaciones
     */
    closeAllNotifications() {
        this.notifications.forEach(notification => {
            if (notification.parentElement) {
                notification.remove();
            }
        });
        this.notifications = [];
    }

    /**
     * Crear skeleton loader
     */
    static createSkeleton(lines = 3) {
        const skeleton = document.createElement('div');
        skeleton.className = 'skeleton-container';
        
        for (let i = 0; i < lines; i++) {
            const line = document.createElement('div');
            line.className = 'skeleton skeleton-text';
            skeleton.appendChild(line);
        }
        
        return skeleton;
    }

    /**
     * Mostrar loading en elemento
     */
    static showLoading(element, text = 'Cargando...') {
        element.classList.add('loading');
        element.setAttribute('data-original-text', element.textContent);
        element.textContent = text;
    }

    /**
     * Ocultar loading de elemento
     */
    static hideLoading(element) {
        element.classList.remove('loading');
        const originalText = element.getAttribute('data-original-text');
        if (originalText) {
            element.textContent = originalText;
            element.removeAttribute('data-original-text');
        }
    }

    /**
     * Crear badge
     */
    static createBadge(text, type = 'primary') {
        const badge = document.createElement('span');
        badge.className = `badge badge-${type}`;
        badge.textContent = text;
        return badge;
    }

    /**
     * Animar entrada de elemento
     */
    static animateIn(element, animation = 'fadeInUp') {
        element.style.opacity = '0';
        element.style.transform = 'translateY(20px)';
        
        requestAnimationFrame(() => {
            element.style.transition = 'all 0.6s ease-out';
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        });
    }

    /**
     * Smooth scroll a elemento
     */
    static scrollToElement(element, offset = 0) {
        const elementPosition = element.offsetTop - offset;
        window.scrollTo({
            top: elementPosition,
            behavior: 'smooth'
        });
    }
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.uiEnhancements = new UIEnhancements();
    
    // Mostrar notificación de bienvenida
    setTimeout(() => {
        window.showNotification(
            '✨ Suite Neurología v2.1.0 - Diseño Moderno Cargado', 
            'success', 
            3000
        );
    }, 1000);
});

// Exportar para uso global
window.UIEnhancements = UIEnhancements; 