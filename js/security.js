// js/security.js - Funciones de seguridad para validación y sanitización

/**
 * Sanitiza texto para prevenir ataques XSS
 * @param {string} text - Texto a sanitizar
 * @returns {string} - Texto sanitizado
 */
export function sanitizeText(text) {
    if (typeof text !== 'string') return '';
    
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/**
 * Sanitiza HTML permitiendo solo etiquetas seguras
 * @param {string} html - HTML a sanitizar
 * @returns {string} - HTML sanitizado
 */
export function sanitizeHTML(html) {
    if (typeof html !== 'string') return '';
    
    const allowedTags = ['b', 'i', 'em', 'strong', 'u', 'br', 'p'];
    const div = document.createElement('div');
    div.innerHTML = html;
    
    // Eliminar scripts y elementos peligrosos
    const scripts = div.querySelectorAll('script, iframe, object, embed, link[rel="stylesheet"], style');
    scripts.forEach(script => script.remove());
    
    // Eliminar atributos peligrosos
    const allElements = div.querySelectorAll('*');
    allElements.forEach(element => {
        // Eliminar elementos no permitidos
        if (!allowedTags.includes(element.tagName.toLowerCase())) {
            element.outerHTML = element.innerHTML;
            return;
        }
        
        // Eliminar atributos peligrosos
        const attributes = Array.from(element.attributes);
        attributes.forEach(attr => {
            if (attr.name.startsWith('on') || attr.name === 'href' || attr.name === 'src') {
                element.removeAttribute(attr.name);
            }
        });
    });
    
    return div.innerHTML;
}

/**
 * Valida email con regex seguro
 * @param {string} email - Email a validar
 * @returns {boolean} - True si es válido
 */
export function validateEmail(email) {
    if (typeof email !== 'string') return false;
    
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    return email.length <= 254 && emailRegex.test(email);
}

/**
 * Valida teléfono colombiano
 * @param {string} phone - Teléfono a validar
 * @returns {boolean} - True si es válido
 */
export function validatePhone(phone) {
    if (typeof phone !== 'string') return false;
    
    // Formato colombiano: +57 o 57 seguido de 10 dígitos, o directamente 10 dígitos
    const phoneRegex = /^(\+?57)?[3][0-9]{9}$|^[6][0-9]{7}$/;
    const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
    return phoneRegex.test(cleanPhone);
}

/**
 * Valida longitud y caracteres de texto
 * @param {string} text - Texto a validar
 * @param {number} minLength - Longitud mínima
 * @param {number} maxLength - Longitud máxima
 * @returns {boolean} - True si es válido
 */
export function validateTextLength(text, minLength = 1, maxLength = 1000) {
    if (typeof text !== 'string') return false;
    return text.length >= minLength && text.length <= maxLength;
}

/**
 * Previene ataques de CSRF verificando origen
 * @returns {boolean} - True si el origen es válido
 */
export function validateOrigin() {
    const allowedOrigins = [
        window.location.origin,
        'https://renacermascotas.com',
        'http://localhost:3000',
        'http://localhost:4000',
        'file://' // Para desarrollo local
    ];
    
    const origin = window.location.origin;
    // En desarrollo local, siempre permitir
    if (origin.startsWith('file://') || origin.includes('localhost') || origin.includes('127.0.0.1')) {
        return true;
    }
    
    return allowedOrigins.includes(origin);
}

/**
 * Rate limiting simple para prevenir spam
 */
class RateLimiter {
    constructor(maxRequests = 5, timeWindow = 60000) { // 5 requests per minute
        this.maxRequests = maxRequests;
        this.timeWindow = timeWindow;
        this.requests = new Map();
    }
    
    canMakeRequest(identifier = 'default') {
        const now = Date.now();
        const requestHistory = this.requests.get(identifier) || [];
        
        // Filtrar requests fuera de la ventana de tiempo
        const recentRequests = requestHistory.filter(time => now - time < this.timeWindow);
        
        if (recentRequests.length >= this.maxRequests) {
            return false;
        }
        
        // Agregar nueva request
        recentRequests.push(now);
        this.requests.set(identifier, recentRequests);
        
        return true;
    }
}

export const rateLimiter = new RateLimiter();

/**
 * Genera nonce para CSP inline scripts
 * @returns {string} - Nonce único
 */
export function generateNonce() {
    const array = new Uint8Array(16);
    crypto.getRandomValues(array);
    return btoa(String.fromCharCode.apply(null, array));
}

/**
 * Verifica integridad de archivos críticos
 * @param {string} url - URL del archivo
 * @param {string} expectedHash - Hash esperado
 * @returns {Promise<boolean>} - True si la integridad es correcta
 */
export async function verifyFileIntegrity(url, expectedHash) {
    try {
        const response = await fetch(url);
        const content = await response.text();
        const encoder = new TextEncoder();
        const data = encoder.encode(content);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        
        return hashHex === expectedHash;
    } catch (error) {
        console.error('Error verificando integridad:', error);
        return false;
    }
}