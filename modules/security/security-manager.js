/**
 * 🔒 Security Manager
 * Gestión de sanitización, cifrado y auditoría de seguridad.
 */
import DOMPurify from 'dompurify';

class SecurityManager {
    constructor(config = {}) {
        this.config = {
            encryptionKey: config.encryptionKey || 'default_encryption_key_32_bytes!',
            auditLogEnabled: config.auditLogEnabled ?? true,
            roles: config.roles || ['admin', 'doctor', 'nurse', 'viewer']
        };
        this.auditLog = [];
    }

    // Sanitiza HTML/JS para prevenir XSS
    sanitize(input) {
        return DOMPurify.sanitize(input);
    }

    // Cifra texto usando AES-GCM
    async encrypt(plaintext) {
        const encoder = new TextEncoder();
        const data = encoder.encode(plaintext);
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            encoder.encode(this.config.encryptionKey),
            'AES-GCM',
            false,
            ['encrypt']
        );
        const iv = crypto.getRandomValues(new Uint8Array(12));
        const encrypted = await crypto.subtle.encrypt(
            { name: 'AES-GCM', iv },
            keyMaterial,
            data
        );
        return { iv: Array.from(iv), data: Array.from(new Uint8Array(encrypted)) };
    }

    // Descifra datos cifrados con encrypt()
    async decrypt(encryptedObj) {
        const decoder = new TextDecoder();
        const { iv, data } = encryptedObj;
        const keyMaterial = await crypto.subtle.importKey(
            'raw',
            new TextEncoder().encode(this.config.encryptionKey),
            'AES-GCM',
            false,
            ['decrypt']
        );
        const decrypted = await crypto.subtle.decrypt(
            { name: 'AES-GCM', iv: new Uint8Array(iv) },
            keyMaterial,
            new Uint8Array(data)
        );
        return decoder.decode(decrypted);
    }

    // Verifica si el usuario tiene el rol requerido
    hasRole(userRoles, requiredRole) {
        return Array.isArray(userRoles) && userRoles.includes(requiredRole);
    }

    // Registra una acción en el log de auditoría
    logAction(userId, action, context = {}) {
        if (!this.config.auditLogEnabled) return;
        const entry = {
            timestamp: new Date().toISOString(),
            userId,
            action,
            context
        };
        this.auditLog.push(entry);
        if (this.auditLog.length > 100) this.auditLog.shift();
        console.log('🔒 AuditLog:', entry);
    }

    // Obtiene el log de auditoría
    getAuditLogs() {
        return this.auditLog;
    }
}

const securityManager = new SecurityManager();
window.SecurityManager = securityManager;
export default securityManager; 