// js/main.js: Lógica principal y orquestación de scripts
import { initMenu } from './menu.js';
import { initTestimonialSlider } from './slider.js';
import { initLightbox } from './lightbox.js';
import { initContactForm } from './form.js';
import { initReveal } from './reveal.js';
import { initHeroCarousel } from './hero-carousel.js';
import { loadTestimonials } from './testimonial-loader.js';
import { loadGallery } from './gallery.js';
import { includeHTML } from './include-html.js'; // <-- IMPORTANTE: Importamos el cargador de HTML

// =========================================
// BLOQUE: Orquestador principal del sitio
// Explicación: Este bloque se ejecuta cuando el DOM está listo. Carga componentes HTML
// y luego inicializa todos los módulos necesarios.
// =========================================
document.addEventListener('DOMContentLoaded', () => {
    // 1. Carga todos los componentes HTML reutilizables en paralelo para máxima eficiencia.
    Promise.all([
        includeHTML('topbar', 'topbar.html'),
        includeHTML('header', 'header.html'),
        includeHTML('redes-sociales', 'redes_sociales.html'),
        includeHTML('contactos', 'contactos.html'),
        includeHTML('contacto-extra', 'contacto_extra.html'),
        includeHTML('footer', 'footer.html')
    ]).then(() => {
        // 2. Una vez que los componentes están cargados, inicializa los scripts que dependen de ellos.
        // Esto asegura que los elementos (ej. el botón del menú) existan antes de asignarles eventos.
        initMenu();
        initContactForm(); // El formulario de contacto ahora está en un componente
    });

    // 3. Inicializa otros scripts que no dependen de los componentes cargados
    initLightbox();
    initReveal();
    initHeroCarousel();

    // 4. Carga contenido dinámico (testimonios, galería) si los contenedores existen en la página.
    if (document.getElementById('testimonial-slides-front')) {
        // Primero carga los testimonios, y LUEGO inicializa el slider.
        loadTestimonials('testimonial-slides-front').then(() => {
            initTestimonialSlider();
        });
    }
    if (document.getElementById('gallery-list-front')) {
        loadGallery('gallery-list-front');
    }

    // Botón para volver arriba (scroll-to-top)
    const scrollBtn = document.getElementById('scrollToTop');
    if (scrollBtn) {
        window.addEventListener('scroll', () => {
            scrollBtn.classList.toggle('show', window.scrollY > 300);
        });
        scrollBtn.addEventListener('click', () => {
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
});
