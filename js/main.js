// =========================================
// BLOQUE: Inicialización global de scripts
// Explicación: Archivo principal que inicializa todos los módulos JS de la web (menú, slider, lightbox, formulario, animaciones, hero carousel, etc) y gestiona interacciones globales.
// =========================================

// --- Mostrar información de plan al hacer clic en la etiqueta ---
document.querySelectorAll('.plan-label').forEach(btn => {
    btn.addEventListener('click', () => {
        document.querySelectorAll('.plan-info-box').forEach(box => box.classList.remove('active'));
        const plan = btn.getAttribute('data-plan');
        const infoBox = document.getElementById('info-' + plan);
        if (infoBox) infoBox.classList.add('active');
    });
});

// --- Botón para volver arriba (scroll-to-top) ---
const scrollBtn = document.getElementById('scrollToTop');
window.addEventListener('scroll', () => {
    if (window.scrollY > 300) {
        scrollBtn.classList.add('show');
    } else {
        scrollBtn.classList.remove('show');
    }
});
scrollBtn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
});

// --- Importación de módulos de funcionalidad (menu, slider, lightbox, etc) ---
import { initMenu } from './menu.js';
import { initTestimonialSlider } from './slider.js';
import { initLightbox } from './lightbox.js';
import { initContactForm } from './form.js';
import { initReveal } from './reveal.js';
import { initHeroCarousel } from './hero-carousel.js';
import { loadTestimonials } from './testimonial-loader.js';

// --- Inicialización de módulos al cargar el DOM ---
document.addEventListener('DOMContentLoaded', () => {
    // initLoader(); // loader eliminado
    initMenu();
    initLightbox();
    initContactForm();
    initReveal();
    initHeroCarousel();

    // Cargar testimonios en el index y luego inicializar el slider
    if (document.getElementById('testimonial-slides-front')) {
        loadTestimonials('testimonial-slides-front').then(initTestimonialSlider);
    }
});
