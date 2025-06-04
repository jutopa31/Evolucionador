/**
 * 🛡️ Header Manager
 * Inyección de meta tags de seguridad al head.
 */
class HeaderManager {
    injectSecurityHeaders() {
        // Content Security Policy (más permisivo para desarrollo)
        const metaCSP = document.createElement('meta');
        metaCSP.httpEquiv = 'Content-Security-Policy';
        metaCSP.content = "default-src 'self'; script-src 'self' 'unsafe-inline' https://cdnjs.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self';";
        document.head.appendChild(metaCSP);

        // X-Content-Type-Options
        const metaXContentType = document.createElement('meta');
        metaXContentType.httpEquiv = 'X-Content-Type-Options';
        metaXContentType.content = 'nosniff';
        document.head.appendChild(metaXContentType);

        // Referrer Policy
        const metaReferrer = document.createElement('meta');
        metaReferrer.name = 'referrer';
        metaReferrer.content = 'no-referrer';
        document.head.appendChild(metaReferrer);
    }
}

const headerManager = new HeaderManager();
window.HeaderManager = headerManager;
document.addEventListener('DOMContentLoaded', () => headerManager.injectSecurityHeaders());
export default headerManager; 