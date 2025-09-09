// =========================================
// BLOQUE: Inicialización y validación de formulario de contacto
// Explicación: Este bloque inicializa el formulario de contacto, valida los campos obligatorios y redirige el mensaje a WhatsApp con los datos del usuario.
// =========================================
export function initContactForm() {
    const contactForm = document.getElementById("contactForm");
    if (contactForm) {
        contactForm.addEventListener("submit", e => {
            e.preventDefault();
            const nombre = contactForm.querySelector('input[name="nombre"]').value.trim();
            const email = contactForm.querySelector('input[name="email"]').value.trim();
            const mensaje = contactForm.querySelector('textarea[name="mensaje"]').value.trim();
            const asuntoInput = contactForm.querySelector('input[name="asunto"]');
            const telefonoInput = contactForm.querySelector('input[name="telefono"]');
            const asunto = asuntoInput ? asuntoInput.value.trim() : "";
            const telefono = telefonoInput ? telefonoInput.value.trim() : "";
            if (!nombre || !email || !mensaje) {
                alert("Por favor completa los campos obligatorios: nombre, correo y mensaje.");
                return;
            }
            // Validación básica de email
            if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
                alert("Por favor ingresa un correo válido.");
                return;
            }
            let fullMessage = `Hola, soy ${nombre} (${email}).\n`;
            if (telefono) fullMessage += `Mi teléfono es: ${telefono}.\n`;
            if (asunto) fullMessage += `Asunto: ${asunto}.\n\n`;
            fullMessage += mensaje;
            const phoneNumber = "573207053536";
            const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(fullMessage)}`;
            window.open(url, "_blank");
        });
    }
}
