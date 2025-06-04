/**
 * 🔐 Auth Manager
 * Gestión de autenticación y autorización con JWT.
 */
import jwt from 'jsonwebtoken';

class AuthManager {
    constructor(secret = 'default_jwt_secret') {
        this.secret = secret;
        this.tokenExpiry = '1h';
    }

    // Genera un JWT con payload (e.g., { userId, roles })
    generateToken(payload) {
        return jwt.sign(payload, this.secret, { expiresIn: this.tokenExpiry });
    }

    // Verifica y decodifica un token JWT
    verifyToken(token) {
        try {
            return jwt.verify(token, this.secret);
        } catch (err) {
            throw new Error('Token inválido o expirado');
        }
    }

    // Middleware para autenticar peticiones fetch (cliente)
    async authenticateRequest(request) {
        const authHeader = request.headers.get('Authorization') || '';
        const token = authHeader.replace('Bearer ', '');
        return this.verifyToken(token);
    }

    // Verifica si el payload decodificado contiene el rol requerido
    authorize(decoded, requiredRole) {
        return decoded.roles && decoded.roles.includes(requiredRole);
    }
}

const authManager = new AuthManager();
window.AuthManager = authManager;
export default authManager; 