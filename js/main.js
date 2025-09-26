// js/main.js: Lógica principal y orquestación de scripts
import { initMenu } from './menu.js';
import { initTestimonialSlider } from './slider.js'; // Asumiendo que existe o se creará
import { initLightbox } from './lightbox.js'; // Asumiendo que existe o se creará
import { initContactForm } from './form.js'; // Asumiendo que existe o se creará
import { initReveal } from './reveal.js'; // Asumiendo que existe o se creará
import { initHeroCarousel } from './hero-carousel.js'; // Asumiendo que existe o se creará
import { loadTestimonials } from './testimonial-loader.js'; // Asumiendo que existe o se creará
import { loadGallery } from './gallery.js'; // Asumiendo que existe o se creará

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
// BLOQUE: Orquestador principal del sitio
// Explicación: Carga componentes HTML y luego inicializa todos los módulos necesarios en todas las páginas.
// =========================================
document.addEventListener('DOMContentLoaded', async () => {
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

    // Puedes añadir aquí la carga de otros contenidos dinámicos como blog, etc.
});
