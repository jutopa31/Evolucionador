// Sistema básico de UI para errores y mensajes
window.ErrorUI = {
    showError: function(message, duration = 5000) {
        console.error('ErrorUI:', message);
        this.showMessage(message, 'error', duration);
    },
    
    showWarning: function(message, duration = 5000) {
        console.warn('ErrorUI:', message);
        this.showMessage(message, 'warning', duration);
    },
    
    showInfo: function(message, duration = 3000) {
        console.info('ErrorUI:', message);
        this.showMessage(message, 'info', duration);
    },
    
    showSuccess: function(message, duration = 3000) {
        console.log('ErrorUI Success:', message);
        this.showMessage(message, 'success', duration);
    },
    
    showMessage: function(message, type = 'info', duration = 3000) {
        // Crear elemento de mensaje
        const messageEl = document.createElement('div');
        messageEl.className = `error-ui-message error-ui-${type}`;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 4px;
            color: white;
            font-weight: 500;
            z-index: 10000;
            max-width: 400px;
            word-wrap: break-word;
        `;
        
        // Colores según el tipo
        switch(type) {
            case 'error':
                messageEl.style.backgroundColor = '#f44336';
                break;
            case 'warning':
                messageEl.style.backgroundColor = '#ff9800';
                break;
            case 'success':
                messageEl.style.backgroundColor = '#4caf50';
                break;
            default:
                messageEl.style.backgroundColor = '#2196f3';
        }
        
        messageEl.innerHTML = message;
        document.body.appendChild(messageEl);
        
        // Auto-remover después del tiempo especificado
        if (duration > 0) {
            setTimeout(() => {
                this.removeMessage(messageEl);
            }, duration);
        }
        
        return messageEl;
    },
    
    removeMessage: function(messageEl) {
        if (messageEl && messageEl.parentNode) {
            messageEl.parentNode.removeChild(messageEl);
        }
    }
};

console.log('ErrorUI loaded'); 