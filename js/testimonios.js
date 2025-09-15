// testimonios.js: Carga y muestra testimonios dinámicamente en testimonios.html
import { loadTestimonials } from './testimonial-loader.js';

// =========================================
// BLOQUE: Carga dinámica de testimonios
// Explicación: Este bloque utiliza una función reutilizable para obtener los testimonios del backend y mostrarlos en la página de testimonios.
// =========================================
document.addEventListener('DOMContentLoaded', function () {
    // Para que este import funcione, asegúrate de que el script se carga como módulo en testimonios.html:
    // <script type="module" src="js/testimonios.js" defer></script>
    loadTestimonials('testimonial-slides-page');
});
