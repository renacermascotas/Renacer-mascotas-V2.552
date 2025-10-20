// =========================================
// BLOQUE: Inicialización y validación segura de formulario de contacto
// Explicación: Este bloque inicializa el formulario de contacto con validaciones de seguridad robustas, sanitización de datos y prevención de spam.
// =========================================
import { sanitizeText, validateEmail, validatePhone, validateTextLength, rateLimiter, validateOrigin } from './security.js';

export function initContactForm() {
    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
        contactForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            // Verificar origen para prevenir CSRF
            if (!validateOrigin()) {
                showFormError("Error de seguridad detectado.");
                return;
            }
            
            // Rate limiting para prevenir spam
            const userIP = await getUserIP();
            if (!rateLimiter.canMakeRequest(userIP)) {
                showFormError("Demasiados mensajes enviados. Espera un momento antes de enviar otro.");
                return;
            }
            
            // Obtener y sanitizar valores
            const nombreRaw = contactForm.querySelector('input[name="nombre"]')?.value || '';
            const emailRaw = contactForm.querySelector('input[name="email"]')?.value || '';
            const mensajeRaw = contactForm.querySelector('textarea[name="mensaje"]')?.value || '';
            const asuntoRaw = contactForm.querySelector('input[name="asunto"]')?.value || '';
            const telefonoRaw = contactForm.querySelector('input[name="telefono"]')?.value || '';
            
            // Sanitizar entradas
            const nombre = sanitizeText(nombreRaw.trim());
            const email = emailRaw.trim().toLowerCase();
            const mensaje = sanitizeText(mensajeRaw.trim());
            const asunto = sanitizeText(asuntoRaw.trim());
            const telefono = telefonoRaw.trim();
            
            // Validaciones de seguridad
            if (!validateRequiredFields(nombre, email, mensaje)) {
                return;
            }
            
            if (!validateEmail(email)) {
                showFormError("Por favor ingresa un correo válido.");
                return;
            }
            
            if (!validateTextLength(nombre, 2, 50)) {
                showFormError("El nombre debe tener entre 2 y 50 caracteres.");
                return;
            }
            
            if (!validateTextLength(mensaje, 10, 1000)) {
                showFormError("El mensaje debe tener entre 10 y 1000 caracteres.");
                return;
            }
            
            if (telefono && !validatePhone(telefono)) {
                showFormError("Por favor ingresa un teléfono válido (formato colombiano).");
                return;
            }
            
            if (asunto && !validateTextLength(asunto, 0, 100)) {
                showFormError("El asunto no puede exceder 100 caracteres.");
                return;
            }
            
            // Detectar contenido sospechoso
            if (containsSuspiciousContent(mensaje) || containsSuspiciousContent(nombre)) {
                showFormError("Contenido no permitido detectado.");
                return;
            }
            
            // Construir mensaje para WhatsApp
            let fullMessage = `Hola, soy ${nombre} (${email}).\n`;
            if (telefono) fullMessage += `Mi teléfono es: ${telefono}.\n`;
            if (asunto) fullMessage += `Asunto: ${asunto}.\n\n`;
            fullMessage += mensaje;
            
            // Limitar longitud total del mensaje
            if (fullMessage.length > 2000) {
                showFormError("El mensaje es demasiado largo. Por favor, hazlo más conciso.");
                return;
            }
            
            const phoneNumber = "573207053536";
            const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(fullMessage)}`;
            
            // Mostrar confirmación antes de redirigir
            if (confirm("¿Deseas enviar este mensaje por WhatsApp?")) {
                window.open(url, "_blank");
                showFormSuccess("Mensaje preparado. Se abrirá WhatsApp en una nueva ventana.");
                contactForm.reset();
            }
        });
        
        // Agregar validación en tiempo real
        addRealTimeValidation(contactForm);
    }
}

function validateRequiredFields(nombre, email, mensaje) {
    const missingFields = [];
    if (!nombre) missingFields.push("nombre");
    if (!email) missingFields.push("correo");
    if (!mensaje) missingFields.push("mensaje");
    
    if (missingFields.length > 0) {
        showFormError(`Por favor completa los campos obligatorios: ${missingFields.join(", ")}.`);
        return false;
    }
    return true;
}

function containsSuspiciousContent(text) {
    const suspiciousPatterns = [
        /<script/i,
        /javascript:/i,
        /on\w+\s*=/i,
        /data:text\/html/i,
        /<iframe/i,
        /eval\s*\(/i,
        /document\.cookie/i,
        /window\.location/i,
        /(union\s+select|drop\s+table|insert\s+into)/i
    ];
    
    return suspiciousPatterns.some(pattern => pattern.test(text));
}

function showFormError(message) {
    const errorDiv = getOrCreateMessageDiv('error');
    errorDiv.textContent = message;
    errorDiv.style.display = 'block';
    setTimeout(() => errorDiv.style.display = 'none', 5000);
}

function showFormSuccess(message) {
    const successDiv = getOrCreateMessageDiv('success');
    successDiv.textContent = message;
    successDiv.style.display = 'block';
    setTimeout(() => successDiv.style.display = 'none', 5000);
}

function getOrCreateMessageDiv(type) {
    let div = document.getElementById(`form-message-${type}`);
    if (!div) {
        div = document.createElement('div');
        div.id = `form-message-${type}`;
        div.className = `form-message form-message-${type}`;
        div.style.cssText = `
            display: none;
            padding: 10px;
            margin: 10px 0;
            border-radius: 4px;
            font-weight: bold;
            ${type === 'error' ? 'background-color: #ffebee; color: #c62828; border: 1px solid #ef9a9a;' : 'background-color: #e8f5e8; color: #2e7d32; border: 1px solid #a5d6a7;'}
        `;
        
        const form = document.getElementById("contactForm");
        if (form) {
            form.appendChild(div);
        }
    }
    return div;
}

function addRealTimeValidation(form) {
    const emailInput = form.querySelector('input[name="email"]');
    const nombreInput = form.querySelector('input[name="nombre"]');
    const telefonoInput = form.querySelector('input[name="telefono"]');
    
    if (emailInput) {
        emailInput.addEventListener('blur', () => {
            const email = emailInput.value.trim();
            if (email && !validateEmail(email)) {
                emailInput.style.borderColor = '#c62828';
                emailInput.title = 'Formato de email inválido';
            } else {
                emailInput.style.borderColor = '';
                emailInput.title = '';
            }
        });
    }
    
    if (nombreInput) {
        nombreInput.addEventListener('input', () => {
            const nombre = nombreInput.value;
            if (nombre.length > 50) {
                nombreInput.value = nombre.substring(0, 50);
            }
        });
    }
    
    if (telefonoInput) {
        telefonoInput.addEventListener('blur', () => {
            const telefono = telefonoInput.value.trim();
            if (telefono && !validatePhone(telefono)) {
                telefonoInput.style.borderColor = '#c62828';
                telefonoInput.title = 'Formato de teléfono inválido';
            } else {
                telefonoInput.style.borderColor = '';
                telefonoInput.title = '';
            }
        });
    }
}

async function getUserIP() {
    try {
        // Usar una API pública para obtener IP (para rate limiting)
        const response = await fetch('https://api.ipify.org?format=json');
        const data = await response.json();
        return data.ip || 'unknown';
    } catch (error) {
        return 'unknown';
    }
}
