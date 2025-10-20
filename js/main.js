// js/main.js: Lógica principal y orquestación de scripts con seguridad integrada
import { initMenu } from './menu.js';
import { initTestimonialSlider } from './slider.js';
import { initLightbox } from './lightbox.js';
import { initContactForm } from './form.js';
import { initReveal } from './reveal.js';
import { initHeroCarousel } from './hero-carousel.js';
import { loadTestimonials } from './testimonial-loader.js';
import { loadGallery } from './gallery.js';
import { initLocations } from './locations.js';
import { initPricingCarousel } from './pricing-carousel.js';
import { validateOrigin, sanitizeText } from './security.js';

async function includeHTML(elementId, filePath) {
    const element = document.getElementById(elementId);
    if (element) {
        try {
            const response = await fetch(filePath);
            if (response.ok) {
                element.innerHTML = await response.text();
            } else {
                console.error(`Failed to load ${filePath}: ${response.statusText}`);
            }
        } catch (error) {
            console.error(`Error fetching ${filePath}:`, error);
        }
    }
}

// =========================================
// BLOQUE: Orquestador principal del sitio con validaciones de seguridad
// Explicación: Carga componentes HTML y luego inicializa todos los módulos con verificaciones de seguridad.
// =========================================
document.addEventListener('DOMContentLoaded', async () => {
    // Verificación de seguridad inicial
    if (!validateOrigin()) {
        console.error('Origen no válido detectado');
        return;
    }
    // 1. Cargar componentes HTML reutilizables
    await Promise.all([
        includeHTML('topbar', 'topbar.html'),
        includeHTML('header', 'header.html'),
        includeHTML('redes-sociales', 'redes_sociales.html'),
        includeHTML('contactos', 'contactos.html'),
        includeHTML('contacto-extra', 'contacto_extra.html'),
        includeHTML('footer', 'footer.html')
    ]);

    // 2. Inicializar todos los módulos después de que el HTML esté en su lugar.
    initMenu();
    initContactForm();
    initLightbox();
    initReveal();
    initHeroCarousel();
    initLocations(); // Inicializar sistema de ubicaciones

    // 3. Lógica específica como el botón de "volver arriba"
    const scrollBtn = document.getElementById('scrollToTop');
    if (scrollBtn) {
        window.addEventListener('scroll', () => {
            scrollBtn.classList.toggle('show', window.scrollY > 300);
        });
        scrollBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }

    // 4. Carga de contenido dinámico (si los contenedores existen)
    if (document.getElementById('testimonial-slides-front')) {
        await loadTestimonials('testimonial-slides-front');
        initTestimonialSlider();
    }
    if (document.getElementById('gallery-list-front')) {
        loadGallery('gallery-list-front');
    }
    if (document.getElementById('gallery-grid')) {
        loadGallery('gallery-grid');
    }

    // Inicializar carrusel de planes solo si el contenedor existe
    if (document.querySelector('.pricing-slider-container')) {
        initPricingCarousel();
    }

    // Puedes añadir aquí la carga de otros contenidos dinámicos como blog, etc.
});
